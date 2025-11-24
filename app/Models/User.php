<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use App\Models\ChatParticipant;
use App\Models\ChatRoom;
use App\Models\ChatMessage;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'phone',
        'password',
        'role',
        'image',
        'points',
        'school_id',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function teacher(): HasOne
    {
        return $this->hasOne(Teacher::class);
    }

    public function getTeacherIdAttribute()
    {
        return $this->teacher?->id;
    }

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function isTeacher(): bool
    {
        return $this->role === 'teacher';
    }

    public function isStudent(): bool
    {
        return $this->role === 'student';
    }

    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class, 'student_email', 'email');
    }

    public function teacherApplications(): HasMany
    {
        return $this->hasMany(TeacherApplication::class);
    }

    public function subjects(): BelongsToMany
    {
        return $this->belongsToMany(Subject::class, 'student_subjects');
    }

    public function chatParticipants(): HasMany
    {
        return $this->hasMany(ChatParticipant::class);
    }

    public function chatRooms()
    {
        return $this->belongsToMany(ChatRoom::class, 'chat_participants')
            ->withTimestamps()
            ->withPivot('role', 'last_read_at');
    }

    public function chatMessages(): HasMany
    {
        return $this->hasMany(ChatMessage::class);
    }

    public function projects(): HasMany
    {
        return $this->hasMany(Project::class);
    }

    public function challenges(): HasMany
    {
        return $this->hasMany(Challenge::class, 'created_by');
    }

    public function badges(): BelongsToMany
    {
        return $this->belongsToMany(Badge::class, 'user_badges')
            ->withPivot('awarded_by', 'project_id', 'challenge_id', 'reason', 'earned_at')
            ->withTimestamps();
    }

    public function userBadges(): HasMany
    {
        return $this->hasMany(UserBadge::class);
    }

    public function pointsHistory(): HasMany
    {
        return $this->hasMany(Point::class);
    }

    public function certificates(): HasMany
    {
        return $this->hasMany(Certificate::class);
    }

    public function packages(): BelongsToMany
    {
        return $this->belongsToMany(Package::class, 'user_packages')
            ->withPivot('start_date', 'end_date', 'status', 'auto_renew', 'paid_amount', 'payment_method', 'transaction_id')
            ->withTimestamps();
    }

    public function userPackages(): HasMany
    {
        return $this->hasMany(UserPackage::class);
    }

    public function isSchool(): bool
    {
        return $this->role === 'school';
    }

    public function school(): BelongsTo
    {
        return $this->belongsTo(User::class, 'school_id');
    }

    public function students(): HasMany
    {
        return $this->hasMany(User::class, 'school_id')->where('role', 'student');
    }

    public function schoolProjects(): HasMany
    {
        return $this->hasMany(Project::class, 'school_id');
    }

    public function approvedProjects(): HasMany
    {
        return $this->hasMany(Project::class, 'approved_by');
    }

    public function publications(): HasMany
    {
        return $this->hasMany(Publication::class, 'author_id');
    }

    public function schoolPublications(): HasMany
    {
        return $this->hasMany(Publication::class, 'school_id');
    }

    public function approvedPublications(): HasMany
    {
        return $this->hasMany(Publication::class, 'approved_by');
    }

    public function likedPublications(): BelongsToMany
    {
        return $this->belongsToMany(Publication::class, 'publication_likes')
            ->withTimestamps();
    }
}
