<?php

namespace App\Http\Controllers;

use App\Models\CognitiveAssessment;
use App\Models\User;
use App\Services\InnovationStatsService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * إدخال وعرض التقييمات المعرفية (ستانفورد-بينيه) —
 * متاح للمعلم/المدرسة/الأدمن فقط، ولا يراه الطالب (سرية التقرير)
 */
class CognitiveAssessmentController extends Controller
{
    public function __construct(
        private InnovationStatsService $statsService,
    ) {}

    /**
     * نموذج إدخال/تحديث التقييم المعرفي لطالب
     */
    public function form(Request $request, User $student): Response
    {
        $coach = $request->user();
        $this->authorizeCoach($coach, $student);

        return Inertia::render('Coach/CognitiveAssessmentForm', [
            'student'     => $student->only(['id', 'name', 'email', 'institution']),
            'assessment'  => $student->latestCognitiveAssessment,
            'factorNames' => CognitiveAssessment::FACTOR_NAMES,
        ]);
    }

    /**
     * حفظ التقييم المعرفي
     */
    public function store(Request $request, User $student)
    {
        $coach = $request->user();
        $this->authorizeCoach($coach, $student);

        $validated = $request->validate([
            'assessor_name'          => 'nullable|string|max:255',
            'assessment_date'        => 'nullable|date',
            'full_scale_iq'          => 'nullable|integer|min:40|max:160',
            'verbal_iq'              => 'nullable|integer|min:40|max:160',
            'nonverbal_iq'           => 'nullable|integer|min:40|max:160',
            'fluid_reasoning'        => 'nullable|integer|min:40|max:160',
            'knowledge'              => 'nullable|integer|min:40|max:160',
            'quantitative_reasoning' => 'nullable|integer|min:40|max:160',
            'visual_spatial'         => 'nullable|integer|min:40|max:160',
            'working_memory'         => 'nullable|integer|min:40|max:160',
            'composite_abilities'    => 'nullable|array',
            'composite_abilities.*'  => 'nullable|integer|min:40|max:160',
            'strengths'              => 'nullable|array',
            'strengths.*'            => 'string|max:255',
            'weaknesses'             => 'nullable|array',
            'weaknesses.*'           => 'string|max:255',
            'notes'                  => 'nullable|string|max:5000',
        ]);

        $validated['user_id'] = $student->id;
        $validated['entered_by'] = $coach->id;

        // تنظيف القوائم من القيم الفارغة
        foreach (['strengths', 'weaknesses'] as $listField) {
            if (isset($validated[$listField])) {
                $validated[$listField] = array_values(array_filter(
                    $validated[$listField],
                    fn($v) => trim((string) $v) !== ''
                ));
            }
        }

        CognitiveAssessment::create($validated);

        return redirect()
            ->route('teacher.innovation.student-report', $student)
            ->with('success', __('messages.msg_094'));
    }

    /**
     * السماح فقط للمشرف المسؤول عن الطالب
     */
    private function authorizeCoach(User $coach, User $student): void
    {
        abort_unless(
            $coach->isTeacher() || $coach->isSchool() || $coach->canAccessAdminPanel(),
            403,
            'غير مصرح لك بالوصول إلى التقييمات المعرفية.'
        );

        abort_unless(
            $student->role === 'student'
                && $this->statsService->studentsScopeFor($coach)->whereKey($student->id)->exists(),
            403,
            'هذا الطالب ليس ضمن طلابك.'
        );
    }
}
