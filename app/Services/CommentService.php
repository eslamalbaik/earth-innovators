<?php

namespace App\Services;

use App\Models\Project;
use App\Models\ProjectComment;
use Illuminate\Support\Facades\Storage;
use Illuminate\Pagination\LengthAwarePaginator;

class CommentService extends BaseService
{
    public function createComment(array $data, int $projectId, int $userId): ProjectComment
    {
        $project = Project::findOrFail($projectId);

        // Verify project is approved
        if ($project->status !== 'approved') {
            throw new \Exception('لا يمكن التعليق على مشروع غير معتمد');
        }

        // Handle file uploads
        $uploadedFiles = [];
        if (isset($data['files']) && is_array($data['files'])) {
            foreach ($data['files'] as $file) {
                if (is_file($file)) {
                    $mimeType = $file->getMimeType();
                    if (str_starts_with($mimeType, 'image/')) {
                        $path = $file->store('project-comments/images', 'public');
                    } elseif (str_starts_with($mimeType, 'video/')) {
                        $path = $file->store('project-comments/videos', 'public');
                    } else {
                        $path = $file->store('project-comments/files', 'public');
                    }
                    $uploadedFiles[] = $path;
                }
            }
        }

        $comment = ProjectComment::create([
            'project_id' => $projectId,
            'user_id' => $userId,
            'parent_id' => $data['parent_id'] ?? null,
            'comment' => $data['comment'],
            'files' => $uploadedFiles,
        ]);

        // Clear cache
        $this->forgetCacheTags(["project_{$projectId}", "project_comments_{$projectId}"]);

        return $comment;
    }

    public function updateComment(ProjectComment $comment, array $data, int $userId): ProjectComment
    {
        // Verify ownership
        if ($comment->user_id !== $userId) {
            throw new \Exception('غير مصرح لك بتعديل هذا التعليق');
        }

        $comment->update([
            'comment' => $data['comment'],
            'is_edited' => true,
        ]);

        // Clear cache
        $this->forgetCacheTags(["project_{$comment->project_id}", "project_comments_{$comment->project_id}"]);

        return $comment->fresh();
    }

    public function deleteComment(ProjectComment $comment, int $userId): bool
    {
        $project = $comment->project;
        $canDelete = $comment->user_id === $userId
            || ($userId && \App\Models\User::find($userId)->isSchool() && $project->school_id === $userId)
            || ($userId && \App\Models\User::find($userId)->isTeacher() && $project->teacher_id === $userId);

        if (!$canDelete) {
            throw new \Exception('غير مصرح لك بحذف هذا التعليق');
        }

        // Delete attached files
        if ($comment->files) {
            foreach ($comment->files as $file) {
                Storage::disk('public')->delete($file);
            }
        }

        $projectId = $comment->project_id;
        $deleted = $comment->delete();

        // Clear cache
        $this->forgetCacheTags(["project_{$projectId}", "project_comments_{$projectId}"]);

        return $deleted;
    }

    public function getProjectComments(int $projectId, ?int $parentId = null, int $perPage = 20): LengthAwarePaginator
    {
        $cacheKey = "project_comments_{$projectId}_" . ($parentId ?? 'all') . "_{$perPage}";
        $cacheTag = "project_comments_{$projectId}";

        return $this->cacheTags($cacheTag, $cacheKey, function () use ($projectId, $parentId, $perPage) {
            $query = ProjectComment::with([
                'user:id,name,email,image,role',
                'replies' => function ($q) {
                    $q->with('user:id,name,email,image')
                        ->latest()
                        ->limit(5);
                }
            ])
                ->where('project_id', $projectId)
                ->select('id', 'project_id', 'user_id', 'parent_id', 'comment', 'files', 'is_edited', 'created_at', 'updated_at');

            if ($parentId === null) {
                $query->whereNull('parent_id');
            } else {
                $query->where('parent_id', $parentId);
            }

            return $query->latest()
                ->paginate($perPage);
        }, 300); // Cache for 5 minutes
    }
}

