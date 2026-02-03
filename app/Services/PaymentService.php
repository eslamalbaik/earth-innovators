<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\Payment;
use App\Models\TeacherAvailability;
use App\Services\TamaraService;
use App\Services\BookingService;
use App\Services\ChatService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

class PaymentService extends BaseService
{
    public function __construct(
        private TamaraService $tamaraService,
        private BookingService $bookingService,
        private ChatService $chatService
    ) {}

    public function preparePayment(Booking $booking, $user, float $amount): Payment
    {
        $payment = $booking->payment ?? new Payment();
        $payment->fill([
            'booking_id' => $booking->id,
            'student_id' => $user->id,
            'teacher_id' => $booking->teacher_id,
            'amount' => $amount,
            'currency' => $booking->currency ?? 'AED',
            'status' => 'pending',
            'payment_method' => 'tamara',
            'payment_gateway' => 'Tamara',
            'transaction_id' => $payment->transaction_id ?: 'TXN-' . Str::upper(Str::random(12)),
            'payment_reference' => $payment->payment_reference ?: 'REF-' . $booking->id . '-' . time(),
        ]);
        $payment->save();

        if (Schema::hasColumn('bookings', 'payment_status')) {
            $booking->update(['payment_status' => 'pending']);
        }

        return $payment;
    }

    public function resolveBookingAmount(Booking $booking): float
    {
        if (Schema::hasColumn('bookings', 'total_price') && $booking->total_price) {
            return (float) $booking->total_price;
        }

        if (Schema::hasColumn('bookings', 'price') && $booking->price) {
            return (float) $booking->price;
        }

        return 0;
    }

    public function resolvePhoneNumber(Booking $booking, $user): ?string
    {
        $candidates = [
            $user->phone ?? null,
            $booking->student_phone ?? null,
            optional($booking->student)->phone,
        ];

        foreach ($candidates as $candidate) {
            $clean = $this->cleanPhoneNumber($candidate);
            if ($clean) {
                return $clean;
            }
        }

        return null;
    }

    public function cleanPhoneNumber(?string $phone): ?string
    {
        if (!$phone) {
            return null;
        }

        $trimmed = trim($phone);
        $digits = preg_replace('/[^0-9]/', '', $trimmed);

        if (str_starts_with($trimmed, '+')) {
            $digits = ltrim($digits, '0');
        }

        if (strlen($digits) === 12 && str_starts_with($digits, '966')) {
            return '+' . $digits;
        }

        if (strlen($digits) === 10 && str_starts_with($digits, '05')) {
            return '+966' . substr($digits, 1);
        }

        if (strlen($digits) === 9 && str_starts_with($digits, '5')) {
            return '+966' . $digits;
        }

        return null;
    }

    public function ensureSessionsAvailable(Booking $booking): bool
    {
        $sessions = $booking->selected_sessions ?? [];
        if (!is_array($sessions) || empty($sessions)) {
            return true;
        }

        $availabilityIds = collect($sessions)
            ->pluck('availability_id')
            ->filter()
            ->unique()
            ->values();

        if ($availabilityIds->isEmpty()) {
            return true;
        }

        $availabilities = TeacherAvailability::whereIn('id', $availabilityIds)->get();
        if ($availabilities->count() !== $availabilityIds->count()) {
            return false;
        }

        return $availabilities->every(function (TeacherAvailability $availability) use ($booking) {
            if ($availability->booking_id && $availability->booking_id !== $booking->id) {
                return false;
            }
            return $availability->status === 'available' || $availability->booking_id === $booking->id;
        });
    }

