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
        Schema::create('points', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->integer('points'); // النقاط المكتسبة أو المخصومة
            $table->enum('type', ['earned', 'redeemed', 'bonus', 'penalty'])->default('earned');
            $table->string('source'); // المصدر: 'project', 'challenge', 'badge', 'package', etc.
            $table->foreignId('source_id')->nullable(); // ID المصدر
            $table->text('description')->nullable();
            $table->text('description_ar')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('points');
    }
};
