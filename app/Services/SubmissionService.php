<?php

namespace App\Services;

use App\Models\Project;
use App\Models\ProjectSubmission;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Illuminate\Pagination\LengthAwarePaginator;

class SubmissionService extends BaseService
{
    public function createSubmission(array $data, int $projectId, int $studentId): ProjectSubmission
    {
        $project = Project::findOrFail($projectId);

        // Verify project is approved and available for student
        if ($project->status !== 'approved') {
            throw new \Exception('المشروع غير معتمد');
        }

        // Check for existing submission
        $existingSubmission = ProjectSubmission::where('project_id', $projectId)
            ->where('student_id', $studentId)
            ->first();

        if ($existingSubmission) {
            throw new \Exception('لقد قمت بتسليم هذا المشروع مسبقاً');
        }

        // Handle file uploads
        $uploadedFiles = [];
        if (isset($data['files']) && is_array($data['files'])) {
            foreach ($data['files'] as $file) {
                if (is_file($file)) {
                    $mimeType = $file->getMimeType();
                    if (str_starts_with($mimeType, 'image/')) {
                        $path = $file->store('project-submissions/images', 'public');
                    } elseif (str_starts_with($mimeType, 'video/')) {
                        $path = $file->store('project-submissions/videos', 'public');
                    } else {
                        $path = $file->store('project-submissions/files', 'public');
                    }
                    $uploadedFiles[] = $path;
                }
            }
        }

        $submission = ProjectSubmission::create([
            'project_id' => $projectId,
            'student_id' => $studentId,
            'files' => $uploadedFiles,
            'comment' => $data['comment'] ?? null,
            'status' => 'submitted',
            'submitted_at' => now(),
        ]);

        // Dispatch event
        \App\Events\StudentSubmissionUpdated::dispatch($submission);

        // Clear cache
        $this->forgetCacheTags(["project_{$projectId}", "student_submissions_{$studentId}"]);

        return $submission;
    }

    public function updateSubmission(ProjectSubmission $submission, array $data, int $studentId): ProjectSubmission
    {
        // Verify ownership
        if ($submission->student_id !== $studentId) {
            throw new \Exception('غير مصرح لك بتعديل هذا التسليم');
        }

        // Verify submission hasn't been reviewed
        if ($submission->status !== 'submitted') {
            throw new \Exception('لا يمكن تعديل التسليم بعد المراجعة');
        }

        // Delete old files if new files are provided
        if (isset($data['files']) && is_array($data['files']) && !empty($data['files'])) {
            if ($submission->files) {
                foreach ($submission->files as $file) {
                    Storage::disk('public')->delete($file);
                }
            }

            $uploadedFiles = [];
            foreach ($data['files'] as $file) {
                if (is_file($file)) {
                    $mimeType = $file->getMimeType();
                    if (str_starts_with($mimeType, 'image/')) {
                        $path = $file->store('project-submissions/images', 'public');
                    } elseif (str_starts_with($mimeType, 'video/')) {
                        $path = $file->store('project-submissions/videos', 'public');
                    } else {
                        $path = $file->store('project-submissions/files', 'public');
                    }
                    $uploadedFiles[] = $path;
                }
            }
            $data['files'] = $uploadedFiles;
        } else {
            // Keep old files
            $data['files'] = $submission->files ?? [];
        }

        $submission->update([
            'files' => $data['files'],
            'comment' => $data['comment'] ?? $submission->comment,
        ]);

        // Dispatch event
        \App\Events\StudentSubmissionUpdated::dispatch($submission->fresh());

        // Clear cache
        $this->forgetCacheTags(["project_{$submission->project_id}", "student_submissions_{$studentId}"]);

        return $submission->fresh();
    }