    public function createTamaraCheckout(Payment $payment, Booking $booking, $user, string $phone, float $amount): array
    {
        $bookingDate = null;
        $bookingTime = null;
        if ($booking->availability) {
            $bookingDate = $booking->availability->date->format('Y-m-d');
            $bookingTime = $booking->availability->start_time->format('H:i');
        } elseif ($booking->date) {
            $bookingDate = $booking->date->format('Y-m-d');
            $bookingTime = $booking->start_time ?? '10:00';
        } else {
            $bookingDate = now()->format('Y-m-d');
            $bookingTime = '10:00';
        }

        $orderData = [
            'order_reference_id' => (string) $payment->transaction_id,
            'order_number' => 'BOOKING-' . $booking->id,
            'total_amount' => [
                'amount' => (string) number_format($amount, 2, '.', ''),
                'currency' => $booking->currency ?? 'AED',
            ],
            'shipping_amount' => [
                'amount' => '0',
                'currency' => $booking->currency ?? 'AED',
            ],
            'tax_amount' => [
                'amount' => '0',
                'currency' => $booking->currency ?? 'AED',
            ],
            'description' => 'حجز مع معلم - ' . ($booking->teacher->name_ar ?? 'معلم'),
            'country_code' => 'AE',
            'payment_type' => 'PAY_BY_INSTALMENTS',
            'instalments' => 3,
            'locale' => 'ar_AE',
            'platform' => 'TeacherK Platform',
            'is_mobile' => false,
            'items' => $this->buildOrderItems($booking, $amount),
            'shipping_address' => [
                'first_name' => $user->name,
                'last_name' => '',
                'line1' => $booking->neighborhood ?? $booking->city ?? 'Dubai',
                'city' => $booking->city ?? 'Dubai',
                'country_code' => 'AE',
                'phone_number' => $phone,
            ],
            'billing_address' => [
                'first_name' => $user->name,
                'last_name' => '',
                'line1' => $booking->neighborhood ?? $booking->city ?? 'Dubai',
                'city' => $booking->city ?? 'Dubai',
                'country_code' => 'AE',
                'phone_number' => $phone,
            ],
            'consumer' => [
                'first_name' => $user->name,
                'last_name' => '',
                'email' => $user->email,
                'phone_number' => $phone,
            ],
            'merchant_url' => [
                'success' => route('payment.success', $payment->id),
                'failure' => route('payment.failure', $payment->id),
                'cancel' => route('payment.show', $booking->id),
                'notification' => route('webhook.payment', 'tamara'),
            ],
        ];

        return $this->tamaraService->createCheckout($orderData);
    }

    public function handlePaymentSuccess(Payment $payment): array
    {
        if ($payment->isCompleted()) {
            $this->bookingService->finalizePaidBooking($payment->booking);
            $this->chatService->ensureChatForBooking($payment->booking);
            return ['status' => 'completed', 'payment' => $payment];
        }

        if ($payment->gateway_payment_id) {
            try {
                $authorizeResponse = $this->tamaraService->authorizeOrder($payment->gateway_payment_id);

                if (isset($authorizeResponse['error']) && $authorizeResponse['error']) {
                    return ['status' => 'error', 'message' => $authorizeResponse['message'] ?? 'Unknown error'];
                } elseif ($authorizeResponse && isset($authorizeResponse['status'])) {
                    $status = $authorizeResponse['status'];
                    $autoCaptured = $authorizeResponse['auto_captured'] ?? false;

                    if ($status === 'fully_captured' || ($status === 'authorised' && $autoCaptured)) {
                        $payment->update([
                            'status' => 'completed',
                            'paid_at' => now(),
                            'gateway_response' => array_merge($payment->gateway_response ?? [], $authorizeResponse),
                        ]);

                        $this->bookingService->finalizePaidBooking($payment->booking);
                        $this->chatService->ensureChatForBooking($payment->booking);

                        return ['status' => 'completed', 'payment' => $payment->fresh()];
                    } elseif ($status === 'authorised') {
                        $payment->update([
                            'status' => 'processing',
                            'gateway_response' => array_merge($payment->gateway_response ?? [], $authorizeResponse),
                        ]);

                        return ['status' => 'processing', 'payment' => $payment->fresh()];
                    } elseif ($status === 'declined' || $status === 'failed') {
                        $payment->update([
                            'status' => 'failed',
                            'failed_at' => now(),
                            'failure_reason' => $authorizeResponse['message'] ?? 'Payment authorization failed',
                            'gateway_response' => array_merge($payment->gateway_response ?? [], $authorizeResponse),
                        ]);

                        return ['status' => 'failed', 'payment' => $payment->fresh()];
                    }
                }
            } catch (\Exception $e) {
                \Log::error('Payment authorization error: ' . $e->getMessage());
            }
        }

        return ['status' => 'pending', 'payment' => $payment->fresh()];
    }

