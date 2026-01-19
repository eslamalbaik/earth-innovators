<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Booking extends Model
{
    use HasFactory;
    protected $fillable = [
        'student_id',
        'student_name',
        'student_email',
        'student_phone',
        'city',
        'neighborhood',
        'teacher_id',
        'availability_id',
        'date',
        'start_time',
        'end_time',
        'subject',
        'selected_sessions',
        'status',
        'student_notes',
        'teacher_notes',
        'admin_notes',
        'price',
        'total_price',
        'currency',
        'payment_status',
        'payment_method',
        'payment_reference',
        'approved_at',
        'rejected_at',
        'cancelled_at',
        'completed_at',
    ];

    protected $casts = [
        'selected_sessions' => 'array',
        'price' => 'decimal:2',
        'date' => 'date',
        'approved_at' => 'datetime',
        'rejected_at' => 'datetime',
        'cancelled_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    public function student(): BelongsTo
    {
        // استخدام student_id إذا كان موجوداً، وإلا استخدام student_email
        // لكن Eloquent لا يدعم علاقات ديناميكية، لذلك سنستخدم student_id كافتراضي
        // وسنستخدم accessor للحصول على الطالب من student_email إذا لزم الأمر
        return $this->belongsTo(User::class, 'student_id');
    }

    /**
     * الحصول على معلومات الطالب (من العلاقة أو من الحقول المباشرة)
     */
    public function getStudentInfoAttribute()
    {
        // محاولة جلب الطالب من العلاقة
        if ($this->relationLoaded('student') && $this->student) {
            return $this->student;
        }
        
        // إذا كان student_id موجوداً، جلب الطالب
        if ($this->student_id) {
            return User::find($this->student_id);
        }
        
        // إذا كان student_email موجوداً، جلب الطالب من البريد الإلكتروني
        if ($this->student_email) {
            return User::where('email', $this->student_email)->first();
        }
        
        // إرجاع كائن وهمي بمعلومات من الحقول المباشرة
        return (object) [
            'name' => $this->student_name ?? 'غير محدد',
            'email' => $this->student_email ?? 'غير محدد',
            'phone' => $this->student_phone ?? 'غير محدد',
        ];
    }

    public function teacher(): BelongsTo
    {
        return $this->belongsTo(Teacher::class, 'teacher_id');
    }

    public function availability(): BelongsTo
    {
        return $this->belongsTo(TeacherAvailability::class, 'availability_id');
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }

    public function payment(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(Payment::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    public function scopeRejected($query)
    {
        return $query->where('status', 'rejected');
    }

    public function scopeCancelled($query)
    {
        return $query->where('status', 'cancelled');
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    public function isPending()
    {
        return $this->status === 'pending';
    }

    public function isApproved()
    {
        return $this->status === 'approved';
    }

    public function isRejected()
    {
        return $this->status === 'rejected';
    }

    public function isCancelled()
    {
        return $this->status === 'cancelled';
    }

    public function isCompleted()
    {
        return $this->status === 'completed';
    }
}
