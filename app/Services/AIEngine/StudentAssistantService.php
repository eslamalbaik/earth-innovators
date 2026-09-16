<?php

namespace App\Services\AIEngine;

use App\Models\Achievement;
use App\Models\InnovationIndex;
use App\Models\User;
use App\Services\ScoringEngine\FutureReadinessCalculator;
use App\Services\ScoringEngine\ScoringEngineService;

/**
 * المساعد الذكي للطالب (Smart Assistant)
 *
 * يخدم ثلاث وظائف: (1) أسئلة عامة عن التعلم والابتكار والإبداع بأسلوب تحفيزي،
 * (2) تفسير أي مؤشر/درجة استناداً حصراً إلى calculation_metadata الموثقة لكل
 * طالب وإلى إنجازاته الفعلية، (3) توجيه عملي لرفع الدرجة في المحاولة القادمة.
 *
 * تفسير الدرجات (2 و 3) لا يستدعي نموذجاً لغوياً إطلاقاً — يُبنى مباشرة من
 * بيانات الطالب المخزّنة، مما يضمن الاستجابة الفورية ويمنع أي إجابة عامة أو
 * "مُختلقة" غير مرتبطة بسجل الطالب. الأسئلة العامة فقط (1) تُحال إلى Gemini،
 * مع تزويده بسياق بيانات الطالب الحقيقية حتى لا تكون إجاباته عامة أيضاً.
 */
class StudentAssistantService
{
    public function __construct(
        private GeminiClient $client,
        private ScoringEngineService $scoringEngine,
    ) {}

    private const INDEX_KEYWORDS = [
        'innovation'       => ['ابتكار', 'إبتكار', 'مبتكر', 'innovation', 'innovative'],
        'skills'           => ['مهارات', 'مهارة', 'skill'],
        'intelligence'     => ['ذكاء', 'الذكاء', 'intelligence'],
        'creativity'       => ['إبداع', 'ابداع', 'creativity', 'creative'],
        'projects'         => ['مشاريع', 'مشروع', 'project'],
        'leadership'       => ['قيادة', 'قائد', 'leadership', 'leader'],
        'ip'               => ['ملكية فكرية', 'الملكية الفكرية', 'براءة', 'براءات', 'patent', 'intellectual property'],
        'future_readiness' => ['جاهزية', 'الجاهزية المستقبلية', 'مستقبل', 'future readiness', 'future-ready'],
    ];

    private const OVERALL_KEYWORDS = [
        'الدرجة الكلية', 'الدرجة الإجمالية', 'الدرجة الاجمالية', 'النتيجة الإجمالية',
        'المجموع', 'مجموعي', 'تصنيفي', 'overall', 'total score', 'my classification',
    ];

    private const IMPROVE_KEYWORDS = [
        'تحسين', 'أحسن', 'حسن', 'ارفع', 'أرفع', 'اطور', 'أطور', 'اطوّر',
        'improve', 'increase', 'boost', 'raise my', 'how do i get better',
    ];

    private const SCORE_KEYWORDS = [
        'درجة', 'درجتي', 'نتيجة', 'نتيجتي', 'مؤشر', 'علامة', 'لماذا', 'ليش', 'كيف حصلت',
        'score', 'index', 'why did i', 'why do i', 'why is my',
    ];

    private const INDEX_LABELS = [
        'skills'           => ['ar' => 'المهارات', 'en' => 'Skills'],
        'innovation'       => ['ar' => 'الابتكار', 'en' => 'Innovation'],
        'intelligence'     => ['ar' => 'الذكاء', 'en' => 'Intelligence'],
        'creativity'       => ['ar' => 'الإبداع', 'en' => 'Creativity'],
        'projects'         => ['ar' => 'المشاريع', 'en' => 'Projects'],
        'leadership'       => ['ar' => 'القيادة', 'en' => 'Leadership'],
        'ip'               => ['ar' => 'الملكية الفكرية', 'en' => 'Intellectual Property'],
        'future_readiness' => ['ar' => 'الجاهزية المستقبلية', 'en' => 'Future Readiness'],
        'overall'          => ['ar' => 'الدرجة الإجمالية', 'en' => 'Overall Score'],
    ];

    /**
     * InnovationIndex::CLASSIFICATIONS only carries Arabic labels — this maps
     * the same keys to English for bilingual explanations.
     */
    private const CLASSIFICATION_LABELS_EN = [
        'diamond'    => 'Diamond',
        'platinum'   => 'Platinum',
        'gold'       => 'Gold',
        'silver'     => 'Silver',
        'bronze'     => 'Bronze',
        'developing' => 'Developing',
    ];

