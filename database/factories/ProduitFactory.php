<?php

namespace Database\Factories;

use App\Models\Categorie;
use App\Models\Produit;
use App\Models\Restaurant;
use Illuminate\Database\Eloquent\Factories\Factory;

class ProduitFactory extends Factory
{
    protected $model = Produit::class;

    public function definition(): array
    {
        return [
            'restaurant_id' => Restaurant::factory(),
            'categorie_id' => Categorie::factory(),
            'nom' => fake()->words(3, true),
            'description' => fake()->optional()->sentence(),
            'prix' => fake()->randomFloat(2, 500, 15000),
            'image' => null,
            'disponible' => true,
            'statut' => 'actif',
        ];
    }

    public function indisponible(): static
    {
        return $this->state(fn () => [
            'disponible' => false,
        ]);
    }
}