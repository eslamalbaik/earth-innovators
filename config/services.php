<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],

    'resend' => [
        'key' => env('RESEND_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'tamara' => [
        'api_key'          => env('TAMARA_API_KEY'),
        'notification_key' => env('TAMARA_NOTIFICATION_KEY'),
        'public_key'       => env('TAMARA_PUBLIC_KEY', env('TAMARA_API_KEY')), // fallback if needed
        'environment'      => env('TAMARA_ENV', 'sandbox'),
        'sandbox'          => env('TAMARA_ENV', 'sandbox') !== 'production',
        'base_url'         => env('TAMARA_BASE_URL') ?: (
            env('TAMARA_ENV', 'sandbox') === 'production'
            ? 'https://api.tamara.co'
            : 'https://api-sandbox.tamara.co'
        ),
    ],

    'ziina' => [
        'api_key' => env('ZIINA_API_KEY'),
        'webhook_secret' => env('ZIINA_WEBHOOK_SECRET'),
        'test_mode' => env('ZIINA_TEST_MODE', true),
    ],
];
