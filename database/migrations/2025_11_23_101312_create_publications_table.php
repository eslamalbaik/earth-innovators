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
        Schema::create('publications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('author_id')->constrained('users')->onDelete('cascade'); // المعلم أو المدرسة التي أنشأت المقال
            $table->foreignId('school_id')->nullable()->constrained('users')->onDelete('set null'); // المدرسة التي ينتمي لها المقال (للمعلمين)
            $table->enum('type', ['magazine', 'booklet', 'report'])->default('magazine'); // نوع الإصدار
            $table->string('title'); // عنوان الإصدار
            $table->text('description')->nullable(); // وصف مختصر
            $table->longText('content')->nullable(); // المحتوى الكامل
            $table->string('cover_image')->nullable(); // صورة الغلاف
            $table->string('file')->nullable(); // ملف PDF للتحميل
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending'); // الحالة
            $table->foreignId('approved_by')->nullable()->constrained('users')->onDelete('set null'); // من وافق (للمعلمين: المدرسة)
            $table->timestamp('approved_at')->nullable(); // وقت الموافقة
            $table->integer('issue_number')->nullable(); // رقم العدد (للمجلات)
            $table->date('publish_date')->nullable(); // تاريخ النشر
            $table->string('publisher_name')->nullable(); // اسم الناشر (مثل "مجلس المدارس المبتكرة")
            $table->integer('views')->default(0); // عدد المشاهدات
            $table->integer('likes_count')->default(0); // عدد الإعجابات
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('publications');
    }
};
