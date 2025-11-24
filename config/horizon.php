<?php

use Illuminate\Support\Str;

return [
    'domain' => null,
    'path' => 'horizon',
    'use' => 'default',
    'prefix' => env('HORIZON_PREFIX', Str::slug(env('APP_NAME', 'laravel'), '_').'_horizon:'),
    'middleware' => ['web'],
    'waits' => [
        'redis:default' => 60,
    ],
    'trim' => [
        'recent' => 60,
        'pending' => 60,
        'completed' => 60,
        'recent_failed' => 10080,
        'failed' => 10080,
        'monitored' => 10080,
    ],
    'metrics' => [
        'trim_snapshots' => [
            'job' => 24,
            'queue' => 24,
        ],
    ],
    'fast_termination' => false,
    'balance' => 'auto',
    'auto_scaling' => [
        'enabled' => false,
    ],
    'environments' => [
        'production' => [
            'supervisor-1' => [
                'connection' => 'redis',
                'queue' => ['default'],
                'balance' => 'simple',
                'processes' => 10,
                'tries' => 3,
                'nice' => 0,
                'timeout' => 60,
                'memory' => 128,
                'sleep' => 3,
                'max_time' => 0,
                'max_jobs' => 0,
                'force' => false,
            ],
        ],
        'local' => [
            'supervisor-1' => [
                'connection' => 'redis',
                'queue' => ['default'],
                'balance' => 'simple',
                'processes' => 3,
                'tries' => 3,
                'nice' => 0,
                'timeout' => 60,
                'memory' => 128,
                'sleep' => 3,
                'max_time' => 0,
                'max_jobs' => 0,
                'force' => false,
            ],
        ],
    ],
];

