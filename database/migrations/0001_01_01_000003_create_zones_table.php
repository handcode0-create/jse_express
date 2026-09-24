<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('zones', function (Blueprint $table) {
            $table->id();
            $table->string('nom', 150);
            $table->text('description')->nullable();
            $table->foreignId('zone_parent_id')->nullable()->constrained('zones')->nullOnDelete();
            $table->string('statut', 50)->default('actif');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('zones');
    }
};
