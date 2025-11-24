<?php

namespace App\Services;

use App\Models\Project;
use App\Models\UserBadge;
use App\Models\Challenge;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Collection;

class ActivityService extends BaseService
{
    public function getStudentActivities(int $userId, int $limit = 5): Collection
    {
        $cacheKey = "student_activities_{$userId}_{$limit}";
        $cacheTag = "student_activities_{$userId}";

        return $this->cacheTags($cacheTag, $cacheKey, function () use ($userId, $limit) {
            // Get project activities
            $projectActivities = Project::where('user_id', $userId)
                ->select('id', 'title', 'status', 'created_at')
                ->latest()
                ->limit($limit)
                ->get()
                ->map(function ($project) {
                    return [
                        'type' => 'project',
                        'action' => $project->status === 'approved' ? 'تم قبول مشروعك' : 'رفعت مشروع جديد',
                        'title' => $project->title,
                        'date' => $project->created_at,
                        'color' => $project->status === 'approved' ? 'green' : 'blue',
                    ];
                });

            // Get badge activities
            $badgeActivities = UserBadge::where('user_id', $userId)
                ->with('badge:id,name,name_ar')
                ->select('id', 'badge_id', 'earned_at', 'created_at')
                ->latest()
                ->limit($limit)
                ->get()
                ->map(function ($userBadge) {
                    return [
                        'type' => 'badge',
                        'action' => 'حصلت على شارة',
                        'title' => $userBadge->badge->name_ar ?? $userBadge->badge->name ?? 'N/A',
                        'date' => $userBadge->earned_at ?? $userBadge->created_at,
                        'color' => 'yellow',
                    ];
                });

            // Get challenge activities
            $challengeActivities = Challenge::where('created_by', $userId)
                ->orWhereHas('projects', function ($q) use ($userId) {
                    $q->where('user_id', $userId);
                })
                ->select('id', 'title', 'created_by', 'created_at')
                ->latest()
                ->limit($limit)
                ->get()
                ->map(function ($challenge) use ($userId) {
                    return [
                        'type' => 'challenge',
                        'action' => $challenge->created_by === $userId ? 'أنشأت تحدي' : 'شاركت في تحدي',
                        'title' => $challenge->title,
                        'date' => $challenge->created_at,
                        'color' => 'blue',
                    ];
                });

            // Merge and sort activities
            return $projectActivities
                ->concat($badgeActivities)
                ->concat($challengeActivities)
                ->sortByDesc('date')
                ->take($limit)
                ->map(function ($activity) {
                    $daysAgo = $activity['date']->diffInDays(now());
                    $timeAgo = $this->formatTimeAgo($daysAgo);

                    return [
                        'action' => $activity['action'],
                        'title' => $activity['title'],
                        'timeAgo' => $timeAgo,
                        'color' => $activity['color'],
                    ];
                })
                ->values();
        }, 300); // Cache for 5 minutes
    }

    public function getRecentBadges(int $userId, int $limit = 3): Collection
    {
        $cacheKey = "recent_badges_{$userId}_{$limit}";
        $cacheTag = "student_badges_{$userId}";

        return $this->cacheTags($cacheTag, $cacheKey, function () use ($userId, $limit) {
            return UserBadge::where('user_id', $userId)
                ->with('badge:id,name,name_ar,icon,image')
                ->select('id', 'badge_id', 'earned_at')
                ->latest()
                ->limit($limit)
                ->get()
                ->map(function ($userBadge) {
                    return [
                        'id' => $userBadge->id,
                        'name' => $userBadge->badge->name_ar ?? $userBadge->badge->name ?? 'N/A',
                        'icon' => $userBadge->badge->icon ?? null,
                        'image' => $userBadge->badge->image ?? null,
                        'earned_at' => $userBadge->earned_at?->format('Y-m-d'),
                    ];
                });
        }, 300); // Cache for 5 minutes
    }

    private function formatTimeAgo(int $daysAgo): string
    {
        if ($daysAgo === 0) {
            return 'اليوم';
        } elseif ($daysAgo === 1) {
            return 'منذ يوم';
        } elseif ($daysAgo < 7) {
            return "منذ {$daysAgo} أيام";
        } elseif ($daysAgo < 14) {
            return 'منذ أسبوع';
        } elseif ($daysAgo < 30) {
            $weeks = floor($daysAgo / 7);
            return "منذ {$weeks} " . ($weeks === 1 ? 'أسبوع' : 'أسابيع');
        } else {
            return 'منذ شهر';
        }
    }

    public function clearActivityCache(int $userId): void
    {
        $this->forgetCacheTags([
            "student_activities_{$userId}",
            "student_badges_{$userId}",
        ]);
    }
}

