<?php

namespace Tests\Feature;

use App\Models\Categorie;
use App\Models\Produit;
use App\Models\Restaurant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class RestaurantMenuVisibilityTest extends TestCase
{
    use RefreshDatabase;

    public function test_le_menu_actif_est_transmis_a_la_page_du_restaurant(): void
    {
        $client = User::factory()->client()->create();
        $restaurant = Restaurant::factory()->create();
        $categorie = Categorie::factory()->create([
            'restaurant_id' => $restaurant->id,
            'nom' => 'Plats',
        ]);
        Produit::factory()->create([
            'restaurant_id' => $restaurant->id,
            'categorie_id' => $categorie->id,
            'nom' => 'Poulet braisé',
        ]);
        Produit::factory()->indisponible()->create([
            'restaurant_id' => $restaurant->id,
            'categorie_id' => $categorie->id,
            'nom' => 'Plat indisponible',
        ]);

        $this->actingAs($client)
            ->get(route('restaurant.detail', $restaurant))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('RestaurantDetail')
                ->has('categories', 1)
                ->where('categories.0.nom', 'Plats')
                ->has('categories.0.produits', 1)
                ->where('categories.0.produits.0.nom', 'Poulet braisé'));
    }
}
