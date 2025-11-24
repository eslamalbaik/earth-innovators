<?php

namespace App\Http\Controllers\School;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\User;
use App\Services\DashboardService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class SchoolDashboardController extends Controller
{
    public function __construct(
        private DashboardService $dashboardService
    ) {}

    public function index(Request $request)
    {
        $school = Auth::user();

        // Get optimized dashboard stats from service
        $stats = $this->dashboardService->getSchoolDashboardStats($school->id);

        // Get pending projects for review
        $studentIds = User::where('school_id', $school->id)
            ->where('role', 'student')
            ->pluck('id');

        $pendingProjectsList = Project::whereIn('user_id', $studentIds)
            ->where('status', 'pending')
            ->with('user:id,name')
            ->select('id', 'title', 'category', 'user_id', 'created_at')
            ->latest()
            ->limit(10)
            ->get()
            ->map(function ($project) {
                return [
                    'id' => $project->id,
                    'title' => $project->title,
                    'category' => $project->category,
                    'student_name' => $project->user->name ?? 'غير محدد',
                    'student_id' => $project->user_id,
                    'created_at' => $project->created_at->format('Y-m-d H:i'),
                ];
            });

        // Get recent approved projects
        $recentApprovedProjects = Project::whereIn('user_id', $studentIds)
            ->where('status', 'approved')
            ->with('user:id,name')
            ->select('id', 'title', 'category', 'user_id', 'points_earned', 'approved_at')
            ->latest()
            ->limit(5)
            ->get()
            ->map(function ($project) {
                return [
                    'id' => $project->id,
                    'title' => $project->title,
                    'category' => $project->category,
                    'student_name' => $project->user->name ?? 'غير محدد',
                    'points_earned' => $project->points_earned ?? 0,
                    'approved_at' => $project->approved_at?->format('Y-m-d H:i'),
                ];
            });

        return Inertia::render('School/Dashboard', [
            'stats' => $stats,
            'pendingProjects' => $pendingProjectsList,
            'recentApprovedProjects' => $recentApprovedProjects,
        ]);
    }
}
