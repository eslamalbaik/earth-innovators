<?php

namespace App\Http\Controllers;

use App\Models\Package;
use App\Models\UserPackage;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PackageController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $role = $user?->role;

        $query = Package::where('is_active', true)
            ->orderBy('price');

        // تصفية الباقات حسب دور المستخدم
        if ($role === 'student') {
            // للطلاب: إظهار فقط الباقات المجانية (trial) أو المجانية
            $query->where(function ($q) {
                $q->where('is_trial', true)
                    ->orWhere('price', 0);
            });
        } elseif ($role === 'teacher') {
            // للمعلمين: إخفاء الباقات التجريبية إذا كانت مدرسته مشتركة
            $userSchool = $user->school;
            if ($userSchool && $userSchool->membership_status === 'active') {
                $query->where('is_trial', false);
            }
        }

        $packages = $query->get();

        // التحقق من اشتراك المستخدم
        $userPackage = null;
        if ($user) {
            $userPackage = UserPackage::where('user_id', $user->id)
                ->currentActive()
                ->with('package')
                ->first();
        }

        // معلومات العضوية للمعلم
        $membershipSummary = null;
        if ($role === 'teacher' && $user->school_id) {
            $school = $user->school;
            $membershipSummary = [
                'is_school_owned' => $school && $school->membership_status === 'active',
                'school_name' => $school?->name,
            ];
        }

        return Inertia::render('Packages', [
            'packages' => $packages,
            'userPackage' => $userPackage,
            'membershipSummary' => $membershipSummary,
            'trialStatus' => $role === 'student' ? ['eligible' => true] : null,
        ]);
    }

    public function show($id)
    {
        $package = Package::findOrFail($id);

        $userPackage = null;
        if (auth()->check()) {
            $userPackage = UserPackage::where('user_id', auth()->id())
                ->where('package_id', $id)
                ->currentActive()
                ->first();
        }

        return Inertia::render('Packages/Show', [
            'package' => $package,
            'userPackage' => $userPackage,
        ]);
    }
}
