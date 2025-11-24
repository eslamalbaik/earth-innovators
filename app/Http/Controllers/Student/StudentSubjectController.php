<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Subject;
use App\Services\SubjectService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class StudentSubjectController extends Controller
{
    public function __construct(
        private SubjectService $subjectService
    ) {}

    public function index()
    {
        $user = Auth::user();

        $studentSubjects = $user->subjects()
            ->select('id', 'name_ar', 'name_en', 'image', 'description_ar', 'description_en', 'teacher_count', 'sort_order')
            ->orderBy('sort_order')
            ->orderBy('name_ar')
            ->get()
            ->map(function ($subject) {
                return [
                    'id' => $subject->id,
                    'name_ar' => $subject->name_ar,
                    'name_en' => $subject->name_en,
                    'image' => $subject->image ?? '/images/subjects/default.png',
                    'description_ar' => $subject->description_ar,
                    'description_en' => $subject->description_en,
                    'teacher_count' => $subject->teacher_count,
                ];
            });

        $allSubjects = $this->subjectService->getAllSubjects()
            ->map(function ($subject) use ($user) {
                $isAdded = $user->subjects()->where('subjects.id', $subject->id)->exists();
                return [
                    'id' => $subject->id,
                    'name_ar' => $subject->name_ar,
                    'name_en' => $subject->name_en,
                    'image' => $subject->image ?? '/images/subjects/default.png',
                    'description_ar' => $subject->description_ar,
                    'teacher_count' => $subject->teacher_count,
                    'is_added' => $isAdded,
                ];
            });

        return Inertia::render('Student/Subjects', [
            'studentSubjects' => $studentSubjects,
            'allSubjects' => $allSubjects,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'subject_id' => 'required|exists:subjects,id',
        ]);

        $user = Auth::user();
        $subject = Subject::findOrFail($request->subject_id);

        if ($user->subjects()->where('subjects.id', $subject->id)->exists()) {
            return redirect()->back()->with('error', 'هذه المادة موجودة بالفعل في قائمتك');
        }

        $user->subjects()->attach($subject->id);

        return redirect()->back()->with('success', 'تم إضافة المادة بنجاح');
    }

    public function destroy($id)
    {
        $user = Auth::user();
        $subject = Subject::findOrFail($id);

        if (!$user->subjects()->where('subjects.id', $subject->id)->exists()) {
            return redirect()->back()->with('error', 'هذه المادة غير موجودة في قائمتك');
        }

        $user->subjects()->detach($subject->id);

        return redirect()->back()->with('success', 'تم حذف المادة بنجاح');
    }
}
