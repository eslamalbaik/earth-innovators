<?php

namespace App\Services;

use App\DTO\Student\StoreStudentDTO;
use App\DTO\Student\UpdateStudentDTO;
use App\Jobs\SendBadgeAwardedNotification;
use App\Models\User;
use App\Models\Badge;
use App\Models\UserBadge;
use App\Repositories\UserRepository;
use App\Repositories\ProjectRepository;
use App\Repositories\BadgeRepository;
use App\Services\MembershipService;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Cache;
use Illuminate\Pagination\LengthAwarePaginator;
use Carbon\Carbon;

class StudentService extends BaseService
{
    public function __construct(
        private UserRepository $userRepository,
        private ProjectRepository $projectRepository,
        private BadgeRepository $badgeRepository,
        private MembershipService $membershipService
    ) {}

    public function getAllStudents(?string $search = null, ?string $status = null, ?string $dateFrom = null, ?string $dateTo = null, int $perPage = 15): LengthAwarePaginator
    {
        $cacheKey = "all_students_" . md5(json_encode([$search, $status, $dateFrom, $dateTo, $perPage]));
        $cacheTag = 'all_students';

        return $this->cacheTags($cacheTag, $cacheKey, function () use ($search, $status, $dateFrom, $dateTo, $perPage) {
            $query = User::where('role', 'student')
                ->select('id', 'name', 'email', 'phone', 'email_verified_at', 'created_at');

            if ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('phone', 'like', "%{$search}%");
                });
            }

            if ($dateFrom) {
                $query->whereDate('created_at', '>=', $dateFrom);
            }

            if ($dateTo) {
                $query->whereDate('created_at', '<=', $dateTo);
            }

            if ($status) {
                if ($status === 'active') {
                    $query->whereNotNull('email_verified_at');
                } elseif ($status === 'inactive') {
                    $query->whereNull('email_verified_at');
                } elseif ($status === 'suspended') {
                    $query->whereNull('email_verified_at');
                }
            }

            $students = $query->latest()->paginate($perPage);

            // Add computed status
            $students->getCollection()->transform(function ($student) {
                $student->status = $student->email_verified_at ? 'active' : 'inactive';
                return $student;
            });

