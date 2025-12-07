<?php

namespace App\Http\Controllers\School;

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

class SchoolChallengeSubmissionController extends Controller
{
    public function __construct(
        private ChallengeSubmissionService $submissionService,
        private BadgeService $badgeService
    ) {}

    /**
     * عرض تقديمات التحديات للمدرسة
     */
    public function index(Request $request): Response
    {
        $school = Auth::user();

        $challengeId = $request->get('challenge_id');
        $status = $request->get('status');

        if ($challengeId) {
            // Get submissions for specific challenge
            $challenge = Challenge::where('id', $challengeId)
                ->where('school_id', $school->id)
                ->firstOrFail();

            $submissions = $this->submissionService->getChallengeSubmissions(
                $challengeId,
                $status,
                15
            )->withQueryString();

            return Inertia::render('School/ChallengeSubmissions/Index', [
                'submissions' => $submissions,
                'challenge' => $challenge,
                'filters' => [
                    'challenge_id' => $challengeId,
                    'status' => $status,
                ],
                'auth' => [
                    'user' => $school,
                ],
            ]);
        }

        // Get all challenges with submission counts
        $challenges = Challenge::where('school_id', $school->id)
            ->withCount(['submissions'])
            ->orderBy('created_at', 'desc')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('School/ChallengeSubmissions/Challenges', [
            'challenges' => $challenges,
            'auth' => [
                'user' => $school,
            ],
        ]);
    }

    /**
     * عرض تفاصيل تقديم
     */
    public function show(ChallengeSubmission $submission): Response
    {
        $school = Auth::user();

        // Verify submission belongs to school's challenge
        if ($submission->challenge->school_id !== $school->id) {
            abort(403, 'غير مصرح لك بعرض هذا التقديم');
        }

        $submission->load(['challenge', 'student', 'reviewer']);

        // Get available badges
        $availableBadges = Badge::where('is_active', true)
            ->where('status', 'approved')
            ->get();

        return Inertia::render('School/ChallengeSubmissions/Show', [
            'submission' => $submission,
            'availableBadges' => $availableBadges,
            'auth' => [
                'user' => $school,
            ],
        ]);
    }

    /**
     * تقييم تقديم
     */
    public function evaluate(Request $request, ChallengeSubmission $submission)
    {
        $school = Auth::user();

        // Verify submission belongs to school's challenge
        if ($submission->challenge->school_id !== $school->id) {
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

        $validated['reviewed_by'] = $school->id;

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
                        $school->id // awarded_by
                    );
                    
                    Log::info('Badge awarded to student', [
                        'student_id' => $submission->student_id,
                        'badge_id' => $badgeId,
                        'challenge_id' => $submission->challenge_id,
                        'awarded_by' => $school->id,
                        'user_badge_id' => $userBadge->id,
                    ]);
                }
            }

            return redirect()
                ->route('school.challenge-submissions.index', ['challenge_id' => $submission->challenge_id])
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

