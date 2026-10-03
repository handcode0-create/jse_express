<?php

namespace App\Services;

use App\Models\TarifLivraison;
use Symfony\Component\HttpKernel\Exception\HttpException;

class TarificationLivraisonService
{
    public function fraisPourDistance(float $distanceKm): float
    {
        $tarif = TarifLivraison::query()
            ->where('statut', 'actif')
            ->where('distance_min_km', '<=', $distanceKm)
            ->where('distance_max_km', '>', $distanceKm)
            ->orderBy('distance_min_km')
            ->first();

        if (! $tarif) {
            throw new HttpException(422, 'Adresse hors zone de livraison');
        }

        return (float) $tarif->frais;
    }

    public function tranchesChevauchent(float $min, float $max, ?int $ignoreId = null): bool
    {
        return TarifLivraison::query()
            ->where('statut', 'actif')
            ->when($ignoreId !== null, fn ($q) => $q->where('id', '<>', $ignoreId))
            ->where('distance_min_km', '<', $max)
            ->where('distance_max_km', '>', $min)
            ->exists();
    }
}
