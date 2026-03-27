<?php

namespace Tests\Feature\Auth;

use App\Services\OtpService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OtpAuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_signup_otp_verification_preserves_payload_after_verification(): void
    {
        $otp = app(OtpService::class)->generate(
            'otp-signup@example.com',
            'signup',
            '127.0.0.1',
            ['name' => 'Otp Signup User']
        );

        $response = $this->postJson('/otp/signup/verify', [
            'email' => 'otp-signup@example.com',
            'code' => $otp->plain_code,
            'token' => $otp->token,
            'password' => 'StrongPassword123!',
            'password_confirmation' => 'StrongPassword123!',
            'role' => 'student',
        ]);

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('user.name', 'Otp Signup User')
            ->assertJsonPath('user.email', 'otp-signup@example.com');

        $this->assertAuthenticated();
    }
}
