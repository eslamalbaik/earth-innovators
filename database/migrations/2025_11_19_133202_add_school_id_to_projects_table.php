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
        Schema::table('projects', function (Blueprint $table) {
            $table->foreignId('school_id')->nullable()->after('user_id')->constrained('users')->onDelete('set null');
            $table->foreignId('approved_by')->nullable()->after('school_id')->constrained('users')->onDelete('set null');
            $table->timestamp('approved_at')->nullable()->after('approved_by');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            $table->dropForeign(['school_id']);
            $table->dropForeign(['approved_by']);
            $table->dropColumn(['school_id', 'approved_by', 'approved_at']);
        });
    }
};
