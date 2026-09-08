<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Composite indexes for the WHERE/ORDER BY patterns hit on every dashboard
 * load (Admin/Student/Teacher/School) and on the membership gate that runs
 * on nearly every authenticated request. `status` and `role` had no index
 * at all before this; foreignId() only auto-indexes the FK columns.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->index('role');
        });

        Schema::table('projects', function (Blueprint $table) {
            $table->index(['status', 'school_id']);
            $table->index(['status', 'approved_at']);
            $table->index(['user_id', 'status']);
        });

        Schema::table('publications', function (Blueprint $table) {
            $table->index(['status', 'school_id']);
        });

        Schema::table('user_packages', function (Blueprint $table) {
            $table->index(['user_id', 'status', 'end_date']);
            $table->index(['status', 'end_date']);
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex(['role']);
        });

        Schema::table('projects', function (Blueprint $table) {
            $table->dropIndex(['status', 'school_id']);
            $table->dropIndex(['status', 'approved_at']);
            $table->dropIndex(['user_id', 'status']);
        });

        Schema::table('publications', function (Blueprint $table) {
            $table->dropIndex(['status', 'school_id']);
        });

        Schema::table('user_packages', function (Blueprint $table) {
            $table->dropIndex(['user_id', 'status', 'end_date']);
            $table->dropIndex(['status', 'end_date']);
        });
    }
};
