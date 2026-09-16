<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('invite_codes', function (Blueprint $table) {
            $table->id();
            $table->string('code', 20)->unique();
            $table->enum('role', ['student', 'teacher']);
            $table->foreignId('school_id')->constrained('users')->onDelete('cascade');
            // Present only for student codes issued by a specific teacher
            // (requirement 6.1: "teacher adds their own students to their section").
            $table->foreignId('teacher_id')->nullable()->constrained('users')->onDelete('set null');
            $table->string('grade')->nullable();
            $table->string('section')->nullable();
            $table->unsignedInteger('max_uses')->nullable(); // null = unlimited
            $table->unsignedInteger('used_count')->default(0);
            $table->timestamp('expires_at')->nullable();
            $table->boolean('is_active')->default(true);
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('invite_codes');
    }
};
