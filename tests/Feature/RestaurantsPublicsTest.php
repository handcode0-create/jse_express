<?php

namespace Tests\Feature;

use App\Models\Restaurant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class RestaurantsPublicsTest extends TestCase
{
    use RefreshDatabase;

    public function test_un_visiteur_voit_les_restaurants_actifs_sans_donnees_privees(): void
    {
        $actif = Restaurant::factory()->create(['nom' => 'Maquis Visible', 'statut' => 'actif']);
        Restaurant::factory()->create(['nom' => 'Maquis Fermé', 'statut' => 'inactif']);

        $this->get(route('restaurants.presentation'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Restaurants')
                ->where('estClient', false)
                ->has('restaurants', 1)
                ->where('restaurants.0.id', $actif->id)
                ->where('restaurants.0.nom', 'Maquis Visible')
                ->missing('restaurants.0.telephone')
                ->missing('restaurants.0.email')
                ->missing('restaurants.0.latitude'));
    }

    public function test_un_client_connecte_est_reconnu_sur_la_page(): void
    {
        $client = User::factory()->create(['role' => 'client']);

        $this->actingAs($client)
            ->get(route('restaurants.presentation'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->where('estClient', true));
    }
}
