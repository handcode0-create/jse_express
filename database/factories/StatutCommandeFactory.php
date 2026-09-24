<?php

namespace Database\Factories;

use App\Models\StatutCommande;
use Illuminate\Database\Eloquent\Factories\Factory;

class StatutCommandeFactory extends Factory
{
    protected $model = StatutCommande::class;

    public function definition(): array
    {
        return [
            'code' => fake()->unique()->lexify('STATUT_????'),
            'libelle' => fake()->sentence(2),
            'ordre' => fake()->numberBetween(1, 99),
        ];
    }
}