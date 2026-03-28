<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Teacher;
use App\Models\User;
use App\Services\MembershipService;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    public function __construct(
        private MembershipService $membershipService
    ) {}

    public function create(): Response
    {
        $schools = User::whereIn('role', ['school', 'educational_institution'])
            ->orderBy('name')
            ->get(['id', 'name'])
            ->map(function ($school) {
                return [
                    'id' => $school->id,
                    'name' => $school->name,
                ];
            });

        return Inertia::render('Auth/Register', [
            'schools' => $schools,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $request->merge([
            'role' => $request->input('role', 'student'),
        ]);

        $rules = [
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:' . User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'phone' => ['nullable', 'string', 'max:20', 'unique:' . User::class . ',phone'],
            'role' => 'required|string|in:student,teacher,school,educational_institution',
        ];

        // يجب تضمين school_id في القواعد حتى يُمرَّر إلى $validated ويُحفظ عند التسجيل (الطالب/المعلم)
        if (in_array($request->role, ['student', 'teacher'], true)) {
            $rules['school_id'] = 'required|exists:users,id';
        }

        $validated = $request->validate($rules, [
            'name.required' => 'الاسم الكامل مطلوب.',
            'name.string' => 'الاسم يجب أن يكون نصاً صحيحاً.',
            'name.max' => 'الاسم يجب ألا يتجاوز 255 حرفاً.',
            'email.required' => 'البريد الإلكتروني مطلوب.',
            'email.email' => 'صيغة البريد الإلكتروني غير صحيحة.',
            'email.unique' => 'هذا البريد الإلكتروني مستخدم بالفعل. يرجى استخدام بريد آخر أو تسجيل الدخول.',
            'email.max' => 'البريد الإلكتروني يجب ألا يتجاوز 255 حرفاً.',
            'password.required' => 'كلمة المرور مطلوبة.',
            'password.confirmed' => 'تأكيد كلمة المرور غير متطابق.',
            'phone.string' => 'رقم الجوال يجب أن يكون نصاً صحيحاً.',
            'phone.max' => 'رقم الجوال يجب ألا يتجاوز 20 حرفاً.',
            'phone.unique' => 'هذا الرقم مستخدم بالفعل. يرجى استخدام رقم آخر أو تسجيل الدخول.',
            'role.required' => 'نوع الحساب مطلوب.',
            'role.in' => 'نوع الحساب غير صالح.',
            'school_id.required' => 'يجب اختيار المدرسة.',
            'school_id.exists' => 'المدرسة المختارة غير موجودة أو غير متاحة.',
        ]);

        if (in_array($validated['role'], ['student', 'teacher'], true)) {
            $school = User::where('id', $validated['school_id'])
                ->whereIn('role', ['school', 'educational_institution'])
                ->first();

            if (!$school) {
                return back()->withErrors([
                    'school_id' => 'المدرسة المختارة غير موجودة أو غير متاحة.',
                ])->withInput();
            }
        }

        $userData = [
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'phone' => $validated['phone'] ?? null,
            'role' => $validated['role'],
        ];

        if (in_array($validated['role'], ['student', 'teacher'], true)) {
            $userData['school_id'] = $validated['school_id'];
        }

        try {
            DB::beginTransaction();

            if (in_array($validated['role'], ['student', 'teacher'], true)) {
                $userData['membership_number'] = $this->membershipService->generateMembershipNumber($validated['role']);
            }

            $user = User::create($userData);

            if ($validated['role'] === 'teacher') {
                Teacher::create([
                    'user_id' => $user->id,
                    'name_ar' => $validated['name'],
                    'name_en' => $validated['name'],
                    'city' => 'غير محدد',
                    'bio' => null,
                    'qualifications' => null,
                    'subjects' => json_encode([]),
                    'stages' => json_encode([]),
                    'experience_years' => 0,
                    'price_per_hour' => 0,
                    'nationality' => 'إماراتي',
                    'gender' => null,
                    'neighborhoods' => json_encode([]),
                    'is_verified' => false,
                    'is_active' => false,
                ]);
            }

            DB::commit();

            event(new Registered($user));
            Auth::login($user);

            return redirect(route('dashboard', absolute: false));
        } catch (\Exception $e) {
            DB::rollBack();

            return back()->withErrors([
                'error' => 'حدث خطأ أثناء إنشاء الحساب: ' . $e->getMessage(),
            ])->withInput();
        }
    }
}
