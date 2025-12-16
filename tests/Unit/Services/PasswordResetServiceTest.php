<?php

namespace Tests\Unit\Services;

use App\Models\User;
use App\Models\EmailOtp;
use App\Services\PasswordResetService;
use App\Services\OtpService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class PasswordResetServiceTest extends TestCase
{
    use RefreshDatabase;

    protected PasswordResetService $service;
    protected OtpService $otpService;

    protected function setUp(): void
    {
        parent::setUp();
        $this->otpService = app(OtpService::class);
        $this->service = app(PasswordResetService::class);
    }

    /**
     * Test OTP generation
     */
    public function test_can_generate_otp(): void
    {
        $user = User::factory()->create();

        $otp = $this->service->generateOtp($user);

        $this->assertInstanceOf(EmailOtp::class, $otp);
        $this->assertEquals($user->email, $otp->email);
        $this->assertEquals('password_reset', $otp->purpose);
        $this->assertFalse($otp->isUsed());
        $this->assertFalse($otp->isExpired());
        $this->assertNotNull($otp->plain_code);
        $this->assertEquals(6, strlen($otp->plain_code));
    }

    /**
     * Test OTP verification with correct code
     */
    public function test_can_verify_otp_with_correct_code(): void
    {
        $user = User::factory()->create();
        $otp = $this->service->generateOtp($user);
        $plainCode = $otp->plain_code;

        $verified = $this->service->verifyOtp($user->email, $plainCode, $otp->token);

        $this->assertTrue($verified);

        // Verify OTP is marked as used
        $otp->refresh();
        $this->assertTrue($otp->isUsed());
    }

    /**
     * Test OTP verification with incorrect code
     */
    public function test_cannot_verify_otp_with_incorrect_code(): void
    {
        $user = User::factory()->create();
        $otp = $this->service->generateOtp($user);

        $verified = $this->service->verifyOtp($user->email, '000000', $otp->token);

        $this->assertFalse($verified);

        // Verify OTP is not marked as used
        $otp->refresh();
        $this->assertFalse($otp->isUsed());
        $this->assertEquals(1, $otp->attempts);
    }

    /**
     * Test OTP verification with expired OTP
     */
    public function test_cannot_verify_expired_otp(): void
    {
        $user = User::factory()->create();
        $otp = EmailOtp::create([
            'token' => \Illuminate\Support\Str::random(64),
            'email' => $user->email,
            'code' => Hash::make('123456'),
            'purpose' => 'password_reset',
            'expires_at' => now()->subMinute(),
            'attempts' => 0,
        ]);

        $verified = $this->service->verifyOtp($user->email, '123456', $otp->token);

        $this->assertFalse($verified);
    }

    /**
     * Test password reset with verified OTP
     */
    public function test_can_reset_password_with_verified_otp(): void
    {
        $user = User::factory()->create([
            'password' => Hash::make('old-password'),
        ]);

        $otp = $this->service->generateOtp($user);
        $plainCode = $otp->plain_code;

        // Verify OTP first
        $this->service->verifyOtp($user->email, $plainCode, $otp->token);

        // Reset password
        $success = $this->service->resetPassword(
            $user->email,
            'new-password-123',
            $otp->token
        );

        $this->assertTrue($success);

        // Verify password was changed
        $user->refresh();
        $this->assertTrue(Hash::check('new-password-123', $user->password));
        $this->assertFalse(Hash::check('old-password', $user->password));
    }

    /**
     * Test password reset fails with unverified OTP
     */
    public function test_cannot_reset_password_with_unverified_otp(): void
    {
        $user = User::factory()->create();
        $otp = $this->service->generateOtp($user);

        // Try to reset without verifying OTP
        $success = $this->service->resetPassword(
            $user->email,
            'new-password-123',
            $otp->token
        );

        $this->assertFalse($success);

        // Verify password was not changed
        $user->refresh();
        $this->assertFalse(Hash::check('new-password-123', $user->password));
    }

    /**
     * Test password reset fails with expired OTP
     */
    public function test_cannot_reset_password_with_expired_otp(): void
    {
        $user = User::factory()->create();
        $otp = $this->service->generateOtp($user);
        $plainCode = $otp->plain_code;

        // Verify OTP
        $this->service->verifyOtp($user->email, $plainCode, $otp->token);

        // Expire the OTP
        $otp->update(['expires_at' => now()->subMinute()]);

        // Try to reset password
        $success = $this->service->resetPassword(
            $user->email,
            'new-password-123',
            $otp->token
        );

        $this->assertFalse($success);
    }

    /**
     * Test that getOtpByToken returns correct OTP
     */
    public function test_can_get_otp_by_token(): void
    {
        $user = User::factory()->create();
        $otp = $this->service->generateOtp($user);

        $retrievedOtp = $this->service->getOtpByToken($otp->token);

        $this->assertNotNull($retrievedOtp);
        $this->assertEquals($otp->id, $retrievedOtp->id);
        $this->assertEquals($user->email, $retrievedOtp->email);
    }

    /**
     * Test that getOtpByToken returns null for invalid token
     */
    public function test_get_otp_by_token_returns_null_for_invalid_token(): void
    {
        $retrievedOtp = $this->service->getOtpByToken('invalid-token-123');

        $this->assertNull($retrievedOtp);
    }

    /**
     * Test cleanup of expired OTPs
     */
    public function test_can_cleanup_expired_otps(): void
    {
        $user = User::factory()->create();

        // Create expired OTP
        EmailOtp::create([
            'token' => \Illuminate\Support\Str::random(64),
            'email' => $user->email,
            'code' => Hash::make('123456'),
            'purpose' => 'password_reset',
            'expires_at' => now()->subHour(),
            'attempts' => 0,
        ]);

        // Create valid OTP
        $validOtp = $this->service->generateOtp($user);

        $deleted = $this->service->cleanupExpired();

        $this->assertGreaterThan(0, $deleted);

        // Verify expired OTP is deleted
        $this->assertDatabaseMissing('email_otps', [
            'token' => 'expired-token',
        ]);

        // Verify valid OTP still exists
        $this->assertDatabaseHas('email_otps', [
            'token' => $validOtp->token,
        ]);
    }

    /**
     * Test that OTP code is 6 digits
     */
    public function test_otp_code_is_six_digits(): void
    {
        $user = User::factory()->create();
        $otp = $this->service->generateOtp($user);

        $this->assertEquals(6, strlen($otp->plain_code));
        $this->assertTrue(ctype_digit($otp->plain_code));
    }

    /**
     * Test that OTP is hashed before storage
     */
    public function test_otp_is_hashed_before_storage(): void
    {
        $user = User::factory()->create();
        $otp = $this->service->generateOtp($user);
        $plainCode = $otp->plain_code;

        // The stored code should be hashed (different from plain code)
        $storedOtp = EmailOtp::find($otp->id);
        $this->assertNotEquals($plainCode, $storedOtp->code);
        $this->assertTrue(Hash::check($plainCode, $storedOtp->code));
    }

    /**
     * Test that multiple OTP requests delete previous unused OTPs
     */
    public function test_multiple_otp_requests_delete_previous_unused_otps(): void
    {
        $user = User::factory()->create();

        // Generate first OTP
        $otp1 = $this->service->generateOtp($user);

        // Generate second OTP
        $otp2 = $this->service->generateOtp($user);

        // First OTP should be deleted
        $this->assertDatabaseMissing('email_otps', [
            'token' => $otp1->token,
        ]);

        // Second OTP should exist
        $this->assertDatabaseHas('email_otps', [
            'token' => $otp2->token,
        ]);
    }
}
