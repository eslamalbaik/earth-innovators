<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class CurriculumSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $curriculums = [
            ['name_ar' => 'أمريكي', 'name_en' => 'American'],
            ['name_ar' => 'بريطاني', 'name_en' => 'British'],
            ['name_ar' => 'وزارة التربية والتعليم', 'name_en' => 'Ministry of Education'],
        ];

        foreach ($curriculums as $curr) {
            \App\Models\Curriculum::firstOrCreate(
                ['name_ar' => $curr['name_ar']],
                ['name_en' => $curr['name_en'], 'is_active' => true]
            );
        }
    }
}
