<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Review extends Model
{
    protected $fillable = [
        'teacher_id',
        'student_id',
        'booking_id',
        'reviewer_name',
        'reviewer_image',
        'reviewer_location',
        'rating',
        'comment',
        'teacher_response',
        'is_published',
    ];

    protected $casts = [
        'rating' => 'decimal:2',
        'is_published' => 'boolean',
    ];

    public function teacher(): BelongsTo
    {
        return $this->belongsTo(Teacher::class);
    }

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(User::class, 'student_id');
    }
}
