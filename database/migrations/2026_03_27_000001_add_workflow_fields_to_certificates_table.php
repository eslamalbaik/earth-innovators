<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('certificates', function (Blueprint $table) {
            $table->enum('status', ['approved', 'pending_school_approval', 'rejected'])
                ->default('approved')
                ->after('type');
            $table->string('source')->default('school_direct')->after('status');
            $table->foreignId('requested_by')->nullable()->after('issued_by')->constrained('users')->nullOnDelete();
            $table->foreignId('reviewed_by')->nullable()->after('requested_by')->constrained('users')->nullOnDelete();
            $table->timestamp('approved_at')->nullable()->after('reviewed_by');
            $table->timestamp('rejected_at')->nullable()->after('approved_at');
            $table->text('rejection_reason')->nullable()->after('rejected_at');
        });
    }

    public function down(): void
    {
        Schema::table('certificates', function (Blueprint $table) {
            $table->dropConstrainedForeignId('requested_by');
            $table->dropConstrainedForeignId('reviewed_by');
            $table->dropColumn([
                'status',
                'source',
                'approved_at',
                'rejected_at',
                'rejection_reason',
            ]);
        });
    }
};
