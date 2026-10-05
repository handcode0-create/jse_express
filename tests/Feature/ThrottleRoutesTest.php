<?php

namespace Tests\Feature;

use App\Models\AttributionLivraison;
use App\Models\Commande;
use App\Models\Livraison;
use App\Models\ProfilLivreur;
use App\Models\Restaurant;
use App\Models\StatutCommande;
use App\Models\User;
use App\Models\Zone;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Tests\TestCase;

class ThrottleRoutesTest extends TestCase
{
    use RefreshDatabase;

    public function test_connexion_is_throttled_after_five_attempts_per_minute(): void
    {
        RateLimiter::clear('auth:connexion:2250700000000');

        for ($i = 0; $i < 5; $i++) {
            $this->post(route('connexion'), [
                'telephone' => '0700000000',
                'mot_de_passe' => 'incorrect',
                'consentement' => '1',
            ])->assertSessionHasErrors('telephone');
        }

        $this->post(route('connexion'), [
            'telephone' => '0700000000',
            'mot_de_passe' => 'incorrect',
            'consentement' => '1',
        ])->assertStatus(429);
    }

    public function test_inscription_is_throttled_after_five_attempts_per_minute(): void
    {
        $key = 'auth:inscription:'.$this->app['request']->ip();
        RateLimiter::clear($key);

        for ($i = 0; $i < 5; $i++) {
            $this->post(route('inscription.creer'), [])->assertSessionHasErrors();
        }

        $this->post(route('inscription.creer'), [])->assertStatus(429);
    }

    public function test_livreur_pin_validation_is_throttled_per_user_and_delivery(): void
    {
        $zone = Zone::create(['nom' => 'Zone test', 'statut' => 'actif']);
        $livreur = User::factory()->livreur()->create();
        ProfilLivreur::create([
            'user_id' => $livreur->id,
            'matricule' => 'LIV-TEST-001',
            'zone_id' => $zone->id,
            'disponibilite' => 'disponible',
        ]);
        $client = User::factory()->client()->create();
        $restaurantUser = User::factory()->restaurant()->create();
        $restaurant = Restaurant::create([
            'user_id' => $restaurantUser->id,
            'zone_id' => $zone->id,
            'nom' => 'Restaurant test',
            'telephone' => '0700000001',
            'adresse' => 'Adresse test',
            'statut' => 'actif',
        ]);
        StatutCommande::updateOrCreate(['code' => 'EN_LIVRAISON'], ['libelle' => 'En livraison', 'ordre' => 5]);
        $statut = StatutCommande::where('code', 'EN_LIVRAISON')->firstOrFail();
        $commande = Commande::create([
            'reference' => 'CMD-THROTTLE-001',
            'user_id' => $client->id,
            'restaurant_id' => $restaurant->id,
            'zone_id' => $zone->id,
            'statut_id' => $statut->id,
            'adresse_livraison' => 'Adresse client',
            'telephone_livraison' => $client->telephone,
            'sous_total' => 1000,
            'frais_livraison' => 500,
            'montant_total' => 1500,
            'pin_livraison_hash' => Hash::make('123456'),
            'date_commande' => now(),
        ]);
        $livraison = Livraison::create([
            'commande_id' => $commande->id,
            'zone_id' => $zone->id,
            'statut' => 'en_cours',
            'mode_attribution' => 'automatique',
            'date_attribution' => now(),
            'date_prise_en_charge' => now(),
        ]);
        AttributionLivraison::create([
            'livraison_id' => $livraison->id,
            'livreur_id' => $livreur->id,
            'type_attribution' => 'automatique',
            'statut' => 'active',
            'date_attribution' => now(),
        ]);

        $this->actingAs($livreur);

        for ($i = 0; $i < 5; $i++) {
            $this->post(route('livreur.livraisons.valider-pin', $livraison), [
                'pin' => '000000',
            ])->assertStatus(422);
        }

        $this->post(route('livreur.livraisons.valider-pin', $livraison), [
            'pin' => '000000',
        ])->assertStatus(429);
    }
}
