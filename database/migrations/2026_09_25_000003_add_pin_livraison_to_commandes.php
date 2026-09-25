<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('commandes', function (Blueprint $table) {
            $table->string('pin_livraison_hash', 255)->nullable()->after('montant_total');
            $table->text('pin_livraison_chiffre')->nullable()->after('pin_livraison_hash');
            $table->dateTime('pin_genere_at')->nullable()->after('pin_livraison_chiffre');
            $table->dateTime('pin_valide_at')->nullable()->after('pin_genere_at');
        });
    }

    public function down(): void
    {
        Schema::table('commandes', function (Blueprint $table) {
            $table->dropColumn([
                'pin_livraison_hash',
                'pin_livraison_chiffre',
                'pin_genere_at',
                'pin_valide_at',
            ]);
        });
    }
};