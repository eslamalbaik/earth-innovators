<?php

namespace App\Http\Controllers\School;

use App\Http\Controllers\Controller;
use App\Http\Requests\Student\StoreStudentRequest;
use App\Http\Requests\Student\UpdateStudentRequest;
use App\Http\Requests\Student\AwardBadgeRequest;
use App\DTO\Student\StoreStudentDTO;
use App\DTO\Student\UpdateStudentDTO;
use App\Services\StudentService;
use App\Models\User;
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
            $school->canAccessAllSchoolData() ? 0 : $school->id,
            $request->get('search'),
            20
        )->withQueryString();

        $availableBadges = $this->studentService->getAvailableBadges($school->canAccessAllSchoolData() ? 0 : $school->id);
        $availableStudents = User::where('role', 'student')
            ->where(function ($query) use ($school) {
                $query->whereNull('school_id')
                    ->orWhere('school_id', $school->id);
            })
            ->where(function ($query) use ($school) {
                $query->whereNull('school_id')
                    ->orWhereDoesntHave('school', fn ($schoolQuery) => $schoolQuery->where('id', $school->id));
            })
            ->orderBy('name')
            ->limit(200)
            ->get(['id', 'name', 'email', 'phone', 'school_id'])
            ->map(fn ($student) => [
                'id' => $student->id,
                'name' => $student->name,
                'email' => $student->email,
                'phone' => $student->phone,
                'school_id' => $student->school_id,
            ]);

        return Inertia::render('School/Students/Index', [
            'students' => $students,
            'availableBadges' => $availableBadges,
            'availableStudents' => $availableStudents,
        ]);
    }

    public function store(StoreStudentRequest $request)
    {
        $school = Auth::user();

        if ($request->filled('existing_student_id')) {
            $this->studentService->attachExistingStudentToSchool((int) $request->validated()['existing_student_id'], $school->id);

            return redirect()->route('school.students.index')
                ->with('success', 'تم ربط الطالب بالمدرسة بنجاح');
        }

        $dto = StoreStudentDTO::fromRequest($request->validated(), $school->id);

        $this->studentService->storeStudent($dto);

        return redirect()->route('school.students.index')
            ->with('success', 'تم إضافة الطالب بنجاح');
    }

    public function show($id)
    {
        $school = Auth::user();

        try {
            $this->studentService->ensureStudentBelongsToSchool((int) $id, $school->id);
        } catch (\Throwable $e) {
            abort(404);
        }

        return redirect()->route('school.students.index');
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

    public function awardBadgeFallback($id)
    {
        $school = Auth::user();

        try {
            $this->studentService->ensureStudentBelongsToSchool((int) $id, $school->id);
        } catch (\Throwable $e) {
            abort(404);
        }

        return redirect()->route('school.students.index');
    }

    public function removeBadge(Request $request, $studentId, $badgeId)
    {
        $school = Auth::user();

        $this->studentService->removeBadge($studentId, $school->id, $badgeId);

        return back()->with('success', 'تم إزالة الشارة بنجاح');
    }
}
