<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\ChallengeSuggestion;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StudentChallengeSuggestionController extends Controller
{
    public function create(): Response
    {
        $user = auth()->user();

        if (!$user || !$user->isStudent()) {
            abort(403);
        }

        return Inertia::render('Student/ChallengeSuggestions/Create', [
            'initialIdea' => (string) request()->query('idea', ''),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $user = auth()->user();

        if (!$user || !$user->isStudent()) {
            abort(403);
        }

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:150'],
            'description' => ['required', 'string', 'max:3000'],
            'category' => ['nullable', 'string', 'max:100'],
        ]);

        ChallengeSuggestion::create([
            'student_id' => $user->id,
            'school_id' => $user->school_id,
            'title' => $validated['title'],
            'description' => $validated['description'],
            'category' => $validated['category'] ?? null,
            'status' => 'pending',
        ]);

        return redirect()
            ->route('student.challenges.index')
            ->with('success', 'Challenge suggestion sent successfully.');
    }
}
