<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

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

    public function up(): void
    {
        if (DB::getDriverName() !== 'mysql') {
            return;
        }

        DB::statement($this->alterEnumSql(self::ALL_TYPES));
    }

    public function down(): void
    {
        if (DB::getDriverName() !== 'mysql') {
            return;
        }

        DB::table('challenges')
            ->whereNotNull('challenge_type')
            ->whereNotIn('challenge_type', self::LEGACY_TYPES)
            ->update(['challenge_type' => 'custom']);

        DB::statement($this->alterEnumSql(self::LEGACY_TYPES));
    }

    private function alterEnumSql(array $types): string
    {
        $values = collect($types)
            ->map(fn (string $type) => "'" . str_replace("'", "''", $type) . "'")
            ->implode(',');

        return "ALTER TABLE `challenges` MODIFY `challenge_type` ENUM({$values}) NULL";
    }
};
