<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SetLocale
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Check cookie first, then use default
        $locale = $request->cookie('locale');
        
        // Validate that locale exists
        if ($locale && in_array($locale, ['ar', 'en'])) {
            app()->setLocale($locale);
        } else {
            // Default to Arabic as per requirements
            app()->setLocale('ar');
        }

        return $next($request);
    }
}
