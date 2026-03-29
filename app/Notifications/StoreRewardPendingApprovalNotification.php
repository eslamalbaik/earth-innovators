<?php

namespace App\Notifications;

use App\Models\StoreReward;
use App\Models\StoreRewardRequest;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Notifications\Notification;

class StoreRewardPendingApprovalNotification extends Notification implements ShouldBroadcast
{
    use Queueable;

    public function __construct(
        public StoreRewardRequest $storeRewardRequest,
        public User $student,
        public StoreReward $storeReward
    ) {}

    public function via(object $notifiable): array
    {
        return ['database', 'broadcast'];
    }

    public function toBroadcast(object $notifiable): array
    {
        return [
            'id' => $this->id,
            'type' => 'store_reward_pending',
            'data' => $this->toArray($notifiable),
            'read_at' => null,
            'created_at' => now()->toIso8601String(),
        ];
    }

    public function toArray(object $notifiable): array
    {
        $studentName = $this->student->name ?? '';
        $rewardEn = $this->storeReward->name_en;
        $rewardAr = $this->storeReward->name_ar;
        $points = $this->storeRewardRequest->points_cost;

        $messageEn = __('notifications.storeRewardPendingApproval.line_en', [
            'student' => $studentName,
            'reward' => $rewardEn,
            'points' => $points,
        ]);
        $messageAr = __('notifications.storeRewardPendingApproval.line_ar', [
            'student' => $studentName,
            'reward' => $rewardAr,
            'points' => $points,
        ]);

        return [
            'type' => 'store_reward_pending',
            'request_id' => $this->storeRewardRequest->id,
            'student_id' => $this->student->id,
            'student_name' => $studentName,
            'reward_name_en' => $rewardEn,
            'reward_name_ar' => $rewardAr,
            'points_cost' => $points,
            'message' => $messageEn,
            'message_en' => $messageEn,
            'message_ar' => $messageAr,
        ];
    }
}
