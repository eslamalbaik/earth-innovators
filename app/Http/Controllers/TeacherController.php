<?php

namespace App\Http\Controllers;

use App\Models\Teacher;
use App\Models\Subject;
use App\Models\User;
use App\Services\TeacherService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class TeacherController extends Controller
{
    public function __construct(
        private TeacherService $teacherService
    ) {}

    public function index(Request $request)
    {
        $isAdmin = $request->routeIs('admin.teachers.index');

        $filters = $request->only([
            'subject', 'stage', 'city', 'min_price', 'max_price', 'min_rating',
            'experience', 'price', 'rating', 'sessions', 'search', 'status',
            'sort_by', 'sort_order'
        ]);

        $teachers = $this->teacherService->getAllTeachers($filters, $isAdmin, $isAdmin ? 15 : 12);

        if ($isAdmin) {
            $subjectsLookup = Subject::select('id', 'name_ar', 'name_en')
                ->get()
                ->mapWithKeys(function ($subject) {
                    $label = $subject->name_ar ?? $subject->name_en ?? (string)$subject->id;
                    return [$subject->id => $label];
                })
                ->toArray();

            $teachers->getCollection()->transform(function ($teacher) use ($subjectsLookup) {
                $subjectNames = [];

                if ($teacher->relationLoaded('subjectsRelation') && $teacher->subjectsRelation->isNotEmpty()) {
                    $subjectNames = $teacher->subjectsRelation
                        ->map(function ($subject) {
                            return $subject->name_ar ?? $subject->name_en ?? $subject->name;
                        })
                        ->filter()
                        ->values()
                        ->toArray();
                }

                if (empty($subjectNames)) {
                    $subjectsValues = $teacher->subjects;

                    if (is_string($subjectsValues)) {
                        $decoded = json_decode($subjectsValues, true);
                        if (json_last_error() === JSON_ERROR_NONE) {
                            $subjectsValues = $decoded;
                        }
                    }

                    if (!is_array($subjectsValues) && !empty($subjectsValues)) {
                        $subjectsValues = [$subjectsValues];
                    }

                    if (is_array($subjectsValues)) {
                        foreach ($subjectsValues as $value) {
                            $normalizedValue = $value;

                            if (is_string($value) && is_numeric($value)) {
                                $normalizedValue = (int)$value;
                            }

                            if (is_int($normalizedValue) && isset($subjectsLookup[$normalizedValue])) {
                                $subjectNames[] = $subjectsLookup[$normalizedValue];
                            } elseif (is_string($value) && isset($subjectsLookup[$value])) {
                                $subjectNames[] = $subjectsLookup[$value];
                            } elseif (is_string($value) && trim($value) !== '') {
                                $subjectNames[] = $value;
                            }
                        }
                    }
                }

                $teacher->subjects_display = array_values(array_unique($subjectNames));
                $teacher->rating = (float) $teacher->calculateRating();
                return $teacher;
            });

            $cities = Teacher::whereNotNull('city')
                ->distinct()
                ->orderBy('city')
                ->pluck('city')
                ->toArray();

            return Inertia::render('Admin/Teachers', [
                'teachers' => $teachers,
                'cities' => $cities,
                'filters' => [
                    'search' => $request->get('search', ''),
                    'status' => $request->get('status', ''),
                    'city' => $request->get('city', ''),
                ],
            ]);
        }

        $filters = [];
        foreach (['subject', 'stage', 'city', 'experience', 'price', 'rating', 'sessions', 'search'] as $key) {
            if ($request->has($key)) {
                $value = $request->input($key);
                if (is_array($value)) {
                    $filters[$key] = $value;
                } else {
                    $filters[$key] = $value;
                }
            }
        }

        $filterOptions = Cache::remember('teacher_filter_options_v2', 3600, function () {
            $cities = Teacher::where('is_active', true)
                ->where('is_verified', true)
                ->whereNotNull('city')
                ->select('city', DB::raw('count(*) as count'))
                ->groupBy('city')
                ->orderBy('count', 'desc')
                ->get()
                ->map(function ($item) {
                    $cityMap = [
                        'الرياض' => 'riyadh',
                        'جدة' => 'jeddah',
                        'الدمام' => 'dammam',
                        'مكة' => 'mecca',
                        'المدينة' => 'medina',
                        'رابغ' => 'rabigh',
                    ];
                    return [
                        'value' => $cityMap[$item->city] ?? strtolower(str_replace(' ', '_', $item->city)),
                        'label' => $item->city,
                        'count' => $item->count,
                    ];
                });

            $subjects = Subject::where('is_active', true)
                ->orderBy('name_ar')
                ->get()
                ->map(function ($subject) {
                    $countFromPivot = $subject->teachers()
                        ->where('is_active', true)
                        ->where('is_verified', true)
                        ->count();

                    $countFromJson = Teacher::where('is_active', true)
                        ->where('is_verified', true)
                        ->where(function ($query) use ($subject) {
                            $query->whereRaw('JSON_SEARCH(LOWER(JSON_EXTRACT(subjects, "$")), "one", LOWER(?), NULL, "$[*]") IS NOT NULL', [$subject->name_ar])
                                ->orWhereRaw('JSON_SEARCH(LOWER(JSON_EXTRACT(subjects, "$")), "one", LOWER(?), NULL, "$[*]") IS NOT NULL', [$subject->name_en ?? '']);
                        })
                        ->count();

                    $teacherCount = max($countFromPivot, $countFromJson);

                    $subjectMap = [
                        'رياضيات' => 'math',
                        'فيزياء' => 'physics',
                        'كيمياء' => 'chemistry',
                        'أحياء' => 'biology',
                        'لغة عربية' => 'arabic',
                        'اللغة الإنجليزية' => 'english',
                    ];

                    $value = $subjectMap[$subject->name_ar] ?? strtolower(str_replace(' ', '_', $subject->name_ar));

                    return [
                        'value' => $value,
                        'label' => $subject->name_ar,
                        'count' => $teacherCount,
                    ];
                })
                ->values()
                ->toArray();

            $generalStages = ['الابتدائية', 'المتوسطة', 'الثانوية', 'الجامعية'];

            $stages = collect($generalStages)->map(function ($stage) {
                $stageMap = [
                    'الابتدائية' => 'primary',
                    'المتوسطة' => 'middle',
                    'الثانوية' => 'secondary',
                    'الجامعية' => 'university',
                ];

                $count = Teacher::where('is_active', true)
                    ->where('is_verified', true)
                    ->whereRaw('LOWER(JSON_EXTRACT(stages, "$")) LIKE ?', ['%' . strtolower($stage) . '%'])
                    ->count();

                return [
                    'value' => $stageMap[$stage] ?? strtolower(str_replace(' ', '_', $stage)),
                    'label' => $stage,
                    'count' => $count,
                ];
            })
                ->filter(function ($item) {
                    return $item['count'] > 0;
                })
                ->sortByDesc('count')
                ->values()
                ->toArray();

            $experienceStats = Teacher::where('is_active', true)
                ->where('is_verified', true)
                ->selectRaw('MIN(experience_years) as min_exp, MAX(experience_years) as max_exp')
                ->first();

            $experienceRanges = [];
            if ($experienceStats) {
                $minExp = (int)$experienceStats->min_exp;
                $maxExp = (int)$experienceStats->max_exp;

                $ranges = [
                    ['min' => 1, 'max' => 3, 'value' => '1-3', 'label' => '1-3 سنوات'],
                    ['min' => 3, 'max' => 5, 'value' => '3-5', 'label' => '3-5 سنوات'],
                    ['min' => 5, 'max' => 10, 'value' => '5-10', 'label' => '5-10 سنوات'],
                    ['min' => 10, 'max' => null, 'value' => '10+', 'label' => 'أكثر من 10 سنوات'],
                ];

                foreach ($ranges as $range) {
                    $query = Teacher::where('is_active', true)
                        ->where('is_verified', true);

                    if ($range['max'] !== null) {
                        $query->whereBetween('experience_years', [$range['min'], $range['max']]);
                    } else {
                        $query->where('experience_years', '>=', $range['min']);
                    }

                    $count = $query->count();
                    if ($count > 0) {
                        $experienceRanges[] = [
                            'value' => $range['value'],
                            'label' => $range['label'],
                            'count' => $count,
                        ];
                    }
                }
            }

            $priceStats = Teacher::where('is_active', true)
                ->where('is_verified', true)
                ->selectRaw('MIN(price_per_hour) as min_price, MAX(price_per_hour) as max_price')
                ->first();

            $priceRanges = [];
            if ($priceStats) {
                $minPrice = (int)$priceStats->min_price;
                $maxPrice = (int)$priceStats->max_price;

                $ranges = [
                    ['min' => 0, 'max' => 300, 'value' => '0-300', 'label' => '0-300 ريال'],
                    ['min' => 300, 'max' => 500, 'value' => '300-500', 'label' => '300-500 ريال'],
                    ['min' => 500, 'max' => 1000, 'value' => '500-1000', 'label' => '500-1000 ريال'],
                    ['min' => 1000, 'max' => null, 'value' => '1000+', 'label' => 'أكثر من 1000 ريال'],
                ];

                foreach ($ranges as $range) {
                    $query = Teacher::where('is_active', true)
                        ->where('is_verified', true);

                    if ($range['max'] !== null) {
                        $query->whereBetween('price_per_hour', [$range['min'], $range['max']]);
                    } else {
                        $query->where('price_per_hour', '>=', $range['min']);
                    }

                    $count = $query->count();
                    if ($count > 0) {
                        $priceRanges[] = [
                            'value' => $range['value'],
                            'label' => $range['label'],
                            'count' => $count,
                        ];
                    }
                }
            }

            $ratings = [
                ['value' => '5', 'label' => '5 نجوم'],
                ['value' => '4', 'label' => '4 نجوم وأكثر'],
                ['value' => '3', 'label' => '3 نجوم وأكثر'],
            ];

            foreach ($ratings as &$rating) {
                $count = Teacher::where('is_active', true)
                    ->where('is_verified', true)
                    ->where('rating', '>=', (float)$rating['value'])
                    ->count();
                $rating['count'] = $count;
            }
            $ratings = array_values($ratings);

            $sessionsStats = Teacher::where('is_active', true)
                ->where('is_verified', true)
                ->selectRaw('MIN(sessions_count) as min_sessions, MAX(sessions_count) as max_sessions')
                ->first();

            $sessionRanges = [];
            if ($sessionsStats) {
                $minSessions = (int)$sessionsStats->min_sessions;
                $maxSessions = (int)$sessionsStats->max_sessions;

                $ranges = [
                    ['min' => 0, 'max' => 100, 'value' => '0-100', 'label' => '0-100 حصة'],
                    ['min' => 100, 'max' => 500, 'value' => '100-500', 'label' => '100-500 حصة'],
                    ['min' => 500, 'max' => 1000, 'value' => '500-1000', 'label' => '500-1000 حصة'],
                    ['min' => 1000, 'max' => null, 'value' => '1000+', 'label' => 'أكثر من 1000 حصة'],
                ];

                foreach ($ranges as $range) {
                    $query = Teacher::where('is_active', true)
                        ->where('is_verified', true);

                    if ($range['max'] !== null) {
                        $query->whereBetween('sessions_count', [$range['min'], $range['max']]);
                    } else {
                        $query->where('sessions_count', '>=', $range['min']);
                    }

                    $count = $query->count();
                    if ($count > 0) {
                        $sessionRanges[] = [
                            'value' => $range['value'],
                            'label' => $range['label'],
                            'count' => $count,
                        ];
                    }
                }
            }

            return [
                'cities' => $cities,
                'subjects' => $subjects,
                'stages' => $stages,
                'experienceRanges' => $experienceRanges,
                'priceRanges' => $priceRanges,
                'ratings' => $ratings,
                'sessionRanges' => $sessionRanges,
            ];
        });

        return Inertia::render('Teachers', [
            'teachers' => $teachers,
            'filters' => $filters,
            'filterOptions' => $filterOptions,
        ]);
    }

    public function create()
    {
        $subjects = \App\Models\Subject::all();
        $cities = Teacher::whereNotNull('city')
            ->distinct()
            ->pluck('city')
            ->toArray();

        return Inertia::render('Admin/Teachers/Create', [
            'subjects' => $subjects,
            'cities' => $cities,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name_ar' => 'required|string|max:255',
            'name_en' => 'nullable|string|max:255',
            'email' => 'required|email|unique:users,email',
            'phone' => 'required|string|max:20',
            'password' => 'required|string|min:8|confirmed',
            'nationality' => 'required|string|max:255',
            'bio' => 'nullable|string',
            'qualifications' => 'nullable|string',
            'subjects' => 'required|array|min:1',
            'stages' => 'required|array|min:1',
            'city' => 'required|string|max:255',
            'price_per_hour' => 'required|numeric|min:1',
            'gender' => 'nullable|string',
            'profile_image' => 'nullable|image|max:2048',
            'is_verified' => 'boolean',
            'is_active' => 'boolean',
        ]);

        try {
            DB::beginTransaction();
            $user = User::create([
                'name' => $validated['name_ar'],
                'email' => $validated['email'],
                'phone' => $validated['phone'],
                'password' => Hash::make($validated['password']),
                'role' => 'teacher',
                'email_verified_at' => now(),
            ]);
            $imagePath = null;
            if ($request->hasFile('profile_image')) {
                $imagePath = $request->file('profile_image')->store('teacher-profiles', 'public');
            }
            $teacher = Teacher::create([
                'user_id' => $user->id,
                'name_ar' => $validated['name_ar'],
                'name_en' => $validated['name_en'] ?? null,
                'nationality' => $validated['nationality'],
                'gender' => $validated['gender'] ?? null,
                'bio' => $validated['bio'] ?? null,
                'qualifications' => $validated['qualifications'] ?? null,
                'image' => $imagePath ? Storage::url($imagePath) : null,
                'subjects' => $validated['subjects'],
                'stages' => $validated['stages'],
                'city' => $validated['city'],
                'price_per_hour' => $validated['price_per_hour'],
                'experience_years' => 0,
                'neighborhoods' => [],
                'is_verified' => $validated['is_verified'] ?? false,
                'is_active' => $validated['is_active'] ?? true,
            ]);
            if ($validated['subjects'] && is_array($validated['subjects'])) {
                $teacher->subjectsRelation()->attach($validated['subjects']);
            }

            DB::commit();
            return redirect()->route('admin.teachers.index')
                ->with('success', 'تم إضافة المعلم بنجاح');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'حدث خطأ أثناء إضافة المعلم: ' . $e->getMessage()]);
        }
    }

    public function show(Request $request, string $id)
    {
        $teacher = Teacher::with([
            'user',
            'subjectsRelation',
            'availabilities' => function ($query) {
                $query->where('status', 'available')
                    ->where('date', '>=', now())
                    ->orderBy('date', 'asc')
                    ->orderBy('start_time', 'asc');
            }
        ])->findOrFail($id);

        $page = (int) $request->get('reviews_page', 1);
        $perPage = 4;

        $reviewsQuery = \App\Models\Review::where('teacher_id', $teacher->id)
            ->where('is_published', true)
            ->with('student')
            ->orderBy('created_at', 'desc');

        $totalReviews = $reviewsQuery->count();
        $reviews = $reviewsQuery->skip(0)
            ->take($page * $perPage)
            ->get()
            ->map(function ($review) {
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
                    'rating' => $review->rating,
                    'comment' => $review->comment,
                    'reviewerName' => $reviewerName,
                    'reviewerLocation' => $reviewerLocation,
                    'reviewerImage' => $reviewerImage,
                ];
            });

        $teacher->load('subjectsRelation');

        $subjectsFromRelation = $teacher->subjectsRelation->pluck('name_ar')->toArray();
        $subjectsFromJson = is_array($teacher->subjects) ? $teacher->subjects : json_decode($teacher->subjects ?? '[]', true);

        $allSubjects = array_unique(array_merge($subjectsFromRelation, is_array($subjectsFromJson) ? $subjectsFromJson : []));
        $allSubjects = array_filter($allSubjects, function ($subject) {
            return !empty($subject) && is_string($subject) && strlen($subject) < 100;
        });

        $subjects = array_values($allSubjects);

        $stages = is_array($teacher->stages) ? $teacher->stages : json_decode($teacher->stages ?? '[]', true);
        $stages = is_array($stages) ? array_filter($stages, function ($stage) {
            if (empty($stage) || !is_string($stage)) return false;
            $trimmed = trim($stage);
            if (strlen($trimmed) === 0 || strlen($trimmed) > 50) return false;
            $generalStages = ['الابتدائية', 'المتوسطة', 'الثانوية', 'الجامعية'];
            return in_array($trimmed, $generalStages);
        }) : [];
        $stages = array_values(array_map('trim', $stages));

        $neighborhoods = is_array($teacher->neighborhoods) ? $teacher->neighborhoods : json_decode($teacher->neighborhoods ?? '[]', true);

        $locationParts = [$teacher->city];
        if (is_array($stages) && count($stages) > 0) {
            $locationParts[] = implode(' / ', array_slice($stages, 0, 3));
        }
        $location = implode(' - ', array_filter($locationParts));

        $transformedTeacher = [
            'id' => $teacher->id,
            'name' => $teacher->name_ar,
            'image' => $teacher->image ? asset('storage/' . $teacher->image) : null,
            'rating' => $teacher->calculateRating(),
            'reviewsCount' => $teacher->calculateReviewsCount(),
            'location' => $location,
            'subject' => count($subjects) > 0 ? $subjects[0] : '',
            'subjects' => $subjects,
            'price' => number_format((float) ($teacher->price_per_hour ?? 0), 2),
            'studentsCount' => $teacher->calculateStudentsCount(),
            'sessionsCount' => $teacher->calculateSessionsCount(),
            'experience' => $teacher->experience_years,
            'isVerified' => $teacher->is_verified,
            'bio' => $teacher->bio,
            'experiences' => $this->parseExperiences($teacher->qualifications),
            'certifications' => $this->parseCertifications($teacher->qualifications),
            'reviews' => $reviews,
            'reviewsTotal' => $totalReviews,
            'reviewsPage' => (int) $page,
            'reviewsPerPage' => $perPage,
            'hasMoreReviews' => $totalReviews > ($page * $perPage),
            'availability' => $teacher->availabilities->map(function ($availability) {
                return [
                    'id' => $availability->id,
                    'date' => $availability->date,
                    'start_time' => $availability->start_time,
                    'end_time' => $availability->end_time,
                ];
            }),
        ];

        return Inertia::render('TeacherProfile', [
            'teacher' => $transformedTeacher,
        ]);
    }

    private function parseExperiences($qualifications)
    {
        if (!$qualifications) {
            return [];
        }

        $lines = explode("\n", $qualifications);
        $experiences = [];
        $currentExperience = null;

        foreach ($lines as $line) {
            $line = trim($line);
            if (empty($line)) continue;

            if (preg_match('/^(معلم|أستاذ|مدرب|مدرس)/', $line)) {
                if ($currentExperience) {
                    $experiences[] = $currentExperience;
                }
                $currentExperience = [
                    'title' => $line,
                    'duration' => '',
                    'description' => '',
                ];
            } elseif ($currentExperience && preg_match('/(\d{4}|من|حتى)/', $line)) {
                $currentExperience['duration'] = $line;
            } elseif ($currentExperience) {
                $currentExperience['description'] = $line;
            }
        }

        if ($currentExperience) {
            $experiences[] = $currentExperience;
        }

        return array_values(array_map(function ($index, $exp) {
            $exp['id'] = $index + 1;
            return $exp;
        }, array_keys($experiences), $experiences));
    }

    private function parseCertifications($qualifications)
    {
        if (!$qualifications) {
            return [];
        }

        $lines = explode("\n", $qualifications);
        $certifications = [];
        $index = 0;

        foreach ($lines as $line) {
            $line = trim($line);
            if (empty($line)) continue;

            if (preg_match('/(شهادة|بكالوريوس|دبلوم|ماجستير|دكتوراه)/', $line)) {
                $certifications[] = [
                    'id' => ++$index,
                    'title' => $line,
                    'issuer' => '',
                    'year' => '',
                ];
            } elseif (!empty($certifications) && !preg_match('/^(معلم|أستاذ|مدرب|مدرس)/', $line)) {
                $lastIndex = count($certifications) - 1;
                if (preg_match('/\b(19|20)\d{2}\b/', $line, $matches)) {
                    $certifications[$lastIndex]['year'] = $matches[0];
                } else {
                    $certifications[$lastIndex]['issuer'] = $line;
                }
            }
        }

        return $certifications;
    }

    public function edit(string $id)
    {
        $teacher = Teacher::with(['user', 'subjectsRelation'])->findOrFail($id);
        $subjects = \App\Models\Subject::all();
        $cities = Teacher::whereNotNull('city')
            ->distinct()
            ->pluck('city')
            ->toArray();

        $subjectsLookup = Subject::select('id', 'name_ar', 'name_en')
            ->get()
            ->mapWithKeys(function ($subject) {
                $label = $subject->name_ar ?? $subject->name_en ?? (string)$subject->id;
                return [$subject->id => $label];
            })
            ->toArray();

        $subjectsFromPivot = $teacher->subjectsRelation
            ? $teacher->subjectsRelation
            ->map(function ($subject) {
                return [
                    'id' => $subject->id,
                    'name_ar' => $subject->name_ar,
                    'name_en' => $subject->name_en,
                    'label' => $subject->name_ar ?? $subject->name_en ?? $subject->name ?? '',
                ];
            })
            ->values()
            ->toArray()
            : [];

        $subjectsValues = $teacher->subjects;
        if (is_string($subjectsValues)) {
            $decoded = json_decode($subjectsValues, true);
            if (json_last_error() === JSON_ERROR_NONE) {
                $subjectsValues = $decoded;
            }
        }

        if (!is_array($subjectsValues) && !empty($subjectsValues)) {
            $subjectsValues = [$subjectsValues];
        }

        $subjectNames = collect($subjectsFromPivot)
            ->pluck('label')
            ->filter()
            ->values()
            ->toArray();

        if (empty($subjectNames) && is_array($subjectsValues)) {
            foreach ($subjectsValues as $value) {
                if (is_array($value)) {
                    $label = $value['label'] ?? $value['name_ar'] ?? $value['name_en'] ?? null;
                    if ($label) {
                        $subjectNames[] = $label;
                        continue;
                    }
                }

                if (is_numeric($value)) {
                    $intValue = (int) $value;
                    if (isset($subjectsLookup[$intValue])) {
                        $subjectNames[] = $subjectsLookup[$intValue];
                        continue;
                    }
                }

                if (is_string($value) && isset($subjectsLookup[$value])) {
                    $subjectNames[] = $subjectsLookup[$value];
                    continue;
                }

                if (is_string($value) && trim($value) !== '') {
                    $subjectNames[] = trim($value);
                }
            }
        }

        $subjectNames = array_values(array_unique(array_filter($subjectNames)));

        $teacherData = [
            'id' => $teacher->id,
            'name_ar' => $teacher->name_ar,
            'name_en' => $teacher->name_en,
            'nationality' => $teacher->nationality,
            'gender' => $teacher->gender,
            'bio' => $teacher->bio,
            'qualifications' => $teacher->qualifications,
            'image' => $teacher->image ? asset('storage/' . $teacher->image) : null,
            'subjects' => $subjectNames,
            'subjects_relation' => $subjectsFromPivot,
            'stages' => $teacher->stages ?? [],
            'experience_years' => $teacher->experience_years,
            'city' => $teacher->city,
            'neighborhoods' => $teacher->neighborhoods ?? [],
            'price_per_hour' => $teacher->price_per_hour,
            'rating' => $teacher->calculateRating(),
            'reviews_count' => $teacher->calculateReviewsCount(),
            'sessions_count' => $teacher->calculateSessionsCount(),
            'students_count' => $teacher->calculateStudentsCount(),
            'is_verified' => (bool)$teacher->is_verified,
            'is_active' => (bool)$teacher->is_active,
            'email' => $teacher->user?->email,
            'phone' => $teacher->user?->phone,
            'subjectsRelation' => $subjectsFromPivot,
            'user' => $teacher->user ? [
                'id' => $teacher->user->id,
                'name' => $teacher->user->name,
                'email' => $teacher->user->email,
                'phone' => $teacher->user->phone,
            ] : null,
        ];

        return Inertia::render('Admin/Teachers/Edit', [
            'teacher' => $teacherData,
            'subjects' => $subjects,
            'cities' => $cities,
        ]);
    }

    public function update(Request $request, string $id)
    {
        $teacher = Teacher::with(['user', 'subjectsRelation'])->findOrFail($id);
        $user = $teacher->user;

        $validated = $request->validate([
            'name_ar' => 'sometimes|required|string|max:255',
            'name_en' => 'nullable|string|max:255',
            'nationality' => 'sometimes|required|string|max:255',
            'bio' => 'nullable|string',
            'qualifications' => 'nullable|string',
            'subjects' => 'sometimes|required|array|min:1',
            'stages' => 'sometimes|required|array|min:1',
            'experience_years' => 'sometimes|required|integer|min:0',
            'city' => 'sometimes|required|string|max:255',
            'neighborhoods' => 'sometimes|required|array|min:1',
            'price_per_hour' => 'sometimes|required|numeric|min:0',
            'gender' => 'nullable|string',
            'email' => [
                'sometimes',
                'required',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore(optional($user)->id),
            ],
            'phone' => [
                'sometimes',
                'required',
                'string',
                'max:20',
                Rule::unique('users', 'phone')->ignore(optional($user)->id),
            ],
            'is_verified' => 'sometimes|boolean',
            'is_active' => 'sometimes|boolean',
            'image' => 'nullable|image|max:2048',
        ]);

        $email = $validated['email'] ?? null;
        $phone = $validated['phone'] ?? null;

        if (isset($validated['name_ar']) || $email !== null || $phone !== null) {
            $userData = [];

            if (isset($validated['name_ar'])) {
                $userData['name'] = $validated['name_ar'];
            }

            if ($email !== null) {
                $userData['email'] = $email;
            }

            if ($phone !== null) {
                $userData['phone'] = $phone;
            }

            if (!empty($userData) && $user) {
                $user->update($userData);
            }
        }

        unset($validated['email'], $validated['phone']);

        $validated['is_verified'] = $request->has('is_verified')
            ? $request->boolean('is_verified')
            : $teacher->is_verified;

        $validated['is_active'] = $request->has('is_active')
            ? $request->boolean('is_active')
            : $teacher->is_active;

        $subjectIds = null;
        $previousSubjectIds = $teacher->subjectsRelation
            ->pluck('id')
            ->map(fn($value) => (int) $value)
            ->filter(fn($value) => $value > 0)
            ->values()
            ->toArray();
        if ($request->has('subjects')) {
            $subjectIds = collect($request->input('subjects', []))
                ->filter(fn($value) => $value !== null && $value !== '')
                ->map(fn($value) => (int) $value)
                ->filter(fn($value) => $value > 0)
                ->unique()
                ->values()
                ->toArray();

            $validated['subjects'] = $subjectIds;
        }

        if ($request->has('stages')) {
            $validated['stages'] = collect($request->input('stages', []))
                ->filter(fn($value) => is_string($value) && trim($value) !== '')
                ->map(fn($value) => trim($value))
                ->unique()
                ->values()
                ->toArray();
        }

        if ($request->has('neighborhoods')) {
            $validated['neighborhoods'] = collect($request->input('neighborhoods', []))
                ->filter(fn($value) => is_string($value) && trim($value) !== '')
                ->map(fn($value) => trim($value))
                ->unique()
                ->values()
                ->toArray();
        }

        if ($request->hasFile('image')) {
            if ($teacher->image) {
                $oldImagePath = str_replace('/storage/', '', $teacher->image);
                if (str_starts_with($oldImagePath, 'http')) {
                    $parsed = parse_url($oldImagePath);
                    $oldImagePath = str_replace('/storage/', '', $parsed['path'] ?? '');
                }
                if ($oldImagePath && Storage::disk('public')->exists($oldImagePath)) {
                    Storage::disk('public')->delete($oldImagePath);
                }
            }

            $imagePath = $request->file('image')->store('teacher-profiles', 'public');
            $validated['image'] = $imagePath;

            if ($teacher->user) {
                $user = $teacher->user;
                if ($user->image) {
                    $oldUserImagePath = str_replace('/storage/', '', $user->image);
                    if (str_starts_with($oldUserImagePath, 'http')) {
                        $parsed = parse_url($oldUserImagePath);
                        $oldUserImagePath = str_replace('/storage/', '', $parsed['path'] ?? '');
                    }
                    if ($oldUserImagePath && Storage::disk('public')->exists($oldUserImagePath)) {
                        Storage::disk('public')->delete($oldUserImagePath);
                    }
                }
                $user->update(['image' => $imagePath]);
            }
        }

        $teacher->update($validated);

        if (!is_null($subjectIds)) {
            $teacher->subjectsRelation()->sync($subjectIds);

            $affectedSubjectIds = collect($subjectIds)
                ->merge($previousSubjectIds)
                ->unique()
                ->filter(fn($value) => $value > 0)
                ->values();

            if ($affectedSubjectIds->isNotEmpty()) {
                \App\Models\Subject::whereIn('id', $affectedSubjectIds)
                    ->get()
                    ->each(function ($subject) {
                        $subject->updateTeacherCount();
                    });
            }
        }

        return redirect()->route('admin.teachers.index')
            ->with('success', 'تم تحديث بيانات المعلم بنجاح');
    }

    public function destroy(string $id)
    {
        $teacher = Teacher::findOrFail($id);
        if ($teacher->user) {
            $teacher->user->delete();
        }

        if ($teacher->image) {
            Storage::disk('public')->delete($teacher->image);
        }

        $teacher->delete();

        return redirect()->route('admin.teachers.index')
            ->with('success', 'تم حذف المعلم بنجاح');
    }

    public function verify(Teacher $teacher)
    {
        $teacher->update(['is_verified' => true]);

        return redirect()->back()
            ->with('success', 'تم توثيق المعلم بنجاح');
    }

    public function activate(Teacher $teacher)
    {
        $teacher->update(['is_active' => !$teacher->is_active]);

        return redirect()->back()
            ->with('success', 'تم تحديث حالة المعلم بنجاح');
    }

    public function availabilities(Teacher $teacher)
    {
        session(['acting_teacher_id' => $teacher->id]);

        $availabilities = $teacher->availabilities()
            ->with('subject')
            ->orderBy('date', 'desc')
            ->orderBy('start_time', 'desc')
            ->get()
            ->map(function ($availability) {
                $startTime = $availability->start_time;
                $endTime = $availability->end_time;

                if (is_string($startTime)) {
                    $startTime = \Carbon\Carbon::parse($startTime);
                }

                if (is_string($endTime)) {
                    $endTime = \Carbon\Carbon::parse($endTime);
                }

                return [
                    'id' => $availability->id,
                    'date' => $availability->date instanceof \Carbon\Carbon
                        ? $availability->date->format('Y-m-d')
                        : $availability->date,
                    'start_time' => $startTime instanceof \Carbon\Carbon
                        ? $startTime->format('Y-m-d H:i:s')
                        : $startTime,
                    'end_time' => $endTime instanceof \Carbon\Carbon
                        ? $endTime->format('Y-m-d H:i:s')
                        : $endTime,
                    'status' => $availability->status,
                    'booking_id' => $availability->booking_id,
                    'subject_id' => $availability->subject_id,
                    'subject' => $availability->subject ? [
                        'id' => $availability->subject->id,
                        'name_ar' => $availability->subject->name_ar,
                        'name_en' => $availability->subject->name_en,
                    ] : null,
                ];
            });

        $subjects = $teacher->subjectsRelation()->get()->map(function ($subject) {
            return [
                'id' => $subject->id,
                'name_ar' => $subject->name_ar,
                'name_en' => $subject->name_en,
            ];
        });

        return Inertia::render('Admin/Teachers/Availabilities', [
            'teacher' => $teacher,
            'availabilities' => $availabilities,
            'subjects' => $subjects,
        ]);
    }

    public function storeAvailability(Request $request, Teacher $teacher)
    {
        $validated = $request->validate([
            'date' => 'required|date|after_or_equal:today',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
            'subject_id' => 'nullable|exists:subjects,id',
        ]);

        $subjectId = null;
        if ($request->has('subject_id') && $request->subject_id !== '' && $request->subject_id !== null && $request->subject_id !== 'null') {
            $subjectId = $validated['subject_id'];

            $teachesSubject = $teacher->subjectsRelation()->where('subjects.id', $subjectId)->exists();
            if (!$teachesSubject) {
                return redirect()->back()
                    ->with('error', 'هذا المعلم لا يدرس هذه المادة')
                    ->withInput();
            }
        }

        $startDateTime = \Carbon\Carbon::parse($validated['date'] . ' ' . $validated['start_time']);
        $endDateTime = \Carbon\Carbon::parse($validated['date'] . ' ' . $validated['end_time']);

        $overlapping = \App\Models\TeacherAvailability::where('teacher_id', $teacher->id)
            ->where('date', $validated['date'])
            ->where(function ($query) use ($subjectId) {
                if ($subjectId) {
                    $query->where(function ($q) use ($subjectId) {
                        $q->where('subject_id', $subjectId)
                            ->orWhereNull('subject_id');
                    });
                } else {
                    $query->whereNull('subject_id');
                }
            })
            ->where(function ($query) use ($startDateTime, $endDateTime) {
                $query->whereBetween('start_time', [$startDateTime, $endDateTime])
                    ->orWhereBetween('end_time', [$startDateTime, $endDateTime])
                    ->orWhere(function ($subQ) use ($startDateTime, $endDateTime) {
                        $subQ->where('start_time', '<=', $startDateTime)
                            ->where('end_time', '>=', $endDateTime);
                    });
            })
            ->exists();

        if ($overlapping) {
            return redirect()->back()
                ->with('error', 'هذا الوقت متداخل مع موعد آخر موجود')
                ->withInput();
        }

        $availability = \App\Models\TeacherAvailability::create([
            'teacher_id' => $teacher->id,
            'subject_id' => $subjectId,
            'date' => $validated['date'],
            'start_time' => $startDateTime,
            'end_time' => $endDateTime,
            'status' => 'available',
        ]);

        return redirect()->route('admin.teachers.availabilities', $teacher->id)
            ->with('success', 'تم إضافة الوقت بنجاح');
    }

    public function updateAvailability(Request $request, Teacher $teacher, $id)
    {
        $validated = $request->validate([
            'date' => 'required|date|after_or_equal:today',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
            'subject_id' => 'nullable|exists:subjects,id',
        ]);

        $availability = \App\Models\TeacherAvailability::where('teacher_id', $teacher->id)
            ->where('id', $id)
            ->firstOrFail();

        if ($availability->status === 'booked') {
            return redirect()->back()
                ->with('error', 'لا يمكن تعديل وقت محجوز');
        }

        $subjectId = null;
        if ($request->has('subject_id') && $request->subject_id !== '' && $request->subject_id !== null && $request->subject_id !== 'null') {
            $subjectId = $validated['subject_id'];

            $teachesSubject = $teacher->subjectsRelation()->where('subjects.id', $subjectId)->exists();
            if (!$teachesSubject) {
                return redirect()->back()
                    ->with('error', 'هذا المعلم لا يدرس هذه المادة')
                    ->withInput();
            }
        }

        $startDateTime = \Carbon\Carbon::parse($validated['date'] . ' ' . $validated['start_time']);
        $endDateTime = \Carbon\Carbon::parse($validated['date'] . ' ' . $validated['end_time']);

        $overlapping = \App\Models\TeacherAvailability::where('teacher_id', $teacher->id)
            ->where('id', '!=', $id)
            ->where('date', $validated['date'])
            ->where(function ($query) use ($subjectId) {
                if ($subjectId) {
                    $query->where(function ($q) use ($subjectId) {
                        $q->where('subject_id', $subjectId)
                            ->orWhereNull('subject_id');
                    });
                } else {
                    $query->whereNull('subject_id');
                }
            })
            ->where(function ($query) use ($startDateTime, $endDateTime) {
                $query->whereBetween('start_time', [$startDateTime, $endDateTime])
                    ->orWhereBetween('end_time', [$startDateTime, $endDateTime])
                    ->orWhere(function ($subQ) use ($startDateTime, $endDateTime) {
                        $subQ->where('start_time', '<=', $startDateTime)
                            ->where('end_time', '>=', $endDateTime);
                    });
            })
            ->exists();

        if ($overlapping) {
            return redirect()->back()
                ->with('error', 'هذا الوقت متداخل مع موعد آخر موجود')
                ->withInput();
        }

        $availability->update([
            'date' => $validated['date'],
            'start_time' => $startDateTime,
            'end_time' => $endDateTime,
            'subject_id' => $subjectId,
        ]);

        return redirect()->route('admin.teachers.availabilities', $teacher->id)
            ->with('success', 'تم تحديث الوقت بنجاح');
    }

    public function destroyAvailability(Teacher $teacher, $id)
    {
        $availability = \App\Models\TeacherAvailability::where('teacher_id', $teacher->id)
            ->where('id', $id)
            ->firstOrFail();

        if ($availability->status === 'booked') {
            return redirect()->back()
                ->with('error', 'لا يمكن حذف وقت محجوز');
        }

        $availability->delete();

        return redirect()->route('admin.teachers.availabilities', $teacher->id)
            ->with('success', 'تم حذف الوقت بنجاح');
    }

    public function export()
    {
        $teachers = Teacher::with('user')->get();

        $filename = 'teachers_' . date('Y-m-d_His') . '.csv';
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ];

        $callback = function () use ($teachers) {
            $file = fopen('php://output', 'w');

            fprintf($file, chr(0xEF) . chr(0xBB) . chr(0xBF));

            fputcsv($file, [
                'ID',
                'الاسم العربي',
                'الاسم الإنجليزي',
                'البريد الإلكتروني',
                'الجنسية',
                'الجنس',
                'المواد',
                'المراحل',
                'سنوات الخبرة',
                'المدينة',
                'الأحياء',
                'السعر',
                'التقييم',
                'نشط',
                'موثق',
                'النبذة',
                'المؤهلات'
            ]);

            foreach ($teachers as $teacher) {
                $subjectsValue = $teacher->subjects;
                $subjects = is_array($subjectsValue)
                    ? $subjectsValue
                    : (is_string($subjectsValue) ? json_decode($subjectsValue, true) ?? [] : []);

                $stagesValue = $teacher->stages;
                $stages = is_array($stagesValue)
                    ? $stagesValue
                    : (is_string($stagesValue) ? json_decode($stagesValue, true) ?? [] : []);

                $neighborhoodsValue = $teacher->neighborhoods;
                $neighborhoods = is_array($neighborhoodsValue)
                    ? $neighborhoodsValue
                    : (is_string($neighborhoodsValue) ? json_decode($neighborhoodsValue, true) ?? [] : []);

                fputcsv($file, [
                    $teacher->id,
                    $teacher->name_ar,
                    $teacher->name_en ?? '',
                    $teacher->user->email ?? '',
                    $teacher->nationality ?? '',
                    $teacher->gender ?? '',
                    is_array($subjects) ? implode(', ', $subjects) : '',
                    is_array($stages) ? implode(', ', $stages) : '',
                    $teacher->experience_years,
                    $teacher->city ?? '',
                    is_array($neighborhoods) ? implode(', ', $neighborhoods) : '',
                    $teacher->price_per_hour,
                    $teacher->calculateRating(),
                    $teacher->is_active ? 'نعم' : 'لا',
                    $teacher->is_verified ? 'نعم' : 'لا',
                    $teacher->bio ?? '',
                    $teacher->qualifications ?? ''
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    public function import(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:csv,txt'
        ]);

        $file = $request->file('file');
        $path = $file->getRealPath();

        $data = array_map('str_getcsv', file($path));

        array_shift($data);

        $imported = 0;
        $errors = [];

        foreach ($data as $index => $row) {
            try {
                if (count($row) < 17) {
                    $errors[] = "الصف " . ($index + 2) . ": عدد الأعمدة غير صحيح";
                    continue;
                }

                if (User::where('email', $row[3])->exists()) {
                    $errors[] = "الصف " . ($index + 2) . ": البريد الإلكتروني موجود مسبقاً";
                    continue;
                }

                $user = User::create([
                    'name' => $row[1],
                    'email' => $row[3],
                    'password' => Hash::make('teacher123'),
                    'role' => 'teacher',
                    'email_verified_at' => now(),
                ]);

                $subjects = !empty($row[6]) ? explode(',', $row[6]) : [];
                $stages = !empty($row[7]) ? explode(',', $row[7]) : [];
                $neighborhoods = !empty($row[10]) ? explode(',', $row[10]) : [];

                Teacher::create([
                    'user_id' => $user->id,
                    'name_ar' => $row[1],
                    'name_en' => $row[2] ?? null,
                    'nationality' => $row[4] ?? null,
                    'gender' => $row[5] ?? 'male',
                    'subjects' => json_encode($subjects),
                    'stages' => json_encode($stages),
                    'experience_years' => (int)($row[8] ?? 0),
                    'city' => $row[9] ?? null,
                    'neighborhoods' => json_encode($neighborhoods),
                    'price_per_hour' => (float)($row[11] ?? 0),
                    'bio' => $row[15] ?? null,
                    'qualifications' => $row[16] ?? null,
                    'is_active' => false,
                    'is_verified' => false,
                ]);

                $imported++;
            } catch (\Exception $e) {
                $errors[] = "الصف " . ($index + 2) . ": " . $e->getMessage();
            }
        }

        $message = "تم استيراد {$imported} معلم بنجاح";
        if (!empty($errors)) {
            $message .= ". تم تجاهل " . count($errors) . " صف بسبب الأخطاء.";
        }

        return redirect()->back()->with('success', $message)->with('errors', $errors);
    }
}
