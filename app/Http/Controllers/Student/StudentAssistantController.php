<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Services\AIEngine\StudentAssistantService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

/**
 * المساعد الذكي للطالب — ودجت دردشة متاح من أي صفحة في حساب الطالب.
 * يجيب على أسئلة التعلم العامة، ويفسّر أي مؤشر/درجة استناداً إلى بيانات
 * الطالب الفعلية، ويقترح خطوات عملية لرفع الدرجة.
 */
class StudentAssistantController extends Controller
{
    public function __construct(
        private StudentAssistantService $assistant,
    ) {}

    public function ask(Request $request)
    {
        $request->validate([
            'question' => 'required|string|max:1000',
        ]);

        $user = Auth::user();

        if (!$user || !$user->isStudent()) {
            abort(403, 'Unauthorized action.');
        }

        $user->load([
            'achievements',
            'userSkills',
            'projects.submissions',
            'certificates',
            'badges',
            'challenges',
            'challengeParticipations.challenge',
            'publications',
            'latestInnovationIndex',
        ]);

        try {
            $result = $this->assistant->answer($user, $request->input('question'));

            return response()->json($result);
        } catch (\Throwable $e) {
            Log::error("Student Assistant error: {$e->getMessage()}");

            return response()->json([
                'answer' => app()->getLocale() === 'en'
                    ? 'Something went wrong while processing your question. Please try again.'
                    : 'حدث خطأ أثناء معالجة سؤالك. حاول مرة أخرى.',
                'mode' => 'error',
            ], 500);
        }
    }
}
