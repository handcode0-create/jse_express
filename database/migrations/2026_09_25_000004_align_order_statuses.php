<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('statuts_commandes')->updateOrInsert(
            ['code' => 'ANNULEE'],
            ['libelle' => 'Annulée', 'ordre' => 7]
        );

        DB::table('statuts_commandes')
            ->where('code', 'EN_ATTENTE')
            ->update(['libelle' => 'Reçue']);

        DB::table('statuts_commandes')
            ->where('code', 'PRETE')
            ->update(['libelle' => 'Prête / à récupérer']);
    }

    public function down(): void
    {
        DB::table('statuts_commandes')->where('code', 'ANNULEE')->delete();
        DB::table('statuts_commandes')->where('code', 'EN_ATTENTE')->update(['libelle' => 'En attente']);
        DB::table('statuts_commandes')->where('code', 'PRETE')->update(['libelle' => 'Prête']);
    }
};
