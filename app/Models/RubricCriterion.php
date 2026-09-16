<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RubricCriterion extends Model
{
    protected $table = 'rubric_criteria';

    protected $fillable = [
        'rubric_id',
        'library_criterion_id',
        'name',
        'name_ar',
        'description',
        'description_ar',
        'weight',
        'order',
        'levels',
    ];

    protected function casts(): array
    {
        return [
            'weight' => 'decimal:2',
            'order'  => 'integer',
            'levels' => 'array',
        ];
    }

    public function rubric(): BelongsTo
    {
        return $this->belongsTo(Rubric::class);
    }

    public function libraryCriterion(): BelongsTo
    {
        return $this->belongsTo(RubricCriterionLibrary::class, 'library_criterion_id');
    }
}
