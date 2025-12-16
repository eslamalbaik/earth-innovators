<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Services\PasswordResetService;
use App\Services\EmailService;
use App\Models\User;
use App\Mail\OtpMail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class PasswordResetLinkController extends Controller
{
    public function __construct(
        private PasswordResetService $passwordResetService,
        private EmailService $emailService
    ) {}

    public function create(): Response
    {
        return Inertia::render('Auth/ForgotPassword', [
            'status' => session('status'),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'email' => 'required|email|exists:users,email',
        ]);

        try {
            $user = User::where('email', $request->email)->first();

            if (!$user) {
                throw ValidationException::withMessages([
                    'email' => ['لا يمكننا العثور على مستخدم بهذا البريد الإلكتروني.'],
                ]);
            }

            // Generate OTP
            $otp = $this->passwordResetService->generateOtp($user, $request->ip());

            // Send OTP email
            $shouldQueue = env('APP_ENV') === 'production';
            $emailSent = $this->emailService->send(
                $user->email,
                OtpMail::class,
                [
                    $otp->plain_code,
                    'password_reset',
                    $this->passwordResetService->getExpiryMinutes()
                ],
                $shouldQueue
            );

            if (!$emailSent) {
                throw new \Exception('Failed to send email');
            }

            // Redirect to OTP verification page with token
            return redirect()->route('password.reset.otp', ['token' => $otp->token])
                ->with('status', 'تم إرسال رمز التحقق إلى بريدك الإلكتروني.');
        } catch (\Exception $e) {
            throw ValidationException::withMessages([
                'email' => ['حدث خطأ أثناء إرسال رمز التحقق. يرجى المحاولة مرة أخرى.'],
            ]);
        }
    }
}
