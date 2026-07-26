<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('innovation_indexes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();

            // The 8 Indexes (0-100)
            $table->decimal('skills_index', 5, 2)->default(0);
            $table->decimal('innovation_index', 5, 2)->default(0);
            $table->decimal('intelligence_index', 5, 2)->default(0);
            $table->decimal('creativity_index', 5, 2)->default(0);
            $table->decimal('projects_index', 5, 2)->default(0);
            $table->decimal('leadership_index', 5, 2)->default(0);
            $table->decimal('ip_index', 5, 2)->default(0);
            $table->decimal('future_readiness_index', 5, 2)->default(0);

            // Overall
            $table->decimal('overall_score', 5, 2)->default(0);
            $table->enum('classification', [
                'diamond', 'platinum', 'gold', 'silver', 'bronze', 'developing',
            ])->default('developing');

            // Metadata
            $table->json('calculation_metadata')->nullable()->comment('Detailed breakdown of each index calculation');
            $table->timestamp('calculated_at')->nullable();

            $table->timestamps();

            $table->index('user_id');
            $table->index('classification');
            $table->index('overall_score');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('innovation_indexes');
    }
};
