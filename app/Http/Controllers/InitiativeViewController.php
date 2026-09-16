<?php

namespace App\Http\Controllers;

use App\Models\Initiative;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Read-only initiatives feed for students/teachers — clearly separates
 * "my school's initiatives" from "global initiatives" (requirement 7.3),
 * never merges them into one undifferentiated list.
 */
class InitiativeViewController extends Controller
{
    public function index(): Response
    {
        $user = Auth::user();

        $schoolInitiatives = collect();
        if ($user->school_id) {
            $schoolInitiatives = Initiative::forSchool($user->school_id)
                ->active()
                ->forAudience($user->role)
                ->latest()
                ->get();
        }

        $globalInitiatives = Initiative::global()
            ->active()
            ->forAudience($user->role)
            ->latest()
            ->get();

        return Inertia::render('Initiatives/Index', [
            'schoolInitiatives' => $schoolInitiatives,
            'globalInitiatives' => $globalInitiatives,
        ]);
    }
}
