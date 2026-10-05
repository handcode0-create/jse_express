<?php

namespace Tests\Feature;

use App\Models\Produit;
use App\Models\Restaurant;
use Database\Seeders\RestaurantsAdzopeSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use RuntimeException;
use Tests\TestCase;

class RestaurantsAdzopeSeederTest extends TestCase
{
    use RefreshDatabase;

    public function test_le_seeder_cree_des_restaurants_actifs_avec_un_menu(): void
    {
        $this->seed(RestaurantsAdzopeSeeder::class);

        $this->assertSame(18, Restaurant::query()->where('statut', 'actif')->count());
        $this->assertSame(0, Restaurant::query()->doesntHave('produits')->count());
        $this->assertDatabaseHas('restaurants', [
            'nom' => 'Maquis Restaurant Petit Bassam',
            'telephone' => '0707345950',
            'adresse' => 'Près du stade, Adzopé',
        ]);
    }

    public function test_le_seeder_peut_etre_rejoue_sans_creer_de_doublons(): void
    {
        $this->seed(RestaurantsAdzopeSeeder::class);
        $nombreProduits = Produit::query()->count();

        $this->seed(RestaurantsAdzopeSeeder::class);

        $this->assertSame(18, Restaurant::query()->count());
        $this->assertSame($nombreProduits, Produit::query()->count());
    }

    public function test_le_seeder_refuse_de_s_executer_en_production(): void
    {
        $this->app->detectEnvironment(fn () => 'production');

        $this->expectException(RuntimeException::class);

        // Appel direct : en production, db:seed demande une confirmation interactive.
        $this->app->make(RestaurantsAdzopeSeeder::class)->run();
    }
}
