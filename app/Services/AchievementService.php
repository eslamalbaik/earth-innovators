<?php

namespace App\Services;

use App\Models\Achievement;
use App\Models\AchievementAttachment;
use App\Models\User;
use App\Jobs\AnalyzeAchievementJob;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;

class AchievementService extends BaseService
{
    /**
     * Get achievements for a user with optional filters
     */
    public function getForUser(User $user, ?string $type = null, ?string $status = null, int $perPage = 15)
    {
        $query = $user->achievements()
            ->with('attachments')
            ->latest('date');

        if ($type) {
            $query->byType($type);
        }

        if ($status) {
            $query->where('ai_validation_status', $status);
        }

        return $query->paginate($perPage);
    }

    /**
     * Create a new achievement
     */
    public function create(User $user, array $data): Achievement
    {
        return DB::transaction(function () use ($user, $data) {
            $achievement = $user->achievements()->create([
                'title'          => $data['title'],
                'description'    => $data['description'] ?? null,
                'type'           => $data['type'],
                'category'       => $data['category'] ?? null,
                'date'           => $data['date'] ?? now(),
                'external_links' => $data['external_links'] ?? null,
                'ai_validation_status' => 'pending',
            ]);

            // Handle file attachments
            if (!empty($data['attachments'])) {
                foreach ($data['attachments'] as $file) {
                    $this->uploadAttachment($achievement, $file);
                }
            }

            // Handle URL attachments
            if (!empty($data['urls'])) {
                foreach ($data['urls'] as $url) {
                    $achievement->attachments()->create([
                        'file_type' => 'url',
                        'url'       => $url,
                    ]);
                }
            }

            // Dispatch AI analysis job
            AnalyzeAchievementJob::dispatch($achievement);

            return $achievement->load('attachments');
        });
    }

    /**
     * Update an existing achievement
     */
    public function update(Achievement $achievement, array $data): Achievement
    {
        return DB::transaction(function () use ($achievement, $data) {
            $achievement->update([
                'title'          => $data['title'] ?? $achievement->title,
                'description'    => $data['description'] ?? $achievement->description,
                'type'           => $data['type'] ?? $achievement->type,
                'category'       => $data['category'] ?? $achievement->category,
                'date'           => $data['date'] ?? $achievement->date,
                'external_links' => $data['external_links'] ?? $achievement->external_links,
                'ai_validation_status' => 'pending', // Re-validate after update
            ]);

            // Handle new attachments
            if (!empty($data['attachments'])) {
                foreach ($data['attachments'] as $file) {
                    $this->uploadAttachment($achievement, $file);
                }
            }

            // Re-analyze with AI
            AnalyzeAchievementJob::dispatch($achievement);

            return $achievement->fresh('attachments');
        });
    }

    /**
     * Delete an achievement
     */
    public function delete(Achievement $achievement): bool
    {
        return DB::transaction(function () use ($achievement) {
            // Delete associated files from storage
            foreach ($achievement->attachments as $attachment) {
                if ($attachment->file_path) {
                    Storage::disk('public')->delete($attachment->file_path);
                }
            }

            return $achievement->delete();
        });
    }

    /**
     * Upload a file attachment to an achievement
     */
    public function uploadAttachment(Achievement $achievement, UploadedFile $file): AchievementAttachment
    {
        $fileType = $this->determineFileType($file);
        $path = $file->store("achievements/{$achievement->id}", 'public');

        return $achievement->attachments()->create([
            'file_path'     => $path,
            'file_type'     => $fileType,
            'original_name' => $file->getClientOriginalName(),
            'mime_type'     => $file->getMimeType(),
            'size_bytes'    => $file->getSize(),
        ]);
    }

    /**
     * Delete an attachment
     */
    public function deleteAttachment(AchievementAttachment $attachment): bool
    {
        if ($attachment->file_path) {
            Storage::disk('public')->delete($attachment->file_path);
        }

        return $attachment->delete();
    }

    /**
     * Determine file type from uploaded file
     */
    private function determineFileType(UploadedFile $file): string
    {
        $mime = $file->getMimeType();

        if (str_starts_with($mime, 'image/')) {
            return 'image';
        }

        if (str_starts_with($mime, 'video/')) {
            return 'video';
        }

        if ($mime === 'application/pdf') {
            return 'pdf';
        }

        if (str_contains($mime, 'word') || str_contains($mime, 'document')) {
            return 'docx';
        }

        return 'pdf'; // Default fallback
    }

    /**
     * Get achievement statistics for a user
     */
    public function getStatistics(User $user): array
    {
        $achievements = $user->achievements;

        return [
            'total'     => $achievements->count(),
            'validated' => $achievements->where('ai_validation_status', 'validated')->count(),
            'pending'   => $achievements->where('ai_validation_status', 'pending')->count(),
            'flagged'   => $achievements->where('ai_validation_status', 'flagged')->count(),
            'by_type'   => $achievements->groupBy('type')->map->count(),
            'avg_confidence' => round($achievements->avg('ai_confidence_score') ?? 0, 2),
        ];
    }
}
