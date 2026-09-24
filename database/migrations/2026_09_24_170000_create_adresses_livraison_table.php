<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('adresses_livraison', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('zone_id')->nullable()->constrained('zones')->nullOnDelete();
            $table->string('libelle', 80);
            $table->string('adresse', 255);
            $table->string('complement', 255)->nullable();
            $table->string('telephone', 30)->nullable();
            $table->boolean('par_defaut')->default(false);
            $table->string('statut', 30)->default('actif');
            $table->timestamps();

            $table->index(['user_id', 'statut']);
            $table->index(['zone_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('adresses_livraison');
    }
};
