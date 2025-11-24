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
        Schema::create('challenges', function (Blueprint $table) {
            $table->id();
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade'); // المعلم أو الإدارة
            $table->string('title');
            $table->text('description');
            $table->enum('category', ['science', 'technology', 'engineering', 'mathematics', 'arts', 'other'])->default('other');
            $table->enum('age_group', ['6-9', '10-13', '14-17', '18+'])->default('10-13');
            $table->dateTime('start_date');
            $table->dateTime('deadline');
            $table->enum('status', ['draft', 'active', 'completed', 'cancelled'])->default('draft');
            $table->integer('points_reward')->default(0);
            $table->json('badges_reward')->nullable(); // الشارات الممنوحة
            $table->integer('max_participants')->nullable();
            $table->integer('current_participants')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('challenges');
    }
};
