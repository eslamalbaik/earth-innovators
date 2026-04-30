<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('packages', function (Blueprint $table) {
            $table->enum('audience', ['all', 'student', 'teacher', 'school', 'educational_institution'])
                ->default('all')
                ->after('features_ar');
        });

        DB::table('packages')->whereNull('audience')->update(['audience' => 'all']);
    }

    public function down(): void
    {
        Schema::table('packages', function (Blueprint $table) {
            $table->dropColumn('audience');
        });
    }
};
