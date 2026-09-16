<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

/**
 * Unique join codes that let a student or teacher self-register into a
 * specific school (and, for students, a specific teacher/grade/section)
 * without picking freely from every school in the system. Requirement 6.1
 * — the RBAC-safe alternative to school/teacher creating the account
 * directly (App\Http\Controllers\School\SchoolTeacherController::store and
 * App\Http\Controllers\Teacher\TeacherStudentController::store already
 * cover those two paths).
 */
class InviteCode extends Model
{
    protected $fillable = [
        'code', 'role', 'school_id', 'teacher_id', 'grade', 'section',
        'max_uses', 'used_count', 'expires_at', 'is_active', 'created_by',
    ];

    protected function casts(): array
    {
        return [
            'expires_at' => 'datetime',
            'is_active'  => 'boolean',
        ];
    }

    public function school(): BelongsTo
    {
        return $this->belongsTo(User::class, 'school_id');
    }

    public function teacher(): BelongsTo
    {
        return $this->belongsTo(User::class, 'teacher_id');
    }

    public static function generateUniqueCode(): string
    {
        do {
            $code = strtoupper(Str::random(4) . '-' . Str::random(4));
        } while (self::where('code', $code)->exists());

        return $code;
    }

    public function isValidFor(string $role): bool
    {
        if (! $this->is_active || $this->role !== $role) {
            return false;
        }

        if ($this->expires_at && $this->expires_at->isPast()) {
            return false;
        }

        if ($this->max_uses !== null && $this->used_count >= $this->max_uses) {
            return false;
        }

        return true;
    }
}
