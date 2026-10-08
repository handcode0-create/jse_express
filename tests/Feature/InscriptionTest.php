<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Zone;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class InscriptionTest extends TestCase
{
    use RefreshDatabase;

    public function test_l_inscription_client_cree_un_utilisateur_client_sans_profil_secondaire(): void
    {
        $this->post('/inscription', $this->donneesBase(['role' => 'client']))
            ->assertRedirect('/authentification')
            ->assertSessionHas('success', 'Votre compte a été créé avec succès. Vous pouvez maintenant vous connecter.');

        $this->assertDatabaseHas('users', [
            'telephone' => '2250700000001',
            'role' => 'client',
            'statut' => 'actif',
        ]);

        $this->assertDatabaseCount('restaurants', 0);
        $this->assertDatabaseCount('profils_livreurs', 0);
        $this->assertTrue(Hash::check('motdepasse123', User::where('telephone', '2250700000001')->first()->password));
    }

    public function test_l_inscription_restaurant_cree_un_compte_et_un_restaurant_en_attente_de_validation(): void
    {
        $zone = Zone::create([
            'nom' => 'Centre',
            'description' => null,
            'zone_parent_id' => null,
            'statut' => 'actif',
        ]);

        $this->post('/inscription', $this->donneesBase([
            'role' => 'restaurant',
            'telephone' => '225070000002',
            'restaurant_nom' => 'Chez Test',
            'restaurant_telephone' => '0700000012',
            'restaurant_adresse' => 'Adzopé Centre',
            'restaurant_description' => 'Cuisine locale',
            'restaurant_zone_id' => $zone->id,
        ]))
            ->assertRedirect('/authentification')
            ->assertSessionHas('success', 'Votre compte a été créé. Il sera activé après validation par l’administration.');

        $user = User::where('telephone', '225070000002')->firstOrFail();

        $this->assertSame('restaurant', $user->role);
        $this->assertSame('inactif', $user->statut);
        $this->assertDatabaseHas('restaurants', [
            'user_id' => $user->id,
            'nom' => 'Chez Test',
            'zone_id' => $zone->id,
            'statut' => 'inactif',
        ]);
    }

    public function test_l_inscription_livreur_cree_l_utilisateur_et_son_profil_livreur(): void
    {
        $zone = Zone::create([
            'nom' => 'Nord',
            'description' => null,
            'zone_parent_id' => null,
            'statut' => 'actif',
        ]);

        $this->post('/inscription', $this->donneesBase([
            'role' => 'livreur',
            'telephone' => '225070000003',
            'livreur_matricule' => 'MAT-TEST-001',
            'livreur_zone_id' => $zone->id,
            'livreur_disponibilite' => 'disponible',
            'livreur_telephone_secondaire' => '0500000003',
        ]))->assertRedirect('/authentification');

        $user = User::where('telephone', '225070000003')->firstOrFail();

        $this->assertSame('livreur', $user->role);
        $this->assertSame('inactif', $user->statut);
        $this->assertDatabaseHas('profils_livreurs', [
            'user_id' => $user->id,
            'matricule' => 'MAT-TEST-001',
            'zone_id' => $zone->id,
            'disponibilite' => 'disponible',
            'telephone_secondaire' => '0500000003',
        ]);
    }

    public function test_un_compte_en_attente_de_validation_ne_peut_pas_se_connecter(): void
    {
        $livreur = User::factory()->livreur()->create(['statut' => 'inactif']);

        $this->post('/connexion', [
            'telephone' => $livreur->telephone,
            'mot_de_passe' => 'password',
            'consentement' => '1',
        ])->assertSessionHasErrors([
            'telephone' => 'Votre compte n’est pas actif. Il doit être validé par l’administration avant de pouvoir vous connecter.',
        ]);

        $this->assertGuest();
    }

    public function test_un_compte_inactif_ne_revele_pas_son_etat_avec_un_mauvais_mot_de_passe(): void
    {
        $livreur = User::factory()->livreur()->create(['statut' => 'inactif']);

        $this->post('/connexion', [
            'telephone' => $livreur->telephone,
            'mot_de_passe' => 'mauvais-mot-de-passe',
            'consentement' => '1',
        ])->assertSessionHasErrors([
            'telephone' => 'Le numéro de téléphone ou le mot de passe est incorrect.',
        ]);

        $this->assertGuest();
    }

    public function test_la_connexion_accepte_un_numero_ivoirien_formate_differemment(): void
    {
        $this->post('/inscription', $this->donneesBase(['telephone' => '07 00 00 00 04']))
            ->assertRedirect('/authentification');

        $this->post('/connexion', [
            'telephone' => '+225 07 00 00 00 04',
            'mot_de_passe' => 'motdepasse123',
            'consentement' => '1',
        ])->assertRedirect(route('accueil.client'));

        $this->assertAuthenticated();
    }

    public function test_l_inscription_administrateur_est_refusee(): void
    {
        $this->post('/inscription', $this->donneesBase(['role' => 'administrateur']))
            ->assertSessionHasErrors('role');

        $this->assertDatabaseCount('users', 0);
    }

    public function test_l_inscription_client_accepte_les_champs_de_profil_vides_envoyes_par_le_formulaire(): void
    {
        $this->post('/inscription', $this->donneesBase(['role' => 'client'] + $this->champsDeProfilVides()))
            ->assertSessionHasNoErrors()
            ->assertRedirect('/authentification');

        $this->assertDatabaseHas('users', ['telephone' => '2250700000001', 'role' => 'client', 'statut' => 'actif']);
        $this->assertDatabaseCount('restaurants', 0);
        $this->assertDatabaseCount('profils_livreurs', 0);
    }

    public function test_l_inscription_restaurant_accepte_les_champs_livreur_vides_envoyes_par_le_formulaire(): void
    {
        $donnees = [
            'role' => 'restaurant',
            'restaurant_nom' => 'Chez Test',
            'restaurant_telephone' => '0700000002',
            'restaurant_adresse' => 'Centre-ville, Adzopé',
        ];

        $this->post('/inscription', $this->donneesBase($donnees + $this->champsDeProfilVides()))
            ->assertSessionHasNoErrors()
            ->assertRedirect('/authentification');

        $this->assertDatabaseHas('restaurants', ['nom' => 'Chez Test', 'statut' => 'inactif']);
        $this->assertDatabaseCount('profils_livreurs', 0);
    }

    public function test_l_inscription_livreur_accepte_les_champs_restaurant_vides_envoyes_par_le_formulaire(): void
    {
        $donnees = [
            'role' => 'livreur',
            'livreur_matricule' => 'LIV-TEST-01',
            'livreur_disponibilite' => 'disponible',
        ];

        $this->post('/inscription', $this->donneesBase($donnees + $this->champsDeProfilVides()))
            ->assertSessionHasNoErrors()
            ->assertRedirect('/authentification');

        $this->assertDatabaseHas('profils_livreurs', ['matricule' => 'LIV-TEST-01']);
        $this->assertDatabaseCount('restaurants', 0);
    }

    public function test_l_inscription_restaurant_sans_nom_reste_refusee(): void
    {
        $this->post('/inscription', $this->donneesBase(['role' => 'restaurant'] + $this->champsDeProfilVides()))
            ->assertSessionHasErrors(['restaurant_nom', 'restaurant_telephone', 'restaurant_adresse']);

        $this->assertDatabaseCount('users', 0);
    }

    /**
     * Champs de profil tels que le formulaire les envoie lorsqu'ils ne sont pas renseignés.
     *
     * @return array<string, string>
     */
    private function champsDeProfilVides(): array
    {
        return [
            'restaurant_nom' => '',
            'restaurant_description' => '',
            'restaurant_telephone' => '',
            'restaurant_email' => '',
            'restaurant_adresse' => '',
            'restaurant_zone_id' => '',
            'livreur_matricule' => '',
            'livreur_zone_id' => '',
            'livreur_disponibilite' => 'indisponible',
            'livreur_telephone_secondaire' => '',
        ];
    }

    private function donneesBase(array $overrides = []): array
    {
        return array_merge([
            'role' => 'client',
            'nom' => 'Test',
            'prenom' => 'Utilisateur',
            'telephone' => '0700000001',
            'email' => 'test@example.com',
            'mot_de_passe' => 'motdepasse123',
            'confirmation_mot_de_passe' => 'motdepasse123',
            'consentement' => '1',
        ], $overrides);
    }
}
