<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Storage;

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

    /**
     * Accessor لتطبيع مسار صورة الغلاف
     * يعمل تلقائياً عند قراءة الخاصية
     * Returns absolute URL for proper image display
     */
    public function getCoverImageAttribute($value): ?string
    {
        // الحصول على القيمة الأصلية من قاعدة البيانات مباشرة من attributes
        // هذا مهم جداً لأن $value قد يكون null حتى لو كانت القيمة موجودة في DB
        $originalValue = null;

        // أولاً: جرب قراءة من attributes مباشرة
        if (isset($this->attributes['cover_image']) && $this->attributes['cover_image'] !== null) {
            $originalValue = $this->attributes['cover_image'];
        }
        // ثانياً: إذا لم تكن موجودة في attributes، استخدم $value
        elseif ($value !== null) {
            $originalValue = $value;
        }

        // إذا لم توجد قيمة، أرجع null
        if (!$originalValue || trim($originalValue) === '') {
            return null;
        }

        // تنظيف القيمة
        $originalValue = trim($originalValue);

        // If it's a full URL, return as is
        if (str_starts_with($originalValue, 'http://') || str_starts_with($originalValue, 'https://')) {
            return $originalValue;
        }

        // If it's a path starting with /images/, return as is (for public/images directory)
        if (str_starts_with($originalValue, '/images/') || str_starts_with($originalValue, 'images/')) {
            $imagePath = ltrim($originalValue, '/');
            return url('/' . $imagePath);
        }

        // Normalize the path
        $normalizedPath = $originalValue;

        // Remove leading slashes
        $normalizedPath = ltrim($normalizedPath, '/');

        // Remove 'storage/' prefix if present (we'll add it back in the URL)
        $normalizedPath = str_replace('storage/', '', $normalizedPath);

        // المسار المحفوظ في DB يكون مثل: publications/covers/filename.jpg
        // نحتاج إلى تحويله إلى: /storage/publications/covers/filename.jpg

        // Return absolute URL - always use url() helper
        // This ensures proper domain handling (works in dev and production)
        return url('/storage/' . $normalizedPath);
    }

    /**
     * Accessor لتطبيع مسار الملف
     * يعمل تلقائياً عند قراءة الخاصية
     * Returns absolute URL for proper file access
     */
    public function getFileAttribute($value): ?string
    {
        // الحصول على القيمة الأصلية من قاعدة البيانات مباشرة من attributes
        $originalValue = null;

        // أولاً: جرب قراءة من attributes مباشرة
        if (isset($this->attributes['file']) && $this->attributes['file'] !== null) {
            $originalValue = $this->attributes['file'];
        }
        // ثانياً: إذا لم تكن موجودة في attributes، استخدم $value
        elseif ($value !== null) {
            $originalValue = $value;
        }

        // إذا لم توجد قيمة، أرجع null
        if (!$originalValue || trim($originalValue) === '') {
            return null;
        }

        // تنظيف القيمة
        $originalValue = trim($originalValue);

        // If it's a full URL, return as is
        if (str_starts_with($originalValue, 'http://') || str_starts_with($originalValue, 'https://')) {
            return $originalValue;
        }

        // Normalize the path
        $normalizedPath = $originalValue;

        // Remove leading slashes
        $normalizedPath = ltrim($normalizedPath, '/');

        // Remove 'storage/' prefix if present
        $normalizedPath = str_replace('storage/', '', $normalizedPath);

        // المسار المحفوظ في DB يكون مثل: publications/files/filename.pdf
        // نحتاج إلى تحويله إلى: /storage/publications/files/filename.pdf

        // Return absolute URL
        return url('/storage/' . $normalizedPath);
    }
}
