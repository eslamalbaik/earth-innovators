<?php

namespace App\Http\Controllers;

use App\Services\ChallengeService;
use App\Models\Challenge;
use App\Models\ChallengeSubmission;
use App\Models\ChallengeParticipation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ChallengeController extends Controller
{
    public function __construct(
        private ChallengeService $challengeService
    ) {}

    /**
     * عرض التحديات بناءً على دور المستخدم ومدرسته
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        $schoolId = null;
        $challenges = null;

        // تحديد التحديات بناءً على دور المستخدم
        if ($user) {
            if ($user->isStudent()) {
                // للطلاب: عرض التحديات الخاصة بمدرستهم + التحديات العامة (school_id = null)
                $submissionService = app(\App\Services\ChallengeSubmissionService::class);
                $status = $request->get('status'); // active, upcoming, finished
                
                if ($user->school_id) {
                    // تحديات مدرستهم + التحديات العامة
                    $query = Challenge::where('status', '!=', 'cancelled')
                        ->where(function ($q) use ($user) {
                            $q->where('school_id', $user->school_id)
                              ->orWhereNull('school_id'); // التحديات العامة
                        })
                        ->with(['creator:id,name', 'school:id,name'])
                        ->withCount(['submissions as submissions_count', 'participants as participants_count'])
                        ->orderBy('created_at', 'desc');

                    // Apply status filter
                    if ($status === 'active') {
                        $query->where('status', 'active')
                            ->where('start_date', '<=', now())
                            ->where('deadline', '>=', now());
                    } elseif ($status === 'upcoming') {
                        $query->where('status', 'active')
                            ->where('start_date', '>', now());
                    } elseif ($status === 'finished') {
                        $query->where(function ($q) {
                            $q->where('status', 'completed')
                              ->orWhere('deadline', '<', now());
                        });
                    }

                    // Apply search filter
                    if ($request->get('search')) {
                        $search = $request->get('search');
                        $query->where(function ($q) use ($search) {
                            $q->where('title', 'like', "%{$search}%")
                              ->orWhere('objective', 'like', "%{$search}%")
                              ->orWhere('description', 'like', "%{$search}%");
                        });
                    }

                    // Apply category filter
                    if ($request->get('category')) {
                        $query->where('category', $request->get('category'));
                    }

                    $challenges = $query->paginate(12)->withQueryString();
                } else {
                    // إذا لم يكن الطالب مرتبطاً بمدرسة - عرض التحديات العامة فقط
                    $query = Challenge::whereNull('school_id')
                        ->where('status', '!=', 'cancelled')
                        ->with(['creator:id,name', 'school:id,name'])
                        ->withCount(['submissions as submissions_count', 'participants as participants_count'])
                        ->orderBy('created_at', 'desc');

                    // Apply filters
                    if ($status === 'active') {
                        $query->where('status', 'active')
                            ->where('start_date', '<=', now())
                            ->where('deadline', '>=', now());
                    } elseif ($status === 'upcoming') {
                        $query->where('status', 'active')
                            ->where('start_date', '>', now());
                    } elseif ($status === 'finished') {
                        $query->where(function ($q) {
                            $q->where('status', 'completed')
                              ->orWhere('deadline', '<', now());
                        });
                    }

                    if ($request->get('search')) {
                        $search = $request->get('search');
                        $query->where(function ($q) use ($search) {
                            $q->where('title', 'like', "%{$search}%")
                              ->orWhere('objective', 'like', "%{$search}%")
                              ->orWhere('description', 'like', "%{$search}%");
                        });
                    }

                    if ($request->get('category')) {
                        $query->where('category', $request->get('category'));
                    }

                    $challenges = $query->paginate(12)->withQueryString();
                }
            } elseif ($user->isTeacher()) {
                // للمعلمين: عرض التحديات الخاصة بمدرستهم أو التي أنشأوها + التحديات العامة
                $teacherSchool = $user->school;
                $schoolId = $teacherSchool ? $teacherSchool->id : null;
                
                $query = Challenge::where('status', '!=', 'cancelled')
                    ->where(function ($q) use ($user, $schoolId) {
                        // التحديات التي أنشأها المعلم
                        $q->where('created_by', $user->id);
                        
                        // أو التحديات الخاصة بمدرسته
                        if ($schoolId) {
                            $q->orWhere('school_id', $schoolId);
                        }
                        
                        // أو التحديات العامة (school_id = null)
                        $q->orWhereNull('school_id');
                    })
                    ->with(['creator:id,name', 'school:id,name'])
                    ->orderBy('created_at', 'desc');

                // Apply filters
                if ($request->get('search')) {
                    $search = $request->get('search');
                    $query->where(function ($q) use ($search) {
                        $q->where('title', 'like', "%{$search}%")
                          ->orWhere('description', 'like', "%{$search}%")
                          ->orWhere('objective', 'like', "%{$search}%");
                    });
                }

                if ($request->get('category')) {
                    $query->where('category', $request->get('category'));
                }

                if ($request->get('challenge_type')) {
                    $query->where('challenge_type', $request->get('challenge_type'));
                }

                // Apply status filter
                $status = $request->get('status');
                if ($status === 'active') {
                    $query->where('status', 'active')
                        ->where('start_date', '<=', now())
                        ->where('deadline', '>=', now());
                } elseif ($status === 'upcoming') {
                    $query->where('status', 'active')
                        ->where('start_date', '>', now());
                } elseif ($status === 'finished') {
                    $query->where(function ($q) {
                        $q->where('status', 'completed')
                          ->orWhere('deadline', '<', now());
                    });
                }

                $challenges = $query->paginate(12)->withQueryString();
                
                // Ensure image_url is appended
                $challenges->getCollection()->transform(function ($challenge) {
                    if (!isset($challenge->image_url) && $challenge->image) {
                        $challenge->image_url = $challenge->getImageUrlAttribute();
                    }
                    return $challenge;
                });
            } elseif ($user->isSchool()) {
                // للمدارس: عرض التحديات الخاصة بمدرستهم فقط
                $challenges = $this->challengeService->getSchoolChallenges(
                    $user->id,
                    $request->get('status'),
                    12,
                    $request->get('search'),
                    $request->get('category'),
                    $request->get('challenge_type')
                )->withQueryString();
            }
        }

        // للزوار: عرض التحديات العامة (النشطة فقط)
        if (!$challenges) {
            $challenges = $this->challengeService->getActiveChallenges(
                $request->get('search'),
                $request->get('category'),
                $request->get('challenge_type'),
                null, // لا يوجد school_id للزوار
                12
            )->withQueryString();
        }

        // Get previous winners (top 3 from completed challenges)
        $previousWinners = $this->getPreviousWinners(3);

        // Get participation conditions (from challenge instructions or default)
        $participationConditions = $this->getParticipationConditions();

        return Inertia::render('Challenges/Index', [
            'challenges' => $challenges,
            'userRole' => $user ? $user->role : null,
            'previousWinners' => $previousWinners,
            'participationConditions' => $participationConditions,
            'auth' => [
                'user' => $user,
            ],
        ]);
    }

    /**
     * عرض تفاصيل تحدّي نشط
     */
    public function show(int $id)
    {
        $user = Auth::user();

        // للطلاب: توجيههم إلى صفحة الطلاب
        if ($user && $user->isStudent()) {
            return redirect()->route('student.challenges.show', $id);
        }

        // للمعلمين: توجيههم إلى صفحة المعلمين
        if ($user && $user->isTeacher()) {
            $challenge = Challenge::findOrFail($id);
            if ($challenge->created_by === $user->id) {
                return redirect()->route('teacher.challenges.show', $id);
            }
        }

        // للزوار والمستخدمين الآخرين: عرض التحدي العام (بما في ذلك المؤسسات تعليمية)
        $challenge = Challenge::with(['creator', 'school'])
            ->findOrFail($id);

        // Ensure image_url is available
        if (!isset($challenge->image_url) && $challenge->image) {
            $challenge->image_url = $challenge->getImageUrlAttribute();
        }

        // Get existing submission if user is student
        $existingSubmission = null;
        if ($user && $user->isStudent()) {
            $existingSubmission = \App\Models\ChallengeSubmission::where('challenge_id', $challenge->id)
                ->where('student_id', $user->id)
                ->first();
        }

        // استخدام صفحة الطلاب كـ fallback
        return Inertia::render('Student/Challenges/Show', [
            'challenge' => $challenge,
            'existingSubmission' => $existingSubmission,
            'userRole' => $user ? $user->role : null,
            'canSubmit' => $user && $user->isStudent() && ($challenge->school_id === $user->school_id || $challenge->school_id === null),
        ]);
    }

    /**
     * Get previous winners from completed challenges
     */
    private function getPreviousWinners(int $limit = 3): array
    {
        // Get top winners from completed challenges based on rating and points
        $winners = ChallengeSubmission::where('status', 'approved')
            ->where('rating', '>=', 4)
            ->with(['student:id,name,image', 'challenge:id,title'])
            ->orderBy('rating', 'desc')
            ->orderBy('points_earned', 'desc')
            ->orderBy('reviewed_at', 'desc')
            ->limit($limit)
            ->get()
            ->map(function ($submission) {
                return [
                    'id' => $submission->id,
                    'name' => $submission->student->name ?? 'مشارك',
                    'project' => $submission->challenge->title ?? 'تحدي',
                    'date' => $submission->reviewed_at?->format('F Y') ?? $submission->created_at->format('F Y'),
                    'rating' => $submission->rating ?? 0,
                    'points' => $submission->points_earned ?? 0,
                    'avatar' => $submission->student->image ?? null,
                ];
            })
            ->toArray();

        // If not enough from submissions, get from participations
        if (count($winners) < $limit) {
            $participationWinners = ChallengeParticipation::where('status', 'completed')
                ->where('points_earned', '>', 0)
                ->with(['user:id,name,image', 'challenge:id,title'])
                ->orderBy('points_earned', 'desc')
                ->orderBy('completed_at', 'desc')
                ->limit($limit - count($winners))
                ->get()
                ->map(function ($participation) {
                    return [
                        'id' => $participation->id,
                        'name' => $participation->user->name ?? 'مشارك',
                        'project' => $participation->challenge->title ?? 'تحدي',
                        'date' => $participation->completed_at?->format('F Y') ?? $participation->created_at->format('F Y'),
                        'rating' => 0,
                        'points' => $participation->points_earned ?? 0,
                        'avatar' => $participation->user->image ?? null,
                    ];
                })
                ->toArray();

            $winners = array_merge($winners, $participationWinners);
        }

        return array_slice($winners, 0, $limit);
    }

    /**
     * Get participation conditions (can be from database or default)
     */
    private function getParticipationConditions(): array
    {
        // يمكن جلبها من قاعدة البيانات لاحقاً
        // حالياً نستخدم قيم افتراضية منطقية
        return [
            [
                'text' => 'التسجيل في التطبيق',
                'icon' => 'required',
                'tag' => 'إلزامي',
                'tagColor' => 'bg-red-100 text-red-700 border-red-300',
            ],
            [
                'text' => 'إكمال الملف الشخصي',
                'icon' => 'required',
                'tag' => 'إلزامي',
                'tagColor' => 'bg-red-100 text-red-700 border-red-300',
            ],
            [
                'text' => 'الانتماء لمدرسة مسجلة',
                'icon' => 'preferred',
                'tag' => 'مفضل',
                'tagColor' => 'bg-blue-100 text-blue-700 border-blue-300',
            ],
            [
                'text' => 'المشاركة السابقة في التحديات',
                'icon' => 'preferred',
                'tag' => 'مفضل',
                'tagColor' => 'bg-blue-100 text-blue-700 border-blue-300',
            ],
            [
                'text' => 'الالتزام بالمواعيد النهائية',
                'icon' => 'required',
                'tag' => 'إلزامي',
                'tagColor' => 'bg-red-100 text-red-700 border-red-300',
            ],
        ];
    }
}

