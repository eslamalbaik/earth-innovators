<?php

namespace App\Services;

use App\Models\User;
use App\Models\Project;
use App\Models\Booking;
use App\Models\Payment;
use App\Models\Teacher;
use App\Models\UserBadge;
use App\Models\ProjectSubmission;
use App\Repositories\ProjectRepository;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;

class DashboardService extends BaseService
{
    public function __construct(
        private ProjectRepository $projectRepository
    ) {}

    public function getSchoolDashboardStats(int $schoolId): array
    {
        $cacheKey = "school_dashboard_stats_{$schoolId}";
        $cacheTag = "school_dashboard_{$schoolId}";

        return $this->cacheTags($cacheTag, $cacheKey, function () use ($schoolId) {
            // Get student IDs in one query
            $studentIds = User::where('school_id', $schoolId)
                ->where('role', 'student')
                ->pluck('id')
                ->toArray();

            if (empty($studentIds)) {
                return $this->getEmptySchoolStats();
            }

            // Get all project stats in a single query
            $projectStats = DB::table('projects')
                ->whereIn('user_id', $studentIds)
                ->selectRaw('
                    COUNT(*) as total,
                    SUM(CASE WHEN status = "pending" THEN 1 ELSE 0 END) as pending,
                    SUM(CASE WHEN status = "approved" THEN 1 ELSE 0 END) as approved,
                    SUM(CASE WHEN status = "rejected" THEN 1 ELSE 0 END) as rejected,
                    COUNT(DISTINCT user_id) as students_with_projects
                ')
                ->first();

            // Get points stats in one query
            $pointsStats = DB::table('users')
                ->whereIn('id', $studentIds)
                ->selectRaw('
                    SUM(points) as total_points,
                    COUNT(*) as total_students,
                    AVG(points) as avg_points
                ')
                ->first();

            // Get badge stats in one query
            $badgeStats = DB::table('user_badges')
                ->whereIn('user_id', $studentIds)
                ->selectRaw('
                    COUNT(*) as total_badges,
                    COUNT(DISTINCT badge_id) as unique_badges
                ')
                ->first();

            // Get school project IDs for submissions
            $schoolProjectIds = Project::where('school_id', $schoolId)
                ->where('status', 'approved')
                ->pluck('id')
                ->toArray();

            $submissionStats = [];
            if (!empty($schoolProjectIds)) {
                $submissionStats = DB::table('project_submissions')
                    ->whereIn('project_id', $schoolProjectIds)
                    ->selectRaw('
                        COUNT(*) as total,
                        SUM(CASE WHEN status = "submitted" THEN 1 ELSE 0 END) as submitted,
                        SUM(CASE WHEN status = "reviewed" THEN 1 ELSE 0 END) as reviewed,
                        SUM(CASE WHEN status = "approved" THEN 1 ELSE 0 END) as approved,
                        SUM(CASE WHEN status = "rejected" THEN 1 ELSE 0 END) as rejected
                    ')
                    ->first();
            }

            // Get ranking
            $ranking = $this->getSchoolRanking($schoolId);

            return [
                'totalProjects' => (int) ($projectStats->total ?? 0),
                'pendingProjects' => (int) ($projectStats->pending ?? 0),
                'approvedProjects' => (int) ($projectStats->approved ?? 0),
                'rejectedProjects' => (int) ($projectStats->rejected ?? 0),
                'totalStudents' => (int) ($pointsStats->total_students ?? 0),
                'studentsWithProjects' => (int) ($projectStats->students_with_projects ?? 0),
                'totalPoints' => (int) ($pointsStats->total_points ?? 0),
                'avgPointsPerStudent' => round((float) ($pointsStats->avg_points ?? 0), 2),
                'totalBadges' => (int) ($badgeStats->total_badges ?? 0),
                'uniqueBadges' => (int) ($badgeStats->unique_badges ?? 0),
                'submissions' => [
                    'total' => (int) ($submissionStats->total ?? 0),
                    'submitted' => (int) ($submissionStats->submitted ?? 0),
                    'reviewed' => (int) ($submissionStats->reviewed ?? 0),
                    'approved' => (int) ($submissionStats->approved ?? 0),
                    'rejected' => (int) ($submissionStats->rejected ?? 0),
                ],
                'rank' => $ranking['rank'],
                'totalSchools' => $ranking['total'],
            ];
        }, 300); // Cache for 5 minutes
    }

    public function getStudentDashboardStats(int $userId): array
    {
        $cacheKey = "student_dashboard_stats_{$userId}";
        $cacheTag = "student_dashboard_{$userId}";

        return $this->cacheTags($cacheTag, $cacheKey, function () use ($userId) {
            // Get project stats in one query
            $projectStats = DB::table('projects')
                ->where('user_id', $userId)
                ->selectRaw('
                    COUNT(*) as total,
                    SUM(CASE WHEN status = "approved" THEN 1 ELSE 0 END) as approved,
                    SUM(CASE WHEN status = "pending" THEN 1 ELSE 0 END) as pending
                ')
                ->first();

            // Get winning projects count (optimized)
            $winningProjects = DB::table('projects')
                ->where('user_id', $userId)
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

            // Get user points
            $user = User::select('points')->find($userId);
            $totalPoints = $user->points ?? 0;

            // Get badge count
            $totalBadges = DB::table('user_badges')
                ->where('user_id', $userId)
                ->count();

            // Get recent projects - المشاريع التي أنشأها الطالب أو سلمها
            $userProjectIds = Project::where('user_id', $userId)
                ->pluck('id')
                ->toArray();
            
            $submittedProjectIds = ProjectSubmission::where('student_id', $userId)
                ->pluck('project_id')
                ->toArray();
            
            // دمج قوائم المشاريع
            $allProjectIds = array_unique(array_merge($userProjectIds, $submittedProjectIds));
            
            $recentProjects = Project::whereIn('id', $allProjectIds)
                ->select('id', 'title', 'status', 'rating', 'likes', 'views', 'created_at')
                ->latest()
                ->limit(5)
                ->get()
                ->map(function ($project) use ($userId) {
                    // التحقق من أن هذا المشروع منشأ من قبل الطالب أم مسلم
                    $isOwned = $project->user_id === $userId;
                    $submission = ProjectSubmission::where('project_id', $project->id)
                        ->where('student_id', $userId)
                        ->first();
                    
                    return [
                        'id' => $project->id,
                        'title' => $project->title,
                        'status' => $submission ? $submission->status : $project->status,
                        'rating' => $submission ? ($submission->rating ?? $project->rating) : $project->rating,
                        'likes' => $project->likes ?? 0,
                        'views' => $project->views ?? 0,
                        'created_at' => $submission ? $submission->submitted_at->format('Y-m-d') : $project->created_at->format('Y-m-d'),
                        'is_submission' => !$isOwned && $submission !== null,
                    ];
                });

            return [
                'totalPoints' => $totalPoints,
                'totalProjects' => (int) ($projectStats->total ?? 0),
                'totalBadges' => $totalBadges,
                'winningProjects' => $winningProjects,
                'recentProjects' => $recentProjects,
            ];
        }, 300); // Cache for 5 minutes
    }

    public function getAdminDashboardStats(): array
    {
        $cacheKey = 'admin_dashboard_stats';
        $cacheTag = 'admin_dashboard';

        return $this->cacheTags($cacheTag, $cacheKey, function () {
            // Get revenue from payments (optimized)
            $totalRevenue = DB::table('payments')
                ->where('status', 'completed')
                ->sum('amount');

            // If no revenue from payments, check bookings
            if ($totalRevenue == 0) {
                $totalRevenue = DB::table('bookings')
                    ->where(function ($q) {
                        $q->where('payment_status', 'paid')
                          ->orWhere('payment_received', true);
                    })
                    ->sum(DB::raw('COALESCE(total_price, price, 0)'));
            }

            // Get average rating (optimized)
            $avgRating = DB::table('teachers')->avg('rating');
            if ($avgRating == 0) {
                $avgRating = DB::table('reviews')->avg('rating') ?? 0;
            }

            // Get all stats in optimized queries
            $teacherCount = DB::table('teachers')
                ->where('is_active', true)
                ->count();

            $studentCount = DB::table('users')
                ->where('role', 'student')
                ->count();

            // Get booking stats in one query
            $bookingStats = DB::table('bookings')
                ->selectRaw('
                    COUNT(*) as total,
                    SUM(CASE WHEN status = "pending" THEN 1 ELSE 0 END) as pending,
                    SUM(CASE WHEN status = "approved" THEN 1 ELSE 0 END) as approved,
                    SUM(CASE WHEN status IN ("approved", "confirmed") THEN 1 ELSE 0 END) as confirmed,
                    SUM(CASE WHEN status = "completed" THEN 1 ELSE 0 END) as completed,
                    SUM(CASE WHEN status = "rejected" THEN 1 ELSE 0 END) as rejected
                ')
                ->first();

            return [
                'totalTeachers' => $teacherCount,
                'totalBookings' => (int) ($bookingStats->total ?? 0),
                'totalRevenue' => (float) $totalRevenue,
                'avgRating' => round((float) $avgRating, 1),
                'activeStudents' => $studentCount,
                'pendingBookings' => (int) ($bookingStats->pending ?? 0),
                'approvedBookings' => (int) ($bookingStats->approved ?? 0),
                'confirmedBookings' => (int) ($bookingStats->confirmed ?? 0),
                'completedBookings' => (int) ($bookingStats->completed ?? 0),
                'rejectedBookings' => (int) ($bookingStats->rejected ?? 0),
            ];
        }, 300); // Cache for 5 minutes
    }

    private function getSchoolRanking(int $schoolId): array
    {
        $cacheKey = "school_ranking_{$schoolId}";

        return $this->cache($cacheKey, function () use ($schoolId) {
            $schoolsRanking = User::where('role', 'school')
                ->select('id')
                ->withCount(['students as total_points' => function ($query) {
                    $query->select(DB::raw('COALESCE(SUM(points), 0)'));
                }])
                ->orderBy('total_points', 'desc')
                ->get();

            $rank = 1;
            foreach ($schoolsRanking as $school) {
                if ($school->id == $schoolId) {
                    return [
                        'rank' => $rank,
                        'total' => $schoolsRanking->count(),
                        'points' => $school->total_points ?? 0,
                    ];
                }
                $rank++;
            }

            return [
                'rank' => '-',
                'total' => $schoolsRanking->count(),
                'points' => 0,
            ];
        }, 600); // Cache for 10 minutes
    }

    private function getEmptySchoolStats(): array
    {
        return [
            'totalProjects' => 0,
            'pendingProjects' => 0,
            'approvedProjects' => 0,
            'rejectedProjects' => 0,
            'totalStudents' => 0,
            'studentsWithProjects' => 0,
            'totalPoints' => 0,
            'avgPointsPerStudent' => 0,
            'totalBadges' => 0,
            'uniqueBadges' => 0,
            'submissions' => [
                'total' => 0,
                'submitted' => 0,
                'reviewed' => 0,
                'approved' => 0,
                'rejected' => 0,
            ],
            'rank' => '-',
            'totalSchools' => 0,
        ];
    }

    public function getTeacherDashboardStats(int $teacherId, int $userId): array
    {
        $cacheKey = "teacher_dashboard_stats_{$teacherId}";
        $cacheTag = "teacher_dashboard_{$teacherId}";

        return $this->cacheTags($cacheTag, $cacheKey, function () use ($teacherId, $userId) {
            // Get project stats in one query
            $projectStats = DB::table('projects')
                ->where('teacher_id', $teacherId)
                ->selectRaw('
                    COUNT(*) as total,
                    SUM(CASE WHEN status = "approved" THEN 1 ELSE 0 END) as approved,
                    SUM(CASE WHEN status = "pending" THEN 1 ELSE 0 END) as pending,
                    SUM(CASE WHEN status = "rejected" THEN 1 ELSE 0 END) as rejected,
                    SUM(views) as total_views,
                    SUM(likes) as total_likes,
                    SUM(points_earned) as total_points
                ')
                ->first();

            // Get publication stats in one query
            $publicationStats = DB::table('publications')
                ->where('author_id', $userId)
                ->selectRaw('
                    COUNT(*) as total,
                    SUM(CASE WHEN status = "approved" THEN 1 ELSE 0 END) as approved,
                    SUM(CASE WHEN status = "pending" THEN 1 ELSE 0 END) as pending,
                    SUM(CASE WHEN status = "rejected" THEN 1 ELSE 0 END) as rejected,
                    SUM(views) as total_views,
                    SUM(likes_count) as total_likes
                ')
                ->first();

            // Get challenge stats
            $challengeStats = DB::table('challenges')
                ->where('created_by', $userId)
                ->selectRaw('
                    COUNT(*) as created,
                    SUM(CASE WHEN status = "active" THEN 1 ELSE 0 END) as active,
                    SUM(CASE WHEN status = "completed" THEN 1 ELSE 0 END) as completed
                ')
                ->first();

            // Get points stats
            $pointsStats = DB::table('points')
                ->where('user_id', $userId)
                ->selectRaw('
                    SUM(points) as total,
                    COUNT(*) as count
                ')
                ->first();

            // Get badge count
            $totalBadges = DB::table('user_badges')
                ->where('user_id', $userId)
                ->count();

            // Get teacher project IDs for submissions
            $teacherProjectIds = DB::table('projects')
                ->where('teacher_id', $teacherId)
                ->where('status', 'approved')
                ->pluck('id')
                ->toArray();

            $submissionStats = [];
            if (!empty($teacherProjectIds)) {
                $submissionStats = DB::table('project_submissions')
                    ->whereIn('project_id', $teacherProjectIds)
                    ->selectRaw('
                        COUNT(*) as total,
                        SUM(CASE WHEN status = "submitted" THEN 1 ELSE 0 END) as submitted,
                        SUM(CASE WHEN status = "reviewed" THEN 1 ELSE 0 END) as reviewed,
                        SUM(CASE WHEN status = "approved" THEN 1 ELSE 0 END) as approved,
                        SUM(CASE WHEN status = "rejected" THEN 1 ELSE 0 END) as rejected
                    ')
                    ->first();
            }

            return [
                'projects' => [
                    'total' => (int) ($projectStats->total ?? 0),
                    'approved' => (int) ($projectStats->approved ?? 0),
                    'pending' => (int) ($projectStats->pending ?? 0),
                    'rejected' => (int) ($projectStats->rejected ?? 0),
                    'totalViews' => (int) ($projectStats->total_views ?? 0),
                    'totalLikes' => (int) ($projectStats->total_likes ?? 0),
                    'totalPoints' => (int) ($projectStats->total_points ?? 0),
                ],
                'publications' => [
                    'total' => (int) ($publicationStats->total ?? 0),
                    'approved' => (int) ($publicationStats->approved ?? 0),
                    'pending' => (int) ($publicationStats->pending ?? 0),
                    'rejected' => (int) ($publicationStats->rejected ?? 0),
                    'totalViews' => (int) ($publicationStats->total_views ?? 0),
                    'totalLikes' => (int) ($publicationStats->total_likes ?? 0),
                ],
                'challenges' => [
                    'created' => (int) ($challengeStats->created ?? 0),
                    'active' => (int) ($challengeStats->active ?? 0),
                    'completed' => (int) ($challengeStats->completed ?? 0),
                ],
                'points' => [
                    'total' => (int) ($pointsStats->total ?? 0),
                    'count' => (int) ($pointsStats->count ?? 0),
                ],
                'badges' => [
                    'total' => $totalBadges,
                ],
                'submissions' => [
                    'total' => (int) ($submissionStats->total ?? 0),
                    'submitted' => (int) ($submissionStats->submitted ?? 0),
                    'reviewed' => (int) ($submissionStats->reviewed ?? 0),
                    'approved' => (int) ($submissionStats->approved ?? 0),
                    'rejected' => (int) ($submissionStats->rejected ?? 0),
                ],
            ];
        }, 300); // Cache for 5 minutes
    }

    public function clearDashboardCache(int $userId, ?string $role = null): void
    {
        if ($role === 'school') {
            $this->forgetCacheTags(["school_dashboard_{$userId}"]);
        } elseif ($role === 'student') {
            $this->forgetCacheTags(["student_dashboard_{$userId}"]);
        } elseif ($role === 'admin') {
            $this->forgetCache('admin_dashboard_stats');
        } elseif ($role === 'teacher') {
            $teacher = \App\Models\Teacher::where('user_id', $userId)->first();
            if ($teacher) {
                $this->forgetCacheTags(["teacher_dashboard_{$teacher->id}"]);
            }
        }
    }
}

