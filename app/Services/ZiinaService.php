<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ZiinaService
{
    private ?string $apiKey;
    private string $baseUrl;
    private bool $testMode;
    protected $paymentService;

    public function __construct(\App\Services\PaymentService $paymentService)
    {
        $this->apiKey = config('services.ziina.api_key') ?? '';
        $this->testMode = config('services.ziina.test_mode', true);
        $this->paymentService = $paymentService;
        
        $this->baseUrl = 'https://api-v2.ziina.com/api';
    }

    /**
     * Create a payment intent for package subscription
     *
     * @param array $data
     * @return array|null
     */
    public function createPaymentRequest(array $data): ?array
    {
        if (empty($this->apiKey)) {
            Log::error('Ziina API key is not configured');
            return [
                'error' => true,
                'message' => 'Ziina payment service is not configured. Please set ZIINA_API_KEY in your .env file.',
            ];
        }

        try {
            Log::info('Creating Ziina payment intent', ['data' => $data]);

            // Convert amount to fils (base currency unit)
            // For example: 100 AED = 10000 fils
            $amountInFils = (int) ($data['amount'] * 100);

            $payload = [
                'amount' => $amountInFils,
                'currency_code' => $data['currency'] ?? 'AED',
                'success_url' => $data['success_url'],
                'cancel_url' => $data['cancel_url'],
            ];

            // Add optional fields
            if (isset($data['description'])) {
                $payload['description'] = $data['description'];
            }

            if (isset($data['metadata'])) {
                $payload['metadata'] = $data['metadata'];
            }

            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->apiKey,
                'Content-Type' => 'application/json',
                'Accept' => 'application/json',
            ])->post($this->baseUrl . '/payment_intent', $payload);

            if ($response->successful()) {
                $result = $response->json();
                Log::info('Ziina payment intent created successfully', ['response' => $result]);
                return $result;
            }

            Log::error('Ziina payment intent failed', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);

            return [
                'error' => true,
                'message' => $response->json('message') ?? 'Failed to create payment intent',
                'status' => $response->status(),
                'details' => $response->json(),
            ];
        } catch (\Exception $e) {
            Log::error('Exception in Ziina payment intent', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return [
                'error' => true,
                'message' => $e->getMessage(),
            ];
        }
    }

    /**
     * Get payment intent status
     *
     * @param string $paymentIntentId
     * @return array|null
     */
    public function getPaymentRequest(string $paymentIntentId): ?array
    {
        if (empty($this->apiKey)) {
            Log::error('Ziina API key is not configured');
            return null;
        }

        try {
            Log::info('Getting Ziina payment intent', ['id' => $paymentIntentId]);

            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->apiKey,
                'Accept' => 'application/json',
            ])->get($this->baseUrl . '/payment_intent/' . $paymentIntentId);

            if ($response->successful()) {
                return $response->json();
            }

            Log::error('Failed to get Ziina payment intent', [
                'id' => $paymentIntentId,
                'status' => $response->status(),
                'body' => $response->body(),
            ]);

            return null;
        } catch (\Exception $e) {
            Log::error('Exception getting Ziina payment intent', [
                'id' => $paymentIntentId,
                'message' => $e->getMessage(),
            ]);

            return null;
        }
    }

    /**
     * Verify webhook signature
     *
     * @param string $payload
     * @param string $signature
     * @return bool
     */
    public function verifyWebhookSignature(string $payload, string $signature): bool
    {
        $webhookSecret = config('services.ziina.webhook_secret');
        
        if (!$webhookSecret) {
            Log::warning('Ziina webhook secret not configured');
            return false;
        }

        $expectedSignature = hash_hmac('sha256', $payload, $webhookSecret);
        
        return hash_equals($expectedSignature, $signature);
    }

    /**
     * Process webhook event
     *
     * @param array $event
     * @return bool
     */
    public function processWebhook(array $event): bool
    {
        try {
            Log::info('Processing Ziina webhook', ['event' => $event]);

            $eventType = $event['type'] ?? null;
            $paymentRequest = $event['data'] ?? null;

            if (!$eventType || !$paymentRequest) {
                Log::error('Invalid Ziina webhook format');
                return false;
            }

            switch ($eventType) {
                case 'payment_request.paid':
                    return $this->handlePaymentSuccess($paymentRequest);
                
                case 'payment_request.failed':
                    return $this->handlePaymentFailed($paymentRequest);
                
                case 'payment_request.cancelled':
                    return $this->handlePaymentCancelled($paymentRequest);
                
                default:
                    Log::info('Unhandled Ziina webhook event type', ['type' => $eventType]);
                    return true;
            }
        } catch (\Exception $e) {
            Log::error('Exception processing Ziina webhook', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return false;
        }
    }

    /**
     * Handle successful payment
     *
     * @param array $paymentRequest
     * @return bool
     */
    private function handlePaymentSuccess(array $paymentRequest): bool
    {
        Log::info('Handling successful Ziina payment webhook', ['payment' => $paymentRequest]);
        
        $metadata = $paymentRequest['metadata'] ?? [];
        $paymentId = $metadata['payment_id'] ?? null;
        
        if (!$paymentId) {
            $gatewayId = $paymentRequest['id'] ?? null;
            if ($gatewayId) {
                $payment = \App\Models\Payment::where('gateway_payment_id', $gatewayId)->first();
            }
        } else {
            $payment = \App\Models\Payment::find($paymentId);
        }

        if (isset($payment)) {
            $this->paymentService->finalizePackageSubscription($payment, $paymentRequest);
            return true;
        }

        Log::warning('Payment not found for Ziina webhook', ['metadata' => $metadata]);
        return false;
    }

    /**
     * Handle failed payment
     *
     * @param array $paymentRequest
     * @return bool
     */
    private function handlePaymentFailed(array $paymentRequest): bool
    {
        Log::info('Handling failed Ziina payment webhook', ['payment' => $paymentRequest]);
        
        $metadata = $paymentRequest['metadata'] ?? [];
        $paymentId = $metadata['payment_id'] ?? null;
        
        if ($paymentId) {
            $payment = \App\Models\Payment::find($paymentId);
            if ($payment) {
                $payment->update([
                    'status' => 'failed',
                    'failed_at' => now(),
                    'gateway_response' => array_merge($payment->gateway_response ?? [], $paymentRequest),
                ]);
            }
        }
        
        return true;
    }

    /**
     * Handle cancelled payment
     *
     * @param array $paymentRequest
     * @return bool
     */
    private function handlePaymentCancelled(array $paymentRequest): bool
    {
        Log::info('Handling cancelled Ziina payment webhook', ['payment' => $paymentRequest]);
        
        $metadata = $paymentRequest['metadata'] ?? [];
        $paymentId = $metadata['payment_id'] ?? null;
        
        if ($paymentId) {
            $payment = \App\Models\Payment::find($paymentId);
            if ($payment) {
                $payment->update([
                    'status' => 'cancelled',
                    'gateway_response' => array_merge($payment->gateway_response ?? [], $paymentRequest),
                ]);
            }
        }

        return true;
    }

    /**
     * Check if in test mode
     *
     * @return bool
     */
    public function isTestMode(): bool
    {
        return $this->testMode;
    }
}