    /**
     * Sub-indicator catalogue per index: calculation_metadata key => [label_ar, label_en, max_points]
     * Mirrors exactly the breakdown each Calculator in App\Services\ScoringEngine writes,
     * so every number the assistant quotes traces back to a documented indicator.
     */
    private const INDICATORS = [
        'skills' => [
            'skill_diversity'    => ['تنوع المهارات المسجَّلة عبر تصنيفات مختلفة', 'Diversity of registered skills across categories', 25],
            'proficiency_avg'    => ['متوسط مستوى إتقان مهاراتك', 'Average proficiency level of your skills', 30],
            'courses_score'      => ['الدورات والشهادات المسجَّلة', 'Registered courses & certificates', 25],
            'skills_count_score' => ['إجمالي عدد المهارات المسجَّلة', 'Total number of registered skills', 20],
        ],
        'innovation' => [
            'projects_score' => ['المشاريع الابتكارية المعتمدة من الذكاء الاصطناعي', 'AI-validated innovative projects', 30],
            'awards_score'   => ['الجوائز المسجَّلة', 'Registered awards', 25],
            'ideas_score'    => ['المنتجات والمقالات (الأفكار الموثقة)', 'Products & articles (documented ideas)', 20],
            'patents_score'  => ['براءات الاختراع المسجَّلة', 'Registered patents', 25],
        ],
        'intelligence' => [
            'research_score'    => ['الأبحاث المعتمدة من الذكاء الاصطناعي', 'AI-validated research', 30],
            'test_score'        => ['الشهادات والاختبارات المجتازة', 'Certificates & passed tests', 30],
            'articles_score'    => ['المقالات المنشورة', 'Published articles', 20],
            'ai_analysis_score' => ['متوسط تقييم جودة أبحاثك/مقالاتك', 'Average AI-assessed quality of your research/articles', 20],
        ],
        'creativity' => [
            'creative_projects_score' => ['المشاريع والمنتجات الإبداعية', 'Creative projects & products', 30],
            'articles_score'          => ['المقالات والمحتوى المكتوب', 'Articles & written content', 25],
            'awards_score'            => ['الجوائز في المجالات الإبداعية', 'Awards in creative fields', 25],
            'diversity_score'         => ['تنوع أنواع إنجازاتك المسجَّلة', 'Diversity of your registered achievement types', 20],
        ],
        'projects' => [
            'quality_score'    => ['متوسط تقييمات مراجعي مشاريعك', 'Average reviewer rating on your projects', 35],
            'completion_score' => ['نسبة إكمال مشاريعك', 'Your project completion rate', 25],
            'validation_score' => ['المشاريع المعتمدة من الذكاء الاصطناعي', 'AI-validated projects', 20],
            'quantity_score'   => ['إجمالي عدد مشاريعك', 'Total number of your projects', 20],
        ],
        'leadership' => [
            'challenge_score'      => ['التحديات التي أكملتها', 'Challenges you completed', 30],
            'project_leader_score' => ['المشاريع/التحديات التي أنشأتها كقائد', 'Projects/challenges you created as a leader', 25],
            'review_score'         => ['متوسط تقييم الآخرين لك', 'Average rating others gave you', 20],
            'badge_score'          => ['الشارات المكتسبة', 'Badges earned', 25],
        ],
        'ip' => [
            'patents_score'  => ['براءات الاختراع', 'Patents', 35],
            'research_score' => ['الأبحاث والمنشورات', 'Research & publications', 25],
            'articles_score' => ['المقالات', 'Articles', 20],
            'evidence_score' => ['جودة الأدلة المرفقة لإنجازات الملكية الفكرية', 'Evidence quality attached to your IP achievements', 20],
        ],
        'future_readiness' => [
            'future_skills_score'       => ['مهاراتك المرتبطة بتقنيات المستقبل', 'Your future-tech related skills', 30],
            'digital_certs_score'       => ['الشهادات الرقمية', 'Digital certificates', 25],
            'continuous_learning_score' => ['إنجازاتك الحديثة (آخر 12 شهراً)', 'Your recent achievements (last 12 months)', 25],
            'tech_projects_score'       => ['مشاريعك التقنية', 'Your technology projects', 20],
        ],
    ];

