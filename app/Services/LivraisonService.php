<?php

namespace App\Services;

use App\Models\AttributionLivraison;
use App\Models\Commande;
use App\Models\HistoriqueCommande;
use App\Models\Livraison;
use App\Models\ProfilLivreur;
use App\Models\StatutCommande;
use App\Models\Zone;
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

            if (! $livraison->commande->pin_livraison_hash || ! $livraison->commande->pin_livraison_chiffre) {
                $this->genererPin($livraison->commande);
                $livraison->commande->refresh();
            }

            $zone = Zone::query()->find($livraison->zone_id);
            $zoneIds = collect([$livraison->zone_id]);
            if ($zone?->zone_parent_id) {
                $zoneIds->push($zone->zone_parent_id);
                $zoneIds = $zoneIds->merge(Zone::query()->where('zone_parent_id', $zone->zone_parent_id)->pluck('id'));
            }
            $zoneIds = $zoneIds->filter()->unique()->values();

            $candidats = ProfilLivreur::query()
                ->whereIn('zone_id', $zoneIds)
                ->where('disponibilite', 'disponible')
                ->whereHas('user', fn ($query) => $query->where('role', 'livreur')->where('statut', 'actif'))
                ->orderBy('user_id')
                ->get(['user_id', 'zone_id']);

            $activeCounts = AttributionLivraison::query()
                ->whereIn('livreur_id', $candidats->pluck('user_id'))
                ->where('statut', 'active')
                ->selectRaw('livreur_id, COUNT(*) as total')
                ->groupBy('livreur_id')
                ->pluck('total', 'livreur_id');

            $profil = null;
            foreach ($candidats->sortBy(fn ($candidate) => [$activeCounts[$candidate->user_id] ?? 0, $candidate->user_id]) as $profilCandidat) {
                $candidate = ProfilLivreur::query()->whereKey($profilCandidat->user_id)->lockForUpdate()->first();
                if (! $candidate || $candidate->disponibilite !== 'disponible') continue;
                $occupe = AttributionLivraison::query()->where('livreur_id', $candidate->user_id)->where('statut', 'active')->exists();
                if ($occupe) continue;
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
                ->lockForUpdate()
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

            $commande = $livraison->commande()->firstOrFail();
            if (! $commande->pin_livraison_hash || ! $commande->pin_livraison_chiffre) {
                $this->genererPin($commande);
            }

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
        $pin = trim($pin);

        if (! preg_match('/^\d{6}$/', $pin)) {
            return false;
        }

        return (bool) ($commande->pin_livraison_hash && Hash::check($pin, $commande->pin_livraison_hash));
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