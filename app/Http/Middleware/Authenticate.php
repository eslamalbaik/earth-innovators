<?php

namespace App\Http\Middleware;

use Illuminate\Auth\Middleware\Authenticate as Middleware;
use Illuminate\Http\Request;

class Authenticate extends Middleware
{
    /**
     * @return string|null
     */
    protected function redirectTo(Request $request): ?string
    {
        if ($request->is('admin') || $request->is('admin/*')) {
            return route('admin.login');
        }

        return route('login');
    }
}
