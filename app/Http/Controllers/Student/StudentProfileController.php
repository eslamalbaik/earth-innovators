<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Services\ProfileService;
use App\Services\DashboardService;
use App\Services\ActivityService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;

class StudentProfileController extends Controller
{
    public function __construct(
        private ProfileService $profileService,
        private DashboardService $dashboardService,
        private ActivityService $activityService
    ) {}

    public function index(Request $request): Response
    {
        $user = Auth::user();

        // Check if user is a student
        if (!$user || !$user->isStudent()) {
            return redirect()->route('login');
        }

        $data = $this->profileService->getProfileData($user);

        // Get dashboard stats
        $dashboardStats = $this->dashboardService->getStudentDashboardStats($user->id);
        
        // Get student-specific stats
        $winningProjects = DB::table('projects')
            ->where('user_id', $user->id)
            ->where('status', 'approved')
            ->where(function ($q) {
                $q->where('rating', '>=', 4)
                  ->orWhereExists(function ($subQuery) {
                      $subQuery->select(DB::raw(1))
                          ->from('project_submissions')
                          ->whereColumn('project_submissions.project_id', 'projects.id')
                          ->where('project_submissions.status', 'approved')
                          ->where('project_submissions.rating', '>=', 4);
                  });
            })
            ->count();

        $stats = [
            'points' => $user->points ?? 0,
            'projects' => $dashboardStats['total_projects'] ?? $user->projects()->count(),
            'badges' => $dashboardStats['total_badges'] ?? $user->badges()->count(),
            'winning' => $winningProjects,
        ];

        // Get recent projects
        $projects = $user->projects()
            ->select('id', 'title', 'status', 'views', 'likes', 'created_at')
            ->latest()
            ->limit(5)
            ->get()
            ->map(function ($project) {
                return [
                    'id' => $project->id,
                    'title' => $project->title,
                    'status' => $project->status,
                    'flags' => $project->views ?? 0,
                    'hearts' => $project->likes ?? 0,
                ];
            });

        // Get recent badges
        $badges = $this->activityService->getRecentBadges($user->id, 3)
            ->map(function ($badge) {
                return [
                    'id' => $badge['id'],
                    'name_ar' => $badge['name'],
                    'icon' => $badge['icon'] ?? null,
                    'image' => $badge['image'] ?? null,
                    'color' => $this->getBadgeColor($badge['name']),
                ];
            });

        // Get activities
        $activities = $this->activityService->getStudentActivities($user->id, 5)
            ->map(function ($activity) {
                return [
                    'id' => uniqid(),
                    'text' => $activity['action'],
                    'time' => $activity['timeAgo'],
                    'color' => $activity['color'] ?? 'blue',
                ];
            });

        // Get school information
        $school = $user->school;
        $schoolData = null;
        if ($school) {
            $schoolData = [
                'id' => $school->id,
                'name' => $school->name,
            ];
        }

        // Get available schools for selection
        $availableSchools = \App\Models\User::where('role', 'school')
            ->select('id', 'name')
            ->orderBy('name')
            ->get()
            ->map(function ($school) {
                return [
                    'id' => $school->id,
                    'name' => $school->name,
                ];
            });

        // Calculate dynamic tags based on student achievements
        $tags = $this->calculateStudentTags($user, $stats, $projects, $badges, $activities);

        return Inertia::render('Student/Profile', array_merge($data, [
            'stats' => $stats,
            'projects' => $projects,
            'badges' => $badges,
            'activities' => $activities,
            'school' => $schoolData,
            'availableSchools' => $availableSchools,
            'tags' => $tags,
        ]));
    }

    private function getBadgeColor($badgeName): string
    {
        // Map badge names to colors
        $colorMap = [
            'المركز الثالث' => 'purple',
            'مشروع مميز' => 'green',
            'تحدي الإبداع' => 'blue',
            'المبتكر' => 'orange',
            'النجمة' => 'yellow',
        ];

        foreach ($colorMap as $name => $color) {
            if (str_contains($badgeName, $name)) {
                return $color;
            }
        }

        return 'blue'; // default color
    }

