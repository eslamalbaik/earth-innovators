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
        $request->validate([
            'email' => 'required|email|exists:users,email',
        ]);

        try {
            $user = User::where('email', $request->email)->first();

            if (!$user) {
                throw ValidationException::withMessages([
                    'email' => ['We could not find a user with that email address.'],
                ]);
            }

            $otp = $this->passwordResetService->generateOtp($user, $request->ip());

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
                ->with('status', 'OTP sent to your email successfully.');
        } catch (ValidationException $e) {
            throw $e;
        } catch (\Exception $e) {
            $message = str_contains($e->getMessage(), 'Too many OTP requests')
                ? 'Too many OTP requests. Please wait a moment and try again.'
                : 'An error occurred while sending the OTP. Please try again.';

            throw ValidationException::withMessages([
                'email' => [$message],
            ]);
        }
    }
}
