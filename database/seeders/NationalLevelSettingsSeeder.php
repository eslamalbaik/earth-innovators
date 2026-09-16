<?php

namespace Database\Seeders;

use App\Models\NationalLevelSetting;
use Illuminate\Database\Seeder;

class NationalLevelSettingsSeeder extends Seeder
{
    public function run(): void
    {
        $levels = [
            ['code' => 'L1', 'label_ar' => 'مبتدئ',        'label_en' => 'Beginner',         'min_score' => 0,  'max_score' => 39,  'color' => '#94a3b8', 'sort_order' => 1],
            ['code' => 'L2', 'label_ar' => 'مستخدم أساسي',  'label_en' => 'Basic User',        'min_score' => 40, 'max_score' => 59,  'color' => '#60a5fa', 'sort_order' => 2],
            ['code' => 'L3', 'label_ar' => 'مستخدم متمكن',  'label_en' => 'Proficient User',   'min_score' => 60, 'max_score' => 74,  'color' => '#34d399', 'sort_order' => 3],
            ['code' => 'L4', 'label_ar' => 'مستخدم متقدم',  'label_en' => 'Advanced User',     'min_score' => 75, 'max_score' => 89,  'color' => '#fbbf24', 'sort_order' => 4],
            ['code' => 'L5', 'label_ar' => 'قائد ومبتكر',   'label_en' => 'Leader & Innovator', 'min_score' => 90, 'max_score' => 100, 'color' => '#f472b6', 'sort_order' => 5],
        ];

        foreach ($levels as $level) {
            NationalLevelSetting::updateOrCreate(['code' => $level['code']], $level);
        }

        NationalLevelSetting::flushCache();
    }
}
