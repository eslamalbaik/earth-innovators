<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\Publication;
use App\Models\UserBadge;
use App\Services\DashboardService;
use App\Services\ActivityService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TeacherDashboardController extends Controller
{
    public function __construct(
        private DashboardService $dashboardService,
        private ActivityService $activityService
    ) {}

    public function index(Request $request)
    {
        $user = auth()->user();
        $teacher = $user->teacher;

        // إذا لم يكن هناك teacher record، قم بإنشائه تلقائياً
        if (!$teacher) {
            try {
                $teacher = \App\Models\Teacher::create([
                    'user_id' => $user->id,
                    'name_ar' => $user->name,
                    'name_en' => $user->name,
                    'city' => 'غير محدد',
                    'bio' => null,
                    'qualifications' => null,
                    'subjects' => json_encode([]),
                    'stages' => json_encode([]),
                    'experience_years' => 0,
                    'price_per_hour' => 0,
                    'nationality' => 'سعودي',
                    'gender' => null,
                    'neighborhoods' => json_encode([]),
                    'is_verified' => true,
                    'is_active' => true,
                ]);

                $user->refresh();
                $user->load('teacher');
                $teacher = $user->teacher;
            } catch (\Exception $e) {
                return redirect()->route('dashboard')->with('error', 'حدث خطأ أثناء إنشاء بيانات المعلم: ' . $e->getMessage());
            }
        }

        // Get optimized dashboard stats from service
        $stats = $this->dashboardService->getTeacherDashboardStats($teacher->id, $user->id);

        // Get recent badges
        $recentBadges = $this->activityService->getRecentBadges($user->id, 5);
        $stats['badges']['recent'] = $recentBadges;

        // Get recent projects
        $recentProjects = Project::where('teacher_id', $teacher->id)
            ->select('id', 'title', 'status', 'views', 'likes', 'points_earned', 'created_at')
            ->latest()
            ->limit(5)
            ->get()
            ->map(function ($project) {
                return [
                    'id' => $project->id,
                    'title' => $project->title,
                    'status' => $project->status,
                    'views' => $project->views,
                    'likes' => $project->likes,
                    'points' => $project->points_earned,
                    'created_at' => $project->created_at->format('Y-m-d'),
                ];
            });

        // Get recent publications
        $recentPublications = Publication::where('author_id', $user->id)
            ->select('id', 'title', 'type', 'status', 'views', 'likes_count', 'created_at')
            ->latest()
            ->limit(5)
            ->get()
            ->map(function ($publication) {
                return [
                    'id' => $publication->id,
                    'title' => $publication->title,
                    'type' => $publication->type,
                    'status' => $publication->status,
                    'views' => $publication->views,
                    'likes' => $publication->likes_count,
                    'created_at' => $publication->created_at->format('Y-m-d'),
                ];
            });

        $stats['recentProjects'] = $recentProjects;
        $stats['recentPublications'] = $recentPublications;

        $isActive = (bool) $teacher->is_active;
        $isVerified = (bool) $teacher->is_verified;

        return Inertia::render('Teacher/Dashboard', [
            'teacher' => [
                'name' => $teacher->name_ar,
                'subjects' => is_array($teacher->subjects) ? $teacher->subjects : json_decode($teacher->subjects, true),
                'is_active' => $isActive,
                'is_verified' => $isVerified,
            ],
            'stats' => $stats,
            'activationBanner' => !$isActive ? [
                'title' => 'حسابك قيد المراجعة',
                'message' => 'حسابك غير نشط حالياً ولن يظهر للطلاب حتى يتم تفعيله من قبل فريق الإدارة. سنقوم بإشعارك فور تفعيل الحساب.',
                'is_verified' => $isVerified,
            ] : null,
        ]);
    }
}
