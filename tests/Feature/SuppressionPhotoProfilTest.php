<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\File;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class SuppressionPhotoProfilTest extends TestCase
{
    use RefreshDatabase;

    private string $dossierPublic;

    protected function setUp(): void
    {
        parent::setUp();

        $this->dossierPublic = storage_path('framework/testing/public-suppression-photo');
        $this->app->usePublicPath($this->dossierPublic);
    }

    protected function tearDown(): void
    {
        File::deleteDirectory($this->dossierPublic);

        parent::tearDown();
    }

    /** @return array<string, array{0: string}> */
    public static function roles(): array
    {
        return ['client' => ['client'], 'restaurant' => ['restaurant'], 'livreur' => ['livreur'], 'administrateur' => ['administrateur']];
    }

    #[DataProvider('roles')]
    public function test_la_photo_de_profil_est_retiree_pour_chaque_role(string $role): void
    {
        $user = User::factory()->create(['role' => $role, 'photo_profil' => '/uploads/profils/'.$role.'.png']);
        File::ensureDirectoryExists(public_path('uploads/profils'));
        File::put(public_path('uploads/profils/'.$role.'.png'), 'x');

        $this->actingAs($user)->delete(route('profil.photo.supprimer'))->assertSessionHas('success', 'Photo de profil retirée.');

        $this->assertNull($user->fresh()->photo_profil);
        $this->assertFileDoesNotExist(public_path('uploads/profils/'.$role.'.png'));
    }

    public function test_retirer_la_photo_sans_photo_ne_provoque_pas_d_erreur(): void
    {
        $user = User::factory()->client()->create(['photo_profil' => null]);

        $this->actingAs($user)->delete(route('profil.photo.supprimer'))->assertSessionHasNoErrors();
    }

    public function test_un_visiteur_non_connecte_ne_peut_pas_retirer_une_photo(): void
    {
        $this->delete(route('profil.photo.supprimer'))->assertRedirect();
    }
}
