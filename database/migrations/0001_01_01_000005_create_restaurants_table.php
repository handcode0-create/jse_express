<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('restaurants', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained('users');
            $table->foreignId('zone_id')->nullable()->constrained('zones')->nullOnDelete();
            $table->string('nom', 150);
            $table->text('description')->nullable();
            $table->string('telephone', 30);
            $table->string('email')->nullable();
            $table->text('adresse');
            $table->text('horaires')->nullable();
            $table->string('statut', 50)->default('actif');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('restaurants');
    }
};
