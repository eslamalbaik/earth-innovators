<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AcceptanceCriterion extends Model
{
    protected $fillable = [
        'name_ar',
        'description_ar',
        'weight',
        'order',
        'is_active',
    ];

    protected $casts = [
        'weight' => 'decimal:2',
        'order' => 'integer',
        'is_active' => 'boolean',
    ];

    /**
     * Scope to get active criteria
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope to order by order field
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('order', 'asc');
    }
}
