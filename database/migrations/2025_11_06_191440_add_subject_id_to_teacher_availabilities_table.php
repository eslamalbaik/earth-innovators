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
        Schema::table('teacher_availabilities', function (Blueprint $table) {
            $table->foreignId('subject_id')->nullable()->after('teacher_id')->constrained('subjects')->onDelete('cascade');
            $table->index(['teacher_id', 'subject_id', 'date', 'status']);
        });
    }

    public function down(): void
    {
        Schema::table('teacher_availabilities', function (Blueprint $table) {
            $table->dropForeign(['subject_id']);
            $table->dropIndex(['teacher_id', 'subject_id', 'date', 'status']);
            $table->dropColumn('subject_id');
        });
    }
};
