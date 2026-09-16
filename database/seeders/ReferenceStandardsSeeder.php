<?php

namespace Database\Seeders;

use App\Models\ReferenceStandard;
use Illuminate\Database\Seeder;

class ReferenceStandardsSeeder extends Seeder
{
    public function run(): void
    {
        $rows = [
            // National
            ['scope' => 'national', 'domain_ar' => 'المؤهلات', 'domain_en' => 'Qualifications', 'standard_name' => 'QFEmirates', 'usage_ar' => 'تقييم مستوى المؤهل', 'usage_en' => 'Assessing qualification level', 'index_key' => null],
            ['scope' => 'national', 'domain_ar' => 'التعليم', 'domain_en' => 'Education', 'standard_name' => 'معايير جودة التعليم', 'usage_ar' => 'قياس تطور المتعلم والمعلم', 'usage_en' => 'Measuring learner and teacher growth', 'index_key' => null],
            ['scope' => 'national', 'domain_ar' => 'المهارات', 'domain_en' => 'Skills', 'standard_name' => 'أطر الكفاءات المهنية والمهارات المستقبلية', 'usage_ar' => 'تصنيف المهارات', 'usage_en' => 'Classifying skills', 'index_key' => 'skills'],
            ['scope' => 'national', 'domain_ar' => 'الابتكار', 'domain_en' => 'Innovation', 'standard_name' => 'الاستراتيجية الوطنية للابتكار', 'usage_ar' => 'تقييم الابتكارات', 'usage_en' => 'Evaluating innovations', 'index_key' => 'innovation'],
            ['scope' => 'national', 'domain_ar' => 'الذكاء الاصطناعي', 'domain_en' => 'Artificial Intelligence', 'standard_name' => 'استراتيجية الإمارات للذكاء الاصطناعي', 'usage_ar' => 'قياس جاهزية المستقبل', 'usage_en' => 'Measuring future readiness', 'index_key' => 'future_readiness'],
            ['scope' => 'national', 'domain_ar' => 'البحث العلمي', 'domain_en' => 'Scientific Research', 'standard_name' => 'منظومة البحث والابتكار', 'usage_ar' => 'تقييم الأبحاث', 'usage_en' => 'Evaluating research', 'index_key' => 'ip'],
            ['scope' => 'national', 'domain_ar' => 'التميز', 'domain_en' => 'Excellence', 'standard_name' => 'منظومة التميز الحكومي', 'usage_ar' => 'قياس الإنجاز والأثر', 'usage_en' => 'Measuring achievement and impact', 'index_key' => 'leadership'],

            // International
            ['scope' => 'international', 'domain_ar' => 'المهارات الرقمية', 'domain_en' => 'Digital Skills', 'standard_name' => 'SFIA', 'usage_ar' => 'تقييم المهارات التقنية', 'usage_en' => 'Assessing technical skills', 'index_key' => 'skills'],
            ['scope' => 'international', 'domain_ar' => 'التعليم', 'domain_en' => 'Education', 'standard_name' => 'UNESCO Frameworks', 'usage_ar' => 'تقييم الكفاءات التعليمية', 'usage_en' => 'Assessing educational competencies', 'index_key' => null],
            ['scope' => 'international', 'domain_ar' => 'المؤهلات', 'domain_en' => 'Qualifications', 'standard_name' => 'ISCED / EQF', 'usage_ar' => 'مقارنة المؤهلات', 'usage_en' => 'Comparing qualifications', 'index_key' => null],
            ['scope' => 'international', 'domain_ar' => 'الجودة', 'domain_en' => 'Quality', 'standard_name' => 'ISO Standards', 'usage_ar' => 'قياس جودة العمليات', 'usage_en' => 'Measuring process quality', 'index_key' => null],
            ['scope' => 'international', 'domain_ar' => 'الابتكار', 'domain_en' => 'Innovation', 'standard_name' => 'ISO 56002', 'usage_ar' => 'إدارة الابتكار', 'usage_en' => 'Innovation management', 'index_key' => 'innovation'],
            ['scope' => 'international', 'domain_ar' => 'المشاريع', 'domain_en' => 'Projects', 'standard_name' => 'PMBOK / ISO 21502', 'usage_ar' => 'تقييم إدارة المشاريع', 'usage_en' => 'Assessing project management', 'index_key' => 'projects'],
            ['scope' => 'international', 'domain_ar' => 'التميز', 'domain_en' => 'Excellence', 'standard_name' => 'EFQM', 'usage_ar' => 'قياس الأداء المؤسسي', 'usage_en' => 'Measuring institutional performance', 'index_key' => 'leadership'],
            ['scope' => 'international', 'domain_ar' => 'البحث', 'domain_en' => 'Research', 'standard_name' => 'Scopus / ORCID', 'usage_ar' => 'تحليل الإنتاج العلمي', 'usage_en' => 'Analyzing scientific output', 'index_key' => 'ip'],
            ['scope' => 'international', 'domain_ar' => 'الملكية الفكرية', 'domain_en' => 'Intellectual Property', 'standard_name' => 'WIPO', 'usage_ar' => 'تقييم البراءات والحقوق', 'usage_en' => 'Assessing patents and rights', 'index_key' => 'ip'],
        ];

        foreach ($rows as $i => $row) {
            ReferenceStandard::updateOrCreate(
                ['scope' => $row['scope'], 'standard_name' => $row['standard_name'], 'domain_ar' => $row['domain_ar']],
                $row + ['sort_order' => $i, 'is_active' => true]
            );
        }

        ReferenceStandard::flushCache();
    }
}
