<?php

namespace Database\Factories;

use App\Models\Commande;
use App\Models\Livraison;
use App\Models\Zone;
use Illuminate\Database\Eloquent\Factories\Factory;

class LivraisonFactory extends Factory
{
    protected $model = Livraison::class;

    public function definition(): array
    {
        return [
            'commande_id' => Commande::factory(),
            'zone_id' => Zone::factory(),
            'statut' => 'en_attente',
            'mode_attribution' => 'automatique',
            'date_attribution' => null,
            'date_prise_en_charge' => null,
            'date_livraison' => null,
        ];
    }
}