<?php

namespace App\Services;

use App\Models\TeacherApplication;
use App\Models\Teacher;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Pagination\LengthAwarePaginator;

class TeacherApplicationService extends BaseService
{
    public function getAllApplications(?string $status = null, ?string $search = null, int $perPage = 15): LengthAwarePaginator
    {
        $cacheKey = "teacher_applications_" . md5(json_encode([$status, $search, $perPage]));
        $cacheTag = 'teacher_applications';

        return $this->cacheTags($cacheTag, $cacheKey, function () use ($status, $search, $perPage) {
            $query = TeacherApplication::with([
                'user:id,name,email',
                'teacher:id,name_ar,user_id',
                'reviewer:id,name'
            ])
            ->select('id', 'user_id', 'teacher_id', 'status', 'submitted_at', 'reviewed_at', 'reviewed_by', 'notes', 'rejection_reason')
            ->orderBy('submitted_at', 'desc');

            if ($status) {
                $query->where('status', $status);
            }

            if ($search) {
                $query->whereHas('teacher', function ($q) use ($search) {
                    $q->where('name_ar', 'like', "%{$search}%")
                        ->orWhereHas('user', function ($userQuery) use ($search) {
                            $userQuery->where('email', 'like', "%{$search}%");
                        });
                });
            }

            return $query->paginate($perPage);
        }, 300); // Cache for 5 minutes
    }

    public function getApplicationStats(): array
    {
        $cacheKey = "teacher_application_stats";
        $cacheTag = 'teacher_applications';

        return $this->cacheTags($cacheTag, $cacheKey, function () {
            return [
                'total' => TeacherApplication::count(),
                'pending' => TeacherApplication::pending()->count(),
                'under_review' => TeacherApplication::underReview()->count(),
                'approved' => TeacherApplication::approved()->count(),
                'rejected' => TeacherApplication::rejected()->count(),
                'this_month' => TeacherApplication::whereMonth('submitted_at', now()->month)->count(),
                'this_week' => TeacherApplication::whereBetween('submitted_at', [now()->startOfWeek(), now()->endOfWeek()])->count(),
            ];
        }, 300); // Cache for 5 minutes
    }

    public function approveApplication(TeacherApplication $application, ?string $notes = null, int $reviewerId): TeacherApplication
    {
        try {
            DB::beginTransaction();

            $application->update([
                'status' => TeacherApplication::STATUS_APPROVED,
                'reviewed_at' => now(),
                'reviewed_by' => $reviewerId,
                'notes' => $notes,
            ]);

            $teacher = $application->teacher;
            $teacher->update([
                'is_active' => true,
                'is_verified' => true,
            ]);

            $user = $application->user;
            if ($user->role !== 'teacher') {
                $user->update(['role' => 'teacher']);
            }

            DB::commit();

            // Send email (async)
            \App\Jobs\SendTeacherApplicationApprovedEmail::dispatch($teacher);

            // Clear cache
            $this->forgetCacheTags(['teacher_applications']);

            return $application->fresh();
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    public function rejectApplication(TeacherApplication $application, string $rejectionReason, ?string $notes = null, int $reviewerId): TeacherApplication
    {
        try {
            DB::beginTransaction();

            $application->update([
                'status' => TeacherApplication::STATUS_REJECTED,
                'reviewed_at' => now(),
                'reviewed_by' => $reviewerId,
                'rejection_reason' => $rejectionReason,
                'notes' => $notes,
            ]);

            DB::commit();

            // Send email (async)
            \App\Jobs\SendTeacherApplicationRejectedEmail::dispatch($application);

            // Clear cache
            $this->forgetCacheTags(['teacher_applications']);

            return $application->fresh();
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    public function markUnderReview(TeacherApplication $application, ?string $notes = null, int $reviewerId): TeacherApplication
    {
        $application->update([
            'status' => TeacherApplication::STATUS_UNDER_REVIEW,
            'reviewed_by' => $reviewerId,
            'notes' => $notes,
        ]);

        // Clear cache
        $this->forgetCacheTags(['teacher_applications']);

        return $application->fresh();
    }

    public function createApplication(array $data, User $user): TeacherApplication
    {
        try {
            DB::beginTransaction();

            $imagePath = null;
            if (isset($data['profile_image']) && is_file($data['profile_image'])) {
                $imagePath = $data['profile_image']->store('teacher-profiles', 'public');
            }

            $subjects = $data['subjects'] ?? [];
            $stages = $data['stages'] ?? [];
            $experiences = $data['experiences'] ?? [];

            $teacher = Teacher::create([
                'user_id' => $user->id,
                'name_ar' => $data['name'],
                'city' => $data['city'],
                'bio' => $data['bio'] ?? null,
                'image' => $imagePath ? \Storage::url($imagePath) : null,
                'price_per_hour' => $data['price_per_hour'],
                'experience_years' => $this->calculateExperienceYears($experiences),
                'is_active' => true,
                'is_verified' => true,
                'subjects' => $subjects,
                'stages' => $stages,
                'nationality' => $data['nationality'] ?? 'سعودي',
                'neighborhoods' => [],
            ]);

            $application = TeacherApplication::create([
                'user_id' => $user->id,
                'teacher_id' => $teacher->id,
                'status' => TeacherApplication::STATUS_APPROVED,
                'submitted_at' => now(),
                'reviewed_at' => now(),
                'application_data' => json_encode($data),
            ]);

            if ($subjects && is_array($subjects)) {
                $teacher->subjectsRelation()->attach($subjects);
            }

            DB::commit();

            return $application;
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    private function calculateExperienceYears(array $experiences): int
    {
        if (empty($experiences)) {
            return 0;
        }

        $totalYears = 0;
        $currentYear = date('Y');

        foreach ($experiences as $experience) {
            if (!isset($experience['start_date']) || empty($experience['start_date'])) {
                continue;
            }

            $startYear = date('Y', strtotime($experience['start_date']));
            $endYear = isset($experience['still_working']) && $experience['still_working']
                ? $currentYear
                : (isset($experience['end_date']) && !empty($experience['end_date'])
                    ? date('Y', strtotime($experience['end_date']))
                    : $currentYear);

            if ($startYear > 0) {
                $totalYears += max(0, $endYear - $startYear);
            }
        }

        return $totalYears;
    }
}

