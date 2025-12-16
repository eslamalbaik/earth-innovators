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
        Schema::table('badges', function (Blueprint $table) {
            // Add badge_category if it doesn't exist
            if (!Schema::hasColumn('badges', 'badge_category')) {
                $table->enum('badge_category', ['achievement', 'community'])->default('achievement')->after('type');
            }

            // Add level for community badges (bronze, silver, gold)
            if (!Schema::hasColumn('badges', 'level')) {
                $table->enum('level', ['bronze', 'silver', 'gold'])->nullable()->after('badge_category');
            }

            // Ensure points_required is properly set for community badges
            // Achievement badges don't require points, community badges do
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('badges', function (Blueprint $table) {
            if (Schema::hasColumn('badges', 'badge_category')) {
                $table->dropColumn('badge_category');
            }
            if (Schema::hasColumn('badges', 'level')) {
                $table->dropColumn('level');
            }
        });
    }
};
