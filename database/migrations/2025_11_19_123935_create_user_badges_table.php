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
        Schema::create('user_badges', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('badge_id')->constrained()->onDelete('cascade');
            $table->foreignId('awarded_by')->nullable()->constrained('users')->onDelete('set null'); // من منح الشارة
            $table->foreignId('project_id')->nullable()->constrained()->onDelete('set null'); // المشروع المرتبط
            $table->foreignId('challenge_id')->nullable()->constrained()->onDelete('set null'); // التحدي المرتبط
            $table->text('reason')->nullable(); // سبب منح الشارة
            $table->timestamp('earned_at');
            $table->timestamps();
            
            $table->unique(['user_id', 'badge_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_badges');
    }
};
