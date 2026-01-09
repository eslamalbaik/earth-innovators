<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsSchool
{
    public function handle(Request $request, Closure $next): Response
    {
        if (!auth()->check()) {
            abort(403, 'يجب تسجيل الدخول للوصول إلى هذه الصفحة.');
        }

        $user = auth()->user();
        if (!$user->isSchool()) {
            abort(403, 'غير مصرح لك بالوصول إلى هذه الصفحة. يجب أن تكون مسجلًا كمدرسة. (الدور الحالي: ' . ($user->role ?? 'غير محدد') . ')');
        }

        return $next($request);
    }
}
