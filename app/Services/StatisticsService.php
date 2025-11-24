<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\Payment;
use App\Models\Project;
use App\Models\Point;
use App\Models\Subject;
use App\Models\Teacher;
use App\Models\User;
use App\Models\UserBadge;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Cache;

class StatisticsService extends BaseService
{
    public function getAdminStatistics(?string $dateFrom = null, ?string $dateTo = null): array
    {
        $dateFrom = $dateFrom ?? now()->startOfMonth()->toDateString();
        $dateTo = $dateTo ?? now()->endOfMonth()->toDateString();
        
        $cacheKey = "admin_stats_" . md5($dateFrom . $dateTo);
        $cacheTag = 'admin_statistics';

        return $this->cacheTags($cacheTag, $cacheKey, function () use ($dateFrom, $dateTo) {
            $totalRevenue = (float) Payment::where('status', 'completed')->sum('amount');
            if ($totalRevenue == 0 && Schema::hasTable('bookings')) {
                if (Schema::hasColumn('bookings', 'total_price')) {
                    $bookingQuery = Booking::query();
                    if (Schema::hasColumn('bookings', 'payment_status')) {
                        $totalRevenue = (float) $bookingQuery->where('payment_status', 'paid')->sum('total_price');
                    } elseif (Schema::hasColumn('bookings', 'payment_received')) {
                        $totalRevenue = (float) $bookingQuery->where('payment_received', true)->sum('total_price');
                    }
                } elseif (Schema::hasColumn('bookings', 'price')) {
                    $bookingQuery = Booking::query();
                    if (Schema::hasColumn('bookings', 'payment_status')) {
                        $totalRevenue = (float) $bookingQuery->where('payment_status', 'paid')->sum('price');
                    } elseif (Schema::hasColumn('bookings', 'payment_received')) {
                        $totalRevenue = (float) $bookingQuery->where('payment_received', true)->sum('price');
                    }
                }
            }

            $stats = [
                'totalTeachers' => Teacher::count(),
                'totalBookings' => Booking::count(),
                'totalRevenue' => $totalRevenue,
                'avgRating' => (float) Teacher::avg('rating'),
                'activeStudents' => User::where('role', 'student')->count(),
                'pendingBookings' => Booking::where('status', 'pending')->count(),
            ];

            $connection = DB::getDriverName();
            $monthly = $this->getMonthlyRevenue($connection, $dateFrom, $dateTo);
            $subjectsDistribution = $this->getSubjectsDistribution($stats['totalTeachers']);
            $topTeachers = $this->getTopTeachers();

            return [
                'stats' => $stats,
                'monthly' => $monthly,
                'subjectsDistribution' => $subjectsDistribution,
                'topTeachers' => $topTeachers,
            ];
        }, 600); // Cache for 10 minutes
    }

    public function getSchoolStatistics(int $schoolId): array
    {
        $cacheKey = "school_stats_{$schoolId}";
        $cacheTag = "school_statistics_{$schoolId}";

        return $this->cacheTags($cacheTag, $cacheKey, function () use ($schoolId) {
            $students = User::where('school_id', $schoolId)
                ->where('role', 'student')
                ->pluck('id');
            
            $projectsByStatus = Project::whereIn('user_id', $students)
                ->select('status', DB::raw('COUNT(*) as count'))
                ->groupBy('status')
                ->pluck('count', 'status')
                ->toArray();
            
            $projectsByCategory = Project::whereIn('user_id', $students)
                ->where('status', 'approved')
                ->select('category', DB::raw('COUNT(*) as count'))
                ->groupBy('category')
                ->pluck('count', 'category')
                ->toArray();
            
            $pointsByMonth = Point::whereIn('user_id', $students)
                ->where('type', 'earned')
                ->select(DB::raw('DATE_FORMAT(created_at, "%Y-%m") as month'), DB::raw('SUM(points) as total'))
                ->groupBy('month')
                ->orderBy('month', 'desc')
                ->limit(12)
                ->pluck('total', 'month')
                ->toArray();
            
            $topStudents = User::whereIn('id', $students)
                ->select('id', 'name', 'points')
                ->orderBy('points', 'desc')
                ->limit(10)
                ->get()
                ->map(function ($student) {
                    $projectsCount = Project::where('user_id', $student->id)
                        ->where('status', 'approved')
                        ->count();
                    return [
                        'id' => $student->id,
                        'name' => $student->name,
                        'points' => $student->points ?? 0,
                        'projects_count' => $projectsCount,
                    ];
                });
            
            $badgesStats = UserBadge::whereIn('user_id', $students)
                ->with('badge:id,name,image')
                ->get()
                ->groupBy('badge_id')
                ->map(function ($badges, $badgeId) {
                    return [
                        'badge' => $badges->first()->badge,
                        'count' => $badges->count(),
                        'students' => $badges->pluck('user_id')->unique()->count(),
                    ];
                })
                ->sortByDesc('count')
                ->values()
                ->take(10);

            return [
                'projectsByStatus' => $projectsByStatus,
                'projectsByCategory' => $projectsByCategory,
                'pointsByMonth' => $pointsByMonth,
                'topStudents' => $topStudents,
                'badgesStats' => $badgesStats,
            ];
        }, 600); // Cache for 10 minutes
    }

