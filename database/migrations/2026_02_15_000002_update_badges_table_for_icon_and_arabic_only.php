<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('badges', function (Blueprint $table) {
            // Make description fields nullable since we're switching to Arabic only
            $table->text('description')->nullable()->change();
            $table->text('description_ar')->nullable()->change();
            
            // Add icon field if it doesn't exist
            if (!Schema::hasColumn('badges', 'icon')) {
                $table->string('icon')->nullable()->after('image');
            }
        });
    }

    public function down(): void
    {
        Schema::table('badges', function (Blueprint $table) {
            $table->text('description')->nullable(false)->change();
            $table->text('description_ar')->nullable(false)->change();
            
            if (Schema::hasColumn('badges', 'icon')) {
                $table->dropColumn('icon');
            }
        });
    }
};
