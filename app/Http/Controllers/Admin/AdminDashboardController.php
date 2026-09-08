<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Certificate;
use App\Models\ChallengeSuggestion;
use App\Models\Payment;
use App\Models\Project;
use App\Models\Publication;
use App\Models\StoreRewardRequest;
use App\Models\User;
use App\Models\UserPackage;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;

class AdminDashboardController extends Controller
{
    public function __construct(
        private NotificationService $notificationService
    ) {}

    public function index(Request $request)
    {
        $user = Auth::user();
        $usersByRole = $this->getUsersByRole();
        $kpis = $this->getKPIs($usersByRole);

        $publishedProjects = Project::with(['user:id,name,email', 'school:id,name', 'teacher:id,name_ar'])
            ->where('status', 'approved')
            ->select('id', 'title', 'user_id', 'school_id', 'teacher_id', 'status', 'views', 'likes', 'created_at', 'approved_at')
            ->latest('approved_at')
            ->limit(10)
            ->get()
            ->map(function ($project) {
                return [
                    'id' => $project->id,
                    'title' => $project->title,
                    'student_name' => $project->user->name ?? 'Unknown',
                    'school_name' => $project->school->name ?? 'Unassigned',
                    'teacher_name' => $project->teacher->name_ar ?? 'Unassigned',
                    'views' => $project->views ?? 0,
                    'likes' => $project->likes ?? 0,
                    'created_at' => $project->created_at->format('Y-m-d'),
                    'approved_at' => $project->approved_at?->format('Y-m-d'),
                ];
            });

        $recentPayments = Payment::with(['student:id,name,email'])
            ->where('status', 'completed')
            ->select('id', 'student_id', 'amount', 'currency', 'status', 'payment_method', 'created_at', 'paid_at')
            ->latest('paid_at')
            ->limit(10)
            ->get()
            ->map(function ($payment) {
                return [
                    'id' => $payment->id,
                    'user_name' => $payment->student->name ?? 'Unknown',
                    'amount' => $payment->amount,
                    'currency' => $payment->currency ?? 'AED',
                    'status' => $payment->status,
                    'payment_method' => $payment->payment_method ?? 'Unspecified',
                    'paid_at' => $payment->paid_at?->format('Y-m-d H:i') ?? $payment->created_at->format('Y-m-d H:i'),
                ];
            });

        $subscriptions = UserPackage::with(['user:id,name,email,role', 'package:id,name_ar,price'])
            ->select('id', 'user_id', 'package_id', 'status', 'start_date', 'end_date', 'paid_amount', 'created_at')
            ->latest()
            ->limit(10)
            ->get()
            ->map(function ($subscription) {
                return [
                    'id' => $subscription->id,
                    'user_name' => $subscription->user->name ?? 'Unknown',
                    'user_role' => $subscription->user->role ?? 'Unassigned',
                    'package_name' => $subscription->package->name_ar ?? 'Unassigned',
                    'status' => $subscription->effective_status,
                    'paid_amount' => $subscription->paid_amount,
                    'start_date' => $subscription->start_date->format('Y-m-d'),
                    'end_date' => $subscription->end_date->format('Y-m-d'),
                    'created_at' => $subscription->created_at->format('Y-m-d'),
                ];
            });

        $paymentStats = [
            'total_revenue' => Payment::where('status', 'completed')->sum('amount'),
            'pending_payments' => Payment::where('status', 'pending')->count(),
            'completed_payments' => Payment::where('status', 'completed')->count(),
            'failed_payments' => Payment::where('status', 'failed')->count(),
        ];

        $subscriptionStats = [
            'total_subscriptions' => UserPackage::count(),
            'active_subscriptions' => UserPackage::currentActive()->count(),
            'expired_subscriptions' => UserPackage::pastDue()->count(),
            'subscription_revenue' => UserPackage::currentActive()->sum('paid_amount'),
        ];

        $selectedYear = (int) $request->get('year', date('Y'));
        $chartData = $this->getChartData($selectedYear);
        $availableYears = $this->getAvailableYears();
        $engagementData = $this->getStudentEngagementData();
        $notifications = $this->notificationService->getUserNotifications($user->id, 10);
        $unreadCount = $this->notificationService->getUnreadCount($user->id);

        $workflow = [
            'pending_projects' => Project::where('status', 'pending')->count(),
            'pending_publications' => Publication::where('status', 'pending')->count(),
            'pending_certificates' => Certificate::whereIn('status', ['pending', 'pending_school_approval'])->count(),
            'pending_reward_requests' => Schema::hasTable('store_reward_requests')
                ? StoreRewardRequest::where('status', 'pending')->count()
                : 0,
            'pending_payments' => Payment::where('status', 'pending')->count(),
            'pending_challenge_suggestions' => Schema::hasTable('challenge_suggestions')
                ? ChallengeSuggestion::whereIn('status', ['pending', 'under_review'])->count()
                : 0,
        ];

        return Inertia::render('Admin/Dashboard', [
            'user' => $user,
            'kpis' => $kpis,
            'usersByRole' => $usersByRole,
            'publishedProjects' => $publishedProjects,
            'recentPayments' => $recentPayments,
            'subscriptions' => $subscriptions,
            'paymentStats' => $paymentStats,
            'subscriptionStats' => $subscriptionStats,
            'chartData' => $chartData,
            'selectedYear' => $selectedYear,
            'availableYears' => $availableYears,
            'engagementData' => $engagementData,
            'notifications' => $notifications,
            'unread_count' => $unreadCount,
            'workflow' => $workflow,
        ]);
    }

