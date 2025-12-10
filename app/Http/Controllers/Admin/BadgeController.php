<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Badge\StoreBadgeRequest;
use App\Http\Requests\Badge\UpdateBadgeRequest;
use App\Http\Requests\Badge\AwardBadgeRequest;
use App\Models\Badge;
use App\Services\BadgeService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BadgeController extends Controller
{
    public function __construct(
        private BadgeService $badgeService
    ) {}

    public function index(Request $request)
    {
        $badges = $this->badgeService->getAllBadges(
            $request->get('search'),
            20,
            $request->get('status'),
            $request->get('type')
        );

        $stats = $this->badgeService->getBadgeStats();

        return Inertia::render('Admin/Badges/Index', [
            'badges' => $badges,
            'stats' => $stats,
            'filters' => [
                'search' => $request->get('search'),
                'status' => $request->get('status'),
                'type' => $request->get('type'),
            ],
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Badges/Create');
    }

    public function store(StoreBadgeRequest $request)
    {
        $this->badgeService->createBadge($request->validated());

        return redirect()->route('admin.badges.index')
            ->with('success', 'تم إنشاء الشارة بنجاح');
    }

    public function edit(Badge $badge)
    {
        return Inertia::render('Admin/Badges/Edit', [
            'badge' => $badge,
        ]);
    }

    public function update(UpdateBadgeRequest $request, Badge $badge)
    {
        $this->badgeService->updateBadge($badge, $request->validated());

        return redirect()->route('admin.badges.index')
            ->with('success', 'تم تحديث الشارة بنجاح');
    }

    public function destroy(Badge $badge)
    {
        $this->badgeService->deleteBadge($badge);

        return redirect()->route('admin.badges.index')
            ->with('success', 'تم حذف الشارة بنجاح');
    }

    public function award(AwardBadgeRequest $request, Badge $badge)
    {
        $validated = $request->validated();

        $this->badgeService->awardBadge(
            $validated['user_id'],
            $badge->id,
            $validated['project_id'] ?? null,
            $validated['challenge_id'] ?? null,
            $validated['reason'] ?? null,
            auth()->id()
        );

        return redirect()->back()
            ->with('success', 'تم منح الشارة بنجاح');
    }
}
