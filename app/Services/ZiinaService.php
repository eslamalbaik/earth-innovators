<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ZiinaService
{
    private string $apiKey;
    private string $baseUrl;
    private bool $testMode;

    public function __construct()
    {
        $this->apiKey = config('services.ziina.api_key');
        $this->testMode = config('services.ziina.test_mode', true);
        
        // Ziina test/sandbox URL vs production URL
        $this->baseUrl = $this->testMode 
            ? 'https://api.sandbox.ziina.com/v1' 
            : 'https://api.ziina.com/v1';
    }

    /**
     * Create a payment request for package subscription
     *
     * @param array $data
     * @return array|null
     */
    public function createPaymentRequest(array $data): ?array
    {
        try {
            Log::info('Creating Ziina payment request', ['data' => $data]);

            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->apiKey,
                'Content-Type' => 'application/json',
                'Accept' => 'application/json',
            ])->post($this->baseUrl . '/payment-requests', [
                'amount' => $data['amount'],
                'currency' => $data['currency'] ?? 'AED',
                'description' => $data['description'],
                'customer' => [
                    'name' => $data['customer_name'],
                    'email' => $data['customer_email'],
                    'phone' => $data['customer_phone'] ?? null,
                ],
                'metadata' => $data['metadata'] ?? [],
                'success_url' => $data['success_url'],
                'cancel_url' => $data['cancel_url'],
                'webhook_url' => $data['webhook_url'] ?? null,
            ]);

            if ($response->successful()) {
                $result = $response->json();
                Log::info('Ziina payment request created successfully', ['response' => $result]);
                return $result;
            }

            Log::error('Ziina payment request failed', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);

            return [
                'error' => true,
                'message' => $response->json('message') ?? 'Failed to create payment request',
                'status' => $response->status(),
            ];
        } catch (\Exception $e) {
            Log::error('Exception in Ziina payment request', [
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
     * Get payment request status
     *
     * @param string $paymentRequestId
     * @return array|null
     */
    public function getPaymentRequest(string $paymentRequestId): ?array
    {
        try {
            Log::info('Getting Ziina payment request', ['id' => $paymentRequestId]);

            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->apiKey,
                'Accept' => 'application/json',
            ])->get($this->baseUrl . '/payment-requests/' . $paymentRequestId);

            if ($response->successful()) {
                return $response->json();
            }

            Log::error('Failed to get Ziina payment request', [
                'id' => $paymentRequestId,
                'status' => $response->status(),
                'body' => $response->body(),
            ]);

            return null;
        } catch (\Exception $e) {
            Log::error('Exception getting Ziina payment request', [
                'id' => $paymentRequestId,
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
        Log::info('Handling successful Ziina payment', ['payment' => $paymentRequest]);
        
        // This will be implemented in the controller/service layer
        return true;
    }

    /**
     * Handle failed payment
     *
     * @param array $paymentRequest
     * @return bool
     */
    private function handlePaymentFailed(array $paymentRequest): bool
    {
        Log::info('Handling failed Ziina payment', ['payment' => $paymentRequest]);
        
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
        Log::info('Handling cancelled Ziina payment', ['payment' => $paymentRequest]);
        
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

