<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Mail\OtpMail;
use App\Models\User;
use App\Services\EmailService;
use App\Services\PasswordResetService;
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
        $validated = $request->validate([
            'email' => 'required|email',
        ]);

        return $this->sendResetOtp($validated['email'], $request->ip());
    }

    public function resend(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'email' => 'required|email',
        ]);

        return $this->sendResetOtp($validated['email'], $request->ip());
    }

    private function sendResetOtp(string $email, ?string $ipAddress = null): RedirectResponse
    {
        $email = mb_strtolower(trim($email));

        try {
            $user = User::where('email', $email)->first();

            if (!$user) {
                throw ValidationException::withMessages([
                    'email' => ['لا يوجد حساب مرتبط بهذا البريد الإلكتروني.'],
                ]);
            }

            $otp = $this->passwordResetService->generateOtp($user, $ipAddress);

            $shouldQueue = env('APP_ENV') === 'production';
            $emailSent = $this->emailService->send(
                $user->email,
                OtpMail::class,
                [
                    $otp->plain_code,
                    'password_reset',
                    $this->passwordResetService->getExpiryMinutes(),
                ],
                $shouldQueue
            );

            if (!$emailSent) {
                throw new \Exception('Failed to send email');
            }

            return redirect()->route('password.reset.otp', ['token' => $otp->token])
                ->with('status', 'تم إرسال رمز التحقق إلى بريدك الإلكتروني بنجاح.');
        } catch (ValidationException $e) {
            throw $e;
        } catch (\Exception $e) {
            $message = str_contains($e->getMessage(), 'Too many OTP requests')
                ? 'تم طلب رموز كثيرة خلال وقت قصير. يرجى الانتظار قليلًا ثم المحاولة مرة أخرى.'
                : 'تعذر إرسال رمز التحقق حاليًا. يرجى المحاولة مرة أخرى.';

            throw ValidationException::withMessages([
                'email' => [$message],
            ]);
        }
    }
}