    private function getKPIs(?array $usersByRole = null): array
    {
        $usersByRole ??= $this->getUsersByRole();

        $projectStats = Project::selectRaw(
            "COUNT(*) as total, " .
            "SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved, " .
            "SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending"
        )->first();

        $publicationStats = Publication::selectRaw(
            "COUNT(*) as total, " .
            "SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved"
        )->first();

        $today = now()->toDateString();
        $subscriptionStats = UserPackage::selectRaw(
            "COUNT(*) as total, " .
            "SUM(CASE WHEN status = 'active' AND (end_date IS NULL OR end_date >= ?) THEN 1 ELSE 0 END) as active, " .
            "SUM(CASE WHEN status = 'active' AND (end_date IS NULL OR end_date >= ?) THEN paid_amount ELSE 0 END) as active_revenue",
            [$today, $today]
        )->first();

        return [
            'total_projects' => (int) $projectStats->total,
            'published_projects' => (int) $projectStats->approved,
            'pending_projects' => (int) $projectStats->pending,
            'total_users' => User::where('role', '!=', 'admin')->count(),
            'total_schools' => $usersByRole['schools'] ?? 0,
            'total_students' => $usersByRole['students'] ?? 0,
            'total_teachers' => $usersByRole['teachers'] ?? 0,
            'total_publications' => (int) $publicationStats->total,
            'approved_publications' => (int) $publicationStats->approved,
            'total_subscriptions' => (int) $subscriptionStats->total,
            'active_subscriptions' => (int) $subscriptionStats->active,
            'total_revenue' => Payment::where('status', 'completed')->sum('amount'),
            'subscription_revenue' => (float) $subscriptionStats->active_revenue,
        ];
    }

    private function getUsersByRole(): array
    {
        $users = User::select('role', DB::raw('COUNT(*) as count'))
            ->where('role', '!=', 'admin')
            ->groupBy('role')
            ->get()
            ->pluck('count', 'role')
            ->toArray();

        return [
            'schools' => $users['school'] ?? 0,
            'students' => $users['student'] ?? 0,
            'teachers' => $users['teacher'] ?? 0,
        ];
    }

    private function yearExpression(string $column = 'created_at'): string
    {
        return match (DB::connection()->getDriverName()) {
            'sqlite' => "CAST(strftime('%Y', {$column}) AS INTEGER) as year",
            'pgsql' => "EXTRACT(YEAR FROM {$column})::integer as year",
            default => "YEAR({$column}) as year",
        };
    }

    private function getAvailableYears(): array
    {
        $yearSql = $this->yearExpression('created_at');

        $userYears = User::where('role', '!=', 'admin')
            ->selectRaw($yearSql)
            ->distinct()
            ->pluck('year')
            ->toArray();

        $projectYears = Project::selectRaw($yearSql)
            ->distinct()
            ->pluck('year')
            ->toArray();

        $years = array_unique(array_merge($userYears, $projectYears));
        rsort($years);

        if (empty($years)) {
            $currentYear = (int) date('Y');
            return range($currentYear, $currentYear - 3);
        }

        $currentYear = (int) date('Y');
        if (!in_array($currentYear, $years)) {
            array_unshift($years, $currentYear);
        }

        return $years;
    }

    private function monthNumberExpression(string $column): string
    {
        return match (DB::connection()->getDriverName()) {
            'sqlite' => "CAST(strftime('%m', {$column}) AS INTEGER)",
            'pgsql' => "EXTRACT(MONTH FROM {$column})::integer",
            default => "MONTH({$column})",
        };
    }

    private function getChartData(int $year = null): array
    {
        if ($year === null) {
            $year = (int) date('Y');
        }

        $months = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December',
        ];

