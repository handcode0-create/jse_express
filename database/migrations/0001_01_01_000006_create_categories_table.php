<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('categories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('restaurant_id')->constrained('restaurants');
            $table->string('nom', 150);
            $table->text('description')->nullable();
            $table->string('statut', 50)->default('actif');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('categories');
    }
};
