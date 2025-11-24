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
        // تغيير نوع العمود من enum إلى string لدعم الحالات الجديدة
        if (Schema::hasColumn('bookings', 'status')) {
            // تحديث البيانات الموجودة
            DB::statement("UPDATE bookings SET status = 'approved' WHERE status = 'confirmed'");
            
            // استخدام طريقة متوافقة مع SQLite و MySQL
            $driver = DB::getDriverName();
            
            if ($driver === 'sqlite') {
                // SQLite لا يدعم MODIFY COLUMN، نحتاج إلى إعادة إنشاء الجدول
                // لكن في هذه الحالة، يمكننا فقط تحديث البيانات لأن SQLite لا يفرض نوع البيانات
                // لا حاجة لتغيير نوع العمود في SQLite
            } else {
                // MySQL/MariaDB
                DB::statement("ALTER TABLE bookings MODIFY COLUMN status VARCHAR(20) DEFAULT 'pending'");
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasColumn('bookings', 'status')) {
            // إعادة البيانات
            DB::statement("UPDATE bookings SET status = 'confirmed' WHERE status = 'approved'");
            
            // استخدام طريقة متوافقة مع SQLite و MySQL
            $driver = DB::getDriverName();
            
            if ($driver === 'sqlite') {
                // SQLite لا يدعم MODIFY COLUMN
                // لا حاجة لتغيير نوع العمود في SQLite
            } else {
                // MySQL/MariaDB
                DB::statement("ALTER TABLE bookings MODIFY COLUMN status ENUM('pending', 'confirmed', 'cancelled', 'completed') DEFAULT 'pending'");
            }
        }
    }
};
