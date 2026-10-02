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
        $livraisons=Livraison::query()->with(['commande:id,reference','zone:id,nom','attributions'=>fn($q)=>$q->where('statut','active')->with('livreur:id,nom,prenom','livreur.profilLivreur:user_id,matricule')->latest('id')])
            ->when($recherche!=='' ,fn($q)=>$q->where(function($query)use($recherche){$query->whereHas('commande',fn($c)=>$c->where('reference','like','%'.$recherche.'%'))->orWhereHas('zone',fn($z)=>$z->where('nom','like','%'.$recherche.'%'))->orWhereHas('attributions.livreur',fn($u)=>$u->where('nom','like','%'.$recherche.'%')->orWhere('prenom','like','%'.$recherche.'%'));}))
            ->latest('id')->limit(100)->get();

        $activeLivreurIds=AttributionLivraison::query()
            ->where('statut','active')
            ->pluck('livreur_id');

        $candidats=User::query()
            ->where('role','livreur')
            ->where('statut','actif')
            ->whereHas('profilLivreur',fn($q)=>$q->where('disponibilite','disponible'))
            ->whereNotIn('id',$activeLivreurIds)
            ->with('profilLivreur:user_id,zone_id,matricule')
            ->orderBy('prenom')
            ->orderBy('nom')
            ->get();

        $livraisons=$livraisons->map(function(Livraison $l)use($candidats){
            $active=$l->attributions->first();
            $candidatsZone=$l->statut==='en_cours'||$l->statut==='attribuee'||$l->statut==='en_attente'
                ? $candidats->filter(fn(User $u)=>(int)$u->profilLivreur?->zone_id===(int)$l->zone_id)->map(fn(User $u)=>[
                    'id'=>$u->id,
                    'nom'=>trim($u->prenom.' '.$u->nom),
                    'matricule'=>$u->profilLivreur?->matricule,
                ])->values()
                : collect();

            return [
                'id'=>$l->id,
                'reference'=>$l->commande?->reference,
                'zone'=>$l->zone?->nom,
                'zone_id'=>$l->zone_id,
                'statut'=>$l->statut,
                'mode_attribution'=>$l->mode_attribution,
                'livreur'=>$active?->livreur ? trim($active->livreur->prenom.' '.$active->livreur->nom) : null,
                'matricule'=>$active?->livreur?->profilLivreur?->matricule,
                'date_attribution'=>$l->date_attribution?Carbon::parse($l->date_attribution)->format('d/m/Y H:i'):null,
                'candidats'=>$candidatsZone,
            ];
        })->values();

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
        $zones=Zone::query()
            ->with('zoneParent:id,nom')
            ->withCount([
                'restaurants',
                'livraisons as livraisons_actives' => fn($q) => $q->whereIn('statut', ['en_attente', 'attribuee', 'en_cours']),
            ])
            ->when($recherche!=='',fn($q)=>$q->where('nom','like','%'.$recherche.'%'))
            ->orderBy('nom')
            ->limit(100)
            ->get();

        $livreurs=User::query()
            ->where('role','livreur')
            ->where('statut','actif')
            ->with('profilLivreur')
            ->get()
            ->groupBy(fn(User $u)=>$u->profilLivreur?->zone_id);

        $zones=$zones->map(fn(Zone $z)=>[
            'id'=>$z->id,
            'nom'=>$z->nom,
            'parent'=>$z->zoneParent?->nom,
            'statut'=>$z->statut,
            'restaurants_count'=>(int)$z->restaurants_count,
            'livreurs_count'=>(int)($livreurs->get($z->id)?->count()??0),
            'livreurs_disponibles'=>(int)($livreurs->get($z->id)?->filter(fn(User $u)=>$u->profilLivreur?->disponibilite==='disponible')->count()??0),
            'livraisons_actives'=>(int)$z->livraisons_actives,
        ])->values();
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


    public function utilisateurs(Request $request): Response
    {
        $recherche = trim((string) $request->query('recherche', ''));
        $role = trim((string) $request->query('role', ''));
        $statut = trim((string) $request->query('statut', ''));

        $utilisateurs = User::query()
            ->with([
                'restaurant:id,user_id,zone_id,nom,telephone,email,adresse,statut',
                'restaurant.zone:id,nom',
                'profilLivreur:user_id,matricule,zone_id,disponibilite,telephone_secondaire',
                'profilLivreur.zone:id,nom',
            ])
            ->when($recherche !== '', function ($query) use ($recherche) {
                $query->where(function ($q) use ($recherche) {
                    $q->where('nom', 'like', '%'.$recherche.'%')
                        ->orWhere('prenom', 'like', '%'.$recherche.'%')
                        ->orWhere('telephone', 'like', '%'.$recherche.'%')
                        ->orWhere('email', 'like', '%'.$recherche.'%')
                        ->orWhereHas('profilLivreur', fn ($p) => $p->where('matricule', 'like', '%'.$recherche.'%'))
                        ->orWhereHas('restaurant', fn ($r) => $r->where('nom', 'like', '%'.$recherche.'%'));
                });
            })
            ->when(in_array($role, ['client', 'restaurant', 'livreur', 'administrateur'], true), fn ($q) => $q->where('role', $role))
            ->when(in_array($statut, ['actif', 'inactif'], true), fn ($q) => $q->where('statut', $statut))
            ->latest('id')
            ->paginate(20)
            ->withQueryString();

        $utilisateurs->setCollection(
            $utilisateurs->getCollection()->map(fn (User $user) => $this->utilisateurAdmin($user))->values()
        );

        return Inertia::render('Admin/Utilisateurs', [
            'utilisateurs' => $utilisateurs,
            'filtres' => [
                'recherche' => $recherche,
                'role' => $role,
                'statut' => $statut,
            ],
            'roles' => ['client', 'restaurant', 'livreur', 'administrateur'],
            'statuts' => ['actif', 'inactif'],
            'administrateursActifs' => User::query()->where('role', 'administrateur')->where('statut', 'actif')->count(),
            'utilisateur' => $this->utilisateurAdmin($request->user()),
        ]);
    }

    public function creerUtilisateur(Request $request): RedirectResponse
    {
        $donnees = $this->validerUtilisateurAdmin($request);

        DB::transaction(function () use ($donnees) {
            $user = User::create([
                'nom' => $donnees['nom'],
                'prenom' => $donnees['prenom'] ?? null,
                'telephone' => $donnees['telephone'],
                'email' => $donnees['email'] ?? null,
                'password' => IlluminateSupportFacadesHash::make($donnees['mot_de_passe']),
                'role' => $donnees['role'],
                'statut' => $donnees['statut'],
            ]);

            $this->synchroniserProfilMetier($user, $donnees);
        });

        return back()->with('success', 'Utilisateur créé avec succès.');
    }

    public function modifierUtilisateur(Request $request, User $user): RedirectResponse
    {
        $donnees = $this->validerUtilisateurAdmin($request, $user);

        DB::transaction(function () use ($donnees, $user) {
            $ancienRole = $user->role;

            if ($ancienRole === 'administrateur' && $user->statut === 'actif') {
                $passeAdministrateurActif = ($donnees['role'] ?? $ancienRole) === 'administrateur'
                    && ($donnees['statut'] ?? $user->statut) === 'actif';

                if (! $passeAdministrateurActif && User::query()->where('role', 'administrateur')->where('statut', 'actif')->count() <= 1) {
                    abort(422, 'Impossible de supprimer le dernier administrateur actif du système.');
                }
            }

            $user->update([
                'nom' => $donnees['nom'],
                'prenom' => $donnees['prenom'] ?? null,
                'telephone' => $donnees['telephone'],
                'email' => $donnees['email'] ?? null,
                'role' => $donnees['role'],
                'statut' => $donnees['statut'],
                ...(!empty($donnees['mot_de_passe']) ? ['password' => IlluminateSupportFacadesHash::make($donnees['mot_de_passe'])] : []),
            ]);

            $this->synchroniserProfilMetier($user->fresh(), $donnees);
        });

        return back()->with('success', 'Utilisateur mis à jour.');
    }

    public function changerRole(Request $request, User $user): RedirectResponse
    {
        $donnees = $request->validate([
            'role' => ['required', 'string', 'in:client,restaurant,livreur,administrateur'],
            'restaurant_nom' => ['nullable', 'string', 'max:150'],
            'restaurant_description' => ['nullable', 'string', 'max:2000'],
            'restaurant_telephone' => ['nullable', 'string', 'max:30'],
            'restaurant_email' => ['nullable', 'email', 'max:150'],
            'restaurant_adresse' => ['nullable', 'string', 'max:1000'],
            'restaurant_zone_id' => ['nullable', 'integer', 'exists:zones,id'],
            'livreur_matricule' => ['nullable', 'string', 'max:100'],
            'livreur_zone_id' => ['nullable', 'integer', 'exists:zones,id'],
            'livreur_disponibilite' => ['nullable', 'in:disponible,indisponible'],
            'livreur_telephone_secondaire' => ['nullable', 'string', 'max:30'],
        ]);

        if ($user->role === 'administrateur' && $user->statut === 'actif' && $donnees['role'] !== 'administrateur'
            && User::query()->where('role', 'administrateur')->where('statut', 'actif')->count() <= 1) {
            abort(422, 'Impossible de supprimer le dernier administrateur actif du système.');
        }

        if ($donnees['role'] === 'restaurant' && ! $user->restaurant) {
            validator($donnees, [
                'restaurant_nom' => ['required', 'string', 'max:150'],
                'restaurant_telephone' => ['required', 'string', 'max:30'],
                'restaurant_adresse' => ['required', 'string', 'max:1000'],
            ], [
                'restaurant_nom.required' => 'Le nom du restaurant est obligatoire pour ce rôle.',
                'restaurant_telephone.required' => 'Le téléphone du restaurant est obligatoire.',
                'restaurant_adresse.required' => 'L’adresse du restaurant est obligatoire.',
            ])->validate();
        }

        if ($donnees['role'] === 'livreur' && ! $user->profilLivreur) {
            validator($donnees, [
                'livreur_matricule' => ['required', 'string', 'max:100', 'unique:profils_livreurs,matricule'],
                'livreur_disponibilite' => ['required', 'in:disponible,indisponible'],
            ], [
                'livreur_matricule.required' => 'Le matricule livreur est obligatoire pour ce rôle.',
                'livreur_matricule.unique' => 'Ce matricule livreur est déjà utilisé.',
                'livreur_disponibilite.required' => 'La disponibilité du livreur est obligatoire.',
            ])->validate();
        }

        DB::transaction(function () use ($donnees, $user) {
            $user->update(['role' => $donnees['role']]);
            $this->synchroniserProfilMetier($user->fresh(), $donnees);
        });

        return back()->with('success', 'Rôle utilisateur mis à jour.');
    }

    public function changerStatutUtilisateur(Request $request, User $user): RedirectResponse
    {
        $donnees = $request->validate([
            'statut' => ['required', 'in:actif,inactif'],
        ]);

        if ($user->role === 'administrateur' && $user->statut === 'actif' && $donnees['statut'] === 'inactif'
            && User::query()->where('role', 'administrateur')->where('statut', 'actif')->count() <= 1) {
            abort(422, 'Impossible de désactiver le dernier administrateur actif du système.');
        }

        $user->update(['statut' => $donnees['statut']]);

        return back()->with('success', 'Statut utilisateur mis à jour.');
    }

    private function validerUtilisateurAdmin(Request $request, ?User $user = null): array
    {
        $telephone = preg_replace('/[^0-9]/', '', (string) $request->input('telephone')) ?? '';

        $donnees = $request->validate([
            'nom' => ['required', 'string', 'max:100'],
            'prenom' => ['nullable', 'string', 'max:100'],
            'telephone' => ['required', 'string', 'max:30', IlluminateValidationRule::unique('users', 'telephone')->ignore($user?->id)],
            'email' => ['nullable', 'email', 'max:255', IlluminateValidationRule::unique('users', 'email')->ignore($user?->id)],
            'role' => ['required', 'in:client,restaurant,livreur,administrateur'],
            'statut' => ['required', 'in:actif,inactif'],
            'mot_de_passe' => [$user ? 'nullable' : 'required', 'string', 'min:8'],
            'restaurant_nom' => ['nullable', 'string', 'max:150'],
            'restaurant_description' => ['nullable', 'string', 'max:2000'],
            'restaurant_telephone' => ['nullable', 'string', 'max:30'],
            'restaurant_email' => ['nullable', 'email', 'max:150'],
            'restaurant_adresse' => ['nullable', 'string', 'max:1000'],
            'restaurant_zone_id' => ['nullable', 'integer', 'exists:zones,id'],
            'livreur_matricule' => ['nullable', 'string', 'max:100', $user ? IlluminateValidationRule::unique('profils_livreurs', 'matricule')->ignore($user->id, 'user_id') : 'unique:profils_livreurs,matricule'],
            'livreur_zone_id' => ['nullable', 'integer', 'exists:zones,id'],
            'livreur_disponibilite' => ['nullable', 'in:disponible,indisponible'],
            'livreur_telephone_secondaire' => ['nullable', 'string', 'max:30'],
        ]);

        if ($donnees['role'] === 'restaurant' && ! $user?->restaurant) {
            if (blank($donnees['restaurant_nom']) || blank($donnees['restaurant_telephone']) || blank($donnees['restaurant_adresse'])) {
                abort(422, 'Les informations du restaurant sont obligatoires pour attribuer ce rôle.');
            }
        }

        if ($donnees['role'] === 'livreur' && ! $user?->profilLivreur) {
            if (blank($donnees['livreur_matricule']) || blank($donnees['livreur_disponibilite'])) {
                abort(422, 'Le matricule et la disponibilité du livreur sont obligatoires pour attribuer ce rôle.');
            }
        }

        return $donnees;
    }

    private function synchroniserProfilMetier(User $user, array $donnees): void
    {
        if ($user->role === 'restaurant') {
            if ($user->restaurant) {
                $user->restaurant->update(array_filter([
                    'zone_id' => $donnees['restaurant_zone_id'] ?? null,
                    'nom' => $donnees['restaurant_nom'] ?? null,
                    'description' => $donnees['restaurant_description'] ?? null,
                    'telephone' => $donnees['restaurant_telephone'] ?? null,
                    'email' => $donnees['restaurant_email'] ?? null,
                    'adresse' => $donnees['restaurant_adresse'] ?? null,
                ], fn ($value) => $value !== null));
            } else {
                Restaurant::create([
                    'user_id' => $user->id,
                    'zone_id' => $donnees['restaurant_zone_id'] ?? null,
                    'nom' => $donnees['restaurant_nom'],
                    'description' => $donnees['restaurant_description'] ?? null,
                    'telephone' => $donnees['restaurant_telephone'],
                    'email' => $donnees['restaurant_email'] ?? null,
                    'adresse' => $donnees['restaurant_adresse'],
                    'horaires' => null,
                    'statut' => 'actif',
                ]);
            }
        }

        if ($user->role === 'livreur') {
            if ($user->profilLivreur) {
                $user->profilLivreur->update(array_filter([
                    'matricule' => $donnees['livreur_matricule'] ?? null,
                    'zone_id' => $donnees['livreur_zone_id'] ?? null,
                    'disponibilite' => $donnees['livreur_disponibilite'] ?? null,
                    'telephone_secondaire' => $donnees['livreur_telephone_secondaire'] ?? null,
                ], fn ($value) => $value !== null));
            } else {
                AppModelsProfilLivreur::create([
                    'user_id' => $user->id,
                    'matricule' => $donnees['livreur_matricule'],
                    'zone_id' => $donnees['livreur_zone_id'] ?? null,
                    'disponibilite' => $donnees['livreur_disponibilite'],
                    'telephone_secondaire' => $donnees['livreur_telephone_secondaire'] ?? null,
                ]);
            }
        }
    }

    private function utilisateurAdmin(?User $user): ?array
    {
        if (! $user) {
            return null;
        }

        return [
            'id' => $user->id,
            'nom' => $user->nom,
            'prenom' => $user->prenom,
            'telephone' => $user->telephone,
            'email' => $user->email,
            'photo_profil' => $user->photo_profil,
            'role' => $user->role,
            'statut' => $user->statut,
            'created_at' => $user->created_at?->format('d/m/Y H:i'),
            'restaurant' => $user->restaurant ? [
                'id' => $user->restaurant->id,
                'nom' => $user->restaurant->nom,
                'telephone' => $user->restaurant->telephone,
                'email' => $user->restaurant->email,
                'adresse' => $user->restaurant->adresse,
                'zone' => $user->restaurant->zone?->nom,
                'statut' => $user->restaurant->statut,
            ] : null,
            'profil_livreur' => $user->profilLivreur ? [
                'matricule' => $user->profilLivreur->matricule,
                'zone_id' => $user->profilLivreur->zone_id,
                'zone' => $user->profilLivreur->zone?->nom,
                'disponibilite' => $user->profilLivreur->disponibilite,
                'telephone_secondaire' => $user->profilLivreur->telephone_secondaire,
            ] : null,
        ];
    }

}
