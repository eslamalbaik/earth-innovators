<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * A named, reusable evaluation rubric a teacher builds. `scope` decides
     * where it shows up: 'teacher' rubrics apply broadly to that teacher's
     * projects; 'class' rubrics are additionally scoped to a grade+subject
     * combination (the platform has no separate classroom entity — grade +
     * subject together represent "a class" here, mirroring the same fields
     * already on projects.grade / projects.subject).
     */
    public function up(): void
    {
        Schema::create('rubrics', function (Blueprint $table) {
            $table->id();
            $table->foreignId('teacher_id')->constrained('teachers')->cascadeOnDelete();
            $table->foreignId('school_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('name');
            $table->string('name_ar');
            $table->text('description')->nullable();
            $table->text('description_ar')->nullable();
            $table->enum('scope', ['teacher', 'class'])->default('teacher');
            $table->string('grade')->nullable();
            $table->string('subject')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['teacher_id', 'is_active']);
            $table->index(['grade', 'subject']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rubrics');
    }
};
