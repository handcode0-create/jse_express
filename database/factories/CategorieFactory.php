<?php

namespace Database\Factories;

use App\Models\Categorie;
use App\Models\Restaurant;
use Illuminate\Database\Eloquent\Factories\Factory;

class CategorieFactory extends Factory
{
    protected $model = Categorie::class;

    public function definition(): array
    {
        return [
            'restaurant_id' => Restaurant::factory(),
            'nom' => fake()->unique()->words(2, true),
            'description' => fake()->optional()->sentence(),
            'statut' => 'actif',
        ];
    }
}