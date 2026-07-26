<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('achievement_attachments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('achievement_id')->constrained()->cascadeOnDelete();

            $table->string('file_path')->nullable();
            $table->enum('file_type', ['pdf', 'image', 'docx', 'video', 'url']);
            $table->string('original_name')->nullable();
            $table->string('mime_type')->nullable();
            $table->unsignedBigInteger('size_bytes')->nullable();
            $table->string('url')->nullable()->comment('For URL type attachments');

            // AI Evidence Assessment
            $table->enum('ai_evidence_type', [
                'official_certificate', 'official_website', 'image', 'manual_entry', 'document', 'video',
            ])->nullable();
            $table->decimal('ai_confidence_score', 5, 2)->nullable()->comment('0-100');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('achievement_attachments');
    }
};
