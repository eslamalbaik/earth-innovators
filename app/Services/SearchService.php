<?php

namespace App\Services;

use App\Models\Teacher;
use App\Models\Subject;
use Illuminate\Support\Facades\Cache;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

class SearchService extends BaseService
{
    public function searchTeachers(array $filters, int $perPage = 12): LengthAwarePaginator
    {
        $cacheKey = 'search_teachers_' . md5(json_encode($filters) . $perPage);
        $cacheTag = 'teacher_search';

        return $this->cacheTags($cacheTag, $cacheKey, function () use ($filters, $perPage) {
            $query = Teacher::query()
                ->where('is_active', true)
                ->where('is_verified', true)
                ->with([
                    'user:id,name,email',
                    'subjectsRelation:id,name_ar,name_en',
                    'availabilities' => function ($q) {
                        $q->where('status', 'available')
                            ->where('date', '>=', now()->format('Y-m-d'))
                            ->select('id', 'teacher_id', 'date', 'start_time', 'end_time', 'status')
                            ->orderBy('date')
                            ->orderBy('start_time');
                    }
                ])
                ->select('id', 'user_id', 'name_ar', 'name_en', 'nationality', 'gender', 'bio', 'image', 'subjects', 'stages', 'experience_years', 'city', 'neighborhoods', 'price_per_hour', 'rating', 'reviews_count', 'sessions_count', 'students_count', 'is_verified', 'is_active');

            // Search term
            if (!empty($filters['search'])) {
                $searchTerm = trim($filters['search']);
                $searchWords = $this->extractSearchTerms($searchTerm);

                $query->where(function ($q) use ($searchWords, $searchTerm) {
                    foreach ($searchWords as $word) {
                        $q->where(function ($subQ) use ($word) {
                            $subQ->where('name_ar', 'like', "%{$word}%")
                                ->orWhere('name_en', 'like', "%{$word}%")
                                ->orWhere('bio', 'like', "%{$word}%")
                                ->orWhereRaw('LOWER(JSON_EXTRACT(subjects, "$")) LIKE ?', ['%' . strtolower($word) . '%'])
                                ->orWhereRaw('LOWER(JSON_EXTRACT(stages, "$")) LIKE ?', ['%' . strtolower($word) . '%']);
                        });
                    }

                    $subjectMatch = Subject::where(function ($subQ) use ($searchTerm) {
                        $subQ->where('name_ar', 'like', "%{$searchTerm}%")
                            ->orWhere('name_en', 'like', "%{$searchTerm}%");
                    })->pluck('id');

                    if ($subjectMatch->isNotEmpty()) {
                        $q->orWhereHas('subjectsRelation', function ($relQ) use ($subjectMatch) {
                            $relQ->whereIn('subjects.id', $subjectMatch);
                        });
                    }
                });
            }

            // Filters
            if (!empty($filters['city'])) {
                $query->where('city', $filters['city']);
            }

            if (!empty($filters['subject'])) {
                $subjectName = $filters['subject'];
                $subjectModel = Subject::where(function ($q) use ($subjectName) {
                    $q->where('name_ar', $subjectName)
                        ->orWhere('name_en', $subjectName);
                })->first();

                $query->where(function ($q) use ($subjectModel, $subjectName) {
                    if ($subjectModel) {
                        $q->whereHas('subjectsRelation', function ($relQ) use ($subjectModel) {
                            $relQ->where('subjects.id', $subjectModel->id);
                        })->orWhere(function ($jsonQ) use ($subjectName) {
                            $jsonQ->whereRaw('JSON_SEARCH(LOWER(JSON_EXTRACT(subjects, "$")), "one", LOWER(?), NULL, "$[*]") IS NOT NULL', [$subjectName])
                                ->orWhereRaw('LOWER(JSON_EXTRACT(subjects, "$")) LIKE ?', ['%' . strtolower($subjectName) . '%']);
                        });
                    } else {
                        $q->whereRaw('JSON_SEARCH(LOWER(JSON_EXTRACT(subjects, "$")), "one", LOWER(?), NULL, "$[*]") IS NOT NULL', [$subjectName])
                            ->orWhereRaw('LOWER(JSON_EXTRACT(subjects, "$")) LIKE ?', ['%' . strtolower($subjectName) . '%']);
                    }
                });
            }

            if (!empty($filters['stage'])) {
                $query->whereRaw('LOWER(JSON_EXTRACT(stages, "$")) LIKE ?', ['%' . strtolower($filters['stage']) . '%']);
            }

            if (!empty($filters['min_price'])) {
                $query->where('price_per_hour', '>=', (float) $filters['min_price']);
            }

            if (!empty($filters['max_price'])) {
                $query->where('price_per_hour', '<=', (float) $filters['max_price']);
            }

            if (!empty($filters['min_rating'])) {
                $query->where('rating', '>=', (float) $filters['min_rating']);
            }

            if (!empty($filters['min_experience'])) {
                $query->where('experience_years', '>=', (int) $filters['min_experience']);
            }

            if (!empty($filters['gender'])) {
                $query->where('gender', $filters['gender']);
            }

            if (!empty($filters['neighborhood'])) {
                $query->whereRaw('LOWER(JSON_EXTRACT(neighborhoods, "$")) LIKE ?', ['%' . strtolower($filters['neighborhood']) . '%']);
            }

            // Sorting
            $sortBy = $filters['sort_by'] ?? 'relevance';
            $sortOrder = $filters['sort_order'] ?? 'desc';

            if (!empty($filters['search']) && $sortBy === 'relevance') {
                $searchTerm = $filters['search'];
                $query->selectRaw('teachers.*,
                    CASE 
                        WHEN name_ar LIKE ? THEN 10
                        WHEN name_ar LIKE ? THEN 8
                        WHEN name_en LIKE ? THEN 7
                        WHEN bio LIKE ? THEN 5
                        ELSE 1
                    END as relevance_score', [
                    "{$searchTerm}",
                    "{$searchTerm}%",
                    "%{$searchTerm}%",
                    "%{$searchTerm}%"
                ])->orderBy('relevance_score', 'desc');
            }

            switch ($sortBy) {
                case 'price':
                    $query->orderBy('price_per_hour', $sortOrder);
                    break;
                case 'experience':
                    $query->orderBy('experience_years', $sortOrder);
                    break;
                case 'availability':
                    $query->withCount(['availabilities' => function ($q) {
                        $q->where('status', 'available')
                            ->where('date', '>=', now()->format('Y-m-d'));
                    }])->orderBy('availabilities_count', $sortOrder);
                    break;
                case 'rating':
                default:
                    if (!(!empty($filters['search']) && $sortBy === 'relevance')) {
                        $query->orderBy('rating', $sortOrder);
                    }
                    break;
            }

            $query->orderBy('reviews_count', 'desc');
            $query->orderBy('students_count', 'desc');

            return $query->paginate($perPage)
                ->through(function ($teacher) {
                    $subjectsJson = is_array($teacher->subjects)
                        ? $teacher->subjects
                        : (is_string($teacher->subjects) ? json_decode($teacher->subjects, true) : []);

                    $stages = is_array($teacher->stages)
                        ? $teacher->stages
                        : (is_string($teacher->stages) ? json_decode($teacher->stages, true) : []);

                    $neighborhoods = is_array($teacher->neighborhoods)
                        ? $teacher->neighborhoods
                        : (is_string($teacher->neighborhoods) ? json_decode($teacher->neighborhoods, true) : []);

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
                        'available_slots' => $teacher->availabilities->count(),
                        'user' => [
                            'email' => $teacher->user->email ?? null,
                        ],
                    ];
                });
        }, 300); // Cache for 5 minutes
    }

    public function getSearchSuggestions(string $query): Collection
    {
        if (mb_strlen($query) < 2) {
            return collect([]);
        }

        $cacheKey = 'search_suggestions_' . md5($query);
        $cacheTag = 'search_suggestions';

        return $this->cacheTags($cacheTag, $cacheKey, function () use ($query) {
            $suggestions = collect();
            $searchWords = $this->extractSearchTerms($query);
            $primaryWord = $searchWords[0] ?? $query;

            // Teachers
            $teachers = Teacher::where('is_active', true)
                ->where('is_verified', true)
                ->where(function ($q) use ($primaryWord, $query) {
                    $q->where('name_ar', 'like', "{$primaryWord}%")
                        ->orWhere('name_ar', 'like', "%{$query}%")
                        ->orWhere('name_en', 'like', "{$primaryWord}%")
                        ->orWhere('name_en', 'like', "%{$query}%");
                })
                ->orderByRaw('CASE 
                    WHEN name_ar LIKE ? THEN 1
                    WHEN name_ar LIKE ? THEN 2
                    WHEN name_en LIKE ? THEN 3
                    ELSE 4
                END', ["{$query}%", "%{$query}%", "%{$query}%"])
                ->limit(4)
                ->get(['id', 'name_ar', 'name_en', 'city'])
                ->map(function ($teacher) {
                    return [
                        'type' => 'teacher',
                        'id' => $teacher->id,
                        'text' => $teacher->name_ar,
                        'subtext' => 'معلم' . ($teacher->city ? ' - ' . $teacher->city : ''),
                        'priority' => 1,
                    ];
                });

            $suggestions = $suggestions->merge($teachers);

            // Subjects
            $subjects = Subject::where('is_active', true)
                ->where(function ($q) use ($primaryWord, $query) {
                    $q->where('name_ar', 'like', "{$primaryWord}%")
                        ->orWhere('name_ar', 'like', "%{$query}%")
                        ->orWhere('name_en', 'like', "{$primaryWord}%")
                        ->orWhere('name_en', 'like', "%{$query}%");
                })
                ->orderByRaw('CASE 
                    WHEN name_ar LIKE ? THEN 1
                    WHEN name_ar LIKE ? THEN 2
                    WHEN name_en LIKE ? THEN 3
                    ELSE 4
                END', ["{$query}%", "%{$query}%", "%{$query}%"])
                ->limit(4)
                ->get(['id', 'name_ar', 'name_en', 'teacher_count'])
                ->map(function ($subject) {
                    return [
                        'type' => 'subject',
                        'id' => $subject->id,
                        'text' => $subject->name_ar,
                        'subtext' => 'مادة دراسية' . ($subject->teacher_count ? ' (' . $subject->teacher_count . ' معلم)' : ''),
                        'priority' => 2,
                    ];
                });

            $suggestions = $suggestions->merge($subjects);

            // Cities
            $cities = Teacher::where('is_active', true)
                ->where('city', 'like', "{$primaryWord}%")
                ->orWhere('city', 'like', "%{$query}%")
                ->distinct()
                ->pluck('city')
                ->filter()
                ->take(3)
                ->map(function ($city) {
                    return [
                        'type' => 'city',
                        'id' => $city,
                        'text' => $city,
                        'subtext' => 'مدينة',
                        'priority' => 3,
                    ];
                });

            $suggestions = $suggestions->merge($cities);

            // Stages
            $stages = Teacher::where('is_active', true)
                ->get()
                ->pluck('stages')
                ->flatten()
                ->filter(function ($stage) use ($query) {
                    return mb_stripos($stage, $query) !== false;
                })
                ->unique()
                ->take(3)
                ->map(function ($stage) {
                    return [
                        'type' => 'stage',
                        'id' => $stage,
                        'text' => $stage,
                        'subtext' => 'مرحلة دراسية',
                        'priority' => 4,
                    ];
                });

            $suggestions = $suggestions->merge($stages);

            return $suggestions
                ->sortBy('priority')
                ->take(10)
                ->values()
                ->map(function ($item) {
                    unset($item['priority']);
                    return $item;
                });
        }, 600); // Cache for 10 minutes
    }

    public function getSearchFilters(): array
    {
        $cacheKey = 'search_filters';
        $cacheTag = 'search_filters';

        return $this->cacheTags($cacheTag, $cacheKey, function () {
            $cities = Cache::remember('search_cities', 3600, function () {
                return Teacher::where('is_active', true)
                    ->distinct()
                    ->pluck('city')
                    ->filter()
                    ->sort()
                    ->values();
            });

            $subjects = Cache::remember('search_subjects', 3600, function () {
                return Subject::where('is_active', true)
                    ->select('id', 'name_ar', 'name_en')
                    ->orderBy('sort_order')
                    ->get();
            });

            $stages = Cache::remember('search_stages', 3600, function () {
                return Teacher::where('is_active', true)
                    ->get()
                    ->pluck('stages')
                    ->flatten()
                    ->unique()
                    ->filter()
                    ->sort()
                    ->values();
            });

            return [
                'cities' => $cities,
                'subjects' => $subjects,
                'stages' => $stages,
            ];
        }, 3600); // Cache for 1 hour
    }

    public function getTeacherDetails(int $teacherId): ?array
    {
        $cacheKey = "teacher_details_{$teacherId}";
        $cacheTag = "teacher_{$teacherId}";

        return $this->cacheTags($cacheTag, $cacheKey, function () use ($teacherId) {
            $teacher = Teacher::with([
                'user:id,name,email',
                'reviews' => function ($q) {
                    $q->where('is_published', true)
                        ->with('student:id,name,image,city')
                        ->latest()
                        ->limit(5);
                },
                'availabilities' => function ($q) {
                    $q->where('status', 'available')
                        ->where('date', '>=', now()->format('Y-m-d'))
                        ->select('id', 'teacher_id', 'date', 'start_time', 'end_time', 'status')
                        ->orderBy('date')
                        ->orderBy('start_time');
                }
            ])
                ->where('is_active', true)
                ->where('is_verified', true)
                ->find($teacherId);

            if (!$teacher) {
                return null;
            }

            $qualifications = $teacher->qualifications;
            $experiences = [];
            $certifications = [];

            if ($qualifications) {
                if (preg_match('/الخبرة:\s*(.*?)(?=الشهادات:|$)/s', $qualifications, $matches)) {
                    $expText = trim($matches[1]);
                    $experiences = array_filter(array_map('trim', explode("\n", $expText)));
                }

                if (preg_match('/الشهادات:\s*(.*?)$/s', $qualifications, $matches)) {
                    $certText = trim($matches[1]);
                    $certifications = array_filter(array_map('trim', explode("\n", $certText)));
                }
            }

            return [
                'id' => $teacher->id,
                'name_ar' => $teacher->name_ar,
                'name_en' => $teacher->name_en,
                'nationality' => $teacher->nationality,
                'gender' => $teacher->gender,
                'bio' => $teacher->bio,
                'image' => $teacher->image ? (str_starts_with($teacher->image, 'http') ? $teacher->image : asset('storage/' . $teacher->image)) : null,
                'subjects' => $teacher->subjects,
                'stages' => $teacher->stages,
                'experience_years' => $teacher->experience_years,
                'city' => $teacher->city,
                'neighborhoods' => $teacher->neighborhoods,
                'price_per_hour' => number_format($teacher->price_per_hour, 0),
                'rating' => round($teacher->rating, 1),
                'reviews_count' => $teacher->reviews_count,
                'sessions_count' => $teacher->sessions_count,
                'students_count' => $teacher->students_count,
                'is_verified' => $teacher->is_verified,
                'experiences' => $experiences,
                'certifications' => $certifications,
                'reviews' => $teacher->reviews->map(function ($review) {
                    $reviewerName = $review->student->name ?? $review->reviewer_name ?? 'مجهول';
                    $reviewerLocation = $review->student->city ?? $review->reviewer_location ?? '';

                    $reviewerImage = null;
                    if ($review->student && $review->student->image) {
                        $reviewerImage = str_starts_with($review->student->image, 'http')
                            ? $review->student->image
                            : asset('storage/' . $review->student->image);
                    }

                    return [
                        'id' => $review->id,
                        'reviewer_name' => $reviewerName,
                        'reviewer_location' => $reviewerLocation,
                        'reviewer_image' => $reviewerImage,
                        'rating' => $review->rating,
                        'comment' => $review->comment,
                        'created_at' => $review->created_at ? $review->created_at->format('Y-m-d') : null,
                    ];
                }),
                'availabilities' => $teacher->availabilities->map(function ($availability) {
                    $date = $availability->date;
                    if (is_string($date)) {
                        $date = \Carbon\Carbon::parse($date);
                    }

                    $startTime = $availability->start_time;
                    if (is_string($startTime)) {
                        $startTime = \Carbon\Carbon::createFromTimeString($startTime);
                    }

                    $endTime = $availability->end_time;
                    if (is_string($endTime)) {
                        $endTime = \Carbon\Carbon::createFromTimeString($endTime);
                    }

                    return [
                        'id' => $availability->id,
                        'date' => $date instanceof \Carbon\Carbon ? $date->format('Y-m-d') : $date,
                        'time' => $startTime instanceof \Carbon\Carbon ? $startTime->format('H:i') : $startTime,
                        'end_time' => $endTime instanceof \Carbon\Carbon ? $endTime->format('H:i') : $endTime,
                    ];
                }),
            ];
        }, 600); // Cache for 10 minutes
    }

    private function extractSearchTerms(string $searchTerm): array
    {
        $terms = preg_split('/\s+/', trim($searchTerm));
        return array_filter($terms, function ($term) {
            return mb_strlen($term) >= 2;
        });
    }
}

