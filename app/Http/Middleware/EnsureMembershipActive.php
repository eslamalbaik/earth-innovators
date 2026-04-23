<?php

namespace App\Http\Middleware;

use App\Services\MembershipAccessService;
use Closure;
use Illuminate\Http\Request;

class EnsureMembershipActive
{
    public function __construct(
        private MembershipAccessService $membershipAccessService
    ) {}

    public function handle(Request $request, Closure $next)
    {
        $user = $request->user();

        // Only gate authenticated, non-admin users.
        if (!$user || $user->isAdmin()) {
            return $next($request);
        }

        // Always allow the subscription and payment flows so users can renew.
        if (
            $request->is('packages*')
            || $request->is('payments/*/invoice')
            || $request->is('logout')
            || $request->is('login')
            || $request->is('register')
        ) {
            return $next($request);
        }

        $summary = $this->membershipAccessService->getMembershipSummary($user);

        if (empty($summary['packages_available'])) {
            return $next($request);
        }

        // If the school owns the access context, don't gate the member pages.
        if (!empty($summary['is_school_owned'])) {
            return $next($request);
        }

        if (!empty($summary['needs_renewal'])) {
            if ($request->expectsJson()) {
                return response()->json([
                    'message' => 'Subscription expired. Please renew to continue.',
                    'message_key' => 'toastMessages.subscriptionExpiredRenew',
                ], 402);
            }

            return redirect()->route('packages.index')->with('error', [
                'key' => 'toastMessages.subscriptionExpiredRenew',
            ]);
        }

        return $next($request);
    }
}
