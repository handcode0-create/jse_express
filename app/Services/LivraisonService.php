<?php

namespace App\Services;

use App\Models\AttributionLivraison;
use App\Models\Commande;
use App\Models\HistoriqueCommande;
use App\Models\Livraison;
use App\Models\ProfilLivreur;
use App\Models\StatutCommande;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class LivraisonService
{
    public function attribuerPremierDisponible(Livraison $livraison, ?int $adminId = null): ?AttributionLivraison
    {
        $livraison->loadMissing('commande.user');

        return DB::transaction(function () use ($livraison, $adminId) {
            $livraison = Livraison::query()
                ->whereKey($livraison->id)
                ->lockForUpdate()
                ->with('commande.user')
                ->firstOrFail();

            $active = AttributionLivraison::query()
                ->where('livraison_id', $livraison->id)
                ->where('statut', 'active')
                ->lockForUpdate()
                ->first();

            if ($active) {
                return $active;
            }

            $candidats = ProfilLivreur::query()
                ->where('zone_id', $livraison->zone_id)
                ->where('disponibilite', 'disponible')
                ->whereHas('user', fn ($query) => $query
                    ->where('role', 'livreur')
                    ->where('statut', 'actif'))
                ->orderBy('user_id')
                ->pluck('user_id');

            $profil = null;

            foreach ($candidats as $profilId) {
                $candidate = ProfilLivreur::query()->whereKey($profilId)->lockForUpdate()->first();

                if (! $candidate || $candidate->disponibilite !== 'disponible') {
                    continue;
                }

                $occupe = AttributionLivraison::query()
                    ->where('livreur_id', $candidate->user_id)
                    ->where('statut', 'active')
                    ->exists();

                if ($occupe) {
                    continue;
                }

                $profil = $candidate;
                break;
            }

            if (! $profil) {
                return null;
            }

            $attribution = AttributionLivraison::create([
                'livraison_id' => $livraison->id,
                'livreur_id' => $profil->user_id,
                'admin_id' => $adminId,
                'type_attribution' => $adminId ? 'administrative' : 'automatique',
                'statut' => 'active',
                'date_attribution' => now(),
                'motif' => $adminId ? 'Réattribution administrative.' : 'Attribution automatique au premier livreur disponible.',
            ]);

            $livraison->update([
                'statut' => 'attribuee',
                'mode_attribution' => $adminId ? 'administrative' : 'automatique',
                'date_attribution' => now(),
            ]);

            $this->genererPin($livraison->commande);

            return $attribution;
        });
    }

    public function reattribuer(Livraison $livraison, int $adminId, int $livreurId, string $motif): AttributionLivraison
    {
        return DB::transaction(function () use ($livraison, $adminId, $livreurId, $motif) {
            $livraison = Livraison::query()->whereKey($livraison->id)->lockForUpdate()->firstOrFail();

            AttributionLivraison::query()
                ->where('livraison_id', $livraison->id)
                ->where('statut', 'active')
                ->update(['statut' => 'terminee']);

            $profil = ProfilLivreur::query()
                ->where('user_id', $livreurId)
                ->where('zone_id', $livraison->zone_id)
                ->where('disponibilite', 'disponible')
                ->whereHas('user', fn ($query) => $query->where('role', 'livreur')->where('statut', 'actif'))
                ->firstOrFail();

            $dejaActif = AttributionLivraison::query()
                ->where('livreur_id', $profil->user_id)
                ->where('statut', 'active')
                ->exists();
            abort_if($dejaActif, 422, 'Ce livreur possède déjà une livraison active.');

            $attribution = AttributionLivraison::create([
                'livraison_id' => $livraison->id,
                'livreur_id' => $profil->user_id,
                'admin_id' => $adminId,
                'type_attribution' => 'administrative',
                'statut' => 'active',
                'date_attribution' => now(),
                'motif' => $motif,
            ]);

            $livraison->update([
                'statut' => 'attribuee',
                'mode_attribution' => 'administrative',
                'date_attribution' => now(),
            ]);

            $this->genererPin($livraison->commande()->firstOrFail());

            return $attribution;
        });
    }

    public function genererPin(Commande $commande): string
    {
        $pin = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        $commande->update([
            'pin_livraison_hash' => Hash::make($pin),
            'pin_livraison_chiffre' => Crypt::encryptString($pin),
            'pin_genere_at' => now(),
            'pin_valide_at' => null,
        ]);

        return $pin;
    }

    public function validerPin(Commande $commande, string $pin): bool
    {
        return $commande->pin_livraison_hash
            && Hash::check($pin, $commande->pin_livraison_hash);
    }

    public function cloturerLivraison(
        Livraison $livraison,
        int $livreurId
    ): void {
        DB::transaction(function () use ($livraison, $livreurId) {
            $livraison = Livraison::query()
                ->whereKey($livraison->id)
                ->lockForUpdate()
                ->with('commande.statutCommande')
                ->firstOrFail();

            $attribution = AttributionLivraison::query()
                ->where('livraison_id', $livraison->id)
                ->where('livreur_id', $livreurId)
                ->where('statut', 'active')
                ->firstOrFail();

            abort_unless(
                $livraison->statut === 'en_cours'
                && $livraison->commande->statutCommande?->code === 'EN_LIVRAISON',
                422,
                'Cette livraison ne peut pas être clôturée.'
            );

            $statutLivree = StatutCommande::query()
                ->where('code', 'LIVREE')
                ->firstOrFail();

            $livraison->update([
                'statut' => 'livree',
                'date_livraison' => now(),
            ]);

            $attribution->update(['statut' => 'terminee']);

            $livraison->commande->update([
                'statut_id' => $statutLivree->id,
                'pin_valide_at' => now(),
            ]);

            HistoriqueCommande::create([
                'commande_id' => $livraison->commande->id,
                'statut_id' => $statutLivree->id,
                'user_id' => $livreurId,
                'commentaire' => 'Livraison validée par PIN.',
                'date_changement' => now(),
            ]);
        });
    }
}