<?php

namespace App\Support;

class SessionCookieDomain
{
    /**
     * Use the configured session domain only when it matches the host the user is visiting.
     * Prevents login/session failures when .env was copied from the other server (.ae vs .cloud).
     */
    public static function forRequestHost(?string $configuredDomain, string $requestHost): ?string
    {
        if ($configuredDomain === null || $configuredDomain === '') {
            return null;
        }

        $normalized = strtolower(trim($configuredDomain));

        if ($normalized === 'null') {
            return null;
        }

        $domain = ltrim($normalized, '.');
        $host = strtolower($requestHost);

        if ($host === $domain || str_ends_with($host, '.'.$domain)) {
            return $configuredDomain;
        }

        return null;
    }
}
