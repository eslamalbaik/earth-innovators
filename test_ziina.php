<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

echo "🔍 Testing Ziina API Connection...\n\n";

$apiKey = config('services.ziina.api_key');
$testMode = config('services.ziina.test_mode');
$baseUrl = 'https://api-v2.ziina.com/api';

echo "API Key: " . substr($apiKey, 0, 20) . "...\n";
echo "Test Mode: " . ($testMode ? 'Yes' : 'No') . "\n";
echo "Base URL: $baseUrl\n\n";

echo "📡 Creating test payment intent...\n";

try {
    $response = Http::withHeaders([
        'Authorization' => 'Bearer ' . $apiKey,
        'Content-Type' => 'application/json',
        'Accept' => 'application/json',
    ])->post($baseUrl . '/payment_intent', [
        'amount' => 200, // 2 AED in fils
        'currency_code' => 'AED',
        'success_url' => 'https://example.com/success',
        'cancel_url' => 'https://example.com/cancel',
    ]);

    echo "Status Code: " . $response->status() . "\n";
    echo "Response Body:\n";
    echo json_encode($response->json(), JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "\n\n";

    if ($response->successful()) {
        echo "✅ SUCCESS! Connection to Ziina API is working!\n";
        $data = $response->json();
        if (isset($data['redirect_url'])) {
            echo "Payment URL: " . $data['redirect_url'] . "\n";
        }
    } else {
        echo "❌ FAILED! Status: " . $response->status() . "\n";
        if ($response->status() === 401) {
            echo "⚠️  Authentication error - Please check your API key\n";
        }
    }
} catch (\Exception $e) {
    echo "❌ EXCEPTION: " . $e->getMessage() . "\n";
}
