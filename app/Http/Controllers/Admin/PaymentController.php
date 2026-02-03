<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\Teacher;
use App\Services\PaymentService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PaymentController extends Controller
{
    public function __construct(
        private PaymentService $paymentService
    ) {}
    public function index(Request $request)
    {
        $query = Payment::with([
            'booking:id,subject,student_id,teacher_id',
            'booking.student:id,name',
            'booking.teacher:id,name_ar,user_id',
            'booking.teacher.user:id,name',
            'package:id,name,name_ar',
            'student:id,name',
            'teacher:id,name_ar'
        ])
        ->select('id', 'booking_id', 'package_id', 'student_id', 'teacher_id', 'amount', 'currency', 'status', 'payment_method', 'payment_gateway', 'transaction_id', 'payment_reference', 'card_last_four', 'card_brand', 'paid_at', 'failed_at', 'failure_reason', 'created_at');

        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }
        if ($request->has('payment_method') && $request->payment_method !== 'all') {
            $query->where('payment_method', $request->payment_method);
        }
        if ($request->has('teacher_id') && $request->teacher_id) {
            $query->where('teacher_id', $request->teacher_id);
        }
        if ($request->has('student_id') && $request->student_id) {
            $query->where('student_id', $request->student_id);
        }
        if ($request->has('date_from') && $request->date_from) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }
        if ($request->has('date_to') && $request->date_to) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        $payments = $query->orderBy('created_at', 'desc')
            ->paginate(20)
            ->through(function ($payment) {
                $teacher_name = '—';
                $subject = '—';

                if ($payment->booking) {
                    $teacher_name = $payment->teacher->name_ar ?? $payment->booking->teacher->user->name ?? 'N/A';
                    $subject = $payment->booking->subject ?? '—';
                } elseif ($payment->package) {
                    $teacher_name = 'المنصة (اشتراك باقة)';
                    $subject = $payment->package->name_ar ?? $payment->package->name;
                }

                return [
                    'id' => $payment->id,
                    'booking_id' => $payment->booking_id,
                    'package_id' => $payment->package_id,
                    'student_name' => $payment->student->name ?? $payment->booking->student_name ?? 'N/A',
                    'teacher_name' => $teacher_name,
                    'subject' => $subject,
                    'amount' => $payment->amount,
                    'currency' => $payment->currency,
                    'status' => $payment->status,
                    'payment_method' => $payment->payment_method,
                    'payment_gateway' => $payment->payment_gateway,
                    'transaction_id' => $payment->transaction_id,
                    'payment_reference' => $payment->payment_reference,
                    'card_last_four' => $payment->card_last_four,
                    'card_brand' => $payment->card_brand,
                    'paid_at' => $payment->paid_at?->format('Y-m-d H:i'),
                    'failed_at' => $payment->failed_at?->format('Y-m-d H:i'),
                    'failure_reason' => $payment->failure_reason,
                    'created_at' => $payment->created_at->format('Y-m-d H:i'),
                ];
            });

        $baseQuery = Payment::query();
        $completedQuery = (clone $baseQuery)->where('status', 'completed');
        $pendingQuery = (clone $baseQuery)->where('status', 'pending');

        $stats = [
            'total' => (clone $baseQuery)->count(),
            'completed' => (clone $completedQuery)->count(),
            'pending' => (clone $pendingQuery)->count(),
            'failed' => (clone $baseQuery)->where('status', 'failed')->count(),
            'refunded' => (clone $baseQuery)->where('status', 'refunded')->count(),
            'totalRevenue' => (float) ($completedQuery->sum('amount') ?? 0),
            'pendingAmount' => (float) ($pendingQuery->sum('amount') ?? 0),
        ];

        $teachers = Teacher::with('user:id,name')
            ->select('id', 'name_ar', 'user_id')
            ->get()
            ->map(function ($teacher) {
                return [
                    'id' => $teacher->id,
                    'name' => $teacher->name_ar ?? $teacher->user->name ?? 'N/A',
                ];
            });

        return Inertia::render('Admin/Payments', [
            'payments' => $payments,
            'stats' => $stats,
            'teachers' => $teachers,
            'filters' => $request->only(['status', 'payment_method', 'teacher_id', 'student_id', 'date_from', 'date_to']),
        ]);
    }

    public function show($id)
    {
        $payment = Payment::with(['booking.student', 'booking.teacher.user', 'student', 'teacher'])
            ->findOrFail($id);

        return Inertia::render('Admin/Payments/Show', [
            'payment' => [
                'id' => $payment->id,
                'booking_id' => $payment->booking_id,
                'student_name' => $payment->student->name ?? $payment->booking->student_name ?? 'N/A',
                'student_email' => $payment->student->email ?? $payment->booking->student_email ?? '—',
                'teacher_name' => $payment->teacher->name_ar ?? $payment->booking->teacher->user->name ?? 'N/A',
                'subject' => $payment->booking->subject ?? '—',
                'amount' => $payment->amount,
                'currency' => $payment->currency,
                'status' => $payment->status,
                'payment_method' => $payment->payment_method,
                'payment_gateway' => $payment->payment_gateway,
                'transaction_id' => $payment->transaction_id,
                'gateway_payment_id' => $payment->gateway_payment_id,
                'payment_reference' => $payment->payment_reference,
                'card_last_four' => $payment->card_last_four,
                'card_brand' => $payment->card_brand,
                'paid_at' => $payment->paid_at?->format('Y-m-d H:i:s'),
                'failed_at' => $payment->failed_at?->format('Y-m-d H:i:s'),
                'refunded_at' => $payment->refunded_at?->format('Y-m-d H:i:s'),
                'failure_reason' => $payment->failure_reason,
                'gateway_response' => $payment->gateway_response,
                'notes' => $payment->notes,
                'created_at' => $payment->created_at->format('Y-m-d H:i:s'),
            ],
        ]);
    }

    public function cancel(Request $request, $id)
    {
        $payment = Payment::with(['booking'])
            ->findOrFail($id);

        $result = $this->paymentService->cancelPayment($payment, auth()->user());

        if ($result['success']) {
            return back()->with('success', $result['message']);
        }

        return back()->with('error', $result['message']);
    }

    public function refund(Request $request, $id)
    {
        $request->validate([
            'amount' => 'nullable|numeric|min:0',
            'comment' => 'nullable|string|max:500',
        ]);

        $payment = Payment::with(['booking.teacher'])
            ->findOrFail($id);

        $result = $this->paymentService->refundPayment(
            $payment,
            $request->get('amount'),
            $request->get('comment')
        );

        if ($result['success']) {
            return back()->with('success', $result['message']);
        }

        return back()->with('error', $result['message']);
    }
}
