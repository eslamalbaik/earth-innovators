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
        Schema::create('projects', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('title');
            $table->text('description');
            $table->enum('category', ['science', 'technology', 'engineering', 'mathematics', 'arts', 'other'])->default('other');
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->json('files')->nullable(); // ملفات المشروع
            $table->json('images')->nullable(); // صور المشروع
            $table->text('report')->nullable(); // تقرير المشروع
            $table->integer('views')->default(0);
            $table->integer('likes')->default(0);
            $table->decimal('rating', 3, 2)->nullable(); // تقييم من 0 إلى 5
            $table->integer('points_earned')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('projects');
    }
};