    public function cancelPayment(Payment $payment, $user): array
    {
        if ($payment->status === 'cancelled') {
            return ['success' => false, 'message' => 'تم إلغاء هذا الدفع مسبقاً.'];
        }

        $canCancel = $this->canCancelPayment($payment);
        if (!$canCancel['allowed']) {
            return ['success' => false, 'message' => $canCancel['reason']];
        }

        if ($user->role === 'student' && $payment->isCompleted() && $payment->paid_at && $payment->paid_at->diffInHours(now()) > 24) {
            return ['success' => false, 'message' => 'لا يمكن إلغاء الدفع بعد مرور 24 ساعة من الدفع.'];
        }

        try {
            DB::beginTransaction();

            if (!$payment->gateway_payment_id) {
                $payment->update([
                    'status' => 'cancelled',
                    'gateway_response' => array_merge($payment->gateway_response ?? [], [
                        'cancelled_at' => now()->toIso8601String(),
                        'cancelled_by' => 'user',
                    ]),
                ]);

                $this->releaseBookingAvailabilities($payment->booking);

                DB::commit();
                return ['success' => true, 'message' => 'تم إلغاء الدفع بنجاح.'];
            }

            $cancelData = $this->buildCancelData($payment);
            $cancelResponse = $this->tamaraService->cancelOrder($payment->gateway_payment_id, $cancelData);

            if ($cancelResponse && isset($cancelResponse['error']) && $cancelResponse['error']) {
                $statusCode = $cancelResponse['status'] ?? 0;
                $errorMessage = $cancelResponse['message'] ?? 'Unknown error';
                $errorBody = $cancelResponse['body'] ?? [];

                if ($statusCode === 409) {
                    $example = $errorBody['example'] ?? $errorBody;
                    $message = $example['message'] ?? $errorMessage;
                    $errors = $example['errors'] ?? ($errorBody['errors'] ?? []);

                    $oldState = null;
                    foreach ($errors as $error) {
                        if (isset($error['data'])) {
                            $oldState = $error['data']['old_state'] ?? null;
                            break;
                        }
                    }

                    DB::rollBack();

                    $userMessage = 'لا يمكن إلغاء هذا الدفع لأنه في حالة "' . ($oldState ?? 'approved') . '". ';
                    if ($oldState === 'approved' || $oldState === 'authorised') {
                        $userMessage .= 'يجب الانتظار حتى يتم capture الطلب أو الاتصال بالدعم.';
                    } elseif ($oldState === 'captured' || $oldState === 'fully_captured') {
                        $userMessage .= 'الطلب تم capture بالفعل. يجب استخدام Refund بدلاً من Cancel.';
                    } else {
                        $userMessage .= 'يرجى الاتصال بالدعم للمساعدة.';
                    }

                    return ['success' => false, 'message' => $userMessage];
                }

                DB::rollBack();
                return ['success' => false, 'message' => 'فشل في إلغاء الدفع: ' . $errorMessage];
            }

            if ($cancelResponse && isset($cancelResponse['status'])) {
                $status = $cancelResponse['status'];
                $payment->update([
                    'status' => 'cancelled',
                    'gateway_response' => array_merge($payment->gateway_response ?? [], $cancelResponse),
                ]);

                $this->releaseBookingAvailabilities($payment->booking);

                DB::commit();

                $message = $status === 'canceled'
                    ? 'تم إلغاء الدفع بنجاح.'
                    : 'تم تحديث الدفع بنجاح.';

                return ['success' => true, 'message' => $message];
            }

            DB::rollBack();
            return ['success' => false, 'message' => 'فشل في إلغاء الدفع. يرجى المحاولة مرة أخرى.'];
        } catch (\Exception $e) {
            DB::rollBack();
            return ['success' => false, 'message' => 'حدث خطأ أثناء إلغاء الدفع: ' . $e->getMessage()];
        }
    }

