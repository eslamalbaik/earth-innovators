<?php

namespace App\Services;

use App\Models\Certificate;
use App\Models\User;
use App\Models\Project;
use App\Models\ChallengeSubmission;
use App\Models\ChallengeParticipation;
use App\Models\Point;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class MembershipCertificateService extends BaseService
{
    protected $certificateService;

    public function __construct(CertificateService $certificateService)
    {
        $this->certificateService = $certificateService;
    }

    /**
     * Check and award student membership certificate
     * 
     * شروط شهادة عضوية الطالب:
     * 1. الحصول على 50 نقطة على الأقل
     * 2. إتمام 3 مشاريع معتمدة على الأقل
     * 3. المشاركة في تحدّي واحد على الأقل
     * 4. قضاء 30 يوم على الأقل في المنصة
     */
    public function checkAndAwardStudentMembership(int $userId, bool $force = false): ?Certificate
    {
        $user = User::findOrFail($userId);

        if ($user->role !== 'student') {
            return null;
        }

        // Check if user already has membership certificate
        $existingCertificate = Certificate::where('user_id', $userId)
            ->where('type', 'membership')
            ->where('is_active', true)
            ->first();

        if ($existingCertificate) {
            return $existingCertificate;
        }

        // Check eligibility criteria
        $eligibility = $this->checkStudentEligibility($user);

        if (!$eligibility['eligible'] && !$force) {
            return null;
        }

        try {
            DB::beginTransaction();

            // Generate certificate PDF
            $filePath = $this->certificateService->generateCertificate(
                $user,
                $user, // Self-issued (automatic)
                [
                    'course_name' => 'شهادة عضوية طالب',
                    'description' => $this->generateStudentCertificateDescription($eligibility),
                    'description_ar' => $this->generateStudentCertificateDescription($eligibility),
                ],
                null,
                'long',
                'membership'
            );

            // Save certificate to database
            $certificate = $this->certificateService->saveCertificate(
                $user,
                $user, // Self-issued
                $filePath,
                [
                    'course_name' => 'شهادة عضوية طالب',
                    'description' => $this->generateStudentCertificateDescription($eligibility),
                    'description_ar' => $this->generateStudentCertificateDescription($eligibility),
                ],
                'membership'
            );

            // Fire event
            event(new \App\Events\CertificateIssued($certificate, $user));

            DB::commit();

            $this->forgetCacheTags([
                "user_certificates_{$userId}",
                "user_{$userId}",
            ]);

            Log::info('Student membership certificate awarded', [
                'user_id' => $userId,
                'certificate_id' => $certificate->id,
                'eligibility' => $eligibility,
            ]);

            return $certificate;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to award student membership certificate', [
                'user_id' => $userId,
                'error' => $e->getMessage(),
            ]);
            return null;
        }
    }

    /**
     * Check student eligibility for membership certificate
     */
    protected function checkStudentEligibility(User $user): array
    {
        // 1. Check points (minimum 50 points)
        $totalPoints = $user->points ?? 0;
        $pointsEligible = $totalPoints >= 50;

        // 2. Check approved projects (minimum 3 projects)
        $approvedProjectsCount = Project::where('user_id', $user->id)
            ->where('status', 'approved')
            ->count();
        $projectsEligible = $approvedProjectsCount >= 3;

        // 3. Check challenge participation (minimum 1 challenge)
        $challengesParticipated = ChallengeParticipation::where('user_id', $user->id)
            ->where('status', 'completed')
            ->count();
        $challengesEligible = $challengesParticipated >= 1;

        // 4. Check account age (minimum 30 days)
        $accountAge = $user->created_at ? $user->created_at->diffInDays(now()) : 0;
        $accountAgeEligible = $accountAge >= 30;

        $eligible = $pointsEligible && $projectsEligible && $challengesEligible && $accountAgeEligible;

        return [
            'eligible' => $eligible,
            'points' => $totalPoints,
            'points_required' => 50,
            'points_eligible' => $pointsEligible,
            'approved_projects' => $approvedProjectsCount,
            'projects_required' => 3,
            'projects_eligible' => $projectsEligible,
            'challenges_participated' => $challengesParticipated,
            'challenges_required' => 1,
            'challenges_eligible' => $challengesEligible,
            'account_age_days' => $accountAge,
            'account_age_required' => 30,
            'account_age_eligible' => $accountAgeEligible,
        ];
    }

    /**
     * Check and award teacher membership certificate
     * 
     * شروط شهادة عضوية المعلم:
     * 1. الحصول على 100 نقطة على الأقل
     * 2. إتمام 10 مشاريع معتمدة على الأقل
     * 3. تقييم 4.0 أو أعلى
     * 4. قضاء 60 يوم على الأقل في المنصة
     */
    public function checkAndAwardTeacherMembership(int $userId, bool $force = false): ?Certificate
    {
        $user = User::findOrFail($userId);

        if ($user->role !== 'teacher' || !$user->teacher) {
            return null;
        }

        $teacher = $user->teacher;

        // Check if user already has membership certificate
        $existingCertificate = Certificate::where('user_id', $userId)
            ->where('type', 'membership')
            ->where('is_active', true)
            ->first();

        if ($existingCertificate) {
            return $existingCertificate;
        }

        // Check eligibility criteria
        $eligibility = $this->checkTeacherEligibility($user, $teacher);

        if (!$eligibility['eligible'] && !$force) {
            return null;
        }

        try {
            DB::beginTransaction();

            // Generate certificate PDF
            $description = $force 
                ? 'تم منح هذه الشهادة بناءً على إنجازات المستخدم في المنصة.'
                : $this->generateTeacherCertificateDescription($eligibility);
            
            $filePath = $this->certificateService->generateCertificate(
                $user,
                $user, // Self-issued (automatic)
                [
                    'course_name' => 'شهادة عضوية معلم',
                    'description' => $description,
                    'description_ar' => $description,
                ],
                null,
                'long',
                'membership'
            );

            // Save certificate to database
            $certificate = $this->certificateService->saveCertificate(
                $user,
                $user, // Self-issued
                $filePath,
                [
                    'course_name' => 'شهادة عضوية معلم',
                    'description' => $description,
                    'description_ar' => $description,
                ],
                'membership'
            );

            // Fire event
            event(new \App\Events\CertificateIssued($certificate, $user));

            DB::commit();

            $this->forgetCacheTags([
                "user_certificates_{$userId}",
                "user_{$userId}",
            ]);

            Log::info('Teacher membership certificate awarded', [
                'user_id' => $userId,
                'certificate_id' => $certificate->id,
                'eligibility' => $eligibility,
            ]);

            return $certificate;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to award teacher membership certificate', [
                'user_id' => $userId,
                'error' => $e->getMessage(),
            ]);
            return null;
        }
    }

    /**
     * Check teacher eligibility for membership certificate
     */
    protected function checkTeacherEligibility(User $user, $teacher): array
    {
        // 1. Check points (minimum 100 points)
        $totalPoints = $user->points ?? 0;
        $pointsEligible = $totalPoints >= 100;

        // 2. Check approved projects (minimum 10 projects)
        $approvedProjectsCount = Project::where('teacher_id', $teacher->id)
            ->where('status', 'approved')
            ->count();
        $projectsEligible = $approvedProjectsCount >= 10;

        // 3. Check rating (minimum 4.0)
        $rating = $teacher->rating ?? 0;
        $ratingEligible = $rating >= 4.0;

        // 4. Check account age (minimum 60 days)
        $accountAge = $user->created_at ? $user->created_at->diffInDays(now()) : 0;
        $accountAgeEligible = $accountAge >= 60;

        $eligible = $pointsEligible && $projectsEligible && $ratingEligible && $accountAgeEligible;

        return [
            'eligible' => $eligible,
            'points' => $totalPoints,
            'points_required' => 100,
            'points_eligible' => $pointsEligible,
            'approved_projects' => $approvedProjectsCount,
            'projects_required' => 10,
            'projects_eligible' => $projectsEligible,
            'rating' => $rating,
            'rating_required' => 4.0,
            'rating_eligible' => $ratingEligible,
            'account_age_days' => $accountAge,
            'account_age_required' => 60,
            'account_age_eligible' => $accountAgeEligible,
        ];
    }

    /**
     * Check and award school membership certificate
     * 
     * شروط شهادة عضوية المدرسة:
     * 1. وجود 20 طالب على الأقل
     * 2. إتمام 50 مشروع معتمد على الأقل
     * 3. قضاء 90 يوم على الأقل في المنصة
     * 4. ترتيب في أعلى 50% من المدارس
     */
    public function checkAndAwardSchoolMembership(int $schoolId, bool $force = false): ?Certificate
    {
        $school = User::findOrFail($schoolId);

        if (!$school->isSchool()) {
            return null;
        }

        // Check if school already has membership certificate
        $existingCertificate = Certificate::where('school_id', $schoolId)
            ->where('type', 'membership')
            ->where('is_active', true)
            ->first();

        if ($existingCertificate) {
            return $existingCertificate;
        }

        // Check eligibility criteria
        $eligibility = $this->checkSchoolEligibility($school);

        if (!$eligibility['eligible'] && !$force) {
            return null;
        }

        try {
            DB::beginTransaction();

            // Generate certificate PDF
            $description = $force 
                ? 'تم منح هذه الشهادة بناءً على إنجازات المدرسة في المنصة.'
                : $this->generateSchoolCertificateDescription($eligibility);
            
            $filePath = $this->certificateService->generateCertificate(
                $school,
                $school, // Self-issued (automatic)
                [
                    'course_name' => 'شهادة عضوية مدرسة',
                    'description' => $description,
                    'description_ar' => $description,
                ],
                null,
                'long',
                'membership'
            );

            // Save certificate to database
            $certificate = Certificate::create([
                'school_id' => $schoolId,
                'type' => 'membership',
                'title' => 'شهادة عضوية مدرسة',
                'title_ar' => 'شهادة عضوية مدرسة',
                'description' => $description,
                'description_ar' => $description,
                'certificate_number' => $this->certificateService->generateCertificateNumber($school),
                'issue_date' => Carbon::now(),
                'expiry_date' => null,
                'template' => 'default',
                'file_path' => $filePath,
                'issued_by' => $school->id,
                'is_active' => true,
            ]);

            // Fire event
            event(new \App\Events\CertificateIssued($certificate, $school));

            DB::commit();

            $this->forgetCacheTags([
                "school_certificates_{$schoolId}",
                "school_{$schoolId}",
            ]);

            Log::info('School membership certificate awarded', [
                'school_id' => $schoolId,
                'certificate_id' => $certificate->id,
                'eligibility' => $eligibility,
            ]);

            return $certificate;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to award school membership certificate', [
                'school_id' => $schoolId,
                'error' => $e->getMessage(),
            ]);
            return null;
        }
    }

    /**
     * Check school eligibility for membership certificate
     */
    protected function checkSchoolEligibility(User $school): array
    {
        // 1. Check students count (minimum 20 students)
        $studentsCount = User::where('school_id', $school->id)
            ->where('role', 'student')
            ->count();
        $studentsEligible = $studentsCount >= 20;

        // 2. Check approved projects (minimum 50 projects)
        $approvedProjectsCount = Project::where('school_id', $school->id)
            ->where('status', 'approved')
            ->count();
        $projectsEligible = $approvedProjectsCount >= 50;

        // 3. Check account age (minimum 90 days)
        $accountAge = $school->created_at ? $school->created_at->diffInDays(now()) : 0;
        $accountAgeEligible = $accountAge >= 90;

        // 4. Check ranking (top 50% of schools)
        $totalSchools = User::where('role', 'school')->count();
        $schoolRank = $this->getSchoolRank($school->id);
        $rankingEligible = $schoolRank <= ($totalSchools / 2); // Top 50%

        $eligible = $studentsEligible && $projectsEligible && $accountAgeEligible && $rankingEligible;

        return [
            'eligible' => $eligible,
            'students_count' => $studentsCount,
            'students_required' => 20,
            'students_eligible' => $studentsEligible,
            'approved_projects' => $approvedProjectsCount,
            'projects_required' => 50,
            'projects_eligible' => $projectsEligible,
            'account_age_days' => $accountAge,
            'account_age_required' => 90,
            'account_age_eligible' => $accountAgeEligible,
            'rank' => $schoolRank,
            'total_schools' => $totalSchools,
            'ranking_eligible' => $rankingEligible,
        ];
    }

    /**
     * Get school rank based on total points
     */
    protected function getSchoolRank(int $schoolId): int
    {
        $schoolPoints = User::where('school_id', $schoolId)
            ->where('role', 'student')
            ->sum('points');

        $rank = User::where('role', 'school')
            ->where(function ($query) use ($schoolId, $schoolPoints) {
                $query->whereRaw('(
                    SELECT COALESCE(SUM(points), 0)
                    FROM users
                    WHERE school_id = users.id AND role = "student"
                ) > ?', [$schoolPoints])
                ->orWhere('id', '<', $schoolId);
            })
            ->count() + 1;

        return $rank;
    }

    /**
     * Generate student certificate description
     */
    protected function generateStudentCertificateDescription(array $eligibility): string
    {
        return sprintf(
            'تم منح هذه الشهادة بناءً على: الحصول على %d نقطة، إتمام %d مشاريع معتمدة، المشاركة في %d تحديات، وقضاء %d يوم في المنصة.',
            $eligibility['points'],
            $eligibility['approved_projects'],
            $eligibility['challenges_participated'],
            $eligibility['account_age_days']
        );
    }

    /**
     * Generate teacher certificate description
     */
    protected function generateTeacherCertificateDescription(array $eligibility): string
    {
        return sprintf(
            'تم منح هذه الشهادة بناءً على: الحصول على %d نقطة، إتمام %d مشاريع معتمدة، تقييم %.1f، وقضاء %d يوم في المنصة.',
            $eligibility['points'],
            $eligibility['approved_projects'],
            $eligibility['rating'],
            $eligibility['account_age_days']
        );
    }

    /**
     * Generate school certificate description
     */
    protected function generateSchoolCertificateDescription(array $eligibility): string
    {
        return sprintf(
            'تم منح هذه الشهادة بناءً على: وجود %d طالب، إتمام %d مشروع معتمد، الترتيب %d من %d، وقضاء %d يوم في المنصة.',
            $eligibility['students_count'],
            $eligibility['approved_projects'],
            $eligibility['rank'],
            $eligibility['total_schools'],
            $eligibility['account_age_days']
        );
    }

    /**
     * Get user's membership certificate
     */
    public function getUserMembershipCertificate(int $userId, string $role): ?Certificate
    {
        if ($role === 'student' || $role === 'teacher') {
            return Certificate::where('user_id', $userId)
                ->where('type', 'membership')
                ->where('is_active', true)
                ->latest('issue_date')
                ->first();
        } elseif ($role === 'school' || $role === 'educational_institution') {
            return Certificate::where('school_id', $userId)
                ->where('type', 'membership')
                ->where('is_active', true)
                ->latest('issue_date')
                ->first();
        }

        return null;
    }

    /**
     * Check eligibility status for user
     */
    public function getEligibilityStatus(int $userId, string $role): array
    {
        if ($role === 'student') {
            $user = User::findOrFail($userId);
            return $this->checkStudentEligibility($user);
        } elseif ($role === 'teacher') {
            $user = User::findOrFail($userId);
            if (!$user->teacher) {
                return ['eligible' => false, 'error' => 'Teacher record not found'];
            }
            return $this->checkTeacherEligibility($user, $user->teacher);
        } elseif ($role === 'school' || $role === 'educational_institution') {
            $school = User::findOrFail($userId);
            return $this->checkSchoolEligibility($school);
        }

        return ['eligible' => false, 'error' => 'Invalid role'];
    }
}

