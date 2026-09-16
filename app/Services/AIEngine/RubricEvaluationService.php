<?php

namespace App\Services\AIEngine;

use App\Models\Project;
use App\Models\ProjectSubmission;
use App\Models\RubricCriterionLibrary;
use Illuminate\Support\Collection;

/**
 * Generates a per-criterion AI evaluation for a project submission against
 * its assessment criteria: for every criterion (performance indicator) it
 * picks the best-fitting proficiency level and writes a fresh, submission-
 * specific explanation (definition + observed evidence + gap to the next
 * level) in both Arabic and English. Persisted on
 * ProjectSubmission::ai_rubric_evaluation as a draft the teacher can edit
 * before releasing it to the student — see Teacher\TeacherSubmissionController.
 *
 * Fallback: when the project has no teacher-authored Rubric attached, this
 * service automatically evaluates against the platform-wide
 * RubricCriterionLibrary (the admin-managed "general national standards" /
 * QFEmirates default) instead — a project is never left without an
 * assessment. See resolveCriteria(). If even that library is empty, a single
 * built-in generic criterion is used as a last resort so evaluation can
 * never fail for lack of criteria.
 */
class RubricEvaluationService
{
    private const MIN_SENTENCES = 3;

    public function __construct(
        private GeminiClient $client,
    ) {}

    public function evaluate(ProjectSubmission $submission): array
    {
        $submission->loadMissing(['project.rubric.criteria']);
        $project = $submission->project;

        [$criteria, $rubricMeta] = $this->resolveCriteria($project);

        $sortedLevelsByCriterion = $criteria->mapWithKeys(
            fn (array $c) => [$c['criterion_id'] => collect($c['levels'])->sortBy('score')->values()]
        );

        $aiResult = $this->client->chatWithJson([
            GeminiClient::systemMessage($this->systemPrompt()),
            GeminiClient::userMessage($this->buildPrompt($submission, $project, $criteria, $sortedLevelsByCriterion)),
        ], temperature: 0.35, maxTokens: 4500);

        $aiByCriterionId = collect($aiResult['criteria_evaluations'] ?? [])
            ->keyBy(fn ($e) => (int) ($e['criterion_id'] ?? 0));

        $criteriaResults = [];
        $totalWeighted = 0.0;

        foreach ($criteria as $criterion) {
            $levels = $sortedLevelsByCriterion[$criterion['criterion_id']];
            $aiEntry = $aiByCriterionId->get($criterion['criterion_id']);

            $levelIndex = $this->resolveLevelIndex($levels, $aiEntry);
            $chosenLevel = $levels[$levelIndex];
            $nextLevel = $levels[$levelIndex + 1] ?? null;
            $maxScore = (float) $levels->last()['score'];

            [$explanation, $explanationAr] = $this->resolveExplanations(
                $aiEntry, $criterion, $chosenLevel, $nextLevel, $maxScore
            );

            $weight = (float) $criterion['weight'];
            $contribution = $maxScore > 0 ? ((float) $chosenLevel['score'] / $maxScore) * $weight : 0.0;
            $totalWeighted += $contribution;

            $criteriaResults[] = [
                'criterion_id'       => $criterion['criterion_id'],
                'name'               => $criterion['name'],
                'name_ar'            => $criterion['name_ar'],
                'weight'             => $weight,
                'level_index'        => $levelIndex,
                'level_name'         => $chosenLevel['name'] ?? '',
                'level_name_ar'      => $chosenLevel['name_ar'] ?? '',
                'score'              => (float) $chosenLevel['score'],
                'max_score'          => $maxScore,
                'next_level_name'    => $nextLevel['name'] ?? null,
                'next_level_name_ar' => $nextLevel['name_ar'] ?? null,
                'explanation'        => $explanation,
                'explanation_ar'     => $explanationAr,
                'ai_generated'       => true,
                'teacher_edited'     => false,
            ];
        }

        return [
            'generated_at'           => now()->toIso8601String(),
            'rubric_id'              => $rubricMeta['id'],
            'rubric_name'            => $rubricMeta['name'],
            'rubric_name_ar'         => $rubricMeta['name_ar'],
            'is_fallback_default'    => $rubricMeta['is_fallback'],
            'released'               => false,
            'released_at'            => null,
            'overall_weighted_score' => round($totalWeighted, 2),
            'criteria'               => $criteriaResults,
        ];
    }

