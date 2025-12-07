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
        Schema::table('challenge_submissions', function (Blueprint $table) {
            // Update status enum to include resubmitted and withdrawn
            $table->enum('status', ['submitted', 'resubmitted', 'reviewed', 'approved', 'rejected', 'withdrawn'])->default('submitted')->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('challenge_submissions', function (Blueprint $table) {
            // Revert to original enum values
            $table->enum('status', ['submitted', 'reviewed', 'approved', 'rejected'])->default('submitted')->change();
        });
    }
};
