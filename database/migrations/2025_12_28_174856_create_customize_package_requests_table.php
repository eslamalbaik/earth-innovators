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
        Schema::create('customize_package_requests', function (Blueprint $table) {
            $table->id();
            $table->string('school_name')->nullable();
            $table->string('responsible_name');
            $table->string('mobile_number');
            $table->string('expected_students')->nullable();
            $table->text('additional_notes')->nullable();
            $table->enum('status', ['pending', 'contacted', 'completed'])->default('pending');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('customize_package_requests');
    }
};
