<?php

namespace App\Http\Controllers;

use App\Models\AiAppeal;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;

class AiAppealController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'feature' => 'required|string|max:100',
            'subject_type' => 'nullable|string|max:100',
            'subject_id' => 'nullable|integer',
            'reason' => 'required|string|min:10|max:2000',
        ]);

        AiAppeal::create([
            'user_id' => $request->user()->id,
            'feature' => $validated['feature'],
            'subject_type' => $validated['subject_type'] ?? null,
            'subject_id' => $validated['subject_id'] ?? null,
            'reason' => $validated['reason'],
            'status' => 'pending',
        ]);

        return back()->with('success', 'تم استلام اعتراضك وسيقوم فريقنا بمراجعته يدويًا.');
    }
}
