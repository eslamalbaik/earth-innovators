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
            $query = Publication::where('school_id', $schoolId)
                ->with('author:id,name')
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
            return Publication::where('school_id', $schoolId)
                ->where('status', 'pending')
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
            return [
                'total' => Publication::where('school_id', $schoolId)->count(),
                'pending' => Publication::where('school_id', $schoolId)->where('status', 'pending')->count(),
                'approved' => Publication::where('school_id', $schoolId)->where('status', 'approved')->count(),
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

        // إرسال إشعار لجميع الطلاب والمعلمين في المدرسة
        \App\Jobs\SendNewPublicationNotification::dispatch($publication->fresh());

        // Clear cache
        $this->clearPublicationCache($publication->school_id, $publication->author_id);

        return $publication->fresh();
    }

    public function rejectPublication(Publication $publication, int $rejectedBy, ?string $reason = null): Publication
    {
        $publication->update([
            'status' => 'rejected',
            'approved_by' => $rejectedBy,
            'rejection_reason' => $reason,
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

    private function clearPublicationCache(?int $schoolId = null, ?int $authorId = null): void
    {
        $this->forgetCacheTags(['approved_publications']);

        if ($schoolId) {
            $this->forgetCacheTags(["school_publications_{$schoolId}"]);
        }

        if ($authorId) {
            $this->forgetCacheTags(["teacher_publications_{$authorId}"]);
        }
    }
}

