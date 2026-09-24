<?php

namespace Database\Factories;

use App\Models\AttributionLivraison;
use App\Models\Livraison;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class AttributionLivraisonFactory extends Factory
{
    protected $model = AttributionLivraison::class;

    public function definition(): array
    {
        return [
            'livraison_id' => Livraison::factory(),
            'livreur_id' => User::factory()->livreur(),
            'admin_id' => null,
            'type_attribution' => 'automatique',
            'statut' => 'active',
            'date_attribution' => now(),
            'motif' => null,
        ];
    }
}