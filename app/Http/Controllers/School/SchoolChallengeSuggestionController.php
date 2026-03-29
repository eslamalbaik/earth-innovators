<?php

namespace App\Http\Controllers\School;

use App\Http\Controllers\Controller;
use App\Models\ChallengeSuggestion;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SchoolChallengeSuggestionController extends Controller
{
    public function index(Request $request): Response
    {
        $user = auth()->user();
        $query = ChallengeSuggestion::query()
            ->with(['student:id,name,email', 'reviewer:id,name'])
            ->latest();

        if ($user->canAccessAllSchoolData()) {
            $query->whereNotNull('school_id');
        } else {
            $query->where('school_id', $user->id);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->string('status'));
        }

        $suggestions = $query->paginate(15)->withQueryString();

        $baseStatsQuery = ChallengeSuggestion::query();
        if ($user->canAccessAllSchoolData()) {
            $baseStatsQuery->whereNotNull('school_id');
        } else {
            $baseStatsQuery->where('school_id', $user->id);
        }

        $stats = [
            'total' => (clone $baseStatsQuery)->count(),
            'pending' => (clone $baseStatsQuery)->where('status', 'pending')->count(),
            'under_review' => (clone $baseStatsQuery)->where('status', 'under_review')->count(),
            'approved' => (clone $baseStatsQuery)->where('status', 'approved')->count(),
            'rejected' => (clone $baseStatsQuery)->where('status', 'rejected')->count(),
        ];

        return Inertia::render('School/ChallengeSuggestions/Index', [
            'suggestions' => $suggestions,
            'stats' => $stats,
            'filters' => [
                'status' => $request->get('status', ''),
            ],
        ]);
    }

    public function updateStatus(Request $request, ChallengeSuggestion $challengeSuggestion): RedirectResponse
    {
        $user = auth()->user();

        if (!$user->canAccessAllSchoolData() && $challengeSuggestion->school_id !== $user->id) {
            abort(403);
        }

        $validated = $request->validate([
            'status' => ['required', 'in:under_review,approved,rejected'],
            'review_notes' => ['nullable', 'string', 'max:2000'],
        ]);

        $challengeSuggestion->update([
            'status' => $validated['status'],
            'review_notes' => $validated['review_notes'] ?? null,
            'reviewed_by' => $user->id,
            'reviewed_at' => now(),
        ]);

        return back()->with('success', 'Suggestion status updated.');
    }
}
