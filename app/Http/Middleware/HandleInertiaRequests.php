<?php

namespace App\Http\Middleware;

use App\Models\UserPackage;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): string|null
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     * PERFORMANCE OPTIMIZED: Minimal shared data to reduce payload size
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();
        
        return array_merge(parent::share($request), [
            'auth' => [
                'user' => $user ? [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                    'school_id' => $user->school_id,
                    // Only include image if it exists - avoid unnecessary data
                    'image' => $user->image ? (
                        str_starts_with($user->image, 'http')
                            ? $user->image
                            // Add a simple cache-buster so profile image updates reflect immediately in the UI.
                            : '/storage/' . $user->image . '?v=' . ($user->updated_at?->timestamp ?? time())
                    ) : null,
                ] : null,
            ],
            // Flash messages are lightweight, keep them
            'flash' => [
                // Use pull() to avoid repeated toasts across subsequent Inertia requests
                // when the session doesn't rotate flash data the way a full redirect does.
                'success' => $request->session()->pull('success'),
                'error' => $request->session()->pull('error'),
                'warning' => $request->session()->pull('warning'),
                'info' => $request->session()->pull('info'),
            ],
            // PERFORMANCE: Add ziggy route helper only in development to reduce payload
            'ziggy' => fn () => [
                'url' => $request->url(),
            ],
            // Subscription/Trial banner data — lightweight, computed once per request
            'subscription' => function () use ($user) {
                if (!$user || in_array($user->role, ['admin'])) {
                    return null;
                }
                try {
                    $sub = UserPackage::with('package:id,name')
                        ->where('user_id', $user->id)
                        ->whereIn('status', ['active', 'trial'])
                        ->orderByDesc('created_at')
                        ->first();

                    if (!$sub) return ['status' => 'none'];

                    $daysLeft = $sub->end_date
                        ? (int) now()->startOfDay()->diffInDays($sub->end_date, false)
                        : null;

                    return [
                        'status'      => $sub->status,
                        'packageName' => $sub->package?->name ?? '',
                        'endDate'     => $sub->end_date?->toDateString(),
                        'daysLeft'    => $daysLeft,
                        'isTrial'     => $sub->status === 'trial',
                        'isExpiring'  => $daysLeft !== null && $daysLeft <= 7 && $daysLeft >= 0,
                        'isExpired'   => $daysLeft !== null && $daysLeft < 0,
                    ];
                } catch (\Exception $e) {
                    return null;
                }
            },
        ]);
    }

    /**
     * Set the root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     */
    public function rootView(Request $request): string
    {
        return parent::rootView($request);
    }
}
