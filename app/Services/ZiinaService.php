<?php

namespace App\Services;

use App\Models\PaymentGatewaySetting;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ZiinaService
{
    private ?string $apiKey;
    private string $baseUrl;
    private bool $testMode;
    private bool $isEnabled;

    public function __construct()
    {
        $gateway = PaymentGatewaySetting::query()
            ->where('gateway_name', 'ziina')
            ->first();

        if (!$gateway) {
            $this->apiKey = '';
            $this->testMode = (bool) config('services.ziina.test_mode', true);
            $this->isEnabled = false;
            $this->baseUrl = rtrim(config('services.ziina.base_url', 'https://api-v2.ziina.com/api'), '/');
            return;
        }

        $this->apiKey = $this->normalizeApiKey($gateway?->api_key ?: (config('services.ziina.api_key') ?? ''));
        $this->testMode = $gateway?->is_test_mode ?? config('services.ziina.test_mode', true);
        $this->isEnabled = $gateway?->is_enabled ?? true;
        $this->baseUrl = rtrim($gateway?->base_url ?: config('services.ziina.base_url', 'https://api-v2.ziina.com/api'), '/');
    }

    /**
     * Create a payment intent for package subscription
     *
     * @param array $data
     * @return array|null
     */
    public function createPaymentRequest(array $data): ?array
    {
        if (!$this->isEnabled) {
            Log::warning('Ziina payment service is disabled');

            return [
                'error' => true,
                'message' => ['key' => 'toastMessages.packageGatewayDisabled'],
            ];
        }

        if (empty($this->apiKey)) {
            Log::error('Ziina API key is not configured');
            return [
                'error' => true,
                'message' => ['key' => 'toastMessages.packageGatewayNotConfigured'],
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

            if ($response->status() === 401) {
                return [
                    'error' => true,
                    'message' => [
                        'key' => 'toastMessages.packagePaymentUnauthorized',
                        'details' => $this->testMode ? 'Ziina test mode' : 'Ziina live mode',
                    ],
                    'status' => $response->status(),
                    'details' => $response->json(),
                ];
            }

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
        $gateway = PaymentGatewaySetting::query()
            ->where('gateway_name', 'ziina')
            ->first();

        if (!$gateway) {
            Log::warning('Ziina webhook received but payment gateway setting is missing');
            return false;
        }

        $webhookSecret = $gateway?->webhook_secret ?: config('services.ziina.webhook_secret');
        
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

    private function normalizeApiKey(?string $apiKey): string
    {
        $apiKey = trim((string) $apiKey);

        if (str_starts_with(strtolower($apiKey), 'bearer ')) {
            $apiKey = trim(substr($apiKey, 7));
        }

        return $apiKey;
    }
}
