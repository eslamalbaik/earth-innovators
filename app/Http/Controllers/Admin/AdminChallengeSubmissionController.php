<?php

namespace App\Http\Controllers\Admin;

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

class AdminChallengeSubmissionController extends Controller
{
    public function __construct(
        private ChallengeSubmissionService $submissionService,
        private BadgeService $badgeService
    ) {}

    /**
     * Display a listing of submissions for a specific challenge.
     */
    public function index(Request $request, Challenge $challenge): Response
    {
        $status = $request->get('status');
        
        $submissions = $this->submissionService->getChallengeSubmissions(
            $challenge->id,
            $status,
            15
        )->withQueryString();

        return Inertia::render('Admin/Challenges/Submissions/Index', [
            'submissions' => $submissions,
            'challenge' => $challenge,
            'filters' => [
                'status' => $status,
            ],
        ]);
    }

    /**
     * Display the specified submission.
     */
    public function show(ChallengeSubmission $submission): Response
    {
        $submission->load(['challenge.school', 'student', 'reviewer']);

        // Get available badges
        $availableBadges = Badge::where('is_active', true)
            ->where('status', 'approved')
            ->get();

        return Inertia::render('Admin/Challenges/Submissions/Show', [
            'submission' => $submission,
            'availableBadges' => $availableBadges,
        ]);
    }

    /**
     * Evaluate the specified submission.
     */
    public function evaluate(Request $request, ChallengeSubmission $submission)
    {
        $validated = $request->validate([
            'status' => 'required|in:reviewed,approved,rejected',
            'feedback' => 'nullable|string',
            'rating' => 'nullable|numeric|min:0|max:10',
            'points_earned' => 'nullable|integer|min:0',
            'badges' => 'nullable|array',
            'badges.*' => 'exists:badges,id',
        ]);

        $adminId = Auth::id();
        $validated['reviewed_by'] = $adminId;

        try {
            $this->submissionService->evaluateSubmission($submission, $validated);

            // Award badges if provided
            if (isset($validated['badges']) && !empty($validated['badges'])) {
                foreach ($validated['badges'] as $badgeId) {
                    $this->badgeService->awardBadge(
                        $submission->student_id,
                        $badgeId,
                        null, // project_id
                        $submission->challenge_id, // challenge_id
                        'منح من تقييم التحدي: ' . $submission->challenge->title,
                        $adminId // awarded_by
                    );
                }
            }

            return redirect()
                ->route('admin.challenge-submissions.index', $submission->challenge_id)
                ->with('success', 'تم إرسال التقييم بنجاح!');
        } catch (\Exception $e) {
            Log::error('Error evaluating submission (Admin): ' . $e->getMessage(), [
                'submission_id' => $submission->id,
                'trace' => $e->getTraceAsString(),
            ]);

            return back()
                ->withErrors(['error' => 'حدث خطأ أثناء تقييم التقديم: ' . $e->getMessage()])
                ->withInput();
        }
    }
}
