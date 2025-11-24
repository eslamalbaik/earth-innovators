<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Services\PaymentService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class TeacherPaymentController extends Controller
{
    public function __construct(
        private PaymentService $paymentService
    ) {}

    public function index(Request $request)
    {
        $user = Auth::user();
        $teacher = $user->teacher;

        if (!$teacher) {
            return redirect()->route('dashboard')->with('error', 'لم يتم العثور على بيانات المعلم');
        }

        $query = Payment::with(['booking:id,subject,student_id', 'booking.student:id,name,email', 'student:id,name,email'])
            ->select('id', 'booking_id', 'student_id', 'amount', 'currency', 'status', 'payment_method', 'payment_gateway', 'transaction_id', 'payment_reference', 'paid_at', 'failed_at', 'created_at')
            ->where('teacher_id', $teacher->id);

        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->has('payment_method') && $request->payment_method !== 'all') {
            $query->where('payment_method', $request->payment_method);
        }

        if ($request->has('date_from') && $request->date_from) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }
        if ($request->has('date_to') && $request->date_to) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        $payments = $query->orderBy('created_at', 'desc')
            ->paginate(15)
            ->through(function ($payment) {
                return [
                    'id' => $payment->id,
                    'booking_id' => $payment->booking_id,
                    'student_name' => $payment->student->name ?? $payment->booking->student_name ?? 'N/A',
                    'student_email' => $payment->student->email ?? $payment->booking->student_email ?? '—',
                    'subject' => $payment->booking->subject ?? '—',
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

        $baseQuery = Payment::where('teacher_id', $teacher->id);
        $completedQuery = (clone $baseQuery)->where('status', 'completed');
        $pendingQuery = (clone $baseQuery)->where('status', 'pending');

        $stats = [
            'total' => (clone $baseQuery)->count(),
            'completed' => (clone $completedQuery)->count(),
            'pending' => (clone $pendingQuery)->count(),
            'failed' => (clone $baseQuery)->where('status', 'failed')->count(),
            'totalEarnings' => (float) ($completedQuery->sum('amount') ?? 0),
            'pendingEarnings' => (float) ($pendingQuery->sum('amount') ?? 0),
        ];

        return Inertia::render('Teacher/Payments', [
            'payments' => $payments,
            'stats' => $stats,
            'filters' => $request->only(['status', 'payment_method', 'date_from', 'date_to']),
        ]);
    }

    public function cancel(Request $request, $id)
    {
        $user = Auth::user();
        $teacher = $user->teacher;

        if (!$teacher) {
            return redirect()->route('dashboard')->with('error', 'لم يتم العثور على بيانات المعلم');
        }

        $payment = Payment::with(['booking'])
            ->where('teacher_id', $teacher->id)
            ->findOrFail($id);

        $result = $this->paymentService->cancelPayment($payment, $user);

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

        $user = Auth::user();
        $teacher = $user->teacher;

        if (!$teacher) {
            return redirect()->route('dashboard')->with('error', 'لم يتم العثور على بيانات المعلم');
        }

        $payment = Payment::with(['booking.teacher'])
            ->where('teacher_id', $teacher->id)
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
