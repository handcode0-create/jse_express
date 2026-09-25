<?php

namespace App\Http\Controllers;

use App\Models\AttributionLivraison;
use App\Models\ProfilLivreur;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
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
                'date_attribution' => $attribution->date_attribution ? \Carbon\Carbon::parse($attribution->date_attribution)->format('d/m/Y H:i') : null,
            ])->values();

        return Inertia::render('Livreur/TableauDeBord', [
            'livreur' => [
                'id' => $request->user()->id,
                'nom' => trim($request->user()->prenom . ' ' . $request->user()->nom),
                'telephone' => $request->user()->telephone,
                'matricule' => $profil->matricule,
                'disponibilite' => $profil->disponibilite,
                'zone' => $profil->zone ? [
                    'id' => $profil->zone->id,
                    'nom' => $profil->zone->nom,
                ] : null,
            ],
            'livraisons' => $livraisons,
            'statistiques' => [
                'missions_actives' => $livraisons->count(),
                'missions_du_jour' => AttributionLivraison::query()
                    ->where('livreur_id', $request->user()->id)
                    ->whereDate('date_attribution', today())
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

        IlluminateSupportFacadesDB::transaction(function () use ($livraisonModel, $commande, $request) {
            $statutEnLivraison = AppModelsStatutCommande::query()
                ->where('code', 'EN_LIVRAISON')
                ->firstOrFail();

            $livraisonModel->update([
                'statut' => 'en_cours',
                'date_prise_en_charge' => now(),
            ]);

            $commande->update([
                'statut_id' => $statutEnLivraison->id,
            ]);

            AppModelsHistoriqueCommande::create([
                'commande_id' => $commande->id,
                'statut_id' => $statutEnLivraison->id,
                'user_id' => $request->user()->id,
                'commentaire' => 'Commande prise en charge pour livraison.',
                'date_changement' => now(),
            ]);
        });

        return back()->with('success', 'La livraison a été prise en charge.');
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
