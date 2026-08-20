<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class SubjectSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $subjects = [
            'اللغة العربية',
            'اللغة الإنجليزية',
            'الرياضيات',
            'العلوم',
            'الكيمياء',
            'الفيزياء',
            'الهوية والقيم والأسرة',
            'الابتكار والاختراع',
            'الذكاء الاجتماعي والعاطفي',
            'الذكاء الاصطناعي والتقنيات المستقبلية'
        ];

        foreach ($subjects as $index => $subject) {
            \App\Models\Subject::firstOrCreate(
                ['name_ar' => $subject],
                ['is_active' => true, 'sort_order' => $index]
            );
        }
    }
}
