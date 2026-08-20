<?php

namespace App\Http\Controllers\School;

use App\Http\Controllers\Controller;
use App\Http\Requests\Challenge\StoreChallengeRequest;
use App\Http\Requests\Challenge\UpdateChallengeRequest;
use App\Models\Challenge;
use App\Services\ChallengeService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class SchoolChallengeController extends Controller
{
    public function __construct(
        private ChallengeService $challengeService
    ) {}

    /**
     * عرض قائمة تحديات المدرسة
     */
    public function index(Request $request): Response
    {
        $user = Auth::user();

        // التحقق من أن المستخدم لديه صلاحية المدرسة
        if (!$user || !$user->isSchool()) {
            abort(403, __('messages.msg_134'));
        }

        $challenges = $this->challengeService->getSchoolChallenges(
            $user->canAccessAllSchoolData() ? 0 : $user->id,
            $request->get('status'),
            10
        );

        $stats = $this->challengeService->getSchoolChallengeStats($user->canAccessAllSchoolData() ? 0 : $user->id);

        // Check if viewing submissions for a specific challenge
        $challengeId = $request->get('challenge_id');
        $selectedChallenge = null;
        $submissions = null;

        if ($challengeId) {
            $selectedChallengeQuery = \App\Models\Challenge::where('id', $challengeId);
            if (!$user->canAccessAllSchoolData()) {
                $selectedChallengeQuery->where('school_id', $user->id);
            }
            $selectedChallenge = $selectedChallengeQuery->first();

            if ($selectedChallenge) {
                $submissionService = app(\App\Services\ChallengeSubmissionService::class);
                $submissions = $submissionService->getChallengeSubmissions(
                    $challengeId,
                    $request->get('submission_status'),
                    15
                )->withQueryString();
            }
        }

        return Inertia::render('School/Challenges/Index', [
            'challenges' => $challenges,
            'stats' => $stats,
            'filters' => [
                'status' => $request->status,
                'submission_status' => $request->get('submission_status'),
            ],
            'selectedChallenge' => $selectedChallenge,
            'submissions' => $submissions,
            'auth' => [
                'user' => $user,
            ],
        ]);
    }

    /**
     * عرض نموذج إنشاء تحدّي جديد
     */
    public function create(): Response
    {
        $user = Auth::user();
        return Inertia::render('School/Challenges/Create', [
            'auth' => [
                'user' => $user,
            ],
        ]);
    }

    /**
     * توليد أفكار وتفاصيل التحدي بالذكاء الاصطناعي
     */
    public function generate(Request $request, \App\Services\AIEngine\GeminiClient $deepSeekClient)
    {
        $request->validate([
            'idea' => 'required|string|max:500',
        ]);

        $idea = $request->input('idea');

        // توليد التحدي قد يستغرق حتى 360 ثانية (4 محاولات × 90 ثانية) بسبب إعادة المحاولة التلقائية
        // في GeminiClient، بينما max_execution_time الافتراضي على السيرفر 30 ثانية فقط.
        set_time_limit(300);

        try {
            $aiResponse = $deepSeekClient->chatWithJson([
                \App\Services\AIEngine\GeminiClient::systemMessage(
                    'أنت خبير في تصميم التحديات والمسابقات التعليمية والابتكارية للطلاب. '
                    . 'بناءً على الفكرة أو الوصف القصير الذي تقدمه المدرسة، قم بإنشاء تفاصيل تحدي كاملة ومحفزة. '
                    . 'قم باختيار إحدى الفئات التالية حصراً: science, technology, engineering, mathematics, arts, other. '
                    . 'اقترح أيضاً كلمة مفتاحية واحدة باللغة الإنجليزية للبحث عن صورة غلاف من Unsplash. '
                    . 'هام جداً للتنسيق: استخدم فقرات واضحة ومسافات أسطر (Newlines) لتنسيق النصوص بشكل جميل، ولا تستخدم وسوم HTML إطلاقاً لأن النص سيعرض في حقل نصي عادي. '
                    . 'أجب بصيغة JSON فقط مع الحقول التالية، ولا تترك أياً منها فارغاً: '
                    . 'title (عنوان احترافي وجذاب للتحدي بالعربية), '
                    . 'objective (الهدف التعليمي أو الابتكاري المحدد لهذا التحدي، جملة أو جملتين بالعربية), '
                    . 'description (وصف مفصل وشامل ومحفز للتحدي كنص عادي منسق بأسطر واضحة، يشمل الأهداف والمعايير), '
                    . 'instructions (خطوات تنفيذ التحدي بالتفصيل للطالب، كنص عادي منسق بأسطر واضحة), '
                    . 'category (إحدى الفئات المسموحة فقط باللغة الإنجليزية), '
                    . 'image_keyword (كلمة مفتاحية واحدة بالإنجليزية), '
                    . 'criteria (مصفوفة من 3 إلى 5 معايير تقييم مبنية على محتوى التحدي تحديداً، كل عنصر فيها كائن يحتوي على name_ar (اسم معيار قصير بالعربية) وweight (وزن رقمي)، بحيث يكون مجموع كل الأوزان يساوي 100 بالضبط).'
                ),
                \App\Services\AIEngine\GeminiClient::userMessage("فكرة التحدي: " . $idea),
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

            // معايير التقييم المقترحة، مربوطة بمحتوى التحدي تحديداً (وليست قائمة عامة ثابتة)
            $suggestedCriteria = collect($aiResponse['criteria'] ?? [])
                ->filter(fn ($c) => !empty($c['name_ar']))
                ->map(fn ($c) => [
                    'name_ar' => (string) $c['name_ar'],
                    'weight' => (float) ($c['weight'] ?? 0),
                ])
                ->values();

            // إعادة توزيع الأوزان بالتناسب إذا لم يكن مجموعها 100 بالضبط
            $criteriaTotal = $suggestedCriteria->sum('weight');
            if ($criteriaTotal > 0 && round($criteriaTotal, 2) !== 100.0) {
                $suggestedCriteria = $suggestedCriteria->map(fn ($c) => [
                    'name_ar' => $c['name_ar'],
                    'weight' => round($c['weight'] / $criteriaTotal * 100, 2),
                ]);
            }

            // Fields the AI failed to populate, so the frontend can flag them
            // instead of silently submitting a form that fails validation.
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
                'suggested_criteria' => $suggestedCriteria,
            ]);

        } catch (\Throwable $e) {
            \Log::error('Error generating AI challenge: ' . $e->getMessage(), [
                'exception' => get_class($e),
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json(['error' => 'حدث خطأ غير متوقع أثناء توليد تفاصيل التحدي.'], 500);
        }
    }

    /**
     * حفظ تحدّي جديد
     */
    public function store(StoreChallengeRequest $request)
    {
        $user = Auth::user();

        $data = $request->validated();
        $data['created_by'] = $user->id;
        $data['school_id'] = $user->id;
        $data['status'] = $data['status'] ?? 'draft';

        // Convert date strings to datetime
        if (isset($data['start_date']) && !str_contains($data['start_date'], ' ')) {
            $data['start_date'] = $data['start_date'] . ' 00:00:00';
        }
        if (isset($data['deadline']) && !str_contains($data['deadline'], ' ')) {
            $data['deadline'] = $data['deadline'] . ' 23:59:59';
        }

        // Convert max_participants to null if empty
        if (isset($data['max_participants']) && $data['max_participants'] === '') {
            $data['max_participants'] = null;
        }

        try {
            $challenge = $this->challengeService->createChallenge($data);

            $this->saveChallengeCriteria($challenge, $request);

            // Force clear cache immediately after creation (double-clear to ensure)
            $this->challengeService->clearChallengeCache($user->id, $user->id);

            Log::info('Challenge created successfully', [
                'challenge_id' => $challenge->id,
                'school_id' => $user->id,
                'title' => $challenge->title,
                'status' => $challenge->status,
            ]);

            return redirect()
                ->route('school.challenges.index')
                ->with('success', __('messages.msg_131'));
        } catch (\Throwable $e) {
            Log::error('Error creating challenge: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
            ]);

            return back()
                ->withErrors(['error' => 'حدث خطأ أثناء إنشاء التحدي: ' . $e->getMessage()])
                ->withInput();
        }
    }

    /**
     * حفظ معايير التقييم المرتبطة بمحتوى هذا التحدي (مقترحة من AI أو معدّلة يدوياً).
     * تستبدل أي معايير محفوظة سابقاً لهذا التحدي بالكامل بالقائمة الجديدة.
     */
    private function saveChallengeCriteria(Challenge $challenge, Request $request): void
    {
        $criteria = $request->input('criteria', []);
        $challenge->acceptanceCriteria()->delete();

        if (!is_array($criteria) || empty($criteria)) {
            return;
        }

        $rows = collect($criteria)
            ->filter(fn ($c) => !empty($c['name_ar']))
            ->values()
            ->map(fn ($c, $index) => [
                'challenge_id' => $challenge->id,
                'name_ar' => (string) $c['name_ar'],
                'description_ar' => $c['description_ar'] ?? null,
                'weight' => (float) ($c['weight'] ?? 0),
                'order' => $index,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

        if ($rows->isNotEmpty()) {
            \App\Models\AcceptanceCriterion::insert($rows->toArray());
        }
    }

    /**
     * عرض تحدّي معين
     */
    public function show(Challenge $challenge): Response
    {
        $user = Auth::user();

        // التحقق من أن التحدي للمدرسة الحالية
        if (!$user->canAccessAllSchoolData() && $challenge->school_id !== $user->id) {
            abort(403, __('messages.msg_084'));
        }

        $challenge->load(['creator', 'school', 'acceptanceCriteria']);

        // Load submission counts
        $challenge->loadCount([
            'submissions',
            'submissions as pending_submissions_count' => function ($query) {
                $query->where('status', 'submitted');
            },
            'submissions as reviewed_submissions_count' => function ($query) {
                $query->where('status', 'reviewed');
            },
            'submissions as approved_submissions_count' => function ($query) {
                $query->where('status', 'approved');
            },
        ]);

        // Ensure image_url is available
        if (!isset($challenge->image_url) && $challenge->image) {
            $challenge->image_url = $challenge->getImageUrlAttribute();
        }

        return Inertia::render('School/Challenges/Show', [
            'challenge' => $challenge,
            'auth' => [
                'user' => $user,
            ],
        ]);
    }

    /**
     * عرض نموذج تعديل تحدّي
     */
    public function edit(Challenge $challenge): Response
    {
        $user = Auth::user();

        // التحقق من أن التحدي للمدرسة الحالية
        if (!$user->canAccessAllSchoolData() && $challenge->school_id !== $user->id) {
            abort(403, __('messages.msg_135'));
        }

        $challenge->load(['creator', 'school', 'acceptanceCriteria']);

        return Inertia::render('School/Challenges/Edit', [
            'challenge' => $challenge,
            'auth' => [
                'user' => $user,
            ],
        ]);
    }

    /**
     * تحديث تحدّي
     */
    public function update(UpdateChallengeRequest $request, Challenge $challenge)
    {
        $user = Auth::user();

        // التحقق من أن التحدي للمدرسة الحالية
        if (!$user->canAccessAllSchoolData() && $challenge->school_id !== $user->id) {
            abort(403, __('messages.msg_135'));
        }

        $validated = $request->validated();

        // Convert date strings to datetime
        if (isset($validated['start_date']) && !str_contains($validated['start_date'], ' ')) {
            $validated['start_date'] = $validated['start_date'] . ' 00:00:00';
        }
        if (isset($validated['deadline']) && !str_contains($validated['deadline'], ' ')) {
            $validated['deadline'] = $validated['deadline'] . ' 23:59:59';
        }

        try {
            $this->challengeService->updateChallenge($challenge, $validated);
            $this->saveChallengeCriteria($challenge, $request);
            $challenge->refresh();

            return redirect()
                ->route('school.challenges.index')
                ->with('success', __('messages.msg_132'));
        } catch (\Throwable $e) {
            Log::error('Error updating challenge: ' . $e->getMessage(), [
                'challenge_id' => $challenge->id,
                'trace' => $e->getTraceAsString(),
            ]);

            return back()
                ->withErrors(['error' => 'حدث خطأ أثناء تحديث التحدي: ' . $e->getMessage()])
                ->withInput();
        }
    }

    /**
     * حذف تحدّي
     */
    public function destroy(Challenge $challenge)
    {
        $user = Auth::user();

        // التحقق من أن التحدي للمدرسة الحالية
        if (!$user->canAccessAllSchoolData() && $challenge->school_id !== $user->id) {
            abort(403, __('messages.msg_136'));
        }

        try {
            $this->challengeService->deleteChallenge($challenge);

            return redirect()
                ->route('school.challenges.index')
                ->with('success', __('messages.msg_133'));
        } catch (\Exception $e) {
            Log::error('Error deleting challenge: ' . $e->getMessage(), [
                'challenge_id' => $challenge->id,
                'trace' => $e->getTraceAsString(),
            ]);

            return back()
                ->withErrors(['error' => 'حدث خطأ أثناء حذف التحدي: ' . $e->getMessage()]);
        }
    }
}

