<?php

namespace App\Notifications;

use App\Models\UserPackage;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Notifications\Notification;

class TrialEndingSoonNotification extends Notification implements ShouldBroadcast
{
    use Queueable;

    public function __construct(
        protected UserPackage $userPackage,
        protected int $daysRemaining
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
            'type' => 'subscription_ending_soon',
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

        $title = $isTrial ? 'تجربتك المجانية تنتهي قريباً' : 'اشتراكك ينتهي قريباً';

        $message = $this->daysRemaining > 0
            ? "تبقّى {$this->daysRemaining} يوم على انتهاء " . ($isTrial ? 'تجربتك المجانية' : 'اشتراكك') . " ({$packageName}). جدّد الآن لمواصلة الاستفادة من المزايا."
            : 'ينتهي ' . ($isTrial ? 'تجربتك المجانية' : 'اشتراكك') . " ({$packageName}) اليوم. جدّد الآن لمواصلة الاستفادة من المزايا.";

        return [
            'type' => 'subscription_ending_soon',
            'title' => $title,
            'message' => $message,
            'user_package_id' => $this->userPackage->id,
            'package_name' => $packageName,
            'is_trial' => $isTrial,
            'days_remaining' => $this->daysRemaining,
            'end_date' => optional($this->userPackage->end_date)?->format('Y-m-d'),
            'action_url' => '/packages',
        ];
    }
}
