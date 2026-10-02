<?php

namespace App\Http\Controllers;

use App\Models\AttributionLivraison;
use App\Models\Commande;
use App\Models\HistoriqueCommande;
use App\Models\Livraison;
use App\Models\Notification;
use App\Models\Zone;
use App\Models\Restaurant;
use App\Models\StatutCommande;
use App\Models\User;
use App\Services\LivraisonService;
use App\Services\NotificationService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class AdministrationController extends Controller
{
    public function tableauDeBord(): Response
    {
        $debutPeriode = now()->startOfDay()->subDays(6);
        $finPeriode = now()->endOfDay();

        $recuesParJour = Commande::query()
            ->whereBetween('date_commande', [$debutPeriode, $finPeriode])
            ->selectRaw('DATE(date_commande) as jour, COUNT(*) as total')
            ->groupBy('jour')
            ->pluck('total', 'jour');

        $livreesParJour = Commande::query()
            ->whereBetween('date_commande', [$debutPeriode, $finPeriode])
            ->whereHas('statutCommande', fn ($q) => $q->where('code', 'LIVREE'))
            ->selectRaw('DATE(date_commande) as jour, COUNT(*) as total')
            ->groupBy('jour')
            ->pluck('total', 'jour');

        $serieActivite = collect(range(0, 6))->map(function (int $offset) use ($debutPeriode, $recuesParJour, $livreesParJour) {
            $date = $debutPeriode->copy()->addDays($offset);
            $jour = $date->toDateString();

            return [
                'date' => $jour,
                'label' => $date->locale('fr')->isoFormat('dd'),
                'recues' => (int) ($recuesParJour[$jour] ?? 0),
                'livrees' => (int) ($livreesParJour[$jour] ?? 0),
            ];
        })->values();

        return Inertia::render('Admin/TableauDeBord', [
            'statistiques' => [
                'commandes_actives' => Commande::query()->whereHas('statutCommande', fn ($q) => $q->whereNotIn('code', ['LIVREE', 'ANNULEE']))->count(),
                'commandes_livrees' => Commande::query()->whereHas('statutCommande', fn ($q) => $q->where('code', 'LIVREE'))->count(),
                'livraisons_actives' => Livraison::query()
                    ->whereIn('statut', ['en_attente', 'attribuee', 'en_cours'])
                    ->whereHas('commande.statutCommande', fn ($q) => $q->whereNotIn('code', ['LIVREE', 'ANNULEE']))
                    ->count(),
                'livreurs_disponibles' => User::query()
                    ->where('role', 'livreur')
                    ->where('statut', 'actif')
                    ->whereHas('profilLivreur', fn ($q) => $q->where('disponibilite', 'disponible'))
                    ->count(),
                'restaurants_actifs' => Restaurant::query()->where('statut', 'actif')->count(),
                'clients_actifs' => User::query()->where('role', 'client')->where('statut', 'actif')->count(),
            ],
            'serie_activite' => $serieActivite,
            'livraisons' => Livraison::query()
                ->with([
                    'commande.zone:id,nom',
                    'commande.statutCommande:id,code,libelle',
                    'attributions' => fn ($q) => $q->where('statut', 'active')->with('livreur:id,nom,prenom', 'livreur.profilLivreur:user_id,matricule'),
                ])
                ->whereIn('statut', ['en_attente', 'attribuee', 'en_cours'])
                ->whereHas('commande.statutCommande', fn ($q) => $q->whereNotIn('code', ['LIVREE', 'ANNULEE']))
                ->latest('id')
                ->limit(50)
                ->get()
                ->map(fn (Livraison $livraison) => [
                    'id' => $livraison->id,
                    'reference' => $livraison->commande?->reference,
                    'zone_id' => $livraison->zone_id,
                    'zone' => $livraison->commande?->zone?->nom,
                    'statut' => $livraison->statut,
                    'livreur' => $livraison->attributions->first()?->livreur
                        ? trim($livraison->attributions->first()->livreur->prenom . ' ' . $livraison->attributions->first()->livreur->nom)
                        : null,
                ])->values(),
            'commandes' => Commande::query()
                ->with([
                    'user:id,nom,prenom,telephone',
                    'restaurant:id,nom',
                    'zone:id,nom',
                    'statutCommande:id,code,libelle,ordre',
                ])
                ->whereHas('statutCommande', fn ($q) => $q->whereIn('code', ['EN_ATTENTE', 'CONFIRMEE', 'EN_PREPARATION']))
                ->latest('date_commande')
                ->limit(50)
                ->get()
                ->map(fn (Commande $commande) => [
                    'id' => $commande->id,
                    'reference' => $commande->reference,
                    'restaurant' => $commande->restaurant?->nom,
                    'client' => $commande->user ? trim($commande->user->prenom . ' ' . $commande->user->nom) : null,
                    'telephone' => $commande->user?->telephone,
                    'zone' => $commande->zone?->nom,
                    'statut' => $commande->statutCommande ? [
                        'code' => $commande->statutCommande->code,
                        'libelle' => $commande->statutCommande->libelle,
                    ] : null,
                    'montant_total' => (float) $commande->montant_total,
                    'date_commande' => $commande->date_commande?->format('d/m/Y H:i'),
                ])->values(),
            'livreurs' => User::query()
                ->where('role', 'livreur')
                ->where('statut', 'actif')
                ->with('profilLivreur.zone:id,nom')
                ->orderBy('id')
                ->get()
                ->map(fn (User $user) => [
                    'id' => $user->id,
                    'nom' => trim($user->prenom . ' ' . $user->nom),
                    'zone_id' => $user->profilLivreur?->zone_id,
                    'zone' => $user->profilLivreur?->zone?->nom,
                    'disponibilite' => $user->profilLivreur?->disponibilite,
                ])->values(),
        ]);
    }

    public function annulerCommande(Request $request, Commande $commande, NotificationService $notificationService): RedirectResponse
    {
        $donnees = $request->validate(['motif' => ['nullable', 'string', 'max:500']]);

        DB::transaction(function () use ($request, $commande, $donnees) {
            $commande = Commande::query()->whereKey($commande->id)->lockForUpdate()->with('statutCommande')->firstOrFail();
            abort_unless(in_array($commande->statutCommande?->code, ['EN_ATTENTE', 'CONFIRMEE', 'EN_PREPARATION'], true), 422, 'Cette commande ne peut plus être annulée.');
            $statut = StatutCommande::query()->where('code', 'ANNULEE')->firstOrFail();
            $commande->update(['statut_id' => $statut->id]);
            HistoriqueCommande::create([
                'commande_id' => $commande->id,
                'statut_id' => $statut->id,
                'user_id' => $request->user()->id,
                'commentaire' => $donnees['motif'] ?? 'Commande annulée par l’administrateur.',
                'date_changement' => now(),
            ]);
        });

        $commande->load(['user', 'restaurant.user']);

        if ($commande->user) {
            $notificationService->sms(
                $commande->user,
                'Votre commande '.$commande->reference.' a été annulée par l’administration.',
                $commande->id,
                null,
                'commande_annulee'
            );
        }

        if ($commande->restaurant?->user) {
            $notificationService->sms(
                $commande->restaurant->user,
                'La commande '.$commande->reference.' a été annulée par l’administration.',
                $commande->id,
                null,
                'commande_annulee'
            );
        }

        return back()->with('success', 'La commande a été annulée.');
    }

    public function reattribuerLivraison(Request $request, Livraison $livraison, LivraisonService $livraisonService, NotificationService $notificationService): RedirectResponse
    {
        $donnees = $request->validate([
            'livreur_id' => ['required', 'integer', 'exists:users,id'],
            'motif' => ['required', 'string', 'max:500'],
        ]);

        $livreur = User::query()
            ->whereKey($donnees['livreur_id'])
            ->where('role', 'livreur')
            ->where('statut', 'actif')
            ->with('profilLivreur')
            ->firstOrFail();

        abort_unless($livreur->profilLivreur?->zone_id === $livraison->zone_id, 422, 'Le livreur doit appartenir à la zone de la livraison.');

        $livraisonService->reattribuer($livraison, $request->user()->id, $livreur->id, $donnees['motif']);
        $livraison->load('commande.user');
        $commande = $livraison->commande;
        $pin = \Illuminate\Support\Facades\Crypt::decryptString($commande->pin_livraison_chiffre);

        $notificationService->sms($livreur, 'Une livraison '.$commande->reference.' vous a été attribuée par l’administration.', $commande->id, $livraison->id, 'attribution');
        $notificationService->sms($commande->user, 'Votre code de livraison pour '.$commande->reference.' est '.$pin.'.', $commande->id, $livraison->id, 'pin_livraison');

        return back()->with('success', 'La livraison a été réattribuée.');
    }
 
    public function commandes(Request $request): Response
    {
        $recherche = trim((string) $request->query('recherche', ''));
        $commandes = Commande::query()->with(['user:id,nom,prenom,telephone,email', 'restaurant:id,nom', 'zone:id,nom', 'statutCommande:id,code,libelle'])
            ->when($recherche !== '', fn ($q) => $q->where(function ($query) use ($recherche) {
                $query->where('reference', 'like', '%'.$recherche.'%')
                    ->orWhereHas('user', fn ($u) => $u->where('nom', 'like', '%'.$recherche.'%')->orWhere('prenom', 'like', '%'.$recherche.'%')->orWhere('telephone', 'like', '%'.$recherche.'%'))
                    ->orWhereHas('restaurant', fn ($r) => $r->where('nom', 'like', '%'.$recherche.'%'));
            }))->latest('date_commande')->limit(100)->get()
            ->map(fn (Commande $commande) => ['id'=>$commande->id,'reference'=>$commande->reference,'client'=>$commande->user ? trim($commande->user->prenom.' '.$commande->user->nom) : null,'telephone'=>$commande->user?->telephone,'restaurant'=>$commande->restaurant?->nom,'zone'=>$commande->zone?->nom,'statut'=>$commande->statutCommande?['code'=>$commande->statutCommande->code,'libelle'=>$commande->statutCommande->libelle]:null,'montant_total'=>(float)$commande->montant_total,'date_commande'=>$commande->date_commande?->format('d/m/Y H:i')])->values();
        return Inertia::render('Admin/Commandes', ['utilisateur'=>$request->user(),'commandes'=>$commandes,'recherche'=>$recherche]);
    }

    public function livraisons(Request $request): Response
    {
        $recherche=trim((string)$request->query('recherche',''));
        $livraisons=Livraison::query()->with(['commande:id,reference','zone:id,nom','attributions'=>fn($q)=>$q->where('statut','active')->with('livreur:id,nom,prenom')->latest('id')])
            ->when($recherche!=='' ,fn($q)=>$q->where(function($query)use($recherche){$query->whereHas('commande',fn($c)=>$c->where('reference','like','%'.$recherche.'%'))->orWhereHas('zone',fn($z)=>$z->where('nom','like','%'.$recherche.'%'))->orWhereHas('attributions.livreur',fn($u)=>$u->where('nom','like','%'.$recherche.'%')->orWhere('prenom','like','%'.$recherche.'%'));}))
            ->latest('id')->limit(100)->get()->map(fn(Livraison $l)=>['id'=>$l->id,'reference'=>$l->commande?->reference,'zone'=>$l->zone?->nom,'statut'=>$l->statut,'mode_attribution'=>$l->mode_attribution,'livreur'=>$l->attributions->first()?->livreur ? trim($l->attributions->first()->livreur->prenom.' '.$l->attributions->first()->livreur->nom) : null,'matricule'=>$l->attributions->first()?->livreur?->profilLivreur?->matricule,'date_attribution'=>$l->date_attribution?Carbon::parse($l->date_attribution)->format('d/m/Y H:i'):null])->values();
        return Inertia::render('Admin/Livraisons',['utilisateur'=>$request->user(),'livraisons'=>$livraisons,'recherche'=>$recherche]);
    }

    public function clients(Request $request): Response
    {
        $recherche=trim((string)$request->query('recherche',''));
        $clients=User::query()->where('role','client')->withCount('commandes')->with(['commandes'=>fn($q)=>$q->latest('date_commande')->limit(1)])
            ->when($recherche!=='' ,fn($q)=>$q->where(function($query)use($recherche){$query->where('nom','like','%'.$recherche.'%')->orWhere('prenom','like','%'.$recherche.'%')->orWhere('telephone','like','%'.$recherche.'%')->orWhere('email','like','%'.$recherche.'%');}))
            ->latest('id')->limit(100)->get()->map(fn(User $u)=>['id'=>$u->id,'nom'=>trim($u->prenom.' '.$u->nom),'email'=>$u->email,'telephone'=>$u->telephone,'statut'=>$u->statut,'commandes_count'=>(int)$u->commandes_count,'derniere_commande'=>$u->commandes->first()?->date_commande?->format('d/m/Y H:i')])->values();
        return Inertia::render('Admin/Clients',['utilisateur'=>$request->user(),'clients'=>$clients,'recherche'=>$recherche]);
    }

    public function restaurants(Request $request): Response
    {
        $recherche=trim((string)$request->query('recherche',''));
        $restaurants=Restaurant::query()->with(['user:id,nom,prenom,telephone','zone:id,nom'])->withCount(['produits','commandes'])
            ->when($recherche!=='' ,fn($q)=>$q->where(function($query)use($recherche){$query->where('nom','like','%'.$recherche.'%')->orWhere('telephone','like','%'.$recherche.'%')->orWhereHas('user',fn($u)=>$u->where('nom','like','%'.$recherche.'%')->orWhere('prenom','like','%'.$recherche.'%'));}))
            ->orderBy('nom')->limit(100)->get()->map(fn(Restaurant $r)=>['id'=>$r->id,'nom'=>$r->nom,'responsable'=>$r->user ? trim($r->user->prenom.' '.$r->user->nom) : null,'telephone'=>$r->telephone?:$r->user?->telephone,'zone'=>$r->zone?->nom,'statut'=>$r->statut,'produits_count'=>(int)$r->produits_count,'commandes_count'=>(int)$r->commandes_count])->values();
        return Inertia::render('Admin/Restaurants',['utilisateur'=>$request->user(),'restaurants'=>$restaurants,'recherche'=>$recherche]);
    }

    public function livreurs(Request $request): Response
    {
        $recherche=trim((string)$request->query('recherche',''));
        $livreurs=User::query()->where('role','livreur')->with('profilLivreur.zone:id,nom')
            ->when($recherche!=='' ,fn($q)=>$q->where(function($query)use($recherche){$query->where('nom','like','%'.$recherche.'%')->orWhere('prenom','like','%'.$recherche.'%')->orWhere('telephone','like','%'.$recherche.'%')->orWhereHas('profilLivreur',fn($p)=>$p->where('matricule','like','%'.$recherche.'%'));}))
            ->latest('id')->limit(100)->get();
        $activeCounts=AttributionLivraison::query()->where('statut','active')->whereIn('livreur_id',$livreurs->pluck('id'))->selectRaw('livreur_id, COUNT(*) total')->groupBy('livreur_id')->pluck('total','livreur_id');
        $livreurs=$livreurs->map(fn(User $u)=>['id'=>$u->id,'nom'=>trim($u->prenom.' '.$u->nom),'matricule'=>$u->profilLivreur?->matricule,'telephone'=>$u->telephone,'zone'=>$u->profilLivreur?->zone?->nom,'disponibilite'=>$u->profilLivreur?->disponibilite,'livraisons_count'=>(int)($activeCounts[$u->id]??0)])->values();
        return Inertia::render('Admin/Livreurs',['utilisateur'=>$request->user(),'livreurs'=>$livreurs,'recherche'=>$recherche]);
    }

    public function zones(Request $request): Response
    {
        $recherche=trim((string)$request->query('recherche',''));
        $zones=Zone::query()->with('zoneParent:id,nom')->withCount(['restaurants','livraisons'])->when($recherche!=='',fn($q)=>$q->where('nom','like','%'.$recherche.'%'))->orderBy('nom')->limit(100)->get();
        $livreurs=User::query()->where('role','livreur')->where('statut','actif')->with('profilLivreur')->get()->groupBy(fn(User $u)=>$u->profilLivreur?->zone_id);
        $zones=$zones->map(fn(Zone $z)=>['id'=>$z->id,'nom'=>$z->nom,'parent'=>$z->zoneParent?->nom,'statut'=>$z->statut,'restaurants_count'=>(int)$z->restaurants_count,'livreurs_count'=>(int)($livreurs->get($z->id)?->count()??0),'livreurs_disponibles'=>(int)($livreurs->get($z->id)?->filter(fn(User $u)=>$u->profilLivreur?->disponibilite==='disponible')->count()??0),'livraisons_actives'=>(int)$z->livraisons_count])->values();
        return Inertia::render('Admin/Zones',['utilisateur'=>$request->user(),'zones'=>$zones,'recherche'=>$recherche]);
    }

    public function notifications(Request $request): Response
    {
        $recherche=trim((string)$request->query('recherche',''));
        $notifications=Notification::query()->with(['user:id,nom,prenom','commande:id,reference'])
            ->when($recherche!=='' ,fn($q)=>$q->where(function($query)use($recherche){$query->where('type_evenement','like','%'.$recherche.'%')->orWhere('canal','like','%'.$recherche.'%')->orWhere('statut_envoi','like','%'.$recherche.'%')->orWhereHas('user',fn($u)=>$u->where('nom','like','%'.$recherche.'%')->orWhere('prenom','like','%'.$recherche.'%'))->orWhereHas('commande',fn($c)=>$c->where('reference','like','%'.$recherche.'%'));}))
            ->latest('id')->limit(100)->get()->map(fn(Notification $n)=>['id'=>$n->id,'date_envoi'=>$n->date_envoi?Carbon::parse($n->date_envoi)->format('d/m/Y H:i'):null,'destinataire'=>$n->user ? trim($n->user->prenom.' '.$n->user->nom) : ($n->telephone_destination ?: '—'),'type_evenement'=>$n->type_evenement,'canal'=>$n->canal,'statut_envoi'=>$n->statut_envoi,'reference'=>$n->commande?->reference])->values();
        return Inertia::render('Admin/Notifications',['utilisateur'=>$request->user(),'notifications'=>$notifications,'recherche'=>$recherche]);
    }


    public function changerStatutClient(Request $request, User $user): RedirectResponse
    {
        abort_unless($user->role === 'client', 404);

        $nouveauStatut = $user->statut === 'actif' ? 'inactif' : 'actif';
        $user->update(['statut' => $nouveauStatut]);

        return back()->with('success', 'Le statut du client a été mis à jour.');
    }

    public function changerStatutRestaurant(Restaurant $restaurant): RedirectResponse
    {
        $nouveauStatut = $restaurant->statut === 'actif' ? 'inactif' : 'actif';
        $restaurant->update(['statut' => $nouveauStatut]);

        return back()->with('success', 'Le statut du restaurant a été mis à jour.');
    }

    public function changerDisponibiliteLivreur(User $user): RedirectResponse
    {
        abort_unless($user->role === 'livreur', 404);

        $profil = $user->profilLivreur;
        abort_unless($profil, 404);

        $nouvelleDisponibilite = $profil->disponibilite === 'disponible'
            ? 'indisponible'
            : 'disponible';

        $profil->update(['disponibilite' => $nouvelleDisponibilite]);

        return back()->with('success', 'La disponibilité du livreur a été mise à jour.');
    }

    public function changerStatutZone(Zone $zone): RedirectResponse
    {
        if ($zone->statut === 'actif') {
            $aDesLivraisonsActives = $zone->livraisons()
                ->whereIn('statut', ['en_attente', 'attribuee', 'en_cours'])
                ->exists();

            abort_if($aDesLivraisonsActives, 422, 'Cette zone possède encore des livraisons actives.');
        }

        $zone->update([
            'statut' => $zone->statut === 'actif' ? 'inactif' : 'actif',
        ]);

        return back()->with('success', 'Le statut de la zone a été mis à jour.');
    }

}
