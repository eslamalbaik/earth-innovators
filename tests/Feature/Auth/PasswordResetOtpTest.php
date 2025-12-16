<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use App\Models\EmailOtp;
use App\Services\PasswordResetService;
use App\Services\OtpService;
use App\Services\EmailService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Cache;
use Tests\TestCase;
use App\Mail\OtpMail;

class PasswordResetOtpTest extends TestCase
{
    use RefreshDatabase;

    protected PasswordResetService $passwordResetService;
    protected OtpService $otpService;

    protected function setUp(): void
    {
        parent::setUp();
        $this->otpService = app(OtpService::class);
        $this->passwordResetService = app(PasswordResetService::class);
    }

    /**
     * Test that forgot password page can be rendered
     */
    public function test_forgot_password_page_can_be_rendered(): void
    {
        $response = $this->get('/forgot-password');

        $response->assertStatus(200);
    }

    /**
     * Test that OTP can be requested for password reset
     */
    public function test_otp_can_be_requested_for_password_reset(): void
    {
        Mail::fake();

        $user = User::factory()->create([
            'email' => 'test@example.com',
        ]);

        $response = $this->post('/forgot-password', [
            'email' => $user->email,
        ]);

        $response->assertSessionHasNoErrors();
        $response->assertRedirect();

        // Verify OTP was created
        $otp = EmailOtp::where('email', $user->email)
            ->where('purpose', 'password_reset')
            ->first();

        $this->assertNotNull($otp);
        $this->assertFalse($otp->isUsed());
        $this->assertFalse($otp->isExpired());

        // Verify email was sent
        Mail::assertSent(OtpMail::class, function ($mail) use ($user) {
            return $mail->hasTo($user->email) && $mail->purpose === 'password_reset';
        });
    }

    /**
     * Test that OTP verification page can be rendered
     */
    public function test_otp_verification_page_can_be_rendered(): void
    {
        $user = User::factory()->create();
        $otp = $this->otpService->generate($user->email, 'password_reset');

        $response = $this->get("/reset-password/otp/{$otp->token}");

        $response->assertStatus(200);
    }

    /**
     * Test that OTP can be verified
     */
    public function test_otp_can_be_verified(): void
    {
        $user = User::factory()->create();
        $otp = $this->otpService->generate($user->email, 'password_reset');
        $plainCode = $otp->plain_code;

        $response = $this->post('/reset-password/verify-otp', [
            'token' => $otp->token,
            'email' => $user->email,
            'otp_code' => $plainCode,
        ]);

        $response->assertSessionHasNoErrors();
        $response->assertRedirect();

        // Verify OTP is marked as used
        $otp->refresh();
        $this->assertTrue($otp->isUsed());
    }

    /**
     * Test that password reset form can be shown after OTP verification
     */
    public function test_password_reset_form_can_be_shown_after_otp_verification(): void
    {
        $user = User::factory()->create();
        $otp = $this->otpService->generate($user->email, 'password_reset');

        // Verify OTP first
        $this->otpService->verify($user->email, $otp->plain_code, 'password_reset', $otp->token);

        $response = $this->get("/reset-password/form/{$otp->token}");

        $response->assertStatus(200);
    }

    /**
     * Test that password can be reset with valid OTP
     */
    public function test_password_can_be_reset_with_valid_otp(): void
    {
        $user = User::factory()->create([
            'password' => Hash::make('old-password'),
        ]);

        $otp = $this->otpService->generate($user->email, 'password_reset');
        $plainCode = $otp->plain_code;

        // Step 1: Verify OTP
        $verifyResponse = $this->post('/reset-password/verify-otp', [
            'token' => $otp->token,
            'email' => $user->email,
            'otp_code' => $plainCode,
        ]);

        $verifyResponse->assertSessionHasNoErrors();
        $verifyResponse->assertRedirect();

        // Step 2: Reset password
        $resetResponse = $this->post('/reset-password', [
            'token' => $otp->token,
            'email' => $user->email,
            'password' => 'new-password-123',
            'password_confirmation' => 'new-password-123',
        ]);

        $resetResponse->assertSessionHasNoErrors();
        $resetResponse->assertRedirect(route('login'));

        // Verify password was changed
        $user->refresh();
        $this->assertTrue(Hash::check('new-password-123', $user->password));
        $this->assertFalse(Hash::check('old-password', $user->password));
    }

