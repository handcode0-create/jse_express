<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('commandes', function (Blueprint $table) {
            $table->id();
            $table->string('reference', 100)->unique();
            $table->foreignId('user_id')->constrained('users');
            $table->foreignId('restaurant_id')->constrained('restaurants');
            $table->foreignId('zone_id')->constrained('zones');
            $table->foreignId('statut_id')->constrained('statuts_commandes');
            $table->text('adresse_livraison');
            $table->string('telephone_livraison', 30);
            $table->decimal('sous_total', 12, 2);
            $table->decimal('frais_livraison', 12, 2);
            $table->decimal('montant_total', 12, 2);
            $table->dateTime('date_commande');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('commandes');
    }
};
