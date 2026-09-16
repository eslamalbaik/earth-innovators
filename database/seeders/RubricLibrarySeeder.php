<?php

namespace Database\Seeders;

use App\Models\RubricCriterionLibrary;
use Illuminate\Database\Seeder;

/**
 * Seeds the platform-wide library of ready-made rubric criteria teachers can
 * drop into a rubric and customize. Idempotent (updateOrCreate by name) so
 * it is safe to re-run.
 */
class RubricLibrarySeeder extends Seeder
{
    public function run(): void
    {
        $standardLevels = [
            ['name' => 'Excellent', 'name_ar' => 'ممتاز', 'score' => 4, 'description' => 'Consistently exceeds expectations with clear, compelling evidence.', 'description_ar' => 'يتجاوز التوقعات باستمرار مع أدلة واضحة ومقنعة.'],
            ['name' => 'Good', 'name_ar' => 'جيد', 'score' => 3, 'description' => 'Meets expectations with solid, adequate evidence.', 'description_ar' => 'يفي بالتوقعات مع أدلة كافية وجيدة.'],
            ['name' => 'Fair', 'name_ar' => 'مقبول', 'score' => 2, 'description' => 'Partially meets expectations; evidence is limited or inconsistent.', 'description_ar' => 'يفي جزئياً بالتوقعات؛ الأدلة محدودة أو غير متسقة.'],
            ['name' => 'Needs Improvement', 'name_ar' => 'يحتاج تحسين', 'score' => 1, 'description' => 'Falls short of expectations with little or no supporting evidence.', 'description_ar' => 'لا يفي بالتوقعات مع أدلة داعمة قليلة أو معدومة.'],
        ];

        $criteria = [
            [
                'name' => 'Creativity & Originality',
                'name_ar' => 'الإبداع والأصالة',
                'description' => 'How original and imaginative the idea or solution is.',
                'description_ar' => 'مدى أصالة وإبداع الفكرة أو الحل المقدم.',
                'default_weight' => 20,
                'category' => 'creativity',
            ],
            [
                'name' => 'Technical Execution',
                'name_ar' => 'التنفيذ التقني',
                'description' => 'Quality and correctness of the technical implementation.',
                'description_ar' => 'جودة ودقة التنفيذ التقني للمشروع.',
                'default_weight' => 20,
                'category' => 'technical',
            ],
            [
                'name' => 'Problem Solving',
                'name_ar' => 'حل المشكلات',
                'description' => 'How clearly the project identifies and addresses a real problem.',
                'description_ar' => 'مدى وضوح تحديد المشروع لمشكلة حقيقية ومعالجتها.',
                'default_weight' => 15,
                'category' => 'technical',
            ],
            [
                'name' => 'Presentation & Communication',
                'name_ar' => 'العرض والتواصل',
                'description' => 'Clarity and quality of how the work is presented and explained.',
                'description_ar' => 'وضوح وجودة عرض العمل وشرحه.',
                'default_weight' => 15,
                'category' => 'presentation',
            ],
            [
                'name' => 'Research & Evidence',
                'name_ar' => 'البحث والأدلة',
                'description' => 'Depth of research and quality of supporting evidence.',
                'description_ar' => 'عمق البحث وجودة الأدلة الداعمة.',
                'default_weight' => 10,
                'category' => 'research',
            ],
            [
                'name' => 'Teamwork & Collaboration',
                'name_ar' => 'العمل الجماعي والتعاون',
                'description' => 'Evidence of effective collaboration when the project is a team effort.',
                'description_ar' => 'مدى وضوح التعاون الفعّال عند العمل الجماعي.',
                'default_weight' => 10,
                'category' => 'collaboration',
            ],
            [
                'name' => 'Real-World Impact',
                'name_ar' => 'الأثر الواقعي',
                'description' => 'Potential positive impact of the project on real users or the community.',
                'description_ar' => 'الأثر الإيجابي المحتمل للمشروع على المستخدمين الفعليين أو المجتمع.',
                'default_weight' => 5,
                'category' => 'impact',
            ],
            [
                'name' => 'Documentation Quality',
                'name_ar' => 'جودة التوثيق',
                'description' => 'Completeness and clarity of the written documentation.',
                'description_ar' => 'اكتمال ووضوح التوثيق المكتوب للمشروع.',
                'default_weight' => 5,
                'category' => 'documentation',
            ],
        ];

        foreach ($criteria as $criterion) {
            RubricCriterionLibrary::updateOrCreate(
                ['name' => $criterion['name']],
                $criterion + ['levels' => $standardLevels, 'is_active' => true]
            );
        }
    }
}
