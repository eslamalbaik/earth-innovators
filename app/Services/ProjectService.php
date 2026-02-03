<?php

namespace App\Services;

use App\Models\Project;
use App\Models\User;
use App\Repositories\ProjectRepository;
use Illuminate\Support\Facades\Cache;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class ProjectService extends BaseService
{
    public function __construct(
        private ProjectRepository $projectRepository
    ) {}

    public function getApprovedProjects(
        ?string $search = null,
        ?string $category = null,
        ?int $schoolId = null,
        int $perPage = 12
    ): LengthAwarePaginator {
        $cacheKey = "approved_projects_" . md5(json_encode([$search, $category, $schoolId, $perPage]));
        $cacheTag = 'approved_projects';

        return $this->cacheTags($cacheTag, $cacheKey, function () use ($search, $category, $schoolId, $perPage) {
            $query = Project::where('status', 'approved')
                ->with([
                    'teacher:id,name_ar,user_id',
                    'teacher.user:id,name',
                    'user:id,name',
                    'school:id,name',
                    'approver:id,name'
                ])
                ->select('id', 'title', 'description', 'category', 'status', 'teacher_id', 'user_id', 'school_id', 'approved_by', 'views', 'likes', 'rating', 'created_at');

            if ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('title', 'like', "%{$search}%")
                      ->orWhere('description', 'like', "%{$search}%");
                });
            }

            if ($category) {
                $query->where('category', $category);
            }

            if ($schoolId) {
                // إظهار المشاريع المتاحة لمدرسة محددة أو المتاحة لجميع المؤسسات تعليمية
                $query->where(function ($q) use ($schoolId) {
                    $q->where('school_id', $schoolId)
                      ->orWhereNull('school_id');
                });
            } else {
                // إذا لم يتم تحديد مدرسة، عرض جميع المشاريع المعتمدة (بما في ذلك المتاحة لجميع المؤسسات تعليمية)
                // لا حاجة لفلترة إضافية - جميع المشاريع المعتمدة ستظهر
            }

            return $query->latest()->paginate($perPage);
        }, 300); // Cache for 5 minutes
    }

    public function getProjectDetails(int $projectId, ?User $user = null): ?Project
    {
        $cacheKey = "project_details_{$projectId}";
        $cacheTag = "project_{$projectId}";

        $project = $this->cacheTags($cacheTag, $cacheKey, function () use ($projectId) {
            return Project::with([
                'teacher:id,name_ar,user_id',
                'teacher.user:id,name',
                'user:id,name,role',
                'school:id,name',
                'approver:id,name',
                'comments' => function ($query) {
                    $query->with(['user:id,name', 'replies.user:id,name'])
                          ->latest();
                },
            ])
            ->select('id', 'title', 'description', 'category', 'status', 'teacher_id', 'user_id', 'school_id', 'approved_by', 'views', 'likes', 'rating', 'files', 'images', 'created_at')
            ->find($projectId);
        }, 600); // Cache for 10 minutes

        if ($project && $project->status === 'approved') {
            // Increment views (don't cache this)
            $project->increment('views');
            
            // Load submission if user is student
            if ($user && $user->isStudent()) {
                $project->load(['submissions' => function ($query) use ($user) {
                    $query->where('student_id', $user->id)
                          ->with('reviewer:id,name');
                }]);
            }
        }

        return $project;
    }

    public function getStudentProjects(int $userId, ?string $status = null, int $perPage = 20): LengthAwarePaginator
    {
        $cacheKey = "student_projects_{$userId}_" . md5($status ?? '') . "_{$perPage}";
        $cacheTag = "student_projects_{$userId}";

        return $this->cacheTags($cacheTag, $cacheKey, function () use ($userId, $status, $perPage) {
            $query = Project::where('user_id', $userId)
                ->select('id', 'title', 'description', 'category', 'status', 'rating', 'likes', 'views', 'points_earned', 'created_at')
                ->latest();

            if ($status) {
                $query->where('status', $status);
            }

            return $query->paginate($perPage);
        }, 300); // Cache for 5 minutes
    }

    public function getTeacherProjects(int $teacherId, int $perPage = 10): \Illuminate\Pagination\LengthAwarePaginator
    {
        $cacheKey = "teacher_projects_{$teacherId}_{$perPage}";
        $cacheTag = "teacher_projects_{$teacherId}";

        return $this->cacheTags($cacheTag, $cacheKey, function () use ($teacherId, $perPage) {
            return Project::where('teacher_id', $teacherId)
                ->with(['school:id,name', 'approver:id,name', 'user:id,name'])
                ->select('id', 'title', 'description', 'category', 'status', 'school_id', 'approved_by', 'approved_at', 'user_id', 'created_at')
                ->orderBy('created_at', 'desc')
                ->paginate($perPage);
        }, 60); // تقليل وقت الكاش إلى دقيقة واحدة
    }

    public function getSchoolProjects(int $schoolId, ?string $search = null, ?string $status = null, ?string $category = null, int $perPage = 15, bool $includeGlobal = true): \Illuminate\Pagination\LengthAwarePaginator
    {
        $cacheKey = "school_projects_{$schoolId}_" . md5(json_encode([$search, $status, $category, $perPage, $includeGlobal]));
        $cacheTag = "school_projects_{$schoolId}";

        return $this->cacheTags($cacheTag, $cacheKey, function () use ($schoolId, $search, $status, $category, $perPage, $includeGlobal) {
            $query = Project::query();

            if ($schoolId > 0) {
                // Get student IDs
                $studentIds = \App\Models\User::where('school_id', $schoolId)
                    ->where('role', 'student')
                    ->pluck('id')
                    ->toArray();

                $query->where(function ($q) use ($studentIds, $schoolId, $includeGlobal) {
                    $q->whereIn('user_id', $studentIds)
                      ->orWhere(function ($sq) use ($schoolId) {
                          $sq->where('school_id', $schoolId)
                             ->where('user_id', $schoolId);
                      })
                      ->orWhere(function ($tq) use ($schoolId) {
                          $tq->whereNotNull('teacher_id')
                             ->where('school_id', $schoolId);
                      });

                    if ($includeGlobal) {
                        $q->orWhereNull('school_id');
                    }
                });
            } elseif ($includeGlobal) {
                // Or show global projects even if no schoolId
                $query->whereNull('school_id');
            }

            $query->with([
                'user:id,name',
                'teacher:id,name_ar,user_id',
                'teacher.user:id,name'
            ])
            ->select('id', 'title', 'description', 'category', 'status', 'user_id', 'teacher_id', 'created_at');

            if ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('title', 'like', "%{$search}%")
                      ->orWhere('description', 'like', "%{$search}%")
                      ->orWhereHas('user', function ($userQuery) use ($search) {
                          $userQuery->where('name', 'like', "%{$search}%");
                      })
                      ->orWhereHas('teacher', function ($teacherQuery) use ($search) {
                          $teacherQuery->where('name_ar', 'like', "%{$search}%");
                      });
                });
            }

            if ($status) {
                $query->where('status', $status);
            }

            if ($category) {
                $query->where('category', $category);
            }

            return $query->latest()->paginate($perPage);
        }, 300); // Cache for 5 minutes
    }

    public function getSchoolPendingProjects(int $schoolId, ?string $search = null, ?string $category = null, int $perPage = 15): \Illuminate\Pagination\LengthAwarePaginator
    {
        $cacheKey = "school_pending_projects_{$schoolId}_" . md5(json_encode([$search, $category, $perPage]));
        $cacheTag = "school_projects_{$schoolId}";

        return $this->cacheTags($cacheTag, $cacheKey, function () use ($schoolId, $search, $category, $perPage) {
            $query = Project::query();

            if ($schoolId > 0) {
                // Get student IDs
                $studentIds = \App\Models\User::where('school_id', $schoolId)
                    ->where('role', 'student')
                    ->pluck('id')
                    ->toArray();

                $query->where(function ($q) use ($studentIds, $schoolId) {
                    $q->whereIn('user_id', $studentIds)
                      ->orWhere(function ($sq) use ($schoolId) {
                          $sq->whereNotNull('teacher_id')
                             ->where('school_id', $schoolId);
                      });
                });
            }

            $query->where('status', 'pending')
            ->with([
                'user:id,name',
                'teacher:id,name_ar,user_id',
                'teacher.user:id,name',
                'school:id,name'
            ])
            ->select('id', 'title', 'description', 'category', 'status', 'user_id', 'teacher_id', 'school_id', 'created_at');

            if ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('title', 'like', "%{$search}%")
                      ->orWhere('description', 'like', "%{$search}%")
                      ->orWhereHas('user', function ($userQuery) use ($search) {
                          $userQuery->where('name', 'like', "%{$search}%");
                      })
                      ->orWhereHas('teacher', function ($teacherQuery) use ($search) {
                          $teacherQuery->where('name_ar', 'like', "%{$search}%");
                      });
                });
            }

            if ($category) {
                $query->where('category', $category);
            }

            return $query->latest()->paginate($perPage);
        }, 300); // Cache for 5 minutes
    }

    public function clearProjectCache(?int $projectId = null, ?int $userId = null, ?int $teacherId = null, ?int $schoolId = null): void
    {
        $cacheDriver = config('cache.default');
        $supportsTags = in_array($cacheDriver, ['redis', 'memcached']);
        
        if ($projectId) {
            $this->forgetCacheTags(["project_{$projectId}", 'approved_projects']);
            // مسح مباشر للكاش بدون tags
            if (!$supportsTags) {
                \Cache::forget("project_details_{$projectId}");
            }
        }
        
        if ($userId) {
            $this->forgetCacheTags(["student_projects_{$userId}"]);
            // مسح مباشر للكاش بدون tags
            if (!$supportsTags) {
                // مسح جميع مفاتيح الكاش المحتملة
                for ($page = 1; $page <= 10; $page++) {
                    \Cache::forget("student_projects_{$userId}_all_{$page}");
                    \Cache::forget("student_projects_{$userId}_pending_{$page}");
                    \Cache::forget("student_projects_{$userId}_approved_{$page}");
                }
            }
        }

        if ($teacherId) {
            $this->forgetCacheTags(["teacher_projects_{$teacherId}"]);
            // مسح مباشر للكاش بدون tags
            if (!$supportsTags) {
                // مسح جميع مفاتيح الكاش المحتملة للمعلم
                for ($page = 1; $page <= 20; $page++) {
                    \Cache::forget("teacher_projects_{$teacherId}_{$page}");
                }
            }
        }

        if ($schoolId) {
            $this->forgetCacheTags(["school_projects_{$schoolId}"]);
            // مسح مباشر للكاش بدون tags
            if (!$supportsTags) {
                // مسح جميع التوليفات المحتملة من search, status, category
                $searchOptions = [null, ''];
                $statusOptions = [null, '', 'pending', 'approved', 'rejected'];
                $categoryOptions = [null, '', 'science', 'technology', 'engineering', 'mathematics', 'arts', 'other'];
                
                foreach ($searchOptions as $search) {
                    foreach ($statusOptions as $status) {
                        foreach ($categoryOptions as $category) {
                            $cacheKey = "school_projects_{$schoolId}_" . md5(json_encode([$search, $status, $category, 15]));
                            \Cache::forget($cacheKey);
                        }
                    }
                }
                
                // مسح pending projects
                foreach ($searchOptions as $search) {
                    foreach ($categoryOptions as $category) {
                        $cacheKey = "school_pending_projects_{$schoolId}_" . md5(json_encode([$search, $category, 15]));
                        \Cache::forget($cacheKey);
                    }
                }
            }
        }
        
        // مسح كاش المشاريع المعتمدة العامة
        if (!$supportsTags) {
            \Cache::forget('approved_projects_' . md5(json_encode([null, null, null, 12])));
        }
    }
}

