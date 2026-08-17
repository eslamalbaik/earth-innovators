<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CustomRole extends Model
{
    public const BASE_ROLES = [
        'student',
        'teacher',
        'school',
        'admin',
        'system_supervisor',
        'school_support_coordinator',
        'educational_institution',
    ];

    protected $fillable = [
        'slug',
        'name_ar',
        'name_en',
        'base_role',
        'is_active',
        'created_by',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeForBaseRole($query, string $baseRole)
    {
        return $query->where('base_role', $baseRole);
    }
}