        $yearStart = \Carbon\Carbon::create($year, 1, 1)->startOfYear();
        $yearEnd = \Carbon\Carbon::create($year, 12, 31)->endOfYear();
        $monthExpr = $this->monthNumberExpression('created_at');

        $usersByMonth = User::where('role', '!=', 'admin')
            ->whereBetween('created_at', [$yearStart, $yearEnd])
            ->selectRaw("{$monthExpr} as m, COUNT(*) as c")
            ->groupBy('m')
            ->pluck('c', 'm');

        $projectsByMonth = Project::whereBetween('created_at', [$yearStart, $yearEnd])
            ->selectRaw("{$monthExpr} as m, COUNT(*) as c")
            ->groupBy('m')
            ->pluck('c', 'm');

        $usersData = [];
        $projectsData = [];

        for ($month = 1; $month <= 12; $month++) {
            $usersData[] = (int) ($usersByMonth[$month] ?? 0);
            $projectsData[] = (int) ($projectsByMonth[$month] ?? 0);
        }

        $totalUsers = array_sum($usersData);
        $totalProjects = array_sum($projectsData);

        if ($totalUsers == 0 && $totalProjects == 0) {
            $projectsData = [12, 18, 25, 35, 50, 65, 75, 85, 92, 96, 98, 100];
            $usersData = [22, 30, 45, 65, 85, 110, 125, 135, 142, 146, 148, 150];
        }

