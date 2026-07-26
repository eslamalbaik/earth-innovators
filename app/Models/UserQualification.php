<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserQualification extends Model
{
    protected $fillable = [
        'user_id',
        'title',
        'institution',
        'field',
        'start_date',
        'end_date',
        'description',
    ];

    protected function casts(): array
    {
        return [
            'start_date' => 'date',
            'end_date' => 'date',
        ];
    }

    // ─── Relationships ───────────────────────────────────────

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // ─── Helpers ─────────────────────────────────────────────

    public function isOngoing(): bool
    {
        return $this->end_date === null || $this->end_date->isFuture();
    }

    public function getDurationInMonths(): ?int
    {
        if (!$this->start_date) {
            return null;
        }

        $end = $this->end_date ?? now();
        return $this->start_date->diffInMonths($end);
    }
}
