<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class StudentPaymentController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();

        $query = Payment::with([
            'booking:id,teacher_id,subject',
            'booking.teacher:id,name_ar,user_id',
            'booking.teacher.user:id,name',
            'package:id,name,name_ar'
        ])
            ->select('id', 'booking_id', 'package_id', 'amount', 'currency', 'status', 'payment_method', 'payment_gateway', 'transaction_id', 'payment_reference', 'paid_at', 'failed_at', 'created_at')
            ->where('student_id', $user->id);

        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->has('payment_method') && $request->payment_method !== 'all') {
            $query->where('payment_method', $request->payment_method);
        }

        $payments = $query->orderBy('created_at', 'desc')
            ->paginate(15)
            ->through(function ($payment) {
                $teacher_name = '—';
                $subject = '—';

                if ($payment->booking) {
                    $teacher_name = $payment->booking->teacher->name_ar ?? $payment->booking->teacher->user->name ?? 'N/A';
                    $subject = $payment->booking->subject ?? '—';
                } elseif ($payment->package) {
                    $teacher_name = 'المنصة (اشتراك باقة)';
                    $subject = $payment->package->name_ar ?? $payment->package->name;
                }

                return [
                    'id' => $payment->id,
                    'booking_id' => $payment->booking_id,
                    'package_id' => $payment->package_id,
                    'teacher_name' => $teacher_name,
                    'subject' => $subject,
                    'amount' => $payment->amount,
                    'currency' => $payment->currency,
                    'status' => $payment->status,
                    'payment_method' => $payment->payment_method,
                    'payment_gateway' => $payment->payment_gateway,
                    'transaction_id' => $payment->transaction_id,
                    'payment_reference' => $payment->payment_reference,
                    'paid_at' => $payment->paid_at?->format('Y-m-d H:i'),
                    'failed_at' => $payment->failed_at?->format('Y-m-d H:i'),
                    'created_at' => $payment->created_at->format('Y-m-d H:i'),
                ];
            });

        $baseQuery = Payment::where('student_id', $user->id);
        $completedQuery = (clone $baseQuery)->where('status', 'completed');

        $stats = [
            'total' => (clone $baseQuery)->count(),
            'completed' => (clone $completedQuery)->count(),
            'pending' => (clone $baseQuery)->where('status', 'pending')->count(),
            'failed' => (clone $baseQuery)->where('status', 'failed')->count(),
            'totalPaid' => (float) ($completedQuery->sum('amount') ?? 0),
        ];

        return Inertia::render('Student/Payments', [
            'payments' => $payments,
            'stats' => $stats,
            'filters' => $request->only(['status', 'payment_method']),
        ]);
    }
}
