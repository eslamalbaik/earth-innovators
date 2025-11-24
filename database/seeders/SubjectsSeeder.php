<?php

namespace Database\Seeders;

use App\Models\Subject;
use Illuminate\Database\Seeder;

class SubjectsSeeder extends Seeder
{
    public function run(): void
    {
        $subjects = [
            [
                'name_ar' => 'رياضيات',
                'name_en' => 'Mathematics',
                'image' => '/images/subjects/image1.png',
                'sort_order' => 1,
            ],
            [
                'name_ar' => 'فيزياء',
                'name_en' => 'Physics',
                'image' => '/images/subjects/image2.png',
                'sort_order' => 2,
            ],
            [
                'name_ar' => 'كيمياء',
                'name_en' => 'Chemistry',
                'image' => '/images/subjects/image3.png',
                'sort_order' => 3,
            ],
            [
                'name_ar' => 'أحياء',
                'name_en' => 'Biology',
                'image' => '/images/subjects/image4.png',
                'sort_order' => 4,
            ],
            [
                'name_ar' => 'علوم',
                'name_en' => 'Science',
                'image' => '/images/subjects/image2.png',
                'sort_order' => 5,
            ],
            [
                'name_ar' => 'اللغة الإنجليزية',
                'name_en' => 'English Language',
                'image' => '/images/subjects/image6.png',
                'sort_order' => 6,
            ],
            [
                'name_ar' => 'لغة عربية',
                'name_en' => 'Arabic Language',
                'image' => '/images/subjects/image1.png',
                'sort_order' => 7,
            ],
            [
                'name_ar' => 'الدراسات الإسلامية',
                'name_en' => 'Islamic Studies',
                'image' => '/images/subjects/image5.png',
                'sort_order' => 8,
            ],
            [
                'name_ar' => 'مهارات الحاسب',
                'name_en' => 'Computer Skills',
                'image' => '/images/subjects/image7.png',
                'sort_order' => 9,
            ],
            [
                'name_ar' => 'اجتماعيات',
                'name_en' => 'Social Studies',
                'image' => '/images/subjects/image8.png',
                'sort_order' => 10,
            ],
            [
                'name_ar' => 'تاريخ',
                'name_en' => 'History',
                'image' => '/images/subjects/image3.png',
                'sort_order' => 11,
            ],
            [
                'name_ar' => 'جغرافيا',
                'name_en' => 'Geography',
                'image' => '/images/subjects/image4.png',
                'sort_order' => 12,
            ],
        ];

        foreach ($subjects as $subject) {
            Subject::create($subject);
            $this->command->info("Subject {$subject['name_ar']} created successfully!");
        }

        Subject::all()->each(function ($subject) {
            $count = \App\Models\Teacher::where('is_active', true)
                ->where(function ($query) use ($subject) {
                    $query->whereRaw('subjects LIKE ?', ['%"' . $subject->name_ar . '"%']);
                })
                ->count();

            $subject->update(['teacher_count' => $count]);
        });
    }
}