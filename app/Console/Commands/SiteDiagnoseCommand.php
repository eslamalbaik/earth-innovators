<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Support\SessionCookieDomain;
use Illuminate\Console\Command;

class SiteDiagnoseCommand extends Command
{
    protected $signature = 'site:diagnose';

    protected $description = 'Show domain/session config (detect stale config cache breaking admin login)';

    public function handle(): int
    {
        $configCached = is_file(base_path('bootstrap/cache/config.php'));

        $sessionDomain = config('session.domain');
        $normalized = SessionCookieDomain::forRequestHost(
            $sessionDomain,
            parse_url((string) config('app.url'), PHP_URL_HOST) ?: 'localhost'
        );

        $this->table(
            ['Key', 'Value'],
            [
                ['config cached?', $configCached ? 'YES — run config:clear after .env changes' : 'no'],
                ['APP_URL', config('app.url')],
                ['APP_PRIMARY_URL', config('site.primary_url')],
                ['session.domain (active)', $sessionDomain === null || $sessionDomain === '' ? '(host only)' : $sessionDomain],
                ['session.domain for APP_URL host', $normalized === null || $normalized === '' ? '(host only)' : $normalized],
                ['SESSION_SECURE_COOKIE', config('session.secure') ? 'true' : 'false'],
                ['admin users in DB', (string) User::where('role', 'admin')->count()],
            ]
        );

        if (is_string($sessionDomain) && $sessionDomain !== '' && strtolower($sessionDomain) !== 'null') {
            $appHost = parse_url((string) config('app.url'), PHP_URL_HOST);
            if ($appHost && ! str_ends_with(strtolower($appHost), '.'.ltrim(strtolower($sessionDomain), '.'))
                && strtolower($appHost) !== strtolower(ltrim($sessionDomain, '.'))) {
                $this->warn('session.domain does not match APP_URL host — admin login cookies may be rejected by the browser.');
                $this->line('Fix: set SESSION_DOMAIN= (empty) in .env, then: php artisan config:clear');
            }
        }

        if ($configCached) {
            $this->line('');
            $this->comment('If you changed .env recently: php artisan config:clear && sudo systemctl reload php8.2-fpm');
        }

        return self::SUCCESS;
    }
}