    public function capturePayment(Payment $payment): array
    {
        if ($payment->status === 'completed') {
            return ['success' => false, 'message' => 'تم capture هذا الدفع مسبقاً.'];
        }

        if ($payment->status !== 'processing' && $payment->status !== 'authorised') {
            return ['success' => false, 'message' => 'لا يمكن capture هذا الدفع في حالته الحالية.'];
        }

        if (!$payment->gateway_payment_id) {
            return ['success' => false, 'message' => 'لا يوجد order_id من Tamara.'];
        }

        try {
            DB::beginTransaction();

            $captureData = $this->buildCaptureData($payment);
            $captureResponse = $this->tamaraService->captureOrder($payment->gateway_payment_id, $captureData);

            if ($captureResponse && isset($captureResponse['error']) && $captureResponse['error']) {
                DB::rollBack();
                return ['success' => false, 'message' => 'فشل في capture الدفع: ' . ($captureResponse['message'] ?? 'خطأ غير معروف')];
            }

            if ($captureResponse && isset($captureResponse['status'])) {
                $status = $captureResponse['status'];

                if ($status === 'fully_captured' || $status === 'partially_captured') {
                    $payment->update([
                        'status' => 'completed',
                        'paid_at' => now(),
                        'gateway_response' => array_merge($payment->gateway_response ?? [], $captureResponse),
                    ]);

                    $this->bookingService->finalizePaidBooking($payment->booking);
                    $this->chatService->ensureChatForBooking($payment->booking);

                    DB::commit();

                    $message = $status === 'fully_captured'
                        ? 'تم capture الدفع بنجاح.'
                        : 'تم capture الدفع جزئياً.';

                    return ['success' => true, 'message' => $message];
                }
            }

            DB::rollBack();
            return ['success' => false, 'message' => 'فشل في capture الدفع. يرجى المحاولة مرة أخرى.'];
        } catch (\Exception $e) {
            DB::rollBack();
            return ['success' => false, 'message' => 'حدث خطأ أثناء capture الدفع: ' . $e->getMessage()];
        }
    }

    public function refundPayment(Payment $payment, ?float $amount = null, ?string $comment = null): array
    {
        if ($payment->status === 'refunded') {
            return ['success' => false, 'message' => 'تم refund هذا الدفع مسبقاً.'];
        }

        if ($payment->status !== 'completed') {
            return ['success' => false, 'message' => 'لا يمكن refund هذا الدفع لأنه لم يتم إكماله بعد.'];
        }

        if (!$payment->gateway_payment_id) {
            return ['success' => false, 'message' => 'لا يوجد order_id من Tamara.'];
        }

        try {
            DB::beginTransaction();

            $refundAmount = $amount ?? $payment->amount;
            $refundComment = $comment ?? 'Refund request from student';

            $refundData = [
                'total_amount' => [
                    'amount' => (string) number_format($refundAmount, 2, '.', ''),
                    'currency' => $payment->currency ?? 'AED',
                ],
                'comment' => $refundComment,
            ];

            $refundResponse = $this->tamaraService->refundOrder($payment->gateway_payment_id, $refundData);

            if ($refundResponse && isset($refundResponse['error']) && $refundResponse['error']) {
                DB::rollBack();
                return ['success' => false, 'message' => 'فشل في refund الدفع: ' . ($refundResponse['message'] ?? 'خطأ غير معروف')];
            }

            if ($refundResponse && isset($refundResponse['status'])) {
                $status = $refundResponse['status'];

                if ($status === 'fully_refunded' || $status === 'partially_refunded') {
                    $payment->update([
                        'status' => 'refunded',
                        'refunded_at' => now(),
                        'gateway_response' => array_merge($payment->gateway_response ?? [], $refundResponse),
                    ]);

                    DB::commit();

                    $message = $status === 'fully_refunded'
                        ? 'تم refund الدفع بالكامل بنجاح.'
                        : 'تم refund الدفع جزئياً بنجاح.';

                    return ['success' => true, 'message' => $message];
                }
            }

            DB::rollBack();
            return ['success' => false, 'message' => 'فشل في refund الدفع. يرجى المحاولة مرة أخرى.'];
        } catch (\Exception $e) {
            DB::rollBack();
            return ['success' => false, 'message' => 'حدث خطأ أثناء refund الدفع: ' . $e->getMessage()];
        }
    }

