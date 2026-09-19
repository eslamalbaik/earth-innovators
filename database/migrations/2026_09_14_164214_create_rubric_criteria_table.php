<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('rubric_criteria', function (Blueprint $table) {
            $table->id();
            $table->foreignId('rubric_id')->constrained('rubrics')->cascadeOnDelete();
            $table->foreignId('library_criterion_id')->nullable()
                ->constrained('rubric_criterion_library')->nullOnDelete();
            $table->string('name');
            $table->string('name_ar');
            $table->text('description')->nullable();
            $table->text('description_ar')->nullable();
            $table->decimal('weight', 5, 2)->default(0)->comment('relative weight, % of the rubric');
            $table->integer('order')->default(0);
            $table->json('levels')->comment('[{name,name_ar,score,description,description_ar}, ...]');
            $table->timestamps();

            $table->index(['rubric_id', 'order']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rubric_criteria');
    }
};