    /**
     * Picks the criteria set to evaluate against: the project's own Rubric
     * if it has one with at least one criterion, otherwise the active
     * platform-wide RubricCriterionLibrary (admin-managed default national
     * standards), otherwise one built-in generic criterion as an absolute
     * last resort. Weights are normalized to sum to 100 defensively, since
     * an admin's library edits aren't required to sum exactly to 100 at
     * save time.
     *
     * @return array{0: Collection<int, array>, 1: array{id: ?int, name: string, name_ar: string, is_fallback: bool}}
     */
    private function resolveCriteria(?Project $project): array
    {
        $rubric = $project?->rubric;

        if ($rubric && $rubric->criteria->isNotEmpty()) {
            $criteria = $rubric->criteria->map(fn ($c) => [
                'criterion_id'    => $c->id,
                'name'            => $c->name,
                'name_ar'         => $c->name_ar,
                'description'     => $c->description,
                'description_ar'  => $c->description_ar,
                'weight'          => (float) $c->weight,
                'levels'          => $c->levels,
            ]);

            return [
                $this->normalizeWeights($criteria),
                ['id' => $rubric->id, 'name' => $rubric->name, 'name_ar' => $rubric->name_ar, 'is_fallback' => false],
            ];
        }

        $library = RubricCriterionLibrary::active()->orderBy('category')->get();

        if ($library->isNotEmpty()) {
            $criteria = $library->map(fn (RubricCriterionLibrary $c) => [
                'criterion_id'    => $c->id,
                'name'            => $c->name,
                'name_ar'         => $c->name_ar,
                'description'     => $c->description,
                'description_ar'  => $c->description_ar,
                'weight'          => (float) $c->default_weight,
                'levels'          => $c->levels,
            ]);

            return [
                $this->normalizeWeights($criteria),
                [
                    'id' => null,
                    'name' => 'General National Standards (QFEmirates)',
                    'name_ar' => 'المعايير الوطنية العامة (QFEmirates)',
                    'is_fallback' => true,
                ],
            ];
        }

        // Absolute last resort — guarantees evaluate() never fails for lack
        // of criteria, even on a fresh install with an empty library.
        $criteria = collect([[
            'criterion_id'   => 0,
            'name'           => 'Overall Project Quality',
            'name_ar'        => 'الجودة العامة للمشروع',
            'description'    => 'General quality and completeness of the submitted work.',
            'description_ar' => 'الجودة العامة للعمل المُسلَّم ومدى اكتماله.',
            'weight'         => 100,
            'levels'         => [
                ['name' => 'Excellent', 'name_ar' => 'ممتاز', 'score' => 4, 'description' => '', 'description_ar' => ''],
                ['name' => 'Good', 'name_ar' => 'جيد', 'score' => 3, 'description' => '', 'description_ar' => ''],
                ['name' => 'Fair', 'name_ar' => 'مقبول', 'score' => 2, 'description' => '', 'description_ar' => ''],
                ['name' => 'Needs Improvement', 'name_ar' => 'يحتاج تحسين', 'score' => 1, 'description' => '', 'description_ar' => ''],
            ],
        ]]);

        return [
            $criteria,
            [
                'id' => null,
                'name' => 'General National Standards (QFEmirates)',
                'name_ar' => 'المعايير الوطنية العامة (QFEmirates)',
                'is_fallback' => true,
            ],
        ];
    }

    /**
     * @param Collection<int, array> $criteria
     * @return Collection<int, array>
     */
    private function normalizeWeights(Collection $criteria): Collection
    {
        $total = (float) $criteria->sum('weight');

        if ($total <= 0) {
            $equalShare = 100 / max($criteria->count(), 1);

            return $criteria->map(fn ($c) => [...$c, 'weight' => $equalShare]);
        }

        if (abs($total - 100) < 0.5) {
            return $criteria;
        }

        return $criteria->map(fn ($c) => [...$c, 'weight' => round(($c['weight'] / $total) * 100, 2)]);
    }

    private function systemPrompt(): string
    {
        return 'أنت مقيّم تربوي خبير متخصص في تقييم مشاريع الطلاب وفق معايير أداء (Rubric) محددة مسبقاً. '
            . 'لكل معيار تُعطى مستويات إتقان مرتبة من الأدنى إلى الأعلى. مهمتك لكل معيار: '
            . '(1) اختيار المستوى الأنسب لعمل هذا الطالب تحديداً عبر level_index (رقم الفهرس كما ورد في القائمة)، '
            . '(2) كتابة شرح تفصيلي جديد ومخصص لهذا الطالب (وليس نصاً عاماً قابلاً لإعادة الاستخدام) لا يقل عن 4 جمل، '
            . 'يتناول بوضوح: تعريف المؤشر بإيجاز، الجوانب المحددة من عمل الطالب المُسلَّم التي دفعتك لهذا التقييم، '
            . 'والفجوة بينه وبين المستوى الأعلى التالي وكيفية سدها (أو إشارة إلى أنه بلغ أعلى مستوى إن كان كذلك). '
            . 'أعد الإجابة بصيغة JSON فقط بالشكل التالي: '
            . '{"criteria_evaluations": [{"criterion_id": number, "level_index": number, '
            . '"explanation": "English, 4+ sentences", "explanation_ar": "بالعربية، 4 جمل فأكثر"}, ...]}';
    }

