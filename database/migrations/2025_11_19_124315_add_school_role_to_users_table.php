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
        // استخدام طريقة متوافقة مع SQLite و MySQL
        $driver = DB::getDriverName();
        
        if ($driver === 'sqlite') {
            // SQLite لا يدعم MODIFY COLUMN ولا ENUM
            // في SQLite، يمكننا فقط إضافة العمود إذا لم يكن موجوداً
            // لا حاجة لتغيير نوع العمود في SQLite
        } else {
            // MySQL/MariaDB
            Schema::table('users', function (Blueprint $table) {
                // تحديث enum role لإضافة school
                DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('student', 'teacher', 'school', 'admin') DEFAULT 'student'");
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // استخدام طريقة متوافقة مع SQLite و MySQL
        $driver = DB::getDriverName();
        
        if ($driver === 'sqlite') {
            // SQLite لا يدعم MODIFY COLUMN
            // لا حاجة لتغيير نوع العمود في SQLite
        } else {
            // MySQL/MariaDB
            Schema::table('users', function (Blueprint $table) {
                // إرجاع enum role كما كان
                DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('student', 'teacher', 'admin') DEFAULT 'student'");
            });
        }
    }
};
