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
        if (Schema::hasTable('email_otps')) {
            Schema::table('email_otps', function (Blueprint $table) {
                if (!Schema::hasColumn('email_otps', 'ip_address')) {
                    $table->string('ip_address', 45)->nullable()->after('attempts');
                }
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('email_otps')) {
            Schema::table('email_otps', function (Blueprint $table) {
                if (Schema::hasColumn('email_otps', 'ip_address')) {
                    $table->dropColumn('ip_address');
                }
            });
        }
    }
};
