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
        
        if ($driver === 'sqlite') {
            // SQLite لا يدعم MODIFY COLUMN ولا ENUM
            // في SQLite، يمكننا فقط إضافة الأعمدة الجديدة
            Schema::table('users', function (Blueprint $table) {
                $table->enum('membership_type', ['basic', 'subscription'])->nullable()->after('membership_number');
                $table->enum('account_type', ['regular', 'project'])->default('regular')->after('role');
            });
        } else {
            // MySQL/MariaDB
            Schema::table('users', function (Blueprint $table) {
                // إضافة الأعمدة الجديدة
                $table->enum('membership_type', ['basic', 'subscription'])->nullable()->after('membership_number');
                $table->enum('account_type', ['regular', 'project'])->default('regular')->after('role');
            });
            
            // تحديث enum role لإضافة الأدوار الجديدة
            DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('student', 'teacher', 'school', 'admin', 'system_supervisor', 'school_support_coordinator') DEFAULT 'student'");
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $driver = DB::getDriverName();
        
        if ($driver === 'sqlite') {
            Schema::table('users', function (Blueprint $table) {
                $table->dropColumn(['membership_type', 'account_type']);
            });
        } else {
            Schema::table('users', function (Blueprint $table) {
                $table->dropColumn(['membership_type', 'account_type']);
            });
            
            // إرجاع enum role كما كان
            DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('student', 'teacher', 'school', 'admin') DEFAULT 'student'");
        }
    }
};
