<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class AdminPermissionsController extends Controller
{
    /**
     * عرض صفحة إدارة الصلاحيات
     */
    public function index(Request $request)
    {
        // الحصول على جميع مستخدمي الإدارة (مشرفو النظام، منسقو دعم المؤسسات تعليمية، والمدراء)
        $adminUsers = User::whereIn('role', ['admin', 'system_supervisor', 'school_support_coordinator'])
            ->select('id', 'name', 'email', 'phone', 'role', 'created_at', 'email_verified_at')
            ->when($request->filled('search'), function ($q) use ($request) {
                $s = $request->search;
                $q->where(function ($query) use ($s) {
                    $query->where('name', 'like', "%{$s}%")
                        ->orWhere('email', 'like', "%{$s}%");
                });
            })
            ->when($request->filled('role') && $request->role !== 'all', function ($q) use ($request) {
                $q->where('role', $request->role);
            })
            ->orderBy('created_at', 'desc')
            ->paginate(20)
            ->withQueryString()
            ->through(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => $user->phone,
                    'role' => $user->role,
                    'role_label' => $this->getRoleLabel($user->role),
                    'created_at' => $user->created_at->format('Y-m-d H:i'),
                    'email_verified_at' => $user->email_verified_at?->format('Y-m-d H:i'),
                ];
            });

        // الإحصائيات
        $stats = [
            'system_supervisors' => User::where('role', 'system_supervisor')->count(),
            'school_support_coordinators' => User::where('role', 'school_support_coordinator')->count(),
            'admins' => User::where('role', 'admin')->count(),
            'total_admin_users' => User::whereIn('role', ['admin', 'system_supervisor', 'school_support_coordinator'])->count(),
        ];

        return Inertia::render('Admin/Permissions/Index', [
            'adminUsers' => $adminUsers,
            'stats' => $stats,
            'filters' => $request->only(['search', 'role']),
        ]);
    }

    /**
     * عرض نموذج إضافة مستخدم إداري جديد
     */
    public function create()
    {
        return Inertia::render('Admin/Permissions/Create');
    }

    /**
     * حفظ مستخدم إداري جديد
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'phone' => 'nullable|string|max:20',
            'password' => 'required|string|min:8|confirmed',
            'role' => 'required|in:admin,system_supervisor,school_support_coordinator',
        ], [
            'name.required' => 'الاسم مطلوب',
            'email.required' => 'البريد الإلكتروني مطلوب',
            'email.email' => 'البريد الإلكتروني غير صحيح',
            'email.unique' => 'هذا البريد الإلكتروني مسجل مسبقاً',
            'password.required' => 'كلمة المرور مطلوبة',
            'password.min' => 'كلمة المرور يجب أن تكون 8 أحرف على الأقل',
            'password.confirmed' => 'تأكيد كلمة المرور غير متطابق',
            'role.required' => 'نوع الصلاحية مطلوب',
            'role.in' => 'نوع الصلاحية غير صحيح',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'],
            'email_verified_at' => now(),
        ]);

        return redirect()
            ->route('admin.permissions.index')
            ->with('success', 'تم إضافة المستخدم الإداري بنجاح');
    }

    /**
     * عرض نموذج تعديل مستخدم إداري
     */
    public function edit(User $user)
    {
        // التأكد من أن المستخدم هو مستخدم إداري
        if (!in_array($user->role, ['admin', 'system_supervisor', 'school_support_coordinator'])) {
            abort(404);
        }

        return Inertia::render('Admin/Permissions/Edit', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'role' => $user->role,
            ],
        ]);
    }

    /**
     * تحديث مستخدم إداري
     */
    public function update(Request $request, User $user)
    {
        // التأكد من أن المستخدم هو مستخدم إداري
        if (!in_array($user->role, ['admin', 'system_supervisor', 'school_support_coordinator'])) {
            abort(404);
        }

        // منع المستخدم من تعديل صلاحياته الخاصة
        if ($user->id === auth()->id() && $request->role !== $user->role) {
            return back()->withErrors([
                'role' => 'لا يمكنك تعديل صلاحياتك الخاصة'
            ]);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'phone' => 'nullable|string|max:20',
            'password' => 'nullable|string|min:8|confirmed',
            'role' => 'required|in:admin,system_supervisor,school_support_coordinator',
        ], [
            'name.required' => 'الاسم مطلوب',
            'email.required' => 'البريد الإلكتروني مطلوب',
            'email.email' => 'البريد الإلكتروني غير صحيح',
            'email.unique' => 'هذا البريد الإلكتروني مسجل مسبقاً',
            'password.min' => 'كلمة المرور يجب أن تكون 8 أحرف على الأقل',
            'password.confirmed' => 'تأكيد كلمة المرور غير متطابق',
            'role.required' => 'نوع الصلاحية مطلوب',
            'role.in' => 'نوع الصلاحية غير صحيح',
        ]);

        $updateData = [
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
            'role' => $validated['role'],
        ];

        if (!empty($validated['password'])) {
            $updateData['password'] = Hash::make($validated['password']);
        }

        $user->update($updateData);

        return redirect()
            ->route('admin.permissions.index')
            ->with('success', 'تم تحديث المستخدم الإداري بنجاح');
    }

    /**
     * حذف مستخدم إداري
     */
    public function destroy(User $user)
    {
        // التأكد من أن المستخدم هو مستخدم إداري
        if (!in_array($user->role, ['admin', 'system_supervisor', 'school_support_coordinator'])) {
            abort(404);
        }

        // منع حذف المستخدم الحالي
        if ($user->id === auth()->id()) {
            return back()->with('error', 'لا يمكنك حذف حسابك الخاص');
        }

        $user->delete();

        return redirect()
            ->route('admin.permissions.index')
            ->with('success', 'تم حذف المستخدم الإداري بنجاح');
    }

    /**
     * الحصول على تسمية الدور بالعربية
     */
    private function getRoleLabel($role): string
    {
        return match ($role) {
            'system_supervisor' => 'مشرف النظام',
            'school_support_coordinator' => 'منسق دعم المؤسسات تعليمية',
            'admin' => 'مدير',
            default => $role,
        };
    }
}

