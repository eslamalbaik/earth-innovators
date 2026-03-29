<?php

namespace App\Services;

use App\Models\Project;
use App\Models\StoreReward;
use App\Models\StoreRewardRequest;
use App\Models\User;
use App\Notifications\StoreRewardPendingApprovalNotification;
use Illuminate\Support\Facades\DB;

class StoreRewardService extends BaseService
{
    public function __construct(
        private PointsService $pointsService
    ) {}

    public function usesDatabaseRewards(): bool
    {
        return StoreReward::query()->exists();
    }

    /**
     * @return array<int, array{id: string, name: string, icon: string, points: int, status: string, statusText: string|null, requires_manual_approval: bool}>
     */
    public function getRedeemableItemsForUser(?User $user): array
    {
        $balance = $user ? (int) ($user->points ?? 0) : 0;

        if ($this->usesDatabaseRewards()) {
            return $this->mapDatabaseRewardsToItems($balance);
        }

        return $this->mapConfigRewardsToItems($balance);
    }

    private function mapDatabaseRewardsToItems(int $balance): array
    {
        $locale = app()->getLocale();

        return StoreReward::query()
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get()
            ->map(function (StoreReward $row) use ($balance, $locale) {
                $cost = (int) $row->points_cost;
                if ($cost <= 0) {
                    return null;
                }

                $name = $locale === 'ar' ? $row->name_ar : $row->name_en;
                $status = 'available';
                $statusText = null;

                if ($balance < $cost) {
                    $status = 'insufficient';
                    $statusText = __('storeMembershipPage.itemStatuses.almostThere');
                }

                return [
                    'id' => $row->slug,
                    'name' => $name,
                    'icon' => $row->icon ?? '🎁',
                    'points' => $cost,
                    'status' => $status,
                    'statusText' => $statusText,
                    'requires_manual_approval' => (bool) $row->requires_manual_approval,
                ];
            })
            ->filter()
            ->values()
            ->all();
    }

    private function mapConfigRewardsToItems(int $balance): array
    {
        $items = collect(config('store_rewards.items', []))
            ->filter(fn ($row) => ($row['active'] ?? true) === true)
            ->sortBy('sort')
            ->values();

        return $items->map(function (array $row) use ($balance) {
            $cost = (int) ($row['points'] ?? 0);
            $id = (string) ($row['id'] ?? '');
            $nameKey = $row['name_key'] ?? '';
            $name = $nameKey ? trans($nameKey) : ($row['name'] ?? $id);

            if ($cost <= 0) {
                return null;
            }

            $status = 'available';
            $statusText = null;

            if ($balance < $cost) {
                $status = 'insufficient';
                $statusText = __('storeMembershipPage.itemStatuses.almostThere');
            }

            return [
                'id' => $id,
                'name' => $name,
                'icon' => $row['icon'] ?? '🎁',
                'points' => $cost,
                'status' => $status,
                'statusText' => $statusText,
                'requires_manual_approval' => (bool) ($row['requires_manual_approval'] ?? false),
            ];
        })->filter()->values()->all();
    }

    public function countRedemptionsThisWeek(int $userId): int
    {
        $points = \App\Models\Point::query()
            ->where('user_id', $userId)
            ->where('type', 'redeemed')
            ->where('source', 'store_reward')
            ->where('created_at', '>=', now()->subDays(7))
            ->count();

        if ($this->usesDatabaseRewards()) {
            $pending = StoreRewardRequest::query()
                ->where('user_id', $userId)
                ->where('status', 'pending')
                ->where('created_at', '>=', now()->subDays(7))
                ->count();

            return $points + $pending;
        }

        return $points;
    }

    /**
     * @return array{success: bool, message?: string, message_key?: string, balance?: int, points_spent?: int, pending_approval?: bool}
     */
    public function redeem(User $user, string $rewardId): array
    {
        $weeklyLimit = (int) config('store_rewards.weekly_redemption_limit', 1);
        if ($weeklyLimit > 0 && $this->countRedemptionsThisWeek($user->id) >= $weeklyLimit) {
            return ['success' => false, 'message_key' => 'toastMessages.storeRewardWeeklyLimit'];
        }

        if ($this->usesDatabaseRewards()) {
            return $this->redeemFromDatabase($user, $rewardId);
        }

        return $this->redeemFromConfig($user, $rewardId);
    }

    private function redeemFromDatabase(User $user, string $rewardId): array
    {
        $reward = StoreReward::query()->where('slug', $rewardId)->where('is_active', true)->first();
        if (! $reward) {
            return ['success' => false, 'message_key' => 'toastMessages.storeRewardInvalid'];
        }

        $cost = (int) $reward->points_cost;
        if ($cost <= 0) {
            return ['success' => false, 'message_key' => 'toastMessages.storeRewardInvalid'];
        }

        if ((int) ($user->points ?? 0) < $cost) {
            return ['success' => false, 'message_key' => 'toastMessages.storeRewardInsufficientPoints'];
        }

        if ($reward->requires_manual_approval) {
            return $this->createPendingRequest($user, $reward, $cost);
        }

        $labelEn = $reward->name_en;
        $labelAr = $reward->name_ar;

        try {
            $this->pointsService->redeemStorePoints(
                $user->id,
                $cost,
                $rewardId,
                $labelEn,
                $labelAr,
                null
            );
        } catch (\Throwable $e) {
            return ['success' => false, 'message_key' => 'toastMessages.storeRewardError'];
        }

        $user->refresh();

        return [
            'success' => true,
            'balance' => (int) ($user->points ?? 0),
            'message_key' => 'toastMessages.storeRewardSuccess',
            'points_spent' => $cost,
            'pending_approval' => false,
        ];
    }

