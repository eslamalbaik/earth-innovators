<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * The certificate-issuance API (CertificateController::generate) and the school
     * "issue certificate" UI already accept general_completion/academic_excellence/
     * motivation/innovation as certificate_type, but the column never included them —
     * saving one would fail with "Data truncated for column 'type'" on MySQL, exactly
     * like the earlier missing 'teacher' value.
     */
    public function up(): void
    {
        $driver = DB::getDriverName();

        if ($driver !== 'sqlite') {
            DB::statement("ALTER TABLE certificates MODIFY COLUMN type ENUM('student', 'teacher', 'school', 'achievement', 'membership', 'general_completion', 'academic_excellence', 'motivation', 'innovation') DEFAULT 'student'");
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
            // Note: this fails if certificates using the new types already exist.
            DB::statement("ALTER TABLE certificates MODIFY COLUMN type ENUM('student', 'teacher', 'school', 'achievement', 'membership') DEFAULT 'student'");
        }
    }
};
