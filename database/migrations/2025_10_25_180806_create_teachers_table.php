<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('teachers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('name_ar');
            $table->string('name_en')->nullable();
            $table->string('nationality');
            $table->string('gender')->nullable();
            $table->text('bio')->nullable();
            $table->text('qualifications')->nullable();
            $table->string('image')->nullable();
            $table->json('subjects');
            $table->json('stages');
            $table->integer('experience_years');
            $table->string('city');
            $table->json('neighborhoods');
            $table->decimal('price_per_hour', 8, 2);
            $table->decimal('rating', 3, 2)->default(0);
            $table->integer('reviews_count')->default(0);
            $table->integer('sessions_count')->default(0);
            $table->integer('students_count')->default(0);
            $table->boolean('is_verified')->default(false);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('teachers');
    }
};
