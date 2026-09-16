<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reference_standards', function (Blueprint $table) {
            $table->id();
            $table->enum('scope', ['national', 'international']);
            $table->string('domain_ar');
            $table->string('domain_en');
            $table->string('standard_name');
            $table->string('usage_ar');
            $table->string('usage_en');
            // Evaluation domain this standard maps to in the scoring engine
            // (InnovationIndex column key, e.g. 'skills', 'innovation', 'ip'),
            // used to show "compliant with standard X" tags on reports.
            $table->string('index_key')->nullable();
            $table->boolean('is_active')->default(true);
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reference_standards');
    }
};
