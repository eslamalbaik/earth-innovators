<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class TamaraService
{
    private string $apiToken;
    private string $notificationToken;
    private string $publicKey;
    private string $baseUrl;
    private bool $isSandbox;

    public function __construct()
    {
        $this->apiToken = config('services.tamara.api_key') ?? '';
        $this->notificationToken = config('services.tamara.notification_key') ?? '';
        $this->publicKey = config('services.tamara.public_key') ?? '';
        $this->isSandbox = (bool) (config('services.tamara.sandbox') ?? true);

        $defaultBaseUrl = $this->isSandbox
            ? 'https://api-sandbox.tamara.co'
            : 'https://api.tamara.co';

        $this->baseUrl = rtrim(config('services.tamara.base_url') ?? $defaultBaseUrl, '/');
    }

    public function createCheckout(array $orderData): ?array
    {
        // التحقق من وجود API key
        if (empty($this->apiToken)) {
            return [
                'error' => true,
                'status' => 0,
                'message' => 'Tamara API key is not configured. Please check your .env file (TAMARA_API_KEY).',
                'body' => [],
            ];
        }

        if (strlen($this->apiToken) < 20) {
            return [
                'error' => true,
                'status' => 0,
                'message' => 'Tamara API key is invalid (too short). Please check your .env file (TAMARA_API_KEY). The key should be at least 20 characters long.',
                'body' => [],
            ];
        }

        try {
            $logOrderData = $orderData;
            if (isset($logOrderData['consumer']['phone_number'])) {
                $logOrderData['consumer']['phone_number'] = substr($logOrderData['consumer']['phone_number'], 0, 5) . '***';
            }
            if (isset($logOrderData['consumer']['email'])) {
                $logOrderData['consumer']['email'] = substr($logOrderData['consumer']['email'], 0, 3) . '***';
            }

            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->apiToken,
                'Content-Type' => 'application/json',
            ])->post($this->baseUrl . '/checkout', $orderData);

            if ($response->successful()) {
                $responseData = $response->json();
                return $responseData;
            }

            $errorBody = $response->json() ?? [];
            $errorMessage = $errorBody['message'] ?? $response->body() ?? 'Unknown error';
            return [
                'error' => true,
                'status' => $response->status(),
                'message' => $errorMessage,
                'body' => $errorBody,
            ];
        } catch (\Exception $e) {
            return null;
        }
    }

    public function getOrder(string $orderId): ?array
    {
        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->apiToken,
            ])->get($this->baseUrl . '/orders/' . $orderId);

            if ($response->successful()) {
                return $response->json();
            }

            return null;
        } catch (\Exception $e) {
            return null;
        }
    }

    public function authorizeOrder(string $orderId): ?array
    {
        $url = $this->baseUrl . '/orders/' . $orderId . '/authorise';

        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->apiToken,
                'Content-Type' => 'application/json',
            ])->post($url);

            $responseData = $response->json();
            $statusCode = $response->status();

            if ($response->successful()) {
                return $responseData;
            }

            return [
                'error' => true,
                'status' => $statusCode,
                'message' => $responseData['message'] ?? 'Authorization failed',
                'body' => $responseData,
            ];
        } catch (\Exception $e) {
            return [
                'error' => true,
                'status' => 0,
                'message' => $e->getMessage(),
                'body' => [],
            ];
        }
    }

    public function captureOrder(string $orderId, ?array $captureData = null): ?array
    {
        $url = $this->baseUrl . '/payments/capture';

        try {
            if (empty($captureData)) {
                $captureData = [
                    'order_id' => $orderId,
                    'total_amount' => [
                        'amount' => '0',
                        'currency' => 'AED',
                    ],
                ];
            } else {
                if (!isset($captureData['order_id'])) {
                    $captureData['order_id'] = $orderId;
                }
            }

            $httpRequest = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->apiToken,
                'Content-Type' => 'application/json',
            ]);

            $response = $httpRequest->post($url, $captureData);
            $responseData = $response->json();
            $statusCode = $response->status();

            if ($response->successful()) {
                return $responseData;
            }

            return [
                'error' => true,
                'status' => $statusCode,
                'message' => $responseData['message'] ?? 'Capture failed',
                'body' => $responseData,
            ];
        } catch (\Exception $e) {
            return [
                'error' => true,
                'status' => 0,
                'message' => $e->getMessage(),
                'body' => [],
            ];
        }
    }

    public function cancelOrder(string $orderId, ?array $cancelData = null): ?array
    {
        $url = $this->baseUrl . '/orders/' . $orderId . '/cancel';

        try {
            $httpRequest = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->apiToken,
                'Content-Type' => 'application/json',
            ]);

            // إذا كان هناك cancelData، أرسله في body
            if (!empty($cancelData)) {
                $response = $httpRequest->post($url, $cancelData);
            } else {
                $response = $httpRequest->post($url);
            }
            $responseData = $response->json();
            $statusCode = $response->status();

            if ($response->successful()) {
                return $responseData;
            }
            return [
                'error' => true,
                'status' => $statusCode,
                'message' => $responseData['message'] ?? 'Cancellation failed',
                'body' => $responseData,
            ];
        } catch (\Exception $e) {
            return [
                'error' => true,
                'status' => 0,
                'message' => $e->getMessage(),
                'body' => [],
            ];
        }
    }

    public function refundOrder(string $orderId, ?array $refundData = null): ?array
    {
        $url = $this->baseUrl . '/payments/simplified-refund/' . $orderId;

        try {
            if (empty($refundData)) {
                $refundData = [
                    'total_amount' => [
                        'amount' => '0',
                        'currency' => 'AED',
                    ],
                    'comment' => 'Refund request',
                ];
            }

            $httpRequest = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->apiToken,
                'Content-Type' => 'application/json',
            ]);

            $response = $httpRequest->post($url, $refundData);
            $responseData = $response->json();
            $statusCode = $response->status();

            if ($response->successful()) {
                return $responseData;
            }

            return [
                'error' => true,
                'status' => $statusCode,
                'message' => $responseData['message'] ?? 'Refund failed',
                'body' => $responseData,
            ];
        } catch (\Exception $e) {
            return [
                'error' => true,
                'status' => 0,
                'message' => $e->getMessage(),
                'body' => [],
            ];
        }
    }

    public function verifyWebhookToken(string $tamaraToken): bool
    {
        try {
            if (class_exists('\Firebase\JWT\JWT')) {
                $decoded = \Firebase\JWT\JWT::decode(
                    $tamaraToken,
                    new \Firebase\JWT\Key($this->notificationToken, 'HS256')
                );
                return $decoded !== null;
            }

            $parts = explode('.', $tamaraToken);
            if (count($parts) !== 3) {
                return false;
            }

            $payload = json_decode(base64_decode(str_replace(['-', '_'], ['+', '/'], $parts[1])), true);

            if (!$payload) {
                return false;
            }

            $signature = hash_hmac('sha256', $parts[0] . '.' . $parts[1], $this->notificationToken, true);
            $expectedSignature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));
            $actualSignature = $parts[2];

            return hash_equals($expectedSignature, $actualSignature);
        } catch (\Exception $e) {
            return false;
        }
    }

    public function getPaymentTypes(string $countryCode = 'AE', string $phone = '', string $currency = 'AED', float $orderValue = 0): ?array
    {
        try {
            $params = [
                'country' => $countryCode,
                'currency' => $currency,
                'order_value' => (string) number_format($orderValue, 2, '.', ''),
            ];

            if (!empty($phone)) {
                $params['phone'] = $phone;
            }

            // This endpoint does NOT require Authorization header
            $response = Http::withHeaders([
                'Content-Type' => 'application/json',
            ])->get($this->baseUrl . '/checkout/payment-types', $params);

            if ($response->successful()) {
                return $response->json();
            }

            return null;
        } catch (\Exception $e) {
            return null;
        }
    }

    public function getCustomerVerificationStatus(string $countryCode = 'SA', string $phone = ''): ?array
    {
        try {
            $params = [
                'country' => $countryCode,
            ];

            if (!empty($phone)) {
                $params['phone'] = $phone;
            }

            // This endpoint does NOT require Authorization header
            $response = Http::withHeaders([
                'Content-Type' => 'application/json',
            ])->get($this->baseUrl . '/checkout/customer-id-verification-status', $params);

            if ($response->successful()) {
                return $response->json();
            }

            return null;
        } catch (\Exception $e) {
            return null;
        }
    }

    public function getPublicKey(): string
    {
        return $this->publicKey;
    }

    public function isSandbox(): bool
    {
        return $this->isSandbox;
    }
}