<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ProjectComment extends Model
{
    protected $fillable = [
        'project_id',
        'user_id',
        'parent_id',
        'comment',
        'files',
        'is_edited',
    ];

    protected $casts = [
        'files' => 'array',
        'is_edited' => 'boolean',
    ];

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(ProjectComment::class, 'parent_id');
    }

    public function replies(): HasMany
    {
        return $this->hasMany(ProjectComment::class, 'parent_id');
    }
}
