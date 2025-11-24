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
        Schema::create('badges', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('name_ar')->nullable();
            $table->text('description')->nullable();
            $table->text('description_ar')->nullable();
            $table->string('icon')->nullable(); // أيقونة الشارة
            $table->string('image')->nullable(); // صورة الشارة
            $table->enum('type', ['rank_first', 'rank_second', 'rank_third', 'excellent_innovator', 'active_participant', 'custom'])->default('custom');
            $table->integer('points_required')->default(0); // النقاط المطلوبة للحصول عليها
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('badges');
    }
};
