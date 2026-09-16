<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('initiatives', function (Blueprint $table) {
            $table->id();
            // null => global initiative (visible to everyone); set => that
            // school's own initiative (visible only to its users).
            $table->foreignId('school_id')->nullable()->constrained('users')->onDelete('cascade');
            $table->string('title_ar');
            $table->string('title_en')->nullable();
            $table->text('description_ar')->nullable();
            $table->text('description_en')->nullable();
            $table->string('image')->nullable();
            $table->enum('audience', ['students', 'teachers', 'both'])->default('both');
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->text('benefit_details')->nullable();
            $table->boolean('is_active')->default(true);
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('initiatives');
    }
};
