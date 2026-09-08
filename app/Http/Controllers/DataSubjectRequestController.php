<?php

namespace App\Http\Controllers;

use App\Models\DataSubjectRequest;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class DataSubjectRequestController extends Controller
{
    public function index(Request $request): Response
    {
        return Inertia::render('Privacy/MyData', [
            'requests' => $request->user()->dataSubjectRequests()->latest()->get(),
            'consentAt' => $request->user()->consent_ai_processing_at,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'type' => 'required|in:access,correction,deletion',
            'details' => 'nullable|string|max:2000',
        ]);

        DataSubjectRequest::create([
            'user_id' => $request->user()->id,
            'type' => $validated['type'],
            'details' => $validated['details'] ?? null,
            'status' => 'pending',
        ]);

        return back()->with('success', 'تم استلام طلبك وسيتم التعامل معه خلال المدة القانونية المحددة.');
    }
}
