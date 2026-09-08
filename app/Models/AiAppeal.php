<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AiAppeal extends Model
{
    protected $fillable = [
        'user_id',
        'feature',
        'subject_type',
        'subject_id',
        'reason',
        'status',
        'resolved_by',
        'resolution_notes',
        'resolved_at',
    ];

    protected $casts = [
        'resolved_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function resolver()
    {
        return $this->belongsTo(User::class, 'resolved_by');
    }
}
