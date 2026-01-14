<?php

namespace App\Services;

use App\Models\ChallengeSubmission;
use App\Models\Challenge;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;

class ChallengeSubmissionService extends BaseService
{
    /**
     * Get active challenges for a student's school
     */
    public function getActiveChallengesForStudent(int $schoolId, int $perPage = 12): LengthAwarePaginator
    {
        $cacheKey = "active_challenges_student_{$schoolId}_{$perPage}";
        $cacheTag = "school_challenges_{$schoolId}";
        
        return $this->cacheTags($cacheTag, $cacheKey, function () use ($schoolId, $perPage) {
            return Challenge::where('school_id', $schoolId)
                ->where('status', 'active')
                ->where('start_date', '<=', now())
                ->where('deadline', '>=', now())
                ->with(['creator', 'school'])
                ->withCount(['submissions as submissions_count', 'participants as participants_count'])
                ->orderBy('created_at', 'desc')
                ->paginate($perPage);
        }, 300);
    }

    /**
     * Get all challenges for a student's school (active, upcoming, finished)
     */
    public function getAllChallengesForStudent(int $schoolId, ?string $status = null, int $perPage = 12, ?string $search = null, ?string $category = null): LengthAwarePaginator
    {
        $cacheKey = "all_challenges_student_{$schoolId}_" . md5(json_encode([$status, $perPage, $search, $category]));
        $cacheTag = "school_challenges_{$schoolId}";
        
        return $this->cacheTags($cacheTag, $cacheKey, function () use ($schoolId, $status, $perPage, $search, $category) {
            $query = Challenge::where('school_id', $schoolId)
                ->where('status', '!=', 'cancelled')
                ->with(['creator', 'school'])
                ->withCount(['submissions as submissions_count', 'participants as participants_count'])
                ->orderBy('created_at', 'desc');

            if ($status === 'active') {
                $query->where('status', 'active')
                    ->where('start_date', '<=', now())
                    ->where('deadline', '>=', now());
            } elseif ($status === 'upcoming') {
                $query->where('status', 'active')
                    ->where('start_date', '>', now());
            } elseif ($status === 'finished') {
                $query->where(function ($q) {
                    $q->where('status', 'completed')
                        ->orWhere('deadline', '<', now());
                });
            }

            // Apply search filter
            if ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('title', 'like', "%{$search}%")
                        ->orWhere('objective', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%");
                });
            }

            // Apply category filter
            if ($category) {
                $query->where('category', $category);
            }

            return $query->paginate($perPage);
        }, 300);
    }

    /**
     * Get challenge details with student submission
     */
    public function getChallengeDetailsForStudent(int $challengeId, int $studentId): ?Challenge
    {
        $challenge = Challenge::with(['creator', 'school'])
            ->find($challengeId);

        if ($challenge) {
            $challenge->load([
                'submissions' => function ($query) use ($studentId) {
                    $query->where('student_id', $studentId)->latest();
                },
            ]);

            $challenge->student_submission = $challenge->submissions->first();
        }

        return $challenge;
    }

    /**
     * Create a new submission
     */
    public function createSubmission(array $data): ChallengeSubmission
    {
        DB::beginTransaction();
        try {
            // Check if submission already exists
            $existing = ChallengeSubmission::where('challenge_id', $data['challenge_id'])
                ->where('student_id', $data['student_id'])
                ->first();

            if ($existing) {
                throw new \Exception('لقد قمت بتقديم حل لهذا التحدي مسبقاً');
            }

            // Handle file uploads
            if (isset($data['files']) && !empty($data['files'])) {
                $uploadedFiles = [];
                // Check if files is an array of file objects or already paths
                if (is_array($data['files'])) {
                    foreach ($data['files'] as $file) {
                        if ($file && is_object($file) && method_exists($file, 'isValid') && $file->isValid()) {
                            $path = $file->store('challenge-submissions', 'public');
                            $uploadedFiles[] = $path;
                        } elseif (is_string($file)) {
                            // Already a path, keep it
                            $uploadedFiles[] = $file;
                        }
                    }
                }
                $data['files'] = !empty($uploadedFiles) ? $uploadedFiles : null;
            } else {
                $data['files'] = null;
            }
            
            // Ensure answer is set (can be empty string but not null for database)
            if (!isset($data['answer'])) {
                $data['answer'] = null;
            }

            $data['submitted_at'] = now();
            $data['status'] = 'submitted';

            $submission = ChallengeSubmission::create($data);
            
            // Load relationships for event
            $submission->load(['challenge', 'student']);

            // Update challenge participants count
            Challenge::where('id', $data['challenge_id'])->increment('current_participants');

            $this->clearSubmissionCache($data['challenge_id'], $data['student_id']);

            DB::commit();
            
            // Send notification to student
            $student = $submission->student;
            if ($student) {
                $student->notify(new \App\Notifications\ChallengeSubmissionSubmittedNotification($submission));
            }
            
            // Trigger event for notification (to school/teacher)
            event(new \App\Events\SubmissionCreated($submission, $data['student_id']));
            
            return $submission;
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Update submission
     */
    public function updateSubmission(ChallengeSubmission $submission, array $data): ChallengeSubmission
    {
        DB::beginTransaction();
        try {
            // Handle file uploads
            if (isset($data['files']) && !empty($data['files'])) {
                $uploadedFiles = [];
                // Check if files is an array of file objects or already paths
                if (is_array($data['files'])) {
                    foreach ($data['files'] as $file) {
                        if ($file && is_object($file) && method_exists($file, 'isValid') && $file->isValid()) {
                            $path = $file->store('challenge-submissions', 'public');
                            $uploadedFiles[] = $path;
                        } elseif (is_string($file)) {
                            // Already a path, keep it
                            $uploadedFiles[] = $file;
                        }
                    }
                }
                if (!empty($uploadedFiles)) {
                    // Delete old files
                    if ($submission->files && is_array($submission->files)) {
                        foreach ($submission->files as $oldFile) {
                            if (is_string($oldFile)) {
                                Storage::disk('public')->delete($oldFile);
                            }
                        }
                    }
                    $data['files'] = array_merge($submission->files ?? [], $uploadedFiles);
                } else {
                    unset($data['files']);
                }
            }
            
            // Ensure answer is set (can be empty string but not null for database)
            if (isset($data['answer']) && $data['answer'] === '') {
                $data['answer'] = null;
            }

            $oldStatus = $submission->status;
            $changes = array_intersect_key($data, array_flip(['status', 'answer', 'files', 'comment']));
            
            $submission->update($data);

            $this->clearSubmissionCache($submission->challenge_id, $submission->student_id);

            DB::commit();
            
            $updatedSubmission = $submission->fresh();
            
            // Trigger events
            if (!empty($changes)) {
                event(new \App\Events\SubmissionUpdated($updatedSubmission, $changes, auth()->id() ?? $submission->student_id));
            }
            
            // Trigger status change event if status changed
            if (isset($data['status']) && $data['status'] !== $oldStatus) {
                event(new \App\Events\StatusChanged($updatedSubmission, $oldStatus, $data['status'], auth()->id() ?? $submission->student_id));
            }
            
            return $updatedSubmission;
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Evaluate submission
     */
    public function evaluateSubmission(ChallengeSubmission $submission, array $data): ChallengeSubmission
    {
        DB::beginTransaction();
        try {
            $data['reviewed_at'] = now();
            $data['status'] = $data['status'] ?? 'reviewed';
            $reviewedBy = $data['reviewed_by'] ?? auth()->id();

            $submission->update($data);

            // Award points if approved
            if ($data['status'] === 'approved' && $submission->challenge->points_reward > 0) {
                $points = $data['points_earned'] ?? $submission->challenge->points_reward;
                $submission->update(['points_earned' => $points]);
                
                // Add points to student
                \App\Models\Point::create([
                    'user_id' => $submission->student_id,
                    'amount' => $points,
                    'source' => 'challenge',
                    'source_id' => $submission->challenge_id,
                    'description' => 'نقاط من تحدّي: ' . $submission->challenge->title,
                ]);
            }

            $this->clearSubmissionCache($submission->challenge_id, $submission->student_id);

            DB::commit();
            
            // Load relationships for event
            $submission->load(['challenge', 'student', 'reviewer']);
            
            // Trigger event for notification
            event(new \App\Events\ChallengeSubmissionReviewed($submission, $reviewedBy));
            
            return $submission->fresh();
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Get submissions for a challenge
     */
    public function getChallengeSubmissions(int $challengeId, ?string $status = null, int $perPage = 10): LengthAwarePaginator
    {
        $query = ChallengeSubmission::where('challenge_id', $challengeId)
            ->with(['student:id,name,email', 'reviewer:id,name'])
            ->orderBy('submitted_at', 'desc');

        if ($status) {
            $query->where('status', $status);
        }

        return $query->paginate($perPage);
    }

    /**
     * Clear submission cache
     */
    private function clearSubmissionCache(int $challengeId, int $studentId): void
    {
        \Cache::forget("challenge_details_student_{$challengeId}_{$studentId}");
    }
}

