<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('livraisons', function (Blueprint $table) {
            $table->id();
            $table->foreignId('commande_id')->unique()->constrained('commandes');
            $table->foreignId('zone_id')->constrained('zones');
            $table->string('statut', 50);
            $table->string('mode_attribution', 50);
            $table->dateTime('date_attribution')->nullable();
            $table->dateTime('date_prise_en_charge')->nullable();
            $table->dateTime('date_livraison')->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('livraisons');
    }
};
