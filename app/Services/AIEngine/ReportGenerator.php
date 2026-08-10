<?php

namespace App\Services\AIEngine;

use App\Models\User;
use App\Models\InnovationIndex;

/**
 * AI-021 & AI-022: Report Generator
 *
 * Generates detailed AI-powered reports for students and institutions.
 */
class ReportGenerator
{
    public function __construct(
        private GeminiClient $client,
    ) {}

    /**
     * AI-020 & AI-021: Generate a student report
     */
    public function generateStudentReport(User $user): array
    {
        $user->load(['latestInnovationIndex', 'achievements', 'userSkills', 'qualifications']);
        $index = $user->latestInnovationIndex;

        if (!$index) {
            return ['report' => 'لم يتم حساب المؤشرات بعد.', 'sections' => []];
        }

        $prompt = $this->buildStudentReportPrompt($user, $index);

        $result = $this->client->chatWithJson([
            GeminiClient::systemMessage(
                'أنت كاتب تقارير أكاديمية محترف. قم بإنشاء تقرير شامل عن الطالب. '
                . 'أجب بصيغة JSON مع الحقول: '
                . 'title (string), summary (string), '
                . 'strengths_analysis (string), weaknesses_analysis (string), '
                . 'index_analysis (array of {index_name, score, analysis, recommendation}), '
                . 'overall_assessment (string), '
                . 'development_plan (array of {phase, duration, actions: array of strings}), '
                . 'conclusion (string)'
            ),
            GeminiClient::userMessage($prompt),
        ], temperature: 0.3, maxTokens: 5000);

        return $result ?? [
            'title'               => "تقرير {$user->name}",
            'summary'             => 'تعذر توليد التقرير حالياً.',
            'strengths_analysis'  => '',
            'weaknesses_analysis' => '',
            'index_analysis'      => [],
            'overall_assessment'  => '',
            'development_plan'    => [],
            'conclusion'          => '',
        ];
    }

    /**
     * AI-022: Generate institutional report
     */
    public function generateInstitutionalReport(User $institution): array
    {
        $students = $institution->students()->with('latestInnovationIndex')->get();

        if ($students->isEmpty()) {
            return ['report' => 'لا يوجد طلاب مسجلين.'];
        }

        $avgScores = [
            'skills'           => $students->avg(fn($s) => $s->latestInnovationIndex?->skills_index ?? 0),
            'innovation'       => $students->avg(fn($s) => $s->latestInnovationIndex?->innovation_index ?? 0),
            'intelligence'     => $students->avg(fn($s) => $s->latestInnovationIndex?->intelligence_index ?? 0),
            'creativity'       => $students->avg(fn($s) => $s->latestInnovationIndex?->creativity_index ?? 0),
            'projects'         => $students->avg(fn($s) => $s->latestInnovationIndex?->projects_index ?? 0),
            'leadership'       => $students->avg(fn($s) => $s->latestInnovationIndex?->leadership_index ?? 0),
            'ip'               => $students->avg(fn($s) => $s->latestInnovationIndex?->ip_index ?? 0),
            'future_readiness' => $students->avg(fn($s) => $s->latestInnovationIndex?->future_readiness_index ?? 0),
        ];

        $classifications = $students->groupBy(fn($s) => $s->latestInnovationIndex?->classification ?? 'developing')
            ->map->count();

        $prompt = <<<PROMPT
تقرير مؤسسي عن: {$institution->name}
عدد الطلاب: {$students->count()}

متوسط المؤشرات:
- المهارات: {$avgScores['skills']}
- الابتكار: {$avgScores['innovation']}
- الذكاء: {$avgScores['intelligence']}
- الإبداع: {$avgScores['creativity']}
- المشاريع: {$avgScores['projects']}
- القيادة: {$avgScores['leadership']}
- الملكية الفكرية: {$avgScores['ip']}
- الجاهزية المستقبلية: {$avgScores['future_readiness']}

التصنيفات:
{$classifications->map(fn($count, $class) => "- {$class}: {$count}")->implode("\n")}

قدم تقريراً مؤسسياً شاملاً مع توصيات لتحسين الأداء.
PROMPT;

        $result = $this->client->chatWithJson([
            GeminiClient::systemMessage(
                'أنت خبير تحليل مؤسسي. قم بإنشاء تقرير شامل عن أداء المؤسسة التعليمية. '
                . 'أجب بصيغة JSON مع: title, summary, index_averages_analysis, classification_distribution_analysis, '
                . 'strengths, improvement_areas, recommendations (array), conclusion.'
            ),
            GeminiClient::userMessage($prompt),
        ], temperature: 0.3, maxTokens: 5000);

        return $result ?? ['report' => 'تعذر توليد التقرير المؤسسي.'];
    }

    /**
     * Build student report prompt
     */
    private function buildStudentReportPrompt(User $user, InnovationIndex $index): string
    {
        $skills = $user->userSkills->pluck('name')->implode('، ');
        $achievements = $user->achievements->groupBy('type')->map->count();
        $classification = $index->getClassificationDetails();

        return <<<PROMPT
أنشئ تقريراً شاملاً عن الطالب:

الاسم: {$user->name}
المؤسسة: {$user->institution}
التصنيف: {$classification['label']}
الدرجة الإجمالية: {$index->overall_score}/100

المؤشرات التفصيلية:
- المهارات: {$index->skills_index}/100
- الابتكار: {$index->innovation_index}/100
- الذكاء: {$index->intelligence_index}/100
- الإبداع: {$index->creativity_index}/100
- المشاريع: {$index->projects_index}/100
- القيادة: {$index->leadership_index}/100
- الملكية الفكرية: {$index->ip_index}/100
- الجاهزية المستقبلية: {$index->future_readiness_index}/100

المهارات: {$skills}
الإنجازات: {$achievements->map(fn($c, $t) => "$t: $c")->implode(', ')}

أقوى نقطة: {$index->getStrongestIndex()}
أضعف نقطة: {$index->getWeakestIndex()}
{$this->buildCognitiveSection($user)}
PROMPT;
    }

    /**
     * ملخص التقييم المعرفي (ستانفورد-بينيه) إن وُجد
     */
    private function buildCognitiveSection(User $user): string
    {
        $assessment = $user->latestCognitiveAssessment;

        if (!$assessment) {
            return '';
        }

        return "\nالملف المعرفي (مقياس ستانفورد-بينيه):\n"
            . $assessment->toPromptSummary()
            . "\nضمّن في التقرير تحليلاً يربط بين الملف المعرفي والمؤشرات، وخطة تطوير تراعي نقاط الضعف المعرفية.\n";
    }
}
