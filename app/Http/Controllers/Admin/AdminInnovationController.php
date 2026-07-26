<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\InnovationIndex;
use App\Models\User;
use App\Jobs\RecalculateIndexesJob;
use App\Jobs\GenerateAIReportJob;
use App\Services\AIEngine\RecommendationEngine;
use App\Services\AIEngine\SmartSearchService;
use App\Services\AIEngine\SmartContentGenerator;
use App\Services\BenchmarkingService;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * لوحة الابتكار للأدمن — خريطة المواهب (المرحلة الأولى من محرك التقييم).
 * تفرز الطلاب آلياً حسب درجة الجاهزية المحسوبة مسبقاً في innovation_indexes.
 */
class AdminInnovationController extends Controller
{
    /**
     * خريطة المواهب: فرز الطلاب إلى (🟢 جاهزون / 🟡 للتطوير / 🔴 فجوات)
     */
    public function talentMap(Request $request): Response
    {
        $schoolId = $request->integer('school_id') ?: null;
        $search   = trim((string) $request->get('search', ''));

        $students = User::where('role', 'student')
            ->when($schoolId, fn ($q) => $q->where('school_id', $schoolId))
            ->when($search !== '', function ($q) use ($search) {
                $q->where(function ($qq) use ($search) {
                    $qq->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
            })
            ->with('latestInnovationIndex')
            ->get()
            ->map(function (User $student) {
                $index = $student->latestInnovationIndex;
                $score = (float) ($index?->overall_score ?? 0);

                return [
                    'id'        => $student->id,
                    'name'      => $student->name,
                    'email'     => $student->email,
                    'image'     => $student->image,
                    'score'     => $score,
                    'has_index' => $index !== null,
                    'classification_details' => $index?->getClassificationDetails()
                        ?? InnovationIndex::CLASSIFICATIONS['developing'],
                    'strongest' => $index?->getStrongestIndex(),
                    'weakest'   => $index?->getWeakestIndex(),
                    'readiness' => $this->readinessFor($index !== null, $score),
                    'status'    => Cache::has("recalculating_user_{$student->id}") ? 'processing' : 'idle',
                ];
            })
            ->sortByDesc('score')
            ->values();

        $buckets = [
            'ready'      => $students->where('readiness', 'ready')->values(),
            'developing' => $students->where('readiness', 'developing')->values(),
            'gaps'       => $students->where('readiness', 'gaps')->values(),
        ];

        $assessed = $students->where('has_index', true);

        return Inertia::render('Admin/Innovation/TalentMap', [
            'buckets' => $buckets,
            'counts'  => [
                'ready'      => $buckets['ready']->count(),
                'developing' => $buckets['developing']->count(),
                'gaps'       => $buckets['gaps']->count(),
                'total'      => $students->count(),
                'assessed'   => $assessed->count(),
            ],
            'avgScore'   => $assessed->isNotEmpty() ? round($assessed->avg('score'), 1) : 0,
            'schools'    => User::where('role', 'school')->select('id', 'name')->orderBy('name')->get(),
            'filters'    => ['school_id' => $schoolId, 'search' => $search],
            'indexNames' => InnovationIndex::INDEX_NAMES,
        ]);
    }

    /**
     * تحديد مستوى الجاهزية من الدرجة الإجمالية.
     * الطلاب غير المُقيَّمين (بدون مؤشر محسوب) يوضعون ضمن "الفجوات".
     */
    private function readinessFor(bool $hasIndex, float $score): string
    {
        if (!$hasIndex) {
            return 'gaps';
        }
        if ($score >= 70) {
            return 'ready';
        }
        if ($score >= 40) {
            return 'developing';
        }
        return 'gaps';
    }

    /**
     * إعادة حساب مؤشرات الابتكار والجاهزية يدويًا.
     */
    public function recalculate(Request $request)
    {
        if ($request->boolean('all')) {
            $students = User::where('role', 'student')->get();
            foreach ($students as $student) {
                Cache::put("recalculating_user_{$student->id}", 'processing', 300);
                RecalculateIndexesJob::dispatch($student);
            }
            return back()->with('success', 'تم بدء إعادة حساب مؤشرات جميع الطلاب بنجاح.');
        }

        $request->validate([
            'user_id' => 'required|exists:users,id',
        ]);

        $student = User::where('role', 'student')->findOrFail($request->user_id);
        Cache::put("recalculating_user_{$student->id}", 'processing', 300);
        RecalculateIndexesJob::dispatch($student);

        return back()->with('success', "تم بدء إعادة حساب مؤشرات الطالب {$student->name} بنجاح.");
    }

    /**
     * عرض بطاقة الطالب الكاملة (تشخيص + تنبؤ + توصيات + تقرير AI).
     */
    public function userProfile(User $student): Response
    {
        abort_unless($student->role === 'student', 404);

        $student->load(['latestInnovationIndex', 'cognitiveAssessments', 'achievements', 'userSkills']);
        
        $index = $student->latestInnovationIndex;
        if ($index) {
            $index->setAttribute('classification_details', $index->getClassificationDetails());
            $index->setAttribute('indexes_array', $index->toIndexArray());
        }

        // Get latest AI student report if generated
        $report = $this->getLatestReport($student);

        // Get AI recommendations with error handling
        $recommendations = [];
        if ($index) {
            try {
                $recommendations = Cache::remember("recommendations_user_{$student->id}", 86400, function () use ($student) {
                    return app(RecommendationEngine::class)->generateRecommendations($student);
                });
            } catch (\Throwable $e) {
                Log::warning("Failed to generate recommendations for user #{$student->id}: {$e->getMessage()}");
                $recommendations = ['overall_advice' => 'تعذر تحميل التوصيات حالياً. حاول لاحقاً.'];
            }
        }

        // Check if a report is currently generating
        $isGenerating = Cache::has("generating_report_{$student->id}");

        // Get benchmarking & percentile ranking
        $benchmarking = [];
        if ($index) {
            $benchService = app(BenchmarkingService::class);
            $benchmarking = [
                'cohort'      => $benchService->compareWithCohort($student),
                'institution' => $benchService->compareWithInstitution($student),
                'percentile'  => $benchService->getPercentileRank($student, 'all'),
            ];
        }

        return Inertia::render('Admin/Innovation/UserProfile', [
            'student'            => $student->only(['id', 'name', 'email', 'image', 'institution', 'year', 'school_id']),
            'index'              => $index,
            'cognitiveAssessment'=> $student->cognitiveAssessments()->latest()->first(),
            'report'             => $report,
            'recommendations'    => $recommendations,
            'isGenerating'       => $isGenerating,
            'benchmarking'       => $benchmarking,
            'indexNames'         => InnovationIndex::INDEX_NAMES,
        ]);
    }

    /**
     * إطلاق وظيفة توليد التقرير بالذكاء الاصطناعي في الخلفية.
     */
    public function generateReport(User $student)
    {
        abort_unless($student->role === 'student', 404);

        Cache::put("generating_report_{$student->id}", 'processing', 300);
        GenerateAIReportJob::dispatch($student, 'student');

        return back()->with('success', 'تم بدء توليد تقرير الذكاء الاصطناعي للطالب بنجاح.');
    }

    /**
     * البحث الذكي بالمواهب باستخدام اللغة الطبيعية.
     */
    public function smartSearch(Request $request, SmartSearchService $searchService): Response
    {
        $query = trim((string) $request->get('query', ''));
        $results = $query !== '' ? $searchService->search($query, 30) : null;

        return Inertia::render('Admin/Innovation/SmartSearch', [
            'query'   => $query,
            'results' => $results,
        ]);
    }

    /**
     * توليد مستند ذكي (سيرة ذاتية، ملف إنجاز، خطاب توصية).
     */
    public function generateDocument(Request $request, User $student, SmartContentGenerator $generator)
    {
        abort_unless($student->role === 'student', 404);

        $request->validate([
            'type'    => 'required|in:recommendation_letter,cv,portfolio',
            'purpose' => 'nullable|string|max:200',
        ]);

        $type = $request->input('type');
        $purpose = $request->input('purpose', 'تميز ابتكاري وعلمي');

        try {
            if ($type === 'cv') {
                $content = $generator->generateCV($student);
                $title = "السيرة الذاتية الابتكارية — {$student->name}";
            } elseif ($type === 'portfolio') {
                $content = $generator->generatePortfolio($student);
                $title = "ملف الإنجاز الابتكاري — {$student->name}";
            } else {
                $content = $generator->generateRecommendationLetter($student, $purpose);
                $title = "خطاب توصية رسمي — {$student->name}";
            }

            return response()->json([
                'success' => true,
                'title'   => $title,
                'content' => $content,
                'type'    => $type,
            ]);

        } catch (\Throwable $e) {
            Log::error("Failed to generate {$type} document for user #{$student->id}: {$e->getMessage()}");
            return response()->json([
                'success' => false,
                'message' => 'تعذر إعداد المستند المطلوب حالياً. يرجى المحاولة لاحقاً.',
            ], 500);
        }
    }

    /**
     * جلب أحدث تقرير طالب مولّد ومحفوظ في السيرفر.
     */
    private function getLatestReport(User $student): ?array
    {
        $directory = "reports/{$student->id}";
        if (!Storage::disk('local')->exists($directory)) {
            return null;
        }

        $files = Storage::disk('local')->files($directory);
        $reportFiles = array_filter($files, fn ($file) => str_contains(basename($file), 'student_'));

        if (empty($reportFiles)) {
            return null;
        }

        // Sort files by modified time descending to get the latest
        usort($reportFiles, function ($a, $b) {
            return Storage::disk('local')->lastModified($b) <=> Storage::disk('local')->lastModified($a);
        });

        $latestFile = reset($reportFiles);
        $content = Storage::disk('local')->get($latestFile);

        return json_decode($content, true);
    }
}
