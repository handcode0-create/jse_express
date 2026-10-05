<?php

namespace App\Http\Controllers;

use App\Models\AttributionLivraison;
use App\Models\HistoriqueCommande;
use App\Models\Notification;
use App\Models\ProfilLivreur;
use App\Models\StatutCommande;
use App\Models\Zone;
use App\Services\LivraisonService;
use App\Services\NotificationService;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class LivreurController extends Controller
{
    private function profil(Request $request): ProfilLivreur
    {
        return ProfilLivreur::query()
            ->where('user_id', $request->user()->id)
            ->with('zone:id,nom')
            ->firstOrFail();
    }

    public function tableauDeBord(Request $request): Response
    {
        $profil = $this->profil($request);

        $attributions = AttributionLivraison::query()
            ->where('livreur_id', $request->user()->id)
            ->where('statut', 'active')
            ->with([
                'livraison.commande:id,reference,user_id,restaurant_id,zone_id,adresse_livraison,telephone_livraison,sous_total,frais_livraison,montant_total,date_commande,statut_id',
                'livraison.commande.user:id,nom,prenom,telephone',
                'livraison.commande.restaurant:id,nom,telephone,adresse',
                'livraison.commande.zone:id,nom',
                'livraison.commande.statutCommande:id,code,libelle,ordre',
                'livraison.commande.lignesCommande:id,commande_id,produit_id,nom_produit_snapshot,quantite,prix_unitaire,total_ligne,options',
                'livraison.commande.lignesCommande.produit:id,nom,image',
                'livraison.zone:id,nom',
            ])
            ->latest('date_attribution')
            ->get();

        $livraisons = $attributions
            ->filter(fn ($attribution) => $attribution->livraison?->commande)
            ->map(fn ($attribution) => [
                'id' => $attribution->livraison->id,
                'attribution_id' => $attribution->id,
                'reference' => $attribution->livraison->commande->reference,
                'statut_livraison' => $attribution->livraison->statut,
                'statut_commande' => $attribution->livraison->commande->statutCommande ? [
                    'code' => $attribution->livraison->commande->statutCommande->code,
                    'libelle' => $attribution->livraison->commande->statutCommande->libelle,
                ] : null,
                'client' => $attribution->livraison->commande->user ? [
                    'nom' => trim(
                        $attribution->livraison->commande->user->prenom.' '.
                        $attribution->livraison->commande->user->nom
                    ),
                    'telephone' => $attribution->livraison->commande->user->telephone,
                ] : null,
                'restaurant' => $attribution->livraison->commande->restaurant ? [
                    'nom' => $attribution->livraison->commande->restaurant->nom,
                    'telephone' => $attribution->livraison->commande->restaurant->telephone,
                    'adresse' => $attribution->livraison->commande->restaurant->adresse,
                ] : null,
                'adresse_livraison' => $attribution->livraison->commande->adresse_livraison,
                'telephone_livraison' => $attribution->livraison->commande->telephone_livraison,
                'zone' => $attribution->livraison->zone?->nom,
                'montant_total' => (float) $attribution->livraison->commande->montant_total,
                'articles' => $attribution->livraison->commande->lignesCommande->map(fn ($ligne) => [
                    'nom' => $ligne->nom_produit_snapshot ?: $ligne->produit?->nom ?: 'Article',
                    'quantite' => (int) $ligne->quantite,
                    'image' => $ligne->produit?->image,
                    'total_ligne' => (float) $ligne->total_ligne,
                ])->values(),
                'date_attribution' => $attribution->date_attribution ? Carbon::parse($attribution->date_attribution)->format('d/m/Y H:i') : null,
            ])->values();

        $historique = AttributionLivraison::query()
            ->where('livreur_id', $request->user()->id)
            ->where('statut', 'terminee')
            ->with([
                'livraison.commande:id,reference,restaurant_id,montant_total,date_commande,statut_id',
                'livraison.commande.restaurant:id,nom,adresse',
                'livraison.commande.statutCommande:id,code,libelle',
            ])
            ->latest('date_attribution')
            ->limit(12)
            ->get()
            ->map(fn ($attribution) => [
                'id' => $attribution->id,
                'reference' => $attribution->livraison?->commande?->reference,
                'restaurant' => $attribution->livraison?->commande?->restaurant?->nom,
                'adresse' => $attribution->livraison?->commande?->restaurant?->adresse,
                'montant_total' => (float) ($attribution->livraison?->commande?->montant_total ?? 0),
                'date' => $attribution->date_attribution
                    ? Carbon::parse($attribution->date_attribution)->format('d/m H:i')
                    : null,
                'statut' => $attribution->livraison?->statut,
            ])
            ->filter(fn ($item) => $item['reference'] !== null)
            ->values();

        return Inertia::render('Livreur/TableauDeBord', [
            'livreur' => [
                'id' => $request->user()->id,
                'nom' => $request->user()->nom,
                'prenom' => $request->user()->prenom,
                'telephone' => $request->user()->telephone,
                'email' => $request->user()->email,
                'photo_profil' => $request->user()->photo_profil,
                'telephone_secondaire' => $profil->telephone_secondaire,
                'zone_id' => $profil->zone_id,
                'matricule' => $profil->matricule,
                'disponibilite' => $profil->disponibilite,
                'zone' => $profil->zone ? [
                    'id' => $profil->zone->id,
                    'nom' => $profil->zone->nom,
                ] : null,
            ],
            'livraisons' => $livraisons,
            'historique' => $historique,
            'zones' => Zone::query()->where('statut', 'actif')->orderBy('nom')->get(['id', 'nom']),
            'notifications' => Notification::query()
                ->where('user_id', $request->user()->id)
                ->whereNull('masquee_par_destinataire_at')
                ->latest('id')
                ->limit(20)
                ->get()
                ->map(fn ($notification) => [
                    'id' => $notification->id,
                    'type' => $notification->type_evenement,
                    'contenu' => $notification->contenu,
                    'statut' => $notification->statut_envoi,
                    'date' => $notification->created_at?->diffForHumans(),
                ])->values(),
            'statistiques' => [
                'missions_actives' => $livraisons->count(),
                'missions_du_jour' => AttributionLivraison::query()
                    ->where('livreur_id', $request->user()->id)
                    ->whereDate('date_attribution', today())
                    ->count(),
                'livraisons_terminees' => AttributionLivraison::query()
                    ->where('livreur_id', $request->user()->id)
                    ->where('statut', 'terminee')
                    ->count(),
            ],
        ]);
    }

    public function prendreEnCharge(Request $request, int $livraison, LivraisonService $livraisonService): RedirectResponse
    {
        $profil = $this->profil($request);

        $attribution = AttributionLivraison::query()
            ->where('id', $livraison)
            ->where('livreur_id', $request->user()->id)
            ->where('statut', 'active')
            ->with(['livraison.commande.statutCommande'])
            ->firstOrFail();

        $livraisonModel = $attribution->livraison;
        $commande = $livraisonModel?->commande;

        abort_unless($livraisonModel && $commande, 404);
        abort_unless($livraisonService->livreurDessertLaZone($profil, $livraisonModel), 403);

        if ($commande->statutCommande?->code === 'EN_LIVRAISON' && $livraisonModel->statut === 'en_cours') {
            return back()->with('success', 'Cette livraison est déjà prise en charge.');
        }

        if ($commande->statutCommande?->code !== 'PRETE' || ! in_array($livraisonModel->statut, ['en_attente', 'attribuee'], true)) {
            throw ValidationException::withMessages([
                'mission' => 'Cette commande n’est pas encore prête : attendez la fin de sa préparation par le restaurant.',
            ]);
        }

        DB::transaction(function () use ($livraisonModel, $commande, $request) {
            $statutEnLivraison = StatutCommande::query()
                ->where('code', 'EN_LIVRAISON')
                ->firstOrFail();

            $livraisonModel->update([
                'statut' => 'en_cours',
                'date_prise_en_charge' => now(),
            ]);

            $commande->update([
                'statut_id' => $statutEnLivraison->id,
            ]);

            HistoriqueCommande::create([
                'commande_id' => $commande->id,
                'statut_id' => $statutEnLivraison->id,
                'user_id' => $request->user()->id,
                'commentaire' => 'Commande prise en charge pour livraison.',
                'date_changement' => now(),
            ]);
        });

        return back()->with('success', 'La livraison a été prise en charge.');
    }

    public function validerPin(
        Request $request,
        int $livraison,
        LivraisonService $livraisonService,
        NotificationService $notificationService
    ): RedirectResponse {
        $profil = $this->profil($request);

        $attribution = AttributionLivraison::query()
            ->whereKey($livraison)
            ->where('livreur_id', $request->user()->id)
            ->where('statut', 'active')
            ->with(['livraison.commande.statutCommande', 'livraison.commande.user', 'livraison.commande.restaurant.user'])
            ->firstOrFail();

        $livraisonModel = $attribution->livraison;
        $commande = $livraisonModel?->commande;

        abort_unless($livraisonModel && $commande, 404);
        abort_unless($livraisonService->livreurDessertLaZone($profil, $livraisonModel), 403);

        if ($livraisonModel->statut !== 'en_cours' || $commande->statutCommande?->code !== 'EN_LIVRAISON') {
            throw ValidationException::withMessages([
                'mission' => 'Cette livraison n’est pas en cours : prenez d’abord la commande en charge.',
            ]);
        }

        $pinKey = 'livraison:pin:'.$request->user()->id.':'.$livraisonModel->id;
        if (RateLimiter::tooManyAttempts($pinKey, 5)) {
            abort(429, 'Trop de tentatives de validation du PIN. Veuillez réessayer dans une minute.');
        }
        RateLimiter::hit($pinKey, 60);

        $donnees = $request->validate([
            'pin' => ['required', 'digits:6'],
        ]);

        if (! $livraisonService->validerPin($commande, $donnees['pin'])) {
            throw ValidationException::withMessages(['pin' => 'Le PIN de livraison est incorrect.']);
        }

        RateLimiter::clear($pinKey);

        $livraisonService->cloturerLivraison($livraisonModel, $request->user()->id);

        if ($commande->user) {
            $notificationService->sms(
                $commande->user,
                'Votre commande '.$commande->reference.' a été livrée avec succès.',
                $commande->id,
                $livraisonModel->id,
                'livraison_terminee'
            );
        }

        if ($commande->restaurant?->user) {
            $notificationService->sms(
                $commande->restaurant->user,
                'La commande '.$commande->reference.' a été livrée au client.',
                $commande->id,
                $livraisonModel->id,
                'livraison_terminee'
            );
        }

        return back()->with('success', 'Livraison validée et commande clôturée.');
    }

    public function modifierProfil(Request $request): RedirectResponse
    {
        $profil = $this->profil($request);

        $donnees = $request->validate([
            'nom' => ['required', 'string', 'max:100'],
            'prenom' => ['nullable', 'string', 'max:100'],
            'telephone' => ['required', 'string', 'max:30', Rule::unique('users', 'telephone')->ignore($request->user()->id)],
            'email' => ['nullable', 'email', 'max:255', Rule::unique('users', 'email')->ignore($request->user()->id)],
            'telephone_secondaire' => ['nullable', 'string', 'max:30'],
            'zone_id' => ['required', 'integer', 'exists:zones,id'],
        ], [
            'telephone.unique' => 'Ce numéro de téléphone est déjà utilisé par un autre compte.',
            'email.unique' => 'Cette adresse e-mail est déjà utilisée par un autre compte.',
        ]);

        // Changer de zone en pleine mission rendrait la livraison en cours impossible à terminer.
        $missionActive = AttributionLivraison::query()
            ->where('livreur_id', $request->user()->id)
            ->where('statut', 'active')
            ->exists();

        if ($missionActive && (int) $donnees['zone_id'] !== (int) $profil->zone_id) {
            throw ValidationException::withMessages([
                'zone_id' => 'Vous ne pouvez pas changer de zone tant qu’une mission est en cours.',
            ]);
        }

        DB::transaction(function () use ($request, $profil, $donnees) {
            $request->user()->update([
                'nom' => $donnees['nom'],
                'prenom' => $donnees['prenom'] ?? null,
                'telephone' => $donnees['telephone'],
                'email' => $donnees['email'] ?? null,
            ]);

            $profil->update([
                'telephone_secondaire' => $donnees['telephone_secondaire'] ?? null,
                'zone_id' => $donnees['zone_id'],
            ]);
        });

        return back()->with('success', 'Profil mis à jour.');
    }

    public function changerDisponibilite(Request $request): RedirectResponse
    {
        $profil = $this->profil($request);

        $donnees = $request->validate([
            'disponibilite' => ['required', 'in:disponible,indisponible'],
        ]);

        $profil->update(['disponibilite' => $donnees['disponibilite']]);

        return back()->with(
            'success',
            $donnees['disponibilite'] === 'disponible'
                ? 'Vous êtes maintenant disponible pour les livraisons.'
                : 'Vous êtes maintenant indisponible.'
        );
    }
}
