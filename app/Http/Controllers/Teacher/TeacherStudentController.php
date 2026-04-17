<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class TeacherStudentController extends Controller
{
    public function index(Request $request)
    {
        $teacher = Auth::user();
        
        // الحصول على الطلاب الذين لديهم مشاريع مرتبطة بهذا المعلم
        // المشاريع التي أنشأها المعلم للطلاب (teacher_id)
        $query = User::where('role', 'student')
            ->where('teacher_id', $teacher->id)
            ->withCount('projects')
            ->with('badges');

        if (!empty($teacher->school_id)) {
            $query->where('school_id', $teacher->school_id);
        }
        
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
            });
        }
        
        $students = $query->latest()->paginate(20)->withQueryString()
            ->through(function ($student) use ($teacher) {
                $projectsCount = Project::where('user_id', $student->id)->count();
                $approvedProjects = Project::where('user_id', $student->id)->where('status', 'approved')->count();
                $pendingProjects = Project::where('user_id', $student->id)->where('status', 'pending')->count();
                
                // عدد المشاريع التي أنشأها المعلم لهذا الطالب
                $teacherProjectsCount = Project::where('user_id', $student->id)
                    ->where('teacher_id', $teacher->id)
                    ->count();
                
                return [
                    'id' => $student->id,
                    'name' => $student->name,
                    'email' => $student->email,
                    'phone' => $student->phone,
                    'year' => $student->year,
                    'points' => $student->points ?? 0,
                    'projects_count' => $projectsCount,
                    'approved_projects' => $approvedProjects,
                    'pending_projects' => $pendingProjects,
                    'teacher_projects_count' => $teacherProjectsCount,
                    'badges_count' => $student->badges->count(),
                    'badges' => $student->badges->map(function ($badge) {
                        return [
                            'id' => $badge->id,
                            'name' => $badge->name,
                            'name_ar' => $badge->name_ar,
                            'icon' => $badge->icon,
                        ];
                    }),
                    'created_at' => $student->created_at->format('Y-m-d'),
                ];
            });
        
        return Inertia::render('Teacher/Students/Index', [
            'students' => $students,
        ]);
    }

    public function store(Request $request)
    {
        $teacher = Auth::user();

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'phone' => ['nullable', 'string', 'max:50'],
            'password' => ['required', 'string', 'min:6'],
            'year' => ['nullable', 'string', 'max:50'],
        ]);

        User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
            'password' => Hash::make($validated['password']),
            'role' => 'student',
            'year' => $validated['year'] ?? null,
            'school_id' => $teacher->school_id ?? null,
            'teacher_id' => $teacher->id,
        ]);

        return redirect()->back()->with('success', ['key' => 'toastMessages.teacherStudentCreatedSuccess']);
    }

    public function update(Request $request, User $student)
    {
        $teacher = Auth::user();

        if ($student->role !== 'student' || (int) $student->teacher_id !== (int) $teacher->id) {
            abort(404);
        }
        if (!empty($teacher->school_id) && (int) $student->school_id !== (int) $teacher->school_id) {
            abort(404);
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users', 'email')->ignore($student->id)],
            'phone' => ['nullable', 'string', 'max:50'],
            'password' => ['nullable', 'string', 'min:6'],
            'year' => ['nullable', 'string', 'max:50'],
        ]);

        $student->name = $validated['name'];
        $student->email = $validated['email'];
        $student->phone = $validated['phone'] ?? null;
        $student->year = $validated['year'] ?? null;

        if (!empty($validated['password'])) {
            $student->password = Hash::make($validated['password']);
        }

        $student->save();

        return redirect()->back()->with('success', ['key' => 'toastMessages.teacherStudentUpdatedSuccess']);
    }

    public function destroy(User $student)
    {
        $teacher = Auth::user();

        if ($student->role !== 'student' || (int) $student->teacher_id !== (int) $teacher->id) {
            abort(404);
        }
        if (!empty($teacher->school_id) && (int) $student->school_id !== (int) $teacher->school_id) {
            abort(404);
        }

        $student->delete();

        return redirect()->back()->with('success', ['key' => 'toastMessages.teacherStudentDeletedSuccess']);
    }
}
