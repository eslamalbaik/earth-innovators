<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PaymentGatewaySetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class PaymentGatewayController extends Controller
{
    public function index()
    {
        $gateways = PaymentGatewaySetting::orderBy('sort_order')->get();

        return Inertia::render('Admin/PaymentGateways/Index', [
            'gateways' => $gateways,
        ]);
    }

    public function update(Request $request, PaymentGatewaySetting $paymentGateway)
    {
        $validated = $request->validate([
            'display_name' => 'required|string|max:255',
            'display_name_ar' => 'required|string|max:255',
            'is_enabled' => 'boolean',
            'is_test_mode' => 'boolean',
            'api_key' => 'nullable|string',
            'api_secret' => 'nullable|string',
            'public_key' => 'nullable|string',
            'webhook_secret' => 'nullable|string',
            'base_url' => 'nullable|url',
            'description' => 'nullable|string',
            'description_ar' => 'nullable|string',
            'sort_order' => 'integer|min:0',
        ]);

        if ($request->has('additional_settings')) {
            $validated['additional_settings'] = json_encode($request->additional_settings);
        }

        if (array_key_exists('api_key', $validated)) {
            $validated['api_key'] = $this->normalizeApiKey($validated['api_key']);
        }

        $paymentGateway->update($validated);
        $envSyncResult = $this->updateConfigFile($paymentGateway);

        $redirect = redirect()->route('admin.payment-gateways.index')
            ->with('success', 'تم تحديث إعدادات بوابة الدفع بنجاح');

        if (!$envSyncResult['success']) {
            $redirect->with('warning', $envSyncResult['message']);
        }

        return $redirect;
    }

    public function toggleStatus(PaymentGatewaySetting $paymentGateway)
    {
        $paymentGateway->update([
            'is_enabled' => !$paymentGateway->is_enabled,
        ]);

        $envSyncResult = $this->updateConfigFile($paymentGateway);

        $redirect = redirect()->back()
            ->with('success', $paymentGateway->is_enabled ? 'تم تفعيل بوابة الدفع' : 'تم إلغاء تفعيل بوابة الدفع');

        if (!$envSyncResult['success']) {
            $redirect->with('warning', $envSyncResult['message']);
        }

        return $redirect;
    }

    public function testConnection(PaymentGatewaySetting $paymentGateway)
    {
        try {
            $result = $this->performConnectionTest($paymentGateway);

            return response()->json([
                'success' => $result['success'],
                'message' => $result['message'],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ أثناء اختبار الاتصال: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function destroy(PaymentGatewaySetting $paymentGateway)
    {
        $gatewayName = $paymentGateway->gateway_name;
        $displayName = $paymentGateway->display_name_ar ?: $paymentGateway->display_name;

        $paymentGateway->delete();
        $this->removeConfigFileKeys($gatewayName);

        return redirect()->route('admin.payment-gateways.index')
            ->with('success', "تم حذف بوابة الدفع {$displayName} بنجاح");
    }

    private function updateConfigFile(PaymentGatewaySetting $gateway): array
    {
        $envFile = base_path('.env');

        if (!file_exists($envFile)) {
            return [
                'success' => true,
                'message' => 'تم حفظ الإعدادات في قاعدة البيانات، لكن ملف البيئة .env غير موجود على الخادم.',
            ];
        }

        $envContent = @file_get_contents($envFile);
        if ($envContent === false) {
            return [
                'success' => true,
                'message' => 'تم حفظ الإعدادات في قاعدة البيانات، لكن تعذر قراءة ملف البيئة .env على الخادم.',
            ];
        }

        $gatewayName = strtoupper($gateway->gateway_name);

        if ($gateway->api_key) {
            $pattern = "/^{$gatewayName}_API_KEY=.*/m";
            $replacement = "{$gatewayName}_API_KEY={$gateway->api_key}";
            if (preg_match($pattern, $envContent)) {
                $envContent = preg_replace($pattern, $replacement, $envContent);
            } else {
                $envContent .= "\n{$replacement}";
            }
        }

        $pattern = "/^{$gatewayName}_TEST_MODE=.*/m";
        $replacement = "{$gatewayName}_TEST_MODE=" . ($gateway->is_test_mode ? 'true' : 'false');
        if (preg_match($pattern, $envContent)) {
            $envContent = preg_replace($pattern, $replacement, $envContent);
        } else {
            $envContent .= "\n{$replacement}";
        }

        $pattern = "/^{$gatewayName}_WEBHOOK_SECRET=.*/m";
        $replacement = "{$gatewayName}_WEBHOOK_SECRET=" . ($gateway->webhook_secret ?? '');
        if (preg_match($pattern, $envContent)) {
            $envContent = preg_replace($pattern, $replacement, $envContent);
        } else {
            $envContent .= "\n{$replacement}";
        }

        try {
            $written = @file_put_contents($envFile, $envContent);

            if ($written === false) {
                throw new \RuntimeException('Unable to write .env file.');
            }

            return [
                'success' => true,
                'message' => null,
            ];
        } catch (\Throwable $exception) {
            Log::warning('Failed to sync payment gateway settings to .env', [
                'gateway' => $gateway->gateway_name,
                'path' => $envFile,
                'error' => $exception->getMessage(),
            ]);

            return [
                'success' => true,
                'message' => 'تم حفظ الإعدادات في قاعدة البيانات، لكن تعذر تحديث ملف .env على الخادم بسبب الصلاحيات. قد تحتاج لتحديث متغيرات البيئة يدويًا.',
            ];
        }
    }

    private function removeConfigFileKeys(string $gatewayName): void
    {
        $envFile = base_path('.env');

        if (!file_exists($envFile)) {
            return;
        }

        $envContent = @file_get_contents($envFile);
        if ($envContent === false) {
            return;
        }

        $prefix = strtoupper($gatewayName);
        $keys = [
            "{$prefix}_API_KEY",
            "{$prefix}_API_SECRET",
            "{$prefix}_PUBLIC_KEY",
            "{$prefix}_WEBHOOK_SECRET",
            "{$prefix}_NOTIFICATION_KEY",
            "{$prefix}_TEST_MODE",
            "{$prefix}_ENV",
            "{$prefix}_BASE_URL",
        ];

        foreach ($keys as $key) {
            $envContent = preg_replace("/^{$key}=.*\R?/m", '', $envContent);
        }

        try {
            $written = @file_put_contents($envFile, rtrim($envContent) . PHP_EOL);

            if ($written === false) {
                throw new \RuntimeException('Unable to write .env file.');
            }
        } catch (\Throwable $exception) {
            Log::warning('Failed to remove payment gateway settings from .env', [
                'gateway' => $gatewayName,
                'path' => $envFile,
                'error' => $exception->getMessage(),
            ]);
        }
    }

    private function normalizeApiKey(?string $apiKey): ?string
    {
        if (!is_string($apiKey)) {
            return $apiKey;
        }

        $apiKey = trim($apiKey);

        if (str_starts_with(strtolower($apiKey), 'bearer ')) {
            $apiKey = trim(substr($apiKey, 7));
        }

        return $apiKey;
    }

    private function performConnectionTest(PaymentGatewaySetting $gateway)
    {
        return match ($gateway->gateway_name) {
            'tamara' => $this->testTamaraConnection($gateway),
            'ziina' => $this->testZiinaConnection($gateway),
            default => [
                'success' => false,
                'message' => 'نوع بوابة الدفع غير مدعوم للاختبار',
            ],
        };
    }

    private function testTamaraConnection(PaymentGatewaySetting $gateway)
    {
        try {
            $baseUrl = $gateway->is_test_mode
                ? 'https://api-sandbox.tamara.co'
                : 'https://api.tamara.co';

            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $gateway->api_key,
            ])->get("{$baseUrl}/merchants/me");

            if ($response->successful()) {
                return [
                    'success' => true,
                    'message' => 'تم الاتصال بنجاح مع Tamara',
                ];
            }

            return [
                'success' => false,
                'message' => 'فشل الاتصال: ' . ($response->json()['message'] ?? 'خطأ غير معروف'),
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => 'خطأ في الاتصال: ' . $e->getMessage(),
            ];
        }
    }

    private function testZiinaConnection(PaymentGatewaySetting $gateway)
    {
        try {
            $baseUrl = 'https://api-v2.ziina.com/api';

            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $gateway->api_key,
                'Content-Type' => 'application/json',
                'Accept' => 'application/json',
            ])->post("{$baseUrl}/payment_intent", [
                'amount' => 200,
                'currency_code' => 'AED',
                'success_url' => 'https://example.com/success',
                'cancel_url' => 'https://example.com/cancel',
            ]);

            if ($response->successful()) {
                return [
                    'success' => true,
                    'message' => 'تم الاتصال بنجاح مع Ziina',
                ];
            }

            if ($response->status() === 401) {
                return [
                    'success' => false,
                    'message' => 'فشل الاتصال: مفتاح API غير صحيح',
                ];
            }

            return [
                'success' => false,
                'message' => 'فشل الاتصال: ' . ($response->json()['message'] ?? 'خطأ غير معروف'),
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => 'خطأ في الاتصال: ' . $e->getMessage(),
            ];
        }
    }
}