    public function answer(User $user, string $question): array
    {
        $locale = app()->getLocale() === 'en' ? 'en' : 'ar';
        $index = $user->latestInnovationIndex;

        // Only treat this as a "explain/improve my score" question when the
        // message actually carries a score-ish cue (why/score/index/improve...).
        // Without this gate, ordinary words like "project" or "skill" — or even
        // the platform's own name "مبتكرو الأرض" (Earth Innovators) containing
        // "مبتكر" — would hijack unrelated platform questions into a score
        // explanation instead of answering what was actually asked.
        $isScoreQuestion = $this->matchesAny($question, self::SCORE_KEYWORDS)
            || $this->matchesAny($question, self::OVERALL_KEYWORDS)
            || $this->matchesAny($question, self::IMPROVE_KEYWORDS);

        if ($isScoreQuestion) {
            $target = $this->detectIndexKey($question)
                ?? ($this->matchesAny($question, self::OVERALL_KEYWORDS) ? 'overall' : null)
                ?? ($this->matchesAny($question, self::SCORE_KEYWORDS) ? 'overall' : null)
                ?? ($index ? $index->getWeakestIndex() : 'overall');

            if (!$index || !is_array($index->calculation_metadata)) {
                return [
                    'answer' => $this->noIndexYetMessage($locale),
                    'mode'   => 'no_data',
                ];
            }

            return [
                'answer' => $this->buildIndexExplanation($user, $index, $target, $locale),
                'mode'   => 'index_explanation',
                'index'  => $target,
            ];
        }

        return [
            'answer' => $this->generalAnswer($user, $index, $question, $locale),
            'mode'   => 'general',
        ];
    }

    // ─── Intent detection ───────────────────────────────────────

    private function detectIndexKey(string $question): ?string
    {
        foreach (self::INDEX_KEYWORDS as $key => $keywords) {
            if ($this->matchesAny($question, $keywords)) {
                return $key;
            }
        }
        return null;
    }

    private function matchesAny(string $haystack, array $needles): bool
    {
        $haystack = mb_strtolower($haystack);
        foreach ($needles as $needle) {
            if (mb_strpos($haystack, mb_strtolower($needle)) !== false) {
                return true;
            }
        }
        return false;
    }

    // ─── Deterministic score explanation (functions 2 + 3) ──────

    private function buildIndexExplanation(User $user, InnovationIndex $index, string $key, string $locale): string
    {
        if ($key === 'overall') {
            return $this->buildOverallExplanation($user, $index, $locale);
        }

        $label = self::INDEX_LABELS[$key][$locale];
        $score = (float) $index->{$key . '_index'};
        $metadata = $index->calculation_metadata[$key] ?? [];
        $indicators = self::INDICATORS[$key];
        $evidence = $this->evidenceLines($user, $key, $locale);

        $lines = [];
        $weakestSub = null;
        $weakestRatio = 1.0;

        foreach ($indicators as $subKey => [$labelAr, $labelEn, $max]) {
            $earned = round((float) ($metadata[$subKey] ?? 0), 2);
            $subLabel = $locale === 'ar' ? $labelAr : $labelEn;
            $ratio = $max > 0 ? $earned / $max : 1;

            if ($ratio < $weakestRatio) {
                $weakestRatio = $ratio;
                $weakestSub = $subKey;
            }

            $line = $locale === 'ar'
                ? "• {$subLabel}: {$earned}/{$max} نقطة"
                : "• {$subLabel}: {$earned}/{$max} points";

            if (!empty($evidence[$subKey])) {
                $line .= $locale === 'ar' ? " — {$evidence[$subKey]}" : " — {$evidence[$subKey]}";
            }

            $lines[] = $line;
        }

        $breakdown = implode("\n", $lines);
        $tips = $this->improvementTips($key, $locale, $weakestSub);

        if ($locale === 'ar') {
            return <<<TXT
📊 مؤشر {$label}: {$score}/100

مما يتكوّن هذا المؤشر (بناءً على بياناتك الفعلية المسجَّلة في حسابك):
{$breakdown}

🚀 كيف ترفع هذا المؤشر في محاولتك القادمة:
{$tips}

استمر بتوثيق إنجازاتك أولاً بأول — كل عنصر تضيفه يُحتسب مباشرة في هذا المؤشر عند إعادة حساب مؤشراتك 🌱
TXT;
        }

        return <<<TXT
📊 {$label} index: {$score}/100

What this index is made of (based on your actual recorded data):
{$breakdown}

🚀 How to raise this index next time:
{$tips}

Keep documenting your achievements as you go — every item you add is factored directly into this index the next time your indexes are recalculated 🌱
TXT;
    }

