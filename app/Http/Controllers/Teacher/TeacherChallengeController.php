<?php

namespace App\Http\Controllers\Teacher;

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
    public function create(): Response
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
        
        // Convert date strings to datetime
        if (isset($validated['start_date']) && !str_contains($validated['start_date'], ' ')) {
            $validated['start_date'] = $validated['start_date'] . ' 00:00:00';
        }
        if (isset($validated['deadline']) && !str_contains($validated['deadline'], ' ')) {
            $validated['deadline'] = $validated['deadline'] . ' 23:59:59';
        }
        
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
}

