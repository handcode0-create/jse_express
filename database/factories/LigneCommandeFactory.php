<?php

namespace Database\Factories;

use App\Models\Commande;
use App\Models\LigneCommande;
use App\Models\Produit;
use Illuminate\Database\Eloquent\Factories\Factory;

class LigneCommandeFactory extends Factory
{
    protected $model = LigneCommande::class;

    public function definition(): array
    {
        $produit = Produit::factory()->create();
        $quantite = fake()->numberBetween(1, 5);

        return [
            'commande_id' => Commande::factory(),
            'produit_id' => $produit->id,
            'nom_produit_snapshot' => $produit->nom,
            'quantite' => $quantite,
            'prix_unitaire' => $produit->prix,
            'total_ligne' => $produit->prix * $quantite,
        ];
    }
}