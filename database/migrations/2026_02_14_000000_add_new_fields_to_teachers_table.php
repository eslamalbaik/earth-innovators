<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('teachers', function (Blueprint $table) {
            $table->string('education_type')->nullable()->after('is_active');
            $table->json('curriculum_type')->nullable()->after('education_type');
            $table->json('teaching_language')->nullable()->after('curriculum_type');
        });
    }

    public function down(): void
    {
        Schema::table('teachers', function (Blueprint $table) {
            $table->dropColumn(['education_type', 'curriculum_type', 'teaching_language']);
        });
    }
};