    private function canCancelPayment(Payment $payment): array
    {
        if (!$payment->gateway_payment_id) {
            return ['allowed' => true, 'reason' => null];
        }

        if ($payment->status === 'completed' && $payment->paid_at) {
            return ['allowed' => true, 'reason' => null];
        }

        if ($payment->status === 'processing') {
            return ['allowed' => true, 'reason' => null];
        }

        if ($payment->status === 'failed') {
            return ['allowed' => false, 'reason' => 'لا يمكن إلغاء دفعة فاشلة.'];
        }

        try {
            $orderData = $this->tamaraService->getOrder($payment->gateway_payment_id);

            if ($orderData && isset($orderData['status'])) {
                $tamaraStatus = $orderData['status'];

                if (in_array($tamaraStatus, ['captured', 'fully_captured', 'completed'])) {
                    return [
                        'allowed' => false,
                        'reason' => 'لا يمكن إلغاء الدفع لأنه تم capture بالفعل. يجب استخدام refund بدلاً من ذلك.',
                    ];
                }

                if (in_array($tamaraStatus, ['approved', 'authorised'])) {
                    return [
                        'allowed' => true,
                        'reason' => null,
                        'warning' => 'الطلب في حالة ' . $tamaraStatus . '. قد يفشل الإلغاء ويجب الانتظار حتى capture.',
                    ];
                }
            }
        } catch (\Exception $e) {
        }

        return ['allowed' => true, 'reason' => null];
    }

    private function releaseBookingAvailabilities(Booking $booking): void
    {
        if ($booking->selected_sessions) {
            $sessions = is_array($booking->selected_sessions) ? $booking->selected_sessions : [];
            $availabilityIds = collect($sessions)
                ->pluck('availability_id')
                ->filter()
                ->unique();

            if ($availabilityIds->isNotEmpty()) {
                TeacherAvailability::whereIn('id', $availabilityIds)
                    ->where('booking_id', $booking->id)
                    ->update([
                        'status' => 'available',
                        'booking_id' => null,
                    ]);
            }
        } elseif ($booking->availability) {
            $booking->availability->update([
                'status' => 'available',
                'booking_id' => null,
            ]);
        }
    }

    private function buildOrderItems(Booking $booking, float $amount): array
    {
        $sessions = $booking->selected_sessions ?? [];
        $count = is_array($sessions) ? count($sessions) : 0;
        $count = $count > 0 ? $count : 1;

        $teacherName = $booking->teacher->name_ar
            ?? $booking->teacher->name_en
            ?? $booking->teacher->user->name
            ?? 'معلم';

        $subjectLabel = $booking->subject ?: 'جلسات تدريس';

        $unitPrice = $count > 0 ? $amount / $count : $amount;

        return [[
            'type' => 'Digital',
            'name' => $subjectLabel . ' - ' . $teacherName,
            'reference_id' => (string) $booking->id,
            'sku' => 'BOOKING-' . $booking->id,
            'quantity' => $count,
            'unit_price' => [
                'amount' => (string) number_format($unitPrice, 2, '.', ''),
                'currency' => $booking->currency ?? 'AED',
            ],
            'total_amount' => [
                'amount' => (string) number_format($amount, 2, '.', ''),
                'currency' => $booking->currency ?? 'AED',
            ],
        ]];
    }

