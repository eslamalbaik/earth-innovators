<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Challenge;
use App\Models\User;
use App\Models\ChallengeParticipation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ChallengeStudentController extends Controller
{
    /**
     * عرض صفحة تعيين الطلاب للتحدي
     */
    public function show(Challenge $challenge)
    {
        $challenge->load(['school', 'participants.user']);

        // جلب جميع الطلاب في مدرسة التحدي
        $students = [];
        if ($challenge->school_id) {
            $students = User::where('school_id', $challenge->school_id)
                ->where('role', 'student')
                ->select('id', 'name', 'email', 'school_id')
                ->orderBy('name')
                ->get();
        }

        // جلب الطلاب المعينين بالفعل مع نوع المشاركة
        $assignedStudents = $challenge->participants->map(function ($participation) {
            return [
                'id' => $participation->user_id,
                'name' => $participation->user->name ?? 'غير معروف',
                'email' => $participation->user->email ?? '',
                'participation_type' => $participation->participation_type ?? 'optional',
            ];
        });

        return \Inertia\Inertia::render('Admin/Challenges/AssignStudents', [
            'challenge' => [
                'id' => $challenge->id,
                'title' => $challenge->title,
                'school_id' => $challenge->school_id,
                'school_name' => $challenge->school->name ?? 'غير محدد',
            ],
            'students' => $students,
            'assignedStudents' => $assignedStudents,
        ]);
    }

    /**
     * تعيين/تحديث الطلاب للتحدي مع نوع المشاركة
     */
    public function assign(Request $request, Challenge $challenge)
    {
        $validated = $request->validate([
            'students' => 'required|array',
            'students.*.user_id' => 'required|exists:users,id',
            'students.*.participation_type' => 'required|in:mandatory,optional,favorite',
        ], [
            'students.required' => 'يجب اختيار طالب واحد على الأقل',
            'students.*.user_id.required' => 'معرف الطالب مطلوب',
            'students.*.user_id.exists' => 'الطالب المحدد غير موجود',
            'students.*.participation_type.required' => 'نوع المشاركة مطلوب',
            'students.*.participation_type.in' => 'نوع المشاركة يجب أن يكون: إلزامي، اختياري، أو مفضل',
        ]);

        try {
            DB::beginTransaction();

            // حذف المشاركات القديمة
            ChallengeParticipation::where('challenge_id', $challenge->id)->delete();

            // إضافة المشاركات الجديدة
            foreach ($validated['students'] as $studentData) {
                ChallengeParticipation::updateOrCreate(
                    [
                        'challenge_id' => $challenge->id,
                        'user_id' => $studentData['user_id'],
                    ],
                    [
                        'participation_type' => $studentData['participation_type'],
                        'status' => 'joined',
                        'joined_at' => now(),
                        'points_earned' => 0,
                    ]
                );
            }

            // تحديث عدد المشاركين في التحدي
            $challenge->update([
                'current_participants' => ChallengeParticipation::where('challenge_id', $challenge->id)->count(),
            ]);

            DB::commit();

            return redirect()
                ->route('admin.challenges.show', $challenge->id)
                ->with('success', 'تم تعيين الطلاب للتحدي بنجاح');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'حدث خطأ أثناء تعيين الطلاب: ' . $e->getMessage()]);
        }
    }
}

