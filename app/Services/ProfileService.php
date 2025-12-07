<?php

namespace App\Services;

use App\Models\User;
use App\Models\Teacher;
use App\Models\Subject;
use Illuminate\Support\Facades\Storage;
use Illuminate\Contracts\Auth\MustVerifyEmail;

class ProfileService extends BaseService
{
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

        if ($user->isTeacher() && $user->teacher) {
            $teacher = $user->teacher;
            $subjects = Subject::where('is_active', true)
                ->select('id', 'name_ar', 'name_en')
                ->get();

            $cities = $this->getSaudiCities();

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
            ];
            $data['subjects'] = $subjects;
            $data['cities'] = $cities;
        }

        // Add badges for students
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
                        'earned_at' => $badge->pivot->earned_at?->format('Y-m-d'),
                        'reason' => $badge->pivot->reason,
                    ];
                });
            $data['badges'] = $badges;
        }

        return $data;
    }

    public function updateProfile(User $user, array $data, ?\Illuminate\Http\UploadedFile $image = null): User
    {
        // Handle user image upload
        if ($image) {
            // Delete old image
            if ($user->image) {
                $oldImagePath = $this->normalizeImagePath($user->image);
                if ($oldImagePath && Storage::disk('public')->exists($oldImagePath)) {
                    Storage::disk('public')->delete($oldImagePath);
                }
            }

            $imagePath = $image->store('user-profiles', 'public');
            $data['image'] = $imagePath;
        }

        // Check if email changed
        if (isset($data['email']) && $data['email'] !== $user->email) {
            $data['email_verified_at'] = null;
        }

        $user->fill($data);
        $user->save();

        // Update teacher image if user image was updated
        if (isset($data['image']) && $user->isTeacher()) {
            $teacher = $user->teacher;
            if ($teacher) {
                // Delete old teacher image
                if ($teacher->image) {
                    $oldTeacherImagePath = $this->normalizeImagePath($teacher->image);
                    if ($oldTeacherImagePath && Storage::disk('public')->exists($oldTeacherImagePath)) {
                        Storage::disk('public')->delete($oldTeacherImagePath);
                    }
                }
                $teacher->update(['image' => $data['image']]);
            }
        }

        // Update teacher data if provided
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

        // Handle teacher image upload
        if ($teacherImage) {
            // Delete old image
            if ($teacher->image) {
                $oldImagePath = $this->normalizeImagePath($teacher->image);
                if ($oldImagePath && Storage::disk('public')->exists($oldImagePath)) {
                    Storage::disk('public')->delete($oldImagePath);
                }
            }
            $teacherData['image'] = $teacherImage->store('teacher-profiles', 'public');
        }

        // Encode JSON fields
        foreach (['subjects', 'stages', 'neighborhoods'] as $key) {
            if (isset($teacherData[$key]) && is_array($teacherData[$key])) {
                $teacherData[$key] = json_encode($teacherData[$key]);
            }
        }

        $teacher->update($teacherData);

        // Update user name if teacher name_ar changed
        if (isset($teacherData['name_ar'])) {
            $user->update(['name' => $teacherData['name_ar']]);
        }
    }

    public function deleteProfile(User $user): void
    {
        // Delete user image
        if ($user->image) {
            $imagePath = $this->normalizeImagePath($user->image);
            if ($imagePath && Storage::disk('public')->exists($imagePath)) {
                Storage::disk('public')->delete($imagePath);
            }
        }

        // Delete teacher image
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

        // Remove /storage/ prefix
        $path = str_replace('/storage/', '', $imagePath);

        // Handle full URLs
        if (str_starts_with($path, 'http')) {
            $parsed = parse_url($path);
            $path = str_replace('/storage/', '', $parsed['path'] ?? '');
        }

        return $path;
    }

    public function getTeacherProfile(int $teacherId): array
    {
        $teacher = Teacher::with('user:id,email,phone')
            ->findOrFail($teacherId);

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
            'is_verified' => (bool)$teacher->is_verified,
            'is_active' => (bool)$teacher->is_active,
            'email' => $teacher->user?->email,
            'phone' => $teacher->user?->phone,
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
            'الرياض',
            'جدة',
            'مكة المكرمة',
            'المدينة المنورة',
            'الدمام',
            'الخبر',
            'الظهران',
            'الطائف',
            'بريدة',
            'تبوك',
            'خميس مشيط',
            'الهفوف',
            'حائل',
            'نجران',
            'الجبيل'
        ];
    }
}

