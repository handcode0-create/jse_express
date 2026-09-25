<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('ligne_panier', function (Blueprint $table) {
            // Le nouvel index doit exister avant de retirer l'ancien index unique :
            // MySQL peut utiliser l'index composite existant pour une contrainte FK.
            $table->index(['panier_id', 'produit_id'], 'ligne_panier_panier_id_produit_id_index');
        });

        Schema::table('ligne_panier', function (Blueprint $table) {
            $table->dropUnique('ligne_panier_panier_id_produit_id_unique');
        });
    }

    public function down(): void
    {
        Schema::table('ligne_panier', function (Blueprint $table) {
            $table->unique(['panier_id', 'produit_id'], 'ligne_panier_panier_id_produit_id_unique');
        });

        Schema::table('ligne_panier', function (Blueprint $table) {
            $table->dropIndex('ligne_panier_panier_id_produit_id_index');
        });
    }
};
