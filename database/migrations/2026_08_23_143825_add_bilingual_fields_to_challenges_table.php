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
        Schema::table('challenges', function (Blueprint $table) {
            $table->string('title_ar')->nullable()->after('title');
            $table->text('objective_ar')->nullable()->after('objective');
            $table->text('description_ar')->nullable()->after('description');
            $table->text('instructions_ar')->nullable()->after('instructions');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('challenges', function (Blueprint $table) {
            $table->dropColumn(['title_ar', 'objective_ar', 'description_ar', 'instructions_ar']);
        });
    }
};
