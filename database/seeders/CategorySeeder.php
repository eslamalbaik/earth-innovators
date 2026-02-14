<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Category;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Project Categories (فئات المشاريع)
        $projectCategories = [
            ['name' => 'علوم', 'slug' => 'science', 'description' => 'التحديات العلمية', 'type' => 'project'],
            ['name' => 'فني', 'slug' => 'arts', 'description' => 'التحديات الفنية', 'type' => 'project'],
            ['name' => 'تقني', 'slug' => 'technology', 'description' => 'التحديات التقنية', 'type' => 'project'],
            ['name' => 'تراثي', 'slug' => 'heritage', 'description' => 'التحديات التراثية', 'type' => 'project'],
            ['name' => 'بيئي', 'slug' => 'environmental', 'description' => 'التحديات البيئية', 'type' => 'project'],
            ['name' => 'رياضيات', 'slug' => 'mathematics', 'description' => 'التحديات الرياضية', 'type' => 'project'],
            ['name' => 'هندسة', 'slug' => 'engineering', 'description' => 'التحديات الهندسية', 'type' => 'project'],
            ['name' => 'أخرى', 'slug' => 'other', 'description' => 'تحديات أخرى', 'type' => 'project'],
        ];

        // Instructional Approach Categories (فئات النهج التعليمي)
        $instructionalApproaches = [
            ['name' => 'النهج القائم على اللعب', 'slug' => 'play_based', 'description' => 'النهج القائم على اللعب (Play-Based Approach)', 'type' => 'instructional_approach'],
            ['name' => 'النهج القائم على حل المشكلات', 'slug' => 'problem_based', 'description' => 'النهج القائم على حل المشكلات (Problem-Based Approach)', 'type' => 'instructional_approach'],
            ['name' => 'مشاريع التعلم القائم على المشاريع', 'slug' => 'pbl', 'description' => 'مشاريع التعلم القائم على المشاريع (PBL) وأدوات SEL/PSS', 'type' => 'instructional_approach'],
            ['name' => 'التعليم التحويلي', 'slug' => 'transformative', 'description' => 'التعليم التحويلي (Transformative Education)', 'type' => 'instructional_approach'],
            ['name' => 'التعليم المسرّع', 'slug' => 'accelerated', 'description' => 'التعليم المسرّع (Accelerated Education Program - AEP)', 'type' => 'instructional_approach'],
            ['name' => 'منهج التحسين', 'slug' => 'improvement', 'description' => 'منهج التحسين (Improvement Approach)', 'type' => 'instructional_approach'],
        ];

        // Subject Categories (المواد)
        $subjects = [
            ['name' => 'الرياضيات', 'slug' => 'math', 'description' => 'الرياضيات', 'type' => 'subject'],
            ['name' => 'اللغة العربية', 'slug' => 'arabic', 'description' => 'اللغة العربية', 'type' => 'subject'],
            ['name' => 'اللغة الإنجليزية', 'slug' => 'english', 'description' => 'اللغة الإنجليزية', 'type' => 'subject'],
            ['name' => 'الدراسات الاجتماعية', 'slug' => 'social_studies', 'description' => 'الدراسات الاجتماعية', 'type' => 'subject'],
            ['name' => 'الفنون', 'slug' => 'arts_subject', 'description' => 'الفنون', 'type' => 'subject'],
            ['name' => 'الرياضة', 'slug' => 'sports', 'description' => 'الرياضة', 'type' => 'subject'],
            ['name' => 'الهندسة', 'slug' => 'engineering_subject', 'description' => 'الهندسة', 'type' => 'subject'],
            ['name' => 'العلوم', 'slug' => 'science_subject', 'description' => 'العلوم', 'type' => 'subject'],
            ['name' => 'التقنية', 'slug' => 'technology_subject', 'description' => 'التقنية', 'type' => 'subject'],
            ['name' => 'الفيزياء والكيمياء والأحياء', 'slug' => 'physics_chem_bio', 'description' => 'الفيزياء والكيمياء والأحياء', 'type' => 'subject'],
        ];

        // Grade Levels (الصفوف)
        $grades = [
            ['name' => 'الصف الأول', 'slug' => 'grade_1', 'description' => 'الصف الأول الابتدائي', 'type' => 'grade'],
            ['name' => 'الصف الثاني', 'slug' => 'grade_2', 'description' => 'الصف الثاني الابتدائي', 'type' => 'grade'],
            ['name' => 'الصف الثالث', 'slug' => 'grade_3', 'description' => 'صف الثالث الابتدائي', 'type' => 'grade'],
            ['name' => 'الصف الرابع', 'slug' => 'grade_4', 'description' => 'الصف الرابع الابتدائي', 'type' => 'grade'],
            ['name' => 'الصف الخامس', 'slug' => 'grade_5', 'description' => 'الصف الخامس الابتدائي', 'type' => 'grade'],
            ['name' => 'الصف السادس', 'slug' => 'grade_6', 'description' => 'الصف السادس الابتدائي', 'type' => 'grade'],
            ['name' => 'الصف السابع', 'slug' => 'grade_7', 'description' => 'الصف السابع المتوسط', 'type' => 'grade'],
            ['name' => 'الصف الثامن', 'slug' => 'grade_8', 'description' => 'الصف الثامن المتوسط', 'type' => 'grade'],
            ['name' => 'الصف التاسع', 'slug' => 'grade_9', 'description' => 'الصف التاسع المتوسط', 'type' => 'grade'],
            ['name' => 'الصف العاشر', 'slug' => 'grade_10', 'description' => 'الصف العاشر الثانوي', 'type' => 'grade'],
            ['name' => 'الصف الحادي عشر', 'slug' => 'grade_11', 'description' => 'الصف الحادي عشر الثانوي', 'type' => 'grade'],
            ['name' => 'الصف الثاني عشر', 'slug' => 'grade_12', 'description' => 'الصف الثاني عشر الثانوي', 'type' => 'grade'],
        ];

        // Merge all categories
        $allCategories = array_merge($projectCategories, $instructionalApproaches, $subjects, $grades);

        foreach ($allCategories as $category) {
            Category::updateOrCreate(
                ['slug' => $category['slug']],
                $category
            );
        }
    }
}
