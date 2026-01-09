<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\UserPackage;
use App\Models\Payment;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class AdminSubscriptionController extends Controller
{
    /**
     * عرض صفحة الاشتراكات والمدفوعات
     */
    public function index(Request $request)
    {
        $type = $request->get('type', 'subscriptions'); // subscriptions or payments

        // الاشتراكات (UserPackages)
        $subscriptions = UserPackage::with(['user:id,name,email', 'package:id,name_ar,price,currency'])
            ->when($request->filled('search'), function ($q) use ($request) {
                $search = $request->search;
                $q->where(function ($query) use ($search) {
                    $query->whereHas('user', function ($userQuery) use ($search) {
                        $userQuery->where('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%");
                    })
                    ->orWhereHas('package', function ($packageQuery) use ($search) {
                        $packageQuery->where('name_ar', 'like', "%{$search}%");
                    })
                    ->orWhere('transaction_id', 'like', "%{$search}%");
                });
            })
            ->when($request->filled('status') && $request->status !== 'all', function ($q) use ($request) {
                $q->where('status', $request->status);
            })
            ->when($request->filled('date_from'), function ($q) use ($request) {
                $q->whereDate('created_at', '>=', $request->date_from);
            })
            ->when($request->filled('date_to'), function ($q) use ($request) {
                $q->whereDate('created_at', '<=', $request->date_to);
            })
            ->latest('created_at')
            ->paginate(20, ['*'], 'subscriptions_page')
            ->withQueryString()
            ->through(function ($subscription) {
                return [
                    'id' => $subscription->id,
                    'user_id' => $subscription->user_id,
                    'user_name' => $subscription->user->name ?? 'غير معروف',
                    'user_email' => $subscription->user->email ?? '—',
                    'package_id' => $subscription->package_id,
                    'package_name' => $subscription->package->name_ar ?? 'غير محدد',
                    'start_date' => $subscription->start_date->format('Y-m-d'),
                    'end_date' => $subscription->end_date->format('Y-m-d'),
                    'status' => $subscription->status,
                    'auto_renew' => $subscription->auto_renew,
                    'paid_amount' => $subscription->paid_amount ?? 0,
                    'currency' => $subscription->package->currency ?? 'AED',
                    'payment_method' => $subscription->payment_method ?? '—',
                    'transaction_id' => $subscription->transaction_id ?? '—',
                    'created_at' => $subscription->created_at->format('Y-m-d H:i'),
                ];
            });

        // المدفوعات (Payments)
        $payments = Payment::with([
            'student:id,name,email',
            'teacher:id,name_ar,user_id',
            'teacher.user:id,name',
            'booking:id,subject'
        ])
            ->when($request->filled('search'), function ($q) use ($request) {
                $search = $request->search;
                $q->where(function ($query) use ($search) {
                    $query->whereHas('student', function ($userQuery) use ($search) {
                        $userQuery->where('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%");
                    })
                    ->orWhere('transaction_id', 'like', "%{$search}%")
                    ->orWhere('payment_reference', 'like', "%{$search}%");
                });
            })
            ->when($request->filled('payment_status') && $request->payment_status !== 'all', function ($q) use ($request) {
                $q->where('status', $request->payment_status);
            })
            ->when($request->filled('payment_method_filter') && $request->payment_method_filter !== 'all', function ($q) use ($request) {
                $q->where('payment_method', $request->payment_method_filter);
            })
            ->when($request->filled('date_from'), function ($q) use ($request) {
                $q->whereDate('created_at', '>=', $request->date_from);
            })
            ->when($request->filled('date_to'), function ($q) use ($request) {
                $q->whereDate('created_at', '<=', $request->date_to);
            })
            ->latest('created_at')
            ->paginate(20, ['*'], 'payments_page')
            ->withQueryString()
            ->through(function ($payment) {
                return [
                    'id' => $payment->id,
                    'booking_id' => $payment->booking_id,
                    'student_id' => $payment->student_id,
                    'student_name' => $payment->student->name ?? 'غير معروف',
                    'student_email' => $payment->student->email ?? '—',
                    'teacher_name' => $payment->teacher ? ($payment->teacher->name_ar ?? $payment->teacher->user->name ?? 'غير معروف') : '—',
                    'subject' => $payment->booking->subject ?? '—',
                    'amount' => $payment->amount,
                    'currency' => $payment->currency ?? 'AED',
                    'status' => $payment->status,
                    'payment_method' => $payment->payment_method ?? '—',
                    'payment_gateway' => $payment->payment_gateway ?? '—',
                    'transaction_id' => $payment->transaction_id ?? '—',
                    'payment_reference' => $payment->payment_reference ?? '—',
                    'paid_at' => $payment->paid_at?->format('Y-m-d H:i'),
                    'created_at' => $payment->created_at->format('Y-m-d H:i'),
                ];
            });

        // إحصائيات الاشتراكات
        $subscriptionStats = [
            'total' => UserPackage::count(),
            'active' => UserPackage::where('status', 'active')->count(),
            'expired' => UserPackage::where('status', 'expired')->count(),
            'cancelled' => UserPackage::where('status', 'cancelled')->count(),
            'total_revenue' => (float) UserPackage::sum('paid_amount'),
            'auto_renew_count' => UserPackage::where('auto_renew', true)->where('status', 'active')->count(),
        ];

        // إحصائيات المدفوعات
        $paymentStats = [
            'total' => Payment::count(),
            'completed' => Payment::where('status', 'completed')->count(),
            'pending' => Payment::where('status', 'pending')->count(),
            'failed' => Payment::where('status', 'failed')->count(),
            'refunded' => Payment::where('status', 'refunded')->count(),
            'total_revenue' => (float) Payment::where('status', 'completed')->sum('amount'),
            'pending_amount' => (float) Payment::where('status', 'pending')->sum('amount'),
        ];

        // إحصائيات إجمالية
        $totalStats = [
            'total_subscriptions' => $subscriptionStats['total'],
            'total_payments' => $paymentStats['total'],
            'total_revenue' => $subscriptionStats['total_revenue'] + $paymentStats['total_revenue'],
            'active_subscriptions' => $subscriptionStats['active'],
        ];

        return Inertia::render('Admin/Subscriptions/Index', [
            'subscriptions' => $subscriptions,
            'payments' => $payments,
            'subscriptionStats' => $subscriptionStats,
            'paymentStats' => $paymentStats,
            'totalStats' => $totalStats,
            'filters' => $request->only([
                'type', 'search', 'status', 'payment_status',
                'payment_method_filter', 'date_from', 'date_to'
            ]),
        ]);
    }

    /**
     * عرض تفاصيل اشتراك
     */
    public function showSubscription(UserPackage $subscription)
    {
        $subscription->load(['user', 'package']);

        return Inertia::render('Admin/Subscriptions/ShowSubscription', [
            'subscription' => [
                'id' => $subscription->id,
                'user' => [
                    'id' => $subscription->user->id,
                    'name' => $subscription->user->name,
                    'email' => $subscription->user->email,
                ],
                'package' => [
                    'id' => $subscription->package->id,
                    'name' => $subscription->package->name_ar,
                    'price' => $subscription->package->price,
                    'currency' => $subscription->package->currency,
                ],
                'start_date' => $subscription->start_date ? $subscription->start_date->format('Y-m-d') : null,
                'end_date' => $subscription->end_date ? $subscription->end_date->format('Y-m-d') : null,
                'status' => $subscription->status,
                'auto_renew' => $subscription->auto_renew,
                'paid_amount' => $subscription->paid_amount,
                'payment_method' => $subscription->payment_method,
                'transaction_id' => $subscription->transaction_id,
                'created_at' => $subscription->created_at->format('Y-m-d H:i'),
            ],
        ]);
    }
}
