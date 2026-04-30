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
        'audience',
        'is_active',
        'is_popular',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'features' => 'array',
        'features_ar' => 'array',
        'audience' => 'string',
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
        if (filled($this->audience)) {
            return $this->audience;
        }

        if ($this->is_trial) {
            return 'all';
        }

        $haystack = Str::lower(trim(
            implode(' ', array_filter([
                $this->name ?? '',
                $this->name_ar ?? '',
                $this->description ?? '',
                $this->description_ar ?? '',
            ]))
        ));

        if (preg_match('/\[(student|teacher|school|educational_institution|all)\]/i', $haystack, $matches)) {
            return Str::lower($matches[1]);
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
