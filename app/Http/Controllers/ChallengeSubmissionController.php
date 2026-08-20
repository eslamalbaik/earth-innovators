<?php

namespace App\Http\Controllers;

use App\Models\Challenge;
use App\Models\ChallengeSubmission;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class ChallengeSubmissionController extends Controller
{
    public function store(Request $request, Challenge $challenge)
    {
        $user = Auth::user();

        if (!$user || !$user->isStudent()) {
            abort(403, __('messages.msg_090'));
        }

        if ($challenge->school_id !== $user->school_id) {
            abort(403, __('messages.msg_091'));
        }

        if ($challenge->status !== 'active' || 
            $challenge->start_date > now() || 
            $challenge->deadline < now()) {
            abort(403, __('messages.msg_092'));
        }

        $existingSubmission = ChallengeSubmission::where('challenge_id', $challenge->id)
            ->where('student_id', $user->id)
            ->first();

        if ($existingSubmission) {
            return back()->withErrors(['error' => __('messages.msg_087')]);
        }

        if ($challenge->max_participants) {
            $currentParticipants = ChallengeSubmission::where('challenge_id', $challenge->id)->count();
            if ($currentParticipants >= $challenge->max_participants) {
                return back()->withErrors(['error' => __('messages.msg_088')]);
            }
        }

        $validated = $request->validate([
            'answer' => 'required|string|max:5000',
            'comment' => 'nullable|string|max:1000',
            'files' => 'nullable|array|max:5',
            'files.*' => 'file|max:10240',
        ]);

        try {
            $files = [];
            if ($request->hasFile('files')) {
                foreach ($request->file('files') as $file) {
                    $path = $file->store('challenge-submissions', 'public');
                    $files[] = $path;
                }
            }

            $submission = ChallengeSubmission::create([
                'challenge_id' => $challenge->id,
                'student_id' => $user->id,
                'answer' => $validated['answer'],
                'comment' => $validated['comment'] ?? null,
                'files' => !empty($files) ? $files : null,
                'status' => 'submitted',
                'submitted_at' => now(),
            ]);

            $challenge->increment('current_participants');

            return back()->with('success', __('messages.msg_085'));
        } catch (\Exception $e) {
            Log::error('Error submitting challenge: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
            ]);

            return back()->withErrors(['error' => 'حدث خطأ أثناء تسليم التحدي: ' . $e->getMessage()]);
        }
    }

    /**
     * تحديث تسليم تحدّي
     */
    public function update(Request $request, ChallengeSubmission $submission)
    {
        $user = Auth::user();

        if ($submission->student_id !== $user->id) {
            abort(403, __('messages.msg_093'));
        }

        if ($submission->status !== 'submitted') {
            return back()->withErrors(['error' => __('messages.msg_089')]);
        }

        $validated = $request->validate([
            'answer' => 'required|string|max:5000',
            'comment' => 'nullable|string|max:1000',
            'files' => 'nullable|array|max:5',
            'files.*' => 'file|max:10240',
        ]);

        try {
            $files = $submission->files ?? [];
            
            if ($request->hasFile('files')) {
                if (!empty($files)) {
                    foreach ($files as $file) {
                        Storage::disk('public')->delete($file);
                    }
                }
                
                $files = [];
                foreach ($request->file('files') as $file) {
                    $path = $file->store('challenge-submissions', 'public');
                    $files[] = $path;
                }
            }

            $submission->update([
                'answer' => $validated['answer'],
                'comment' => $validated['comment'] ?? null,
                'files' => !empty($files) ? $files : null,
            ]);

            return back()->with('success', __('messages.msg_086'));
        } catch (\Exception $e) {
            Log::error('Error updating challenge submission: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
            ]);

            return back()->withErrors(['error' => 'حدث خطأ أثناء تحديث التسليم: ' . $e->getMessage()]);
        }
    }
}