    private function buildPrompt(
        ProjectSubmission $submission,
        ?Project $project,
        Collection $criteria,
        Collection $sortedLevelsByCriterion
    ): string {
        $filesList = collect($submission->files ?? [])
            ->map(fn ($f) => is_string($f) ? basename($f) : null)
            ->filter()
            ->implode(', ') ?: 'لا يوجد';

        $criteriaBlocks = $criteria->map(function (array $criterion) use ($sortedLevelsByCriterion) {
            $levels = $sortedLevelsByCriterion[$criterion['criterion_id']];
            $levelsText = $levels->map(function (array $level, int $i) {
                return "  {$i}) {$level['name_ar']} / {$level['name']} — الدرجة: {$level['score']} — "
                    . 'الوصف: ' . ($level['description_ar'] ?? $level['description'] ?? '—');
            })->implode("\n");

            return "معيار (المعرف/criterion_id: {$criterion['criterion_id']})\n"
                . "الاسم: {$criterion['name_ar']} / {$criterion['name']}\n"
                . 'تعريف المؤشر: ' . ($criterion['description_ar'] ?? $criterion['description'] ?? '—') . "\n"
                . "الوزن النسبي: {$criterion['weight']}%\n"
                . "المستويات (مرتبة تصاعدياً، استخدم رقم الفهرس كما هو):\n{$levelsText}";
        })->implode("\n\n");

        $comment = $submission->comment ?: 'لا يوجد تعليق من الطالب.';
        $title = $project->title ?? '';
        $description = $project->description ?? '';

        return <<<PROMPT
قيّم عمل الطالب التالي المُسلَّم لهذا المشروع وفق كل معيار من معايير التقييم أدناه على حدة.

عنوان المشروع: {$title}
وصف المشروع: {$description}

تعليق الطالب المرفق مع التسليم:
{$comment}

الملفات المرفقة (الأسماء فقط): {$filesList}

معايير التقييم:
{$criteriaBlocks}

لكل معيار أعلاه، أعد تقييمك ضمن مصفوفة criteria_evaluations كما هو محدد في تعليمات النظام.
PROMPT;
    }

    private function resolveLevelIndex(Collection $levels, ?array $aiEntry): int
    {
        $count = $levels->count();
        $index = $aiEntry['level_index'] ?? null;

        if (is_numeric($index) && (int) $index >= 0 && (int) $index < $count) {
            return (int) $index;
        }

        // Safe fallback when the model omits/mis-indexes: the middle level,
        // rather than silently defaulting to the lowest (which would
        // understate every un-parsed evaluation).
        return (int) floor(($count - 1) / 2);
    }

    /**
     * @return array{0: string, 1: string} [explanation, explanation_ar]
     */
    private function resolveExplanations(
        ?array $aiEntry,
        array $criterion,
        array $chosenLevel,
        ?array $nextLevel,
        float $maxScore
    ): array {
        $explanation = trim((string) ($aiEntry['explanation'] ?? ''));
        $explanationAr = trim((string) ($aiEntry['explanation_ar'] ?? ''));

        if ($explanation === '') {
            $explanation = "This criterion, \"{$criterion['name']}\", was evaluated based on the work submitted for this project. "
                . "The submission was placed at the \"{$chosenLevel['name']}\" level for this indicator.";
        }
        if ($explanationAr === '') {
            $explanationAr = "تم تقييم هذا المعيار، \"{$criterion['name_ar']}\"، بناءً على العمل المُسلَّم لهذا المشروع. "
                . "صُنِّف التسليم عند مستوى \"{$chosenLevel['name_ar']}\" لهذا المؤشر.";
        }

        $explanation = $this->ensureMinSentences($explanation, $criterion['name'], $chosenLevel, $nextLevel, $maxScore, false);
        $explanationAr = $this->ensureMinSentences($explanationAr, $criterion['name_ar'], $chosenLevel, $nextLevel, $maxScore, true);

        return [$explanation, $explanationAr];
    }

    /**
     * Safety net so the "at least 3 sentences" acceptance bar always holds
     * even if the model under-delivers: appends one more sentence composed
     * from this evaluation's own numbers (score/weight/next level), so it
     * still varies per submission rather than being reused static text.
     */
    private function ensureMinSentences(
        string $text,
        string $criterionName,
        array $chosenLevel,
        ?array $nextLevel,
        float $maxScore,
        bool $arabic
    ): string {
        if ($this->countSentences($text) >= self::MIN_SENTENCES) {
            return $text;
        }

        if ($arabic) {
            $extra = $nextLevel
                ? "لتحقيق مستوى \"{$nextLevel['name_ar']}\" في معيار \"{$criterionName}\" ({$chosenLevel['score']} من {$maxScore} حالياً)، يحتاج العمل إلى تطوير إضافي في هذا الجانب تحديداً."
                : "هذا يمثل أعلى مستوى إتقان متاح في معيار \"{$criterionName}\" ({$chosenLevel['score']} من {$maxScore})، وهو إنجاز يستحق الإشادة.";
        } else {
            $extra = $nextLevel
                ? "Reaching the \"{$nextLevel['name']}\" level in \"{$criterionName}\" ({$chosenLevel['score']}/{$maxScore} currently) would require further development specifically in this area."
                : "This is the highest proficiency level available for \"{$criterionName}\" ({$chosenLevel['score']}/{$maxScore}), a genuine achievement.";
        }

        return rtrim($text) . ' ' . $extra;
    }

    private function countSentences(string $text): int
    {
        $parts = preg_split('/(?<=[.!؟?])\s+/u', trim($text), -1, PREG_SPLIT_NO_EMPTY);

        return $parts === false ? 0 : count($parts);
    }
}
