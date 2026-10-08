<?php

namespace Tests\Feature;

use App\Models\ProfilLivreur;
use App\Models\Restaurant;
use App\Models\User;
use App\Services\TelephoneService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TelephoneUniciteTest extends TestCase
{
    use RefreshDatabase;

    public function test_les_numeros_sont_ramenes_a_une_forme_canonique(): void
    {
        $service = app(TelephoneService::class);

        foreach (['0701020304', '07 01 02 03 04', '+225 07 01 02 03 04', '00225 0701020304', '225-07-01-02-03-04'] as $saisie) {
            $this->assertSame('2250701020304', $service->normaliser($saisie), $saisie);
        }
    }

    public function test_un_numero_deja_enregistre_sous_une_autre_forme_est_detecte(): void
    {
        $service = app(TelephoneService::class);
        User::factory()->create(['telephone' => '0701020304']);
        User::factory()->create(['telephone' => '07 05 06 07 08']);

        $this->assertTrue($service->dejaUtilise('+225 07 01 02 03 04'));
        $this->assertTrue($service->dejaUtilise('2250705060708'));
        $this->assertFalse($service->dejaUtilise('0709999999'));
    }

    public function test_un_compte_peut_conserver_son_propre_numero_sous_une_autre_forme(): void
    {
        $service = app(TelephoneService::class);
        $user = User::factory()->create(['telephone' => '0701020304']);

        $this->assertFalse($service->dejaUtilise('2250701020304', $user->id));
        $this->assertTrue($service->dejaUtilise('2250701020304'));
    }

    public function test_le_profil_client_refuse_le_numero_d_un_autre_compte_ecrit_autrement(): void
    {
        User::factory()->client()->create(['telephone' => '2250701020304']);
        $client = User::factory()->client()->create(['telephone' => '0709990001']);

        $this->actingAs($client)
            ->patch('/profil', ['nom' => $client->nom, 'telephone' => '07 01 02 03 04'])
            ->assertSessionHasErrors('telephone');
    }

    public function test_le_profil_client_enregistre_le_numero_sous_sa_forme_canonique(): void
    {
        $client = User::factory()->client()->create(['telephone' => '0709990001']);

        $this->actingAs($client)
            ->patch('/profil', ['nom' => $client->nom, 'telephone' => '07 05 06 07 08', 'email' => $client->email])
            ->assertSessionHasNoErrors();

        $this->assertSame('2250705060708', $client->fresh()->telephone);
    }

    public function test_le_compte_restaurant_refuse_le_numero_d_un_autre_compte_ecrit_autrement(): void
    {
        User::factory()->client()->create(['telephone' => '2250701020304']);
        $restaurant = Restaurant::factory()->create();

        $this->actingAs($restaurant->user)
            ->patch(route('restaurant.compte.modifier'), ['prenom' => 'Koffi', 'nom' => 'Test', 'telephone' => '0701020304', 'email' => $restaurant->user->email])
            ->assertSessionHasErrors('telephone');
    }

    public function test_le_profil_livreur_refuse_le_numero_d_un_autre_compte_ecrit_autrement(): void
    {
        User::factory()->client()->create(['telephone' => '2250701020304']);
        $profil = ProfilLivreur::factory()->create();

        $this->actingAs($profil->user)
            ->patch(route('livreur.profil.modifier'), ['nom' => 'Yao', 'telephone' => '+225 0701020304', 'zone_id' => $profil->zone_id])
            ->assertSessionHasErrors('telephone');
    }

    public function test_l_administrateur_ne_peut_pas_creer_un_doublon_ecrit_autrement(): void
    {
        User::factory()->client()->create(['telephone' => '2250701020304']);
        $admin = User::factory()->administrateur()->create();

        $this->actingAs($admin)
            ->post(route('admin.utilisateurs.creer'), [
                'nom' => 'Test', 'prenom' => 'Doublon', 'telephone' => '07 01 02 03 04',
                'role' => 'client', 'statut' => 'actif', 'mot_de_passe' => 'motdepasse123',
            ])
            ->assertSessionHasErrors('telephone');
    }

    public function test_l_administrateur_enregistre_les_nouveaux_numeros_sous_leur_forme_canonique(): void
    {
        $admin = User::factory()->administrateur()->create();

        $this->actingAs($admin)
            ->post(route('admin.utilisateurs.creer'), [
                'nom' => 'Test', 'prenom' => 'Canonique', 'telephone' => '07 11 22 33 44',
                'role' => 'client', 'statut' => 'actif', 'mot_de_passe' => 'motdepasse123',
            ])
            ->assertSessionHasNoErrors();

        $this->assertDatabaseHas('users', ['prenom' => 'Canonique', 'telephone' => '2250711223344']);
    }

    public function test_la_connexion_fonctionne_apres_un_changement_de_numero_dans_un_autre_format(): void
    {
        $client = User::factory()->client()->create(['telephone' => '0709990001']);

        $this->actingAs($client)
            ->patch('/profil', ['nom' => $client->nom, 'telephone' => '07 05 06 07 08', 'email' => $client->email])
            ->assertSessionHasNoErrors();
        auth()->logout();

        $this->post('/connexion', ['telephone' => '0705060708', 'mot_de_passe' => 'password', 'consentement' => '1'])
            ->assertRedirect(route('accueil.client'));
    }
}