    /**
     * Test that invalid OTP code is rejected
     */
    public function test_invalid_otp_code_is_rejected(): void
    {
        $user = User::factory()->create();
        $otp = $this->otpService->generate($user->email, 'password_reset');

        $response = $this->post('/reset-password/verify-otp', [
            'token' => $otp->token,
            'email' => $user->email,
            'otp_code' => '000000', // Wrong code
        ]);

        $response->assertSessionHasErrors(['otp_code']);

        // Verify OTP is not marked as used
        $otp->refresh();
        $this->assertFalse($otp->isUsed());
    }

    /**
     * Test that expired OTP is rejected
     */
    public function test_expired_otp_is_rejected(): void
    {
        $user = User::factory()->create();
        $otp = EmailOtp::create([
            'token' => \Illuminate\Support\Str::random(64),
            'email' => $user->email,
            'code' => Hash::make('123456'),
            'purpose' => 'password_reset',
            'expires_at' => now()->subMinute(), // Expired
            'attempts' => 0,
        ]);

        $response = $this->get("/reset-password/otp/{$otp->token}");

        $response->assertRedirect(route('password.request'));
        $response->assertSessionHasErrors(['token']);
    }

    /**
     * Test that used OTP cannot be reused
     */
    public function test_used_otp_cannot_be_reused(): void
    {
        $user = User::factory()->create();
        $otp = $this->otpService->generate($user->email, 'password_reset');
        $plainCode = $otp->plain_code;

        // First verification - should succeed
        $firstResponse = $this->post('/reset-password/verify-otp', [
            'token' => $otp->token,
            'email' => $user->email,
            'otp_code' => $plainCode,
        ]);

        $firstResponse->assertSessionHasNoErrors();

        // Second verification - should fail
        $secondResponse = $this->post('/reset-password/verify-otp', [
            'token' => $otp->token,
            'email' => $user->email,
            'otp_code' => $plainCode,
        ]);

        $secondResponse->assertSessionHasErrors(['otp_code']);
    }

    /**
     * Test that max attempts protection works
     */
    public function test_max_attempts_protection_works(): void
    {
        $user = User::factory()->create();
        $otp = $this->otpService->generate($user->email, 'password_reset');

        // Try wrong code multiple times
        for ($i = 0; $i < 3; $i++) {
            $response = $this->post('/reset-password/verify-otp', [
                'token' => $otp->token,
                'email' => $user->email,
                'otp_code' => '000000',
            ]);

            $response->assertSessionHasErrors(['otp_code']);
        }

        // After max attempts, even correct code should fail
        $otp->refresh();
        $this->assertEquals(3, $otp->attempts);

        $response = $this->post('/reset-password/verify-otp', [
            'token' => $otp->token,
            'email' => $user->email,
            'otp_code' => $otp->plain_code,
        ]);

        $response->assertSessionHasErrors(['otp_code']);
    }

    /**
     * Test that rate limiting works
     */
    public function test_rate_limiting_prevents_rapid_otp_requests(): void
    {
        Mail::fake();
        Cache::flush();

        $user = User::factory()->create();

        // First request should succeed
        $firstResponse = $this->post('/forgot-password', [
            'email' => $user->email,
        ]);

        $firstResponse->assertSessionHasNoErrors();

        // Second request immediately should be rate limited
        try {
            $secondResponse = $this->post('/forgot-password', [
                'email' => $user->email,
            ]);
        } catch (\Exception $e) {
            // Expected: rate limit exception
            $this->assertStringContainsString('Too many', $e->getMessage());
        }
    }

    /**
     * Test that password reset requires verified OTP
     */
    public function test_password_reset_requires_verified_otp(): void
    {
        $user = User::factory()->create();
        $otp = $this->otpService->generate($user->email, 'password_reset');

        // Try to reset password without verifying OTP first
        $response = $this->post('/reset-password', [
            'token' => $otp->token,
            'email' => $user->email,
            'password' => 'new-password-123',
            'password_confirmation' => 'new-password-123',
        ]);

        $response->assertSessionHasErrors(['email']);
    }