    /**
     * @return array{success: bool, message_key?: string, balance?: int, points_spent?: int, pending_approval?: bool}
     */
    private function createPendingRequest(User $user, StoreReward $reward, int $cost): array
    {
        try {
            $request = DB::transaction(function () use ($user, $reward, $cost) {
                return StoreRewardRequest::create([
                    'user_id' => $user->id,
                    'store_reward_id' => $reward->id,
                    'status' => 'pending',
                    'points_cost' => $cost,
                ]);
            });
        } catch (\Throwable $e) {
            return ['success' => false, 'message_key' => 'toastMessages.storeRewardError'];
        }

        $this->notifyStakeholders($user, $reward, $request);

        return [
            'success' => true,
            'balance' => (int) ($user->points ?? 0),
            'message_key' => 'toastMessages.storeRewardPendingApproval',
            'points_spent' => 0,
            'pending_approval' => true,
        ];
    }

    private function notifyStakeholders(User $student, StoreReward $reward, StoreRewardRequest $request): void
    {
        $notifiedIds = [];

        if ($student->school_id) {
            $school = User::query()->find($student->school_id);
            if ($school && $school->isSchool()) {
                $school->notify(new StoreRewardPendingApprovalNotification($request, $student, $reward));
                $notifiedIds[] = (int) $school->id;
            }
        }

        $project = Project::query()
            ->where('user_id', $student->id)
            ->whereNotNull('teacher_id')
            ->latest('updated_at')
            ->first();

        if ($project && $project->teacher && $project->teacher->user) {
            $teacherUser = $project->teacher->user;
            if (! in_array((int) $teacherUser->id, $notifiedIds, true)) {
                $teacherUser->notify(new StoreRewardPendingApprovalNotification($request, $student, $reward));
            }
        }
    }

    private function redeemFromConfig(User $user, string $rewardId): array
    {
        $items = collect(config('store_rewards.items', []));
        $reward = $items->firstWhere('id', $rewardId);
        if (! $reward || ! ($reward['active'] ?? true)) {
            return ['success' => false, 'message_key' => 'toastMessages.storeRewardInvalid'];
        }

        $cost = (int) ($reward['points'] ?? 0);
        if ($cost <= 0) {
            return ['success' => false, 'message_key' => 'toastMessages.storeRewardInvalid'];
        }

        if ((int) ($user->points ?? 0) < $cost) {
            return ['success' => false, 'message_key' => 'toastMessages.storeRewardInsufficientPoints'];
        }

        if ($reward['requires_manual_approval'] ?? false) {
            return ['success' => false, 'message_key' => 'toastMessages.storeRewardInvalid'];
        }

        $nameKey = $reward['name_key'] ?? '';
        $labelEn = $nameKey ? trans($nameKey, [], 'en') : $rewardId;
        $labelAr = $nameKey ? trans($nameKey, [], 'ar') : $rewardId;

        try {
            $this->pointsService->redeemStorePoints(
                $user->id,
                $cost,
                $rewardId,
                $labelEn,
                $labelAr,
                null
            );
        } catch (\Throwable $e) {
            return ['success' => false, 'message_key' => 'toastMessages.storeRewardError'];
        }

        $user->refresh();

        return [
            'success' => true,
            'balance' => (int) ($user->points ?? 0),
            'message_key' => 'toastMessages.storeRewardSuccess',
            'points_spent' => $cost,
            'pending_approval' => false,
        ];
    }

    /**
     * @return array{success: bool, message_key?: string}
     */
    public function approveRequest(StoreRewardRequest $request, User $admin): array
    {
        if ($request->status !== 'pending') {
            return ['success' => false, 'message_key' => 'adminStoreRewardRequests.notPending'];
        }

        $reward = $request->storeReward;
        $user = $request->user;
        if (! $reward || ! $user) {
            return ['success' => false, 'message_key' => 'adminStoreRewardRequests.invalid'];
        }

        $cost = (int) $request->points_cost;

        try {
            DB::transaction(function () use ($request, $user, $reward, $cost, $admin) {
                $locked = User::query()->lockForUpdate()->findOrFail($user->id);
                if ((int) ($locked->points ?? 0) < $cost) {
                    throw new \RuntimeException('INSUFFICIENT_POINTS');
                }

                $this->pointsService->redeemStorePoints(
                    $user->id,
                    $cost,
                    $reward->slug,
                    $reward->name_en,
                    $reward->name_ar,
                    (int) $request->id
                );

                $request->update([
                    'status' => 'approved',
                    'processed_at' => now(),
                    'processed_by_user_id' => $admin->id,
                ]);
            });
        } catch (\RuntimeException $e) {
            if ($e->getMessage() === 'INSUFFICIENT_POINTS') {
                return ['success' => false, 'message_key' => 'adminStoreRewardRequests.insufficientUserPoints'];
            }
            throw $e;
        } catch (\Throwable $e) {
            return ['success' => false, 'message_key' => 'toastMessages.storeRewardError'];
        }

        return ['success' => true, 'message_key' => 'adminStoreRewardRequests.approved'];
    }

    /**
     * @return array{success: bool, message_key?: string}
     */
    public function rejectRequest(StoreRewardRequest $request, User $admin, ?string $note = null): array
    {
        if ($request->status !== 'pending') {
            return ['success' => false, 'message_key' => 'adminStoreRewardRequests.notPending'];
        }

        $request->update([
            'status' => 'rejected',
            'processed_at' => now(),
            'processed_by_user_id' => $admin->id,
            'admin_note' => $note,
        ]);

        return ['success' => true, 'message_key' => 'adminStoreRewardRequests.rejected'];
    }
}
