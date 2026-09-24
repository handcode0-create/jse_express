<?php

namespace Database\Factories;

use App\Models\Commande;
use App\Models\HistoriqueCommande;
use App\Models\StatutCommande;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class HistoriqueCommandeFactory extends Factory
{
    protected $model = HistoriqueCommande::class;

    public function definition(): array
    {
        return [
            'commande_id' => Commande::factory(),
            'statut_id' => StatutCommande::factory(),
            'user_id' => null,
            'commentaire' => fake()->optional()->sentence(),
            'date_changement' => now(),
        ];
    }
}