        return [
            'labels' => $months,
            'users' => $usersData,
            'projects' => $projectsData,
            'year' => $year,
        ];
    }

    public function getChartDataApi(Request $request)
    {
        try {
            $year = (int) $request->get('year', date('Y'));

            if ($year < 2000 || $year > 2100) {
                return response()->json([
                    'error' => 'Invalid year. Year must be between 2000 and 2100.',
                ], 400);
            }

            return response()->json($this->getChartData($year));
        } catch (\Exception $e) {
            \Log::error('Error fetching chart data: ' . $e->getMessage());
            return response()->json([
                'error' => 'An error occurred while fetching chart data.',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    private function formatUserImageUrl(?string $imagePath): ?string
    {
        return \App\Support\StorageUrl::url($imagePath);
    }

    private function monthKeyExpression(string $column): string
    {
        return match (DB::connection()->getDriverName()) {
            'sqlite' => "strftime('%Y-%m', {$column})",
            'pgsql' => "to_char({$column}, 'YYYY-MM')",
            default => "DATE_FORMAT({$column}, '%Y-%m')",
        };
    }

    private function getStudentEngagementData(): array
    {
        $topStudents = User::where('role', 'student')
            ->withCount([
                'projects as approved_projects_count' => function ($query) {
                    $query->where('status', 'approved');
                },
                'userBadges as badges_count',
                'challengeParticipations as challenges_participated' => function ($query) {
                    $query->where('status', 'completed');
                },
            ])
            ->withSum(['projects as total_views' => function ($query) {
                $query->where('status', 'approved');
            }], 'views')
            ->withSum(['projects as total_likes' => function ($query) {
                $query->where('status', 'approved');
            }], 'likes')
            ->with(['projects' => function ($query) {
                $query->where('status', 'approved')
                    ->select('id', 'user_id', 'title', 'views', 'likes', 'approved_at')
                    ->latest('approved_at')
                    ->limit(1);
            }])
            ->get()
            ->map(function ($student) {
                $approvedProjects = $student->approved_projects_count ?? 0;
                $badges = $student->badges_count ?? 0;
                $points = $student->points ?? 0;
                $challengesCompleted = $student->challenges_participated ?? 0;

                $totalViews = $student->total_views ?? 0;
                $totalLikes = $student->total_likes ?? 0;

                $projectScore = min(100, ($approvedProjects / 5) * 100);
                $badgeScore = min(100, ($badges / 10) * 100);
                $pointScore = min(100, ($points / 500) * 100);
                $viewScore = min(100, ($totalViews / 1000) * 100);
                $likeScore = min(100, ($totalLikes / 100) * 100);
                $challengeScore = min(100, ($challengesCompleted / 5) * 100);

                $engagementScore =
                    ($projectScore * 0.30) +
                    ($badgeScore * 0.25) +
                    ($pointScore * 0.20) +
                    ($viewScore * 0.15) +
                    ($likeScore * 0.10) +
                    ($challengeScore * 0.10);

                $latestProject = $student->projects->first();
                $totalBadges = $student->badges_count ?? 0;

                return [
                    'id' => $student->id,
                    'name' => $student->name,
                    'nameEn' => $student->name,
                    'activity' => max(0, min(100, round($engagementScore))),
                    'project' => $latestProject ? "Project {$latestProject->id} badges" : ($totalBadges > 0 ? "Project {$totalBadges} badges" : 'No projects'),
                    'projectEn' => $latestProject ? "Project {$latestProject->id} badges" : ($totalBadges > 0 ? "Project {$totalBadges} badges" : 'No projects'),
                    'date' => $latestProject && $latestProject->approved_at
                        ? 'Published on ' . $latestProject->approved_at->format('d | n | Y')
                        : ($student->created_at ? 'Published on ' . $student->created_at->format('d | n | Y') : 'No publications'),
                    'image' => $this->formatUserImageUrl($student->image),
                    'badge' => null,
                    'approved_projects' => $approvedProjects,
                    'badges_count' => $badges,
                    'points' => $points,
                ];
            })
            ->filter(function ($student) {
                return $student['activity'] > 0;
            })
            ->sortByDesc('activity')
            ->take(3)
            ->values()
            ->map(function ($student, $index) {
                $student['badge'] = $index + 1;
                return $student;
            });

        $months = ['January', 'February', 'March', 'April', 'May', 'June'];
        $windowStart = now()->subMonths(5)->startOfMonth();

        // Points aren't tracked historically per month in this schema, so
        // (as in the original logic) we use each student's current total.
        $studentPoints = User::where('role', 'student')->pluck('points', 'id');

        $monthExpr = $this->monthKeyExpression('approved_at');
        $projectsByMonth = Project::where('status', 'approved')
            ->where('approved_at', '>=', $windowStart)
            ->selectRaw("user_id, {$monthExpr} as ym, COUNT(*) as approved_count, COALESCE(SUM(views), 0) as total_views, COALESCE(SUM(likes), 0) as total_likes")
            ->groupBy('user_id', 'ym')
            ->get()
            ->groupBy('ym');

        $badgeMonthExpr = $this->monthKeyExpression('created_at');
        $badgesByMonth = DB::table('user_badges')
            ->where('created_at', '>=', $windowStart)
            ->selectRaw("user_id, {$badgeMonthExpr} as ym, COUNT(*) as badges_count")
            ->groupBy('user_id', 'ym')
            ->get()
            ->groupBy('ym');

        $monthlyData = [];

        for ($i = 5; $i >= 0; $i--) {
            $date = now()->subMonths($i);
            $ym = $date->format('Y-m');

            if ($studentPoints->isEmpty()) {
                $monthlyData[] = ['month' => $months[5 - $i], 'value' => 0];
                continue;
            }

            $monthProjects = ($projectsByMonth->get($ym) ?? collect())->keyBy('user_id');
            $monthBadges = ($badgesByMonth->get($ym) ?? collect())->keyBy('user_id');

            $engagementScores = [];
            foreach ($studentPoints as $studentId => $points) {
                $projectRow = $monthProjects->get($studentId);
                $approvedProjects = $projectRow->approved_count ?? 0;
                $totalViews = $projectRow->total_views ?? 0;
                $totalLikes = $projectRow->total_likes ?? 0;
                $badges = $monthBadges->get($studentId)->badges_count ?? 0;

                $projectScore = min(100, ($approvedProjects / 5) * 100);
                $badgeScore = min(100, ($badges / 10) * 100);
                $pointScore = min(100, (($points ?? 0) / 500) * 100);
                $viewScore = min(100, ($totalViews / 1000) * 100);
                $likeScore = min(100, ($totalLikes / 100) * 100);

                $score =
                    ($projectScore * 0.30) +
                    ($badgeScore * 0.25) +
                    ($pointScore * 0.20) +
                    ($viewScore * 0.15) +
                    ($likeScore * 0.10);

                if ($score > 0) {
                    $engagementScores[] = $score;
                }
            }

            $monthlyEngagement = !empty($engagementScores)
                ? array_sum($engagementScores) / count($engagementScores)
                : 0;

            $monthlyData[] = [
                'month' => $months[5 - $i],
                'value' => round($monthlyEngagement),
            ];
        }

        $currentMonthValue = $monthlyData[count($monthlyData) - 1]['value'] ?? 0;
        $previousMonthValue = count($monthlyData) > 1 ? $monthlyData[count($monthlyData) - 2]['value'] : 0;

        $trendPercentage = 0;
        if ($previousMonthValue > 0) {
            $trendPercentage = round((($currentMonthValue - $previousMonthValue) / $previousMonthValue) * 100);
        } elseif ($currentMonthValue > 0) {
            $trendPercentage = 100;
        }

        return [
            'listItems' => $topStudents->toArray(),
            'chartData' => $monthlyData,
            'trendPercentage' => $trendPercentage > 0 ? "+{$trendPercentage}%" : "{$trendPercentage}%",
        ];
    }
}
