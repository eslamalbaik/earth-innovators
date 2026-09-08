<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AiAppeal;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class AiAppealController extends Controller
{
    public function index(): Response
    {
        $appeals = AiAppeal::with(['user:id,name,email', 'resolver:id,name'])
            ->orderByRaw("status = 'pending' desc")
            ->latest()
            ->paginate(20);

        return Inertia::render('Admin/AiEthics/Appeals', [
            'appeals' => $appeals,
        ]);
    }

    public function resolve(Request $request, AiAppeal $appeal): RedirectResponse
    {
        $validated = $request->validate([
            'status' => 'required|in:reviewing,resolved,rejected',
            'resolution_notes' => 'nullable|string|max:2000',
        ]);

        $appeal->update([
            'status' => $validated['status'],
            'resolution_notes' => $validated['resolution_notes'] ?? null,
            'resolved_by' => $request->user()->id,
            'resolved_at' => in_array($validated['status'], ['resolved', 'rejected'], true) ? now() : null,
        ]);

        return back()->with('success', 'تم تحديث حالة الاعتراض.');
    }
}
