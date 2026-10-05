<?php

namespace Tests\Feature;

use App\Models\ProfilLivreur;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Inertia\Testing\AssertableInertia;
use Tests\TestCase;

class AdministrationUtilisateursTest extends TestCase
{
    use RefreshDatabase;

    public function test_un_administrateur_peut_creer_un_client_avec_un_telephone_normalise(): void
    {
        $admin = User::factory()->administrateur()->create();

        $this->actingAs($admin)
            ->post(route('admin.utilisateurs.creer'), [
                'nom' => 'Kouassi',
                'prenom' => 'Awa',
                'telephone' => '07 11 22 33 44',
                'role' => 'client',
                'statut' => 'actif',
                'mot_de_passe' => 'motdepasse123',
            ])
            ->assertRedirect()
            ->assertSessionHas('success', 'Utilisateur créé avec succès.');

        $utilisateur = User::query()->where('telephone', '2250711223344')->firstOrFail();
        $this->assertTrue(Hash::check('motdepasse123', $utilisateur->password));
    }

    public function test_un_administrateur_peut_creer_un_livreur_avec_son_profil(): void
    {
        $admin = User::factory()->administrateur()->create();

        $this->actingAs($admin)
            ->post(route('admin.utilisateurs.creer'), [
                'nom' => 'Traoré',
                'telephone' => '0511223344',
                'role' => 'livreur',
                'statut' => 'actif',
                'mot_de_passe' => 'motdepasse123',
                'livreur_matricule' => 'LIV-ADMIN-1',
                'livreur_disponibilite' => 'disponible',
            ])
            ->assertRedirect()
            ->assertSessionHasNoErrors();

        $livreur = User::query()->where('telephone', '2250511223344')->firstOrFail();
        $this->assertSame('LIV-ADMIN-1', ProfilLivreur::query()->findOrFail($livreur->id)->matricule);
    }

    public function test_un_numero_deja_utilise_sous_un_autre_format_est_refuse(): void
    {
        $admin = User::factory()->administrateur()->create();
        User::factory()->client()->create(['telephone' => '0700000099']);

        $this->actingAs($admin)
            ->post(route('admin.utilisateurs.creer'), [
                'nom' => 'Doublon',
                'telephone' => '+225 07 00 00 00 99',
                'role' => 'client',
                'statut' => 'actif',
                'mot_de_passe' => 'motdepasse123',
            ])
            ->assertSessionHasErrors(['telephone' => 'Ce numéro est déjà utilisé.']);
    }

    public function test_un_administrateur_peut_basculer_le_statut_d_un_client(): void
    {
        $admin = User::factory()->administrateur()->create();
        $client = User::factory()->client()->create(['statut' => 'actif']);

        $this->actingAs($admin)
            ->post(route('admin.clients.statut', $client))
            ->assertRedirect()
            ->assertSessionHas('success', 'Le statut du client a été mis à jour.');

        $this->assertSame('inactif', $client->fresh()->statut);
    }

    public function test_le_statut_client_ne_s_applique_pas_aux_autres_roles(): void
    {
        $admin = User::factory()->administrateur()->create();
        $livreur = User::factory()->livreur()->create();

        $this->actingAs($admin)
            ->post(route('admin.clients.statut', $livreur))
            ->assertNotFound();
    }

    public function test_les_pages_admin_n_exposent_pas_le_mot_de_passe(): void
    {
        $admin = User::factory()->administrateur()->create();

        $this->actingAs($admin)
            ->get(route('admin.clients'))
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->where('utilisateur.id', $admin->id)
                ->missing('utilisateur.password'));
    }
}
