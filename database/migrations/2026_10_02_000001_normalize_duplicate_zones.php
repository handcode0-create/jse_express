<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        DB::transaction(function (): void {
            $doublons = DB::table('zones')
                ->select('nom')
                ->groupBy('nom')
                ->havingRaw('COUNT(*) > 1')
                ->pluck('nom');

            foreach ($doublons as $nom) {
                $zones = DB::table('zones')
                    ->where('nom', $nom)
                    ->orderByRaw('zone_parent_id IS NULL DESC')
                    ->orderBy('id')
                    ->get();

                $canonique = $zones->first();

                foreach ($zones->skip(1) as $doublon) {
                    DB::table('zones')
                        ->where('zone_parent_id', $doublon->id)
                        ->update(['zone_parent_id' => $canonique->id]);

                    foreach ([
                        'restaurants',
                        'commandes',
                        'livraisons',
                        'profils_livreurs',
                        'adresses_livraison',
                    ] as $table) {
                        DB::table($table)
                            ->where('zone_id', $doublon->id)
                            ->update(['zone_id' => $canonique->id]);
                    }

                    DB::table('zones')
                        ->where('id', $doublon->id)
                        ->delete();
                }
            }
        });

        if (! Schema::hasIndex('zones', ['nom'], 'unique')) {
            Schema::table('zones', function (Blueprint $table): void {
                $table->unique('nom', 'zones_nom_unique');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasIndex('zones', ['nom'], 'unique')) {
            Schema::table('zones', function (Blueprint $table): void {
                $table->dropUnique('zones_nom_unique');
            });
        }
    }
};
