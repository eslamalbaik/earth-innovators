<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsAdmin
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = auth()->user();

        if (! $user || ! $user->canAccessAdminPanel()) {
            if ($request->header('X-Inertia')) {
                return redirect()->route('admin.login')
                    ->with('error', __('يجب تسجيل الدخول بحساب مشرف للوصول إلى لوحة التحكم.'));
            }

            return redirect()->route('admin.login')
                ->withErrors(['email' => __('يجب تسجيل الدخول بحساب مشرف للوصول إلى لوحة التحكم.')]);
        }

        return $next($request);
    }
}