    /**
     * Calculate student tags based on achievements and activity
     */
    private function calculateStudentTags($user, $stats, $projects, $badges, $activities): array
    {
        $tags = [];

        // "مبتكر" - If student has approved projects or innovation-related badges
        $approvedProjects = \App\Models\Project::where('user_id', $user->id)
            ->where('status', 'approved')
            ->count();
        
        $hasInnovationBadge = \App\Models\UserBadge::where('user_id', $user->id)
            ->whereHas('badge', function ($q) {
                $q->where(function ($query) {
                    $query->where('name_ar', 'like', '%مبتكر%')
                        ->orWhere('name_ar', 'like', '%إبداع%')
                        ->orWhere('name_ar', 'like', '%ابتكار%')
                        ->orWhere('name', 'like', '%innovator%')
                        ->orWhere('name', 'like', '%innovation%');
                });
            })
            ->exists();

        if ($approvedProjects >= 1 || $hasInnovationBadge || $stats['winning'] > 0) {
            $tags[] = [
                'label' => 'مبتكر',
                'color' => 'blue',
                'bgColor' => 'bg-blue-100',
                'textColor' => 'text-blue-700',
            ];
        }

        // "مشارك نشط" - If student has recent activities or multiple projects
        $totalProjects = $stats['projects'] ?? 0;
        $totalActivities = count($activities);
        $recentActivityCount = \App\Models\Project::where('user_id', $user->id)
            ->where('created_at', '>=', now()->subDays(30))
            ->count();

        if ($totalProjects >= 2 || $totalActivities >= 3 || $recentActivityCount >= 1) {
            $tags[] = [
                'label' => 'مشارك نشط',
                'color' => 'purple',
                'bgColor' => 'bg-purple-100',
                'textColor' => 'text-purple-700',
            ];
        }

        // "نجم" - If student has high points or multiple badges
        if (($user->points ?? 0) >= 100 || ($stats['badges'] ?? 0) >= 3) {
            $tags[] = [
                'label' => 'نجم',
                'color' => 'yellow',
                'bgColor' => 'bg-yellow-100',
                'textColor' => 'text-yellow-700',
            ];
        }

        // "فائز" - If student has winning projects
        if ($stats['winning'] > 0) {
            $tags[] = [
                'label' => 'فائز',
                'color' => 'green',
                'bgColor' => 'bg-green-100',
                'textColor' => 'text-green-700',
            ];
        }

        // "متميز" - If student has high rating or excellent achievements
        $highRatedProjects = \App\Models\Project::where('user_id', $user->id)
            ->where('status', 'approved')
            ->where('rating', '>=', 4)
            ->count();

        if ($highRatedProjects >= 2 || ($user->points ?? 0) >= 200) {
            $tags[] = [
                'label' => 'متميز',
                'color' => 'orange',
                'bgColor' => 'bg-orange-100',
                'textColor' => 'text-orange-700',
            ];
        }

        return $tags;
    }

    public function updateSchool(Request $request)
    {
        $user = Auth::user();

        // Check if user is a student
        if (!$user || !$user->isStudent()) {
            return redirect()->back()->with('error', 'غير مصرح لك بهذا الإجراء');
        }

        $request->validate([
            'school_id' => 'required|exists:users,id',
        ]);

        $school = \App\Models\User::find($request->school_id);
        if (!$school || !$school->isSchool()) {
            return redirect()->back()->with('error', 'المدرسة المحددة غير صحيحة');
        }

        $user->update([
            'school_id' => $request->school_id,
        ]);

        // Clear cache
        $this->dashboardService->clearDashboardCache($user->id, 'student');
        $this->activityService->clearActivityCache($user->id);

        return redirect()->route('student.profile')
            ->with('success', 'تم تحديث المدرسة بنجاح');
    }
}

