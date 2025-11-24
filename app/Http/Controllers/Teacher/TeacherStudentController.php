<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class TeacherStudentController extends Controller
{
    public function index(Request $request)
    {
        $teacher = Auth::user();
        
        // الحصول على الطلاب الذين لديهم مشاريع مرتبطة بهذا المعلم
        // المشاريع التي أنشأها المعلم للطلاب (teacher_id)
        $teacherProjects = Project::where('teacher_id', $teacher->id)
            ->pluck('user_id')
            ->unique();
        
        $query = User::whereIn('id', $teacherProjects)
            ->where('role', 'student')
            ->withCount('projects')
            ->with('badges');
        
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
}

