<?php

namespace Tests\Feature;

use App\Models\ProfilLivreur;
use App\Models\User;
use Database\Seeders\LivreursAdzopeSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use RuntimeException;
use Tests\TestCase;

class LivreursAdzopeSeederTest extends TestCase
{
    use RefreshDatabase;

    public function test_le_seeder_cree_des_livreurs_actifs_repartis_par_zone_avec_un_matricule_unique(): void
    {
        $this->seed(LivreursAdzopeSeeder::class);

        $livreurs = User::query()->where('role', 'livreur')->get();

        $this->assertCount(4, $livreurs);
        $this->assertSame(4, $livreurs->where('statut', 'actif')->count());
        $this->assertSame(4, ProfilLivreur::query()->distinct('matricule')->count('matricule'));
        $this->assertSame(3, ProfilLivreur::query()->distinct('zone_id')->count('zone_id'));
        $this->assertSame(1, ProfilLivreur::query()->where('disponibilite', 'indisponible')->count());
    }

    public function test_le_seeder_est_rejouable_sans_creer_de_doublons(): void
    {
        $this->seed(LivreursAdzopeSeeder::class);
        $this->seed(LivreursAdzopeSeeder::class);

        $this->assertSame(4, User::query()->where('role', 'livreur')->count());
        $this->assertSame(4, ProfilLivreur::query()->count());
    }

    public function test_le_seeder_refuse_de_s_executer_en_production(): void
    {
        $this->app->detectEnvironment(fn () => 'production');

        $this->expectException(RuntimeException::class);

        $this->app->make(LivreursAdzopeSeeder::class)->run();
    }
}