    public function getStudentSubmissions(int $studentId, ?int $projectId = null, int $perPage = 15)
    {
        $cacheKey = "student_submissions_{$studentId}_" . ($projectId ?? 'all') . "_{$perPage}";
        $cacheTag = "student_submissions_{$studentId}";

        return $this->cacheTags($cacheTag, $cacheKey, function () use ($studentId, $projectId, $perPage) {
            $query = ProjectSubmission::with([
                'project:id,title,description,status',
                'student:id,name,email'
            ])
                ->where('student_id', $studentId)
                ->select('id', 'project_id', 'student_id', 'files', 'comment', 'status', 'submitted_at', 'reviewed_at', 'grade', 'feedback', 'created_at');

            if ($projectId) {
                $query->where('project_id', $projectId);
            }

            return $query->latest('submitted_at')
                ->paginate($perPage);
        }, 300); // Cache for 5 minutes
    }

    public function getProjectSubmissions(int $projectId, ?string $status = null, int $perPage = 15)
    {
        $cacheKey = "project_submissions_{$projectId}_" . md5($status ?? '') . "_{$perPage}";
        $cacheTag = "project_{$projectId}";

        return $this->cacheTags($cacheTag, $cacheKey, function () use ($projectId, $status, $perPage) {
            $query = ProjectSubmission::with([
                'student:id,name,email,image',
                'project:id,title'
            ])
                ->where('project_id', $projectId)
                ->select('id', 'project_id', 'student_id', 'files', 'comment', 'status', 'submitted_at', 'reviewed_at', 'grade', 'feedback', 'created_at');

            if ($status) {
                $query->where('status', $status);
            }

            return $query->latest('submitted_at')
                ->paginate($perPage);
        }, 300); // Cache for 5 minutes
    }

    public function getSchoolSubmissions(int $schoolId, ?string $status = null, ?int $studentId = null, ?string $search = null, int $perPage = 15)
    {
        $cacheKey = "school_submissions_{$schoolId}_" . md5(json_encode([$status, $studentId, $search])) . "_{$perPage}";
        $cacheTag = "school_submissions_{$schoolId}";

        return $this->cacheTags($cacheTag, $cacheKey, function () use ($schoolId, $status, $studentId, $search, $perPage) {
            // المشاريع المعتمدة للمدرسة (بما في ذلك مشاريع الإدارة المرتبطة بهذه المدرسة)
            $schoolProjects = Project::where(function($query) use ($schoolId) {
                    $query->where('school_id', $schoolId)
                          ->orWhere(function($q) use ($schoolId) {
                              $q->whereHas('user', function($userQuery) {
                                  $userQuery->where('role', 'admin');
                              })->where('school_id', $schoolId);
                          });
                })
                ->where('status', 'approved')
                ->pluck('id');

            $query = ProjectSubmission::with([
                'project:id,title,status',
                'student:id,name,email',
                'reviewer:id,name'
            ])
                ->whereIn('project_id', $schoolProjects)
                ->select('id', 'project_id', 'student_id', 'files', 'comment', 'status', 'submitted_at', 'reviewed_at', 'rating', 'feedback', 'reviewed_by', 'created_at');

            if ($status) {
                $query->where('status', $status);
            }

            if ($studentId) {
                $query->where('student_id', $studentId);
            }

            if ($search) {
                $query->where(function ($q) use ($search) {
                    $q->whereHas('student', function ($studentQuery) use ($search) {
                        $studentQuery->where('name', 'like', "%{$search}%");
                    })
                    ->orWhereHas('project', function ($projectQuery) use ($search) {
                        $projectQuery->where('title', 'like', "%{$search}%");
                    });
                });
            }

            return $query->latest('submitted_at')
                ->paginate($perPage);
        }, 300); // Cache for 5 minutes
    }

