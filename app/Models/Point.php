<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Point extends Model
{
    protected $fillable = [
        'user_id',
        'points',
        'type',
        'source',
        'source_id',
        'description',
        'description_ar',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
