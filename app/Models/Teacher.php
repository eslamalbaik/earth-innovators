<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Support\Facades\DB;

class Teacher extends Model
{
    protected $fillable = [
        'user_id',
        'name_ar',
        'name_en',
        'nationality',
        'gender',
        'bio',
        'qualifications',
        'image',
        'subjects',
        'stages',
        'experience_years',
        'city',
        'neighborhoods',
        'price_per_hour',
        'rating',
        'reviews_count',
        'sessions_count',
        'students_count',
        'is_verified',
        'is_active',
    ];

    protected $casts = [
        'subjects' => 'array',
        'stages' => 'array',
        'neighborhoods' => 'array',
        'price_per_hour' => 'decimal:2',
        'rating' => 'decimal:2',
        'is_verified' => 'boolean',
        'is_active' => 'boolean',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function availabilities(): HasMany
    {
        return $this->hasMany(TeacherAvailability::class);
    }

    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class);
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }

    public function applications(): HasMany
    {
        return $this->hasMany(TeacherApplication::class);
    }

    public function subjectsRelation(): BelongsToMany
    {
        return $this->belongsToMany(Subject::class, 'teacher_subjects');
    }

    /**
     * حساب متوسط التقييم من التقييمات المنشورة
     */
    public function calculateRating(): float
    {
        $reviews = $this->reviews()->where('is_published', true)->get();
        
        if ($reviews->isEmpty()) {
            return 0.0;
        }

        $totalRating = $reviews->sum('rating');
        $averageRating = $totalRating / $reviews->count();
        
        return round($averageRating, 1);
    }

    /**
     * حساب عدد التقييمات المنشورة
     */
    public function calculateReviewsCount(): int
    {
        return $this->reviews()->where('is_published', true)->count();
    }

    /**
     * حساب عدد الجلسات المكتملة
     */
    public function calculateSessionsCount(): int
    {
        return $this->bookings()
            ->where('status', 'completed')
            ->count();
    }

    /**
     * حساب عدد الطلاب المختلفين الذين استفادوا من المعلم
     */
    public function calculateStudentsCount(): int
    {
        // استخدام student_email لحساب عدد الطلاب المختلفين
        // لأن جدول bookings لا يحتوي على student_id
        $result = DB::table('bookings')
            ->where('teacher_id', $this->id)
            ->where('status', 'completed')
            ->whereNotNull('student_email')
            ->selectRaw('COUNT(DISTINCT student_email) as count')
            ->first();
        
        return $result ? (int) $result->count : 0;
    }

    /**
     * Accessor للحصول على التقييم المحسوب
     */
    public function getCalculatedRatingAttribute(): float
    {
        return $this->calculateRating();
    }

    /**
     * Accessor للحصول على عدد التقييمات المحسوب
     */
    public function getCalculatedReviewsCountAttribute(): int
    {
        return $this->calculateReviewsCount();
    }

    /**
     * Accessor للحصول على عدد الجلسات المحسوب
     */
    public function getCalculatedSessionsCountAttribute(): int
    {
        return $this->calculateSessionsCount();
    }

    /**
     * Accessor للحصول على عدد الطلاب المحسوب
     */
    public function getCalculatedStudentsCountAttribute(): int
    {
        return $this->calculateStudentsCount();
    }
}