    public function getTeacherSubmissions(int $teacherId, ?string $status = null, ?string $search = null, int $perPage = 15)
    {
        $cacheKey = "teacher_submissions_{$teacherId}_" . md5(json_encode([$status, $search])) . "_{$perPage}";
        $cacheTag = "teacher_submissions_{$teacherId}";

        return $this->cacheTags($cacheTag, $cacheKey, function () use ($teacherId, $status, $search, $perPage) {
            $teacherProjects = Project::where('teacher_id', $teacherId)
                ->where('status', 'approved')
                ->pluck('id');

            $query = ProjectSubmission::with([
                'project:id,title,status',
                'student:id,name,email',
                'reviewer:id,name'
            ])
                ->whereIn('project_id', $teacherProjects)
                ->select('id', 'project_id', 'student_id', 'files', 'comment', 'status', 'submitted_at', 'reviewed_at', 'rating', 'feedback', 'reviewed_by', 'created_at');

            if ($status) {
                $query->where('status', $status);
            }

            if ($search) {
                $query->where(function ($q) use ($search) {
                    $q->whereHas('student', function ($studentQuery) use ($search) {
                        $studentQuery->where('name', 'like', "%{$search}%");
                    })
                    ->orWhereHas('project', function ($projectQuery) use ($search) {
                        $projectQuery->where('title', 'like', "%{$search}%");
                    });
                });
            }

            return $query->latest('submitted_at')
                ->paginate($perPage);
        }, 300); // Cache for 5 minutes
    }

    public function evaluateSubmission(ProjectSubmission $submission, array $data, int $reviewerId, ?int $schoolId = null, ?int $teacherId = null, ?bool $isAdmin = false): ProjectSubmission
    {
        // Admin can evaluate any submission
        if (!$isAdmin) {
            // Verify ownership for non-admin users
            if ($schoolId && $submission->project->school_id !== $schoolId) {
                throw new \Exception('غير مصرح لك بتقييم هذا التسليم');
            }

            if ($teacherId && $submission->project->teacher_id !== $teacherId) {
                throw new \Exception('غير مصرح لك بتقييم هذا التسليم');
            }
        }

        $submission->update([
            'rating' => $data['rating'],
            'feedback' => $data['feedback'] ?? null,
            'status' => $data['status'],
            'reviewed_by' => $reviewerId,
            'reviewed_at' => now(),
            'badges' => $data['badges'] ?? [],
        ]);

        // Award badges
        if (!empty($data['badges'])) {
            $reviewer = \App\Models\User::find($reviewerId);
            foreach ($data['badges'] as $badgeId) {
                $badge = \App\Models\Badge::find($badgeId);
                if ($badge) {
                    $existingBadge = \App\Models\UserBadge::where('user_id', $submission->student_id)
                        ->where('badge_id', $badgeId)
                        ->where('project_id', $submission->project_id)
                        ->first();

                    if (!$existingBadge) {
                        \App\Models\UserBadge::create([
                            'user_id' => $submission->student_id,
                            'badge_id' => $badgeId,
                            'awarded_by' => $reviewerId,
                            'project_id' => $submission->project_id,
                            'reason' => 'تقييم مشروع: ' . $submission->project->title,
                            'earned_at' => now(),
                        ]);

                        // إرسال إشعار للطالب عند منح الشارة
                        $student = $submission->student;
                        if ($student && $reviewer) {
                            \App\Jobs\SendBadgeAwardedNotification::dispatch($student, $badge, $reviewer);
                        }
                    }
                }
            }
        }

        // Award points
        if ($data['status'] === 'approved' && $data['rating'] >= 3) {
            $pointsToAdd = (int) ($data['rating'] * 2);
            $submission->student->increment('points', $pointsToAdd);

            \App\Models\Point::create([
                'user_id' => $submission->student_id,
                'points' => $pointsToAdd,
                'type' => 'earned',
                'source' => 'project_submission_rating',
                'source_id' => $submission->id,
                'description' => 'تقييم تسليم مشروع: ' . $submission->project->title,
                'description_ar' => 'تقييم تسليم مشروع: ' . $submission->project->title,
            ]);
        }

        // Send notification (async)
        \App\Jobs\SendProjectEvaluatedNotification::dispatch($submission);

        // Clear cache
        $this->forgetCacheTags([
            "project_{$submission->project_id}",
            "student_submissions_{$submission->student_id}",
            "school_submissions_{$schoolId}",
            "teacher_submissions_{$teacherId}"
        ]);

        return $submission->fresh();
    }
}

