<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ligne_panier', function (Blueprint $table) {
            $table->id();
            $table->foreignId('panier_id')->constrained('paniers');
            $table->foreignId('produit_id')->constrained('produits');
            $table->unsignedInteger('quantite');
            $table->decimal('prix_unitaire', 12, 2);
            $table->unique(['panier_id', 'produit_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ligne_panier');
    }
};
