<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Primary public site (UAE)
    |--------------------------------------------------------------------------
    |
    | Used for canonical URLs, emails, and redirects from the secondary domain.
    |
    */
    'primary_url' => rtrim((string) env('APP_PRIMARY_URL', 'https://earth-innovators.ae'), '/'),

    /*
    |--------------------------------------------------------------------------
    | Secondary hostnames (.cloud mirror)
    |--------------------------------------------------------------------------
    */
    'secondary_hosts' => array_values(array_filter(array_map(
        static fn (string $host): string => strtolower(trim($host)),
        explode(',', (string) env('APP_SECONDARY_HOSTS', 'earth-innovators.cloud'))
    ))),

    /*
    |--------------------------------------------------------------------------
    | Redirect secondary → primary (enable on .cloud server only)
    |--------------------------------------------------------------------------
    */
    'redirect_secondary_to_primary' => filter_var(
        env('APP_REDIRECT_TO_PRIMARY', false),
        FILTER_VALIDATE_BOOL
    ),

    /*
    |--------------------------------------------------------------------------
    | Paths kept on secondary when redirect is enabled (admin until .ae is ready)
    |--------------------------------------------------------------------------
    */
    'redirect_exclude_prefixes' => [
        'admin',
        'api',
        'webhook',
        'up',
        'media',
    ],

];
