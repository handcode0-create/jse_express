<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('notifications', function (Blueprint $table) {
            $table->dateTime('hidden_by_recipient_at')->nullable()->after('date_envoi');
            $table->index(['user_id', 'hidden_by_recipient_at']);
        });
    }

    public function down(): void
    {
        Schema::table('notifications', function (Blueprint $table) {
            $table->dropIndex(['user_id', 'hidden_by_recipient_at']);
            $table->dropColumn('hidden_by_recipient_at');
        });
    }
};
