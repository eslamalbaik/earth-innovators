<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('index_history', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();

            $table->string('index_name');
            $table->decimal('old_value', 5, 2)->nullable();
            $table->decimal('new_value', 5, 2);
            $table->enum('trigger_type', [
                'achievement_added',
                'achievement_updated',
                'achievement_deleted',
                'manual_recalc',
                'ai_update',
                'system_recalc',
            ]);
            $table->unsignedBigInteger('trigger_id')->nullable()->comment('ID of the achievement or entity that triggered the change');

            $table->timestamps();

            $table->index(['user_id', 'index_name']);
            $table->index(['user_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('index_history');
    }
};
