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
        if (Schema::hasTable('reviews') && !Schema::hasColumn('reviews', 'reviewer_image')) {
            Schema::table('reviews', function (Blueprint $table) {
                $table->string('reviewer_image')->nullable()->after('reviewer_location');
            });
        }

        if (Schema::hasTable('publications') && !Schema::hasColumn('publications', 'rejection_reason')) {
            Schema::table('publications', function (Blueprint $table) {
                $table->text('rejection_reason')->nullable()->after('approved_by');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('reviews') && Schema::hasColumn('reviews', 'reviewer_image')) {
            Schema::table('reviews', function (Blueprint $table) {
                $table->dropColumn('reviewer_image');
            });
        }

        if (Schema::hasTable('publications') && Schema::hasColumn('publications', 'rejection_reason')) {
            Schema::table('publications', function (Blueprint $table) {
                $table->dropColumn('rejection_reason');
            });
        }
    }
};
