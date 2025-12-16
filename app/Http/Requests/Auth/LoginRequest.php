<?php

namespace App\Http\Requests\Auth;

use Illuminate\Auth\Events\Lockout;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class LoginRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'email' => ['required', 'string', 'email'],
            'password' => ['required', 'string'],
            'role' => ['required', 'string', 'in:student,teacher,school,admin'],
        ];
    }

    public function authenticate(): void
    {
        $this->ensureIsNotRateLimited();

        $remember = $this->boolean('remember');
        $baseCredentials = $this->only('email', 'password');

        // Check if user exists and get their actual role from database
        // Role should always match the email, not the request
        $user = \App\Models\User::where('email', $baseCredentials['email'])->first();

        if (!$user) {
            RateLimiter::hit($this->throttleKey());
            throw ValidationException::withMessages([
                'email' => trans('auth.failed'),
            ]);
        }

        // Use the user's actual role from database, not from request
        // This ensures role is always correct and matches the email
        $userRole = $user->role;

        // Authenticate using the user's actual role from database
        $authenticated = Auth::attempt(array_merge($baseCredentials, ['role' => $userRole]), $remember);

        if (! $authenticated) {
            RateLimiter::hit($this->throttleKey());

            throw ValidationException::withMessages([
                'email' => trans('auth.failed'),
            ]);
        }

        RateLimiter::clear($this->throttleKey());
    }

    public function ensureIsNotRateLimited(): void
    {
        if (! RateLimiter::tooManyAttempts($this->throttleKey(), 5)) {
            return;
        }

        event(new Lockout($this));

        $seconds = RateLimiter::availableIn($this->throttleKey());

        throw ValidationException::withMessages([
            'email' => trans('auth.throttle', [
                'seconds' => $seconds,
                'minutes' => ceil($seconds / 60),
            ]),
        ]);
    }

    public function throttleKey(): string
    {
        return Str::transliterate(Str::lower($this->string('email')) . '|' . $this->ip());
    }
}
