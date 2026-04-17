<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'teacher_id')) {
                $table->foreignId('teacher_id')
                    ->nullable()
                    ->after('school_id')
                    ->constrained('users')
                    ->nullOnDelete();

                $table->index(['teacher_id', 'role']);
            }
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'teacher_id')) {
                $table->dropForeign(['teacher_id']);
                $table->dropIndex(['teacher_id', 'role']);
                $table->dropColumn('teacher_id');
            }
        });
    }
};

