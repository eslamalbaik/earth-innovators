<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Certificate extends Model
{
    protected $fillable = [
        'user_id',
        'school_id',
        'type',
        'status',
        'source',
        'title',
        'title_ar',
        'description',
        'description_ar',
        'certificate_number',
        'issue_date',
        'expiry_date',
        'template',
        'file_path',
        'issued_by',
        'requested_by',
        'reviewed_by',
        'approved_at',
        'rejected_at',
        'rejection_reason',
        'is_active',
        'therapeutic_plan',
    ];

    protected $casts = [
        'issue_date' => 'date',
        'expiry_date' => 'date',
        'approved_at' => 'datetime',
        'rejected_at' => 'datetime',
        'is_active' => 'boolean',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function issuer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'issued_by');
    }

    public function requester(): BelongsTo
    {
        return $this->belongsTo(User::class, 'requested_by');
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }
}