    private function getMonthlyRevenue(string $connection, string $dateFrom, string $dateTo)
    {
        if (Schema::hasTable('payments')) {
            if ($connection === 'sqlite') {
                return Payment::selectRaw("strftime('%Y-%m', created_at) as month, COUNT(*) as bookings, SUM(amount) as revenue")
                    ->where('status', 'completed')
                    ->whereBetween('created_at', [$dateFrom, $dateTo])
                    ->groupBy('month')
                    ->orderBy('month')
                    ->get();
            } else {
                return Payment::selectRaw('DATE_FORMAT(created_at, "%Y-%m") as month, COUNT(*) as bookings, SUM(amount) as revenue')
                    ->where('status', 'completed')
                    ->whereBetween('created_at', [$dateFrom, $dateTo])
                    ->groupBy('month')
                    ->orderBy('month')
                    ->get();
            }
        } else {
            $priceColumn = Schema::hasColumn('bookings', 'total_price') ? 'total_price' : (Schema::hasColumn('bookings', 'price') ? 'price' : null);

            if ($priceColumn) {
                if ($connection === 'sqlite') {
                    return Booking::selectRaw("strftime('%Y-%m', created_at) as month, COUNT(*) as bookings, SUM({$priceColumn}) as revenue")
                        ->whereBetween('created_at', [$dateFrom, $dateTo])
                        ->groupBy('month')
                        ->orderBy('month')
                        ->get();
                } else {
                    return Booking::selectRaw("DATE_FORMAT(created_at, '%Y-%m') as month, COUNT(*) as bookings, SUM({$priceColumn}) as revenue")
                        ->whereBetween('created_at', [$dateFrom, $dateTo])
                        ->groupBy('month')
                        ->orderBy('month')
                        ->get();
                }
            } else {
                if ($connection === 'sqlite') {
                    return Booking::selectRaw("strftime('%Y-%m', created_at) as month, COUNT(*) as bookings, 0 as revenue")
                        ->whereBetween('created_at', [$dateFrom, $dateTo])
                        ->groupBy('month')
                        ->orderBy('month')
                        ->get();
                } else {
                    return Booking::selectRaw("DATE_FORMAT(created_at, '%Y-%m') as month, COUNT(*) as bookings, 0 as revenue")
                        ->whereBetween('created_at', [$dateFrom, $dateTo])
                        ->groupBy('month')
                        ->orderBy('month')
                        ->get();
                }
            }
        }
    }

    private function getSubjectsDistribution(int $totalTeachers)
    {
        return Subject::where('is_active', true)
            ->select('id', 'name_ar', 'name_en')
            ->get()
            ->map(function ($subject) {
                $countFromPivot = $subject->teachers()
                    ->where('is_active', true)
                    ->where('is_verified', true)
                    ->count();
                
                $countFromJson = Teacher::where('is_active', true)
                    ->where('is_verified', true)
                    ->where(function ($query) use ($subject) {
                        $query->whereRaw('JSON_SEARCH(LOWER(JSON_EXTRACT(subjects, "$")), "one", LOWER(?), NULL, "$[*]") IS NOT NULL', [$subject->name_ar])
                            ->orWhereRaw('JSON_SEARCH(LOWER(JSON_EXTRACT(subjects, "$")), "one", LOWER(?), NULL, "$[*]") IS NOT NULL', [$subject->name_en ?? '']);
                    })
                    ->count();

                $teacherCount = max($countFromPivot, $countFromJson);

                return [
                    'name' => $subject->name_ar,
                    'teacher_count' => $teacherCount,
                ];
            })
            ->sortByDesc('teacher_count')
            ->take(3)
            ->values()
            ->map(function ($subject, $index) use ($totalTeachers) {
                $percentage = $totalTeachers > 0 ? round(($subject['teacher_count'] / $totalTeachers) * 100) : 0;
                
                return [
                    'name' => $subject['name'],
                    'teacher_count' => $subject['teacher_count'],
                    'percentage' => $percentage,
                ];
            });
    }

    private function getTopTeachers()
    {
        return Teacher::where('is_active', true)
            ->where('is_verified', true)
            ->with('user:id,name')
            ->select('id', 'user_id', 'name_ar', 'subjects')
            ->get()
            ->map(function ($teacher) {
                $rating = (float) $teacher->calculateRating();
                $bookingsCount = (int) $teacher->calculateSessionsCount();
                
                return [
                    'id' => $teacher->id,
                    'name' => $teacher->name_ar ?? $teacher->user->name ?? 'غير معروف',
                    'subject' => !empty($teacher->subjects) && is_array($teacher->subjects) 
                        ? $teacher->subjects[0] 
                        : 'غير محدد',
                    'rating' => $rating,
                    'bookings' => $bookingsCount,
                ];
            })
            ->filter(function ($teacher) {
                return $teacher['rating'] > 0 || $teacher['bookings'] > 0;
            })
            ->sort(function ($a, $b) {
                if ($a['rating'] != $b['rating']) {
                    return $b['rating'] <=> $a['rating'];
                }
                return $b['bookings'] <=> $a['bookings'];
            })
            ->take(3)
            ->values();
    }
}

