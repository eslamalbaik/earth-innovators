<?php

namespace App\Notifications;

use App\Models\UserPackage;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Notifications\Notification;

class SubscriptionExpiredNotification extends Notification implements ShouldBroadcast
{
    use Queueable;

    public function __construct(
        protected UserPackage $userPackage
    ) {}

    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database', 'broadcast'];
    }

    public function toBroadcast(object $notifiable): array
    {
        return [
            'id' => $this->id,
            'type' => 'subscription_expired',
            'data' => $this->toArray($notifiable),
            'read_at' => null,
            'created_at' => now()->toIso8601String(),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        $package = $this->userPackage->package;
        $isTrial = (bool) ($package?->is_trial ?? false);
        $packageName = $package?->name_ar ?? $package?->name ?? '';

        return [
            'type' => 'subscription_expired',
            'title' => $isTrial ? 'انتهت تجربتك المجانية' : 'انتهى اشتراكك',
            'message' => 'انتهت صلاحية ' . ($isTrial ? 'تجربتك المجانية' : 'اشتراكك')
                . " ({$packageName}). اشترك الآن لاستعادة الوصول الكامل للمزايا.",
            'user_package_id' => $this->userPackage->id,
            'package_name' => $packageName,
            'is_trial' => $isTrial,
            'end_date' => optional($this->userPackage->end_date)?->format('Y-m-d'),
            'action_url' => '/packages',
        ];
    }
}
