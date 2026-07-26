<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Challenge\StoreChallengeRequest;
use App\Http\Requests\Challenge\UpdateChallengeRequest;
use App\Models\Challenge;
use App\Models\User;
use App\Services\ChallengeService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class AdminChallengeController extends Controller
{
    public function __construct(
        private ChallengeService $challengeService
    ) {}

    public function index(Request $request)
    {
        $challenges = Challenge::select([
            'id', 'title', 'objective', 'description', 'instructions', 
            'challenge_type', 'category', 'age_group', 'difficulty', 'status',
            'school_id', 'created_by', 'start_date', 'deadline',
            'points_reward', 'max_participants', 'current_participants', 'created_at'
        ])
            ->with(['school:id,name', 'creator:id,name'])
            ->when($request->filled('search'), function ($q) use ($request) {
                $search = $request->search;
                $q->where(function ($query) use ($search) {
                    $query->where('title', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%")
                        ->orWhereHas('school', function ($schoolQuery) use ($search) {
                            $schoolQuery->where('name', 'like', "%{$search}%");
                        });
                });
            })
            ->when($request->filled('status'), function ($q) use ($request) {
                $q->where('status', $request->status);
            })
            ->when($request->filled('category'), function ($q) use ($request) {
                $q->where('category', $request->category);
            })
            ->when($request->filled('challenge_type'), function ($q) use ($request) {
                $q->where('challenge_type', $request->challenge_type);
            })
            ->latest('created_at')
            ->paginate(20)
            ->withQueryString()
            ->through(function ($challenge) {
                return [
                    'id' => $challenge->id,
                    'title' => $challenge->title,
                    'objective' => $challenge->objective,
                    'description' => $challenge->description,
                    'instructions' => $challenge->instructions,
                    'challenge_type' => $challenge->challenge_type,
                    'challenge_type_label' => $challenge->challenge_type_label,
                    'category' => $challenge->category,
                    'age_group' => $challenge->age_group,
                    'difficulty' => $challenge->difficulty ?? 'medium',
                    'status' => $challenge->status,
                    'school_id' => $challenge->school_id,
                    'school_name' => $challenge->school->name ?? 'غير محدد',
                    'creator_name' => $challenge->creator->name ?? 'غير معروف',
                    'start_date' => $challenge->start_date->format('Y-m-d H:i'),
                    'deadline' => $challenge->deadline->format('Y-m-d H:i'),
                    'points_reward' => $challenge->points_reward ?? 0,
                    'max_participants' => $challenge->max_participants,
                    'current_participants' => $challenge->current_participants ?? 0,
                    'created_at' => $challenge->created_at->format('Y-m-d H:i'),
                ];
            });

        $stats = \Illuminate\Support\Facades\Cache::remember('admin_challenge_stats', 300, function () {
            return [
                'total' => Challenge::count(),
                'active' => Challenge::where('status', 'active')->count(),
                'draft' => Challenge::where('status', 'draft')->count(),
                'completed' => Challenge::where('status', 'completed')->count(),
                'cancelled' => Challenge::where('status', 'cancelled')->count(),
            ];
        });

        $schools = [];
        if (!$request->has('only') || in_array('schools', explode(',', $request->get('only')))) {
            $schools = User::where('role', 'school')
                ->select('id', 'name')
                ->orderBy('name')
                ->get();
        }

        $analytics = [];
        if (!$request->has('only') || in_array('analytics', explode(',', $request->get('only')))) {
            $analytics = \Illuminate\Support\Facades\Cache::remember('admin_challenge_analytics', 300, function () {
                return [
                    'total_challenges' => Challenge::count(),
                    'total_participants' => \App\Models\ChallengeSubmission::distinct('student_id')->count(),
                    'completed_submissions' => \App\Models\ChallengeSubmission::where('status', 'completed')->count(),
                ];
            });
        }

        return Inertia::render('Admin/Challenges/Index', [
            'challenges' => $challenges,
            'stats' => $stats,
            'filters' => $request->only(['search', 'status', 'category', 'challenge_type']),
            'schools' => $schools,
            'analytics' => $analytics,
        ]);
    }

    /**
     * عرض نموذج إنشاء تحدٍ جديد
     */
    public function create()
    {
        $schools = User::where('role', 'school')
            ->select('id', 'name')
            ->orderBy('name')
            ->get();

        return Inertia::render('Admin/Challenges/Create', [
            'schools' => $schools,
        ]);
    }

    /**
     * توليد أفكار وتفاصيل التحدي بالذكاء الاصطناعي
     */
    public function generate(Request $request, \App\Services\AIEngine\DeepSeekClient $deepSeekClient)
    {
        $request->validate([
            'idea' => 'required|string|max:500',
        ]);

        $idea = $request->input('idea');

        try {
            $aiResponse = $deepSeekClient->chatWithJson([
                \App\Services\AIEngine\DeepSeekClient::systemMessage(
                    'أنت خبير في تصميم التحديات والمسابقات التعليمية والابتكارية للطلاب. '
                    . 'بناءً على الفكرة أو الوصف القصير الذي يقدمه المستخدم، قم بإنشاء تفاصيل تحدي كاملة ومحفزة. '
                    . 'قم باختيار إحدى الفئات التالية حصراً: science, technology, engineering, mathematics, arts, other. '
                    . 'اقترح أيضاً كلمة مفتاحية واحدة باللغة الإنجليزية للبحث عن صورة غلاف من Unsplash. '
                    . 'هام جداً للتنسيق: استخدم فقرات واضحة ومسافات أسطر (Newlines) لتنسيق النصوص بشكل جميل، ولا تستخدم وسوم HTML إطلاقاً لأن النص سيعرض في حقل نصي عادي. '
                    . 'أجب بصيغة JSON فقط مع الحقول التالية، ولا تترك أياً منها فارغاً: '
                    . 'title (عنوان احترافي وجذاب للتحدي بالعربية), '
                    . 'objective (الهدف التعليمي أو الابتكاري المحدد لهذا التحدي، جملة أو جملتين بالعربية), '
                    . 'description (وصف مفصل وشامل ومحفز للتحدي كنص عادي منسق بأسطر واضحة، يشمل الأهداف والمعايير), '
                    . 'instructions (خطوات تنفيذ التحدي بالتفصيل للطالب، كنص عادي منسق بأسطر واضحة), '
                    . 'category (إحدى الفئات المسموحة فقط باللغة الإنجليزية), '
                    . 'image_keyword (كلمة مفتاحية واحدة بالإنجليزية).'
                ),
                \App\Services\AIEngine\DeepSeekClient::userMessage("فكرة التحدي: " . $idea),
            ]);

            if (!$aiResponse) {
                return response()->json(['error' => 'فشل في توليد تفاصيل التحدي من الذكاء الاصطناعي.'], 500);
            }

            // Fallbacks for structure
            $title = $aiResponse['title'] ?? 'تحدي جديد';
            $objective = trim($aiResponse['objective'] ?? '');
            $description = $aiResponse['description'] ?? $idea;
            $instructions = trim($aiResponse['instructions'] ?? '');
            $category = $aiResponse['category'] ?? 'other';
            $keyword = $aiResponse['image_keyword'] ?? 'education challenge';

            // Validate category against the same enum enforced by StoreChallengeRequest
            $allowedCategories = ['science', 'technology', 'engineering', 'mathematics', 'arts', 'other'];
            if (!in_array(strtolower($category), $allowedCategories)) {
                $category = 'other';
            }

            // Fields the AI failed to populate, so the frontend can flag them
            $incompleteFields = array_keys(array_filter([
                'objective' => $objective === '',
                'instructions' => $instructions === '',
            ]));

            // Fetch image from Unsplash
            $imageUrl = null;
            $unsplashAccessKey = config('services.unsplash.access_key');
            if ($unsplashAccessKey) {
                $unsplashResponse = \Illuminate\Support\Facades\Http::get('https://api.unsplash.com/search/photos', [
                    'query' => $keyword,
                    'client_id' => $unsplashAccessKey,
                    'per_page' => 1,
                    'orientation' => 'landscape'
                ]);

                if ($unsplashResponse->successful()) {
                    $results = $unsplashResponse->json('results');
                    if (!empty($results)) {
                        $imageUrl = $results[0]['urls']['regular'] ?? null;
                    }
                }
            }

            return response()->json([
                'title' => $title,
                'objective' => $objective,
                'description' => $description,
                'instructions' => $instructions,
                'category' => strtolower($category),
                'image_url' => $imageUrl,
                'incomplete_fields' => $incompleteFields,
            ]);

        } catch (\Exception $e) {
            \Log::error('Error generating AI challenge (admin): ' . $e->getMessage());
            return response()->json(['error' => 'حدث خطأ غير متوقع أثناء توليد تفاصيل التحدي.'], 500);
        }
    }

    /**
     * حفظ تحدٍ جديد
     */
    public function store(StoreChallengeRequest $request)
    {
        try {
            $data = $request->validated();
            
            Log::info('Admin challenge store - validated data', [
                'data_keys' => array_keys($data),
                'has_image' => isset($data['image']),
                'image_type' => isset($data['image']) ? gettype($data['image']) : null,
            ]);
            
            $data['created_by'] = auth()->id();
            $data['status'] = $data['status'] ?? 'draft';
            $data['difficulty'] = $data['difficulty'] ?? 'medium';
            $data['current_participants'] = 0;
            
            $data = $this->normalizeChallengeDates($data);
            
            // Handle nullable fields
            if (isset($data['max_participants']) && ($data['max_participants'] === '' || $data['max_participants'] === null)) {
                $data['max_participants'] = null;
            }
            
            if (isset($data['school_id']) && ($data['school_id'] === '' || $data['school_id'] === null)) {
                $data['school_id'] = null;
            }
            
            // Ensure points_reward is set
            if (!isset($data['points_reward']) || $data['points_reward'] === '') {
                $data['points_reward'] = 0;
            }

            // Handle image - keep it as is, service will handle it
            if (isset($data['image']) && empty($data['image']) && !($data['image'] instanceof \Illuminate\Http\UploadedFile)) {
                unset($data['image']);
            }

            Log::info('Admin challenge store - calling service', [
                'data_keys' => array_keys($data),
            ]);

            $challenge = $this->challengeService->createChallenge($data);

            \Illuminate\Support\Facades\Cache::forget('admin_challenge_stats');
            \Illuminate\Support\Facades\Cache::forget('admin_challenge_analytics');
            
            Log::info('Admin challenge created successfully', [
                'challenge_id' => $challenge->id,
                'school_id' => $challenge->school_id,
                'title' => $challenge->title,
                'status' => $challenge->status,
            ]);

            return redirect()
                ->route('admin.challenges.index')
                ->with('success', 'تم إنشاء التحدي بنجاح');
        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('Validation error creating admin challenge', [
                'errors' => $e->errors(),
            ]);
            return back()
                ->withErrors($e->errors())
                ->withInput();
        } catch (\Exception $e) {
            Log::error('Error creating admin challenge', [
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString(),
                'data' => $request->except(['image']), // Don't log file data
            ]);

            return back()
                ->withErrors(['error' => 'حدث خطأ أثناء إنشاء التحدي: ' . $e->getMessage()])
                ->withInput();
        }
    }

    public function show(Challenge $challenge)
    {
        $challenge->load(['school:id,name,email', 'creator:id,name,email', 'participants.user:id,name,email']);

        $assignedStudents = $challenge->participants->map(function ($participation) {
            return [
                'id' => $participation->user_id,
                'name' => $participation->user->name ?? 'غير معروف',
                'email' => $participation->user->email ?? '',
                'participation_type' => $participation->participation_type ?? 'optional',
            ];
        });

        return Inertia::render('Admin/Challenges/Show', [
            'challenge' => [
                'id' => $challenge->id,
                'title' => $challenge->title,
                'objective' => $challenge->objective,
                'description' => $challenge->description,
                'instructions' => $challenge->instructions,
                'challenge_type' => $challenge->challenge_type,
                'challenge_type_label' => $challenge->challenge_type_label,
                'category' => $challenge->category,
                'age_group' => $challenge->age_group,
                'difficulty' => $challenge->difficulty ?? 'medium',
                'status' => $challenge->status,
                'school_id' => $challenge->school_id,
                'school' => $challenge->school ? [
                    'id' => $challenge->school->id,
                    'name' => $challenge->school->name,
                    'email' => $challenge->school->email,
                ] : null,
                'creator' => [
                    'id' => $challenge->creator->id ?? null,
                    'name' => $challenge->creator->name ?? 'غير معروف',
                    'email' => $challenge->creator->email ?? '—',
                ],
                'start_date' => $challenge->start_date->format('Y-m-d\TH:i'),
                'deadline' => $challenge->deadline->format('Y-m-d\TH:i'),
                'points_reward' => $challenge->points_reward ?? 0,
                'badges_reward' => $challenge->badges_reward ?? [],
                'max_participants' => $challenge->max_participants,
                'current_participants' => $challenge->current_participants ?? 0,
                'assigned_students' => $assignedStudents,
                'created_at' => $challenge->created_at->format('Y-m-d H:i'),
                'updated_at' => $challenge->updated_at->format('Y-m-d H:i'),
            ],
        ]);
    }

    /**
     * عرض نموذج تعديل تحدٍ
     */
    public function edit(Challenge $challenge)
    {
        $schools = User::where('role', 'school')
            ->select('id', 'name')
            ->orderBy('name')
            ->get();

        return Inertia::render('Admin/Challenges/Edit', [
            'challenge' => [
                'id' => $challenge->id,
                'title' => $challenge->title,
                'objective' => $challenge->objective,
                'description' => $challenge->description,
                'instructions' => $challenge->instructions,
                'challenge_type' => $challenge->challenge_type,
                'category' => $challenge->category,
                'age_group' => $challenge->age_group,
                'difficulty' => $challenge->difficulty ?? 'medium',
                'status' => $challenge->status,
                'school_id' => $challenge->school_id,
                'image' => $challenge->image,
                'image_url' => $challenge->image_url,
                'start_date' => $challenge->start_date->format('Y-m-d\TH:i'),
                'deadline' => $challenge->deadline->format('Y-m-d\TH:i'),
                'points_reward' => $challenge->points_reward ?? 0,
                'max_participants' => $challenge->max_participants,
            ],
            'schools' => $schools,
        ]);
    }

    public function update(UpdateChallengeRequest $request, Challenge $challenge)
    {
        $data = $request->validated();
        
        $data = $this->normalizeChallengeDates($data);
        
        if (isset($data['max_participants']) && $data['max_participants'] === '') {
            $data['max_participants'] = null;
        }

        try {
            $this->challengeService->updateChallenge($challenge, $data);
            \Illuminate\Support\Facades\Cache::forget('admin_challenge_stats');
            \Illuminate\Support\Facades\Cache::forget('admin_challenge_analytics');
            
            if ($request->wantsJson()) {
                return response()->json(['message' => 'تم تحديث التحدي بنجاح']);
            }

            return redirect()
                ->route('admin.challenges.index')
                ->with('success', 'تم تحديث التحدي بنجاح');
        } catch (\Exception $e) {
            Log::error('Error updating admin challenge: ' . $e->getMessage(), [
                'challenge_id' => $challenge->id,
                'trace' => $e->getTraceAsString(),
            ]);

            return back()
                ->withErrors(['error' => 'حدث خطأ أثناء تحديث التحدي: ' . $e->getMessage()])
                ->withInput();
        }
    }

    public function destroy(Challenge $challenge)
    {
        try {
            $schoolId = $challenge->school_id;
            $createdBy = $challenge->created_by;
            
            $this->challengeService->deleteChallenge($challenge);
            
            \Illuminate\Support\Facades\Cache::forget('admin_challenge_stats');
            \Illuminate\Support\Facades\Cache::forget('admin_challenge_analytics');

            if (request()->wantsJson() || request()->header('X-Inertia')) {
                return back()->with('success', 'تم حذف التحدي بنجاح');
            }

            return redirect()
                ->route('admin.challenges.index')
                ->with('success', 'تم حذف التحدي بنجاح');
        } catch (\Exception $e) {
            Log::error('Error deleting admin challenge: ' . $e->getMessage(), [
                'challenge_id' => $challenge->id,
                'trace' => $e->getTraceAsString(),
            ]);

            return back()
                ->withErrors(['error' => 'حدث خطأ أثناء حذف التحدي: ' . $e->getMessage()]);
        }
    }

    private function normalizeChallengeDates(array $data): array
    {
        if (isset($data['start_date'])) {
            $data['start_date'] = $this->normalizeChallengeDate($data['start_date'], '00:00:00');
        }

        if (isset($data['deadline'])) {
            $data['deadline'] = $this->normalizeChallengeDate($data['deadline'], '23:59:59');
        }

        return $data;
    }

    private function normalizeChallengeDate(string $value, string $dateOnlyTime): string
    {
        $value = trim($value);

        if (preg_match('/^\d{4}-\d{2}-\d{2}$/', $value)) {
            $value .= ' ' . $dateOnlyTime;
        } else {
            $value = str_replace('T', ' ', $value);
        }

        return Carbon::parse($value)->format('Y-m-d H:i:s');
    }
}
