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

    public function index(Request $request)
    {
        $user = Auth::user();
        $schoolId = null;
        $challenges = null;

        if ($user) {
            if ($user->isStudent()) {
                $submissionService = app(\App\Services\ChallengeSubmissionService::class);
                $status = $request->get('status');
                
                if ($user->school_id) {
                    $query = Challenge::where('status', '!=', 'cancelled')
                        ->where(function ($q) use ($user) {
                            $q->where('school_id', $user->school_id)
                              ->orWhereNull('school_id');
                        })
                        ->with(['creator:id,name', 'school:id,name'])
                        ->withCount(['submissions as submissions_count', 'participants as participants_count'])
                        ->orderBy('created_at', 'desc');

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
                } else {
                    $query = Challenge::whereNull('school_id')
                        ->where('status', '!=', 'cancelled')
                        ->with(['creator:id,name', 'school:id,name'])
                        ->withCount(['submissions as submissions_count', 'participants as participants_count'])
                        ->orderBy('created_at', 'desc');

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
                $teacherSchool = $user->school;
                $schoolId = $teacherSchool ? $teacherSchool->id : null;
                
                $query = Challenge::where('status', '!=', 'cancelled')
                    ->where(function ($q) use ($user, $schoolId) {
                        $q->where('created_by', $user->id);
                        if ($schoolId) {
                            $q->orWhere('school_id', $schoolId);
                        }
                        $q->orWhereNull('school_id');
                    })
                    ->with(['creator:id,name', 'school:id,name'])
                    ->orderBy('created_at', 'desc');

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
                
                $challenges->getCollection()->transform(function ($challenge) {
                    if (!isset($challenge->image_url) && $challenge->image) {
                        $challenge->image_url = $challenge->getImageUrlAttribute();
                    }
                    return $challenge;
                });
            } elseif ($user->isSchool()) {
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

        if (!$challenges) {
            $challenges = $this->challengeService->getActiveChallenges(
                $request->get('search'),
                $request->get('category'),
                $request->get('challenge_type'),
                null, 
                12
            )->withQueryString();
        }

        $previousWinners = $this->getPreviousWinners(3);
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

    public function show(int $id)
    {
        $user = Auth::user();
        if ($user && $user->isStudent()) {
            return redirect()->route('student.challenges.show', $id);
        }
        if ($user && $user->isTeacher()) {
            $challenge = Challenge::findOrFail($id);
            if ($challenge->created_by === $user->id) {
                return redirect()->route('teacher.challenges.show', $id);
            }
        }
        $challenge = Challenge::with(['creator', 'school'])
            ->findOrFail($id);
        if (!isset($challenge->image_url) && $challenge->image) {
            $challenge->image_url = $challenge->getImageUrlAttribute();
        }
        $existingSubmission = null;
        if ($user && $user->isStudent()) {
            $existingSubmission = \App\Models\ChallengeSubmission::where('challenge_id', $challenge->id)
                ->where('student_id', $user->id)
                ->first();
        }
        return Inertia::render('Student/Challenges/Show', [
            'challenge' => $challenge,
            'existingSubmission' => $existingSubmission,
            'userRole' => $user ? $user->role : null,
            'canSubmit' => $user && $user->isStudent() && ($challenge->school_id === $user->school_id || $challenge->school_id === null),
        ]);
    }

    private function getPreviousWinners(int $limit = 3): array
    {
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

    private function getParticipationConditions(): array
    {
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

