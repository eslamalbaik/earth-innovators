<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('teachers', function (Blueprint $table) {
            $table->index(['is_active', 'is_verified', 'city'], 'teachers_active_verified_city_index');
            $table->index(['is_active', 'is_verified', 'name_ar'], 'teachers_active_verified_name_ar_index');
            $table->index(['is_active', 'is_verified', 'name_en'], 'teachers_active_verified_name_en_index');
            $table->index(
                ['is_active', 'is_verified', 'rating', 'reviews_count', 'students_count'],
                'teachers_active_verified_rank_index'
            );
        });
    }

    public function down(): void
    {
        Schema::table('teachers', function (Blueprint $table) {
            $table->dropIndex('teachers_active_verified_city_index');
            $table->dropIndex('teachers_active_verified_name_ar_index');
            $table->dropIndex('teachers_active_verified_name_en_index');
            $table->dropIndex('teachers_active_verified_rank_index');
        });
    }
};
