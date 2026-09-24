<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('produits', function (Blueprint $table) {
            $table->id();
            $table->foreignId('restaurant_id')->constrained('restaurants');
            $table->foreignId('categorie_id')->nullable()->constrained('categories')->nullOnDelete();
            $table->string('nom', 150);
            $table->text('description')->nullable();
            $table->decimal('prix', 12, 2);
            $table->string('image')->nullable();
            $table->boolean('disponible')->default(true);
            $table->string('statut', 50)->default('actif');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('produits');
    }
};
