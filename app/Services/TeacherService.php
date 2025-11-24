<?php

namespace App\Services;

use App\Models\Teacher;
use App\Models\Subject;
use Illuminate\Support\Facades\Cache;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

class TeacherService extends BaseService
{
    public function getAllTeachers(
        array $filters = [],
        bool $isAdmin = false,
        int $perPage = 12
    ): LengthAwarePaginator {
        $cacheKey = 'teachers_' . md5(json_encode($filters) . $isAdmin . $perPage);
        $cacheTag = 'teachers';

        return $this->cacheTags($cacheTag, $cacheKey, function () use ($filters, $isAdmin, $perPage) {
            $query = Teacher::query()
                ->with([
                    'user:id,name,email',
                    'subjectsRelation:id,name_ar,name_en'
                ])
                ->select('id', 'user_id', 'name_ar', 'name_en', 'nationality', 'gender', 'bio', 'image', 'subjects', 'stages', 'experience_years', 'city', 'neighborhoods', 'price_per_hour', 'rating', 'reviews_count', 'sessions_count', 'students_count', 'is_active', 'is_verified');

            // Apply filters
            $this->applyTeacherFilters($query, $filters);

            // Apply sorting
            $this->applyTeacherSorting($query, $filters['sort_by'] ?? 'rating', $filters['sort_order'] ?? 'desc');

            // Admin can see all, public only sees active and verified
            if (!$isAdmin) {
                $query->where('is_active', true)->where('is_verified', true);
            }

            return $query->paginate($perPage)
                ->appends($filters)
                ->through(function ($teacher) {
                    return $this->formatTeacherForDisplay($teacher);
                });
        }, 300); // Cache for 5 minutes
    }

    public function getTeacherDetails(int $teacherId, bool $isAdmin = false): ?Teacher
    {
        $cacheKey = "teacher_details_{$teacherId}_{$isAdmin}";
        $cacheTag = "teacher_{$teacherId}";

        return $this->cacheTags($cacheTag, $cacheKey, function () use ($teacherId, $isAdmin) {
            $query = Teacher::with([
                'user:id,name,email,phone',
                'subjectsRelation:id,name_ar,name_en',
                'reviews' => function ($q) {
                    $q->where('is_published', true)
                        ->with('student:id,name,image,city')
                        ->latest()
                        ->limit(10);
                }
            ]);

            if (!$isAdmin) {
                $query->where('is_active', true)->where('is_verified', true);
            }

            return $query->find($teacherId);
        }, 600); // Cache for 10 minutes
    }

    public function getTeacherStats(): array
    {
        $cacheKey = 'teacher_stats';
        $cacheTag = 'teacher_stats';

        return $this->cacheTags($cacheTag, $cacheKey, function () {
            return [
                'total' => Teacher::count(),
                'active' => Teacher::where('is_active', true)->count(),
                'verified' => Teacher::where('is_verified', true)->count(),
                'pending_verification' => Teacher::where('is_verified', false)->where('is_active', true)->count(),
            ];
        }, 300); // Cache for 5 minutes
    }

