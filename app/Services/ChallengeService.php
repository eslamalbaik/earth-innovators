<?php

namespace App\Services;

use App\Models\Challenge;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ChallengeService extends BaseService
{
    /**
     * Get challenges for a school
     */
    public function getSchoolChallenges(int $schoolId, ?string $status = null, int $perPage = 10): LengthAwarePaginator
    {
        // Don't cache - always get fresh data to ensure new challenges appear immediately
        // Cache was causing issues where new challenges didn't appear
        $query = Challenge::where('school_id', $schoolId)
            ->with(['creator', 'school'])
            ->orderBy('created_at', 'desc');

        if ($status) {
            $query->where('status', $status);
        }

        return $query->paginate($perPage);
    }

    /**
     * Get challenges for a teacher
     */
    public function getTeacherChallenges(int $teacherId, int $perPage = 10): LengthAwarePaginator
    {
        $cacheKey = "teacher_challenges_{$teacherId}_{$perPage}";
        $cacheTag = "teacher_challenges_{$teacherId}";
        
        return $this->cacheTags($cacheTag, $cacheKey, function () use ($teacherId, $perPage) {
            return Challenge::where('created_by', $teacherId)
                ->with(['creator', 'school'])
                ->orderBy('created_at', 'desc')
                ->paginate($perPage);
        }, 3600);
    }

    /**
     * Get active challenges for a school (for students)
     */
    public function getActiveSchoolChallenges(int $schoolId, int $perPage = 10): LengthAwarePaginator
    {
        $cacheKey = "active_school_challenges_{$schoolId}_{$perPage}";
        $cacheTag = "school_challenges_{$schoolId}";
        
        return $this->cacheTags($cacheTag, $cacheKey, function () use ($schoolId, $perPage) {
            return Challenge::where('school_id', $schoolId)
                ->where('status', 'active')
                ->where('start_date', '<=', now())
                ->where('deadline', '>=', now())
                ->with(['creator', 'school'])
                ->orderBy('created_at', 'desc')
                ->paginate($perPage);
        }, 3600);
    }

    /**
     * Get active challenges (public - for all users)
     */
    public function getActiveChallenges(
        ?string $search = null,
        ?string $category = null,
        ?string $challengeType = null,
        ?int $schoolId = null,
        int $perPage = 12
    ): LengthAwarePaginator {
        $cacheKey = "active_challenges_" . md5(json_encode([$search, $category, $challengeType, $schoolId, $perPage]));
        $cacheTag = 'active_challenges';
        
        return $this->cacheTags($cacheTag, $cacheKey, function () use ($search, $category, $challengeType, $schoolId, $perPage) {
            $query = Challenge::where('status', 'active')
                ->where('start_date', '<=', now())
                ->where('deadline', '>=', now())
                ->with(['creator:id,name', 'school:id,name'])
                ->orderBy('created_at', 'desc');

            if ($schoolId) {
                $query->where('school_id', $schoolId);
            }

            if ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('title', 'like', "%{$search}%")
                      ->orWhere('description', 'like', "%{$search}%")
                      ->orWhere('objective', 'like', "%{$search}%");
                });
            }

            if ($category) {
                $query->where('category', $category);
            }

            if ($challengeType) {
                $query->where('challenge_type', $challengeType);
            }

            return $query->paginate($perPage);
        }, 300); // Cache for 5 minutes
    }

    /**
     * Create a new challenge
     */
    public function createChallenge(array $data): Challenge
    {
        DB::beginTransaction();
        try {
            $challenge = Challenge::create($data);
            
            $this->clearChallengeCache($challenge->school_id, $challenge->created_by);
            
            DB::commit();
            
            // Load relationships for event
            $challenge->load(['creator', 'school']);
            
            // Trigger event for notification
            event(new \App\Events\ChallengeCreated($challenge));
            
            return $challenge;
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Update a challenge
     */
    public function updateChallenge(Challenge $challenge, array $data): Challenge
    {
        DB::beginTransaction();
        try {
            $challenge->update($data);
            
            $this->clearChallengeCache($challenge->school_id, $challenge->created_by);
            
            DB::commit();
            return $challenge->fresh();
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Delete a challenge
     */
    public function deleteChallenge(Challenge $challenge): bool
    {
        DB::beginTransaction();
        try {
            $schoolId = $challenge->school_id;
            $createdBy = $challenge->created_by;
            
            $challenge->delete();
            
            $this->clearChallengeCache($schoolId, $createdBy);
            
            DB::commit();
            return true;
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Clear challenge cache
     */
    public function clearChallengeCache(?int $schoolId = null, ?int $createdBy = null): void
    {
        $cacheDriver = config('cache.default');
        $supportsTags = in_array($cacheDriver, ['redis', 'memcached']);
        
        if ($schoolId) {
            // Clear using tags if supported
            $this->forgetCacheTags(["school_challenges_{$schoolId}"]);
            
            // Always clear stats cache
            Cache::forget("school_challenge_stats_{$schoolId}");
            
            // Clear all possible cache keys for this school (for non-tagging drivers or as backup)
            $possibleStatuses = [null, 'draft', 'active', 'completed', 'cancelled'];
            $possiblePerPages = [10, 15, 20, 25, 30];
            
            foreach ($possibleStatuses as $status) {
                foreach ($possiblePerPages as $perPage) {
                    $cacheKey = "school_challenges_{$schoolId}_" . md5(json_encode([$status, $perPage]));
                    for ($page = 1; $page <= 20; $page++) {
                        Cache::forget("{$cacheKey}_{$page}");
                    }
                }
            }
            
            // Clear active school challenges cache
            foreach ($possiblePerPages as $perPage) {
                for ($page = 1; $page <= 20; $page++) {
                    Cache::forget("active_school_challenges_{$schoolId}_{$perPage}_{$page}");
                    Cache::forget("active_school_challenges_{$schoolId}_{$page}");
                }
            }
            
            Log::info('Challenge cache cleared for school', [
                'school_id' => $schoolId,
                'supports_tags' => $supportsTags,
            ]);
        }

        if ($createdBy) {
            // Clear using tags if supported
            $this->forgetCacheTags(["teacher_challenges_{$createdBy}"]);
            
            // Clear all possible cache keys for this teacher (for non-tagging drivers or as backup)
            $possiblePerPages = [10, 15, 20, 25, 30];
            foreach ($possiblePerPages as $perPage) {
                for ($page = 1; $page <= 20; $page++) {
                    Cache::forget("teacher_challenges_{$createdBy}_{$perPage}_{$page}");
                    Cache::forget("teacher_challenges_{$createdBy}_{$page}");
                }
            }
            
            Log::info('Challenge cache cleared for teacher', [
                'created_by' => $createdBy,
                'supports_tags' => $supportsTags,
            ]);
        }
        
        // Also clear active challenges cache (public)
        $this->forgetCacheTags(['active_challenges']);
    }

    /**
     * Get challenge statistics for a school
     */
    public function getSchoolChallengeStats(int $schoolId): array
    {
        return Cache::remember("school_challenge_stats_{$schoolId}", 3600, function () use ($schoolId) {
            return [
                'total' => Challenge::where('school_id', $schoolId)->count(),
                'active' => Challenge::where('school_id', $schoolId)->where('status', 'active')->count(),
                'draft' => Challenge::where('school_id', $schoolId)->where('status', 'draft')->count(),
                'completed' => Challenge::where('school_id', $schoolId)->where('status', 'completed')->count(),
            ];
        });
    }
}

