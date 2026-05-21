<?php

namespace App\Http\Middleware;

use App\Support\SiteUrl;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RedirectSecondaryDomainToPrimary
{
    public function handle(Request $request, Closure $next): Response
    {
        if (! config('site.redirect_secondary_to_primary')) {
            return $next($request);
        }

        if (! SiteUrl::isSecondaryHost($request->getHost())) {
            return $next($request);
        }

        foreach (config('site.redirect_exclude_prefixes', []) as $prefix) {
            if ($request->is($prefix) || $request->is($prefix.'/*')) {
                return $next($request);
            }
        }

        $target = SiteUrl::primary($request->getRequestUri());

        return redirect()->away($target, 301);
    }
}
