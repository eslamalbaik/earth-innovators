<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Http\Requests\Challenge\StoreChallengeRequest;
use App\Http\Requests\Challenge\UpdateChallengeRequest;
use App\Models\Challenge;
use App\Services\ChallengeService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class TeacherChallengeController extends Controller
{
    public function __construct(
        private ChallengeService $challengeService
    ) {}

    /**
     * عرض قائمة تحديات المعلم
     */
    public function index(): Response
    {
        $user = Auth::user();

        $challenges = $this->challengeService->getTeacherChallenges($user->id, 10);

        return Inertia::render('Teacher/Challenges/Index', [
            'challenges' => $challenges,
            'auth' => [
                'user' => $user,
            ],
        ]);
    }

    /**
     * عرض نموذج إنشاء تحدّي جديد
     */
    public function create()
    {
        $user = Auth::user();

        // الحصول على مدرسة المعلم
        $school = $user->school;

        if (!$school) {
            return redirect()
                ->route('teacher.challenges.index')
                ->withErrors(['error' => 'يجب أن تكون مرتبطاً بمدرسة لإنشاء تحديات.']);
        }

        return Inertia::render('Teacher/Challenges/Create', [
            'school' => $school ? [
                'id' => $school->id,
                'name' => $school->name,
            ] : null,
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

        // التحقق من أن المعلم مرتبط بمدرسة
        if (!$user->school_id) {
            return back()->withErrors([
                'school_id' => 'يجب أن تكون مرتبطاً بمدرسة لإنشاء التحديات.',
            ])->withInput();
        }

        // التحقق من أن المدرسة موجودة
        $school = \App\Models\User::where('id', $user->school_id)
            ->where('role', 'school')
            ->firstOrFail();

        $data = $request->validated();
        $data['created_by'] = $user->id;
        $data['school_id'] = $school->id;
        $data['status'] = $data['status'] ?? 'draft';
        
        $data = $this->normalizeChallengeDates($data);
        
        // Convert max_participants to null if empty
        if (isset($data['max_participants']) && $data['max_participants'] === '') {
            $data['max_participants'] = null;
        }

        try {
            $challenge = $this->challengeService->createChallenge($data);

            // Force clear cache immediately after creation to ensure it appears in school challenges
            // This ensures the challenge appears in /school/challenges route
            if ($challenge->school_id) {
                $this->challengeService->clearChallengeCache($challenge->school_id, $challenge->created_by);
            }
            
            Log::info('Teacher challenge created successfully', [
                'challenge_id' => $challenge->id,
                'school_id' => $challenge->school_id,
                'teacher_id' => $challenge->created_by,
                'title' => $challenge->title,
                'status' => $challenge->status,
            ]);

            return redirect()
                ->route('teacher.challenges.index')
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

        // التحقق من أن التحدي للمعلم الحالي
        if ($challenge->created_by !== $user->id) {
            abort(403, 'غير مصرح لك بالوصول إلى هذا التحدي');
        }

        $challenge->load(['creator', 'school']);

        return Inertia::render('Teacher/Challenges/Show', [
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

        // التحقق من أن التحدي للمعلم الحالي
        if ($challenge->created_by !== $user->id) {
            abort(403, 'غير مصرح لك بتعديل هذا التحدي');
        }

        $challenge->load(['creator', 'school']);

        return Inertia::render('Teacher/Challenges/Edit', [
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

        // التحقق من أن التحدي للمعلم الحالي
        if ($challenge->created_by !== $user->id) {
            abort(403, 'غير مصرح لك بتعديل هذا التحدي');
        }

        $validated = $request->validated();
        
        $validated = $this->normalizeChallengeDates($validated);
        
        // Convert max_participants to null if empty
        if (isset($validated['max_participants']) && $validated['max_participants'] === '') {
            $validated['max_participants'] = null;
        }

        try {
            $this->challengeService->updateChallenge($challenge, $validated);
            $challenge->refresh();

            return redirect()
                ->route('teacher.challenges.index')
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

        // التحقق من أن التحدي للمعلم الحالي
        if ($challenge->created_by !== $user->id) {
            abort(403, 'غير مصرح لك بحذف هذا التحدي');
        }

        try {
            $this->challengeService->deleteChallenge($challenge);

            return redirect()
                ->route('teacher.challenges.index')
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
