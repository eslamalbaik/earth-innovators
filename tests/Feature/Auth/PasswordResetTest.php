<?php

namespace Tests\Feature\Auth;

use App\Mail\OtpMail;
use App\Models\EmailOtp;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class PasswordResetTest extends TestCase
{
    use RefreshDatabase;

    public function test_reset_password_link_screen_can_be_rendered(): void
    {
        $this->get('/forgot-password')->assertOk();
    }

    public function test_reset_password_link_can_be_requested(): void
    {
        Mail::fake();

        $user = User::factory()->create();

        $response = $this->post('/forgot-password', ['email' => $user->email]);

        $response->assertSessionHasNoErrors();
        $response->assertRedirect();

        $this->assertDatabaseHas('email_otps', [
            'email' => $user->email,
            'purpose' => 'password_reset',
        ]);

        Mail::assertSent(OtpMail::class);
    }

    public function test_reset_password_screen_can_be_rendered_after_otp_verification(): void
    {
        $user = User::factory()->create();
        $otp = EmailOtp::create([
            'token' => \Illuminate\Support\Str::random(64),
            'email' => $user->email,
            'code' => Hash::make('123456'),
            'purpose' => 'password_reset',
            'attempts' => 0,
            'used_at' => now(),
            'expires_at' => now()->addMinutes(10),
        ]);

        $this->get("/reset-password/form/{$otp->token}")
            ->assertOk();
    }

    public function test_password_can_be_reset_with_valid_token(): void
    {
        $user = User::factory()->create([
            'password' => Hash::make('OldPassword123!'),
        ]);

        $otp = EmailOtp::create([
            'token' => \Illuminate\Support\Str::random(64),
            'email' => $user->email,
            'code' => Hash::make('123456'),
            'purpose' => 'password_reset',
            'attempts' => 0,
            'used_at' => now(),
            'expires_at' => now()->addMinutes(10),
        ]);

        $response = $this->post('/reset-password', [
            'token' => $otp->token,
            'email' => $user->email,
            'password' => 'NewPassword123!',
            'password_confirmation' => 'NewPassword123!',
        ]);

        $response
            ->assertSessionHasNoErrors()
            ->assertRedirect(route('login'));

        $this->assertTrue(Hash::check('NewPassword123!', $user->refresh()->password));
    }
}
