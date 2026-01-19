<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\Publication;
use App\Models\User;
use App\Models\UserPackage;
use App\Models\Payment;
use App\Models\Package;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class AdminDashboardController extends Controller
{
    public function __construct(
        private NotificationService $notificationService
    ) {}

    public function index(Request $request)
    {
        $user = Auth::user();
        $kpis = $this->getKPIs();
        $usersByRole = $this->getUsersByRole();
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
                    'student_name' => $project->user->name ?? 'غير معروف',
                    'school_name' => $project->school->name ?? 'غير محدد',
                    'teacher_name' => $project->teacher->name_ar ?? 'غير محدد',
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
                    'user_name' => $payment->student->name ?? 'غير معروف',
                    'amount' => $payment->amount,
                    'currency' => $payment->currency ?? 'AED',
                    'payment_method' => $payment->payment_method ?? 'غير محدد',
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
                    'user_name' => $subscription->user->name ?? 'غير معروف',
                    'user_role' => $subscription->user->role ?? 'غير محدد',
                    'package_name' => $subscription->package->name_ar ?? 'غير محدد',
                    'status' => $subscription->status,
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
            'active_subscriptions' => UserPackage::where('status', 'active')->count(),
            'expired_subscriptions' => UserPackage::where('status', 'expired')->count(),
            'subscription_revenue' => UserPackage::where('status', 'active')->sum('paid_amount'),
        ];

        $selectedYear = $request->get('year', date('Y'));
        $chartData = $this->getChartData($selectedYear);
        $availableYears = $this->getAvailableYears();
        $engagementData = $this->getStudentEngagementData();
        $notifications = $this->notificationService->getUserNotifications($user->id, 10);
        $unreadCount = $this->notificationService->getUnreadCount($user->id);

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
            'selectedYear' => (int)$selectedYear,
            'availableYears' => $availableYears,
            'engagementData' => $engagementData,
            'notifications' => $notifications,
            'unread_count' => $unreadCount,
        ]);
    }

    private function getKPIs(): array
    {
        return [
            'total_projects' => Project::count(),
            'published_projects' => Project::where('status', 'approved')->count(),
            'pending_projects' => Project::where('status', 'pending')->count(),
            'total_users' => User::where('role', '!=', 'admin')->count(),
            'total_schools' => User::where('role', 'school')->count(),
            'total_students' => User::where('role', 'student')->count(),
            'total_teachers' => User::where('role', 'teacher')->count(),
            'total_publications' => Publication::count(),
            'approved_publications' => Publication::where('status', 'approved')->count(),
            'total_subscriptions' => UserPackage::count(),
            'active_subscriptions' => UserPackage::where('status', 'active')->count(),
            'total_revenue' => Payment::where('status', 'completed')->sum('amount'),
            'subscription_revenue' => UserPackage::where('status', 'active')->sum('paid_amount'),
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

    private function getAvailableYears(): array
    {
        $userYears = User::where('role', '!=', 'admin')
            ->selectRaw('YEAR(created_at) as year')
            ->distinct()
            ->pluck('year')
            ->toArray();

        $projectYears = Project::selectRaw('YEAR(created_at) as year')
            ->distinct()
            ->pluck('year')
            ->toArray();

        $years = array_unique(array_merge($userYears, $projectYears));
        rsort($years);

        if (empty($years)) {
            $currentYear = (int)date('Y');
            return range($currentYear, $currentYear - 3);
        }

        $currentYear = (int)date('Y');
        if (!in_array($currentYear, $years)) {
            array_unshift($years, $currentYear);
        }

        return $years;
    }

    /**
     * Get chart data for platform activity (users and projects per month)
     * 
     * @param int $year
     * @return array
     */
    private function getChartData(int $year = null): array
    {
        if ($year === null) {
            $year = (int)date('Y');
        }
        $months = [
            'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
            'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
        ];

        $usersData = [];
        $projectsData = [];

        for ($month = 1; $month <= 12; $month++) {
            $startDate = \Carbon\Carbon::create($year, $month, 1)->startOfMonth();
            $endDate = \Carbon\Carbon::create($year, $month, 1)->endOfMonth();

            $usersCount = User::where('role', '!=', 'admin')
                ->whereBetween('created_at', [$startDate, $endDate])
                ->count();

            $projectsCount = Project::whereBetween('created_at', [$startDate, $endDate])
                ->count();

            $usersData[] = $usersCount;
            $projectsData[] = $projectsCount;
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

    /**
     * Get chart data via API endpoint for AJAX requests
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getChartDataApi(Request $request)
    {
        try {
            $year = $request->get('year', date('Y'));
            $year = (int)$year;
            
            if ($year < 2000 || $year > 2100) {
                return response()->json([
                    'error' => 'Invalid year. Year must be between 2000 and 2100.',
                ], 400);
            }
            
            $chartData = $this->getChartData($year);
            
            return response()->json($chartData);
        } catch (\Exception $e) {
            \Log::error('Error fetching chart data: ' . $e->getMessage());
            return response()->json([
                'error' => 'An error occurred while fetching chart data.',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Format user image URL with proper path handling
     * 
     * @param string|null $imagePath
     * @return string|null
     */
    private function formatUserImageUrl(?string $imagePath): ?string
    {
        if (!$imagePath) {
            return null;
        }

        if (strpos($imagePath, 'http://') === 0 || strpos($imagePath, 'https://') === 0) {
            return $imagePath;
        }

        if (strpos($imagePath, '/storage/') === 0) {
            return $imagePath;
        }

        return '/storage/' . $imagePath;
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
                }
            ])
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
                $projectStats = DB::table('projects')
                    ->where('user_id', $student->id)
                    ->where('status', 'approved')
                    ->selectRaw('SUM(views) as total_views, SUM(likes) as total_likes')
                    ->first();
                
                $totalViews = $projectStats->total_views ?? 0;
                $totalLikes = $projectStats->total_likes ?? 0;
                
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
                    'project' => $latestProject ? "مشروع {$latestProject->id} أوسمة" : ($totalBadges > 0 ? "مشروع {$totalBadges} أوسمة" : 'لا يوجد مشاريع'),
                    'projectEn' => $latestProject ? "Project {$latestProject->id} badges" : ($totalBadges > 0 ? "Project {$totalBadges} badges" : 'No projects'),
                    'date' => $latestProject && $latestProject->approved_at 
                        ? 'منشور في ' . $latestProject->approved_at->format('d | n | Y')
                        : ($student->created_at ? 'منشور في ' . $student->created_at->format('d | n | Y') : 'لا يوجد منشورات'),
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

        $monthlyData = [];
        $months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو'];
        
        for ($i = 5; $i >= 0; $i--) {
            $date = now()->subMonths($i);
            $startDate = $date->copy()->startOfMonth();
            $endDate = $date->copy()->endOfMonth();
            $students = User::where('role', 'student')->get();
            
            if ($students->isEmpty()) {
                $monthlyData[] = [
                    'month' => $months[5 - $i],
                    'value' => 0
                ];
                continue;
            }
            
            $engagementScores = [];
            foreach ($students as $student) {
                $approvedProjects = Project::where('user_id', $student->id)
                    ->where('status', 'approved')
                    ->whereBetween('approved_at', [$startDate, $endDate])
                    ->count();
                
                $badges = DB::table('user_badges')
                    ->where('user_id', $student->id)
                    ->whereBetween('created_at', [$startDate, $endDate])
                    ->count();
                
                $points = $student->points ?? 0;
                
                $projectStats = DB::table('projects')
                    ->where('user_id', $student->id)
                    ->where('status', 'approved')
                    ->whereBetween('approved_at', [$startDate, $endDate])
                    ->selectRaw('COALESCE(SUM(views), 0) as total_views, COALESCE(SUM(likes), 0) as total_likes')
                    ->first();
                
                $totalViews = $projectStats->total_views ?? 0;
                $totalLikes = $projectStats->total_likes ?? 0;
                
                $projectScore = min(100, ($approvedProjects / 5) * 100);
                $badgeScore = min(100, ($badges / 10) * 100);
                $pointScore = min(100, ($points / 500) * 100);
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
                'value' => round($monthlyEngagement)
            ];
        }

        $currentMonthValue = $monthlyData[count($monthlyData) - 1]['value'] ?? 0;
        $previousMonthValue = count($monthlyData) > 1 ? $monthlyData[count($monthlyData) - 2]['value'] : 0;
        
        $trendPercentage = 0;
        if ($previousMonthValue > 0) {
            $trendPercentage = round((($currentMonthValue - $previousMonthValue) / $previousMonthValue) * 100);
        } else if ($currentMonthValue > 0) {
            $trendPercentage = 100; // New data
        }

        return [
            'listItems' => $topStudents->toArray(),
            'chartData' => $monthlyData,
            'trendPercentage' => $trendPercentage > 0 ? "+{$trendPercentage}%" : "{$trendPercentage}%",
        ];
    }
}