            return $students;
        }, 300); // Cache for 5 minutes
    }

    public function getStudentsBySchool(int $schoolId, ?string $search = null, int $perPage = 20): LengthAwarePaginator
    {
        $cacheKey = "school_students_{$schoolId}_" . md5($search ?? '') . "_{$perPage}";
        $cacheTag = "school_students_{$schoolId}";
        
        return $this->cacheTags($cacheTag, $cacheKey, function () use ($schoolId, $search, $perPage) {
            $students = $this->userRepository->searchBySchoolId($schoolId, 'student', $search, $perPage);
            
            // Eager load badges to avoid N+1
            $students->load('badges');
            
            // Get all user IDs for batch query
            $userIds = $students->pluck('id')->toArray();
            
            // Get project counts in a single query
            $projectCounts = $this->projectRepository->getProjectCountsByUserIds($userIds);
            
            // Ensure all students have membership numbers before transforming
            $studentIds = $students->getCollection()->pluck('id')->toArray();
            if (!empty($studentIds)) {
                $studentsWithoutMembership = \App\Models\User::whereIn('id', $studentIds)
                    ->whereNull('membership_number')
                    ->where('role', 'student')
                    ->get();
                
                foreach ($studentsWithoutMembership as $student) {
                    $this->membershipService->ensureMembershipNumber($student);
                }
                
                // Reload students to get updated membership numbers
                $students->getCollection()->each(function ($student) {
                    $student->refresh();
                });
            }
            
            // Transform the paginated results
            $students->getCollection()->transform(function ($student) use ($projectCounts) {
                $counts = $projectCounts[$student->id] ?? (object)['total' => 0, 'approved' => 0, 'pending' => 0];
                
                // Ensure counts is an object
                if (is_array($counts)) {
                    $counts = (object) $counts;
                }
                
                return [
                    'id' => $student->id,
                    'name' => $student->name,
                    'email' => $student->email,
                    'phone' => $student->phone,
                    'membership_number' => $student->membership_number,
                    'points' => $student->points ?? 0,
                    'projects_count' => $counts->total ?? 0,
                    'approved_projects' => $counts->approved ?? 0,
                    'pending_projects' => $counts->pending ?? 0,
                    'badges_count' => $student->badges->count(),
                    'badges' => $student->badges->map(function ($badge) {
                        $earnedAt = $badge->pivot->earned_at;
                        $earnedAtFormatted = null;
                        
                        if ($earnedAt) {
                            // Handle both string and Carbon/DateTime instances
                            if (is_string($earnedAt)) {
                                $earnedAtFormatted = Carbon::parse($earnedAt)->format('Y-m-d');
                            } elseif ($earnedAt instanceof \DateTime || $earnedAt instanceof \Carbon\Carbon) {
                                $earnedAtFormatted = $earnedAt->format('Y-m-d');
                            }
                        }
                        
                        return [
                            'id' => $badge->id,
                            'name' => $badge->name,
                            'name_ar' => $badge->name_ar,
                            'icon' => $badge->icon,
                            'pivot' => [
                                'reason' => $badge->pivot->reason,
                                'earned_at' => $earnedAtFormatted,
                            ],
                        ];
                    }),
                    'created_at' => $student->created_at->format('Y-m-d'),
                ];
            });

            return $students;
        }, 300); // Cache for 5 minutes
    }

    public function getAvailableBadges(int $schoolId): \Illuminate\Database\Eloquent\Collection
    {
        $cacheKey = "available_badges_school_{$schoolId}";
        
        return $this->cache($cacheKey, function () use ($schoolId) {
            return $this->badgeRepository->getAvailableBadgesForSchool($schoolId);
        }, 3600); // Cache for 1 hour
    }

    public function storeStudent(StoreStudentDTO $dto): User
    {
        $user = $this->userRepository->create([
            'name' => $dto->name,
            'email' => $dto->email,
            'phone' => $dto->phone,
            'password' => Hash::make($dto->password),
            'role' => 'student',
            'school_id' => $dto->schoolId,
            'points' => $dto->points,
            'membership_number' => $this->membershipService->generateMembershipNumber('student'),
        ]);

        // Clear cache using tags
        $this->forgetCacheTags(["school_students_{$dto->schoolId}"]);

        return $user;
    }

    public function updateStudent(int $id, int $schoolId, UpdateStudentDTO $dto): User
    {
        $student = $this->userRepository->findByIdAndSchoolId($id, $schoolId, 'student');
        
        if (!$student) {
            throw new \Exception('Student not found');
        }

        $updateData = [
            'name' => $dto->name,
            'email' => $dto->email,
            'phone' => $dto->phone,
        ];

        if ($dto->password) {
            $updateData['password'] = Hash::make($dto->password);
        }

        $this->userRepository->update($id, $updateData);

        // Clear cache
        $this->forgetCacheTags(["school_students_{$schoolId}"]);

        return $student->fresh();
    }

    public function deleteStudent(int $id, int $schoolId): bool
    {
        $student = $this->userRepository->findByIdAndSchoolId($id, $schoolId, 'student');
        
        if (!$student) {
            throw new \Exception('Student not found');
        }

        $deleted = $this->userRepository->delete($id);

        // Clear cache
        $this->forgetCacheTags(["school_students_{$schoolId}"]);

        return $deleted;
    }

    public function awardBadge(int $studentId, int $schoolId, int $badgeId, ?string $reason = null): void
    {
        $student = $this->userRepository->findByIdAndSchoolId($studentId, $schoolId, 'student');
        
        if (!$student) {
            throw new \Exception('Student not found');
        }

        // Check if badge already exists
        $existingBadge = UserBadge::where('user_id', $studentId)
            ->where('badge_id', $badgeId)
            ->first();

        if ($existingBadge) {
            throw new \Exception('Student already has this badge');
        }

        UserBadge::create([
            'user_id' => $studentId,
            'badge_id' => $badgeId,
            'awarded_by' => $schoolId,
            'reason' => $reason ?? 'منح من قبل المدرسة',
            'earned_at' => now(),
        ]);

        // Queue notification instead of sending immediately
        $badge = $this->badgeRepository->findOrFail($badgeId);
        $school = $this->userRepository->findOrFail($schoolId);
        
        SendBadgeAwardedNotification::dispatch($student, $badge, $school);

        // Clear cache
        $this->forgetCacheTags(["school_students_{$schoolId}"]);
    }

    public function removeBadge(int $studentId, int $schoolId, int $badgeId): void
    {
        $student = $this->userRepository->findByIdAndSchoolId($studentId, $schoolId, 'student');
        
        if (!$student) {
            throw new \Exception('Student not found');
        }

        $userBadge = UserBadge::where('user_id', $studentId)
            ->where('badge_id', $badgeId)
            ->firstOrFail();

        $userBadge->delete();

        // Clear cache
        $this->forgetCacheTags(["school_students_{$schoolId}"]);
    }
}

