<?php

namespace App\Http\Controllers\School;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;

class SchoolTeacherController extends Controller
{
    public function index(Request $request)
    {
        $school = Auth::user();

        $teachers = User::where('role', 'teacher')
            ->where('school_id', $school->id)
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
        ]);
    }

    public function store(Request $request)
    {
        $school = Auth::user();

        // Link existing teacher
        if ($request->filled('existing_teacher_id')) {
            $request->validate([
                'existing_teacher_id' => ['required', 'integer', 'exists:users,id'],
            ]);

            $teacher = User::where('id', $request->existing_teacher_id)
                ->where('role', 'teacher')
                ->firstOrFail();

            $teacher->update(['school_id' => $school->id]);

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

        User::create([
            'name'      => $validated['name'],
            'email'     => $validated['email'],
            'phone'     => $validated['phone'] ?? null,
            'password'  => Hash::make($validated['password']),
            'role'      => 'teacher',
            'school_id' => $school->id,
        ]);

        return redirect()->route('school.teachers.index')
            ->with('success', 'تم إضافة المعلم بنجاح');
    }

    public function update(Request $request, $id)
    {
        $school = Auth::user();

        $teacher = User::where('id', $id)
            ->where('role', 'teacher')
            ->where('school_id', $school->id)
            ->firstOrFail();

        $validated = $request->validate([
            'name'     => ['required', 'string', 'max:255'],
            'email'    => ['required', 'string', 'email', 'max:255', 'unique:users,email,' . $teacher->id],
            'phone'    => ['nullable', 'string', 'max:30'],
            'password' => ['nullable', 'confirmed', Rules\Password::defaults()],
        ]);

        $data = [
            'name'  => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
        ];

        if (!empty($validated['password'])) {
            $data['password'] = Hash::make($validated['password']);
        }

        $teacher->update($data);

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