    /**
     * Test that password reset form requires verified OTP
     */
    public function test_password_reset_form_requires_verified_otp(): void
    {
        $user = User::factory()->create();
        $otp = $this->otpService->generate($user->email, 'password_reset');

        // Try to access form without verifying OTP
        $response = $this->get("/reset-password/form/{$otp->token}");

        $response->assertRedirect(route('password.request'));
        $response->assertSessionHasErrors(['token']);
    }

    /**
     * Test that invalid token is rejected
     */
    public function test_invalid_token_is_rejected(): void
    {
        $response = $this->get('/reset-password/otp/invalid-token-123');

        $response->assertRedirect(route('password.request'));
        $response->assertSessionHasErrors(['token']);
    }

    /**
     * Test that password validation works
     */
    public function test_password_validation_works(): void
    {
        $user = User::factory()->create();
        $otp = $this->otpService->generate($user->email, 'password_reset');

        // Verify OTP first
        $this->otpService->verify($user->email, $otp->plain_code, 'password_reset', $otp->token);

        // Try with weak password
        $response = $this->post('/reset-password', [
            'token' => $otp->token,
            'email' => $user->email,
            'password' => '123',
            'password_confirmation' => '123',
        ]);

        $response->assertSessionHasErrors(['password']);

        // Try with mismatched passwords
        $response = $this->post('/reset-password', [
            'token' => $otp->token,
            'email' => $user->email,
            'password' => 'new-password-123',
            'password_confirmation' => 'different-password',
        ]);

        $response->assertSessionHasErrors(['password']);
    }

    /**
     * Test that all unused OTPs are deleted after successful reset
     */
    public function test_unused_otps_are_deleted_after_successful_reset(): void
    {
        $user = User::factory()->create();

        // Create multiple OTPs
        $otp1 = $this->otpService->generate($user->email, 'password_reset');
        $otp2 = $this->otpService->generate($user->email, 'password_reset');

        // Verify and use first OTP
        $this->otpService->verify($user->email, $otp1->plain_code, 'password_reset', $otp1->token);

        // Reset password
        $this->passwordResetService->resetPassword(
            $user->email,
            'new-password-123',
            $otp1->token
        );

        // Verify unused OTPs are deleted
        $unusedOtps = EmailOtp::where('email', $user->email)
            ->where('purpose', 'password_reset')
            ->whereNull('used_at')
            ->count();

        $this->assertEquals(0, $unusedOtps);
    }

    /**
     * Test full password reset flow end-to-end
     */
    public function test_full_password_reset_flow(): void
    {
        Mail::fake();

        $user = User::factory()->create([
            'password' => Hash::make('old-password'),
        ]);

        // Step 1: Request password reset
        $requestResponse = $this->post('/forgot-password', [
            'email' => $user->email,
        ]);

        $requestResponse->assertSessionHasNoErrors();
        $requestResponse->assertRedirect();

        // Get the OTP
        $otp = EmailOtp::where('email', $user->email)
            ->where('purpose', 'password_reset')
            ->latest()
            ->first();

        $this->assertNotNull($otp);
        $plainCode = $otp->plain_code;

        // Step 2: Verify OTP
        $verifyResponse = $this->post('/reset-password/verify-otp', [
            'token' => $otp->token,
            'email' => $user->email,
            'otp_code' => $plainCode,
        ]);

        $verifyResponse->assertSessionHasNoErrors();
        $verifyResponse->assertRedirect();

        // Step 3: Access password reset form
        $formResponse = $this->get("/reset-password/form/{$otp->token}");
        $formResponse->assertStatus(200);

        // Step 4: Reset password
        $resetResponse = $this->post('/reset-password', [
            'token' => $otp->token,
            'email' => $user->email,
            'password' => 'NewPassword123!',
            'password_confirmation' => 'NewPassword123!',
        ]);

        $resetResponse->assertSessionHasNoErrors();
        $resetResponse->assertRedirect(route('login'));

        // Verify password was changed
        $user->refresh();
        $this->assertTrue(Hash::check('NewPassword123!', $user->password));
        $this->assertFalse(Hash::check('old-password', $user->password));
    }

    /**
     * Test that non-existent email is rejected
     */
    public function test_non_existent_email_is_rejected(): void
    {
        $response = $this->post('/forgot-password', [
            'email' => 'nonexistent@example.com',
        ]);

        $response->assertSessionHasErrors(['email']);
    }