    private function buildOverallExplanation(User $user, InnovationIndex $index, string $locale): string
    {
        $weights = $this->scoringEngine->resolveWeights();
        $classification = $index->getClassificationDetails();
        $classificationLabel = $locale === 'ar' ? $classification['label'] : (self::CLASSIFICATION_LABELS_EN[$index->classification] ?? $classification['label']);
        $strongest = $index->getStrongestIndex();
        $weakest = $index->getWeakestIndex();
        $indexes = $index->toIndexArray();

        $lines = [];
        foreach ($indexes as $key => $value) {
            $label = self::INDEX_LABELS[$key][$locale];
            $weightPct = round(($weights[$key] ?? 0) * 100);
            $lines[] = $locale === 'ar'
                ? "• {$label} (وزنه {$weightPct}٪ من الدرجة الإجمالية): {$value}/100"
                : "• {$label} (weighted {$weightPct}% of the overall score): {$value}/100";
        }
        $breakdown = implode("\n", $lines);

        $strongLabel = self::INDEX_LABELS[$strongest][$locale];
        $weakLabel = self::INDEX_LABELS[$weakest][$locale];

        if ($locale === 'ar') {
            return <<<TXT
📊 درجتك الإجمالية: {$index->overall_score}/100 — تصنيفك الحالي: {$classificationLabel} {$classification['icon']}

مساهمة كل مؤشر من مؤشراتك الثمانية في الدرجة الإجمالية:
{$breakdown}

👏 أقوى مؤشر لديك: {$strongLabel}
🎯 أضعف مؤشر لديك: {$weakLabel} — هذا أفضل مكان تبدأ منه لرفع درجتك الإجمالية بأسرع طريقة.

اسألني مباشرة: "لماذا حصلت على كذا في {$weakLabel}؟" لأريك التفاصيل الدقيقة وخطوات عملية لتحسينه في محاولتك القادمة.
TXT;
        }

        return <<<TXT
📊 Your overall score: {$index->overall_score}/100 — your current classification: {$classificationLabel} {$classification['icon']}

How each of your eight indexes contributes to the overall score:
{$breakdown}

👏 Your strongest index: {$strongLabel}
🎯 Your weakest index: {$weakLabel} — this is the best place to focus on to raise your overall score fastest.

Ask me directly: "Why did I get this score in {$weakLabel}?" and I'll show you the exact breakdown and concrete steps to improve it next time.
TXT;
    }

