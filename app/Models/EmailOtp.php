<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;

class EmailOtp extends Model
{
    protected $fillable = [
        'token',
        'email',
        'code',
        'purpose',
        'payload',
        'attempts',
        'ip_address',
        'expires_at',
        'used_at',
    ];

    protected $casts = [
        'payload' => 'array',
        'expires_at' => 'datetime',
        'used_at' => 'datetime',
    ];

    public function isExpired(): bool
    {
        return $this->expires_at?->isPast() ?? true;
    }

    public function isUsed(): bool
    {
        return $this->used_at !== null;
    }

    public function incrementAttempts(): void
    {
        $this->increment('attempts');
    }

    public function markAsUsed(): void
    {
        $this->update(['used_at' => now()]);
    }
}

