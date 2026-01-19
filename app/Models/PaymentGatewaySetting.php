<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PaymentGatewaySetting extends Model
{
    protected $fillable = [
        'gateway_name',
        'display_name',
        'display_name_ar',
        'is_enabled',
        'is_test_mode',
        'api_key',
        'api_secret',
        'public_key',
        'webhook_secret',
        'base_url',
        'additional_settings',
        'description',
        'description_ar',
        'sort_order',
    ];

    protected $casts = [
        'is_enabled' => 'boolean',
        'is_test_mode' => 'boolean',
        'additional_settings' => 'array',
        'sort_order' => 'integer',
    ];
}
