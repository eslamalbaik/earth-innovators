<?php

namespace Database\Seeders;

use App\Models\PaymentGatewaySetting;
use Illuminate\Database\Seeder;

class PaymentGatewaySettingsSeeder extends Seeder
{
    public function run(): void
    {
        $gateways = [
            [
                'gateway_name' => 'tamara',
                'display_name' => 'Tamara',
                'display_name_ar' => 'تمارا',
                'is_enabled' => false,
                'is_test_mode' => true,
                'api_key' => env('TAMARA_API_KEY', ''),
                'api_secret' => null,
                'public_key' => env('TAMARA_PUBLIC_KEY', ''),
                'webhook_secret' => env('TAMARA_NOTIFICATION_KEY', ''),
                'base_url' => env('TAMARA_BASE_URL', 'https://api-sandbox.tamara.co'),
                'description' => 'Tamara payment gateway for installments',
                'description_ar' => 'بوابة دفع تمارا للتقسيط',
                'sort_order' => 1,
            ],
            [
                'gateway_name' => 'ziina',
                'display_name' => 'Ziina',
                'display_name_ar' => 'زينة',
                'is_enabled' => false,
                'is_test_mode' => true,
                'api_key' => env('ZIINA_API_KEY', ''),
                'api_secret' => null,
                'public_key' => null,
                'webhook_secret' => env('ZIINA_WEBHOOK_SECRET', ''),
                'base_url' => env('ZIINA_BASE_URL', 'https://api.sandbox.ziina.com/v1'),
                'description' => 'Ziina payment gateway',
                'description_ar' => 'بوابة دفع زينة',
                'sort_order' => 2,
            ],
        ];

        foreach ($gateways as $gateway) {
            PaymentGatewaySetting::updateOrCreate(
                ['gateway_name' => $gateway['gateway_name']],
                $gateway
            );
        }
    }
}
