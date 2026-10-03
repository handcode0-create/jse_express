<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('tarifs_livraison')) {
            return;
        }

        DB::table('tarifs_livraison')
            ->where('distance_min_km', 6)
            ->where('distance_max_km', 30)
            ->exists()
            || DB::table('tarifs_livraison')->insert([
                'distance_min_km' => 6,
                'distance_max_km' => 30,
                'frais' => 2000,
                'statut' => 'actif',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
    }

    public function down(): void
    {
        if (! Schema::hasTable('tarifs_livraison')) {
            return;
        }

        DB::table('tarifs_livraison')
            ->where('distance_min_km', 6)
            ->where('distance_max_km', 30)
            ->where('frais', 2000)
            ->delete();
    }
};
