<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Platform-wide catalogue of ready-made rubric criteria teachers can pick
     * from when building a rubric, then edit freely. Each entry already
     * carries a full performance-level matrix (levels JSON).
     */
    public function up(): void
    {
        Schema::create('rubric_criterion_library', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('name_ar');
            $table->text('description')->nullable();
            $table->text('description_ar')->nullable();
            $table->decimal('default_weight', 5, 2)->default(0);
            $table->string('category')->nullable()->comment('e.g. creativity, technical, presentation');
            $table->json('levels')->comment('[{name,name_ar,score,description,description_ar}, ...]');
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index('category');
            $table->index('is_active');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rubric_criterion_library');
    }
};
