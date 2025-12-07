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
        Schema::table('challenges', function (Blueprint $table) {
            $table->foreignId('school_id')->nullable()->after('created_by')->constrained('users')->onDelete('cascade');
            $table->enum('challenge_type', [
                '60_seconds',           // تحدّي 60 ثانية
                'mental_math',          // حل بدون قلم
                'conversions',          // تحدّي التحويلات
                'team_fastest',         // تحدّي الفريق الأسرع
                'build_problem',        // تحدّي "ابنِ مسألة"
                'custom'                // تحدّي مخصص
            ])->nullable()->after('category');
            $table->text('instructions')->nullable()->after('description'); // كيفية التنفيذ
            $table->text('objective')->nullable()->after('title'); // الهدف من التحدي
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('challenges', function (Blueprint $table) {
            $table->dropForeign(['school_id']);
            $table->dropColumn(['school_id', 'challenge_type', 'instructions', 'objective']);
        });
    }
};
