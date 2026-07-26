<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cognitive_assessments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete()->comment('الطالب المفحوص');
            $table->foreignId('entered_by')->nullable()->constrained('users')->nullOnDelete()->comment('المدرب الذي أدخل البيانات');

            $table->string('assessor_name')->nullable()->comment('اسم الفاحص');
            $table->date('assessment_date')->nullable()->comment('تاريخ تطبيق المقياس');

            // نسب الذكاء (درجات معيارية، متوسط 100 وانحراف معياري 15)
            $table->unsignedSmallInteger('full_scale_iq')->nullable()->comment('نسبة ذكاء المقياس الكلي');
            $table->unsignedSmallInteger('verbal_iq')->nullable()->comment('نسبة الذكاء اللفظية');
            $table->unsignedSmallInteger('nonverbal_iq')->nullable()->comment('نسبة الذكاء غير اللفظية');

            // العوامل الخمسة الكبرى (ستانفورد-بينيه الصورة الخامسة)
            $table->unsignedSmallInteger('fluid_reasoning')->nullable()->comment('الاستدلال السائل');
            $table->unsignedSmallInteger('knowledge')->nullable()->comment('المعرفة');
            $table->unsignedSmallInteger('quantitative_reasoning')->nullable()->comment('الاستدلال الكمي');
            $table->unsignedSmallInteger('visual_spatial')->nullable()->comment('المعالجة البصرية المكانية');
            $table->unsignedSmallInteger('working_memory')->nullable()->comment('الذاكرة العاملة');

            $table->json('percentile_ranks')->nullable()->comment('الرتب المئينية');
            $table->json('composite_abilities')->nullable()->comment('مركبات القدرة المشتركة: التخطيط، الانتباه، الأداء تحت ضغط الوقت...');
            $table->json('strengths')->nullable()->comment('نقاط القوة');
            $table->json('weaknesses')->nullable()->comment('نقاط الضعف');
            $table->text('notes')->nullable()->comment('الملاحظات الكيفية للفاحص');

            $table->timestamps();

            $table->index('user_id');
            $table->index(['user_id', 'assessment_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cognitive_assessments');
    }
};
