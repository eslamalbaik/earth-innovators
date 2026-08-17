<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CustomRole;
use App\Support\RoleLabels;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class CustomRoleController extends Controller
{
    public function index(Request $request)
    {
        $customRoles = CustomRole::withCount('users')
            ->when($request->filled('search'), function ($q) use ($request) {
                $s = $request->search;
                $q->where(function ($query) use ($s) {
                    $query->where('name_ar', 'like', "%{$s}%")
                        ->orWhere('name_en', 'like', "%{$s}%")
                        ->orWhere('slug', 'like', "%{$s}%");
                });
            })
            ->when($request->filled('base_role') && $request->base_role !== 'all', function ($q) use ($request) {
                $q->where('base_role', $request->base_role);
            })
            ->orderBy('created_at', 'desc')
            ->paginate(20)
            ->withQueryString()
            ->through(function ($customRole) {
                return [
                    'id' => $customRole->id,
                    'slug' => $customRole->slug,
                    'name_ar' => $customRole->name_ar,
                    'name_en' => $customRole->name_en,
                    'base_role' => $customRole->base_role,
                    'base_role_label' => RoleLabels::label($customRole->base_role),
                    'is_active' => $customRole->is_active,
                    'users_count' => $customRole->users_count,
                    'created_at' => $customRole->created_at->format('Y-m-d H:i'),
                ];
            });

        return Inertia::render('Admin/CustomRoles/Index', [
            'customRoles' => $customRoles,
            'baseRoles' => $this->baseRoleOptions(),
            'filters' => $request->only(['search', 'base_role']),
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/CustomRoles/Create', [
            'baseRoles' => $this->baseRoleOptions(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name_ar' => 'required|string|max:255',
            'name_en' => 'nullable|string|max:255',
            'slug' => 'required|string|max:255|alpha_dash|unique:custom_roles,slug',
            'base_role' => ['required', Rule::in(CustomRole::BASE_ROLES)],
            'is_active' => 'boolean',
        ], [
            'name_ar.required' => 'الاسم بالعربية مطلوب',
            'slug.required' => 'المعرّف مطلوب',
            'slug.alpha_dash' => 'المعرّف يجب أن يحتوي على أحرف/أرقام/شرطات فقط',
            'slug.unique' => 'هذا المعرّف مستخدم مسبقاً',
            'base_role.required' => 'الدور الأساسي مطلوب',
            'base_role.in' => 'الدور الأساسي غير صحيح',
        ]);

        $validated['is_active'] = $validated['is_active'] ?? true;
        $validated['created_by'] = Auth::id();

        CustomRole::create($validated);

        return redirect()
            ->route('admin.custom-roles.index')
            ->with('success', 'تم إضافة الدور بنجاح');
    }

    public function edit(CustomRole $customRole)
    {
        return Inertia::render('Admin/CustomRoles/Edit', [
            'customRole' => [
                'id' => $customRole->id,
                'slug' => $customRole->slug,
                'name_ar' => $customRole->name_ar,
                'name_en' => $customRole->name_en,
                'base_role' => $customRole->base_role,
                'is_active' => $customRole->is_active,
            ],
            'baseRoles' => $this->baseRoleOptions(),
        ]);
    }

    public function update(Request $request, CustomRole $customRole)
    {
        $validated = $request->validate([
            'name_ar' => 'required|string|max:255',
            'name_en' => 'nullable|string|max:255',
            'slug' => ['required', 'string', 'max:255', 'alpha_dash', Rule::unique('custom_roles', 'slug')->ignore($customRole->id)],
            'base_role' => ['required', Rule::in(CustomRole::BASE_ROLES)],
            'is_active' => 'boolean',
        ], [
            'name_ar.required' => 'الاسم بالعربية مطلوب',
            'slug.required' => 'المعرّف مطلوب',
            'slug.alpha_dash' => 'المعرّف يجب أن يحتوي على أحرف/أرقام/شرطات فقط',
            'slug.unique' => 'هذا المعرّف مستخدم مسبقاً',
            'base_role.required' => 'الدور الأساسي مطلوب',
            'base_role.in' => 'الدور الأساسي غير صحيح',
        ]);

        $validated['is_active'] = $validated['is_active'] ?? true;

        $customRole->update($validated);

        return redirect()
            ->route('admin.custom-roles.index')
            ->with('success', 'تم تحديث الدور بنجاح');
    }

    public function destroy(CustomRole $customRole)
    {
        if ($customRole->users()->count() > 0) {
            return back()->with('error', 'لا يمكن حذف هذا الدور لأنه مرتبط بمستخدمين. عطّله بدلاً من ذلك.');
        }

        $customRole->delete();

        return redirect()
            ->route('admin.custom-roles.index')
            ->with('success', 'تم حذف الدور بنجاح');
    }

    /**
     * @return array<int, array{value: string, label: string}>
     */
    private function baseRoleOptions(): array
    {
        return array_map(
            fn (string $role) => ['value' => $role, 'label' => RoleLabels::label($role)],
            CustomRole::BASE_ROLES
        );
    }
}
