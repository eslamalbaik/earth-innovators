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

        $challenges = $this->challengeService->getSchoolChallenges(
            $user->id,
            $request->get('status'),
            10
        );

        $stats = $this->challengeService->getSchoolChallengeStats($user->id);

        return Inertia::render('School/Challenges/Index', [
            'challenges' => $challenges,
            'stats' => $stats,
            'filters' => [
                'status' => $request->status,
            ],
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
                ->with('success', 'تم إنشاء التحدي بنجاح!');
        } catch (\Exception $e) {
            Log::error('Error creating challenge: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
            ]);

            return back()
                ->withErrors(['error' => 'حدث خطأ أثناء إنشاء التحدي: ' . $e->getMessage()])
                ->withInput();
        }
    }

    /**
     * عرض تحدّي معين
     */
    public function show(Challenge $challenge): Response
    {
        $user = Auth::user();

        // التحقق من أن التحدي للمدرسة الحالية
        if ($challenge->school_id !== $user->id) {
            abort(403, 'غير مصرح لك بالوصول إلى هذا التحدي');
        }

        $challenge->load(['creator', 'school']);

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
        if ($challenge->school_id !== $user->id) {
            abort(403, 'غير مصرح لك بتعديل هذا التحدي');
        }

        $challenge->load(['creator', 'school']);

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
        if ($challenge->school_id !== $user->id) {
            abort(403, 'غير مصرح لك بتعديل هذا التحدي');
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
            $challenge->refresh();

            return redirect()
                ->route('school.challenges.index')
                ->with('success', 'تم تحديث التحدي بنجاح!');
        } catch (\Exception $e) {
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
        if ($challenge->school_id !== $user->id) {
            abort(403, 'غير مصرح لك بحذف هذا التحدي');
        }

        try {
            $this->challengeService->deleteChallenge($challenge);

            return redirect()
                ->route('school.challenges.index')
                ->with('success', 'تم حذف التحدي بنجاح!');
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