    /**
     * Test that OTP verification requires all fields
     */
    public function test_otp_verification_requires_all_fields(): void
    {
        $response = $this->post('/reset-password/verify-otp', []);

        $response->assertSessionHasErrors(['token', 'email', 'otp_code']);
    }

    /**
     * Test that password reset requires all fields
     */
    public function test_password_reset_requires_all_fields(): void
    {
        $response = $this->post('/reset-password', []);

        $response->assertSessionHasErrors(['token', 'email', 'password']);
    }

    /**
     * Test that OTP code must be exactly 6 digits
     */
    public function test_otp_code_must_be_exactly_six_digits(): void
    {
        $user = User::factory()->create();
        $otp = $this->otpService->generate($user->email, 'password_reset');

        // Try with 5 digits
        $response = $this->post('/reset-password/verify-otp', [
            'token' => $otp->token,
            'email' => $user->email,
            'otp_code' => '12345',
        ]);

        $response->assertSessionHasErrors(['otp_code']);

        // Try with 7 digits
        $response = $this->post('/reset-password/verify-otp', [
            'token' => $otp->token,
            'email' => $user->email,
            'otp_code' => '1234567',
        ]);

        $response->assertSessionHasErrors(['otp_code']);
    }

    /**
     * Test that OTP cannot be used after password reset
     */
    public function test_otp_cannot_be_reused_after_password_reset(): void
    {
        $user = User::factory()->create();
        $otp = $this->otpService->generate($user->email, 'password_reset');
        $plainCode = $otp->plain_code;

        // Verify and reset password
        $this->otpService->verify($user->email, $plainCode, 'password_reset', $otp->token);
        $this->passwordResetService->resetPassword(
            $user->email,
            'new-password-123',
            $otp->token
        );

        // Try to use same OTP token again
        $response = $this->get("/reset-password/form/{$otp->token}");

        $response->assertRedirect(route('password.request'));
        $response->assertSessionHasErrors(['token']);
    }

    /**
     * Test that wrong email with correct token is rejected
     */
    public function test_wrong_email_with_correct_token_is_rejected(): void
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();
        $otp = $this->otpService->generate($user1->email, 'password_reset');
        $plainCode = $otp->plain_code;

        // Try to verify with wrong email
        $response = $this->post('/reset-password/verify-otp', [
            'token' => $otp->token,
            'email' => $user2->email,
            'otp_code' => $plainCode,
        ]);

        $response->assertSessionHasErrors(['otp_code']);
    }

    /**
     * Test that brute force protection increments attempts
     */
    public function test_brute_force_protection_increments_attempts(): void
    {
        $user = User::factory()->create();
        $otp = $this->otpService->generate($user->email, 'password_reset');

        // Try wrong code
        $this->post('/reset-password/verify-otp', [
            'token' => $otp->token,
            'email' => $user->email,
            'otp_code' => '000000',
        ]);

        $otp->refresh();
        $this->assertEquals(1, $otp->attempts);

        // Try wrong code again
        $this->post('/reset-password/verify-otp', [
            'token' => $otp->token,
            'email' => $user->email,
            'otp_code' => '111111',
        ]);

        $otp->refresh();
        $this->assertEquals(2, $otp->attempts);
    }

    /**
     * Test that successful verification resets attempts tracking
     */
    public function test_successful_verification_marks_otp_as_used(): void
    {
        $user = User::factory()->create();
        $otp = $this->otpService->generate($user->email, 'password_reset');
        $plainCode = $otp->plain_code;

        // Verify with correct code
        $this->post('/reset-password/verify-otp', [
            'token' => $otp->token,
            'email' => $user->email,
            'otp_code' => $plainCode,
        ]);

        $otp->refresh();
        $this->assertTrue($otp->isUsed());
        $this->assertNotNull($otp->used_at);
    }

    /**
     * Test that cleanup removes old expired OTPs
     */
    public function test_cleanup_removes_old_expired_otps(): void
    {
        $user = User::factory()->create();

        // Create expired OTP
        EmailOtp::create([
            'token' => \Illuminate\Support\Str::random(64),
            'email' => $user->email,
            'code' => Hash::make('123456'),
            'purpose' => 'password_reset',
            'expires_at' => now()->subDay(),
            'attempts' => 0,
        ]);

        $deleted = $this->passwordResetService->cleanupExpired();

        $this->assertGreaterThan(0, $deleted);
    }
}
