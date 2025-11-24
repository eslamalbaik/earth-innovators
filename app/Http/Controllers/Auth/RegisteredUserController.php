<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Teacher;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    public function create(): Response
    {
        $schools = User::where('role', 'school')
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
        $rules = [
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:' . User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'phone' => ['nullable', 'string', 'max:20', 'unique:' . User::class . ',phone'],
            'role' => 'required|string|in:student,teacher,school',
        ];

        // إضافة شرط school_id للطلاب والمعلمين
        if (in_array($request->role, ['student', 'teacher'])) {
            $rules['school_id'] = 'required|exists:users,id';
        }

        $validated = $request->validate($rules, [
            'name.required' => 'الاسم الكامل مطلوب',
            'name.string' => 'الاسم يجب أن يكون نصاً صحيحاً',
            'name.max' => 'الاسم يجب ألا يتجاوز 255 حرفاً',
            'email.required' => 'البريد الإلكتروني مطلوب',
            'email.email' => 'البريد الإلكتروني غير صحيح',
            'email.unique' => 'هذا البريد الإلكتروني مسجل لمستخدم آخر في نظامنا. يرجى استخدام بريد آخر أو تسجيل الدخول.',
            'email.max' => 'البريد الإلكتروني يجب ألا يتجاوز 255 حرفاً',
            'password.required' => 'كلمة المرور مطلوبة',
            'password.confirmed' => 'كلمة المرور وتأكيدها غير متطابقين',
            'password.min' => 'كلمة المرور يجب أن تكون على الأقل 8 أحرف',
            'phone.string' => 'رقم الجوال يجب أن يكون نصاً صحيحاً',
            'phone.max' => 'رقم الجوال يجب ألا يتجاوز 20 حرفاً',
            'phone.unique' => '⚠️ هذا الرقم مسجل لمستخدم آخر في نظامنا. يرجى استخدام رقم آخر أو تسجيل الدخول إذا كان هذا حسابك.',
            'role.required' => 'نوع الحساب مطلوب',
            'role.in' => 'نوع الحساب غير صحيح',
            'school_id.required' => 'يجب اختيار المدرسة',
            'school_id.exists' => 'المدرسة المختارة غير موجودة. يرجى التأكد من اختيار مدرسة صحيحة من القائمة.',
        ]);

        // التحقق من أن المدرسة موجودة ومفعلة (إذا كانت مدرسة)
        if (in_array($validated['role'], ['student', 'teacher']) && isset($validated['school_id'])) {
            $school = User::where('id', $validated['school_id'])
                ->where('role', 'school')
                ->first();

            if (!$school) {
                return back()->withErrors([
                    'school_id' => 'المدرسة المختارة غير موجودة. يرجى التأكد من اختيار مدرسة صحيحة من القائمة.',
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

        // إضافة school_id للطلاب والمعلمين فقط
        if (in_array($validated['role'], ['student', 'teacher']) && isset($validated['school_id'])) {
            $userData['school_id'] = $validated['school_id'];
        }

        try {
            DB::beginTransaction();

            $user = User::create($userData);

            // إنشاء Teacher record إذا كان role = teacher
            if ($validated['role'] === 'teacher') {
                Teacher::create([
                    'user_id' => $user->id,
                    'name_ar' => $validated['name'],
                    'name_en' => $validated['name'],
                    'city' => 'غير محدد', // قيمة افتراضية لأن الحقل مطلوب
                    'bio' => null,
                    'qualifications' => null,
                    'subjects' => json_encode([]),
                    'stages' => json_encode([]),
                    'experience_years' => 0,
                    'price_per_hour' => 0,
                    'nationality' => 'سعودي',
                    'gender' => null,
                    'neighborhoods' => json_encode([]),
                    'is_verified' => true, // معتمد تلقائياً
                    'is_active' => true, // نشط تلقائياً
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
