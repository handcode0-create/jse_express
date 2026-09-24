<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('profils_livreurs', function (Blueprint $table) {
            $table->foreignId('user_id')->primary()->constrained('users');
            $table->string('matricule', 100)->unique();
            $table->foreignId('zone_id')->nullable()->constrained('zones')->nullOnDelete();
            $table->string('disponibilite', 50);
            $table->string('telephone_secondaire', 30)->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('profils_livreurs');
    }
};
