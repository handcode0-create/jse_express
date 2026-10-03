<?php

namespace App\Services;

class DistanceService
{
    public function calculer(float $latitudeRestaurant, float $longitudeRestaurant, float $latitudeClient, float $longitudeClient): float
    {
        $rayonTerreKm = 6371.0;
        $lat1 = deg2rad($latitudeRestaurant);
        $lat2 = deg2rad($latitudeClient);
        $deltaLat = deg2rad($latitudeClient - $latitudeRestaurant);
        $deltaLon = deg2rad($longitudeClient - $longitudeRestaurant);
        $a = sin($deltaLat / 2) ** 2 + cos($lat1) * cos($lat2) * sin($deltaLon / 2) ** 2;
        return round(2 * $rayonTerreKm * asin(min(1, sqrt($a))), 2);
    }
}
