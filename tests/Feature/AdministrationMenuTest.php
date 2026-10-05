<?php

namespace Tests\Feature;

use App\Models\Categorie;
use App\Models\Produit;
use App\Models\Restaurant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia;
use Tests\TestCase;

class AdministrationMenuTest extends TestCase
{
    use RefreshDatabase;

    public function test_un_administrateur_voit_le_menu_d_un_restaurant(): void
    {
        $admin = User::factory()->administrateur()->create();
        $restaurant = Restaurant::factory()->create();
        $categorie = Categorie::factory()->create(['restaurant_id' => $restaurant->id]);
        $produit = Produit::factory()->create([
            'restaurant_id' => $restaurant->id,
            'categorie_id' => $categorie->id,
        ]);
        Produit::factory()->create();

        $response = $this->actingAs($admin)->get(route('admin.restaurants.menu', $restaurant));

        $response->assertOk();
        $response->assertInertia(fn (AssertableInertia $page) => $page
            ->component('Admin/RestaurantMenu')
            ->where('restaurant.id', $restaurant->id)
            ->has('categories', 1)
            ->has('produits', 1)
            ->where('produits.0.id', $produit->id)
            ->missing('utilisateur.password'));
    }

    public function test_un_administrateur_peut_creer_une_categorie(): void
    {
        $admin = User::factory()->administrateur()->create();
        $restaurant = Restaurant::factory()->create();

        $response = $this->actingAs($admin)->post(route('admin.restaurants.categories.creer', $restaurant), [
            'nom' => 'Grillades',
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('success', 'Catégorie créée.');
        $this->assertDatabaseHas('categories', [
            'restaurant_id' => $restaurant->id,
            'nom' => 'Grillades',
            'statut' => 'actif',
        ]);
    }

    public function test_un_administrateur_peut_ajouter_un_produit_au_menu(): void
    {
        $admin = User::factory()->administrateur()->create();
        $restaurant = Restaurant::factory()->create();
        $categorie = Categorie::factory()->create(['restaurant_id' => $restaurant->id]);

        $response = $this->actingAs($admin)->post(route('admin.restaurants.produits.creer', $restaurant), [
            'nom' => 'Poulet braisé',
            'prix' => 4500,
            'categorie_id' => $categorie->id,
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('success', 'Produit ajouté au menu.');
        $this->assertDatabaseHas('produits', [
            'restaurant_id' => $restaurant->id,
            'categorie_id' => $categorie->id,
            'nom' => 'Poulet braisé',
            'prix' => 4500,
            'disponible' => true,
            'statut' => 'actif',
        ]);
    }

    public function test_un_produit_ne_peut_pas_utiliser_la_categorie_d_un_autre_restaurant(): void
    {
        $admin = User::factory()->administrateur()->create();
        $restaurant = Restaurant::factory()->create();
        $categorieEtrangere = Categorie::factory()->create();

        $response = $this->actingAs($admin)->post(route('admin.restaurants.produits.creer', $restaurant), [
            'nom' => 'Poulet braisé',
            'prix' => 4500,
            'categorie_id' => $categorieEtrangere->id,
        ]);

        $response->assertStatus(422);
        $this->assertDatabaseMissing('produits', ['restaurant_id' => $restaurant->id]);
    }

    public function test_le_prix_d_un_produit_est_obligatoire(): void
    {
        $admin = User::factory()->administrateur()->create();
        $restaurant = Restaurant::factory()->create();

        $response = $this->actingAs($admin)->post(route('admin.restaurants.produits.creer', $restaurant), [
            'nom' => 'Poulet braisé',
        ]);

        $response->assertSessionHasErrors('prix');
        $this->assertDatabaseMissing('produits', ['restaurant_id' => $restaurant->id]);
    }

    public function test_un_administrateur_peut_modifier_un_produit(): void
    {
        $admin = User::factory()->administrateur()->create();
        $produit = Produit::factory()->create(['prix' => 1000]);

        $response = $this->actingAs($admin)->patch(
            route('admin.restaurants.produits.modifier', [$produit->restaurant_id, $produit]),
            ['nom' => 'Attiéké poisson', 'prix' => 2000]
        );

        $response->assertRedirect();
        $response->assertSessionHas('success', 'Produit mis à jour.');

        $produit->refresh();

        $this->assertSame('Attiéké poisson', $produit->nom);
        $this->assertEquals(2000, $produit->prix);
    }

    public function test_un_produit_ne_se_modifie_pas_depuis_un_autre_restaurant(): void
    {
        $admin = User::factory()->administrateur()->create();
        $produit = Produit::factory()->create(['nom' => 'Nom initial']);
        $autreRestaurant = Restaurant::factory()->create();

        $response = $this->actingAs($admin)->patch(
            route('admin.restaurants.produits.modifier', [$autreRestaurant, $produit]),
            ['nom' => 'Nom modifié', 'prix' => 2000]
        );

        $response->assertNotFound();
        $this->assertSame('Nom initial', $produit->fresh()->nom);
    }

    public function test_un_administrateur_peut_basculer_la_disponibilite_d_un_produit(): void
    {
        $admin = User::factory()->administrateur()->create();
        $produit = Produit::factory()->create(['disponible' => true]);

        $response = $this->actingAs($admin)->patch(
            route('admin.restaurants.produits.disponibilite', [$produit->restaurant_id, $produit])
        );

        $response->assertRedirect();
        $response->assertSessionHas('success', 'Produit marqué comme indisponible.');
        $this->assertFalse($produit->fresh()->disponible);
    }

    public function test_un_restaurateur_ne_peut_pas_gerer_un_menu_par_l_administration(): void
    {
        $restaurant = Restaurant::factory()->create();
        $restaurateur = $restaurant->user;

        $this->actingAs($restaurateur)
            ->get(route('admin.restaurants.menu', $restaurant))
            ->assertForbidden();

        $this->actingAs($restaurateur)
            ->post(route('admin.restaurants.produits.creer', $restaurant), ['nom' => 'Intrus', 'prix' => 100])
            ->assertForbidden();

        $this->assertDatabaseMissing('produits', ['nom' => 'Intrus']);
    }
}
