<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        if (DB::getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE user_packages MODIFY status ENUM('pending', 'active', 'expired', 'cancelled') NOT NULL DEFAULT 'pending'");
        }
    }

    public function down(): void
    {
        if (DB::getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE user_packages MODIFY status ENUM('active', 'expired', 'cancelled') NOT NULL DEFAULT 'active'");
        }
    }
};
