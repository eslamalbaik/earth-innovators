<?php

namespace App\Http\Controllers;

use App\Models\InviteCode;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Shared invite-code management for the "student/teacher joins via link or
 * code" path (requirement 6.1). A school issues teacher codes and student
 * codes; a teacher issues student codes scoped to themselves. RBAC is
 * enforced here rather than per-role controllers so the scoping rule lives
 * in one place: a school only ever sees/creates its own codes, a teacher
 * only ever sees/creates codes tied to their own teacher_id.
 */
class InviteCodeController extends Controller
{
    public function index(): Response
    {
        $user = Auth::user();

        $query = InviteCode::query()->where('school_id', $this->schoolIdFor($user));

        if ($user->isTeacher()) {
            $query->where('role', 'student')->where('teacher_id', $user->id);
        }

        return Inertia::render($user->isTeacher() ? 'Teacher/InviteCodes/Index' : 'School/InviteCodes/Index', [
            'codes' => $query->latest()->get(),
        ]);
    }

    public function store(Request $request)
    {
        $user = Auth::user();
        $allowedRoles = $user->isTeacher() ? ['student'] : ['student', 'teacher'];

        $validated = $request->validate([
            'role'      => 'required|string|in:' . implode(',', $allowedRoles),
            'grade'     => 'nullable|string|max:50',
            'section'   => 'nullable|string|max:50',
            'max_uses'  => 'nullable|integer|min:1',
            'expires_at' => 'nullable|date|after:now',
        ]);

        InviteCode::create([
            'code'       => InviteCode::generateUniqueCode(),
            'role'       => $validated['role'],
            'school_id'  => $this->schoolIdFor($user),
            'teacher_id' => $validated['role'] === 'student' && $user->isTeacher() ? $user->id : null,
            'grade'      => $validated['grade'] ?? null,
            'section'    => $validated['section'] ?? null,
            'max_uses'   => $validated['max_uses'] ?? null,
            'expires_at' => $validated['expires_at'] ?? null,
            'created_by' => $user->id,
        ]);

        return back()->with('flash', ['success' => true]);
    }

    public function destroy(InviteCode $inviteCode)
    {
        $user = Auth::user();

        abort_unless($inviteCode->school_id === $this->schoolIdFor($user)
            && (! $user->isTeacher() || $inviteCode->teacher_id === $user->id), 403);

        $inviteCode->update(['is_active' => false]);

        return back()->with('flash', ['success' => true]);
    }

    private function schoolIdFor($user): int
    {
        return $user->isSchool() ? $user->id : $user->school_id;
    }
}
