<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\UserPackage;
use App\Services\ZiinaService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ZiinaWebhookController extends Controller
{
    public function __construct(
        private ZiinaService $ziinaService
    ) {}

    /**
     * Handle Ziina webhook
     */
    public function handle(Request $request)
    {
        Log::info('Ziina webhook received', [
            'payload' => $request->all(),
            'headers' => $request->headers->all(),
        ]);

        try {
            // Verify webhook signature if available
            $signature = $request->header('X-Ziina-Signature');
            if ($signature) {
                $payload = $request->getContent();
                if (!$this->ziinaService->verifyWebhookSignature($payload, $signature)) {
                    Log::error('Invalid Ziina webhook signature');
                    return response()->json(['error' => 'Invalid signature'], 403);
                }
            }

            $event = $request->all();
            $eventType = $event['type'] ?? null;
            $paymentRequest = $event['data'] ?? null;

            if (!$eventType || !$paymentRequest) {
                Log::error('Invalid Ziina webhook format');
                return response()->json(['error' => 'Invalid webhook format'], 400);
            }

            switch ($eventType) {
                case 'payment_request.paid':
                    $this->handlePaymentSuccess($paymentRequest);
                    break;
                
                case 'payment_request.failed':
                    $this->handlePaymentFailed($paymentRequest);
                    break;
                
                case 'payment_request.cancelled':
                    $this->handlePaymentCancelled($paymentRequest);
                    break;
                
                default:
                    Log::info('Unhandled Ziina webhook event type', ['type' => $eventType]);
            }

            return response()->json(['success' => true]);

        } catch (\Exception $e) {
            Log::error('Error processing Ziina webhook', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json(['error' => 'Webhook processing failed'], 500);
        }
    }

    /**
     * Handle successful payment
     */
    private function handlePaymentSuccess(array $paymentRequest)
    {
        try {
            $paymentId = $paymentRequest['id'] ?? null;
            $metadata = $paymentRequest['metadata'] ?? [];

            if (!$paymentId) {
                Log::error('Payment ID not found in webhook');
                return;
            }

            $payment = Payment::where('gateway_payment_id', $paymentId)->first();

            if (!$payment) {
                Log::error('Payment not found', ['payment_id' => $paymentId]);
                return;
            }

            // Check if already processed
            if ($payment->status === 'completed') {
                Log::info('Payment already processed', ['payment_id' => $payment->id]);
                return;
            }

            DB::beginTransaction();

            // Update payment
            $payment->update([
                'status' => 'completed',
                'paid_at' => now(),
                'gateway_response' => array_merge($payment->gateway_response ?? [], $paymentRequest),
            ]);

            // Update user package
            $userPackageId = $metadata['user_package_id'] ?? null;
            if ($userPackageId) {
                $userPackage = UserPackage::find($userPackageId);
                if ($userPackage && $userPackage->status !== 'active') {
                    $userPackage->update([
                        'status' => 'active',
                        'start_date' => now(),
                    ]);

                    // Add bonus points using PointsService for proper integration
                    if ($userPackage->package && $userPackage->package->points_bonus > 0) {
                        $user = $userPackage->user;
                        if ($user) {
                            $pointsService = app(\App\Services\PointsService::class);
                            $pointsService->awardPoints(
                                $user->id,
                                $userPackage->package->points_bonus,
                                'package_bonus',
                                $userPackage->package_id,
                                "Package subscription bonus: {$userPackage->package->name}",
                                "مكافأة اشتراك الباقة: {$userPackage->package->name_ar}"
                            );
                            
                            Log::info('Added bonus points to user via PointsService', [
                                'user_id' => $user->id,
                                'points' => $userPackage->package->points_bonus,
                                'package_id' => $userPackage->package_id,
                            ]);
                        }
                    }
                }
            }

            DB::commit();

            Log::info('Payment processed successfully', [
                'payment_id' => $payment->id,
                'user_package_id' => $userPackageId,
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error handling payment success webhook', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
        }
    }

    /**
     * Handle failed payment
     */
    private function handlePaymentFailed(array $paymentRequest)
    {
        try {
            $paymentId = $paymentRequest['id'] ?? null;
            $metadata = $paymentRequest['metadata'] ?? [];

            if (!$paymentId) {
                return;
            }

            $payment = Payment::where('gateway_payment_id', $paymentId)->first();

            if (!$payment) {
                return;
            }

            DB::beginTransaction();

            $payment->update([
                'status' => 'failed',
                'gateway_response' => array_merge($payment->gateway_response ?? [], $paymentRequest),
            ]);

            $userPackageId = $metadata['user_package_id'] ?? null;
            if ($userPackageId) {
                $userPackage = UserPackage::find($userPackageId);
                if ($userPackage) {
                    $userPackage->update(['status' => 'failed']);
                }
            }

            DB::commit();

            Log::info('Payment failed', ['payment_id' => $payment->id]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error handling payment failed webhook', [
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Handle cancelled payment
     */
    private function handlePaymentCancelled(array $paymentRequest)
    {
        try {
            $paymentId = $paymentRequest['id'] ?? null;
            $metadata = $paymentRequest['metadata'] ?? [];

            if (!$paymentId) {
                return;
            }

            $payment = Payment::where('gateway_payment_id', $paymentId)->first();

            if (!$payment) {
                return;
            }

            DB::beginTransaction();

            $payment->update([
                'status' => 'cancelled',
                'gateway_response' => array_merge($payment->gateway_response ?? [], $paymentRequest),
            ]);

            $userPackageId = $metadata['user_package_id'] ?? null;
            if ($userPackageId) {
                $userPackage = UserPackage::find($userPackageId);
                if ($userPackage) {
                    $userPackage->update(['status' => 'cancelled']);
                }
            }

            DB::commit();

            Log::info('Payment cancelled', ['payment_id' => $payment->id]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error handling payment cancelled webhook', [
                'error' => $e->getMessage(),
            ]);
        }
    }
}

