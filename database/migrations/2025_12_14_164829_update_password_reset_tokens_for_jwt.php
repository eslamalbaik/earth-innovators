<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('password_reset_tokens', function (Blueprint $table) {
            $table->timestamp('expires_at')->nullable()->after('created_at');
            $table->timestamp('used_at')->nullable()->after('expires_at');
            $table->string('ip_address', 45)->nullable()->after('used_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('password_reset_tokens', function (Blueprint $table) {
            $table->dropColumn(['expires_at', 'used_at', 'ip_address']);
        });
    }
};
