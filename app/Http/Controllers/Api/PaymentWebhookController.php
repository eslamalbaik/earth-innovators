<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Services\TamaraService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class PaymentWebhookController extends Controller
{
    public function handle(Request $request, string $gateway)
    {
        Log::info('Payment webhook received', [
            'gateway' => $gateway,
            'payload' => $request->all(),
            'headers' => $request->headers->all(),
        ]);

        if ($gateway !== 'tamara') {
            return response()->json(['error' => 'Unknown gateway'], 400);
        }

        try {
            return $this->handleTamaraWebhook($request);
        } catch (\Exception $e) {
            Log::error('Payment webhook error', [
                'gateway' => $gateway,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json(['error' => 'Webhook processing failed'], 500);
        }
    }

    private function handleTamaraWebhook(Request $request)
    {
        $tamaraService = app(TamaraService::class);
        $tamaraToken = $request->query('tamaraToken')
            ?? $request->header('Authorization')
            ?? null;

        if ($tamaraToken) {
            $tamaraToken = str_replace('Bearer ', '', $tamaraToken);
            if (!$tamaraService->verifyWebhookToken($tamaraToken)) {
                Log::warning('Tamara webhook token verification failed', [
                    'token' => substr($tamaraToken, 0, 20) . '...',
                ]);
                return response()->json(['error' => 'Invalid token'], 401);
            }
        }

        $data = $request->all();
        $eventType = $data['event_type'] ?? $data['type'] ?? null;
        $orderId = $data['order_id'] ?? $data['orderId'] ?? null;
        $payment = Payment::where('gateway_payment_id', $orderId)
            ->orWhere('transaction_id', $orderId)
            ->first();

        if (!$payment) {
            Log::warning('Payment not found for Tamara webhook', [
                'order_id' => $orderId,
            ]);
            return response()->json(['error' => 'Payment not found'], 404);
        }

        switch ($eventType) {
            case 'order_approved':
            case 'order_authorised':
            case 'order_authorised_failed':
                return $this->handleOrderAuthorisation($payment, $data);

            case 'order_captured':
            case 'order_captured_failed':
                return $this->handleOrderCapture($payment, $data);

            case 'order_cancelled':
                return $this->handleOrderCancellation($payment, $data);

            case 'order_refunded':
                return $this->handleOrderRefund($payment, $data);

            default:
                Log::info('Unhandled Tamara webhook event', [
                    'event_type' => $eventType,
                    'payment_id' => $payment->id,
                ]);
                return response()->json(['received' => true]);
        }
    }

    private function handleOrderAuthorisation(Payment $payment, array $data)
    {
        try {
            DB::beginTransaction();

            $status = $data['status'] ?? null;
            $autoCaptured = $data['auto_captured'] ?? false;

            // إذا كان fully_captured أو auto_captured = true، اعتبر الدفع مكتملاً
            if ($status === 'fully_captured' || ($status === 'authorised' && $autoCaptured)) {
                $payment->update([
                    'status' => 'completed',
                    'paid_at' => now(),
                    'gateway_response' => array_merge($payment->gateway_response ?? [], $data),
                ]);

                $booking = $payment->booking;
                if (\Schema::hasColumn('bookings', 'payment_status')) {
                    $booking->update(['payment_status' => 'paid']);
                }
                if (\Schema::hasColumn('bookings', 'payment_received')) {
                    $booking->update([
                        'payment_received' => true,
                        'payment_received_at' => now(),
                    ]);
                }
                if (\Schema::hasColumn('bookings', 'payment_method')) {
                    $booking->update(['payment_method' => 'tamara']);
                }
                if (\Schema::hasColumn('bookings', 'payment_reference')) {
                    $booking->update(['payment_reference' => $payment->payment_reference]);
                }

                // إكمال الحجز وإنشاء المحادثة
                app(\App\Services\BookingService::class)->finalizePaidBooking($booking);
                app(\App\Services\ChatService::class)->ensureChatForBooking($booking);

                Log::info('Payment completed via Tamara webhook (auto-capture)', [
                    'payment_id' => $payment->id,
                    'booking_id' => $booking->id,
                    'status' => $status,
                    'auto_captured' => $autoCaptured,
                    'capture_id' => $data['capture_id'] ?? null,
                ]);
            } elseif ($status === 'approved' || $status === 'authorised') {
                $payment->update([
                    'status' => 'processing',
                    'gateway_response' => array_merge($payment->gateway_response ?? [], $data),
                ]);

                Log::info('Order authorised via webhook', [
                    'payment_id' => $payment->id,
                    'status' => $status,
                    'auto_captured' => $autoCaptured,
                ]);
            } elseif ($status === 'declined' || $status === 'failed') {
                $payment->update([
                    'status' => 'failed',
                    'failed_at' => now(),
                    'failure_reason' => $data['declined_reason'] ?? $data['message'] ?? 'Payment declined',
                    'gateway_response' => array_merge($payment->gateway_response ?? [], $data),
                ]);

                Log::warning('Order authorization declined via webhook', [
                    'payment_id' => $payment->id,
                    'status' => $status,
                ]);
            }

            DB::commit();
            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to handle order authorisation', [
                'payment_id' => $payment->id,
                'error' => $e->getMessage(),
            ]);
            return response()->json(['error' => 'Processing failed'], 500);
        }
    }

    private function handleOrderCapture(Payment $payment, array $data)
    {
        try {
            DB::beginTransaction();

            $status = $data['status'] ?? null;

            if ($status === 'captured' || $status === 'completed') {
                $payment->update([
                    'status' => 'completed',
                    'paid_at' => now(),
                    'gateway_response' => array_merge($payment->gateway_response ?? [], $data),
                ]);

                $booking = $payment->booking;
                if (\Schema::hasColumn('bookings', 'payment_status')) {
                    $booking->update(['payment_status' => 'paid']);
                }
                if (\Schema::hasColumn('bookings', 'payment_received')) {
                    $booking->update([
                        'payment_received' => true,
                        'payment_received_at' => now(),
                    ]);
                }
                if (\Schema::hasColumn('bookings', 'payment_method')) {
                    $booking->update(['payment_method' => 'tamara']);
                }
                if (\Schema::hasColumn('bookings', 'payment_reference')) {
                    $booking->update(['payment_reference' => $payment->payment_reference]);
                }

                Log::info('Payment completed via Tamara webhook', [
                    'payment_id' => $payment->id,
                    'booking_id' => $booking->id,
                ]);
            } else {
                $payment->update([
                    'status' => 'failed',
                    'failed_at' => now(),
                    'failure_reason' => $data['message'] ?? 'Capture failed',
                    'gateway_response' => array_merge($payment->gateway_response ?? [], $data),
                ]);
            }

            DB::commit();
            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to handle order capture', [
                'payment_id' => $payment->id,
                'error' => $e->getMessage(),
            ]);
            return response()->json(['error' => 'Processing failed'], 500);
        }
    }

    private function handleOrderCancellation(Payment $payment, array $data)
    {
        try {
            DB::beginTransaction();

            $status = $data['status'] ?? null;
            $cancelId = $data['cancel_id'] ?? null;
            $canceledAmount = $data['canceled_amount'] ?? null;

            $payment->update([
                'status' => 'cancelled',
                'gateway_response' => array_merge($payment->gateway_response ?? [], $data),
            ]);

            // إعادة المواعيد إلى available
            $booking = $payment->booking;
            if ($booking->selected_sessions) {
                $sessions = is_array($booking->selected_sessions) ? $booking->selected_sessions : [];
                $availabilityIds = collect($sessions)
                    ->pluck('availability_id')
                    ->filter()
                    ->unique();

                if ($availabilityIds->isNotEmpty()) {
                    \App\Models\TeacherAvailability::whereIn('id', $availabilityIds)
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

            DB::commit();

            Log::info('Payment cancelled via Tamara webhook', [
                'payment_id' => $payment->id,
                'booking_id' => $booking->id,
                'cancel_status' => $status,
                'cancel_id' => $cancelId,
                'canceled_amount' => $canceledAmount,
            ]);

            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to handle order cancellation', [
                'payment_id' => $payment->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json(['error' => 'Processing failed'], 500);
        }
    }

    private function handleOrderRefund(Payment $payment, array $data)
    {
        try {
            DB::beginTransaction();

            $status = $data['status'] ?? null;
            $refundId = $data['refund_id'] ?? null;
            $refundedAmount = $data['refunded_amount'] ?? null;
            $captureId = $data['capture_id'] ?? null;

            $payment->update([
                'status' => 'refunded',
                'refunded_at' => now(),
                'gateway_response' => array_merge($payment->gateway_response ?? [], $data),
            ]);

            DB::commit();

            Log::info('Payment refunded via Tamara webhook', [
                'payment_id' => $payment->id,
                'booking_id' => $payment->booking_id,
                'refund_status' => $status,
                'refund_id' => $refundId,
                'refunded_amount' => $refundedAmount,
                'capture_id' => $captureId,
            ]);

            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to handle order refund', [
                'payment_id' => $payment->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json(['error' => 'Processing failed'], 500);
        }
    }
}
