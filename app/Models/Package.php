<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

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
    ];

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'user_packages')
            ->withPivot('start_date', 'end_date', 'status', 'auto_renew', 'paid_amount', 'payment_method', 'transaction_id')
            ->withTimestamps();
    }
}
