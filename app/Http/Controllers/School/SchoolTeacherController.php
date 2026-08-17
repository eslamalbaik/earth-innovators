<?php

namespace App\Http\Controllers\School;

use App\Http\Controllers\Controller;
use App\Models\CustomRole;
use App\Models\Subject;
use App\Models\Teacher;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules;
use Inertia\Inertia;

class SchoolTeacherController extends Controller
{
    public function index(Request $request)
    {
        $school = Auth::user();

        $teachers = User::where('role', 'teacher')
            ->where('school_id', $school->id)
            ->with(['teacher.subjectsRelation', 'customRole:id,name_ar'])
            ->when($request->get('search'), function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%")
                      ->orWhere('phone', 'like', "%{$search}%")
                      ->orWhere('membership_number', 'like', "%{$search}%");
                });
            })
            ->orderBy('name')
            ->paginate(20)
            ->through(fn ($teacher) => [
                'id'                => $teacher->id,
                'name'              => $teacher->name,
                'email'             => $teacher->email,
                'phone'             => $teacher->phone,
                'membership_number' => $teacher->membership_number,
                'points'            => $teacher->points ?? 0,
                'created_at'        => $teacher->created_at?->format('Y-m-d'),
                'grade'             => $teacher->teacher?->grade,
                'section'           => $teacher->teacher?->section,
                'subject_id'        => $teacher->teacher?->subjectsRelation->first()?->id,
                'custom_role_id'    => $teacher->custom_role_id,
                'role_label'        => $teacher->roleLabel(),
            ])
            ->withQueryString();

        // Teachers not yet linked to this school (for linking existing teacher accounts)
        $availableTeachers = User::where('role', 'teacher')
            ->whereNull('school_id')
            ->orderBy('name')
            ->limit(200)
            ->get(['id', 'name', 'email', 'phone'])
            ->map(fn ($t) => [
                'id'    => $t->id,
                'name'  => $t->name,
                'email' => $t->email,
                'phone' => $t->phone,
            ]);

        return Inertia::render('School/Teachers/Index', [
            'teachers'          => $teachers,
            'availableTeachers' => $availableTeachers,
            'subjects'          => Subject::getActive(),
            'customRoles'       => CustomRole::active()->forBaseRole('teacher')->get(['id', 'name_ar']),
        ]);
    }

    public function store(Request $request)
    {
        $school = Auth::user();

        $assignment = $request->validate([
            'subject_id'     => ['nullable', 'integer', 'exists:subjects,id'],
            'grade'          => ['nullable', 'string', 'max:100'],
            'section'        => ['nullable', 'string', 'max:100'],
            'custom_role_id' => ['nullable', 'integer', Rule::exists('custom_roles', 'id')->where('base_role', 'teacher')],
        ]);

        // Link existing teacher
        if ($request->filled('existing_teacher_id')) {
            $request->validate([
                'existing_teacher_id' => ['required', 'integer', 'exists:users,id'],
            ]);

            $teacher = User::where('id', $request->existing_teacher_id)
                ->where('role', 'teacher')
                ->firstOrFail();

            $teacher->update([
                'school_id' => $school->id,
                'custom_role_id' => $assignment['custom_role_id'] ?? null,
            ]);

            // المعلم المرتبط بمدرسة يُعتمد تلقائياً (المدرسة هي الضامن)
            $this->ensureActiveTeacherProfile($teacher, $assignment);

            // منح التجربة المجانية تلقائياً (نفس ما يحصل عند التسجيل العادي) إن لم يسبق له اشتراك
            app(\App\Services\PackagePaymentService::class)->activateDefaultTrialForNewUser($teacher);

            return redirect()->route('school.teachers.index')
                ->with('success', 'تم ربط المعلم بالمدرسة بنجاح');
        }

        // Create new teacher
        $validated = $request->validate([
            'name'     => ['required', 'string', 'max:255'],
            'email'    => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'phone'    => ['nullable', 'string', 'max:30'],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $teacher = User::create([
            'name'           => $validated['name'],
            'email'          => $validated['email'],
            'phone'          => $validated['phone'] ?? null,
            'password'       => Hash::make($validated['password']),
            'role'           => 'teacher',
            'school_id'      => $school->id,
            'custom_role_id' => $assignment['custom_role_id'] ?? null,
        ]);

        // المعلم المُضاف من المدرسة يُعتمد تلقائياً (المدرسة هي الضامن)
        $this->ensureActiveTeacherProfile($teacher, $assignment);

        // منح التجربة المجانية تلقائياً (نفس ما يحصل عند التسجيل العادي)
        app(\App\Services\PackagePaymentService::class)->activateDefaultTrialForNewUser($teacher);

        return redirect()->route('school.teachers.index')
            ->with('success', 'تم إضافة المعلم بنجاح');
    }

    /**
     * تأكيد وجود ملف معلم نشط ومعتمد للمستخدم.
     * يُنشئ الملف إن لم يكن موجوداً، أو يفعّله إن كان غير نشط.
     */
    private function ensureActiveTeacherProfile(User $teacher, array $assignment = []): void
    {
        $profile = Teacher::firstOrNew(['user_id' => $teacher->id]);

        if (!$profile->exists) {
            $profile->fill([
                'name_ar'          => $teacher->name,
                'name_en'          => $teacher->name,
                'city'             => 'غير محدد',
                'bio'              => null,
                'qualifications'   => null,
                'subjects'         => json_encode([]),
                'stages'           => json_encode([]),
                'experience_years' => 0,
                'price_per_hour'   => 0,
                'nationality'      => 'إماراتي',
                'gender'           => null,
                'neighborhoods'    => json_encode([]),
            ]);
        }

        $profile->is_verified = true;
        $profile->is_active = true;

        if (array_key_exists('grade', $assignment) && $assignment['grade']) {
            $profile->grade = $assignment['grade'];
        }
        if (array_key_exists('section', $assignment) && $assignment['section']) {
            $profile->section = $assignment['section'];
        }

        $profile->save();

        if (!empty($assignment['subject_id'])) {
            $this->assignSubject($profile, (int) $assignment['subject_id']);
        }
    }

    /**
     * ربط المعلم بمادة دراسية (نفس منطق TeacherProfileController::addSubject).
     */
    private function assignSubject(Teacher $profile, int $subjectId): void
    {
        $subject = Subject::find($subjectId);
        if (!$subject) {
            return;
        }

        if (!$profile->subjectsRelation()->where('subjects.id', $subject->id)->exists()) {
            $profile->subjectsRelation()->attach($subject->id);
        }

        $currentSubjects = $profile->subjects ?? [];
        if (!in_array($subject->name_ar, $currentSubjects)) {
            $currentSubjects[] = $subject->name_ar;
            $profile->update(['subjects' => $currentSubjects]);
        }
    }

    public function update(Request $request, $id)
    {
        $school = Auth::user();

        $teacher = User::where('id', $id)
            ->where('role', 'teacher')
            ->where('school_id', $school->id)
            ->firstOrFail();

        $validated = $request->validate([
            'name'           => ['required', 'string', 'max:255'],
            'email'          => ['required', 'string', 'email', 'max:255', 'unique:users,email,' . $teacher->id],
            'phone'          => ['nullable', 'string', 'max:30'],
            'password'       => ['nullable', 'confirmed', Rules\Password::defaults()],
            'subject_id'     => ['nullable', 'integer', 'exists:subjects,id'],
            'grade'          => ['nullable', 'string', 'max:100'],
            'section'        => ['nullable', 'string', 'max:100'],
            'custom_role_id' => ['nullable', 'integer', Rule::exists('custom_roles', 'id')->where('base_role', 'teacher')],
        ]);

        $data = [
            'name'           => $validated['name'],
            'email'          => $validated['email'],
            'phone'          => $validated['phone'] ?? null,
            'custom_role_id' => $validated['custom_role_id'] ?? null,
        ];

        if (!empty($validated['password'])) {
            $data['password'] = Hash::make($validated['password']);
        }

        $teacher->update($data);

        $this->ensureActiveTeacherProfile($teacher, [
            'subject_id' => $validated['subject_id'] ?? null,
            'grade'      => $validated['grade'] ?? null,
            'section'    => $validated['section'] ?? null,
        ]);

        return redirect()->route('school.teachers.index')
            ->with('success', 'تم تحديث بيانات المعلم بنجاح');
    }

    public function destroy($id)
    {
        $school = Auth::user();

        $teacher = User::where('id', $id)
            ->where('role', 'teacher')
            ->where('school_id', $school->id)
            ->firstOrFail();

        // Detach teacher from school instead of deleting the account
        $teacher->update(['school_id' => null]);

        return redirect()->route('school.teachers.index')
            ->with('success', 'تم إزالة المعلم من المدرسة بنجاح');
    }
}
