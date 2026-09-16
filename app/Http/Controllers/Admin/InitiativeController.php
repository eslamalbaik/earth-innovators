<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Initiative;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Admin management of GLOBAL initiatives (school_id null) — visible to
 * every school's users, distinct from each school's own initiatives
 * (App\Http\Controllers\School\SchoolInitiativeController). Requirement 7.3.
 */
class InitiativeController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/Initiatives/Index', [
            'initiatives' => Initiative::global()->latest()->get(),
        ]);
    }

    public function store(Request $request)
    {
        Initiative::create($this->payload($request) + [
            'school_id' => null,
            'created_by' => Auth::id(),
        ]);

        return back()->with('flash', ['success' => true]);
    }

    public function update(Request $request, Initiative $initiative)
    {
        abort_unless($initiative->school_id === null, 403);

        $initiative->update($this->payload($request));

        return back()->with('flash', ['success' => true]);
    }

    public function destroy(Initiative $initiative)
    {
        abort_unless($initiative->school_id === null, 403);

        $initiative->delete();

        return back()->with('flash', ['success' => true]);
    }

    private function payload(Request $request): array
    {
        return $request->validate([
            'title_ar'         => 'required|string|max:255',
            'title_en'         => 'nullable|string|max:255',
            'description_ar'   => 'nullable|string',
            'description_en'   => 'nullable|string',
            'audience'         => 'required|in:students,teachers,both',
            'start_date'       => 'nullable|date',
            'end_date'         => 'nullable|date|after_or_equal:start_date',
            'benefit_details'  => 'nullable|string',
            'is_active'        => 'boolean',
        ]);
    }
}
