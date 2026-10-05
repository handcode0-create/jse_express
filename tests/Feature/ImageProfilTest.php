<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\File;
use Tests\TestCase;

class ImageProfilTest extends TestCase
{
    use RefreshDatabase;

    private const IMAGE_PNG = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';

    private string $dossierPublic;

    protected function setUp(): void
    {
        parent::setUp();

        $this->dossierPublic = storage_path('framework/testing/public');
        $this->app->usePublicPath($this->dossierPublic);
    }

    protected function tearDown(): void
    {
        File::deleteDirectory($this->dossierPublic);

        parent::tearDown();
    }

    public function test_la_photo_de_profil_est_enregistree_avec_l_extension_de_son_contenu(): void
    {
        $client = User::factory()->client()->create();

        $response = $this->actingAs($client)->post(route('profil.photo.modifier'), [
            'photo' => $this->fichierEnvoye('photo.html', base64_decode(self::IMAGE_PNG)),
        ]);

        $response->assertRedirect(route('profil'));

        $chemin = $client->fresh()->photo_profil;

        $this->assertStringStartsWith('/uploads/profils/', $chemin);
        $this->assertStringEndsWith('.png', $chemin);
        $this->assertFileExists($this->dossierPublic.$chemin);
    }

    public function test_la_couverture_de_profil_est_enregistree_avec_l_extension_de_son_contenu(): void
    {
        $client = User::factory()->client()->create();

        $response = $this->actingAs($client)->post(route('profil.couverture.modifier'), [
            'couverture' => $this->fichierEnvoye('couverture.html', base64_decode(self::IMAGE_PNG)),
        ]);

        $response->assertRedirect();

        $chemin = $client->fresh()->couverture_profil;

        $this->assertStringStartsWith('/uploads/couvertures/', $chemin);
        $this->assertStringEndsWith('.png', $chemin);
        $this->assertFileExists($this->dossierPublic.$chemin);
    }

    public function test_un_fichier_qui_n_est_pas_une_image_est_refuse(): void
    {
        $client = User::factory()->client()->create();

        $response = $this->actingAs($client)->post(route('profil.photo.modifier'), [
            'photo' => $this->fichierEnvoye('photo.png', '<html><body><script>alert(1)</script></body></html>'),
        ]);

        $response->assertSessionHasErrors('photo');
        $this->assertNull($client->fresh()->photo_profil);
    }

    /**
     * Les fichiers de UploadedFile::fake() déduisent leur type du nom ; un vrai
     * fichier est nécessaire pour que le type soit lu dans le contenu.
     */
    private function fichierEnvoye(string $nom, string $contenu): UploadedFile
    {
        $chemin = $this->dossierPublic.'/'.uniqid('envoi_', true);

        File::ensureDirectoryExists($this->dossierPublic);
        File::put($chemin, $contenu);

        return new UploadedFile($chemin, $nom, null, null, true);
    }
}
