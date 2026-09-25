<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('produits', function (Blueprint $table) {
            $table->json('options')->nullable()->after('image');
        });

        Schema::table('ligne_panier', function (Blueprint $table) {
            $table->json('options')->nullable()->after('prix_unitaire');
        });

        Schema::table('ligne_commandes', function (Blueprint $table) {
            $table->json('options')->nullable()->after('prix_unitaire');
        });
    }

    public function down(): void
    {
        Schema::table('produits', function (Blueprint $table) {
            $table->dropColumn('options');
        });

        Schema::table('ligne_panier', function (Blueprint $table) {
            $table->dropColumn('options');
        });

        Schema::table('ligne_commandes', function (Blueprint $table) {
            $table->dropColumn('options');
        });
    }
};
