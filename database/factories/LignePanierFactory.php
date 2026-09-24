<?php

namespace Database\Factories;

use App\Models\LignePanier;
use App\Models\Panier;
use App\Models\Produit;
use Illuminate\Database\Eloquent\Factories\Factory;

class LignePanierFactory extends Factory
{
    protected $model = LignePanier::class;

    public function definition(): array
    {
        $produit = Produit::factory()->create();

        return [
            'panier_id' => Panier::factory(),
            'produit_id' => $produit->id,
            'quantite' => fake()->numberBetween(1, 5),
            'prix_unitaire' => $produit->prix,
        ];
    }
}