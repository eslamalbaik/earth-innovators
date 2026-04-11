<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Support\Str;

class Package extends Model
{
    use HasFactory;
    protected $fillable = [
        'name',
        'name_ar',
        'description',
        'description_ar',
        'price',
        'currency',
        'duration_type',
        'duration_months',
        'points_bonus',
        'projects_limit',
        'challenges_limit',
        'certificate_access',
        'badge_access',
        'is_trial',
        'trial_days',
        'features',
        'features_ar',
        'is_active',
        'is_popular',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'features' => 'array',
        'features_ar' => 'array',
        'is_active' => 'boolean',
        'is_popular' => 'boolean',
        'certificate_access' => 'boolean',
        'badge_access' => 'boolean',
        'is_trial' => 'boolean',
        'trial_days' => 'integer',
    ];

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'user_packages')
            ->withPivot('start_date', 'end_date', 'status', 'auto_renew', 'paid_amount', 'payment_method', 'transaction_id')
            ->withTimestamps();
    }

    public function resolveAudience(): string
    {
        if ($this->is_trial) {
            return 'all';
        }

        $haystack = Str::lower(trim(($this->name ?? '') . ' ' . ($this->name_ar ?? '')));

        if (
            str_contains($haystack, 'educational institution')
            || str_contains($haystack, 'institution')
            || str_contains($haystack, 'المؤسسة التعليمية')
            || str_contains($haystack, 'المؤسسة')
        ) {
            return 'educational_institution';
        }

        if (str_contains($haystack, 'school') || str_contains($haystack, 'المدرسة')) {
            return 'school';
        }

        if (
            str_contains($haystack, 'teacher')
            || str_contains($haystack, 'المعلم')
            || str_contains($haystack, 'المدرس')
        ) {
            return 'teacher';
        }

        if (str_contains($haystack, 'student') || str_contains($haystack, 'الطالب')) {
            return 'student';
        }

        return 'all';
    }

    public function supportsRole(?string $role): bool
    {
        if (!$role) {
            return true;
        }

        $audience = $this->resolveAudience();

        if ($audience === 'all') {
            return true;
        }

        return $audience === $role;
    }
}
