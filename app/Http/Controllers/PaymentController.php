<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Payment;
use App\Services\PaymentService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;

class PaymentController extends Controller
{
    public function __construct(
        private PaymentService $paymentService
    ) {}
    public function show(Request $request, $bookingId)
    {
        $user = Auth::user();
        $booking = Booking::with(['teacher.user', 'payment', 'availability', 'student'])
            ->where(function ($q) use ($user) {
                if (\Schema::hasColumn('bookings', 'student_id')) {
                    $q->where('student_id', $user->id);
                } elseif (\Schema::hasColumn('bookings', 'student_email')) {
                    $q->where('student_email', $user->email);
                }
            })
            ->findOrFail($bookingId);

        if ($booking->payment && $booking->payment->isCompleted()) {
            return redirect()->route('payment.success', $booking->payment->id);
        }

        $amount = $this->paymentService->resolveBookingAmount($booking);

        if ($amount <= 0) {
            return redirect()->back()->with('error', 'المبلغ غير صحيح');
        }

        $sessionsAvailable = $this->paymentService->ensureSessionsAvailable($booking);

        if (!$sessionsAvailable) {
            return redirect()->route('bookings.student')->with('error', 'أحد المواعيد المختارة لم يعد متاحاً. يرجى اختيار مواعيد أخرى.');
        }

        $phone = $this->paymentService->resolvePhoneNumber($booking, $user);

        if (!$phone) {
            return redirect()->route('bookings.student')->with('error', 'لا يمكن البدء بعملية الدفع لعدم توفر رقم جوال في حسابك. يرجى إضافة رقم جوال من إعدادات الحساب.');
        }

        if (!preg_match('/^\+966/', $phone)) {
            return redirect()->route('bookings.student')->with('error', 'لا يمكن الدفع لأن رقم الجوال يجب أن يكون بمقدمة سعودية (+966). يرجى تحديث رقم الجوال في إعدادات الحساب.');
        }

        try {
            $payment = $this->paymentService->preparePayment($booking, $user, $amount);
            $checkoutResponse = $this->paymentService->createTamaraCheckout($payment, $booking->fresh(), $user, $phone, $amount);

            if (!$checkoutResponse || !isset($checkoutResponse['checkout_url'])) {
                $errorMessage = $this->getTamaraErrorMessage($checkoutResponse);
                return redirect()->route('bookings.student')->with('error', $errorMessage);
            }

            $payment->update([
                'gateway_payment_id' => $checkoutResponse['order_id'] ?? null,
                'gateway_response' => $checkoutResponse,
            ]);

            return redirect($checkoutResponse['checkout_url']);
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'حدث خطأ أثناء بدء عملية الدفع. يرجى المحاولة مرة أخرى.');
        }
    }

    public function initiate(Request $request, $bookingId)
    {
        $request->validate([
            'phone' => ['required', 'string', 'regex:/^(\+966|\+971|\+973|\+974|\+965|\+968|\+964|\+967)[0-9]{9}$/'],
        ]);

        $user = Auth::user();
        $booking = Booking::with(['teacher', 'payment', 'availability'])
            ->where(function ($q) use ($user) {
                if (\Schema::hasColumn('bookings', 'student_id')) {
                    $q->where('student_id', $user->id);
                } elseif (\Schema::hasColumn('bookings', 'student_email')) {
                    $q->where('student_email', $user->email);
                }
            })
            ->findOrFail($bookingId);

        if ($booking->payment && $booking->payment->isCompleted()) {
            return back()->with('error', 'تم دفع هذا الحجز مسبقاً');
        }

        $amount = $this->paymentService->resolveBookingAmount($booking);
        if ($amount <= 0) {
            return back()->with('error', 'المبلغ غير صحيح');
        }

        if (!$this->paymentService->ensureSessionsAvailable($booking)) {
            return back()->with('error', 'أحد المواعيد المختارة لم يعد متاحاً. يرجى اختيار مواعيد أخرى.');
        }

        try {
            $phone = $this->paymentService->cleanPhoneNumber($request->phone);
            if (!$phone) {
                return redirect()->route('bookings.student')->with('error', 'رقم الجوال غير صالح.');
            }

            if (!preg_match('/^\+966/', $phone)) {
                return redirect()->route('bookings.student')->with('error', 'لا يمكن الدفع لأن رقم الجوال يجب أن يكون بمقدمة سعودية (+966). يرجى تحديث رقم الجوال في إعدادات الحساب.');
            }

            $payment = $this->paymentService->preparePayment($booking, $user, $amount);
            $checkoutResponse = $this->paymentService->createTamaraCheckout($payment, $booking->fresh(), $user, $phone, $amount);

            if (!$checkoutResponse || !isset($checkoutResponse['checkout_url'])) {
                $errorMessage = $this->getTamaraErrorMessage($checkoutResponse);
                return response()->json([
                    'success' => false,
                    'message' => $errorMessage,
                ], 500);
            }

            $payment->update([
                'gateway_payment_id' => $checkoutResponse['order_id'] ?? null,
                'gateway_response' => $checkoutResponse,
            ]);

            return response()->json([
                'success' => true,
                'checkout_url' => $checkoutResponse['checkout_url'],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ أثناء بدء عملية الدفع: ' . $e->getMessage(),
            ], 500);
        }
    }

    private function getTamaraErrorMessage(?array $checkoutResponse): string
    {
        $errorMessage = 'فشل في إنشاء طلب الدفع. يرجى المحاولة مرة أخرى.';

        if (is_array($checkoutResponse) && isset($checkoutResponse['error'])) {
            $status = $checkoutResponse['status'] ?? 0;
            $message = $checkoutResponse['message'] ?? '';

            if (
                $status === 401 ||
                str_contains(strtolower($message), 'invalid credentials') ||
                str_contains(strtolower($message), 'unauthorized')
            ) {
                $tamaraService = app(\App\Services\TamaraService::class);
                $isSandbox = $tamaraService->isSandbox();
                $envType = $isSandbox ? 'sandbox' : 'production';

                $errorMessage = 'خطأ في بيانات الدفع (Invalid credentials). ' .
                    'النظام يستخدم بيئة ' . $envType . '. ' .
                    'يرجى التحقق من ملف .env والتأكد من: ' .
                    '1) TAMARA_ENV=' . $envType . ' ' .
                    '2) TAMARA_API_KEY يحتوي على مفتاح صحيح لبيئة ' . $envType . '. ' .
                    'إذا كنت تختبر، استخدم sandbox. إذا كنت في الإنتاج، تأكد من استخدام مفاتيح production.';
            } elseif (!empty($message)) {
                $errorMessage = 'فشل في إنشاء طلب الدفع: ' . $message;
            }
        }

        return $errorMessage;
    }

    public function success(Request $request, $paymentId)
    {
        $user = Auth::user();
        $payment = Payment::with(['booking.teacher'])
            ->where('student_id', $user->id)
            ->findOrFail($paymentId);

        $result = $this->paymentService->handlePaymentSuccess($payment);
        $payment = $result['payment'];

        if ($result['status'] === 'completed') {
            return Inertia::render('Student/PaymentSuccess', [
                'payment' => [
                    'id' => $payment->id,
                    'transaction_id' => $payment->transaction_id,
                    'amount' => $payment->amount,
                    'currency' => $payment->currency,
                    'paid_at' => $payment->paid_at,
                    'booking' => [
                        'id' => $payment->booking->id,
                        'teacher_name' => $payment->booking->teacher->name_ar ?? $payment->booking->teacher->user->name ?? 'N/A',
                    ],
                ],
            ]);
        }

        if ($result['status'] === 'processing') {
            return Inertia::render('Student/PaymentSuccess', [
                'payment' => [
                    'id' => $payment->id,
                    'transaction_id' => $payment->transaction_id,
                    'amount' => $payment->amount,
                    'currency' => $payment->currency,
                    'status' => 'processing',
                    'booking' => [
                        'id' => $payment->booking->id,
                        'teacher_name' => $payment->booking->teacher->name_ar ?? $payment->booking->teacher->user->name ?? 'N/A',
                    ],
                ],
                'message' => 'جاري معالجة الدفع. سيتم إكمال العملية قريباً.',
            ]);
        }

        if ($result['status'] === 'failed') {
            return redirect()->route('payment.failure', $payment->id);
        }

        return redirect()->route('payment.show', $payment->booking_id);
    }

    public function failure(Request $request, $paymentId)
    {
        $user = Auth::user();
        $payment = Payment::with(['booking'])
            ->where('student_id', $user->id)
            ->findOrFail($paymentId);

        return Inertia::render('Student/PaymentFailure', [
            'payment' => [
                'id' => $payment->id,
                'failure_reason' => $payment->failure_reason,
                'booking_id' => $payment->booking_id,
            ],
        ]);
    }

    public function cancel(Request $request, $paymentId)
    {
        $user = Auth::user();
        $payment = Payment::with(['booking'])
            ->where(function ($q) use ($user) {
                if ($user->role === 'student') {
                    $q->where('student_id', $user->id);
                } elseif ($user->role === 'teacher') {
                    $q->whereHas('booking', function ($query) use ($user) {
                        $query->where('teacher_id', $user->id);
                    });
                } elseif ($user->role !== 'admin') {
                    $q->where('id', 0);
                }
            })
            ->findOrFail($paymentId);

        $result = $this->paymentService->cancelPayment($payment, $user);

        if ($result['success']) {
            return back()->with('success', $result['message']);
        }

        return back()->with('error', $result['message']);
    }

    public function capture(Request $request, $paymentId)
    {
        $user = Auth::user();
        $payment = Payment::with(['booking.teacher'])
            ->where('student_id', $user->id)
            ->findOrFail($paymentId);

        $result = $this->paymentService->capturePayment($payment);

        if ($result['success']) {
            return back()->with('success', $result['message']);
        }

        return back()->with('error', $result['message']);
    }

    public function refund(Request $request, $paymentId)
    {
        $request->validate([
            'amount' => 'nullable|numeric|min:0',
            'comment' => 'nullable|string|max:500',
        ]);

        $user = Auth::user();
        $payment = Payment::with(['booking.teacher'])
            ->where('student_id', $user->id)
            ->findOrFail($paymentId);

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
