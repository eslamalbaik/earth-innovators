<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\StoreRewardRequest;
use App\Services\StoreRewardService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StoreRewardRequestController extends Controller
{
    public function __construct(
        private StoreRewardService $storeRewardService
    ) {}

    public function index(Request $request): Response
    {
        $status = $request->get('status', 'pending');

        $query = StoreRewardRequest::query()
            ->with(['user:id,name,email', 'storeReward:id,slug,name_en,name_ar', 'processedBy:id,name'])
            ->orderByDesc('created_at');

        if (in_array($status, ['pending', 'approved', 'rejected'], true)) {
            $query->where('status', $status);
        }

        $paginator = $query->paginate(20);
        $paginator->setCollection(
            $paginator->getCollection()->map(fn (StoreRewardRequest $r) => [
                'id' => $r->id,
                'status' => $r->status,
                'points_cost' => $r->points_cost,
                'created_at' => $r->created_at->format('Y-m-d H:i'),
                'processed_at' => $r->processed_at?->format('Y-m-d H:i'),
                'admin_note' => $r->admin_note,
                'student' => [
                    'id' => $r->user?->id,
                    'name' => $r->user?->name,
                    'email' => $r->user?->email,
                ],
                'reward' => [
                    'slug' => $r->storeReward?->slug,
                    'name_en' => $r->storeReward?->name_en,
                    'name_ar' => $r->storeReward?->name_ar,
                ],
                'processed_by' => $r->processedBy?->name,
            ])
        );
        $requests = $paginator;

        return Inertia::render('Admin/StoreRewardRequests/Index', [
            'requests' => $requests,
            'filters' => ['status' => $status],
        ]);
    }

    public function approve(Request $request, StoreRewardRequest $store_reward_request): RedirectResponse
    {
        $result = $this->storeRewardService->approveRequest($store_reward_request, $request->user());

        if (! $result['success']) {
            return redirect()
                ->back()
                ->with('error', __($result['message_key']));
        }

        return redirect()
            ->back()
            ->with('success', __($result['message_key']));
    }

    public function reject(Request $request, StoreRewardRequest $store_reward_request): RedirectResponse
    {
        $validated = $request->validate([
            'admin_note' => 'nullable|string|max:2000',
        ]);

        $result = $this->storeRewardService->rejectRequest(
            $store_reward_request,
            $request->user(),
            $validated['admin_note'] ?? null
        );

        if (! $result['success']) {
            return redirect()
                ->back()
                ->with('error', __($result['message_key']));
        }

        return redirect()
            ->back()
            ->with('success', __($result['message_key']));
    }
}
