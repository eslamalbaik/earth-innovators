<?php

namespace App\Http\Controllers\School;

use App\Http\Controllers\Controller;
use App\Models\Initiative;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

/**
 * A school manages its own initiatives (discounts, trips, events) for its
 * own students/teachers only — requirement 7.3. Scoped strictly to
 * school_id = the authenticated school's id; a school can never see or
 * touch another school's initiatives or the global ones (those are
 * admin-only, see Admin\InitiativeController).
 */
class SchoolInitiativeController extends Controller
{
    public function index(): Response
    {
        $school = Auth::user();

        return Inertia::render('School/Initiatives/Index', [
            'initiatives' => Initiative::forSchool($school->id)->latest()->get(),
        ]);
    }

    public function store(Request $request)
    {
        Initiative::create($this->payload($request) + [
            'school_id' => Auth::id(),
            'created_by' => Auth::id(),
        ]);

        return back()->with('flash', ['success' => true]);
    }

    public function update(Request $request, Initiative $initiative)
    {
        abort_unless($initiative->school_id === Auth::id(), 403);

        $initiative->update($this->payload($request));

        return back()->with('flash', ['success' => true]);
    }

    public function destroy(Initiative $initiative)
    {
        abort_unless($initiative->school_id === Auth::id(), 403);

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
