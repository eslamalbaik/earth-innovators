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
        Schema::create('packages', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('name_ar')->nullable();
            $table->text('description')->nullable();
            $table->text('description_ar')->nullable();
            $table->decimal('price', 10, 2); // السعر
            $table->enum('currency', ['SAR', 'USD', 'AED'])->default('SAR');
            $table->enum('duration_type', ['monthly', 'quarterly', 'yearly', 'lifetime'])->default('monthly');
            $table->integer('duration_months')->nullable(); // مدة الباقة بالأشهر
            $table->integer('points_bonus')->default(0); // نقاط إضافية
            $table->integer('projects_limit')->nullable(); // حد المشاريع (null = غير محدود)
            $table->integer('challenges_limit')->nullable(); // حد التحديات
            $table->boolean('certificate_access')->default(false); // إمكانية الحصول على شهادات
            $table->boolean('badge_access')->default(true); // إمكانية الحصول على شارات
            $table->json('features')->nullable(); // ميزات الباقة
            $table->json('features_ar')->nullable(); // ميزات الباقة بالعربي
            $table->boolean('is_active')->default(true);
            $table->boolean('is_popular')->default(false); // باقة شائعة
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('packages');
    }
};
