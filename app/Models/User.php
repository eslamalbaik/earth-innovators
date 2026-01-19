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
        'membership_number',
        'membership_type',
        'account_type',
        'notification_preferences',
        'institution',
        'bio',
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
            'notification_preferences' => 'array',
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

    public function isSchool(): bool
    {
        return $this->role === 'school' || $this->role === 'educational_institution';
    }

    public function isEducationalInstitution(): bool
    {
        return $this->role === 'educational_institution';
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

    /**
     * Get challenge participations for this user
     */
    public function challengeParticipations(): HasMany
    {
        return $this->hasMany(ChallengeParticipation::class);
    }

    /**
     * Get challenges this user is participating in
     */
    public function participatingChallenges(): BelongsToMany
    {
        return $this->belongsToMany(Challenge::class, 'challenge_participants')
            ->withPivot('status', 'points_earned', 'rank', 'joined_at', 'completed_at')
            ->withTimestamps();
    }

    /**
     * Get active challenge participations
     */
    public function activeChallengeParticipations(): HasMany
    {
        return $this->hasMany(ChallengeParticipation::class)
            ->whereIn('status', ['joined', 'in_progress']);
    }

    /**
     * Get completed challenge participations
     */
    public function completedChallengeParticipations(): HasMany
    {
        return $this->hasMany(ChallengeParticipation::class)
            ->where('status', 'completed');
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

    public function communityBadgeProgress(): HasMany
    {
        return $this->hasMany(UserCommunityBadge::class);
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

    public function isSystemSupervisor(): bool
    {
        return $this->role === 'system_supervisor';
    }

    public function isSchoolSupportCoordinator(): bool
    {
        return $this->role === 'school_support_coordinator';
    }

    public function isProjectAccount(): bool
    {
        return $this->account_type === 'project';
    }

    public function hasBasicMembership(): bool
    {
        return $this->membership_type === 'basic';
    }

    public function hasSubscriptionMembership(): bool
    {
        return $this->membership_type === 'subscription';
    }

    /**
     * التحقق من صلاحيات الوصول حسب نوع العضوية
     */
    public function canAccessPlatform(): bool
    {
        // مشرف النظام و منسق دعم المؤسسات تعليمية يمكنهم الوصول دائماً
        if ($this->isSystemSupervisor() || $this->isSchoolSupportCoordinator() || $this->isAdmin()) {
            return true;
        }

        // المستخدمون الآخرون يحتاجون عضوية للوصول
        return $this->membership_type !== null;
    }

    /**
     * التحقق من صلاحيات إدارة المؤسسات تعليمية (لمنسق دعم المؤسسات تعليمية)
     */
    public function canManageSchools(): bool
    {
        return $this->isSchoolSupportCoordinator() || $this->isSystemSupervisor() || $this->isAdmin();
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
