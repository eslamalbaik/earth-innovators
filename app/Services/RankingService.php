<?php

namespace App\Services;

use App\Models\User;
use App\Models\Badge;
use App\Models\UserBadge;
use App\Models\Project;
use Illuminate\Support\Facades\Cache;

class RankingService extends BaseService
{
    public function getSchoolRankings(?int $currentSchoolId = null): array
    {
        $cacheKey = "school_rankings_" . ($currentSchoolId ?? 'all');
        $cacheTag = 'school_rankings';

        return $this->cacheTags($cacheTag, $cacheKey, function () use ($currentSchoolId) {
            $schoolsRanking = User::where('role', 'school')
                ->select('id', 'name')
                ->get()
                ->map(function ($schoolData) use ($currentSchoolId) {
                    $students = User::where('school_id', $schoolData->id)
                        ->where('role', 'student')
                        ->pluck('id');
                    
                    $totalPoints = User::whereIn('id', $students)->sum('points') ?? 0;
                    $totalStudents = $students->count();
                    $projectsCount = Project::whereIn('user_id', $students)
                        ->where('status', 'approved')
                        ->count();
                    $totalBadges = UserBadge::whereIn('user_id', $students)->count();
                    
                    return [
                        'id' => $schoolData->id,
                        'name' => $schoolData->name,
                        'total_points' => $totalPoints,
                        'total_students' => $totalStudents,
                        'projects_count' => $projectsCount,
                        'total_badges' => $totalBadges,
                        'rank' => 0, // سيتم تحديثه لاحقاً
                        'is_current_school' => $currentSchoolId && $schoolData->id === $currentSchoolId,
                    ];
                })
                ->sortByDesc('total_points')
                ->values()
                ->map(function ($schoolData, $index) {
                    $schoolData['rank'] = $index + 1;
                    return $schoolData;
                });

            $currentSchoolRank = null;
            if ($currentSchoolId) {
                foreach ($schoolsRanking as $schoolData) {
                    if ($schoolData['is_current_school']) {
                        $currentSchoolRank = $schoolData;
                        break;
                    }
                }
            }

            return [
                'schoolsRanking' => $schoolsRanking,
                'currentSchoolRank' => $currentSchoolRank,
            ];
        }, 600); // Cache for 10 minutes
    }

    public function getSchoolBadges(int $schoolId): array
    {
        $cacheKey = "school_badges_{$schoolId}";
        $cacheTag = "school_badges_{$schoolId}";

        return $this->cacheTags($cacheTag, $cacheKey, function () use ($schoolId) {
            // الشارات المتاحة للمدارس
            $badges = Badge::where('is_active', true)
                ->where(function ($query) {
                    $query->where('type', 'custom')
                        ->orWhere('type', 'excellent_innovator');
                })
                ->select('id', 'name', 'description', 'image', 'points_required', 'type')
                ->orderBy('points_required')
                ->get();
            
            // الشارات المكتسبة من قبل طلاب المدرسة
            $students = User::where('school_id', $schoolId)
                ->where('role', 'student')
                ->pluck('id');
            
            $earnedBadges = UserBadge::whereIn('user_id', $students)
                ->with('badge:id,name,description,image')
                ->get()
                ->groupBy('badge_id')
                ->map(function ($badges) {
                    return [
                        'badge' => $badges->first()->badge,
                        'count' => $badges->count(),
                        'students' => $badges->pluck('user_id')->unique()->count(),
                    ];
                })
                ->values();

            return [
                'badges' => $badges,
                'earnedBadges' => $earnedBadges,
            ];
        }, 600); // Cache for 10 minutes
    }
}

