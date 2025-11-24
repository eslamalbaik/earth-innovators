<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Publication extends Model
{
    protected $fillable = [
        'author_id',
        'school_id',
        'type',
        'title',
        'description',
        'content',
        'cover_image',
        'file',
        'status',
        'approved_by',
        'approved_at',
        'issue_number',
        'publish_date',
        'publisher_name',
        'views',
        'likes_count',
    ];

    protected $casts = [
        'approved_at' => 'datetime',
        'publish_date' => 'date',
    ];

    /**
     * العلاقة مع المستخدم (المؤلف - المعلم أو المدرسة)
     */
    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'author_id');
    }

    /**
     * العلاقة مع المدرسة
     */
    public function school(): BelongsTo
    {
        return $this->belongsTo(User::class, 'school_id');
    }

    /**
     * العلاقة مع من وافق على المقال
     */
    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    /**
     * العلاقة مع المستخدمين الذين أعجبوا بالمقال
     */
    public function likedBy(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'publication_likes')
            ->withTimestamps();
    }

    /**
     * التحقق مما إذا كان المستخدم قد أعجب بهذا المقال
     */
    public function isLikedBy($userId): bool
    {
        return $this->likedBy()->where('user_id', $userId)->exists();
    }

    /**
     * زيادة عدد المشاهدات
     */
    public function incrementViews(): void
    {
        $this->increment('views');
    }
}
