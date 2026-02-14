<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Add membership_type to teachers if it doesn't exist
        if (!Schema::hasColumn('teachers', 'membership_type')) {
            Schema::table('teachers', function (Blueprint $table) {
                $table->string('membership_type')->nullable()->after('is_active');
            });
        }

        // Add contract fields to teachers if they don't exist
        if (!Schema::hasColumn('teachers', 'contract_start_date')) {
            Schema::table('teachers', function (Blueprint $table) {
                $table->date('contract_start_date')->nullable()->after('membership_type');
            });
        }

        if (!Schema::hasColumn('teachers', 'contract_end_date')) {
            Schema::table('teachers', function (Blueprint $table) {
                $table->date('contract_end_date')->nullable()->after('contract_start_date');
            });
        }

        if (!Schema::hasColumn('teachers', 'contract_status')) {
            Schema::table('teachers', function (Blueprint $table) {
                $table->string('contract_status')->nullable()->after('contract_end_date');
            });
        }

        // Add contract fields to users if they don't exist
        if (!Schema::hasColumn('users', 'contract_start_date')) {
            Schema::table('users', function (Blueprint $table) {
                $table->date('contract_start_date')->nullable()->after('membership_type');
            });
        }

        if (!Schema::hasColumn('users', 'contract_end_date')) {
            Schema::table('users', function (Blueprint $table) {
                $table->date('contract_end_date')->nullable()->after('contract_start_date');
            });
        }

        if (!Schema::hasColumn('users', 'contract_status')) {
            Schema::table('users', function (Blueprint $table) {
                $table->string('contract_status')->nullable()->after('contract_end_date');
            });
        }
    }

    public function down(): void
    {
        // No need to rollback - this is a fix migration
    }
};