    private function applyTeacherFilters($query, array $filters): void
    {
        // Subject filter
        if (!empty($filters['subject'])) {
            $subjectValues = is_array($filters['subject']) ? $filters['subject'] : [$filters['subject']];
            $query->where(function ($q) use ($subjectValues) {
                foreach ($subjectValues as $subjectValue) {
                    $subjectName = $this->mapSubjectName($subjectValue);
                    $subjectModel = Subject::where(function ($subQ) use ($subjectName) {
                        $subQ->where('name_ar', $subjectName)
                            ->orWhere('name_en', $subjectName);
                    })->first();

                    $q->orWhere(function ($subQ) use ($subjectModel, $subjectName) {
                        if ($subjectModel) {
                            $subQ->whereHas('subjectsRelation', function ($relQ) use ($subjectModel) {
                                $relQ->where('subjects.id', $subjectModel->id);
                            })->orWhere(function ($jsonQ) use ($subjectName) {
                                $jsonQ->whereRaw('JSON_SEARCH(LOWER(JSON_EXTRACT(subjects, "$")), "one", LOWER(?), NULL, "$[*]") IS NOT NULL', [$subjectName])
                                    ->orWhereRaw('LOWER(JSON_EXTRACT(subjects, "$")) LIKE ?', ['%' . strtolower($subjectName) . '%']);
                            });
                        } else {
                            $subQ->whereRaw('JSON_SEARCH(LOWER(JSON_EXTRACT(subjects, "$")), "one", LOWER(?), NULL, "$[*]") IS NOT NULL', [$subjectName])
                                ->orWhereRaw('LOWER(JSON_EXTRACT(subjects, "$")) LIKE ?', ['%' . strtolower($subjectName) . '%']);
                        }
                    });
                }
            });
        }

        // Stage filter
        if (!empty($filters['stage'])) {
            $stageValues = is_array($filters['stage']) ? $filters['stage'] : [$filters['stage']];
            $query->where(function ($q) use ($stageValues) {
                foreach ($stageValues as $stageValue) {
                    $stageName = $this->mapStageName($stageValue);
                    $q->orWhereRaw('LOWER(JSON_EXTRACT(stages, "$")) LIKE ?', ['%' . strtolower($stageName) . '%']);
                }
            });
        }

        // City filter
        if (!empty($filters['city'])) {
            $cityValues = is_array($filters['city']) ? $filters['city'] : [$filters['city']];
            $query->where(function ($q) use ($cityValues) {
                foreach ($cityValues as $cityValue) {
                    $cityName = $this->mapCityName($cityValue);
                    $q->orWhere('city', $cityName);
                }
            });
        }

        // Price filters
        if (!empty($filters['min_price'])) {
            $query->where('price_per_hour', '>=', (float) $filters['min_price']);
        }
        if (!empty($filters['max_price'])) {
            $query->where('price_per_hour', '<=', (float) $filters['max_price']);
        }

        // Rating filter
        if (!empty($filters['min_rating'])) {
            $query->where('rating', '>=', (float) $filters['min_rating']);
        }

        // Experience filter
        if (!empty($filters['experience'])) {
            $experiences = is_array($filters['experience']) ? $filters['experience'] : [$filters['experience']];
            $query->where(function ($q) use ($experiences) {
                foreach ($experiences as $experience) {
                    if (strpos($experience, '-') !== false) {
                        [$minExp, $maxExp] = explode('-', $experience);
                        $q->orWhereBetween('experience_years', [(int) $minExp, (int) $maxExp]);
                    } elseif (strpos($experience, '+') !== false) {
                        $minExp = (int) str_replace('+', '', $experience);
                        $q->orWhere('experience_years', '>=', $minExp);
                    }
                }
            });
        }

        // Search filter
        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('name_ar', 'like', "%{$search}%")
                    ->orWhere('name_en', 'like', "%{$search}%")
                    ->orWhereHas('user', function ($userQ) use ($search) {
                        $userQ->where('email', 'like', "%{$search}%")
                            ->orWhere('name', 'like', "%{$search}%");
                    });
            });
        }

        // Status filter
        if (!empty($filters['status'])) {
            if ($filters['status'] === 'active') {
                $query->where('is_active', true);
            } elseif ($filters['status'] === 'inactive') {
                $query->where('is_active', false);
            }
        }
    }

    private function applyTeacherSorting($query, string $sortBy, string $sortOrder): void
    {
        switch ($sortBy) {
            case 'price':
                $query->orderBy('price_per_hour', $sortOrder);
                break;
            case 'experience':
                $query->orderBy('experience_years', $sortOrder);
                break;
            case 'rating':
            default:
                $query->orderBy('rating', $sortOrder);
                break;
        }
    }

    private function formatTeacherForDisplay(Teacher $teacher): array
    {
        $subjectsJson = is_array($teacher->subjects) ? $teacher->subjects : json_decode($teacher->subjects ?? '[]', true);
        $stages = is_array($teacher->stages) ? $teacher->stages : json_decode($teacher->stages ?? '[]', true);
        $neighborhoods = is_array($teacher->neighborhoods) ? $teacher->neighborhoods : json_decode($teacher->neighborhoods ?? '[]', true);

        $subjectNames = $teacher->subjectsRelation && $teacher->subjectsRelation->isNotEmpty()
            ? $teacher->subjectsRelation->pluck('name_ar')->toArray()
            : (is_array($subjectsJson) ? $subjectsJson : []);

        return [
            'id' => $teacher->id,
            'name_ar' => $teacher->name_ar,
            'name_en' => $teacher->name_en,
            'nationality' => $teacher->nationality,
            'gender' => $teacher->gender,
            'bio' => $teacher->bio,
            'image' => $teacher->image ? asset('storage/' . $teacher->image) : null,
            'subjects' => $subjectNames,
            'stages' => $stages,
            'experience_years' => $teacher->experience_years,
            'city' => $teacher->city,
            'neighborhoods' => $neighborhoods,
            'price_per_hour' => number_format($teacher->price_per_hour, 0),
            'rating' => round($teacher->rating ?? 0, 1),
            'reviews_count' => $teacher->reviews_count ?? 0,
            'sessions_count' => $teacher->sessions_count ?? 0,
            'students_count' => $teacher->students_count ?? 0,
            'is_verified' => $teacher->is_verified,
            'is_active' => $teacher->is_active,
            'user' => [
                'email' => $teacher->user->email ?? null,
            ],
        ];
    }

    private function mapSubjectName(string $value): string
    {
        $map = [
            'math' => 'رياضيات',
            'physics' => 'فيزياء',
            'chemistry' => 'كيمياء',
            'biology' => 'أحياء',
            'arabic' => 'لغة عربية',
            'english' => 'اللغة الإنجليزية',
        ];
        return $map[$value] ?? $value;
    }

    private function mapStageName(string $value): string
    {
        $map = [
            'primary' => 'الابتدائية',
            'middle' => 'المتوسطة',
            'secondary' => 'الثانوية',
            'university' => 'الجامعية',
        ];
        return $map[$value] ?? $value;
    }

    private function mapCityName(string $value): string
    {
        $map = [
            'riyadh' => 'الرياض',
            'jeddah' => 'جدة',
            'dammam' => 'الدمام',
            'mecca' => 'مكة',
            'medina' => 'المدينة',
            'rabigh' => 'رابغ',
        ];
        return $map[$value] ?? $value;
    }
}

