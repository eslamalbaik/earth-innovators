<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreRewardFormRequest;
use App\Models\StoreReward;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class StoreRewardController extends Controller
{
    public function index(): Response
    {
        $rewards = StoreReward::query()
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get()
            ->map(fn (StoreReward $r) => [
                'id' => $r->id,
                'slug' => $r->slug,
                'name_en' => $r->name_en,
                'name_ar' => $r->name_ar,
                'icon' => $r->icon,
                'points_cost' => $r->points_cost,
                'is_active' => $r->is_active,
                'sort_order' => $r->sort_order,
                'requires_manual_approval' => $r->requires_manual_approval,
            ]);

        return Inertia::render('Admin/StoreRewards/Index', [
            'rewards' => $rewards,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/StoreRewards/Create');
    }

    public function store(StoreRewardFormRequest $request): RedirectResponse
    {
        StoreReward::create($request->validated());

        return redirect()
            ->route('admin.store-rewards.index')
            ->with('success', __('adminStoreRewards.flash.created'));
    }

    public function edit(StoreReward $store_reward): Response
    {
        return Inertia::render('Admin/StoreRewards/Edit', [
            'reward' => [
                'id' => $store_reward->id,
                'slug' => $store_reward->slug,
                'name_en' => $store_reward->name_en,
                'name_ar' => $store_reward->name_ar,
                'icon' => $store_reward->icon,
                'points_cost' => $store_reward->points_cost,
                'is_active' => $store_reward->is_active,
                'sort_order' => $store_reward->sort_order,
                'requires_manual_approval' => $store_reward->requires_manual_approval,
            ],
        ]);
    }

    public function update(StoreRewardFormRequest $request, StoreReward $store_reward): RedirectResponse
    {
        $store_reward->update($request->validated());

        return redirect()
            ->route('admin.store-rewards.index')
            ->with('success', __('adminStoreRewards.flash.updated'));
    }

    public function destroy(StoreReward $store_reward): RedirectResponse
    {
        if ($store_reward->requests()->exists()) {
            return redirect()
                ->route('admin.store-rewards.index')
                ->with('error', __('adminStoreRewards.flash.deleteBlocked'));
        }

        $store_reward->delete();

        return redirect()
            ->route('admin.store-rewards.index')
            ->with('success', __('adminStoreRewards.flash.deleted'));
    }
}
