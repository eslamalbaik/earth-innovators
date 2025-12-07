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
        Schema::create('challenge_submission_comments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('submission_id')->constrained('challenge_submissions')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->text('comment');
            $table->json('mentioned_user_ids')->nullable()->comment('Array of user IDs mentioned in comment');
            $table->foreignId('parent_id')->nullable()->constrained('challenge_submission_comments')->onDelete('cascade');
            $table->timestamps();
            
            $table->index(['submission_id', 'created_at']);
            $table->index('user_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('challenge_submission_comments');
    }
};
