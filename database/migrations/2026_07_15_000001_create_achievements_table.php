<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('achievements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();

            // Core fields
            $table->string('title');
            $table->text('description')->nullable();
            $table->enum('type', [
                'project', 'research', 'certificate', 'skill',
                'award', 'patent', 'article', 'product',
            ]);
            $table->string('category')->nullable();
            $table->date('date')->nullable();
            $table->json('external_links')->nullable();

            // AI Validation
            $table->enum('ai_validation_status', ['pending', 'validated', 'flagged'])->default('pending');
            $table->decimal('ai_confidence_score', 5, 2)->nullable()->comment('0-100');
            $table->json('ai_analysis_result')->nullable();
            $table->decimal('evidence_score', 5, 2)->nullable()->comment('0-100');

            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index(['user_id', 'type']);
            $table->index(['user_id', 'ai_validation_status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('achievements');
    }
};
