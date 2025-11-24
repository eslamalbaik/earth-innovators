<?php

namespace App\Http\Controllers\School;

use App\Http\Controllers\Controller;
use App\Http\Requests\Student\StoreStudentRequest;
use App\Http\Requests\Student\UpdateStudentRequest;
use App\Http\Requests\Student\AwardBadgeRequest;
use App\DTO\Student\StoreStudentDTO;
use App\DTO\Student\UpdateStudentDTO;
use App\Services\StudentService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class SchoolStudentController extends Controller
{
    public function __construct(
        private StudentService $studentService
    ) {}

    public function index(Request $request)
    {
        $school = Auth::user();

        $students = $this->studentService->getStudentsBySchool(
            $school->id,
            $request->get('search'),
            20
        )->withQueryString();

        $availableBadges = $this->studentService->getAvailableBadges($school->id);

        return Inertia::render('School/Students/Index', [
            'students' => $students,
            'availableBadges' => $availableBadges,
        ]);
    }

    public function store(StoreStudentRequest $request)
    {
        $school = Auth::user();

        $dto = StoreStudentDTO::fromRequest($request->validated(), $school->id);

        $this->studentService->storeStudent($dto);

        return redirect()->route('school.students.index')
            ->with('success', 'تم إضافة الطالب بنجاح');
    }

    public function update(UpdateStudentRequest $request, $id)
    {
        $school = Auth::user();

        $dto = UpdateStudentDTO::fromRequest($request->validated());

        $this->studentService->updateStudent($id, $school->id, $dto);

        return redirect()->route('school.students.index')
            ->with('success', 'تم تحديث بيانات الطالب بنجاح');
    }

    public function destroy($id)
    {
        $school = Auth::user();

        $this->studentService->deleteStudent($id, $school->id);

        return redirect()->route('school.students.index')
            ->with('success', 'تم حذف الطالب بنجاح');
    }

    public function awardBadge(AwardBadgeRequest $request, $id)
    {
        $school = Auth::user();

        try {
            $this->studentService->awardBadge(
                $id,
                $school->id,
                $request->validated()['badge_id'],
                $request->validated()['reason'] ?? null
            );

            return back()->with('success', 'تم منح الشارة للطالب بنجاح');
        } catch (\Exception $e) {
            return back()->withErrors(['badge_id' => $e->getMessage()]);
        }
    }

    public function removeBadge(Request $request, $studentId, $badgeId)
    {
        $school = Auth::user();

        $this->studentService->removeBadge($studentId, $school->id, $badgeId);

        return back()->with('success', 'تم إزالة الشارة بنجاح');
    }
}
