<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    private const LEGACY_TYPES = [
        '60_seconds',
        'mental_math',
        'conversions',
        'team_fastest',
        'build_problem',
        'custom',
    ];

    private const ALL_TYPES = [
        'cognitive',
        'applied',
        'creative',
        'artistic_creative',
        'collaborative',
        'analytical',
        'technological',
        'behavioral',
        '60_seconds',
        'mental_math',
        'conversions',
        'team_fastest',
        'build_problem',
        'custom',
    ];

    /**
     * 2026_05_13_000001_expand_challenge_type_enum_values only expanded the
     * challenge_type enum on MySQL, leaving SQLite (local dev + tests) stuck
     * with the old 6-value CHECK constraint that rejects cognitive/applied/
     * creative/etc.
     */
    public function up(): void
    {
        if (DB::getDriverName() !== 'sqlite') {
            return;
        }

        Schema::table('challenges', function (Blueprint $table) {
            $table->enum('challenge_type', self::ALL_TYPES)->nullable()->change();
        });
    }

    public function down(): void
    {
        if (DB::getDriverName() !== 'sqlite') {
            return;
        }

        DB::table('challenges')
            ->whereNotNull('challenge_type')
            ->whereNotIn('challenge_type', self::LEGACY_TYPES)
            ->update(['challenge_type' => 'custom']);

        Schema::table('challenges', function (Blueprint $table) {
            $table->enum('challenge_type', self::LEGACY_TYPES)->nullable()->change();
        });
    }
};
