<?php

namespace App\Services;

use App\Models\EmailOtp;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;
use Carbon\Carbon;

class OtpService extends BaseService
{
    protected int $expiryMinutes = 10;
    protected int $rateLimitMinutes = 1;
    protected int $maxAttempts = 3;
    protected int $otpLength = 6;

    public function __construct()
    {
        $this->expiryMinutes = (int) env('OTP_EXPIRY_MINUTES', 10);
        $this->rateLimitMinutes = (int) env('OTP_RATE_LIMIT_MINUTES', 1);
        $this->maxAttempts = (int) env('OTP_MAX_ATTEMPTS', 3);
        $this->otpLength = (int) env('OTP_LENGTH', 6);
    }

    /**
     * Generate and send OTP to email
     */
    public function generate(string $email, string $purpose = 'login', ?string $ipAddress = null, array $payload = []): EmailOtp
    {
        // Rate limiting check
        if ($this->isRateLimited($email, $purpose)) {
            throw new \Exception('Too many OTP requests. Please try again later.');
        }

        // Generate OTP code
        $otpCode = $this->generateOtpCode();

        // Hash the OTP before storing
        $hashedCode = Hash::make($otpCode);

        // Create token for tracking
        $token = Str::random(64);

        // Delete any existing unused OTPs for this email and purpose
        EmailOtp::where('email', $email)
            ->where('purpose', $purpose)
            ->whereNull('used_at')
            ->where('expires_at', '>', now())
            ->delete();

        // Create OTP record
        $otp = EmailOtp::create([
            'token' => $token,
            'email' => $email,
            'code' => $hashedCode,
            'purpose' => $purpose,
            'payload' => $payload,
            'ip_address' => $ipAddress,
            'expires_at' => Carbon::now()->addMinutes($this->expiryMinutes),
        ]);

        // Set rate limit cache
        $this->setRateLimit($email, $purpose);

        // Return OTP with unhashed code for email sending
        $otp->plain_code = $otpCode;

        return $otp;
    }

    /**
     * Verify OTP code
     */
    public function verify(string $email, string $code, string $purpose = 'login', ?string $token = null): bool
    {
        // Find OTP record
        $query = EmailOtp::where('email', $email)
            ->where('purpose', $purpose)
            ->whereNull('used_at')
            ->where('expires_at', '>', now());

        if ($token) {
            $query->where('token', $token);
        }

        $otp = $query->latest()->first();

        if (!$otp) {
            return false;
        }

        // Check if max attempts exceeded
        if ($otp->attempts >= $this->maxAttempts) {
            $this->logError('OTP max attempts exceeded', [
                'email' => $email,
                'purpose' => $purpose,
                'attempts' => $otp->attempts
            ]);
            return false;
        }

        // Increment attempts
        $otp->incrementAttempts();

        // Verify code
        if (!Hash::check($code, $otp->code)) {
            $this->logInfo('OTP verification failed', [
                'email' => $email,
                'purpose' => $purpose,
                'attempts' => $otp->attempts
            ]);
            return false;
        }

        // Mark as used
        $otp->markAsUsed();

        return true;
    }

    /**
     * Get OTP by token
     */
    public function getByToken(string $token): ?EmailOtp
    {
        return EmailOtp::where('token', $token)
            ->whereNull('used_at')
            ->where('expires_at', '>', now())
            ->first();
    }

    /**
     * Clean up expired OTPs
     */
    public function cleanupExpired(): int
    {
        return EmailOtp::where('expires_at', '<', now())
            ->orWhere(function ($query) {
                $query->where('attempts', '>=', $this->maxAttempts)
                    ->where('created_at', '<', Carbon::now()->subHour());
            })
            ->delete();
    }

    /**
     * Generate random OTP code
     */
    protected function generateOtpCode(): string
    {
        // Generate numeric OTP
        $otp = '';
        for ($i = 0; $i < $this->otpLength; $i++) {
            $otp .= random_int(0, 9);
        }
        return $otp;
    }

    /**
     * Check if email is rate limited
     */
    protected function isRateLimited(string $email, string $purpose): bool
    {
        $key = "otp_rate_limit:{$email}:{$purpose}";
        return Cache::has($key);
    }

    /**
     * Set rate limit for email
     */
    protected function setRateLimit(string $email, string $purpose): void
    {
        $key = "otp_rate_limit:{$email}:{$purpose}";
        Cache::put($key, true, $this->rateLimitMinutes * 60);
    }

    /**
     * Get expiry minutes
     */
    public function getExpiryMinutes(): int
    {
        return $this->expiryMinutes;
    }
}