    private function buildCaptureData(Payment $payment): array
    {
        $booking = $payment->booking;
        $amount = $payment->amount;

        $gatewayResponse = is_array($payment->gateway_response)
            ? $payment->gateway_response
            : (is_string($payment->gateway_response) ? json_decode($payment->gateway_response, true) : []);

        $captureData = [
            'order_id' => $payment->gateway_payment_id,
            'total_amount' => [
                'amount' => (string) number_format($amount, 2, '.', ''),
                'currency' => $payment->currency ?? 'AED',
            ],
        ];

        if (isset($gatewayResponse['shipping_amount'])) {
            $captureData['shipping_amount'] = $gatewayResponse['shipping_amount'];
        } else {
            $captureData['shipping_amount'] = [
                'amount' => '0',
                'currency' => $payment->currency ?? 'AED',
            ];
        }

        if (isset($gatewayResponse['tax_amount'])) {
            $captureData['tax_amount'] = $gatewayResponse['tax_amount'];
        } else {
            $captureData['tax_amount'] = [
                'amount' => '0',
                'currency' => $payment->currency ?? 'AED',
            ];
        }

        if (isset($gatewayResponse['discount_amount'])) {
            $captureData['discount_amount'] = $gatewayResponse['discount_amount'];
        }

        if (isset($gatewayResponse['items']) && is_array($gatewayResponse['items'])) {
            $captureData['items'] = $gatewayResponse['items'];
        } else {
            $captureData['items'] = $this->buildOrderItems($booking, $amount);
        }

        return $captureData;
    }

    private function buildCancelData(Payment $payment): array
    {
        $booking = $payment->booking;
        $amount = $payment->amount;

        $cancelData = [
            'total_amount' => [
                'amount' => (string) number_format($amount, 2, '.', ''),
                'currency' => $payment->currency ?? 'AED',
            ],
        ];

        $gatewayResponse = is_array($payment->gateway_response)
            ? $payment->gateway_response
            : (is_string($payment->gateway_response) ? json_decode($payment->gateway_response, true) : []);

        if (isset($gatewayResponse['shipping_amount'])) {
            $cancelData['shipping_amount'] = $gatewayResponse['shipping_amount'];
        } else {
            $cancelData['shipping_amount'] = [
                'amount' => '0',
                'currency' => $payment->currency ?? 'AED',
            ];
        }

        if (isset($gatewayResponse['tax_amount'])) {
            $cancelData['tax_amount'] = $gatewayResponse['tax_amount'];
        } else {
            $cancelData['tax_amount'] = [
                'amount' => '0',
                'currency' => $payment->currency ?? 'AED',
            ];
        }

        if (isset($gatewayResponse['items']) && is_array($gatewayResponse['items'])) {
            $cancelData['items'] = $gatewayResponse['items'];
        } else {
            $cancelData['items'] = $this->buildOrderItems($booking, $amount);
        }

        return $cancelData;
    }
    public function finalizePackageSubscription(Payment $payment, array $gatewayData = []): void
    {
        if ($payment->status === 'completed') {
            return;
        }

        DB::transaction(function () use ($payment, $gatewayData) {
            $payment->update([
                'status' => 'completed',
                'paid_at' => now(),
                'gateway_response' => array_merge($payment->gateway_response ?? [], $gatewayData),
            ]);

            $userPackage = $payment->userPackage;
            if (!$userPackage && $payment->user_package_id) {
                $userPackage = \App\Models\UserPackage::find($payment->user_package_id);
            }

            if ($userPackage) {
                $userPackage->update([
                    'status' => 'active',
                    'start_date' => now(),
                ]);

                if ($userPackage->package->points_bonus > 0) {
                    $user = $userPackage->user;
                    $pointsService = app(\App\Services\PointsService::class);
                    $pointsService->awardPoints(
                        $user->id,
                        $userPackage->package->points_bonus,
                        'package_bonus',
                        $userPackage->package_id,
                        "Package subscription bonus: {$userPackage->package->name}",
                        "مكافأة اشتراك الباقة: {$userPackage->package->name_ar}"
                    );
                }
            }
        });
    }
}
