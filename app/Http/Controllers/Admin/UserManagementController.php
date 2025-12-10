<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class UserManagementController extends Controller
{
    /**
     * عرض قائمة المستخدمين
     */
    public function index(Request $request)
    {
        $users = User::select('id', 'name', 'email', 'phone', 'role', 'school_id', 'points', 'created_at')
            ->with('school:id,name')
            ->when($request->filled('search'), function ($q) use ($request) {
                $s = $request->search;
                $q->where(function ($query) use ($s) {
                    $query->where('id', 'like', "%{$s}%")
                        ->orWhere('name', 'like', "%{$s}%")
                        ->orWhere('email', 'like', "%{$s}%")
                        ->orWhere('phone', 'like', "%{$s}%");
                });
            })
            ->when($request->filled('role') && $request->role !== 'all', function ($q) use ($request) {
                $q->where('role', $request->role);
            })
            ->orderBy('id', 'desc')
            ->paginate(20)
            ->withQueryString()
            ->through(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => $user->phone,
                    'role' => $user->role,
                    'school_id' => $user->school_id,
                    'school_name' => $user->school->name ?? '—',
                    'points' => $user->points ?? 0,
                    'created_at' => $user->created_at->format('Y-m-d H:i'),
                ];
            });
            
        $stats = [
            'total' => User::count(),
            'admins' => User::where('role', 'admin')->count(),
            'teachers' => User::where('role', 'teacher')->count(),
            'students' => User::where('role', 'student')->count(),
            'schools' => User::where('role', 'school')->count(),
        ];

        // Get schools for edit modal
        $schools = User::where('role', 'school')
            ->select('id', 'name')
            ->orderBy('name')
            ->get();

        return Inertia::render('Admin/Users/Index', [
            'users' => $users,
            'stats' => $stats,
            'schools' => $schools,
            'filters' => $request->only(['search', 'role'])
        ]);
    }

    /**
     * عرض نموذج إنشاء مستخدم جديد
     */
    public function create()
    {
        $schools = User::where('role', 'school')
            ->select('id', 'name')
            ->orderBy('name')
            ->get();

        return Inertia::render('Admin/Users/Create', [
            'schools' => $schools,
        ]);
    }

    /**
     * حفظ مستخدم جديد
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'phone' => 'nullable|string|max:20',
            'password' => 'required|string|min:8|confirmed',
            'role' => 'required|in:admin,teacher,student,school',
            'school_id' => 'nullable|exists:users,id',
            'points' => 'nullable|integer|min:0',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'],
            'school_id' => $validated['school_id'] ?? null,
            'points' => $validated['points'] ?? 0,
            'email_verified_at' => now(),
        ]);

        return redirect()
            ->route('admin.users.index')
            ->with('success', 'تم إنشاء المستخدم بنجاح');
    }

    /**
     * عرض تفاصيل مستخدم
     */
    public function show(User $user)
    {
        $user->load('school:id,name');

        // Get user contributions
        $contributions = $this->getUserContributions($user);

        return Inertia::render('Admin/Users/Show', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'role' => $user->role,
                'school' => $user->school ? [
                    'id' => $user->school->id,
                    'name' => $user->school->name,
                ] : null,
                'school_id' => $user->school_id,
                'points' => $user->points ?? 0,
                'image' => $user->image,
                'created_at' => $user->created_at->format('Y-m-d H:i'),
                'email_verified_at' => $user->email_verified_at?->format('Y-m-d H:i'),
            ],
            'contributions' => $contributions,
        ]);
    }

    /**
     * الحصول على مساهمات المستخدم
     */
    private function getUserContributions(User $user): array
    {
        // Projects (for students)
        $projects = \App\Models\Project::where('user_id', $user->id)
            ->selectRaw('
                COUNT(*) as total,
                SUM(CASE WHEN status = "approved" THEN 1 ELSE 0 END) as approved,
                SUM(CASE WHEN status = "pending" THEN 1 ELSE 0 END) as pending,
                SUM(CASE WHEN status = "rejected" THEN 1 ELSE 0 END) as rejected
            ')
            ->first();

        // Publications (for teachers and schools)
        $publications = \App\Models\Publication::where('author_id', $user->id)
            ->selectRaw('
                COUNT(*) as total,
                SUM(CASE WHEN status = "approved" THEN 1 ELSE 0 END) as approved,
                SUM(CASE WHEN status = "pending" THEN 1 ELSE 0 END) as pending,
                SUM(CASE WHEN status = "rejected" THEN 1 ELSE 0 END) as rejected,
                SUM(views) as total_views,
                SUM(likes_count) as total_likes
            ')
            ->first();

        // Badges
        $badges = \App\Models\UserBadge::where('user_id', $user->id)
            ->with('badge:id,name,name_ar,image')
            ->select('id', 'badge_id', 'created_at')
            ->latest()
            ->limit(10)
            ->get()
            ->map(function ($userBadge) {
                return [
                    'id' => $userBadge->id,
                    'badge' => [
                        'id' => $userBadge->badge->id ?? null,
                        'name' => $userBadge->badge->name_ar ?? $userBadge->badge->name ?? 'غير معروف',
                        'image' => $userBadge->badge->image ?? null,
                    ],
                    'earned_at' => $userBadge->created_at->format('Y-m-d'),
                ];
            });

        $totalBadges = \App\Models\UserBadge::where('user_id', $user->id)->count();

        // Teacher projects (if user is a teacher)
        $teacherProjects = [];
        if ($user->role === 'teacher') {
            $teacher = \App\Models\Teacher::where('user_id', $user->id)->first();
            if ($teacher) {
                $teacherProjects = \App\Models\Project::where('teacher_id', $teacher->id)
                    ->selectRaw('
                        COUNT(*) as total,
                        SUM(CASE WHEN status = "approved" THEN 1 ELSE 0 END) as approved
                    ')
                    ->first();
            }
        }

        // Challenges (if user created any)
        $challenges = \App\Models\Challenge::where('created_by', $user->id)
            ->selectRaw('
                COUNT(*) as total,
                SUM(CASE WHEN status = "active" THEN 1 ELSE 0 END) as active,
                SUM(CASE WHEN status = "completed" THEN 1 ELSE 0 END) as completed
            ')
            ->first();

        return [
            'projects' => [
                'total' => (int) ($projects->total ?? 0),
                'approved' => (int) ($projects->approved ?? 0),
                'pending' => (int) ($projects->pending ?? 0),
                'rejected' => (int) ($projects->rejected ?? 0),
            ],
            'publications' => [
                'total' => (int) ($publications->total ?? 0),
                'approved' => (int) ($publications->approved ?? 0),
                'pending' => (int) ($publications->pending ?? 0),
                'rejected' => (int) ($publications->rejected ?? 0),
                'total_views' => (int) ($publications->total_views ?? 0),
                'total_likes' => (int) ($publications->total_likes ?? 0),
            ],
            'badges' => [
                'total' => $totalBadges,
                'list' => $badges,
            ],
            'teacher_projects' => $teacherProjects ? [
                'total' => (int) ($teacherProjects->total ?? 0),
                'approved' => (int) ($teacherProjects->approved ?? 0),
            ] : null,
            'challenges' => [
                'total' => (int) ($challenges->total ?? 0),
                'active' => (int) ($challenges->active ?? 0),
                'completed' => (int) ($challenges->completed ?? 0),
            ],
        ];
    }

    /**
     * عرض نموذج تعديل مستخدم
     */
    public function edit(User $user)
    {
        $schools = User::where('role', 'school')
            ->select('id', 'name')
            ->orderBy('name')
            ->get();

        return Inertia::render('Admin/Users/Edit', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'role' => $user->role,
                'school_id' => $user->school_id,
                'points' => $user->points ?? 0,
                'image' => $user->image,
            ],
            'schools' => $schools,
        ]);
    }

    /**
     * تحديث مستخدم
     */
    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'phone' => 'nullable|string|max:20',
            'password' => 'nullable|string|min:8|confirmed',
            'role' => 'required|in:admin,teacher,student,school',
            'school_id' => 'nullable|exists:users,id',
            'points' => 'nullable|integer|min:0',
        ]);

        $updateData = [
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
            'role' => $validated['role'],
            'school_id' => $validated['school_id'] ?? null,
            'points' => $validated['points'] ?? 0,
        ];

        if (!empty($validated['password'])) {
            $updateData['password'] = Hash::make($validated['password']);
        }

        $user->update($updateData);

        return redirect()
            ->route('admin.users.index')
            ->with('success', 'تم تحديث المستخدم بنجاح');
    }

    /**
     * حذف مستخدم
     */
    public function destroy(User $user)
    {
        // منع حذف المستخدم الحالي
        if ($user->id === auth()->id()) {
            return back()->with('error', 'لا يمكنك حذف حسابك الخاص');
        }

        $user->delete();

        return redirect()
            ->route('admin.users.index')
            ->with('success', 'تم حذف المستخدم بنجاح');
    }

    /**
     * تحديث دور المستخدم (للتوافق مع الكود القديم)
     */
    public function updateRole(Request $request, User $user)
    {
        $request->validate([
            'role' => 'required|in:admin,teacher,student,school'
        ]);
        
        $user->update(['role' => $request->role]);
        
        return back()->with('success', 'تم تحديث صلاحية المستخدم');
    }
}
