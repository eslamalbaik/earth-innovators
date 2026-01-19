<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PaymentGatewaySetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
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

        // Handle additional_settings as JSON
        if ($request->has('additional_settings')) {
            $validated['additional_settings'] = json_encode($request->additional_settings);
        }

        $paymentGateway->update($validated);

        // Update .env file or config cache if needed
        $this->updateConfigFile($paymentGateway);

        return redirect()->route('admin.payment-gateways.index')
            ->with('success', 'تم تحديث إعدادات بوابة الدفع بنجاح');
    }

    public function toggleStatus(PaymentGatewaySetting $paymentGateway)
    {
        $paymentGateway->update([
            'is_enabled' => !$paymentGateway->is_enabled,
        ]);

        $this->updateConfigFile($paymentGateway);

        return redirect()->back()
            ->with('success', $paymentGateway->is_enabled ? 'تم تفعيل بوابة الدفع' : 'تم إلغاء تفعيل بوابة الدفع');
    }

    public function testConnection(PaymentGatewaySetting $paymentGateway)
    {
        try {
            // Test connection based on gateway type
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

    private function updateConfigFile(PaymentGatewaySetting $gateway)
    {
        // Update config/services.php values via .env
        // This is a simplified approach - in production, you might want to use a config cache
        $envFile = base_path('.env');
        
        if (!file_exists($envFile)) {
            return;
        }

        $envContent = file_get_contents($envFile);
        
        // Update gateway-specific environment variables
        $gatewayName = strtoupper($gateway->gateway_name);
        
        // Update API key
        if ($gateway->api_key) {
            $pattern = "/^{$gatewayName}_API_KEY=.*/m";
            $replacement = "{$gatewayName}_API_KEY={$gateway->api_key}";
            if (preg_match($pattern, $envContent)) {
                $envContent = preg_replace($pattern, $replacement, $envContent);
            } else {
                $envContent .= "\n{$replacement}";
            }
        }

        // Update test mode
        $pattern = "/^{$gatewayName}_TEST_MODE=.*/m";
        $replacement = "{$gatewayName}_TEST_MODE=" . ($gateway->is_test_mode ? 'true' : 'false');
        if (preg_match($pattern, $envContent)) {
            $envContent = preg_replace($pattern, $replacement, $envContent);
        } else {
            $envContent .= "\n{$replacement}";
        }

        // Update webhook secret if exists
        if ($gateway->webhook_secret) {
            $pattern = "/^{$gatewayName}_WEBHOOK_SECRET=.*/m";
            $replacement = "{$gatewayName}_WEBHOOK_SECRET={$gateway->webhook_secret}";
            if (preg_match($pattern, $envContent)) {
                $envContent = preg_replace($pattern, $replacement, $envContent);
            } else {
                $envContent .= "\n{$replacement}";
            }
        }

        file_put_contents($envFile, $envContent);
    }

    private function performConnectionTest(PaymentGatewaySetting $gateway)
    {
        switch ($gateway->gateway_name) {
            case 'tamara':
                return $this->testTamaraConnection($gateway);
            case 'ziina':
                return $this->testZiinaConnection($gateway);
            default:
                return [
                    'success' => false,
                    'message' => 'نوع بوابة الدفع غير مدعوم للاختبار',
                ];
        }
    }

    private function testTamaraConnection(PaymentGatewaySetting $gateway)
    {
        try {
            $baseUrl = $gateway->is_test_mode 
                ? 'https://api-sandbox.tamara.co'
                : 'https://api.tamara.co';

            $response = \Illuminate\Support\Facades\Http::withHeaders([
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
            $baseUrl = $gateway->is_test_mode 
                ? 'https://api.sandbox.ziina.com/v1'
                : 'https://api.ziina.com/v1';

            $response = \Illuminate\Support\Facades\Http::withHeaders([
                'Authorization' => 'Bearer ' . $gateway->api_key,
            ])->get("{$baseUrl}/health");

            if ($response->successful()) {
                return [
                    'success' => true,
                    'message' => 'تم الاتصال بنجاح مع Ziina',
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