    /**
     * Per-indicator actionable guidance (function 3). Every tip maps to a
     * documented sub-indicator from App\Services\ScoringEngine\*Calculator.
     */
    private function improvementTips(string $indexKey, string $locale, ?string $weakestSub): string
    {
        $tips = [
            'skills' => [
                'skill_diversity'    => ['سجّل مهارات جديدة من تصنيفات مختلفة (تقنية، بحثية، قيادية...) لرفع تنوع مهاراتك.', 'Register new skills across different categories (technical, research, leadership…) to raise your skill diversity.'],
                'proficiency_avg'    => ['ارفع مستوى إتقان مهاراتك الحالية إلى "متقدم" أو "خبير" عبر ممارستها في مشاريع فعلية.', 'Level up your current skills to "advanced" or "expert" by applying them in real projects.'],
                'courses_score'      => ['أضِف شهادات دورات أكملتها كإنجاز موثّق لرفع هذا المؤشر (كل شهادة تضيف نقاطاً).', 'Add certificates from courses you completed as documented achievements (each one adds points).'],
                'skills_count_score' => ['سجّل جميع مهاراتك الحالية في ملفك — حتى المهارات الأساسية تُحتسب.', 'Register all your current skills in your profile — even basic ones count.'],
            ],
            'innovation' => [
                'projects_score' => ['قدّم مشروعاً ابتكارياً جديداً واحرص على اعتماده من الذكاء الاصطناعي (وضّح المشكلة والحل بدقة).', 'Submit a new innovative project and make sure it gets AI-validated (clearly describe the problem and solution).'],
                'awards_score'   => ['سجّل أي جائزة حصلت عليها (مدرسية أو خارجية) كإنجاز موثّق.', 'Register any award you have received (school or external) as a documented achievement.'],
                'ideas_score'    => ['وثّق أفكارك كمنتج أو مقال — حتى الفكرة الأولية تُحسب ضمن هذا المؤشر.', 'Document your ideas as a product or article — even an early-stage idea counts toward this indicator.'],
                'patents_score'  => ['إن كان لديك اختراع، سجّله كبراءة اختراع موثقة — تضيف حتى 18 نقطة لكل براءة.', 'If you have an invention, register it as a documented patent — it adds up to 18 points each.'],
            ],
            'intelligence' => [
                'research_score'    => ['أنجز بحثاً علمياً واحرص على اعتماده من الذكاء الاصطناعي بإرفاق أدلة كافية.', 'Complete a research paper and get it AI-validated by attaching sufficient evidence.'],
                'test_score'        => ['اجتز اختبارات/دورات إضافية وسجّل شهاداتها.', 'Pass additional tests/courses and register their certificates.'],
                'articles_score'    => ['انشر مقالاً علمياً جديداً على المنصة.', 'Publish a new scientific article on the platform.'],
                'ai_analysis_score' => ['ارفع جودة كتابة أبحاثك ومقالاتك (وضوح، دقة، أدلة) لرفع تقييم الذكاء الاصطناعي لها.', 'Improve the writing quality of your research/articles (clarity, accuracy, evidence) to raise their AI-assessed score.'],
            ],
            'creativity' => [
                'creative_projects_score' => ['أضِف مشروعاً أو منتجاً إبداعياً جديداً موثقاً بالتفصيل.', 'Add a new, well-documented creative project or product.'],
                'articles_score'          => ['اكتب مقالاً يعرض فكرة إبداعية أو تجربة شخصية.', 'Write an article showcasing a creative idea or personal experience.'],
                'awards_score'            => ['شارك في مسابقات إبداعية وسجّل أي جائزة تحصل عليها.', 'Take part in creative competitions and register any award you win.'],
                'diversity_score'         => ['نوّع أنواع إنجازاتك (مشروع، مقال، منتج، جائزة...) بدل التركيز على نوع واحد فقط.', 'Diversify your achievement types (project, article, product, award…) instead of focusing on just one.'],
            ],
            'projects' => [
                'quality_score'    => ['اطلب مراجعة/تقييم مشاريعك من معلمك لرفع متوسط التقييم.', 'Ask your teacher to review and rate your projects to raise your average rating.'],
                'completion_score' => ['أكمل المشاريع التي بدأتها بدل تركها منتصفة — غيّر حالتها إلى "مكتمل".', 'Finish the projects you started instead of leaving them halfway — mark them as completed.'],
                'validation_score' => ['وثّق مشروعك بوضوح كافٍ ليحصل على اعتماد الذكاء الاصطناعي.', 'Document your project clearly enough for it to receive AI validation.'],
                'quantity_score'   => ['ابدأ مشروعاً جديداً — كل مشروع إضافي يرفع هذا المؤشر.', 'Start a new project — every additional project raises this indicator.'],
            ],
            'leadership' => [
                'challenge_score'      => ['أكمل تحديات إضافية على المنصة حتى النهاية.', 'Complete additional challenges on the platform all the way through.'],
                'project_leader_score' => ['بادر بإنشاء مشروع أو تحدٍّ خاص بك بدل الاكتفاء بالمشاركة في مشاريع الآخرين.', 'Take the initiative to create your own project or challenge instead of only joining others\'.'],
                'review_score'         => ['اطلب من زملائك ومعلميك تقييم تعاونك ومشاركاتك.', 'Ask your peers and teachers to rate your collaboration and participation.'],
                'badge_score'          => ['استهدف إنجازات تمنحك شارات جديدة على المنصة.', 'Aim for achievements that earn you new badges on the platform.'],
            ],
            'ip' => [
                'patents_score'  => ['سجّل أي براءة اختراع لديك موثقة بالأدلة اللازمة.', 'Register any patent you hold, documented with the necessary evidence.'],
                'research_score' => ['انشر بحثاً أو مقالاً على المنصة كإصدار (Publication).', 'Publish a research piece or article on the platform as a Publication.'],
                'articles_score' => ['أضِف مقالات موثقة لأفكارك أو أبحاثك.', 'Add documented articles for your ideas or research.'],
                'evidence_score' => ['أرفق أدلة أقوى (مستندات، صور، روابط) مع إنجازات الملكية الفكرية لرفع تقييم جودتها.', 'Attach stronger evidence (documents, photos, links) to your IP achievements to raise their quality score.'],
            ],
            'future_readiness' => [
                'future_skills_score'       => ['أضِف مهارات مرتبطة بتقنيات المستقبل (الذكاء الاصطناعي، البرمجة، إنترنت الأشياء...) إلى ملفك.', 'Add skills related to future technologies (AI, programming, IoT…) to your profile.'],
                'digital_certs_score'       => ['أكمل شهادة رقمية في مجال تقني حديث وسجّلها كإنجاز.', 'Complete a digital certificate in a modern tech field and register it as an achievement.'],
                'continuous_learning_score' => ['حافظ على تسجيل إنجاز واحد على الأقل كل شهر لإظهار تعلّم مستمر.', 'Keep registering at least one achievement every month to show continuous learning.'],
                'tech_projects_score'       => ['اربط مشروعك القادم بتقنية حديثة (ذكاء اصطناعي، بيانات، روبوتات...).', 'Tie your next project to a modern technology (AI, data, robotics…).'],
            ],
        ][$indexKey];

        // Weakest indicator first, then any other indicator still below its max.
        $ordered = $weakestSub && isset($tips[$weakestSub])
            ? [$weakestSub => $tips[$weakestSub]] + $tips
            : $tips;

        $lines = [];
        foreach (array_slice($ordered, 0, 2, true) as $tip) {
            $lines[] = '- ' . ($locale === 'ar' ? $tip[0] : $tip[1]);
        }

        return implode("\n", $lines);
    }

