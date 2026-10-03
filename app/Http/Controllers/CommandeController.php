<?php

namespace App\Http\Controllers;

use App\Models\AttributionLivraison;
use App\Models\Commande;
use App\Models\HistoriqueCommande;
use App\Models\Livraison;
use App\Models\ProfilLivreur;
use App\Models\StatutCommande;
use App\Policies\CommandePolicy;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CommandeController extends Controller
{
    public function annuler(Request $request, Commande $commande): RedirectResponse
    {
        Gate::authorize('annuler', $commande);

        DB::transaction(function () use ($request, $commande) {
            $commande = Commande::query()
                ->whereKey($commande->id)
                ->lockForUpdate()
                ->with('statutCommande')
                ->firstOrFail();

            if ($commande->statutCommande?->code === 'ANNULEE') {
                return;
            }

            abort_unless(
                app(CommandePolicy::class)->peutEtreAnnulee($commande),
                422,
                'Cette commande ne peut plus être annulée.'
            );

            $statut = StatutCommande::query()
                ->where('code', 'ANNULEE')
                ->firstOrFail();

            $livraison = Livraison::query()
                ->where('commande_id', $commande->id)
                ->lockForUpdate()
                ->first();

            if ($livraison) {
                $attributionsActives = AttributionLivraison::query()
                    ->where('livraison_id', $livraison->id)
                    ->where('statut', 'active')
                    ->lockForUpdate()
                    ->get();

                foreach ($attributionsActives as $attribution) {
                    $attribution->update(['statut' => 'terminee']);

                    $profil = ProfilLivreur::query()
                        ->where('user_id', $attribution->livreur_id)
                        ->lockForUpdate()
                        ->first();

                    if ($profil) {
                        $aUneAutreLivraisonActive = AttributionLivraison::query()
                            ->where('livreur_id', $attribution->livreur_id)
                            ->where('statut', 'active')
                            ->where('livraison_id', '!=', $livraison->id)
                            ->exists();

                        if (! $aUneAutreLivraisonActive) {
                            $profil->update(['disponibilite' => 'disponible']);
                        }
                    }
                }

                $livraison->update([
                    'statut' => 'annulee',
                ]);
            }

            $commande->update([
                'statut_id' => $statut->id,
                'pin_livraison_hash' => null,
                'pin_livraison_chiffre' => null,
                'pin_valide_at' => now(),
            ]);

            HistoriqueCommande::create([
                'commande_id' => $commande->id,
                'statut_id' => $statut->id,
                'user_id' => $request->user()->id,
                'commentaire' => 'Commande annulée par le client.',
                'date_changement' => now(),
            ]);
        });

        return back()->with('success', 'La commande a été annulée.');
    }
}
