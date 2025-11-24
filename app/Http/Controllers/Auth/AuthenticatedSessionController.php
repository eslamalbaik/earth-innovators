<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    public function create(): Response
    {
        return Inertia::render('Auth/Login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => session('status'),
        ]);
    }

    public function store(LoginRequest $request): RedirectResponse
    {
        if ($request->string('role')->value() === 'admin') {
            return redirect()
                ->route('admin.login')
                ->withErrors([
                    'email' => __('يرجى استخدام صفحة دخول المشرفين.'),
                ]);
        }

        $request->authenticate();

        $request->session()->regenerate();

        // إذا كان المعلم، تأكد من أن teacher record نشط ومعتمد
        $user = Auth::user();
        if ($user && $user->isTeacher()) {
            $teacher = $user->teacher;
            if ($teacher && (!$teacher->is_active || !$teacher->is_verified)) {
                // تحديث تلقائياً ليكون نشطاً ومعتمداً
                $teacher->update([
                    'is_active' => true,
                    'is_verified' => true,
                ]);
            }
        }

        return redirect()->intended(route('dashboard', absolute: false));
    }

    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return redirect('/');
    }
}