    /**
     * Pull short, real citations from the student's own records for a given
     * sub-indicator — this is what keeps every explanatory line non-generic.
     */
    private function evidenceLines(User $user, string $indexKey, string $locale): array
    {
        $sep = $locale === 'ar' ? '، ' : ', ';
        $none = $locale === 'ar' ? 'لا يوجد سجل بعد' : 'no record yet';
        $titles = fn ($items, int $limit = 3) => collect($items)
            ->take($limit)
            ->map(fn ($m) => $this->titleOf($m, $locale))
            ->implode($sep) ?: null;

        $achievements = $user->achievements ?? collect();

        return match ($indexKey) {
            'skills' => [
                'skill_diversity'    => $this->skillsSummary($user, $locale),
                'proficiency_avg'    => $this->skillsSummary($user, $locale),
                'courses_score'      => $titles($achievements->where('type', 'certificate')) ?? ($titles($user->certificates ?? []) ?? $none),
                'skills_count_score' => (($user->userSkills ?? collect())->count()) . ($locale === 'ar' ? ' مهارة مسجّلة' : ' registered skills'),
            ],
            'innovation' => [
                'projects_score' => $titles($achievements->where('type', 'project')->where('ai_validation_status', 'validated')) ?? $none,
                'awards_score'   => $titles($achievements->where('type', 'award')) ?? $none,
                'ideas_score'    => $titles($achievements->whereIn('type', ['product', 'article'])) ?? $none,
                'patents_score'  => $titles($achievements->where('type', 'patent')) ?? $none,
            ],
            'intelligence' => [
                'research_score'    => $titles($achievements->where('type', 'research')->where('ai_validation_status', 'validated')) ?? $none,
                'test_score'        => $titles($achievements->where('type', 'certificate')) ?? ($titles($user->certificates ?? []) ?? $none),
                'articles_score'    => $titles($achievements->where('type', 'article')) ?? $none,
                'ai_analysis_score' => $titles($achievements->whereIn('type', ['research', 'article'])->whereNotNull('ai_confidence_score')) ?? $none,
            ],
            'creativity' => [
                'creative_projects_score' => $titles($achievements->whereIn('type', ['project', 'product'])) ?? $none,
                'articles_score'          => $titles($achievements->where('type', 'article')) ?? $none,
                'awards_score'            => $titles($achievements->where('type', 'award')) ?? $none,
                'diversity_score'         => $achievements->pluck('type')->unique()->map(fn ($t) => $this->typeLabel($t, $locale))->implode($sep) ?: $none,
            ],
            'projects' => [
                'quality_score'    => $titles(($user->projects ?? collect())->filter(fn ($p) => $p->relationLoaded('submissions') && $p->submissions->whereNotNull('rating')->isNotEmpty())) ?? $none,
                'completion_score' => $titles(($user->projects ?? collect())->where('status', 'completed')) ?? $none,
                'validation_score' => $titles($achievements->where('type', 'project')->where('ai_validation_status', 'validated')) ?? $none,
                'quantity_score'   => $titles(($user->projects ?? collect())->merge($achievements->where('type', 'project'))) ?? $none,
            ],
            'leadership' => [
                'challenge_score'      => $titles(($user->challengeParticipations ?? collect())->where('status', 'completed')->map(fn ($p) => $p->relationLoaded('challenge') ? $p->challenge : null)->filter()) ?? $none,
                'project_leader_score' => $titles(($user->projects ?? collect())->merge($user->challenges ?? collect())) ?? $none,
                'review_score'         => $locale === 'ar' ? 'متوسط تقييمات الحجوزات/المراجعات المستلمة' : 'average rating across your received bookings/reviews',
                'badge_score'          => $titles($user->badges ?? collect()) ?? $none,
            ],
            'ip' => [
                'patents_score'  => $titles($achievements->where('type', 'patent')) ?? $none,
                'research_score' => $titles($achievements->where('type', 'research')->merge($user->publications ?? collect())) ?? $none,
                'articles_score' => $titles($achievements->where('type', 'article')) ?? $none,
                'evidence_score' => $locale === 'ar' ? 'متوسط جودة الأدلة المرفقة بإنجازات الملكية الفكرية' : 'average evidence quality attached to your IP achievements',
            ],
            'future_readiness' => [
                'future_skills_score'       => $titles(($user->userSkills ?? collect())->filter(fn ($s) => $this->matchesAny($s->name, FutureReadinessCalculator::FUTURE_KEYWORDS))) ?? $none,
                'digital_certs_score'       => $titles($achievements->where('type', 'certificate')->filter(fn ($a) => $this->matchesAny($a->title, FutureReadinessCalculator::FUTURE_KEYWORDS))) ?? $none,
                'continuous_learning_score' => $titles($achievements->filter(fn ($a) => $a->date && $a->date->isAfter(now()->subMonths(12)))) ?? $none,
                'tech_projects_score'       => $titles($achievements->where('type', 'project')->filter(fn ($a) => $this->matchesAny(($a->title ?? '') . ' ' . ($a->description ?? ''), FutureReadinessCalculator::FUTURE_KEYWORDS))) ?? $none,
            ],
            default => [],
        };
    }

