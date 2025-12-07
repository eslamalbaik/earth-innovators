<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Challenge;
use App\Models\ChallengeSubmission;
use App\Models\Badge;
use App\Services\ChallengeSubmissionService;
use App\Services\BadgeService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class TeacherChallengeSubmissionController extends Controller
{
    public function __construct(
        private ChallengeSubmissionService $submissionService,
        private BadgeService $badgeService
    ) {}

    /**
     * عرض تقديمات التحديات للمعلم
     */
    public function index(Request $request): Response
    {
        $teacher = Auth::user();

        $challengeId = $request->get('challenge_id');
        $status = $request->get('status');

        if ($challengeId) {
            // Get submissions for specific challenge
            $challenge = Challenge::where('id', $challengeId)
                ->where('created_by', $teacher->id)
                ->firstOrFail();

            $submissions = $this->submissionService->getChallengeSubmissions(
                $challengeId,
                $status,
                15
            )->withQueryString();

            return Inertia::render('Teacher/ChallengeSubmissions/Index', [
                'submissions' => $submissions,
                'challenge' => $challenge,
                'filters' => [
                    'challenge_id' => $challengeId,
                    'status' => $status,
                ],
                'auth' => [
                    'user' => $teacher,
                ],
            ]);
        }

        // Get all challenges created by teacher with submission counts
        $challenges = Challenge::where('created_by', $teacher->id)
            ->withCount(['submissions'])
            ->orderBy('created_at', 'desc')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Teacher/ChallengeSubmissions/Challenges', [
            'challenges' => $challenges,
            'auth' => [
                'user' => $teacher,
            ],
        ]);
    }

    /**
     * عرض تفاصيل تقديم
     */
    public function show(ChallengeSubmission $submission): Response
    {
        $teacher = Auth::user();

        // Verify submission belongs to teacher's challenge
        if ($submission->challenge->created_by !== $teacher->id) {
            abort(403, 'غير مصرح لك بعرض هذا التقديم');
        }

        $submission->load(['challenge', 'student', 'reviewer']);

        // Get available badges
        $availableBadges = Badge::where('is_active', true)
            ->where('status', 'approved')
            ->get();

        return Inertia::render('Teacher/ChallengeSubmissions/Show', [
            'submission' => $submission,
            'availableBadges' => $availableBadges,
            'auth' => [
                'user' => $teacher,
            ],
        ]);
    }

    /**
     * تقييم تقديم
     */
    public function evaluate(Request $request, ChallengeSubmission $submission)
    {
        $teacher = Auth::user();

        // Verify submission belongs to teacher's challenge
        if ($submission->challenge->created_by !== $teacher->id) {
            abort(403, 'غير مصرح لك بتقييم هذا التقديم');
        }

        $validated = $request->validate([
            'status' => 'required|in:reviewed,approved,rejected',
            'feedback' => 'nullable|string',
            'rating' => 'nullable|numeric|min:0|max:10',
            'points_earned' => 'nullable|integer|min:0',
            'badges' => 'nullable|array',
            'badges.*' => 'exists:badges,id',
        ]);

        $validated['reviewed_by'] = $teacher->id;

        try {
            $this->submissionService->evaluateSubmission($submission, $validated);

            // Award badges if provided
            if (isset($validated['badges']) && !empty($validated['badges'])) {
                foreach ($validated['badges'] as $badgeId) {
                    $userBadge = $this->badgeService->awardBadge(
                        $submission->student_id,
                        $badgeId,
                        null, // project_id
                        $submission->challenge_id, // challenge_id
                        'منح من تقييم التحدي: ' . $submission->challenge->title,
                        $teacher->id // awarded_by
                    );
                    
                    Log::info('Badge awarded to student', [
                        'student_id' => $submission->student_id,
                        'badge_id' => $badgeId,
                        'challenge_id' => $submission->challenge_id,
                        'awarded_by' => $teacher->id,
                        'user_badge_id' => $userBadge->id,
                    ]);
                }
            }

            return redirect()
                ->route('teacher.challenge-submissions.index', ['challenge_id' => $submission->challenge_id])
                ->with('success', 'تم إرسال التقييم بنجاح!');
        } catch (\Exception $e) {
            Log::error('Error evaluating submission: ' . $e->getMessage(), [
                'submission_id' => $submission->id,
                'trace' => $e->getTraceAsString(),
            ]);

            return back()
                ->withErrors(['error' => 'حدث خطأ أثناء تقييم التقديم: ' . $e->getMessage()])
                ->withInput();
        }
    }
}

