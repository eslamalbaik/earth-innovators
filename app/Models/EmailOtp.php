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
        'expires_at',
    ];

    protected $casts = [
        'payload' => 'array',
        'expires_at' => 'datetime',
    ];

    public function isExpired(): bool
    {
        return $this->expires_at?->isPast() ?? true;
    }

    public function incrementAttempts(): void
    {
        $this->increment('attempts');
    }
}

