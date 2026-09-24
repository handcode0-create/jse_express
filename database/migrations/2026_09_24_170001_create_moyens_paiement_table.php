<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('moyens_paiement', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('type', 40);
            $table->string('operateur', 50);
            $table->string('libelle', 100)->nullable();
            $table->string('identifiant_masque', 30)->nullable();
            $table->string('reference_externe', 150)->nullable();
            $table->boolean('par_defaut')->default(false);
            $table->string('statut', 30)->default('actif');
            $table->timestamps();

            $table->index(['user_id', 'statut']);
            $table->index(['operateur']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('moyens_paiement');
    }
};
