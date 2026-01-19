<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $driver = DB::getDriverName();
        
        if ($driver !== 'sqlite') {
            // For MySQL, we need to use raw SQL to modify the enum
            DB::statement("ALTER TABLE certificates MODIFY COLUMN type ENUM('student', 'school', 'achievement', 'membership') DEFAULT 'student'");
        }
        // SQLite لا يدعم ENUM، لذا لا حاجة لتعديل
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $driver = DB::getDriverName();
        
        if ($driver !== 'sqlite') {
            // Remove 'membership' from enum, but keep existing values
            // Note: This may fail if there are existing 'membership' certificates
            DB::statement("ALTER TABLE certificates MODIFY COLUMN type ENUM('student', 'school', 'achievement') DEFAULT 'student'");
        }
    }
};