    private function typeLabel(string $type, string $locale): string
    {
        if ($locale === 'ar') {
            return Achievement::TYPE_LABELS[$type] ?? $type;
        }
        return ucfirst($type);
    }

    private function skillsSummary(User $user, string $locale): ?string
    {
        $skills = $user->userSkills ?? collect();
        if ($skills->isEmpty()) {
            return $locale === 'ar' ? 'لا يوجد مهارات مسجّلة بعد' : 'no skills registered yet';
        }
        $sep = $locale === 'ar' ? '، ' : ', ';
        return $skills->take(4)->pluck('name')->implode($sep);
    }

    private function titleOf($model, string $locale): string
    {
        if ($locale === 'ar' && !empty($model->title_ar)) {
            return $model->title_ar;
        }
        if (!empty($model->title)) {
            return $model->title;
        }
        if ($locale === 'ar' && !empty($model->name_ar)) {
            return $model->name_ar;
        }
        if (!empty($model->name)) {
            return $model->name;
        }
        return $locale === 'ar' ? 'إنجاز غير مسمّى' : 'Untitled item';
    }

    private function noIndexYetMessage(string $locale): string
    {
        if ($locale === 'ar') {
            return "لم يتم حساب مؤشراتك بعد 🌱\n\nابدأ بتوثيق أول إنجاز لك — مشروع، مهارة، شهادة أو مشاركة في تحدٍّ — وسأتمكن حينها من تحليل مؤشراتك الثمانية وشرح كل درجة بالتفصيل استناداً إلى عملك الفعلي.";
        }
        return "Your indexes haven't been calculated yet 🌱\n\nStart by documenting your first achievement — a project, a skill, a certificate, or joining a challenge — and I'll then be able to break down all eight indexes and explain every score based on your actual work.";
    }

    // ─── General motivational Q&A + platform how-to (function 1) ──

    /**
     * GeminiClient::chat() never returns null — on failure it silently
     * substitutes this exact filler sentence (see GeminiClient::chat()).
     * For a live chat widget that's misleading (it reads as an answer to
     * whatever was asked), so we detect it and tell the student honestly
     * that the AI service is temporarily overloaded instead of forwarding it.
     */
    private const GEMINI_DOWN_FRAGMENT = 'تم تحليل البيانات ومراجعتها بنجاح';

    private function generalAnswer(User $user, ?InnovationIndex $index, string $question, string $locale): string
    {
        $context = $this->buildGeneralContext($user, $index, $locale);
        $platformFeatures = $this->buildPlatformFaqContext($locale);
        $languageInstruction = $locale === 'ar' ? 'أجب باللغة العربية فقط.' : 'Respond in English only.';

        $answer = $this->client->chat([
            GeminiClient::systemMessage(
                'You are the Smart Assistant of the "Earth Innovators" educational platform, built specifically for school students. '
                . 'You handle two kinds of questions: (a) learning, innovation and creativity questions — answer with a warm, motivational tone suited to a school-age student; '
                . '(b) "how do I use the platform" questions (submitting a project, joining a challenge, points, certificates, etc.) — answer ONLY using the platform feature list below, and never invent a feature, page or link that is not in that list. '
                . 'Keep answers short (max ~120 words), concrete, and encouraging. '
                . 'If the student asks about their own score/index/classification, do not guess — tell them to ask directly '
                . '(e.g. "Why did I get this score in Innovation?") so you can show the exact documented breakdown from their real record. '
                . 'Never invent facts about the student or the platform that are not in the context below. ' . $languageInstruction . "\n\n"
                . "Platform features (name: link):\n" . $platformFeatures . "\n\n"
                . "Student context:\n" . $context
            ),
            GeminiClient::userMessage($question),
        ], temperature: 0.5, maxTokens: 500);

        if ($answer === null || str_contains($answer, self::GEMINI_DOWN_FRAGMENT)) {
            return $this->assistantBusyMessage($locale);
        }

        return $answer;
    }

