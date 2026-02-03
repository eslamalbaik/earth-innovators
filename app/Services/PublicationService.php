<?php

namespace App\Services;

use App\Models\Publication;
use Illuminate\Support\Facades\Cache;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

class PublicationService extends BaseService
{
    public function getApprovedPublications(
        ?string $search = null,
        ?string $type = null,
        int $perPage = 12
    ): LengthAwarePaginator {
        $cacheKey = "approved_publications_" . md5(json_encode([$search, $type, $perPage]));
        $cacheTag = 'approved_publications';

        return $this->cacheTags($cacheTag, $cacheKey, function () use ($search, $type, $perPage) {
            $query = Publication::where('status', 'approved')
                ->with(['author:id,name', 'school:id,name'])
                ->select('id', 'title', 'description', 'type', 'cover_image', 'file', 'content', 'issue_number', 'publish_date', 'publisher_name', 'likes_count', 'author_id', 'school_id', 'created_at')
                ->orderBy('created_at', 'desc');

            if ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('title', 'like', "%{$search}%")
                      ->orWhere('description', 'like', "%{$search}%");
                });
            }

            if ($type) {
                $query->where('type', $type);
            }

            return $query->paginate($perPage);
        }, 300); // Cache for 5 minutes
    }

    public function getPublicationDetails(int $publicationId, ?int $userId = null): ?Publication
    {
        $cacheKey = "publication_details_{$publicationId}";
        $cacheTag = "publication_{$publicationId}";

        $publication = $this->cacheTags($cacheTag, $cacheKey, function () use ($publicationId) {
            return Publication::with(['author:id,name', 'school:id,name', 'approver:id,name'])
                ->select('id', 'title', 'description', 'type', 'cover_image', 'file', 'content', 'issue_number', 'publish_date', 'publisher_name', 'likes_count', 'author_id', 'school_id', 'approved_by', 'status', 'created_at')
                ->find($publicationId);
        }, 600); // Cache for 10 minutes

        if ($publication && $publication->status === 'approved') {
            // Increment views (don't cache this)
            $publication->incrementViews();
            
            // Check if liked by user
            if ($userId) {
                $publication->is_liked = $publication->isLikedBy($userId);
            }
        }

        return $publication;
    }

    public function getTeacherPublications(int $userId, int $perPage = 10): LengthAwarePaginator
    {
        $cacheKey = "teacher_publications_{$userId}_{$perPage}";
        $cacheTag = "teacher_publications_{$userId}";

        return $this->cacheTags($cacheTag, $cacheKey, function () use ($userId, $perPage) {
            return Publication::where('author_id', $userId)
                ->with('school:id,name')
                ->select('id', 'title', 'description', 'type', 'status', 'cover_image', 'file', 'content', 'issue_number', 'publish_date', 'publisher_name', 'likes_count', 'school_id', 'created_at')
                ->orderBy('created_at', 'desc')
                ->paginate($perPage);
        }, 300); // Cache for 5 minutes
    }

    public function getSchoolPublications(int $schoolId, ?string $status = null, int $perPage = 10): LengthAwarePaginator
    {
        $cacheKey = "school_publications_{$schoolId}_" . md5($status ?? '') . "_{$perPage}";
        $cacheTag = "school_publications_{$schoolId}";

        return $this->cacheTags($cacheTag, $cacheKey, function () use ($schoolId, $status, $perPage) {
            $query = Publication::query();
            if ($schoolId > 0) {
                $query->where('school_id', $schoolId);
            }
            $query->with('author:id,name')
                ->select('id', 'title', 'description', 'type', 'status', 'cover_image', 'file', 'content', 'issue_number', 'publish_date', 'publisher_name', 'likes_count', 'author_id', 'created_at')
                ->orderBy('created_at', 'desc');

            if ($status) {
                $query->where('status', $status);
            }

            return $query->paginate($perPage);
        }, 300); // Cache for 5 minutes
    }

    public function getSchoolPendingPublications(int $schoolId, int $perPage = 10): LengthAwarePaginator
    {
        $cacheKey = "school_pending_publications_{$schoolId}_{$perPage}";
        $cacheTag = "school_publications_{$schoolId}";

        return $this->cacheTags($cacheTag, $cacheKey, function () use ($schoolId, $perPage) {
            $query = Publication::query();
            if ($schoolId > 0) {
                $query->where('school_id', $schoolId);
            }
            return $query->where('status', 'pending')
                ->whereColumn('author_id', '!=', 'school_id') // Not from school itself
                ->with('author:id,name')
                ->select('id', 'title', 'description', 'type', 'status', 'cover_image', 'author_id', 'created_at')
                ->orderBy('created_at', 'desc')
                ->paginate($perPage);
        }, 300); // Cache for 5 minutes
    }

    public function getSchoolPublicationStats(int $schoolId): array
    {
        $cacheKey = "school_publication_stats_{$schoolId}";
        $cacheTag = "school_publications_{$schoolId}";

        return $this->cacheTags($cacheTag, $cacheKey, function () use ($schoolId) {
            $query = Publication::query();
            if ($schoolId > 0) {
                $query->where('school_id', $schoolId);
            }
            return [
                'total' => (clone $query)->count(),
                'pending' => (clone $query)->where('status', 'pending')->count(),
                'approved' => (clone $query)->where('status', 'approved')->count(),
            ];
        }, 300); // Cache for 5 minutes
    }

    public function normalizeImagePath(?string $imagePath): ?string
    {
        if (!$imagePath) {
            return null;
        }

        // If it's a full URL, return as is
        if (str_starts_with($imagePath, 'http://') || str_starts_with($imagePath, 'https://')) {
            return $imagePath;
        }

        // If it starts with /storage/ or /images/, return as is
        if (str_starts_with($imagePath, '/storage/') || str_starts_with($imagePath, '/images/')) {
            return $imagePath;
        }

        // If it starts with storage/ without /, add /
        if (str_starts_with($imagePath, 'storage/')) {
            return '/' . $imagePath;
        }

        // Assume it's a relative path in storage
        return '/storage/' . $imagePath;
    }

    public function normalizeFilePath(?string $filePath): ?string
    {
        return $this->normalizeImagePath($filePath);
    }

    public function createPublication(array $data): Publication
    {
        // Handle file uploads
        if (isset($data['cover_image']) && is_file($data['cover_image'])) {
            $data['cover_image'] = $data['cover_image']->store('publications/covers', 'public');
        }

        if (isset($data['file']) && is_file($data['file'])) {
            $data['file'] = $data['file']->store('publications/files', 'public');
        }

        $publication = Publication::create($data);

        // Clear cache
        $this->clearPublicationCache($publication->school_id, $publication->author_id);

        return $publication;
    }

    public function updatePublication(Publication $publication, array $data): Publication
    {
        // Handle file uploads
        if (isset($data['cover_image']) && is_file($data['cover_image'])) {
            // Delete old image
            if ($publication->cover_image) {
                \Storage::disk('public')->delete($publication->cover_image);
            }
            $data['cover_image'] = $data['cover_image']->store('publications/covers', 'public');
        }

        if (isset($data['file']) && is_file($data['file'])) {
            // Delete old file
            if ($publication->file) {
                \Storage::disk('public')->delete($publication->file);
            }
            $data['file'] = $data['file']->store('publications/files', 'public');
        }

        $publication->update($data);

        // Clear cache
        $this->clearPublicationCache($publication->school_id, $publication->author_id);

        return $publication->fresh();
    }

    public function approvePublication(Publication $publication, int $approvedBy): Publication
    {
        $publication->update([
            'status' => 'approved',
            'approved_by' => $approvedBy,
            'approved_at' => now(),
        ]);

        // Award points to author for publication approval
        if ($publication->author_id) {
            try {
                $pointsService = app(\App\Services\PointsService::class);
                $pointsService->awardPoints(
                    $publication->author_id,
                    20, // Points for publication approval
                    'publication_approval',
                    $publication->id,
                    "Publication approved: {$publication->title}",
                    "تم الموافقة على المقال: {$publication->title}"
                );
            } catch (\Exception $e) {
                \Log::error('Failed to award points for publication approval', [
                    'publication_id' => $publication->id,
                    'author_id' => $publication->author_id,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        // Fire ArticleApproved event for proper integration
        event(new \App\Events\ArticleApproved($publication->fresh()));

        // إرسال إشعار لجميع الطلاب والمعلمين في المدرسة مباشرة
        try {
            $publication = $publication->fresh(['author', 'school']);
            
            if ($publication->school_id) {
                $users = \App\Models\User::where('school_id', $publication->school_id)
                    ->whereIn('role', ['student', 'teacher'])
                    ->get();
                
                foreach ($users as $user) {
                    try {
                        $user->notify(new \App\Notifications\NewPublicationNotification($publication));
                    } catch (\Exception $e) {
                        \Log::error('Failed to send publication notification to user', [
                            'user_id' => $user->id,
                            'publication_id' => $publication->id,
                            'error' => $e->getMessage(),
                        ]);
                    }
                }
                
                \Log::info('Publication notifications sent after approval', [
                    'publication_id' => $publication->id,
                    'users_count' => $users->count(),
                ]);
            }
        } catch (\Exception $e) {
            \Log::error('Failed to send publication notifications after approval', [
                'publication_id' => $publication->id,
                'error' => $e->getMessage(),
            ]);
            // لا نوقف العملية إذا فشل إرسال الإشعارات
        }

        // Clear cache
        $this->clearPublicationCache($publication->school_id, $publication->author_id);

        return $publication->fresh();
    }

    public function rejectPublication(Publication $publication, int $rejectedBy, ?string $reason = null): Publication
    {
        $publication->update([
            'status' => 'rejected',
            'approved_by' => $rejectedBy,
            // Note: rejection_reason field doesn't exist in publications table
            // If needed, add a migration to add this field
        ]);

        // Clear cache
        $this->clearPublicationCache($publication->school_id, $publication->author_id);

        return $publication->fresh();
    }

    public function deletePublication(Publication $publication): bool
    {
        // Delete files
        if ($publication->cover_image) {
            \Storage::disk('public')->delete($publication->cover_image);
        }
        if ($publication->file) {
            \Storage::disk('public')->delete($publication->file);
        }

        $schoolId = $publication->school_id;
        $authorId = $publication->author_id;

        $deleted = $publication->delete();

        // Clear cache
        $this->clearPublicationCache($schoolId, $authorId);

        return $deleted;
    }

    public function clearPublicationCache(?int $schoolId = null, ?int $authorId = null): void
    {
        $cacheDriver = config('cache.default');
        $supportsTags = in_array($cacheDriver, ['redis', 'memcached']);
        
        $this->forgetCacheTags(['approved_publications']);

        if ($schoolId) {
            $this->forgetCacheTags(["school_publications_{$schoolId}"]);
            // مسح مباشر للكاش بدون tags
            if (!$supportsTags) {
                for ($page = 1; $page <= 20; $page++) {
                    \Cache::forget("school_publications_{$schoolId}_" . md5('') . "_{$page}");
                    \Cache::forget("school_pending_publications_{$schoolId}_{$page}");
                }
            }
        }

        if ($authorId) {
            $this->forgetCacheTags(["teacher_publications_{$authorId}"]);
            // مسح مباشر للكاش بدون tags
            if (!$supportsTags) {
                for ($page = 1; $page <= 20; $page++) {
                    \Cache::forget("teacher_publications_{$authorId}_{$page}");
                }
            }
        }
        
        // مسح كاش المقالات المعتمدة العامة
        if (!$supportsTags) {
            \Cache::forget('approved_publications_' . md5(json_encode([null, null, 12])));
        }
    }
}

