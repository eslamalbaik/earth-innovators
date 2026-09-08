<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\DataSubjectRequest;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class DataSubjectRequestController extends Controller
{
    public function index(): Response
    {
        $requests = DataSubjectRequest::with(['user:id,name,email,role', 'handler:id,name'])
            ->orderByRaw("status = 'pending' desc")
            ->latest()
            ->paginate(20);

        return Inertia::render('Admin/AiEthics/DataRequests', [
            'requests' => $requests,
        ]);
    }

    public function resolve(Request $request, DataSubjectRequest $dataSubjectRequest): RedirectResponse
    {
        $validated = $request->validate([
            'status' => 'required|in:processing,completed,rejected',
            'resolution_notes' => 'nullable|string|max:2000',
        ]);

        $dataSubjectRequest->update([
            'status' => $validated['status'],
            'resolution_notes' => $validated['resolution_notes'] ?? null,
            'handled_by' => $request->user()->id,
            'resolved_at' => in_array($validated['status'], ['completed', 'rejected'], true) ? now() : null,
        ]);

        return back()->with('success', 'تم تحديث حالة الطلب.');
    }
}
