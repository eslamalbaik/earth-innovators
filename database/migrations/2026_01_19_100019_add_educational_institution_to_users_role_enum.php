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
            // MySQL/MariaDB - تحديث enum role لإضافة educational_institution
            DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('student', 'teacher', 'school', 'admin', 'system_supervisor', 'school_support_coordinator', 'educational_institution') DEFAULT 'student'");
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
            // إرجاع enum role كما كان (بدون educational_institution)
            DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('student', 'teacher', 'school', 'admin', 'system_supervisor', 'school_support_coordinator') DEFAULT 'student'");
        }
    }
};
