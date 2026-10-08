<?php

namespace Tests\Feature;

use App\Models\Categorie;
use App\Models\Produit;
use App\Models\Restaurant;
use Database\Seeders\MenusRestaurantsAdzopeSeeder;
use Database\Seeders\RestaurantsAdzopeSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use RuntimeException;
use Tests\TestCase;

class MenusRestaurantsAdzopeSeederTest extends TestCase
{
    use RefreshDatabase;

    public function test_chaque_restaurant_recoit_un_menu_complet_avec_descriptions_et_horaires(): void
    {
        $this->seed(RestaurantsAdzopeSeeder::class);
        $this->seed(MenusRestaurantsAdzopeSeeder::class);

        $restaurants = Restaurant::query()->withCount(['produits', 'categories'])->get();

        $this->assertCount(18, $restaurants);

        foreach ($restaurants as $restaurant) {
            $this->assertGreaterThanOrEqual(12, $restaurant->produits_count, $restaurant->nom);
            $this->assertGreaterThanOrEqual(3, $restaurant->categories_count, $restaurant->nom);
            $this->assertNotEmpty($restaurant->horaires, $restaurant->nom);
        }

        $this->assertSame(0, Produit::query()->whereNull('description')->orWhere('description', 'like', '%démonstration%')->count());
        $this->assertSame(0, Produit::query()->where('nom', 'Boisson')->count());
        $this->assertSame(0, Produit::query()->where('prix', '<=', 0)->count());
    }

    public function test_les_menus_sont_coherents_avec_le_type_de_l_etablissement(): void
    {
        $this->seed(RestaurantsAdzopeSeeder::class);
        $this->seed(MenusRestaurantsAdzopeSeeder::class);

        $boulangerie = Restaurant::query()->where('nom', 'Boulangerie du Château')->firstOrFail();
        $maquis = Restaurant::query()->where('nom', 'Au braisé')->firstOrFail();

        $this->assertDatabaseHas('produits', ['restaurant_id' => $boulangerie->id, 'nom' => 'Sandwich poulet']);
        $this->assertDatabaseMissing('produits', ['restaurant_id' => $boulangerie->id, 'nom' => 'Garba']);
        $this->assertDatabaseHas('produits', ['restaurant_id' => $maquis->id, 'nom' => 'Capitaine braisé']);
        $this->assertSame('06:00-19:00', $boulangerie->horaires);
    }

    public function test_le_seeder_est_rejouable_et_respecte_les_modifications_du_restaurant(): void
    {
        $this->seed(RestaurantsAdzopeSeeder::class);
        $this->seed(MenusRestaurantsAdzopeSeeder::class);

        $produit = Produit::query()->where('nom', 'Poulet braisé')->firstOrFail();
        $produit->update(['prix' => 4999, 'disponible' => false]);
        $restaurant = Restaurant::query()->findOrFail($produit->restaurant_id);
        $restaurant->update(['horaires' => '12:00-15:00']);
        $nombreProduits = Produit::query()->count();
        $nombreCategories = Categorie::query()->count();

        $this->seed(MenusRestaurantsAdzopeSeeder::class);

        $this->assertSame($nombreProduits, Produit::query()->count());
        $this->assertSame($nombreCategories, Categorie::query()->count());
        $this->assertEquals(4999, $produit->fresh()->prix);
        $this->assertFalse($produit->fresh()->disponible);
        $this->assertSame('12:00-15:00', $restaurant->fresh()->horaires);
    }

    public function test_jse_kitchen_perd_ses_noms_generiques_sans_perdre_ses_produits(): void
    {
        $restaurant = Restaurant::factory()->create(['nom' => 'JSE Kitchen', 'horaires' => null]);
        $categorie = Categorie::factory()->create(['restaurant_id' => $restaurant->id, 'nom' => 'Plats']);
        $generique = Produit::factory()->create([
            'restaurant_id' => $restaurant->id,
            'categorie_id' => $categorie->id,
            'nom' => 'Plat de démonstration',
            'description' => 'Produit de test JSE Express.',
            'prix' => 3500,
        ]);

        $this->seed(MenusRestaurantsAdzopeSeeder::class);

        $this->assertSame('Poulet braisé et attiéké', $generique->fresh()->nom);
        $this->assertEquals(3500, $generique->fresh()->prix);
        $this->assertGreaterThanOrEqual(9, $restaurant->produits()->count());
        $this->assertSame('09:00-22:00', $restaurant->fresh()->horaires);
    }

    public function test_le_seeder_refuse_de_s_executer_en_production(): void
    {
        $this->app->detectEnvironment(fn () => 'production');

        $this->expectException(RuntimeException::class);

        $this->app->make(MenusRestaurantsAdzopeSeeder::class)->run();
    }
}
