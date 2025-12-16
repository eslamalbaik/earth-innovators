<?php

namespace App\Services;

use App\Models\User;
use App\Models\EmailOtp;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class PasswordResetService extends BaseService
{
    protected int $expiryMinutes = 10;
    protected int $maxAttempts = 3;

    public function __construct(
        private OtpService $otpService
    ) {
        $this->expiryMinutes = (int) env('PASSWORD_RESET_OTP_EXPIRY_MINUTES', 10);
        $this->maxAttempts = (int) env('PASSWORD_RESET_OTP_MAX_ATTEMPTS', 3);
    }

    /**
     * Generate and send password reset OTP
     */
    public function generateOtp(User $user, ?string $ipAddress = null): EmailOtp
    {
        return $this->otpService->generate(
            $user->email,
            'password_reset',
            $ipAddress
        );
    }

    /**
     * Verify OTP code for password reset
     */
    public function verifyOtp(string $email, string $code, ?string $token = null): bool
    {
        return $this->otpService->verify($email, $code, 'password_reset', $token);
    }

    /**
     * Get OTP by token
     */
    public function getOtpByToken(string $token): ?EmailOtp
    {
        return $this->otpService->getByToken($token);
    }

    /**
     * Reset password using verified OTP
     */
    public function resetPassword(string $email, string $newPassword, string $token, ?string $ipAddress = null): bool
    {
        // Get OTP to ensure it's verified and valid
        // OTP must be verified (used_at is not null) and not expired
        $otp = EmailOtp::where('email', $email)
            ->where('token', $token)
            ->where('purpose', 'password_reset')
            ->whereNotNull('used_at') // Must be verified (marked as used after OTP verification)
            ->where('expires_at', '>', now())
            ->first();

        if (!$otp) {
            $this->logError('OTP not found or not verified', [
                'email' => $email,
                'token' => $token
            ]);
            return false;
        }

        // Get user
        $user = User::where('email', $email)->first();

        if (!$user) {
            $this->logError('User not found', ['email' => $email]);
            return false;
        }

        // Update password (only password, preserve role)
        $user->password = Hash::make($newPassword);
        $user->save();

        // Delete all unused password reset OTPs for this user
        EmailOtp::where('email', $email)
            ->where('purpose', 'password_reset')
            ->whereNull('used_at')
            ->delete();

        $this->logInfo('Password reset successful', [
            'email' => $user->email,
            'ip_address' => $ipAddress
        ]);

        return true;
    }

    /**
     * Clean up expired OTPs
     */
    public function cleanupExpired(): int
    {
        return EmailOtp::where('purpose', 'password_reset')
            ->where(function ($query) {
                $query->where('expires_at', '<', now())
                    ->orWhere(function ($q) {
                        $q->where('attempts', '>=', $this->maxAttempts)
                            ->where('created_at', '<', Carbon::now()->subHour());
                    });
            })
            ->delete();
    }

    /**
     * Get expiry minutes
     */
    public function getExpiryMinutes(): int
    {
        return $this->expiryMinutes;
    }
}
