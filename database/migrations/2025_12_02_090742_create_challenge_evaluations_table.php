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
        Schema::create('challenge_evaluations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('submission_id')->constrained('challenge_submissions')->onDelete('cascade');
            $table->foreignId('evaluator_id')->constrained('users')->onDelete('cascade');
            $table->enum('role', ['teacher', 'auto', 'admin'])->default('teacher');
            $table->decimal('score', 5, 2)->nullable()->comment('Score from 0-100');
            $table->text('feedback')->nullable();
            $table->enum('visibility', ['student-visible', 'teacher-only', 'school-only'])->default('student-visible');
            $table->timestamp('evaluated_at')->useCurrent();
            $table->timestamps();
            
            $table->index(['submission_id', 'evaluated_at']);
            $table->index('evaluator_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('challenge_evaluations');
    }
};
