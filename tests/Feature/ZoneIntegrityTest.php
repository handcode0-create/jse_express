<?php

namespace Tests\Feature;

use App\Models\Zone;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class ZoneIntegrityTest extends TestCase
{
    use RefreshDatabase;

    public function test_le_seeder_des_zones_est_idempotent(): void
    {
        Artisan::call('db:seed', [
            '--class' => 'Database\\Seeders\\JseExpressSeeder',
            '--no-interaction' => true,
        ]);

        Artisan::call('db:seed', [
            '--class' => 'Database\\Seeders\\JseExpressSeeder',
            '--no-interaction' => true,
        ]);

        $this->assertDatabaseCount('zones', 3);
        $this->assertSame(1, Zone::query()->where('nom', 'Centre')->count());
        $this->assertSame(1, Zone::query()->where('nom', 'Nord')->count());
        $this->assertSame(1, Zone::query()->where('nom', 'Sud')->count());
    }

    public function test_la_migration_fusionne_les_doublons_et_reattribue_les_relations(): void
    {
        Schema::table('zones', function (Blueprint $table): void {
            $table->dropUnique('zones_nom_unique');
        });

        $centre = Zone::query()->create([
            'nom' => 'Centre',
            'description' => 'Zone canonique',
            'zone_parent_id' => null,
            'statut' => 'actif',
        ]);

        $doublon = Zone::query()->create([
            'nom' => 'Centre',
            'description' => 'Ancienne copie',
            'zone_parent_id' => null,
            'statut' => 'actif',
        ]);

        $enfant = Zone::query()->create([
            'nom' => 'Secteur test',
            'description' => null,
            'zone_parent_id' => $doublon->id,
            'statut' => 'actif',
        ]);

        DB::table('users')->insert([
            'nom' => 'Test',
            'prenom' => 'Restaurant',
            'telephone' => '0700000091',
            'email' => 'restaurant-zone-test@jse.test',
            'password' => bcrypt('password'),
            'role' => 'restaurant',
            'statut' => 'actif',
        ]);
        $restaurantUserId = (int) DB::getPdo()->lastInsertId();

        DB::table('restaurants')->insert([
            'user_id' => $restaurantUserId,
            'zone_id' => $doublon->id,
            'nom' => 'Restaurant test zone',
            'description' => null,
            'telephone' => '0700000091',
            'email' => null,
            'adresse' => 'Centre',
            'horaires' => null,
            'statut' => 'actif',
        ]);

        DB::table('users')->insert([
            'nom' => 'Test',
            'prenom' => 'Livreur',
            'telephone' => '0700000092',
            'email' => 'livreur-zone-test@jse.test',
            'password' => bcrypt('password'),
            'role' => 'livreur',
            'statut' => 'actif',
        ]);
        $livreurUserId = (int) DB::getPdo()->lastInsertId();

        DB::table('profils_livreurs')->insert([
            'user_id' => $livreurUserId,
            'matricule' => 'JSE-TEST-ZONE',
            'zone_id' => $doublon->id,
            'disponibilite' => 'disponible',
            'telephone_secondaire' => null,
        ]);

        DB::table('adresses_livraison')->insert([
            'user_id' => $livreurUserId,
            'zone_id' => $doublon->id,
            'libelle' => 'Test',
            'adresse' => 'Centre',
            'complement' => null,
            'telephone' => '0700000092',
            'par_defaut' => true,
            'statut' => 'actif',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $migration = require database_path('migrations/2026_10_02_000001_normalize_duplicate_zones.php');
        $migration->up();

        $this->assertDatabaseCount('zones', 2);
        $this->assertDatabaseHas('zones', ['id' => $centre->id, 'nom' => 'Centre']);
        $this->assertDatabaseHas('zones', ['id' => $enfant->id, 'zone_parent_id' => $centre->id]);
        $this->assertDatabaseMissing('zones', ['id' => $doublon->id]);

        $this->assertDatabaseHas('restaurants', [
            'zone_id' => $centre->id,
            'nom' => 'Restaurant test zone',
        ]);
        $this->assertDatabaseHas('profils_livreurs', [
            'zone_id' => $centre->id,
            'user_id' => $livreurUserId,
        ]);
        $this->assertDatabaseHas('adresses_livraison', [
            'zone_id' => $centre->id,
            'user_id' => $livreurUserId,
        ]);

        $this->assertTrue(Schema::hasIndex('zones', ['nom'], 'unique'));
    }
}
