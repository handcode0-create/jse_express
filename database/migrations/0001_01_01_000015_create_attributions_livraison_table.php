<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('attributions_livraison', function (Blueprint $table) {
            $table->id();
            $table->foreignId('livraison_id')->constrained('livraisons');
            $table->foreignId('livreur_id')->constrained('users');
            $table->foreignId('admin_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('type_attribution', 50);
            $table->string('statut', 50);
            $table->dateTime('date_attribution');
            $table->text('motif')->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('attributions_livraison');
    }
};
