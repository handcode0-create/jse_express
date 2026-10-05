<?php

namespace Tests\Feature;

use App\Models\ProfilLivreur;
use App\Models\Restaurant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class MotDePasseTest extends TestCase
{
    use RefreshDatabase;

    /** @return array<string, array{0: callable(): User}> */
    public static function utilisateursParRole(): array
    {
        return [
            'client' => [fn () => User::factory()->client()->create()],
            'restaurant' => [fn () => Restaurant::factory()->create()->user],
            'livreur' => [fn () => ProfilLivreur::factory()->create()->user],
            'administrateur' => [fn () => User::factory()->administrateur()->create()],
        ];
    }

    /**
     * @return array<string, string>
     */
    private function donnees(array $surcharge = []): array
    {
        return array_merge([
            'mot_de_passe_actuel' => 'password',
            'nouveau_mot_de_passe' => 'NouveauMotDePasse1',
            'nouveau_mot_de_passe_confirmation' => 'NouveauMotDePasse1',
        ], $surcharge);
    }

    #[DataProvider('utilisateursParRole')]
    public function test_chaque_role_peut_changer_son_mot_de_passe(callable $creer): void
    {
        $user = $creer();

        $this->actingAs($user)
            ->patch(route('compte.mot-de-passe'), $this->donnees())
            ->assertSessionHasNoErrors()
            ->assertSessionHas('success', 'Votre mot de passe a été modifié.');

        $this->assertTrue(Hash::check('NouveauMotDePasse1', $user->fresh()->password));
        $this->assertFalse(Hash::check('password', $user->fresh()->password));
    }

    public function test_le_mot_de_passe_actuel_est_obligatoire_et_verifie(): void
    {
        $user = User::factory()->client()->create();

        $this->actingAs($user)
            ->patch(route('compte.mot-de-passe'), $this->donnees(['mot_de_passe_actuel' => 'mauvais-mot-de-passe']))
            ->assertSessionHasErrors('mot_de_passe_actuel');
        $this->actingAs($user)
            ->patch(route('compte.mot-de-passe'), $this->donnees(['mot_de_passe_actuel' => '']))
            ->assertSessionHasErrors('mot_de_passe_actuel');

        $this->assertTrue(Hash::check('password', $user->fresh()->password));
    }

    public function test_le_nouveau_mot_de_passe_doit_etre_assez_long_confirme_et_different(): void
    {
        $user = User::factory()->client()->create();

        $this->actingAs($user)
            ->patch(route('compte.mot-de-passe'), $this->donnees(['nouveau_mot_de_passe' => 'court', 'nouveau_mot_de_passe_confirmation' => 'court']))
            ->assertSessionHasErrors('nouveau_mot_de_passe');
        $this->actingAs($user)
            ->patch(route('compte.mot-de-passe'), $this->donnees(['nouveau_mot_de_passe_confirmation' => 'Autre12345678']))
            ->assertSessionHasErrors('nouveau_mot_de_passe');
        $this->actingAs($user)
            ->patch(route('compte.mot-de-passe'), $this->donnees(['nouveau_mot_de_passe' => 'password', 'nouveau_mot_de_passe_confirmation' => 'password']))
            ->assertSessionHasErrors('nouveau_mot_de_passe');

        $this->assertTrue(Hash::check('password', $user->fresh()->password));
    }

    public function test_un_visiteur_non_connecte_est_renvoye_vers_la_connexion(): void
    {
        $this->patch(route('compte.mot-de-passe'), $this->donnees())->assertRedirect();

        $this->assertGuest();
    }

    public function test_les_tentatives_sont_limitees(): void
    {
        $user = User::factory()->client()->create();
        $this->actingAs($user);

        for ($i = 0; $i < 5; $i++) {
            $this->patch(route('compte.mot-de-passe'), $this->donnees(['mot_de_passe_actuel' => 'mauvais']))->assertSessionHasErrors('mot_de_passe_actuel');
        }

        $this->patch(route('compte.mot-de-passe'), $this->donnees())->assertStatus(429);
        $this->assertTrue(Hash::check('password', $user->fresh()->password));
    }

    public function test_apres_le_changement_l_ancien_mot_de_passe_ne_permet_plus_de_se_connecter(): void
    {
        $user = User::factory()->client()->create(['telephone' => '0701112233']);

        $this->actingAs($user)->patch(route('compte.mot-de-passe'), $this->donnees())->assertSessionHasNoErrors();
        auth()->logout();

        $this->post('/connexion', ['telephone' => '0701112233', 'mot_de_passe' => 'password', 'consentement' => '1'])->assertSessionHasErrors('telephone');
        $this->post('/connexion', ['telephone' => '0701112233', 'mot_de_passe' => 'NouveauMotDePasse1', 'consentement' => '1'])->assertRedirect();
        $this->assertAuthenticatedAs($user);
    }
}
