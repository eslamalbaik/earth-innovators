<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Services\PackagePaymentService;
use App\Services\ZiinaService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class ZiinaWebhookController extends Controller
{
    public function __construct(
        private ZiinaService $ziinaService,
        private PackagePaymentService $packagePaymentService
    ) {}

    public function handle(Request $request)
    {
        Log::info('Ziina webhook received', [
            'payload' => $request->all(),
            'headers' => $request->headers->all(),
        ]);

        try {
            $signature = $request->header('X-Ziina-Signature');
            if ($signature) {
                $payload = $request->getContent();
                if (!$this->ziinaService->verifyWebhookSignature($payload, $signature)) {
                    Log::error('Invalid Ziina webhook signature');
                    return response()->json(['error' => 'Invalid signature'], 403);
                }
            }

            $event = $request->all();
            $paymentRequest = $event['data'] ?? null;
            $gatewayPaymentId = $paymentRequest['id'] ?? null;

            if (!$gatewayPaymentId) {
                Log::error('Invalid Ziina webhook format');
                return response()->json(['error' => 'Invalid webhook format'], 400);
            }

            $payment = Payment::where('gateway_payment_id', $gatewayPaymentId)->first();
            if (!$payment) {
                Log::warning('Package payment not found for Ziina webhook', [
                    'gateway_payment_id' => $gatewayPaymentId,
                ]);

                return response()->json(['success' => true]);
            }

            switch ($event['type'] ?? null) {
                case 'payment_request.paid':
                    $this->packagePaymentService->finalizePayment($payment, $paymentRequest);
                    break;

                case 'payment_request.failed':
                    $this->packagePaymentService->markPaymentFailed($payment, $paymentRequest);
                    break;

                case 'payment_request.cancelled':
                    $this->packagePaymentService->markPaymentCancelled($payment, $paymentRequest);
                    break;

                default:
                    Log::info('Unhandled Ziina webhook event type', [
                        'type' => $event['type'] ?? null,
                    ]);
            }

            return response()->json(['success' => true]);
        } catch (\Throwable $exception) {
            Log::error('Error processing Ziina webhook', [
                'error' => $exception->getMessage(),
                'trace' => $exception->getTraceAsString(),
            ]);

            return response()->json(['error' => 'Webhook processing failed'], 500);
        }
    }
}
