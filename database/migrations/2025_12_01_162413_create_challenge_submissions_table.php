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
        Schema::create('challenge_submissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('challenge_id')->constrained()->onDelete('cascade');
            $table->foreignId('student_id')->constrained('users')->onDelete('cascade');
            $table->json('files')->nullable(); // الملفات المرفوعة
            $table->text('answer')->nullable(); // الإجابة/الحل
            $table->text('comment')->nullable(); // تعليق الطالب
            $table->enum('status', ['submitted', 'reviewed', 'approved', 'rejected'])->default('submitted');
            $table->text('feedback')->nullable(); // ملاحظات المقيّم
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->onDelete('set null');
            $table->decimal('rating', 3, 2)->nullable(); // التقييم من 0-10
            $table->json('badges')->nullable(); // الشارات الممنوحة
            $table->integer('points_earned')->default(0); // النقاط المكتسبة
            $table->timestamp('submitted_at')->nullable();
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamps();
            
            $table->unique(['challenge_id', 'student_id']); // طالب واحد لكل تحدّي
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('challenge_submissions');
    }
};
