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
            'role' => ['nullable', 'string', 'in:student,teacher,school,admin,system_supervisor,school_support_coordinator,educational_institution'],
        ];
    }

    public function authenticate(): void
    {
        $this->ensureIsNotRateLimited();

        $remember = $this->boolean('remember');
        $baseCredentials = $this->only('email', 'password');
        $selectedRole = $this->string('role')->value();

        $user = \App\Models\User::where('email', $baseCredentials['email'])->first();

        if (!$user) {
            RateLimiter::hit($this->throttleKey());
            throw ValidationException::withMessages([
                'email' => trans('auth.failed'),
            ]);
        }

        if ($selectedRole && !$this->selectedRoleMatchesUserRole($selectedRole, $user->role)) {
            throw ValidationException::withMessages([
                'role' => ['نوع الحساب المختار لا يطابق هذا البريد الإلكتروني. يرجى اختيار نوع الحساب الصحيح.'],
            ]);
        }

        $authenticated = Auth::attempt(array_merge($baseCredentials, ['role' => $user->role]), $remember);

        if (! $authenticated) {
            RateLimiter::hit($this->throttleKey());

            throw ValidationException::withMessages([
                'email' => trans('auth.failed'),
            ]);
        }

        RateLimiter::clear($this->throttleKey());
    }

    private function selectedRoleMatchesUserRole(string $selectedRole, string $userRole): bool
    {
        if (in_array($selectedRole, ['admin', 'system_supervisor', 'school_support_coordinator'], true)) {
            return in_array($userRole, ['admin', 'system_supervisor', 'school_support_coordinator'], true);
        }

        if (in_array($selectedRole, ['school', 'educational_institution'], true)) {
            return in_array($userRole, ['school', 'educational_institution'], true);
        }

        return $selectedRole === $userRole;
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
