<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('badges', function (Blueprint $table) {
            $table->boolean('is_ai_generated')->default(false)->after('description_ar');
        });

        Schema::table('challenges', function (Blueprint $table) {
            $table->boolean('is_ai_generated')->default(false)->after('instructions_ar');
        });

        Schema::table('projects', function (Blueprint $table) {
            $table->boolean('is_ai_generated')->default(false)->after('description_ar');
        });
    }

    public function down(): void
    {
        Schema::table('badges', function (Blueprint $table) {
            $table->dropColumn('is_ai_generated');
        });

        Schema::table('challenges', function (Blueprint $table) {
            $table->dropColumn('is_ai_generated');
        });

        Schema::table('projects', function (Blueprint $table) {
            $table->dropColumn('is_ai_generated');
        });
    }
};
