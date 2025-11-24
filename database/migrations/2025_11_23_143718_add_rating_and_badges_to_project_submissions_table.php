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
        Schema::table('project_submissions', function (Blueprint $table) {
            $table->decimal('rating', 3, 2)->nullable()->after('feedback'); // تقييم من 0 إلى 5
            $table->json('badges')->nullable()->after('rating'); // الشارات الممنوحة
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('project_submissions', function (Blueprint $table) {
            $table->dropColumn(['rating', 'badges']);
        });
    }
};
