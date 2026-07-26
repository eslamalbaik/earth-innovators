<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_skills', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('achievement_id')->nullable()->constrained()->nullOnDelete();

            $table->string('name');
            $table->string('category')->nullable();
            $table->enum('source', ['manual', 'ai_extracted'])->default('manual');
            $table->enum('proficiency_level', ['beginner', 'intermediate', 'advanced', 'expert'])->default('beginner');

            $table->timestamps();

            $table->index(['user_id', 'category']);
            $table->index(['user_id', 'source']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_skills');
    }
};
