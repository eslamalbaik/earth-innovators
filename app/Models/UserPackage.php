<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserPackage extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'package_id',
        'start_date',
        'end_date',
        'status',
        'auto_renew',
        'paid_amount',
        'payment_method',
        'transaction_id',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'paid_amount' => 'decimal:2',
        'auto_renew' => 'boolean',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function package(): BelongsTo
    {
        return $this->belongsTo(Package::class);
    }

    public function scopeCurrentActive($query)
    {
        return $query
            ->where('status', 'active')
            ->where(function ($statusQuery) {
                $statusQuery
                    ->whereNull('end_date')
                    ->orWhereDate('end_date', '>=', now()->toDateString());
            });
    }

    public function scopePastDue($query)
    {
        return $query->where(function ($statusQuery) {
            $statusQuery
                ->where('status', 'expired')
                ->orWhere(function ($expiredQuery) {
                    $expiredQuery
                        ->where('status', 'active')
                        ->whereNotNull('end_date')
                        ->whereDate('end_date', '<', now()->toDateString());
                });
        });
    }

    public function isCurrentActive(): bool
    {
        return $this->status === 'active'
            && (!$this->end_date || $this->end_date->greaterThanOrEqualTo(now()->startOfDay()));
    }

    public function getEffectiveStatusAttribute(): string
    {
        if ($this->status === 'active' && $this->end_date && $this->end_date->lt(now()->startOfDay())) {
            return 'expired';
        }

        return $this->status;
    }
}
