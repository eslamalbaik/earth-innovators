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
        Schema::create('certificates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('cascade'); // للطالب
            $table->string('school_id')->nullable(); // للمدرسة
            $table->enum('type', ['student', 'school', 'achievement'])->default('student');
            $table->string('title');
            $table->string('title_ar')->nullable();
            $table->text('description')->nullable();
            $table->text('description_ar')->nullable();
            $table->string('certificate_number')->unique(); // رقم الشهادة
            $table->date('issue_date');
            $table->date('expiry_date')->nullable();
            $table->string('template')->nullable(); // قالب الشهادة
            $table->string('file_path')->nullable(); // ملف PDF للشهادة
            $table->foreignId('issued_by')->constrained('users')->onDelete('cascade'); // من أصدر الشهادة
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('certificates');
    }
};
