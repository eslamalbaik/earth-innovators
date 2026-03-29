<?php

namespace App\Services;

use App\Models\ChallengeSubmission;
use App\Models\Project;
use App\Models\UserBadge;
use Illuminate\Support\Collection;

class ActivityService extends BaseService
{
    public function getStudentActivities(int $userId, int $limit = 5): Collection
    {
        $cacheKey = "student_activities_v2_{$userId}_{$limit}";
        $cacheTag = "student_activities_{$userId}";

        return $this->cacheTags($cacheTag, $cacheKey, function () use ($userId, $limit) {
            $projectActivities = Project::where('user_id', $userId)
                ->select('id', 'title', 'status', 'created_at')
                ->latest()
                ->limit($limit)
                ->get()
                ->map(function ($project) {
                    $kind = match ($project->status) {
                        'approved' => 'project_approved',
                        'rejected' => 'project_rejected',
                        default => 'project_pending',
                    };

                    return [
                        'kind' => $kind,
                        'title' => $project->title,
                        'occurred_at' => $project->created_at->toIso8601String(),
                        'color' => match ($project->status) {
                            'approved' => 'green',
                            'rejected' => 'red',
                            default => 'blue',
                        },
                    ];
                });

            $badgeActivities = UserBadge::where('user_id', $userId)
                ->with('badge:id,name,name_ar')
                ->select('id', 'badge_id', 'earned_at', 'created_at')
                ->latest()
                ->limit($limit)
                ->get()
                ->map(function ($userBadge) {
                    $date = $userBadge->earned_at ?? $userBadge->created_at;

                    return [
                        'kind' => 'badge_earned',
                        'title' => $userBadge->badge->name_ar ?? $userBadge->badge->name ?? '—',
                        'occurred_at' => $date->toIso8601String(),
                        'color' => 'yellow',
                    ];
                });

            $challengeActivities = ChallengeSubmission::where('student_id', $userId)
                ->with('challenge:id,title')
                ->latest()
                ->limit($limit)
                ->get()
                ->map(function ($submission) {
                    $date = $submission->submitted_at ?? $submission->created_at;

                    return [
                        'kind' => 'challenge_submission',
                        'title' => $submission->challenge?->title ?? '—',
                        'occurred_at' => $date->toIso8601String(),
                        'color' => 'purple',
                    ];
                });

            return $projectActivities
                ->concat($badgeActivities)
                ->concat($challengeActivities)
                ->sortByDesc(fn ($row) => $row['occurred_at'])
                ->take($limit)
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

    public function clearActivityCache(int $userId): void
    {
        $this->forgetCacheTags([
            "student_activities_{$userId}",
            "student_badges_{$userId}",
        ]);
    }
}

