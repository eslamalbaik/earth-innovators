<?php

namespace App\Http\Middleware;

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
                    // Only include image if it exists - avoid unnecessary data
                    'image' => $user->image ? (
                        str_starts_with($user->image, 'http') 
                            ? $user->image 
                            : '/storage/' . $user->image
                    ) : null,
                ] : null,
            ],
            // Flash messages are lightweight, keep them
            'flash' => [
                'success' => $request->session()->get('success'),
                'error' => $request->session()->get('error'),
            ],
            // PERFORMANCE: Add ziggy route helper only in development to reduce payload
            'ziggy' => fn () => [
                'url' => $request->url(),
            ],
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
