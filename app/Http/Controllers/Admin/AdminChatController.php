<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\InnovationIndex;
use App\Models\User;
use App\Services\AIEngine\GeminiClient;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

/**
 * وكيل ذكي (شات بوت) للأدمن — يسمح بسؤال أسئلة عن بيانات الطلاب وإحصائيات الابتكار.
 */
class AdminChatController extends Controller
{
    public function __construct(
        private GeminiClient $client,
    ) {}

    /**
     * عرض صفحة الشات.
     */
    public function index(): Response
    {
        return Inertia::render('Admin/Innovation/AdminChat');
    }

    /**
     * استقبال سؤال الأدمن ومعالجته بالذكاء الاصطناعي.
     */
    public function ask(Request $request)
    {
        $request->validate([
            'question' => 'required|string|max:1000',
        ]);

        $question = $request->input('question');

        // الرد قد يستغرق وقتاً طويلاً بسبب إعادة المحاولة التلقائية في
        // GeminiClient، بينما max_execution_time الافتراضي على السيرفر أقل من ذلك.
        set_time_limit(300);

        try {
            $context = $this->buildContext();

            $answer = $this->client->chat([
                GeminiClient::systemMessage(
                    "أنت مساعد ذكي لمنصة \"مبتكرو الأرض\" التعليمية. "
                    . "تجيب على أسئلة المشرف (الأدمن) حول بيانات الطلاب ومؤشرات الابتكار والإحصائيات. "
                    . "أجب بالعربية بشكل مختصر وواضح. "
                    . "إذا لم تجد المعلومة في السياق المقدم، قل ذلك بصراحة. "
                    . "لا تخترع بيانات. استخدم الأرقام الموجودة في السياق فقط.\n\n"
                    . "سياق البيانات الحالية:\n" . $context
                ),
                GeminiClient::userMessage($question),
            ], temperature: 0.3, maxTokens: 1500);

            return response()->json([
                'answer' => $answer ?? 'تعذر معالجة سؤالك حالياً. حاول مرة أخرى.',
            ]);

        } catch (\Throwable $e) {
            Log::error("Admin Chat AI error: {$e->getMessage()}");

            return response()->json([
                'answer' => 'حدث خطأ أثناء معالجة سؤالك. تأكد من اتصال خدمة الذكاء الاصطناعي وحاول مرة أخرى.',
            ], 500);
        }
    }

    /**
     * بناء سياق إحصائي مختصر لتزويد الذكاء الاصطناعي ببيانات حقيقية.
     */
    private function buildContext(): string
    {
        $totalStudents = User::where('role', 'student')->count();
        $assessed = InnovationIndex::query()
            ->selectRaw('COUNT(DISTINCT user_id) as total')
            ->value('total');

        // توزيع التصنيفات
        $classifications = InnovationIndex::query()
            ->selectRaw('classification, COUNT(*) as cnt')
            ->whereIn('id', function ($q) {
                $q->selectRaw('MAX(id)')->from('innovation_indexes')->groupBy('user_id');
            })
            ->groupBy('classification')
            ->pluck('cnt', 'classification')
            ->toArray();

        // متوسط الدرجات
        $avgScore = InnovationIndex::query()
            ->whereIn('id', function ($q) {
                $q->selectRaw('MAX(id)')->from('innovation_indexes')->groupBy('user_id');
            })
            ->avg('overall_score');

        // أعلى 5 طلاب
        $topStudents = InnovationIndex::query()
            ->whereIn('id', function ($q) {
                $q->selectRaw('MAX(id)')->from('innovation_indexes')->groupBy('user_id');
            })
            ->with('user:id,name')
            ->orderByDesc('overall_score')
            ->take(5)
            ->get()
            ->map(fn ($idx) => "{$idx->user->name}: {$idx->overall_score}/100 ({$idx->classification})")
            ->implode("\n");

        // أضعف 5 طلاب
        $weakStudents = InnovationIndex::query()
            ->whereIn('id', function ($q) {
                $q->selectRaw('MAX(id)')->from('innovation_indexes')->groupBy('user_id');
            })
            ->with('user:id,name')
            ->orderBy('overall_score')
            ->take(5)
            ->get()
            ->map(fn ($idx) => "{$idx->user->name}: {$idx->overall_score}/100 ({$idx->classification})")
            ->implode("\n");

        // متوسطات المؤشرات الـ 8
        $indexAvgs = InnovationIndex::query()
            ->whereIn('id', function ($q) {
                $q->selectRaw('MAX(id)')->from('innovation_indexes')->groupBy('user_id');
            })
            ->selectRaw('
                ROUND(AVG(skills_index), 1) as skills,
                ROUND(AVG(innovation_index), 1) as innovation,
                ROUND(AVG(intelligence_index), 1) as intelligence,
                ROUND(AVG(creativity_index), 1) as creativity,
                ROUND(AVG(projects_index), 1) as projects,
                ROUND(AVG(leadership_index), 1) as leadership,
                ROUND(AVG(ip_index), 1) as ip,
                ROUND(AVG(future_readiness_index), 1) as future_readiness
            ')
            ->first();

        $classLabels = collect(InnovationIndex::CLASSIFICATIONS)
            ->mapWithKeys(fn ($v, $k) => [$k => $v['label']])
            ->toArray();

        $classText = collect($classifications)
            ->map(fn ($cnt, $key) => ($classLabels[$key] ?? $key) . ": {$cnt} طالب")
            ->implode(', ');

        return <<<CTX
إجمالي الطلاب المسجلين: {$totalStudents}
الطلاب الذين تم تقييمهم: {$assessed}
متوسط الدرجة الكلية: {$avgScore}

توزيع التصنيفات: {$classText}

متوسطات المؤشرات الثمانية:
- المهارات: {$indexAvgs?->skills}
- الابتكار: {$indexAvgs?->innovation}
- الذكاء: {$indexAvgs?->intelligence}
- الإبداع: {$indexAvgs?->creativity}
- المشاريع: {$indexAvgs?->projects}
- القيادة: {$indexAvgs?->leadership}
- الملكية الفكرية: {$indexAvgs?->ip}
- الجاهزية المستقبلية: {$indexAvgs?->future_readiness}

أعلى 5 طلاب:
{$topStudents}

أضعف 5 طلاب:
{$weakStudents}
CTX;
    }
}
