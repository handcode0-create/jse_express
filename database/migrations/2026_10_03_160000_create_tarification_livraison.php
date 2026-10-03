<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('adresses_livraison', function (Blueprint $table) {
            if (! Schema::hasColumn('adresses_livraison', 'latitude')) $table->decimal('latitude', 10, 7)->nullable()->after('telephone');
            if (! Schema::hasColumn('adresses_livraison', 'longitude')) $table->decimal('longitude', 10, 7)->nullable()->after('latitude');
        });

        Schema::table('commandes', function (Blueprint $table) {
            if (! Schema::hasColumn('commandes', 'latitude_livraison')) $table->decimal('latitude_livraison', 10, 7)->nullable()->after('telephone_livraison');
            if (! Schema::hasColumn('commandes', 'longitude_livraison')) $table->decimal('longitude_livraison', 10, 7)->nullable()->after('latitude_livraison');
            if (! Schema::hasColumn('commandes', 'distance_km')) $table->decimal('distance_km', 8, 2)->nullable()->after('longitude_livraison');
        });

        if (Schema::hasColumn('zones', 'frais_livraison')) {
            Schema::table('zones', function (Blueprint $table) { $table->dropColumn('frais_livraison'); });
        }

        if (! Schema::hasTable('tarifs_livraison')) {
            Schema::create('tarifs_livraison', function (Blueprint $table) {
                $table->id();
                $table->decimal('distance_min_km', 8, 2);
                $table->decimal('distance_max_km', 8, 2);
                $table->decimal('frais', 12, 2);
                $table->enum('statut', ['actif', 'inactif'])->default('actif');
                $table->timestamps();
            });
        }

        if (DB::table('tarifs_livraison')->count() === 0) {
            DB::table('tarifs_livraison')->insert([
                ['distance_min_km' => 0, 'distance_max_km' => 2, 'frais' => 500, 'statut' => 'actif', 'created_at' => now(), 'updated_at' => now()],
                ['distance_min_km' => 2, 'distance_max_km' => 4, 'frais' => 800, 'statut' => 'actif', 'created_at' => now(), 'updated_at' => now()],
                ['distance_min_km' => 4, 'distance_max_km' => 6, 'frais' => 1000, 'statut' => 'actif', 'created_at' => now(), 'updated_at' => now()],
            ]);
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('tarifs_livraison');
        Schema::table('commandes', function (Blueprint $table) {
            if (Schema::hasColumn('commandes', 'distance_km')) $table->dropColumn('distance_km');
            if (Schema::hasColumn('commandes', 'longitude_livraison')) $table->dropColumn('longitude_livraison');
            if (Schema::hasColumn('commandes', 'latitude_livraison')) $table->dropColumn('latitude_livraison');
        });
        Schema::table('adresses_livraison', function (Blueprint $table) {
            if (Schema::hasColumn('adresses_livraison', 'longitude')) $table->dropColumn('longitude');
            if (Schema::hasColumn('adresses_livraison', 'latitude')) $table->dropColumn('latitude');
        });
    }
};