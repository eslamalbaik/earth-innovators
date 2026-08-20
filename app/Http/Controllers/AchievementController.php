<?php

namespace App\Http\Controllers;

use App\Models\Achievement;
use App\Services\AchievementService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class AchievementController extends Controller
{
    public function __construct(
        private AchievementService $achievementService,
    ) {}

    /**
     * Display a listing of achievements
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $type = $request->get('type');
        $status = $request->get('status');

        $achievements = $this->achievementService->getForUser($user, $type, $status);
        $statistics = $this->achievementService->getStatistics($user);

        return Inertia::render('Achievements/Index', [
            'achievements' => $achievements,
            'statistics'   => $statistics,
            'types'        => Achievement::TYPE_LABELS,
            'filters'      => [
                'type'   => $type,
                'status' => $status,
            ],
        ]);
    }

    /**
     * Show form for creating a new achievement
     */
    public function create(): Response
    {
        return Inertia::render('Achievements/Create', [
            'types' => Achievement::TYPE_LABELS,
        ]);
    }

    /**
     * Store a new achievement
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title'          => 'required|string|max:255',
            'description'    => 'nullable|string|max:5000',
            'type'           => 'required|in:' . implode(',', Achievement::TYPES),
            'category'       => 'nullable|string|max:100',
            'date'           => 'nullable|date',
            'external_links' => 'nullable|array',
            'external_links.*' => 'url',
            'attachments'    => 'nullable|array',
            'attachments.*'  => 'file|max:20480', // 20MB max
            'urls'           => 'nullable|array',
            'urls.*'         => 'url',
        ]);

        $achievement = $this->achievementService->create($request->user(), $validated);

        return redirect()
            ->route('innovation.achievements.show', $achievement)
            ->with('success', __('messages.msg_001'));
    }

    /**
     * Display a specific achievement
     */
    public function show(Achievement $achievement): Response
    {
        Gate::authorize('view', $achievement);

        $achievement->load('attachments', 'skills', 'user');

        return Inertia::render('Achievements/Show', [
            'achievement' => $achievement,
        ]);
    }

    /**
     * Show form for editing an achievement
     */
    public function edit(Achievement $achievement): Response
    {
        Gate::authorize('update', $achievement);

        $achievement->load('attachments');

        return Inertia::render('Achievements/Edit', [
            'achievement' => $achievement,
            'types'       => Achievement::TYPE_LABELS,
        ]);
    }

    /**
     * Update an achievement
     */
    public function update(Request $request, Achievement $achievement)
    {
        Gate::authorize('update', $achievement);

        $validated = $request->validate([
            'title'          => 'sometimes|string|max:255',
            'description'    => 'nullable|string|max:5000',
            'type'           => 'sometimes|in:' . implode(',', Achievement::TYPES),
            'category'       => 'nullable|string|max:100',
            'date'           => 'nullable|date',
            'external_links' => 'nullable|array',
            'attachments'    => 'nullable|array',
            'attachments.*'  => 'file|max:20480',
        ]);

        $this->achievementService->update($achievement, $validated);

        return redirect()
            ->route('innovation.achievements.show', $achievement)
            ->with('success', __('messages.msg_002'));
    }

    /**
     * Delete an achievement
     */
    public function destroy(Achievement $achievement)
    {
        Gate::authorize('delete', $achievement);

        $this->achievementService->delete($achievement);

        return redirect()
            ->route('innovation.achievements.index')
            ->with('success', __('messages.msg_003'));
    }

    /**
     * Upload additional attachments
     */
    public function uploadAttachment(Request $request, Achievement $achievement)
    {
        Gate::authorize('update', $achievement);

        $request->validate([
            'file' => 'required|file|max:20480',
        ]);

        $attachment = $this->achievementService->uploadAttachment($achievement, $request->file('file'));

        return back()->with('success', __('messages.msg_004'));
    }
}
