<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Curriculum;
use App\Models\StudyPlan;
use App\Models\Subject;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Admin CRUD for the hierarchical academic structure — requirement 5.3:
 * Curriculum -> Subject -> per grade/section StudyPlan (stage, grade,
 * section, hours, academic_year, semester). Any addition here becomes
 * immediately available in project/evaluation subject pickers.
 */
class AcademicStructureController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/AcademicStructure/Index', [
            'curricula'  => Curriculum::orderBy('name_ar')->get(),
            'subjects'   => Subject::orderBy('sort_order')->orderBy('name_ar')->get(),
            'studyPlans' => StudyPlan::with(['curriculum:id,name_ar', 'subject:id,name_ar', 'school:id,name'])
                ->orderByDesc('id')->get(),
            'schools'    => User::whereIn('role', ['school', 'educational_institution'])
                ->orderBy('name')->get(['id', 'name']),
        ]);
    }

    // ─── Curricula ───────────────────────────────────────────

    public function storeCurriculum(Request $request)
    {
        Curriculum::create($request->validate([
            'name_ar'   => 'required|string|max:255',
            'name_en'   => 'nullable|string|max:255',
            'is_active' => 'boolean',
        ]));

        return back()->with('flash', ['success' => true]);
    }

    public function updateCurriculum(Request $request, Curriculum $curriculum)
    {
        $curriculum->update($request->validate([
            'name_ar'   => 'required|string|max:255',
            'name_en'   => 'nullable|string|max:255',
            'is_active' => 'boolean',
        ]));

        return back()->with('flash', ['success' => true]);
    }

    public function destroyCurriculum(Curriculum $curriculum)
    {
        $curriculum->delete();

        return back()->with('flash', ['success' => true]);
    }

    // ─── Subjects ────────────────────────────────────────────

    public function storeSubject(Request $request)
    {
        Subject::create($this->subjectPayload($request));

        return back()->with('flash', ['success' => true]);
    }

    public function updateSubject(Request $request, Subject $subject)
    {
        $subject->update($this->subjectPayload($request));

        return back()->with('flash', ['success' => true]);
    }

    public function destroySubject(Subject $subject)
    {
        $subject->delete();

        return back()->with('flash', ['success' => true]);
    }

    private function subjectPayload(Request $request): array
    {
        return $request->validate([
            'name_ar'   => 'required|string|max:255',
            'name_en'   => 'nullable|string|max:255',
            'is_active' => 'boolean',
            'sort_order' => 'nullable|integer',
        ]);
    }

    // ─── Study plans (grade/section allocation) ─────────────

    public function storeStudyPlan(Request $request)
    {
        StudyPlan::create($this->studyPlanPayload($request));

        return back()->with('flash', ['success' => true]);
    }

    public function updateStudyPlan(Request $request, StudyPlan $studyPlan)
    {
        $studyPlan->update($this->studyPlanPayload($request));

        return back()->with('flash', ['success' => true]);
    }

    public function destroyStudyPlan(StudyPlan $studyPlan)
    {
        $studyPlan->delete();

        return back()->with('flash', ['success' => true]);
    }

    private function studyPlanPayload(Request $request): array
    {
        return $request->validate([
            'school_id'     => 'nullable|exists:users,id',
            'curriculum_id' => 'required|exists:curricula,id',
            'subject_id'    => 'required|exists:subjects,id',
            'stage'         => 'nullable|string|max:255',
            'grade'         => 'nullable|string|max:255',
            'section'       => 'nullable|string|max:50',
            'hours'         => 'nullable|integer|min:0|max:60',
            'academic_year' => 'nullable|string|max:20',
            'semester'      => 'nullable|string|max:50',
        ]);
    }
}
