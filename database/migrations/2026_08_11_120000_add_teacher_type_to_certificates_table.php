<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * 'teacher' is offered in the admin certificate form and accepted by
     * CertificateController validation, but was never added to the column,
     * so saving a teacher certificate failed with
     * "Data truncated for column 'type'".
     */
    public function up(): void
    {
        $driver = DB::getDriverName();

        if ($driver !== 'sqlite') {
            DB::statement("ALTER TABLE certificates MODIFY COLUMN type ENUM('student', 'teacher', 'school', 'achievement', 'membership') DEFAULT 'student'");
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
            // Note: this fails if teacher certificates already exist.
            DB::statement("ALTER TABLE certificates MODIFY COLUMN type ENUM('student', 'school', 'achievement', 'membership') DEFAULT 'student'");
        }
    }
};
