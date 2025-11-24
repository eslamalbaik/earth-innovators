<?php

namespace App\Http\Controllers;

use App\Http\Requests\JoinTeacherRequest;
use App\Models\Subject;
use App\Services\TeacherApplicationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class JoinTeacherController extends Controller
{
    public function __construct(
        private TeacherApplicationService $applicationService
    ) {}
    public function index()
    {
        $subjects = Subject::where('is_active', true)
            ->select('id', 'name_ar', 'name_en')
            ->orderBy('sort_order')
            ->get();

        $cities = [
            'الرياض',
            'جدة',
            'الدمام',
            'مكة المكرمة',
            'المدينة المنورة',
            'الخبر',
            'الظهران',
            'الطائف',
            'بريدة',
            'تبوك',
            'خميس مشيط',
            'الهفوف',
            'حائل',
            'نجران',
            'الجبيل'
        ];

        return inertia('JoinTeacher', [
            'subjects' => $subjects,
            'cities' => $cities
        ]);
    }

    public function store(JoinTeacherRequest $request)
    {
        try {
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'phone' => $request->phone,
                'password' => Hash::make($request->password),
                'role' => 'teacher',
                'email_verified_at' => now(),
            ]);

            $application = $this->applicationService->createApplication($request->validated(), $user);

            Auth::login($user);
            $request->session()->regenerate();

            return response()->json([
                'success' => true,
                'message' => 'تم إنشاء حسابك بنجاح. حسابك الآن نشط وجاهز للاستخدام.',
                'teacher_id' => $application->teacher_id,
                'redirect' => route('teacher.dashboard', absolute: false),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ أثناء إرسال الطلب. يرجى المحاولة مرة أخرى.',
                'error' => config('app.debug') ? $e->getMessage() : 'خطأ غير معروف'
            ], 500);
        }
    }

    public function getApplicationStatus(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['status' => 'not_logged_in']);
        }

        $application = \App\Models\TeacherApplication::where('user_id', $user->id)
            ->with('teacher:id,name_ar')
            ->first();

        if (!$application) {
            return response()->json(['status' => 'no_application']);
        }

        return response()->json([
            'status' => $application->status,
            'submitted_at' => $application->submitted_at,
            'reviewed_at' => $application->reviewed_at,
            'teacher' => $application->teacher
        ]);
    }
}
