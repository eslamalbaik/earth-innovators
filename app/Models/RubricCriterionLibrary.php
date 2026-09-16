<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

/**
 * Platform-wide catalogue of ready-made rubric criteria a teacher can drop
 * into a rubric and then customize freely (name, weight, levels).
 */
class RubricCriterionLibrary extends Model
{
    protected $table = 'rubric_criterion_library';

    protected $fillable = [
        'name',
        'name_ar',
        'description',
        'description_ar',
        'default_weight',
        'category',
        'levels',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'default_weight' => 'decimal:2',
            'levels'         => 'array',
            'is_active'      => 'boolean',
        ];
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }
}
