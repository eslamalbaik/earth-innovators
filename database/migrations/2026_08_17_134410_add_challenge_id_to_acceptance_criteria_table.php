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
        Schema::table('acceptance_criteria', function (Blueprint $table) {
            $table->foreignId('challenge_id')->nullable()->after('project_id')->constrained('challenges')->onDelete('cascade');
            $table->index('challenge_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('acceptance_criteria', function (Blueprint $table) {
            $table->dropForeign(['challenge_id']);
            $table->dropIndex(['challenge_id']);
            $table->dropColumn('challenge_id');
        });
    }
};
