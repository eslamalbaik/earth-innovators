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
        Schema::table('badges', function (Blueprint $table) {
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('approved')->after('is_active');
            $table->foreignId('created_by')->nullable()->after('status')->constrained('users')->onDelete('set null');
            $table->foreignId('approved_by')->nullable()->after('created_by')->constrained('users')->onDelete('set null');
            $table->foreignId('school_id')->nullable()->after('approved_by')->constrained('users')->onDelete('set null');
            $table->timestamp('approved_at')->nullable()->after('school_id');
            $table->text('rejection_reason')->nullable()->after('approved_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('badges', function (Blueprint $table) {
            $table->dropForeign(['created_by']);
            $table->dropForeign(['approved_by']);
            $table->dropForeign(['school_id']);
            $table->dropColumn(['status', 'created_by', 'approved_by', 'school_id', 'approved_at', 'rejection_reason']);
        });
    }
};
