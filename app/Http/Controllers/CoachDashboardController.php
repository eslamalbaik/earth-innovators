<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\InnovationIndex;
use App\Services\AIEngine\ReportGenerator;
use App\Services\InnovationStatsService;
use App\Services\ScoringEngine\ScoringEngineService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CoachDashboardController extends Controller
{
    public function __construct(
        private ScoringEngineService $scoringEngine,
        private ReportGenerator $reportGenerator,
        private InnovationStatsService $statsService,
    ) {}

    /**
     * FR-009: Coach dashboard showing all students
     */
    public function index(Request $request): Response
    {
        $coach = $request->user();
        $this->ensureCoach($coach);

        $students = $this->statsService->studentsWithIndexes($coach);

        return Inertia::render('Coach/Dashboard', [
            'students'        => $students,
            'totalStudents'   => $students->count(),
            'indexNames'      => InnovationIndex::INDEX_NAMES,
            'classifications' => InnovationIndex::CLASSIFICATIONS,
            'statistics'      => $this->statsService->statistics($students),
        ]);
    }

    /**
     * AI-020: Student report
     */
    public function studentReport(Request $request, User $student): Response
    {
        $coach = $request->user();
        $this->ensureCoach($coach);
        $this->ensureStudentInScope($coach, $student);

        // توليد التقرير قد يستغرق وقتاً طويلاً بسبب إعادة المحاولة التلقائية في
        // GeminiClient، بينما max_execution_time الافتراضي على السيرفر أقل من ذلك.
        set_time_limit(300);

        $report = $this->reportGenerator->generateStudentReport($student);
        $student->load(['latestInnovationIndex', 'achievements', 'userSkills']);

        $index = $student->latestInnovationIndex;
        if ($index) {
            $index->setAttribute('classification_details', $index->getClassificationDetails());
            $index->setAttribute('indexes_array', $index->toIndexArray());
        }

        return Inertia::render('Coach/StudentReport', [
            'student'    => $student->only(['id', 'name', 'email', 'image', 'institution']),
            'report'     => $report,
            'index'      => $index,
            'indexNames' => InnovationIndex::INDEX_NAMES,
            'cognitiveAssessment' => $student->latestCognitiveAssessment,
        ]);
    }

    /**
     * Compare students
     */
    public function compareStudents(Request $request): Response
    {
        $coach = $request->user();
        $this->ensureCoach($coach);

        $studentIds = (array) $request->get('students', []);

        $students = $this->statsService->studentsScopeFor($coach)
            ->whereIn('id', $studentIds)
            ->with('latestInnovationIndex')
            ->get()
            ->map(function (User $student) {
                return [
                    'id'     => $student->id,
                    'name'   => $student->name,
                    'indexes' => $student->latestInnovationIndex?->toIndexArray() ?? [],
                    'overall_score' => $student->latestInnovationIndex?->overall_score ?? 0,
                    'classification' => $student->latestInnovationIndex?->classification ?? 'developing',
                ];
            });

        return Inertia::render('Coach/CompareStudents', [
            'students'   => $students,
            'indexNames' => InnovationIndex::INDEX_NAMES,
        ]);
    }

    /**
     * السماح فقط للمعلم/المدرسة/الأدمن بالوصول
     */
    private function ensureCoach(User $user): void
    {
        abort_unless(
            $user->isTeacher() || $user->isSchool() || $user->canAccessAdminPanel(),
            403,
            'غير مصرح لك بالوصول إلى لوحة متابعة الابتكار.'
        );
    }

    /**
     * التأكد أن الطالب ضمن نطاق المشرف
     */
    private function ensureStudentInScope(User $coach, User $student): void
    {
        abort_unless(
            $student->role === 'student'
                && $this->statsService->studentsScopeFor($coach)->whereKey($student->id)->exists(),
            403,
            'هذا الطالب ليس ضمن طلابك.'
        );
    }
}
