<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Challenge;
use App\Models\ChallengeSubmission;
use App\Services\ChallengeSubmissionService;
use App\Services\ChallengeParticipationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class StudentChallengeController extends Controller
{
    public function __construct(
        private ChallengeSubmissionService $submissionService,
        private ChallengeParticipationService $participationService
    ) {}

    /**
     * عرض قائمة التحديات للطالب
     */
    public function index(Request $request): Response
    {
        $student = Auth::user();

        if (!$student->school_id) {
            return Inertia::render('Student/Challenges/Index', [
                'challenges' => [],
                'message' => 'أنت غير مرتبط بمدرسة',
            ]);
        }

        $status = $request->get('status'); // active, upcoming, finished
        $challenges = $this->submissionService->getAllChallengesForStudent(
            $student->school_id,
            $status,
            12
        )->withQueryString();

        // Load student submissions for each challenge
        $challengeIds = $challenges->pluck('id');
        $submissions = ChallengeSubmission::whereIn('challenge_id', $challengeIds)
            ->where('student_id', $student->id)
            ->get()
            ->keyBy('challenge_id');

        // Attach submission status to each challenge
        $challenges->getCollection()->transform(function ($challenge) use ($submissions) {
            $challenge->submission_status = $submissions->get($challenge->id)?->status ?? null;
            $challenge->has_submission = $submissions->has($challenge->id);
            return $challenge;
        });

        return Inertia::render('Student/Challenges/Index', [
            'challenges' => $challenges,
            'filters' => [
                'status' => $status,
            ],
        ]);
    }

    /**
     * الانضمام إلى تحدّي
     */
    public function join(Challenge $challenge)
    {
        $student = Auth::user();

        // Challenges can be global (no school_id) or school-specific
        // If challenge has school_id, verify it matches student's school
        if ($challenge->school_id && $challenge->school_id !== $student->school_id) {
            return back()->withErrors([
                'error' => 'غير مصرح لك بالانضمام إلى هذا التحدي',
            ]);
        }

        if (!$challenge->isActive()) {
            return back()->withErrors([
                'error' => 'هذا التحدي غير نشط حالياً',
            ]);
        }

        try {
            // #region agent log
            $logPath = base_path('.cursor/debug.log');
            $logData = json_encode([
                'sessionId' => 'debug-session',
                'runId' => 'run1',
                'hypothesisId' => 'E',
                'location' => 'StudentChallengeController.php:88',
                'message' => 'Before calling joinChallenge service',
                'data' => ['studentId' => $student->id, 'challengeId' => $challenge->id],
                'timestamp' => now()->timestamp * 1000
            ]) . "\n";
            file_put_contents($logPath, $logData, FILE_APPEND);
            // #endregion

            $this->participationService->joinChallenge($student->id, $challenge->id);

            // #region agent log
            $logData2 = json_encode([
                'sessionId' => 'debug-session',
                'runId' => 'run2',
                'hypothesisId' => 'F',
                'location' => 'StudentChallengeController.php:105',
                'message' => 'After joinChallenge, before redirect',
                'data' => ['route' => 'student.challenges.show', 'challengeId' => $challenge->id, 'routeUrl' => route('student.challenges.show', $challenge)],
                'timestamp' => now()->timestamp * 1000
            ]) . "\n";
            file_put_contents($logPath, $logData2, FILE_APPEND);
            // #endregion

            // Redirect to challenge page
            $redirectResponse = redirect()
                ->route('student.challenges.show', $challenge)
                ->with('success', 'تم الانضمام إلى التحدي بنجاح! يمكنك الآن تقديم حل.');

            // #region agent log
            $logData3 = json_encode([
                'sessionId' => 'debug-session',
                'runId' => 'run2',
                'hypothesisId' => 'H',
                'location' => 'StudentChallengeController.php:118',
                'message' => 'Redirect response created',
                'data' => ['targetUrl' => $redirectResponse->getTargetUrl(), 'statusCode' => $redirectResponse->getStatusCode()],
                'timestamp' => now()->timestamp * 1000
            ]) . "\n";
            file_put_contents($logPath, $logData3, FILE_APPEND);
            // #endregion

            return $redirectResponse;
        } catch (\Exception $e) {
            Log::error('Error joining challenge: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
            ]);

            return back()->withErrors([
                'error' => 'حدث خطأ أثناء الانضمام: ' . $e->getMessage(),
            ]);
        }
    }

    /**
     * عرض تفاصيل تحدّي مع إمكانية التسليم
     */
    public function show(Challenge $challenge): Response
    {
        $student = Auth::user();

        // Challenges can be global (no school_id) or school-specific
        // If challenge has school_id, verify it matches student's school
        if ($challenge->school_id && $challenge->school_id !== $student->school_id) {
            abort(403, 'غير مصرح لك بعرض هذا التحدي');
        }

        $challenge = $this->submissionService->getChallengeDetailsForStudent($challenge->id, $student->id);

        return Inertia::render('Student/Challenges/Show', [
            'challenge' => $challenge,
        ]);
    }

    /**
     * تقديم حل للتحدي
     */
    public function submit(Request $request, Challenge $challenge)
    {
        $student = Auth::user();

        // Challenges can be global (no school_id) or school-specific
        // If challenge has school_id, verify it matches student's school
        if ($challenge->school_id && $challenge->school_id !== $student->school_id) {
            abort(403, 'غير مصرح لك بتقديم حل لهذا التحدي');
        }

        if (!$challenge->isActive()) {
            return back()->withErrors([
                'error' => 'هذا التحدي غير نشط حالياً',
            ]);
        }

        $validated = $request->validate([
            'answer' => 'nullable|string|max:5000',
            'comment' => 'nullable|string|max:1000',
            'files' => 'nullable|array|max:5',
            'files.*' => 'file|max:10240', // 10MB max per file
        ], [
            'answer.max' => 'الإجابة يجب ألا تتجاوز 5000 حرف',
            'comment.max' => 'التعليق يجب ألا يتجاوز 1000 حرف',
            'files.max' => 'يمكنك رفع 5 ملفات كحد أقصى',
            'files.*.file' => 'يجب أن يكون الملف ملفاً صحيحاً',
            'files.*.max' => 'حجم الملف يجب ألا يتجاوز 10 ميجابايت',
        ]);

        // Ensure at least answer or files are provided
        if (empty($validated['answer']) && (!$request->hasFile('files') || empty($request->file('files')))) {
            return back()->withErrors([
                'answer' => 'يجب تقديم إجابة أو رفع ملف واحد على الأقل',
            ])->withInput();
        }

        $validated['challenge_id'] = $challenge->id;
        $validated['student_id'] = $student->id;

        // Handle file uploads - pass file objects directly to service
        if ($request->hasFile('files')) {
            $validated['files'] = $request->file('files');
        } else {
            $validated['files'] = null;
        }

        try {
            $submission = $this->submissionService->createSubmission($validated);

            return redirect()
                ->route('student.challenges.submissions.show', [$challenge, $submission])
                ->with('success', 'تم تقديم حل التحدي بنجاح!');
        } catch (\Exception $e) {
            Log::error('Error submitting challenge: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
            ]);

            return back()
                ->withErrors(['error' => 'حدث خطأ أثناء تقديم الحل: ' . $e->getMessage()])
                ->withInput();
        }
    }

    /**
     * عرض حالة التقديم
     */
    public function showSubmission(Challenge $challenge, ChallengeSubmission $submission): Response
    {
        $student = Auth::user();

        // Verify ownership
        if ($submission->student_id !== $student->id || $submission->challenge_id !== $challenge->id) {
            abort(403, 'غير مصرح لك بعرض هذا التقديم');
        }

        // Verify challenge is available for student
        if ($challenge->school_id !== $student->school_id) {
            abort(403, 'غير مصرح لك بعرض هذا التحدي');
        }

        $submission->load(['challenge', 'student', 'reviewer']);

        return Inertia::render('Student/Challenges/SubmissionShow', [
            'challenge' => $challenge,
            'submission' => $submission,
        ]);
    }

    /**
     * تحديث تقديم موجود
     */
    public function updateSubmission(Request $request, Challenge $challenge, ChallengeSubmission $submission)
    {
        $student = Auth::user();

        // Verify ownership
        if ($submission->student_id !== $student->id || $submission->challenge_id !== $challenge->id) {
            abort(403, 'غير مصرح لك بتعديل هذا التقديم');
        }

        if ($submission->status !== 'submitted') {
            return back()->withErrors([
                'error' => 'لا يمكن تعديل التقديم بعد المراجعة',
            ]);
        }

        $validated = $request->validate([
            'answer' => 'nullable|string|max:5000',
            'comment' => 'nullable|string|max:1000',
            'files' => 'nullable|array|max:5',
            'files.*' => 'file|max:10240',
        ], [
            'answer.max' => 'الإجابة يجب ألا تتجاوز 5000 حرف',
            'comment.max' => 'التعليق يجب ألا يتجاوز 1000 حرف',
            'files.max' => 'يمكنك رفع 5 ملفات كحد أقصى',
            'files.*.file' => 'يجب أن يكون الملف ملفاً صحيحاً',
            'files.*.max' => 'حجم الملف يجب ألا يتجاوز 10 ميجابايت',
        ]);

        // Ensure at least answer or files are provided
        if (empty($validated['answer']) && (!$request->hasFile('files') || empty($request->file('files')))) {
            return back()->withErrors([
                'answer' => 'يجب تقديم إجابة أو رفع ملف واحد على الأقل',
            ])->withInput();
        }

        // Handle file uploads - pass file objects directly to service
        if ($request->hasFile('files')) {
            $validated['files'] = $request->file('files');
        } else {
            $validated['files'] = null;
        }

        try {
            $this->submissionService->updateSubmission($submission, $validated);

            return redirect()
                ->route('student.challenges.show', $challenge)
                ->with('success', 'تم تحديث التقديم بنجاح!');
        } catch (\Exception $e) {
            Log::error('Error updating submission: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
            ]);

            return back()
                ->withErrors(['error' => 'حدث خطأ أثناء تحديث التقديم: ' . $e->getMessage()])
                ->withInput();
        }
    }
}

