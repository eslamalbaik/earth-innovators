<?php

namespace App\Services;

use App\Models\Subject;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Database\Eloquent\Collection;

class SubjectService extends BaseService
{
    public function getActiveSubjects(): Collection
    {
        $cacheKey = 'active_subjects';
        $cacheTag = 'subjects';

        return $this->cacheTags($cacheTag, $cacheKey, function () {
            return Subject::where('is_active', true)
                ->select('id', 'name_ar', 'name_en', 'image', 'description_ar', 'description_en')
                ->orderBy('name_ar')
                ->get()
                ->map(function ($subject) {
                    $teacherCount = $this->getTeacherCountForSubject($subject);
                    $imageUrl = $this->getSubjectImageUrl($subject);

                    return [
                        'id' => $subject->id,
                        'name' => $subject->name_ar,
                        'name_en' => $subject->name_en,
                        'image' => $imageUrl,
                        'teacher_count' => $teacherCount,
                        'description_ar' => $subject->description_ar,
                        'description_en' => $subject->description_en,
                    ];
                });
        }, 3600); // Cache for 1 hour
    }

    public function getAllSubjects(): Collection
    {
        $cacheKey = 'all_subjects';
        $cacheTag = 'subjects';

        return $this->cacheTags($cacheTag, $cacheKey, function () {
            return Subject::select('id', 'name_ar', 'name_en', 'image', 'description_ar', 'description_en', 'is_active', 'sort_order')
                ->orderBy('name_ar')
                ->get()
                ->map(function ($subject) {
                    $teacherCount = $this->getTeacherCountForSubject($subject);
                    $imageUrl = $this->getSubjectImageUrl($subject);

                    return [
                        'id' => $subject->id,
                        'name' => $subject->name_ar,
                        'name_en' => $subject->name_en,
                        'image' => $imageUrl,
                        'teacher_count' => $teacherCount,
                        'description_ar' => $subject->description_ar,
                        'description_en' => $subject->description_en,
                        'is_active' => $subject->is_active,
                        'sort_order' => $subject->sort_order,
                    ];
                });
        }, 3600); // Cache for 1 hour
    }

    private function getTeacherCountForSubject(Subject $subject): int
    {
        // Count from pivot table
        $countFromPivot = $subject->teachers()
            ->where('is_active', true)
            ->where('is_verified', true)
            ->count();

        // Count from JSON field (optimized)
        $countFromJson = DB::table('teachers')
            ->where('is_active', true)
            ->where('is_verified', true)
            ->where(function ($query) use ($subject) {
                $query->whereRaw('JSON_SEARCH(LOWER(JSON_EXTRACT(subjects, "$")), "one", LOWER(?), NULL, "$[*]") IS NOT NULL', [$subject->name_ar])
                    ->orWhereRaw('JSON_SEARCH(LOWER(JSON_EXTRACT(subjects, "$")), "one", LOWER(?), NULL, "$[*]") IS NOT NULL', [$subject->name_en ?? '']);
            })
            ->count();

        return max($countFromPivot, $countFromJson);
    }

    private function getSubjectImageUrl(Subject $subject): string
    {
        if (!$subject->image) {
            return '/images/subjects/default.png';
        }

        if (str_starts_with($subject->image, 'http://') || str_starts_with($subject->image, 'https://')) {
            return $subject->image;
        }

        if (str_starts_with($subject->image, '/storage/') || str_starts_with($subject->image, '/images/')) {
            return $subject->image;
        }

        return asset('storage/' . $subject->image);
    }

    public function createSubject(array $data): Subject
    {
        // Handle image upload
        if (isset($data['image']) && is_file($data['image'])) {
            $data['image'] = $data['image']->store('subjects', 'public');
        }

        $subject = Subject::create($data);

        // Clear cache
        $this->forgetCacheTags(['subjects', 'home_subjects', 'teacher_filter_options_v2']);

        return $subject;
    }

    public function updateSubject(Subject $subject, array $data): Subject
    {
        // Handle image upload
        if (isset($data['image']) && is_file($data['image'])) {
            // Delete old image
            if ($subject->image) {
                \Storage::disk('public')->delete($subject->image);
            }
            $data['image'] = $data['image']->store('subjects', 'public');
        }

        $subject->update($data);

        // Clear cache
        $this->forgetCacheTags(['subjects', 'home_subjects', 'teacher_filter_options_v2']);

        return $subject->fresh();
    }

    public function deleteSubject(Subject $subject): bool
    {
        // Delete image if exists
        if ($subject->image) {
            \Storage::disk('public')->delete($subject->image);
        }

        $deleted = $subject->delete();

        // Clear cache
        $this->forgetCacheTags(['subjects', 'home_subjects', 'teacher_filter_options_v2']);

        return $deleted;
    }
}

