<?php

namespace App\Http\Controllers;

use App\Models\AttributionLivraison;
use App\Models\HistoriqueCommande;
use App\Models\Notification;
use App\Models\ProfilLivreur;
use App\Models\StatutCommande;
use App\Services\LivraisonService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
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
                        $attribution->livraison->commande->user->prenom . ' ' .
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
                'date_attribution' => $attribution->date_attribution ? \Carbon\Carbon::parse($attribution->date_attribution)->format('d/m/Y H:i') : null,
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
                    ? \Carbon\Carbon::parse($attribution->date_attribution)->format('d/m H:i')
                    : null,
                'statut' => $attribution->livraison?->statut,
            ])
            ->filter(fn ($item) => $item['reference'] !== null)
            ->values();

        return Inertia::render('Livreur/TableauDeBord', [
            'livreur' => [
                'id' => $request->user()->id,
                'nom' => trim($request->user()->prenom . ' ' . $request->user()->nom),
                'telephone' => $request->user()->telephone,
                'email' => $request->user()->email,
                'telephone_secondaire' => $profil->telephone_secondaire,
                'matricule' => $profil->matricule,
                'disponibilite' => $profil->disponibilite,
                'zone' => $profil->zone ? [
                    'id' => $profil->zone->id,
                    'nom' => $profil->zone->nom,
                ] : null,
            ],
            'livraisons' => $livraisons,
            'historique' => $historique,
            'notifications' => Notification::query()
                ->where('user_id', $request->user()->id)
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


    public function prendreEnCharge(Request $request, int $livraison): RedirectResponse
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
        abort_unless(
            (int) $livraisonModel->zone_id === (int) $profil->zone_id,
            403
        );

        if ($commande->statutCommande?->code === 'EN_LIVRAISON' && $livraisonModel->statut === 'en_cours') {
            return back()->with('success', 'Cette livraison est déjà prise en charge.');
        }

        abort_unless($commande->statutCommande?->code === 'PRETE', 422);
        abort_unless(in_array($livraisonModel->statut, ['en_attente', 'attribuee'], true), 422);

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

    public function validerPin(Request $request, int $livraison, LivraisonService $livraisonService): RedirectResponse
    {
        $profil = $this->profil($request);

        $attribution = AttributionLivraison::query()
            ->whereKey($livraison)
            ->where('livreur_id', $request->user()->id)
            ->where('statut', 'active')
            ->with(['livraison.commande.statutCommande'])
            ->firstOrFail();

        $livraisonModel = $attribution->livraison;
        $commande = $livraisonModel?->commande;

        abort_unless($livraisonModel && $commande, 404);
        abort_unless((int) $livraisonModel->zone_id === (int) $profil->zone_id, 403);
        abort_unless($livraisonModel->statut === 'en_cours', 422, 'La livraison n’est pas en cours.');
        abort_unless($commande->statutCommande?->code === 'EN_LIVRAISON', 422, 'La commande n’est pas en livraison.');

        $donnees = $request->validate([
            'pin' => ['required', 'digits:6'],
        ]);

        abort_unless(
            $livraisonService->validerPin($commande, $donnees['pin']),
            422,
            'Le PIN de livraison est incorrect.'
        );

        $livraisonService->cloturerLivraison($livraisonModel, $request->user()->id);

        return back()->with('success', 'Livraison validée et commande clôturée.');
    }

    public function modifierProfil(Request $request): RedirectResponse
    {
        $profil = $this->profil($request);

        $donnees = $request->validate([
            'nom' => ['required', 'string', 'max:100'],
            'prenom' => ['nullable', 'string', 'max:100'],
            'telephone' => ['required', 'string', 'max:30'],
            'email' => ['nullable', 'email', 'max:255'],
            'telephone_secondaire' => ['nullable', 'string', 'max:30'],
        ]);

        DB::transaction(function () use ($request, $profil, $donnees) {
            $request->user()->update([
                'nom' => $donnees['nom'],
                'prenom' => $donnees['prenom'] ?? null,
                'telephone' => $donnees['telephone'],
                'email' => $donnees['email'] ?? null,
            ]);

            $profil->update([
                'telephone_secondaire' => $donnees['telephone_secondaire'] ?? null,
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
