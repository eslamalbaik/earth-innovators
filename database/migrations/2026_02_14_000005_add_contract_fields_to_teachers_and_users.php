<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Add to teachers table - after is_active column
        Schema::table('teachers', function (Blueprint $table) {
            $table->string('membership_type')->nullable()->after('is_active');
            $table->date('contract_start_date')->nullable()->after('membership_type');
            $table->date('contract_end_date')->nullable()->after('contract_start_date');
            $table->string('contract_status')->nullable()->after('contract_end_date');
        });

        // Add to users table (for schools) - after membership_type
        Schema::table('users', function (Blueprint $table) {
            $table->date('contract_start_date')->nullable()->after('membership_type');
            $table->date('contract_end_date')->nullable()->after('contract_start_date');
            $table->string('contract_status')->nullable()->after('contract_end_date');
        });
    }

    public function down(): void
    {
        Schema::table('teachers', function (Blueprint $table) {
            $table->dropColumn(['contract_start_date', 'contract_end_date', 'contract_status', 'membership_type']);
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['contract_start_date', 'contract_end_date', 'contract_status']);
        });
    }
};
