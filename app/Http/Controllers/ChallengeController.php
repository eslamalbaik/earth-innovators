<?php

namespace App\Http\Controllers;

use App\Services\ChallengeService;
use App\Models\Challenge;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ChallengeController extends Controller
{
    public function __construct(
        private ChallengeService $challengeService
    ) {}

    /**
     * عرض جميع التحديات النشطة (عام - متاح لجميع المستخدمين)
     */
    public function index(Request $request)
    {
        $user = Auth::user();

        $schoolId = null;
        if ($user && $user->isStudent() && $user->school_id) {
            $schoolId = $user->school_id;
        }

        $challenges = $this->challengeService->getActiveChallenges(
            $request->get('search'),
            $request->get('category'),
            $request->get('challenge_type'),
            $schoolId,
            12
        )->withQueryString();

        return Inertia::render('Challenges/Index', [
            'challenges' => $challenges,
            'userRole' => $user ? $user->role : null,
        ]);
    }

    /**
     * عرض تفاصيل تحدّي نشط
     */
    public function show(int $id)
    {
        $user = Auth::user();

        // للطلاب: توجيههم إلى صفحة الطلاب
        if ($user && $user->isStudent()) {
            return redirect()->route('student.challenges.show', $id);
        }

        // للمعلمين: توجيههم إلى صفحة المعلمين
        if ($user && $user->isTeacher()) {
            $challenge = Challenge::findOrFail($id);
            if ($challenge->created_by === $user->id) {
                return redirect()->route('teacher.challenges.show', $id);
            }
        }

        // للزوار والمستخدمين الآخرين: عرض التحدي العام (بما في ذلك المؤسسات تعليمية)
        $challenge = Challenge::with(['creator', 'school'])
            ->findOrFail($id);

        // Ensure image_url is available
        if (!isset($challenge->image_url) && $challenge->image) {
            $challenge->image_url = $challenge->getImageUrlAttribute();
        }

        // Get existing submission if user is student
        $existingSubmission = null;
        if ($user && $user->isStudent()) {
            $existingSubmission = \App\Models\ChallengeSubmission::where('challenge_id', $challenge->id)
                ->where('student_id', $user->id)
                ->first();
        }

        // استخدام صفحة الطلاب كـ fallback
        return Inertia::render('Student/Challenges/Show', [
            'challenge' => $challenge,
            'existingSubmission' => $existingSubmission,
            'userRole' => $user ? $user->role : null,
            'canSubmit' => $user && $user->isStudent() && $challenge->school_id === $user->school_id,
        ]);
    }
}

