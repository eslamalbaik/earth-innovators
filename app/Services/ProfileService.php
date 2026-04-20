<?php

namespace App\Services;

use App\Models\ActivityLog;
use App\Models\NotificationPreference;
use App\Models\Project;
use App\Models\Publication;
use App\Models\Subject;
use App\Models\Teacher;
use App\Models\User;
use Carbon\CarbonInterface;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class ProfileService extends BaseService
{
    protected function formatDateYmd(mixed $value): ?string
    {
        if ($value instanceof CarbonInterface) {
            return $value->format('Y-m-d');
        }

        if (is_string($value) && $value !== '') {
            try {
                return Carbon::parse($value)->format('Y-m-d');
            } catch (\Throwable) {
                return null;
            }
        }

        return null;
    }

    public function getProfileData(User $user): array
    {
        $data = [
            'mustVerifyEmail' => $user instanceof MustVerifyEmail,
            'status' => session('status'),
        ];

        if ($user->image) {
            $data['user_image'] = str_starts_with($user->image, 'http')
                ? $user->image
                : Storage::url($user->image);
        }

        if ($user->isAdmin()) {
            $data['institution'] = $user->institution ?? '';
            $data['bio'] = $user->bio ?? '';

            $notificationPreferences = NotificationPreference::where('user_id', $user->id)
                ->get()
                ->keyBy('notification_type')
                ->map(function ($pref) {
                    return $pref->enabled;
                })
                ->toArray();

            $data['notification_preferences'] = [
                'email_notifications' => $notificationPreferences['email_notifications'] ?? true,
                'popup_notifications' => $notificationPreferences['popup_notifications'] ?? true,
                'platform_updates' => $notificationPreferences['platform_updates'] ?? false,
            ];
        }

        if ($user->isTeacher() && $user->teacher) {
            $teacher = $user->teacher;
            $subjects = Subject::where('is_active', true)
                ->select('id', 'name_ar', 'name_en')
                ->get();

            $data['teacher'] = [
                'id' => $teacher->id,
                'name_ar' => $teacher->name_ar,
                'name_en' => $teacher->name_en,
                'nationality' => $teacher->nationality,
                'gender' => $teacher->gender,
                'bio' => $teacher->bio,
                'qualifications' => $teacher->qualifications,
                'subjects' => is_array($teacher->subjects) ? $teacher->subjects : json_decode($teacher->subjects ?? '[]', true),
                'stages' => is_array($teacher->stages) ? $teacher->stages : json_decode($teacher->stages ?? '[]', true),
                'experience_years' => $teacher->experience_years,
                'city' => $teacher->city,
                'neighborhoods' => is_array($teacher->neighborhoods) ? $teacher->neighborhoods : json_decode($teacher->neighborhoods ?? '[]', true),
                'price_per_hour' => $teacher->price_per_hour,
                'image' => $teacher->image ? (str_starts_with($teacher->image, 'http') ? $teacher->image : Storage::url($teacher->image)) : null,
                'is_verified' => $teacher->is_verified,
                'is_active' => $teacher->is_active,
                'education_type' => $teacher->education_type ?? '',
                'curriculum_type' => is_array($teacher->curriculum_type) ? $teacher->curriculum_type : json_decode($teacher->curriculum_type ?? '[]', true),
                'teaching_language' => is_array($teacher->teaching_language) ? $teacher->teaching_language : json_decode($teacher->teaching_language ?? '[]', true),
            ];
            $data['subjects'] = $subjects;
            $data['cities'] = $this->getSaudiCities();
        }

        if ($user->isStudent()) {
            $badges = $user->badges()
                ->select('badges.id', 'badges.name', 'badges.name_ar', 'badges.description', 'badges.description_ar', 'badges.icon', 'badges.image')
                ->get()
                ->map(function ($badge) {
                    return [
                        'id' => $badge->id,
                        'name' => $badge->name,
                        'name_ar' => $badge->name_ar,
                        'description' => $badge->description,
                        'description_ar' => $badge->description_ar,
                        'icon' => $badge->icon,
                        'image' => $badge->image,
                        'earned_at' => $this->formatDateYmd($badge->pivot->earned_at ?? null),
                        'reason' => $badge->pivot->reason,
                    ];
                });
            $data['badges'] = $badges;
        }

        if ($user->isAdmin()) {
            $data['admin_stats'] = $this->getAdminStats($user);
        }

        return $data;
    }

    public function updateProfile(User $user, array $data, ?\Illuminate\Http\UploadedFile $image = null): User
    {
        if ($image) {
            if ($user->image) {
                $oldImagePath = $this->normalizeImagePath($user->image);
                if ($oldImagePath && Storage::disk('public')->exists($oldImagePath)) {
                    Storage::disk('public')->delete($oldImagePath);
                }
            }

            $imagePath = $image->store('user-profiles', 'public');
            $data['image'] = $imagePath;
        }

        $emailChanged = isset($data['email']) && $data['email'] !== $user->email;

        $user->fill($data);
        if ($emailChanged) {
            $user->email_verified_at = null;
        }
        $user->save();

        if (isset($data['image']) && $user->isTeacher()) {
            $teacher = $user->teacher;
            if ($teacher) {
                if ($teacher->image) {
                    $oldTeacherImagePath = $this->normalizeImagePath($teacher->image);
                    if ($oldTeacherImagePath && Storage::disk('public')->exists($oldTeacherImagePath)) {
                        Storage::disk('public')->delete($oldTeacherImagePath);
                    }
                }
                $teacher->update(['image' => $data['image']]);
            }
        }

        if ($user->isTeacher() && isset($data['teacher_data'])) {
            $this->updateTeacherData($user, $data['teacher_data'], $data['teacher_image'] ?? null);
        }

        return $user->fresh();
    }

    public function updateTeacherData(User $user, array $teacherData, ?\Illuminate\Http\UploadedFile $teacherImage = null): void
    {
        $teacher = $user->teacher;
        if (!$teacher) {
            return;
        }

        if ($teacherImage) {
            if ($teacher->image) {
                $oldImagePath = $this->normalizeImagePath($teacher->image);
                if ($oldImagePath && Storage::disk('public')->exists($oldImagePath)) {
                    Storage::disk('public')->delete($oldImagePath);
                }
            }
            $teacherData['image'] = $teacherImage->store('teacher-profiles', 'public');
        }

        foreach (['subjects', 'stages', 'neighborhoods'] as $key) {
            if (isset($teacherData[$key]) && is_array($teacherData[$key])) {
                $teacherData[$key] = json_encode($teacherData[$key]);
            }
        }

        $teacher->update($teacherData);

        if (isset($teacherData['name_ar'])) {
            $user->update(['name' => $teacherData['name_ar']]);
        }
    }

    public function deleteProfile(User $user): void
    {
        if ($user->image) {
            $imagePath = $this->normalizeImagePath($user->image);
            if ($imagePath && Storage::disk('public')->exists($imagePath)) {
                Storage::disk('public')->delete($imagePath);
            }
        }

        if ($user->isTeacher() && $user->teacher?->image) {
            $teacherImagePath = $this->normalizeImagePath($user->teacher->image);
            if ($teacherImagePath && Storage::disk('public')->exists($teacherImagePath)) {
                Storage::disk('public')->delete($teacherImagePath);
            }
        }

        $user->delete();
    }

    private function normalizeImagePath(?string $imagePath): ?string
    {
        if (!$imagePath) {
            return null;
        }

        $path = str_replace('/storage/', '', $imagePath);

        if (str_starts_with($path, 'http')) {
            $parsed = parse_url($path);
            $path = str_replace('/storage/', '', $parsed['path'] ?? '');
        }

        return $path;
    }

    public function getTeacherProfile(int $teacherId): array
    {
        $teacher = Teacher::with('user:id,email,phone')->findOrFail($teacherId);

        $stages = is_array($teacher->stages)
            ? $teacher->stages
            : (is_string($teacher->stages) ? json_decode($teacher->stages, true) ?? [] : []);

        return [
            'id' => $teacher->id,
            'name_ar' => $teacher->name_ar,
            'name_en' => $teacher->name_en,
            'nationality' => $teacher->nationality,
            'gender' => $teacher->gender,
            'bio' => $teacher->bio,
            'qualifications' => $teacher->qualifications,
            'subjects' => is_array($teacher->subjects) ? $teacher->subjects : json_decode($teacher->subjects ?? '[]', true),
            'stages' => $this->normalizeStages($stages),
            'experience_years' => $teacher->experience_years,
            'city' => $teacher->city,
            'neighborhoods' => is_array($teacher->neighborhoods)
                ? $teacher->neighborhoods
                : (is_string($teacher->neighborhoods) ? json_decode($teacher->neighborhoods, true) ?? [] : []),
            'price_per_hour' => $teacher->price_per_hour,
            'image' => $teacher->image,
            'is_verified' => (bool) $teacher->is_verified,
            'is_active' => (bool) $teacher->is_active,
            'email' => $teacher->user?->email,
            'phone' => $teacher->user?->phone,
            'membership_type' => $teacher->membership_type,
            'contract_start_date' => optional($teacher->contract_start_date)?->format('Y-m-d'),
            'contract_end_date' => optional($teacher->contract_end_date)?->format('Y-m-d'),
            'contract_status' => $teacher->contract_status,
        ];
    }

    private function normalizeStages($stages): array
    {
        if (empty($stages)) {
            return [];
        }

        if (is_array($stages)) {
            return array_values(array_filter(array_map(function ($stage) {
                return is_string($stage) ? trim($stage) : null;
            }, $stages), function ($stage) {
                return !empty($stage);
            }));
        }

        if (is_string($stages)) {
            $decoded = json_decode($stages, true);
            if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
                return array_values(array_filter(array_map(function ($stage) {
                    return is_string($stage) ? trim($stage) : null;
                }, $decoded), function ($stage) {
                    return !empty($stage);
                }));
            }
        }

        return [];
    }

    private function getSaudiCities(): array
    {
        return [
            'دبي',
            'أبوظبي',
            'الشارقة',
            'عجمان',
            'رأس الخيمة',
            'أم القيوين',
            'الفجيرة',
            'العين',
            'الظفرة',
            'الغربية',
        ];
    }

    private function getAdminStats(User $user): array
    {
        $activityHours = 0;
        if (DB::getSchemaBuilder()->hasTable('activity_logs')) {
            $activities = ActivityLog::where('user_id', $user->id)
                ->where('created_at', '>=', now()->subMonths(3))
                ->get();

            $activityHours = round($activities->count() * 0.5);
        }

        $publishedArticles = Publication::where('approved_by', $user->id)
            ->where('status', 'approved')
            ->count();

        $reviewedProjects = Project::where('approved_by', $user->id)
            ->where('status', 'approved')
            ->count();

        return [
            'activity_hours' => $activityHours,
            'published_articles' => $publishedArticles,
            'reviewed_projects' => $reviewedProjects,
        ];
    }
}
