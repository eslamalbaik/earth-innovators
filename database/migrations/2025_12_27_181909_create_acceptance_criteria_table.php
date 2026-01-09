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
        Schema::create('acceptance_criteria', function (Blueprint $table) {
            $table->id();
            $table->string('name_ar');
            $table->text('description_ar')->nullable();
            $table->decimal('weight', 5, 2)->default(0)->comment('الوزن النسبي كنسبة مئوية');
            $table->integer('order')->default(0)->comment('ترتيب العرض');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            
            $table->index('order');
            $table->index('is_active');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('acceptance_criteria');
    }
};
