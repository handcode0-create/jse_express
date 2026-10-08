<?php

namespace Tests\Feature;

use App\Models\Restaurant;
use App\Models\User;
use App\Models\Zone;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Inertia\Testing\AssertableInertia;
use Tests\TestCase;

class AdministrationUtilisateurTest extends TestCase
{
    use RefreshDatabase;

    public function test_un_administrateur_peut_creer_un_utilisateur(): void
    {
        $admin = User::factory()->administrateur()->create();

        $response = $this->actingAs($admin)->post(route('admin.utilisateurs.creer'), [
            'nom' => 'Kouassi',
            'prenom' => 'Awa',
            'telephone' => '0700000001',
            'email' => 'awa@example.com',
            'role' => 'client',
            'statut' => 'actif',
            'mot_de_passe' => 'motdepasse123',
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('success', 'Utilisateur créé avec succès.');

        // Le numéro est enregistré sous sa forme canonique (préfixe pays 225).
        $utilisateur = User::query()->where('telephone', '2250700000001')->firstOrFail();

        $this->assertSame('client', $utilisateur->role);
        $this->assertTrue(Hash::check('motdepasse123', $utilisateur->password));
    }

    public function test_un_administrateur_peut_modifier_un_utilisateur_sans_changer_son_mot_de_passe(): void
    {
        $admin = User::factory()->administrateur()->create();
        $client = User::factory()->client()->create();
        $ancienMotDePasse = $client->password;

        $response = $this->actingAs($admin)->patch(route('admin.utilisateurs.modifier', $client), [
            'nom' => 'Nouveau nom',
            'prenom' => $client->prenom,
            'telephone' => $client->telephone,
            'email' => $client->email,
            'role' => 'client',
            'statut' => 'inactif',
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('success', 'Utilisateur mis à jour.');

        $client->refresh();

        $this->assertSame('Nouveau nom', $client->nom);
        $this->assertSame('inactif', $client->statut);
        $this->assertSame($ancienMotDePasse, $client->password);
    }

    public function test_la_modification_refuse_un_telephone_deja_utilise(): void
    {
        $admin = User::factory()->administrateur()->create();
        $client = User::factory()->client()->create();
        $autre = User::factory()->client()->create();

        $response = $this->actingAs($admin)->patch(route('admin.utilisateurs.modifier', $client), [
            'nom' => $client->nom,
            'telephone' => $autre->telephone,
            'role' => 'client',
            'statut' => 'actif',
        ]);

        $response->assertSessionHasErrors('telephone');
        $this->assertNotSame($autre->telephone, $client->fresh()->telephone);
    }

    public function test_le_passage_au_role_livreur_cree_le_profil_livreur(): void
    {
        $admin = User::factory()->administrateur()->create();
        $client = User::factory()->client()->create();
        $zone = Zone::factory()->create();

        $response = $this->actingAs($admin)->patch(route('admin.utilisateurs.role', $client), [
            'role' => 'livreur',
            'livreur_matricule' => 'JSE-LIV-9001',
            'livreur_zone_id' => $zone->id,
            'livreur_disponibilite' => 'disponible',
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('success', 'Rôle utilisateur mis à jour.');

        $this->assertSame('livreur', $client->fresh()->role);
        $this->assertDatabaseHas('profils_livreurs', [
            'user_id' => $client->id,
            'matricule' => 'JSE-LIV-9001',
            'zone_id' => $zone->id,
        ]);
    }

    public function test_l_activation_d_un_compte_restaurant_active_aussi_son_restaurant(): void
    {
        $admin = User::factory()->administrateur()->create();
        $restaurateur = User::factory()->restaurant()->create(['statut' => 'inactif']);
        $restaurant = Restaurant::factory()->create([
            'user_id' => $restaurateur->id,
            'statut' => 'inactif',
        ]);

        $response = $this->actingAs($admin)->patch(route('admin.utilisateurs.statut', $restaurateur), [
            'statut' => 'actif',
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('success', 'Statut utilisateur mis à jour.');

        $this->assertSame('actif', $restaurateur->fresh()->statut);
        $this->assertSame('actif', $restaurant->fresh()->statut);
    }

    public function test_la_desactivation_d_un_compte_restaurant_retire_son_restaurant_du_catalogue(): void
    {
        $admin = User::factory()->administrateur()->create();
        $restaurateur = User::factory()->restaurant()->create();
        $restaurant = Restaurant::factory()->create([
            'user_id' => $restaurateur->id,
            'statut' => 'actif',
        ]);

        $this->actingAs($admin)->patch(route('admin.utilisateurs.statut', $restaurateur), [
            'statut' => 'inactif',
        ])->assertRedirect();

        $this->assertSame('inactif', $restaurant->fresh()->statut);
    }

    public function test_un_client_ne_peut_pas_creer_un_utilisateur(): void
    {
        $client = User::factory()->client()->create();

        $response = $this->actingAs($client)->post(route('admin.utilisateurs.creer'), [
            'nom' => 'Intrus',
            'telephone' => '0700000002',
            'role' => 'administrateur',
            'statut' => 'actif',
            'mot_de_passe' => 'motdepasse123',
        ]);

        $response->assertForbidden();
        $this->assertDatabaseMissing('users', ['telephone' => '0700000002']);
    }

    public function test_les_pages_d_administration_n_exposent_pas_le_mot_de_passe(): void
    {
        $admin = User::factory()->administrateur()->create();

        $response = $this->actingAs($admin)->get(route('admin.commandes'));

        $response->assertOk();
        $response->assertInertia(fn (AssertableInertia $page) => $page
            ->where('utilisateur.id', $admin->id)
            ->missing('utilisateur.password'));
    }
}
