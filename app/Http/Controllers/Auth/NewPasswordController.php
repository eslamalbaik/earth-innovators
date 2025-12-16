<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Services\PasswordResetService;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class NewPasswordController extends Controller
{
    public function __construct(
        private PasswordResetService $passwordResetService
    ) {}

    public function create(Request $request): Response
    {
        return Inertia::render('Auth/ResetPassword', [
            'email' => $request->email,
            'token' => $request->route('token'),
            'status' => session('status'),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'token' => 'required',
            'email' => 'required|email',
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        try {
            // Reset password using JWT token
            $success = $this->passwordResetService->resetPassword(
                $request->token,
                $request->password,
                $request->ip()
            );

            if (!$success) {
                throw ValidationException::withMessages([
                    'email' => ['رمز إعادة التعيين غير صحيح أو منتهي الصلاحية.'],
                ]);
            }

            // Get user by email since token is now marked as used
            $user = \App\Models\User::where('email', $request->email)->first();

            if ($user) {
                // Fire password reset event
                event(new PasswordReset($user));
            }

            return redirect()->route('login')->with('status', 'تم إعادة تعيين كلمة المرور بنجاح.');
        } catch (\Exception $e) {
            throw ValidationException::withMessages([
                'email' => ['حدث خطأ أثناء إعادة تعيين كلمة المرور. يرجى المحاولة مرة أخرى.'],
            ]);
        }
    }
}
