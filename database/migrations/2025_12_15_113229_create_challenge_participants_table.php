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
        Schema::create('challenge_participants', function (Blueprint $table) {
            $table->id();
            $table->foreignId('challenge_id')->constrained('challenges')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->enum('status', ['joined', 'in_progress', 'completed', 'abandoned'])->default('joined');
            $table->integer('points_earned')->default(0);
            $table->integer('rank')->nullable(); // Rank in this challenge
            $table->timestamp('joined_at');
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();

            // Ensure a user can only join a challenge once
            $table->unique(['challenge_id', 'user_id']);
            $table->index(['challenge_id', 'status']);
            $table->index(['user_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('challenge_participants');
    }
};
