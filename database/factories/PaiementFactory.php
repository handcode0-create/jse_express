<?php

namespace Database\Factories;

use App\Models\Commande;
use App\Models\Paiement;
use Illuminate\Database\Eloquent\Factories\Factory;

class PaiementFactory extends Factory
{
    protected $model = Paiement::class;

    public function definition(): array
    {
        return [
            'commande_id' => Commande::factory(),
            'moyen' => 'mobile_money',
            'reference_transaction' => fake()->unique()->bothify('TX-########??'),
            'montant' => fake()->randomFloat(2, 1000, 50000),
            'statut' => 'en_attente',
            'date_paiement' => now(),
        ];
    }
}