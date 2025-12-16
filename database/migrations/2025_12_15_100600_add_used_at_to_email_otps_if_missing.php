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
                if (!Schema::hasColumn('email_otps', 'used_at')) {
                    $table->timestamp('used_at')->nullable()->after('expires_at');
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
                if (Schema::hasColumn('email_otps', 'used_at')) {
                    $table->dropColumn('used_at');
                }
            });
        }
    }
};
