<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ChallengeSuggestion;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminChallengeSuggestionController extends Controller
{
    public function index(Request $request): Response
    {
        $query = ChallengeSuggestion::query()
            ->with(['student:id,name,email', 'school:id,name', 'reviewer:id,name'])
            ->latest();

        if ($request->filled('status')) {
            $query->where('status', $request->string('status'));
        }

        $suggestions = $query->paginate(20)->withQueryString();

        $stats = [
            'total' => ChallengeSuggestion::count(),
            'pending' => ChallengeSuggestion::where('status', 'pending')->count(),
            'under_review' => ChallengeSuggestion::where('status', 'under_review')->count(),
            'approved' => ChallengeSuggestion::where('status', 'approved')->count(),
            'rejected' => ChallengeSuggestion::where('status', 'rejected')->count(),
        ];

        return Inertia::render('Admin/ChallengeSuggestions/Index', [
            'suggestions' => $suggestions,
            'stats' => $stats,
            'filters' => [
                'status' => $request->get('status', ''),
            ],
        ]);
    }

    public function updateStatus(Request $request, ChallengeSuggestion $challengeSuggestion): RedirectResponse
    {
        $validated = $request->validate([
            'status' => ['required', 'in:under_review,approved,rejected'],
            'review_notes' => ['nullable', 'string', 'max:2000'],
        ]);

        $challengeSuggestion->update([
            'status' => $validated['status'],
            'review_notes' => $validated['review_notes'] ?? null,
            'reviewed_by' => auth()->id(),
            'reviewed_at' => now(),
        ]);

        return back()->with('success', 'Suggestion status updated.');
    }
}
