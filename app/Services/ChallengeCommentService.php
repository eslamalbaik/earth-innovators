<?php

namespace App\Services;

use App\Models\ChallengeSubmissionComment;
use App\Models\ChallengeSubmission;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ChallengeCommentService extends BaseService
{
    /**
     * Create a new comment on a submission
     */
    public function createComment(array $data): ChallengeSubmissionComment
    {
        DB::beginTransaction();
        try {
            $submission = ChallengeSubmission::with(['challenge', 'student'])->findOrFail($data['submission_id']);
            
            $comment = ChallengeSubmissionComment::create([
                'submission_id' => $data['submission_id'],
                'user_id' => $data['user_id'],
                'comment' => $data['comment'],
                'mentioned_user_ids' => $data['mentioned_user_ids'] ?? null,
                'parent_id' => $data['parent_id'] ?? null,
            ]);

            DB::commit();
            
            // Trigger event for notification
            event(new \App\Events\CommentAdded($comment, $submission));
            
            return $comment->fresh(['user', 'submission']);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to create comment: ' . $e->getMessage(), [
                'data' => $data,
                'trace' => $e->getTraceAsString(),
            ]);
            throw $e;
        }
    }

    /**
     * Update a comment
     */
    public function updateComment(ChallengeSubmissionComment $comment, array $data): ChallengeSubmissionComment
    {
        $comment->update($data);
        return $comment->fresh(['user', 'submission']);
    }

    /**
     * Delete a comment
     */
    public function deleteComment(ChallengeSubmissionComment $comment): bool
    {
        return $comment->delete();
    }

    /**
     * Get comments for a submission
     */
    public function getSubmissionComments(int $submissionId, bool $includeReplies = true): \Illuminate\Database\Eloquent\Collection
    {
        $query = ChallengeSubmissionComment::where('submission_id', $submissionId)
            ->with(['user:id,name,email,image']);

        if ($includeReplies) {
            $query->with(['replies.user:id,name,email,image']);
        } else {
            $query->whereNull('parent_id');
        }

        return $query->orderBy('created_at', 'desc')->get();
    }
}

