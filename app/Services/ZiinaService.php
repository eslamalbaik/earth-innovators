<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ZiinaService
{
    private ?string $apiKey;
    private string $baseUrl;
    private bool $testMode;

    public function __construct()
    {
        $this->apiKey = config('services.ziina.api_key') ?? '';
        $this->testMode = config('services.ziina.test_mode', true);
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
     * Check if in test mode
     *
     * @return bool
     */
    public function isTestMode(): bool
    {
        return $this->testMode;
    }
}
