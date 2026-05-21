<?php

namespace App\Http\Controllers\Admin\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class AdminAuthenticatedSessionController extends Controller
{
    public function create(): Response|RedirectResponse
    {
        $user = Auth::user();

        if ($user?->canAccessAdminPanel()) {
            return redirect()->route('admin.dashboard');
        }

        if ($user) {
            Auth::logout();
            request()->session()->invalidate();
            request()->session()->regenerateToken();
        }

        return Inertia::render('Admin/Auth/Login', [
            'status' => session('status'),
        ]);
    }

    public function store(LoginRequest $request): RedirectResponse
    {
        if (Auth::check() && ! Auth::user()->canAccessAdminPanel()) {
            Auth::logout();
        }

        // Force the role to admin to avoid tampering
        $request->merge([
            'role' => 'admin',
        ]);

        $request->authenticate();

        $user = Auth::user();

        if (! $user?->canAccessAdminPanel()) {
            Auth::logout();

            return back()->withErrors([
                'email' => __('auth.failed'),
                'role' => __('هذا الحساب لا يملك صلاحية دخول لوحة المشرفين.'),
            ]);
        }

        if ($user->email_verified_at === null) {
            $user->forceFill(['email_verified_at' => now()])->save();
        }

        $request->session()->regenerate();

        return redirect()->route('admin.dashboard');
    }

    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return redirect()->route('admin.login');
    }
}
