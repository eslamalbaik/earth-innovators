<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Services\PasswordResetService;
use App\Models\EmailOtp;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rules;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class PasswordResetOtpController extends Controller
{
    public function __construct(
        private PasswordResetService $passwordResetService
    ) {}

    /**
     * Show OTP verification page
     */
    public function create(Request $request)
    {
        $token = $request->route('token');
        $otp = $this->passwordResetService->getOtpByToken($token);

        if (!$otp || $otp->purpose !== 'password_reset') {
            return redirect()->route('password.request')
                ->withErrors(['token' => 'رمز التحقق غير صحيح أو منتهي الصلاحية.']);
        }

        return Inertia::render('Auth/ResetPasswordOtp', [
            'token' => $token,
            'email' => $otp->email,
            'status' => session('status'),
        ]);
    }

    /**
     * Verify OTP and show password reset form
     */
    public function verifyOtp(Request $request): RedirectResponse
    {
        $request->validate([
            'token' => 'required|string',
            'email' => 'required|email',
            'otp_code' => 'required|string|size:6',
        ]);

        try {
            $verified = $this->passwordResetService->verifyOtp(
                $request->email,
                $request->otp_code,
                $request->token
            );

            if (!$verified) {
                throw ValidationException::withMessages([
                    'otp_code' => ['رمز التحقق غير صحيح أو منتهي الصلاحية.'],
                ]);
            }

            // Redirect to password reset form with verified token
            return redirect()->route('password.reset.form', ['token' => $request->token])
                ->with('status', 'تم التحقق من الرمز بنجاح. يرجى إدخال كلمة المرور الجديدة.');
        } catch (ValidationException $e) {
            throw $e;
        } catch (\Exception $e) {
            throw ValidationException::withMessages([
                'otp_code' => ['حدث خطأ أثناء التحقق من الرمز. يرجى المحاولة مرة أخرى.'],
            ]);
        }
    }

    /**
     * Show password reset form (after OTP verification)
     */
    public function showResetForm(Request $request)
    {
        $token = $request->route('token');
        $otp = EmailOtp::where('token', $token)
            ->where('purpose', 'password_reset')
            ->whereNotNull('used_at') // Must be verified
            ->where('expires_at', '>', now())
            ->first();

        if (!$otp) {
            return redirect()->route('password.request')
                ->withErrors(['token' => 'الرابط غير صحيح أو منتهي الصلاحية. يرجى طلب رمز جديد.']);
        }

        return Inertia::render('Auth/ResetPassword', [
            'token' => $token,
            'email' => $otp->email,
            'status' => session('status'),
        ]);
    }

    /**
     * Reset password after OTP verification
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'token' => 'required|string',
            'email' => 'required|email',
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        try {
            $success = $this->passwordResetService->resetPassword(
                $request->email,
                $request->password,
                $request->token,
                $request->ip()
            );

            if (!$success) {
                throw ValidationException::withMessages([
                    'email' => ['حدث خطأ أثناء إعادة تعيين كلمة المرور. يرجى المحاولة مرة أخرى.'],
                ]);
            }

            // Get user
            $user = \App\Models\User::where('email', $request->email)->first();

            if ($user) {
                // Fire password reset event
                event(new PasswordReset($user));
            }

            return redirect()->route('login')->with('status', 'تم إعادة تعيين كلمة المرور بنجاح.');
        } catch (ValidationException $e) {
            throw $e;
        } catch (\Exception $e) {
            throw ValidationException::withMessages([
                'email' => ['حدث خطأ أثناء إعادة تعيين كلمة المرور. يرجى المحاولة مرة أخرى.'],
            ]);
        }
    }
}
