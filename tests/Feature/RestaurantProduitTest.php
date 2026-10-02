<?php

namespace Tests\Feature;

use App\Models\Categorie;
use App\Models\Produit;
use App\Models\Restaurant;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RestaurantProduitTest extends TestCase
{
    use RefreshDatabase;

    public function test_un_restaurant_peut_modifier_son_produit(): void
    {
        $restaurant = Restaurant::factory()->create();
        $categorie = Categorie::factory()->create([
            'restaurant_id' => $restaurant->id,
        ]);
        $produit = Produit::factory()->create([
            'restaurant_id' => $restaurant->id,
            'categorie_id' => $categorie->id,
            'nom' => 'Ancien plat',
            'prix' => 2500,
        ]);

        $response = $this->actingAs($restaurant->user)->patch(
            route('restaurant.produits.modifier', $produit),
            [
                'categorie_id' => $categorie->id,
                'nom' => 'Nouveau plat',
                'description' => 'Description mise à jour',
                'prix' => 3000,
                'image' => 'https://example.com/plat.jpg',
            ]
        );

        $response->assertRedirect();
        $response->assertSessionHas('success', 'Produit mis à jour.');

        $this->assertDatabaseHas('produits', [
            'id' => $produit->id,
            'restaurant_id' => $restaurant->id,
            'categorie_id' => $categorie->id,
            'nom' => 'Nouveau plat',
            'prix' => 3000,
            'image' => 'https://example.com/plat.jpg',
        ]);
    }

    public function test_un_restaurant_ne_peut_pas_modifier_le_produit_d_un_autre_restaurant(): void
    {
        $restaurant = Restaurant::factory()->create();
        $autreProduit = Produit::factory()->create();

        $response = $this->actingAs($restaurant->user)->patch(
            route('restaurant.produits.modifier', $autreProduit),
            [
                'categorie_id' => null,
                'nom' => 'Tentative',
                'description' => null,
                'prix' => 5000,
                'image' => null,
            ]
        );

        $response->assertNotFound();

        $this->assertDatabaseHas('produits', [
            'id' => $autreProduit->id,
            'nom' => $autreProduit->nom,
        ]);
    }
}
