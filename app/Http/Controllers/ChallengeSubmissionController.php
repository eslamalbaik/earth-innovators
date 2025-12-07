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
    /**
     * تسليم تحدّي من قبل طالب
     */
    public function store(Request $request, Challenge $challenge)
    {
        $user = Auth::user();

        // التحقق من أن المستخدم طالب
        if (!$user || !$user->isStudent()) {
            abort(403, 'فقط الطلاب يمكنهم تسليم التحديات');
        }

        // التحقق من أن التحدي متاح للطالب
        if ($challenge->school_id !== $user->school_id) {
            abort(403, 'هذا التحدي غير متاح لمدرستك');
        }

        // التحقق من أن التحدي نشط
        if ($challenge->status !== 'active' || 
            $challenge->start_date > now() || 
            $challenge->deadline < now()) {
            abort(403, 'هذا التحدي غير متاح حالياً');
        }

        // التحقق من عدم وجود تسليم سابق
        $existingSubmission = ChallengeSubmission::where('challenge_id', $challenge->id)
            ->where('student_id', $user->id)
            ->first();

        if ($existingSubmission) {
            return back()->withErrors(['error' => 'لقد قمت بتسليم هذا التحدي مسبقاً']);
        }

        // التحقق من الحد الأقصى للمشاركين
        if ($challenge->max_participants) {
            $currentParticipants = ChallengeSubmission::where('challenge_id', $challenge->id)->count();
            if ($currentParticipants >= $challenge->max_participants) {
                return back()->withErrors(['error' => 'تم الوصول إلى الحد الأقصى للمشاركين']);
            }
        }

        $validated = $request->validate([
            'answer' => 'required|string|max:5000',
            'comment' => 'nullable|string|max:1000',
            'files' => 'nullable|array|max:5',
            'files.*' => 'file|max:10240', // 10MB max per file
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

            // تحديث عدد المشاركين
            $challenge->increment('current_participants');

            return back()->with('success', 'تم تسليم التحدي بنجاح!');
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

        // التحقق من أن المستخدم هو صاحب التسليم
        if ($submission->student_id !== $user->id) {
            abort(403, 'غير مصرح لك بتعديل هذا التسليم');
        }

        // التحقق من أن التسليم لم يتم تقييمه بعد
        if ($submission->status !== 'submitted') {
            return back()->withErrors(['error' => 'لا يمكن تعديل تسليم تم تقييمه']);
        }

        $validated = $request->validate([
            'answer' => 'required|string|max:5000',
            'comment' => 'nullable|string|max:1000',
            'files' => 'nullable|array|max:5',
            'files.*' => 'file|max:10240',
        ]);

        try {
            $files = $submission->files ?? [];
            
            // حذف الملفات القديمة إذا تم رفع ملفات جديدة
            if ($request->hasFile('files')) {
                // حذف الملفات القديمة
                if (!empty($files)) {
                    foreach ($files as $file) {
                        Storage::disk('public')->delete($file);
                    }
                }
                
                // رفع الملفات الجديدة
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

            return back()->with('success', 'تم تحديث التسليم بنجاح!');
        } catch (\Exception $e) {
            Log::error('Error updating challenge submission: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
            ]);

            return back()->withErrors(['error' => 'حدث خطأ أثناء تحديث التسليم: ' . $e->getMessage()]);
        }
    }
}

