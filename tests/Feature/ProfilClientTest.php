<?php

namespace Tests\Feature;

use App\Models\AdresseLivraison;
use App\Models\User;
use App\Models\Zone;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProfilClientTest extends TestCase
{
    use RefreshDatabase;

    public function test_profil_is_reserved_for_clients(): void
    {
        $restaurant = User::factory()->restaurant()->create();

        $this->actingAs($restaurant)->get('/profil')->assertForbidden();
    }

    public function test_client_cannot_modify_or_delete_another_clients_address(): void
    {
        $owner = User::factory()->client()->create();
        $otherClient = User::factory()->client()->create();
        $adresse = AdresseLivraison::create([
            'user_id' => $owner->id,
            'libelle' => 'Maison',
            'adresse' => 'Adresse test',
            'telephone' => $owner->telephone,
            'par_defaut' => true,
            'statut' => 'actif',
        ]);

        $this->actingAs($otherClient)
            ->patch('/profil/adresses/'.$adresse->id, [
                'libelle' => 'Autre',
                'adresse' => 'Nouvelle adresse',
                'telephone' => $otherClient->telephone,
                'par_defaut' => true,
            ])
            ->assertForbidden();

        $this->actingAs($otherClient)
            ->delete('/profil/adresses/'.$adresse->id)
            ->assertForbidden();
    }

    public function test_client_phone_must_be_unique_but_the_current_phone_is_allowed(): void
    {
        $client = User::factory()->client()->create([
            'telephone' => '0700000001',
        ]);
        $otherClient = User::factory()->client()->create([
            'telephone' => '0700000002',
        ]);

        $this->actingAs($client)
            ->patch('/profil', [
                'nom' => $client->nom,
                'prenom' => $client->prenom,
                'telephone' => $otherClient->telephone,
                'email' => $client->email,
            ])
            ->assertSessionHasErrors([
                'telephone' => 'Ce numéro est déjà utilisé.',
            ]);

        $this->actingAs($client)
            ->patch('/profil', [
                'nom' => $client->nom,
                'prenom' => $client->prenom,
                'telephone' => $client->telephone,
                'email' => $client->email,
            ])
            ->assertSessionDoesntHaveErrors('telephone');
    }

    public function test_client_can_update_owned_address(): void
    {
        $client = User::factory()->client()->create();
        $zone = Zone::create([
            'nom' => 'Zone profil test',
            'statut' => 'actif',
        ]);
        $adresse = AdresseLivraison::create([
            'user_id' => $client->id,
            'zone_id' => $zone->id,
            'libelle' => 'Maison',
            'adresse' => 'Ancienne adresse',
            'telephone' => $client->telephone,
            'par_defaut' => true,
            'statut' => 'actif',
        ]);

        $this->actingAs($client)
            ->patch('/profil/adresses/'.$adresse->id, [
                'libelle' => 'Travail',
                'adresse' => 'Nouvelle adresse',
                'complement' => 'Repère',
                'telephone' => $client->telephone,
                'zone_id' => $zone->id,
                'par_defaut' => true,
            ])
            ->assertSessionHasNoErrors()
            ->assertSessionHas('success', 'Adresse mise à jour.');

        $this->assertDatabaseHas('adresses_livraison', [
            'id' => $adresse->id,
            'user_id' => $client->id,
            'libelle' => 'Travail',
            'adresse' => 'Nouvelle adresse',
            'complement' => 'Repère',
            'zone_id' => $zone->id,
        ]);
    }
}
