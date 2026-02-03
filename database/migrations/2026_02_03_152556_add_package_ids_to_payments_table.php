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
        Schema::table('payments', function (Blueprint $table) {
            $table->unsignedBigInteger('package_id')->nullable()->after('teacher_id');
            $table->unsignedBigInteger('user_package_id')->nullable()->after('package_id');
            
            $table->foreign('package_id')->references('id')->on('packages')->onDelete('set null');
            $table->foreign('user_package_id')->references('id')->on('user_packages')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->dropForeign(['package_id']);
            $table->dropForeign(['user_package_id']);
            $table->dropColumn(['package_id', 'user_package_id']);
        });
    }
};
