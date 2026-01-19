<?php

namespace App\Services;

use App\Models\Badge;
use App\Models\User;
use App\Models\UserBadge;
use App\Models\UserCommunityBadge;
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

    private function isEmojiOrText(?string $value): bool
    {
        if (!$value) {
            return false;
        }

        // Remove /storage/ prefix if it was incorrectly added to emoji
        $cleanValue = preg_replace('#^/storage/#', '', $value);

        // Check if it's an emoji (contains Unicode emoji characters)
        if (preg_match('/[\x{1F300}-\x{1F9FF}]|[\x{2600}-\x{26FF}]|[\x{2700}-\x{27BF}]/u', $cleanValue)) {
            return true;
        }

        // Check if it doesn't look like a file path (no extension, no slashes)
        if (!preg_match('/\.(jpg|jpeg|png|gif|svg|webp|ico)$/i', $cleanValue) &&
            !str_contains($cleanValue, '/') &&
            !str_contains($cleanValue, '\\')) {
            // If it's short text (less than 50 chars) and doesn't look like a path, treat as text
            if (strlen($cleanValue) < 50) {
                return true;
            }
        }

        return false;
    }

    private function formatBadgeImageUrl(?string $path): ?string
    {
        if (!$path) {
            return null;
        }

        // Don't format if it's an emoji or text
        if ($this->isEmojiOrText($path)) {
            return $path;
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

    public function getAllBadges(?string $search = null, int $perPage = 20, ?string $status = null, ?string $type = null): LengthAwarePaginator
    {
        $cacheKey = "all_badges_" . md5($search ?? '') . "_" . md5($status ?? '') . "_" . md5($type ?? '') . "_{$perPage}";
        $cacheTag = 'badges';

        return $this->cacheTags($cacheTag, $cacheKey, function () use ($search, $perPage, $status, $type) {
            $query = Badge::query();

            if ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('name_ar', 'like', "%{$search}%")
                      ->orWhere('description', 'like', "%{$search}%")
                      ->orWhere('description_ar', 'like', "%{$search}%");
                });
            }

            if ($status === 'active') {
                $query->where('is_active', true);
            } elseif ($status === 'inactive') {
                $query->where('is_active', false);
            }

            if ($type) {
                $query->where('type', $type);
            }

            $badges = $query->orderBy('created_at', 'desc')
                ->select('id', 'name', 'name_ar', 'description', 'description_ar', 'icon', 'image', 'type', 'badge_category', 'level', 'points_required', 'is_active', 'status', 'created_at')
                ->paginate($perPage);

            // Format image and icon URLs
            $badges->getCollection()->transform(function ($badge) {
                // Handle icon: if it's emoji/text, remove any incorrect /storage/ prefix
                if ($badge->icon) {
                    if ($this->isEmojiOrText($badge->icon)) {
                        // Remove /storage/ prefix if it was incorrectly added
                        $badge->icon = preg_replace('#^/storage/#', '', $badge->icon);
                    } else {
                        // It's a file path, format it properly
                        $badge->icon = $this->formatBadgeImageUrl($badge->icon);
                    }
                }
                // Only format image if it exists and is a file path
                if ($badge->image) {
                    $badge->image = $this->formatBadgeImageUrl($badge->image);
                }
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
                ->select('id', 'name', 'name_ar', 'description', 'description_ar', 'icon', 'image', 'type', 'badge_category', 'level', 'points_required')
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

    /**
     * Get active achievement badges only
     */
    public function getActiveAchievementBadges(): Collection
    {
        return $this->getActiveBadges()->filter(function ($badge) {
            return $badge->badge_category === 'achievement';
        })->values();
    }

    /**
     * Get active community badges only
     */
    public function getActiveCommunityBadges(): Collection
    {
        return $this->getActiveBadges()->filter(function ($badge) {
            return $badge->badge_category === 'community';
        })->values();
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

        // Fire event when badge is awarded (only if it's new)
        if ($wasCreated) {
            $student = \App\Models\User::find($userId);
            $badge = Badge::find($badgeId);

            if ($student && $badge) {
                // Fire BadgeGranted event for proper integration
                event(new \App\Events\BadgeGranted($student, $badge));
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
                ->with('badge:id,name,name_ar,icon,image,badge_category')
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
                            'badge_category' => $userBadge->badge->badge_category,
                        ] : null,
                    ];
                });
        }, 300); // Cache for 5 minutes
    }

    /**
     * Get user's community badge progress
     */
    public function getUserCommunityBadgeProgress(int $userId): SupportCollection
    {
        $cacheKey = "user_community_badge_progress_{$userId}";
        $cacheTag = "student_badges_{$userId}";

        return $this->cacheTags($cacheTag, $cacheKey, function () use ($userId) {
            return UserCommunityBadge::where('user_id', $userId)
                ->with('badge:id,name,name_ar,icon,image,badge_category')
                ->select('id', 'badge_id', 'score', 'last_updated_at')
                ->get()
                ->map(function ($progress) {
                    // Format badge icon and image URLs
                    if ($progress->badge) {
                        $progress->badge->icon = $this->formatBadgeImageUrl($progress->badge->icon);
                        $progress->badge->image = $this->formatBadgeImageUrl($progress->badge->image);
                    }

                    return [
                        'id' => $progress->id,
                        'badge_id' => $progress->badge_id,
                        'score' => $progress->score,
                        'percentage' => $progress->percentage,
                        'current_range' => $progress->current_range,
                        'last_updated_at' => $progress->last_updated_at?->format('Y-m-d H:i:s'),
                        'badge' => $progress->badge ? [
                            'id' => $progress->badge->id,
                            'name' => $progress->badge->name,
                            'name_ar' => $progress->badge->name_ar,
                            'icon' => $progress->badge->icon,
                            'image' => $progress->badge->image,
                            'badge_category' => $progress->badge->badge_category,
                        ] : null,
                    ];
                });
        }, 300); // Cache for 5 minutes
    }

    /**
     * Update or create community badge progress for a user
     */
    public function updateCommunityBadgeProgress(int $userId, int $badgeId, int $score): UserCommunityBadge
    {
        // Ensure score is between 0 and 100
        $score = max(0, min(100, $score));

        $progress = UserCommunityBadge::updateOrCreate(
            [
                'user_id' => $userId,
                'badge_id' => $badgeId,
            ],
            [
                'score' => $score,
                'last_updated_at' => now(),
            ]
        );

        // Clear cache
        $this->forgetCacheTags([
            "student_badges_{$userId}",
            "user_community_badge_progress_{$userId}",
        ]);

        return $progress;
    }

    public function userHasBadge(int $userId, int $badgeId): bool
    {
        return UserBadge::where('user_id', $userId)
            ->where('badge_id', $badgeId)
            ->exists();
    }

    /**
     * Check and award community badges based on user's points
     */
    public function checkAndAwardCommunityBadges(User $user): void
    {
        $userPoints = $user->points;

        // Get all active community badges ordered by points required
        $communityBadges = Badge::where('badge_category', 'community')
            ->where('is_active', true)
            ->where('status', 'approved')
            ->where('points_required', '<=', $userPoints)
            ->orderBy('points_required', 'desc')
            ->get();

        foreach ($communityBadges as $badge) {
            // Check if user already has this badge
            if (!$this->userHasBadge($user->id, $badge->id)) {
                // Award the badge automatically
                $this->awardBadge(
                    $user->id,
                    $badge->id,
                    null, // project_id
                    null, // challenge_id
                    "تم الحصول عليها تلقائياً عند الوصول إلى {$badge->points_required} نقطة",
                    null  // awarded_by (system)
                );
            }
        }
    }
}

