<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\Publication;
use App\Models\User;
use App\Models\UserPackage;
use App\Models\Payment;
use App\Models\Package;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class AdminDashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();

        // KPIs - المؤشرات الرئيسية
        $kpis = $this->getKPIs();

        // المستخدمون حسب التصنيف
        $usersByRole = $this->getUsersByRole();

        // المشاريع المنشورة (التي تم الموافقة عليها)
        $publishedProjects = Project::with(['user:id,name,email', 'school:id,name', 'teacher:id,name_ar'])
            ->where('status', 'approved')
            ->select('id', 'title', 'user_id', 'school_id', 'teacher_id', 'status', 'views', 'likes', 'created_at', 'approved_at')
            ->latest('approved_at')
            ->limit(10)
            ->get()
            ->map(function ($project) {
                return [
                    'id' => $project->id,
                    'title' => $project->title,
                    'student_name' => $project->user->name ?? 'غير معروف',
                    'school_name' => $project->school->name ?? 'غير محدد',
                    'teacher_name' => $project->teacher->name_ar ?? 'غير محدد',
                    'views' => $project->views ?? 0,
                    'likes' => $project->likes ?? 0,
                    'created_at' => $project->created_at->format('Y-m-d'),
                    'approved_at' => $project->approved_at?->format('Y-m-d'),
                ];
            });

        // المدفوعات الأخيرة (للاشتراكات)
        $recentPayments = Payment::with(['student:id,name,email'])
            ->where('status', 'completed')
            ->select('id', 'student_id', 'amount', 'currency', 'status', 'payment_method', 'created_at', 'paid_at')
            ->latest('paid_at')
            ->limit(10)
            ->get()
            ->map(function ($payment) {
                return [
                    'id' => $payment->id,
                    'user_name' => $payment->student->name ?? 'غير معروف',
                    'amount' => $payment->amount,
                    'currency' => $payment->currency ?? 'SAR',
                    'payment_method' => $payment->payment_method ?? 'غير محدد',
                    'paid_at' => $payment->paid_at?->format('Y-m-d H:i') ?? $payment->created_at->format('Y-m-d H:i'),
                ];
            });

        // طلبات الاشتراك (UserPackages)
        $subscriptions = UserPackage::with(['user:id,name,email,role', 'package:id,name_ar,price'])
            ->select('id', 'user_id', 'package_id', 'status', 'start_date', 'end_date', 'paid_amount', 'created_at')
            ->latest()
            ->limit(10)
            ->get()
            ->map(function ($subscription) {
                return [
                    'id' => $subscription->id,
                    'user_name' => $subscription->user->name ?? 'غير معروف',
                    'user_role' => $subscription->user->role ?? 'غير محدد',
                    'package_name' => $subscription->package->name_ar ?? 'غير محدد',
                    'status' => $subscription->status,
                    'paid_amount' => $subscription->paid_amount,
                    'start_date' => $subscription->start_date->format('Y-m-d'),
                    'end_date' => $subscription->end_date->format('Y-m-d'),
                    'created_at' => $subscription->created_at->format('Y-m-d'),
                ];
            });

        // إحصائيات المدفوعات
        $paymentStats = [
            'total_revenue' => Payment::where('status', 'completed')->sum('amount'),
            'pending_payments' => Payment::where('status', 'pending')->count(),
            'completed_payments' => Payment::where('status', 'completed')->count(),
            'failed_payments' => Payment::where('status', 'failed')->count(),
        ];

        // إحصائيات الاشتراكات
        $subscriptionStats = [
            'total_subscriptions' => UserPackage::count(),
            'active_subscriptions' => UserPackage::where('status', 'active')->count(),
            'expired_subscriptions' => UserPackage::where('status', 'expired')->count(),
            'subscription_revenue' => UserPackage::where('status', 'active')->sum('paid_amount'),
        ];

        return Inertia::render('Admin/Dashboard', [
            'user' => $user,
            'kpis' => $kpis,
            'usersByRole' => $usersByRole,
            'publishedProjects' => $publishedProjects,
            'recentPayments' => $recentPayments,
            'subscriptions' => $subscriptions,
            'paymentStats' => $paymentStats,
            'subscriptionStats' => $subscriptionStats,
        ]);
    }

    private function getKPIs(): array
    {
        return [
            'total_projects' => Project::count(),
            'published_projects' => Project::where('status', 'approved')->count(),
            'pending_projects' => Project::where('status', 'pending')->count(),
            'total_users' => User::where('role', '!=', 'admin')->count(),
            'total_schools' => User::where('role', 'school')->count(),
            'total_students' => User::where('role', 'student')->count(),
            'total_teachers' => User::where('role', 'teacher')->count(),
            'total_publications' => Publication::count(),
            'approved_publications' => Publication::where('status', 'approved')->count(),
            'total_subscriptions' => UserPackage::count(),
            'active_subscriptions' => UserPackage::where('status', 'active')->count(),
            'total_revenue' => Payment::where('status', 'completed')->sum('amount'),
            'subscription_revenue' => UserPackage::where('status', 'active')->sum('paid_amount'),
        ];
    }

    private function getUsersByRole(): array
    {
        $users = User::select('role', DB::raw('COUNT(*) as count'))
            ->where('role', '!=', 'admin')
            ->groupBy('role')
            ->get()
            ->pluck('count', 'role')
            ->toArray();

        return [
            'schools' => $users['school'] ?? 0,
            'students' => $users['student'] ?? 0,
            'teachers' => $users['teacher'] ?? 0,
        ];
    }
}

