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
        Schema::table('challenge_participants', function (Blueprint $table) {
            $table->enum('participation_type', ['mandatory', 'optional', 'favorite'])->default('optional')->after('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('challenge_participants', function (Blueprint $table) {
            $table->dropColumn('participation_type');
        });
    }
};
