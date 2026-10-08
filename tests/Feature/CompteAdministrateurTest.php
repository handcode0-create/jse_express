<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class CompteAdministrateurTest extends TestCase
{
    use RefreshDatabase;

    public function test_l_administrateur_voit_son_compte(): void
    {
        // Noms fixes : un nom Faker avec apostrophe fausse le décodage JSON des assertions Inertia.
        $admin = User::factory()->administrateur()->create(['prenom' => 'Awa', 'nom' => 'Kone']);

        $this->actingAs($admin)
            ->get(route('admin.compte'))
            ->assertInertia(fn (Assert $page) => $page
                ->component('Admin/Compte')
                ->where('utilisateur.id', $admin->id)
                ->where('utilisateur.email', $admin->email)
                ->missing('utilisateur.password'));
    }

    public function test_seul_un_administrateur_accede_a_cette_page(): void
    {
        $this->actingAs(User::factory()->client()->create())->get(route('admin.compte'))->assertForbidden();
        $this->actingAs(User::factory()->client()->create())->patch(route('admin.compte.modifier'), [])->assertForbidden();
        auth()->logout();
        $this->get(route('admin.compte'))->assertRedirect();
    }

    public function test_l_administrateur_modifie_ses_informations_sans_toucher_a_son_role(): void
    {
        $admin = User::factory()->administrateur()->create();

        $this->actingAs($admin)
            ->patch(route('admin.compte.modifier'), [
                'prenom' => 'Awa', 'nom' => 'Koné', 'telephone' => '07 11 22 33 44', 'email' => 'awa@example.com',
                'role' => 'client', 'statut' => 'inactif',
            ])
            ->assertSessionHasNoErrors()
            ->assertSessionHas('success');

        $admin->refresh();
        $this->assertSame('Koné', $admin->nom);
        $this->assertSame('2250711223344', $admin->telephone);
        $this->assertSame('administrateur', $admin->role);
        $this->assertSame('actif', $admin->statut);
    }

    public function test_les_informations_invalides_ou_deja_utilisees_sont_refusees(): void
    {
        User::factory()->client()->create(['telephone' => '2250701020304', 'email' => 'pris@example.com']);
        $admin = User::factory()->administrateur()->create();

        $this->actingAs($admin)
            ->patch(route('admin.compte.modifier'), ['prenom' => 'Awa', 'nom' => '', 'telephone' => '0701020304', 'email' => 'pris@example.com'])
            ->assertSessionHasErrors(['nom', 'telephone', 'email']);
    }
}
