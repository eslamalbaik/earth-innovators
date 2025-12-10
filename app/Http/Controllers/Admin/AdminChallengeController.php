<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Challenge\StoreChallengeRequest;
use App\Http\Requests\Challenge\UpdateChallengeRequest;
use App\Models\Challenge;
use App\Models\User;
use App\Services\ChallengeService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class AdminChallengeController extends Controller
{
    public function __construct(
        private ChallengeService $challengeService
    ) {}
    /**
     * عرض جميع التحديات
     */
    public function index(Request $request)
    {
        $challenges = Challenge::with(['school:id,name', 'creator:id,name,email'])
            ->when($request->filled('search'), function ($q) use ($request) {
                $search = $request->search;
                $q->where(function ($query) use ($search) {
                    $query->where('title', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%")
                        ->orWhereHas('school', function ($schoolQuery) use ($search) {
                            $schoolQuery->where('name', 'like', "%{$search}%");
                        });
                });
            })
            ->when($request->filled('status'), function ($q) use ($request) {
                $q->where('status', $request->status);
            })
            ->when($request->filled('category'), function ($q) use ($request) {
                $q->where('category', $request->category);
            })
            ->when($request->filled('challenge_type'), function ($q) use ($request) {
                $q->where('challenge_type', $request->challenge_type);
            })
            ->latest('created_at')
            ->paginate(20)
            ->withQueryString()
            ->through(function ($challenge) {
                return [
                    'id' => $challenge->id,
                    'title' => $challenge->title,
                    'objective' => $challenge->objective,
                    'description' => $challenge->description,
                    'instructions' => $challenge->instructions,
                    'challenge_type' => $challenge->challenge_type,
                    'challenge_type_label' => $challenge->challenge_type_label,
                    'category' => $challenge->category,
                    'age_group' => $challenge->age_group,
                    'status' => $challenge->status,
                    'school_id' => $challenge->school_id,
                    'school_name' => $challenge->school->name ?? 'غير محدد',
                    'creator_name' => $challenge->creator->name ?? 'غير معروف',
                    'start_date' => $challenge->start_date->format('Y-m-d H:i'),
                    'deadline' => $challenge->deadline->format('Y-m-d H:i'),
                    'points_reward' => $challenge->points_reward ?? 0,
                    'max_participants' => $challenge->max_participants,
                    'current_participants' => $challenge->current_participants ?? 0,
                    'created_at' => $challenge->created_at->format('Y-m-d H:i'),
                ];
            });

        $stats = [
            'total' => Challenge::count(),
            'active' => Challenge::where('status', 'active')->count(),
            'draft' => Challenge::where('status', 'draft')->count(),
            'completed' => Challenge::where('status', 'completed')->count(),
            'cancelled' => Challenge::where('status', 'cancelled')->count(),
        ];

        $schools = User::where('role', 'school')
            ->select('id', 'name')
            ->orderBy('name')
            ->get();

        return Inertia::render('Admin/Challenges/Index', [
            'challenges' => $challenges,
            'stats' => $stats,
            'filters' => $request->only(['search', 'status', 'category', 'challenge_type']),
            'schools' => $schools,
        ]);
    }

    /**
     * عرض نموذج إنشاء تحدٍ جديد
     */
    public function create()
    {
        $schools = User::where('role', 'school')
            ->select('id', 'name')
            ->orderBy('name')
            ->get();

        return Inertia::render('Admin/Challenges/Create', [
            'schools' => $schools,
        ]);
    }

    /**
     * حفظ تحدٍ جديد
     */
    public function store(StoreChallengeRequest $request)
    {
        $data = $request->validated();
        $data['created_by'] = auth()->id();
        $data['status'] = $data['status'] ?? 'draft';
        $data['current_participants'] = 0;
        
        // Convert date strings to datetime
        if (isset($data['start_date']) && !str_contains($data['start_date'], ' ')) {
            $data['start_date'] = $data['start_date'] . ' 00:00:00';
        }
        if (isset($data['deadline']) && !str_contains($data['deadline'], ' ')) {
            $data['deadline'] = $data['deadline'] . ' 23:59:59';
        }
        
        // Convert max_participants to null if empty
        if (isset($data['max_participants']) && $data['max_participants'] === '') {
            $data['max_participants'] = null;
        }

        try {
            // Use ChallengeService to ensure cache is cleared properly
            $challenge = $this->challengeService->createChallenge($data);
            
            // Clear cache for the school if school_id is set
            if ($challenge->school_id) {
                $this->challengeService->clearChallengeCache($challenge->school_id, $challenge->created_by);
            }
            
            Log::info('Admin challenge created successfully', [
                'challenge_id' => $challenge->id,
                'school_id' => $challenge->school_id,
                'title' => $challenge->title,
                'status' => $challenge->status,
            ]);

            return redirect()
                ->route('admin.challenges.index')
                ->with('success', 'تم إنشاء التحدي بنجاح');
        } catch (\Exception $e) {
            Log::error('Error creating admin challenge: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
            ]);

            return back()
                ->withErrors(['error' => 'حدث خطأ أثناء إنشاء التحدي: ' . $e->getMessage()])
                ->withInput();
        }
    }

    /**
     * عرض تفاصيل تحدٍ
     */
    public function show(Challenge $challenge)
    {
        $challenge->load(['school:id,name,email', 'creator:id,name,email']);

        return Inertia::render('Admin/Challenges/Show', [
            'challenge' => [
                'id' => $challenge->id,
                'title' => $challenge->title,
                'objective' => $challenge->objective,
                'description' => $challenge->description,
                'instructions' => $challenge->instructions,
                'challenge_type' => $challenge->challenge_type,
                'challenge_type_label' => $challenge->challenge_type_label,
                'category' => $challenge->category,
                'age_group' => $challenge->age_group,
                'status' => $challenge->status,
                'school_id' => $challenge->school_id,
                'school' => $challenge->school ? [
                    'id' => $challenge->school->id,
                    'name' => $challenge->school->name,
                    'email' => $challenge->school->email,
                ] : null,
                'creator' => [
                    'id' => $challenge->creator->id ?? null,
                    'name' => $challenge->creator->name ?? 'غير معروف',
                    'email' => $challenge->creator->email ?? '—',
                ],
                'start_date' => $challenge->start_date->format('Y-m-d\TH:i'),
                'deadline' => $challenge->deadline->format('Y-m-d\TH:i'),
                'points_reward' => $challenge->points_reward ?? 0,
                'badges_reward' => $challenge->badges_reward ?? [],
                'max_participants' => $challenge->max_participants,
                'current_participants' => $challenge->current_participants ?? 0,
                'created_at' => $challenge->created_at->format('Y-m-d H:i'),
                'updated_at' => $challenge->updated_at->format('Y-m-d H:i'),
            ],
        ]);
    }

    /**
     * عرض نموذج تعديل تحدٍ
     */
    public function edit(Challenge $challenge)
    {
        $schools = User::where('role', 'school')
            ->select('id', 'name')
            ->orderBy('name')
            ->get();

        return Inertia::render('Admin/Challenges/Edit', [
            'challenge' => [
                'id' => $challenge->id,
                'title' => $challenge->title,
                'objective' => $challenge->objective,
                'description' => $challenge->description,
                'instructions' => $challenge->instructions,
                'challenge_type' => $challenge->challenge_type,
                'category' => $challenge->category,
                'age_group' => $challenge->age_group,
                'status' => $challenge->status,
                'school_id' => $challenge->school_id,
                'start_date' => $challenge->start_date->format('Y-m-d\TH:i'),
                'deadline' => $challenge->deadline->format('Y-m-d\TH:i'),
                'points_reward' => $challenge->points_reward ?? 0,
                'max_participants' => $challenge->max_participants,
            ],
            'schools' => $schools,
        ]);
    }

    /**
     * تحديث تحدٍ
     */
    public function update(UpdateChallengeRequest $request, Challenge $challenge)
    {
        $data = $request->validated();
        
        // Convert date strings to datetime
        if (isset($data['start_date']) && !str_contains($data['start_date'], ' ')) {
            $data['start_date'] = $data['start_date'] . ' 00:00:00';
        }
        if (isset($data['deadline']) && !str_contains($data['deadline'], ' ')) {
            $data['deadline'] = $data['deadline'] . ' 23:59:59';
        }
        
        // Convert max_participants to null if empty
        if (isset($data['max_participants']) && $data['max_participants'] === '') {
            $data['max_participants'] = null;
        }

        try {
            // Use ChallengeService to ensure cache is cleared properly
            $this->challengeService->updateChallenge($challenge, $data);
            $challenge->refresh();

            return redirect()
                ->route('admin.challenges.index')
                ->with('success', 'تم تحديث التحدي بنجاح');
        } catch (\Exception $e) {
            Log::error('Error updating admin challenge: ' . $e->getMessage(), [
                'challenge_id' => $challenge->id,
                'trace' => $e->getTraceAsString(),
            ]);

            return back()
                ->withErrors(['error' => 'حدث خطأ أثناء تحديث التحدي: ' . $e->getMessage()])
                ->withInput();
        }
    }

    /**
     * حذف تحدٍ
     */
    public function destroy(Challenge $challenge)
    {
        try {
            $schoolId = $challenge->school_id;
            $createdBy = $challenge->created_by;
            
            // Use ChallengeService to ensure cache is cleared properly
            $this->challengeService->deleteChallenge($challenge);

            return redirect()
                ->route('admin.challenges.index')
                ->with('success', 'تم حذف التحدي بنجاح');
        } catch (\Exception $e) {
            Log::error('Error deleting admin challenge: ' . $e->getMessage(), [
                'challenge_id' => $challenge->id,
                'trace' => $e->getTraceAsString(),
            ]);

            return back()
                ->withErrors(['error' => 'حدث خطأ أثناء حذف التحدي: ' . $e->getMessage()]);
        }
    }
}
