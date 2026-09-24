<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users');
            $table->foreignId('commande_id')->nullable()->constrained('commandes')->nullOnDelete();
            $table->foreignId('livraison_id')->nullable()->constrained('livraisons')->nullOnDelete();
            $table->string('type_evenement', 100);
            $table->string('canal', 50)->default('SMS');
            $table->text('contenu');
            $table->string('telephone_destination', 30);
            $table->string('operateur', 50)->nullable();
            $table->string('statut_envoi', 50);
            $table->unsignedInteger('tentatives')->default(0);
            $table->dateTime('date_envoi')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};
