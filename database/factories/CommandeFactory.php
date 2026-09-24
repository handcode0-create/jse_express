<?php

namespace Database\Factories;

use App\Models\Commande;
use App\Models\Restaurant;
use App\Models\StatutCommande;
use App\Models\User;
use App\Models\Zone;
use Illuminate\Database\Eloquent\Factories\Factory;

class CommandeFactory extends Factory
{
    protected $model = Commande::class;

    public function definition(): array
    {
        return [
            'reference' => 'JSE-' . fake()->unique()->numerify('######'),
            'user_id' => User::factory()->client(),
            'restaurant_id' => Restaurant::factory(),
            'zone_id' => Zone::factory(),
            'statut_id' => StatutCommande::factory(),
            'adresse_livraison' => fake()->address(),
            'telephone_livraison' => fake()->numerify('07########'),
            'sous_total' => 0,
            'frais_livraison' => 0,
            'montant_total' => 0,
            'date_commande' => now(),
        ];
    }
}