    private function assistantBusyMessage(string $locale): string
    {
        // Deliberately no specific "try again in N minutes" promise: the
        // underlying failure could be a short-lived overload or a daily
        // Gemini quota cap (hours, not minutes) — GeminiClient doesn't expose
        // which one to callers, and overpromising a timeframe here would just
        // be another inaccurate canned answer, the exact thing this replaces.
        if ($locale === 'ar') {
            return "أعتذر، لم أتمكن من الإجابة على سؤالك الآن — خدمة الذكاء الاصطناعي غير متاحة مؤقتاً (قد يكون ضغطاً مؤقتاً أو حداً يومياً على الاستخدام). حاول مرة أخرى لاحقاً.\n\nإن كان سؤالك عن درجة أو مؤشر معين، اسألني مباشرة (مثال: \"لماذا حصلت على هذه الدرجة في الابتكار؟\") — تلك الإجابات فورية ولا تعتمد على هذه الخدمة.";
        }
        return "Sorry, I couldn't answer your question right now — the AI service is temporarily unavailable (it could be a short-lived overload or a daily usage limit). Please try again later.\n\nIf your question is about a specific score or index, ask me directly (e.g. \"Why did I get this score in Innovation?\") — those answers are instant and don't depend on this service.";
    }

    /**
     * Route-verified list of real student-facing features, so general Q&A
     * about "how do I use the platform" is grounded in actual pages instead
     * of Gemini guessing at features that may not exist.
     */
    private function buildPlatformFaqContext(string $locale): string
    {
        $entries = $locale === 'ar' ? [
            ['توثيق إنجاز جديد (مشروع، بحث، شهادة، مهارة، جائزة، براءة اختراع، مقال، منتج) — يُحلَّل بالذكاء الاصطناعي ويُحتسب تلقائياً في مؤشراتك', route('innovation.achievements.create')],
            ['عرض كل إنجازاتك الموثقة', route('innovation.achievements.index')],
            ['عرض تفاصيل مؤشراتك الثمانية، وإعادة حسابها بعد إضافة إنجاز جديد', route('innovation.indexes')],
            ['توصيات الذكاء الاصطناعي لتطوير مسارك', route('innovation.recommendations')],
            ['مشاريعك المدرسية: عرض القائمة', route('student.projects.index')],
            ['إنشاء مشروع مدرسي جديد', route('student.projects.create')],
            ['التحديات: تصفح والانضمام وتسليم الحل', route('student.challenges.index')],
            ['عرض الفائزين بالتحديات السابقة', route('student.challenges.winners')],
            ['اقتراح تحدٍّ جديد', route('student.challenge-suggestions.create')],
            ['سجل النقاط (مكتسبة، مكافآت، مستبدلة)', route('student.points')],
            ['شهادة العضوية', route('student.certificate.show')],
            ['المواد الدراسية المهتم بها', route('student.subjects')],
            ['التقييمات', route('student.reviews')],
            ['المدفوعات والاشتراك', route('student.payments')],
        ] : [
            ['Document a new achievement (project, research, certificate, skill, award, patent, article, product) — AI-analyzed and automatically counted in your indexes', route('innovation.achievements.create')],
            ['View all your documented achievements', route('innovation.achievements.index')],
            ['View your eight indexes in detail, and recalculate after adding an achievement', route('innovation.indexes')],
            ['AI recommendations to develop your path', route('innovation.recommendations')],
            ['Your school projects: view the list', route('student.projects.index')],
            ['Create a new school project', route('student.projects.create')],
            ['Challenges: browse, join, and submit a solution', route('student.challenges.index')],
            ['View past challenge winners', route('student.challenges.winners')],
            ['Suggest a new challenge', route('student.challenge-suggestions.create')],
            ['Points history (earned, bonus, redeemed)', route('student.points')],
            ['Membership certificate', route('student.certificate.show')],
            ['Subjects of interest', route('student.subjects')],
            ['Reviews', route('student.reviews')],
            ['Payments & subscription', route('student.payments')],
        ];

        return collect($entries)->map(fn ($e) => "- {$e[0]}: {$e[1]}")->implode("\n");
    }

    private function buildGeneralContext(User $user, ?InnovationIndex $index, string $locale): string
    {
        $name = $user->name;

        if (!$index) {
            return $locale === 'ar'
                ? "الطالب: {$name}. لم يتم تقييمه بعد (لا توجد مؤشرات محسوبة)."
                : "Student: {$name}. Not assessed yet (no calculated indexes).";
        }

        $classification = $index->getClassificationDetails();
        $classificationLabel = $locale === 'ar' ? $classification['label'] : (self::CLASSIFICATION_LABELS_EN[$index->classification] ?? $classification['label']);
        $strongest = self::INDEX_LABELS[$index->getStrongestIndex()][$locale];
        $weakest = self::INDEX_LABELS[$index->getWeakestIndex()][$locale];

        return $locale === 'ar'
            ? "الطالب: {$name}. الدرجة الإجمالية: {$index->overall_score}/100. التصنيف: {$classificationLabel}. أقوى مؤشر: {$strongest}. أضعف مؤشر: {$weakest}."
            : "Student: {$name}. Overall score: {$index->overall_score}/100. Classification: {$classificationLabel}. Strongest index: {$strongest}. Weakest index: {$weakest}.";
    }
}
