<?php

namespace App\Services;

use App\Models\Badge;
use App\Models\UserBadge;
use App\Repositories\BadgeRepository;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Collection as SupportCollection;
use Illuminate\Support\Facades\URL;

class BadgeService extends BaseService
{
    public function __construct(
        private BadgeRepository $badgeRepository
    ) {}

    private function formatBadgeImageUrl(?string $path): ?string
    {
        if (!$path) {
            return null;
        }

        // If it's already a full URL, return as is
        if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) {
            return $path;
        }

        // If it starts with /storage/ or /images/, return as is
        if (str_starts_with($path, '/storage/') || str_starts_with($path, '/images/')) {
            return $path;
        }

        // If it starts with storage/, add leading slash
        if (str_starts_with($path, 'storage/')) {
            return '/' . $path;
        }

        // Otherwise, assume it's a storage path and add /storage/
        return '/storage/' . $path;
    }

    public function getAllBadges(?string $search = null, int $perPage = 20): LengthAwarePaginator
    {
        $cacheKey = "all_badges_" . md5($search ?? '') . "_{$perPage}";
        $cacheTag = 'badges';

        return $this->cacheTags($cacheTag, $cacheKey, function () use ($search, $perPage) {
            $query = Badge::query();

            if ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('name_ar', 'like', "%{$search}%")
                      ->orWhere('description', 'like', "%{$search}%")
                      ->orWhere('description_ar', 'like', "%{$search}%");
                });
            }

            $badges = $query->orderBy('created_at', 'desc')
                ->select('id', 'name', 'name_ar', 'description', 'description_ar', 'icon', 'image', 'type', 'points_required', 'is_active', 'status', 'created_at')
                ->paginate($perPage);

            // Format image and icon URLs
            $badges->getCollection()->transform(function ($badge) {
                $badge->icon = $this->formatBadgeImageUrl($badge->icon);
                $badge->image = $this->formatBadgeImageUrl($badge->image);
                return $badge;
            });

            return $badges;
        }, 300); // Cache for 5 minutes
    }

    public function getActiveBadges(): Collection
    {
        $cacheKey = 'active_badges';
        $cacheTag = 'badges';

        return $this->cacheTags($cacheTag, $cacheKey, function () {
            $badges = Badge::where('is_active', true)
                ->select('id', 'name', 'name_ar', 'description', 'description_ar', 'icon', 'image', 'type', 'points_required')
                ->orderBy('points_required')
                ->get();

            // Format image and icon URLs
            return $badges->map(function ($badge) {
                $badge->icon = $this->formatBadgeImageUrl($badge->icon);
                $badge->image = $this->formatBadgeImageUrl($badge->image);
                return $badge;
            });
        }, 3600); // Cache for 1 hour
    }

    public function getBadgeStats(): array
    {
        $cacheKey = 'badge_stats';
        $cacheTag = 'badges';

        return $this->cacheTags($cacheTag, $cacheKey, function () {
            return [
                'total' => Badge::count(),
                'active' => Badge::where('is_active', true)->count(),
                'totalAwarded' => UserBadge::count(),
            ];
        }, 300); // Cache for 5 minutes
    }

    public function createBadge(array $data): Badge
    {
        // Handle image upload
        if (isset($data['image']) && is_file($data['image'])) {
            $data['image'] = $data['image']->store('badges', 'public');
        }

        $badge = Badge::create($data);

        // Clear cache
        $this->forgetCacheTags(['badges']);

        return $badge;
    }

    public function updateBadge(Badge $badge, array $data): Badge
    {
        // Handle image upload
        if (isset($data['image']) && is_file($data['image'])) {
            // Delete old image
            if ($badge->image) {
                Storage::disk('public')->delete($badge->image);
            }
            $data['image'] = $data['image']->store('badges', 'public');
        }

        $badge->update($data);

        // Clear cache
        $this->forgetCacheTags(['badges']);

        return $badge->fresh();
    }

    public function deleteBadge(Badge $badge): bool
    {
        // Delete image if exists
        if ($badge->image) {
            Storage::disk('public')->delete($badge->image);
        }

        $deleted = $badge->delete();

        // Clear cache
        $this->forgetCacheTags(['badges']);

        return $deleted;
    }

    public function awardBadge(int $userId, int $badgeId, ?int $projectId = null, ?int $challengeId = null, ?string $reason = null, ?int $awardedBy = null): UserBadge
    {
        $wasCreated = !UserBadge::where('user_id', $userId)
            ->where('badge_id', $badgeId)
            ->exists();

        $awardedById = $awardedBy ?? (Auth::check() ? Auth::id() : null);

        $userBadge = UserBadge::updateOrCreate(
            [
                'user_id' => $userId,
                'badge_id' => $badgeId,
            ],
            [
                'awarded_by' => $awardedById,
                'project_id' => $projectId,
                'challenge_id' => $challengeId,
                'reason' => $reason,
                'earned_at' => now(),
            ]
        );

        // إرسال إشعار للطالب عند منح الشارة (فقط إذا كانت جديدة)
        if ($wasCreated) {
            $student = \App\Models\User::find($userId);
            $badge = Badge::find($badgeId);
            $awardedByUser = \App\Models\User::find($awardedById);

            if ($student && $badge && $awardedByUser) {
                \App\Jobs\SendBadgeAwardedNotification::dispatch($student, $badge, $awardedByUser);
            }
        }

        // Clear user-related caches
        $this->forgetCacheTags([
            "student_badges_{$userId}",
            "student_activities_{$userId}",
            "student_dashboard_{$userId}",
        ]);

        return $userBadge;
    }

    public function getUserBadges(int $userId): SupportCollection
    {
        $cacheKey = "user_badges_{$userId}";
        $cacheTag = "student_badges_{$userId}";

        return $this->cacheTags($cacheTag, $cacheKey, function () use ($userId) {
            return UserBadge::where('user_id', $userId)
                ->with('badge:id,name,name_ar,icon,image')
                ->select('id', 'badge_id', 'earned_at')
                ->get()
                ->map(function ($userBadge) {
                    // Format badge icon and image URLs
                    if ($userBadge->badge) {
                        $userBadge->badge->icon = $this->formatBadgeImageUrl($userBadge->badge->icon);
                        $userBadge->badge->image = $this->formatBadgeImageUrl($userBadge->badge->image);
                    }

                    return [
                        'id' => $userBadge->id,
                        'badge_id' => $userBadge->badge_id,
                        'earned_at' => $userBadge->earned_at?->format('Y-m-d'),
                        'badge' => $userBadge->badge ? [
                            'id' => $userBadge->badge->id,
                            'name' => $userBadge->badge->name,
                            'name_ar' => $userBadge->badge->name_ar,
                            'icon' => $userBadge->badge->icon,
                            'image' => $userBadge->badge->image,
                        ] : null,
                    ];
                });
        }, 300); // Cache for 5 minutes
    }

    public function userHasBadge(int $userId, int $badgeId): bool
    {
        return UserBadge::where('user_id', $userId)
            ->where('badge_id', $badgeId)
            ->exists();
    }
}

