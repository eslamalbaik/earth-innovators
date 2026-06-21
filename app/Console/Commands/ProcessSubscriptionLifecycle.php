<?php

namespace App\Console\Commands;

use App\Models\UserPackage;
use App\Notifications\SubscriptionExpiredNotification;
use App\Notifications\TrialEndingSoonNotification;
use App\Services\MembershipAccessService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class ProcessSubscriptionLifecycle extends Command
{
    protected $signature = 'subscriptions:process
        {--reminder-days=3 : Send a reminder when a subscription is this many days from expiring}';

    protected $description = 'Expire past-due subscriptions/trials and send expiry reminders';

    public function __construct(
        private MembershipAccessService $membershipAccessService
    ) {
        parent::__construct();
    }

    public function handle(): int
    {
        $reminderDays = max(1, (int) $this->option('reminder-days'));

        $expired = $this->expirePastDueSubscriptions();
        $reminded = $this->sendExpiryReminders($reminderDays);

        $this->info("Done. Expired: {$expired}, Reminders sent: {$reminded}.");

        return self::SUCCESS;
    }

    /**
     * Flip active subscriptions whose end_date has passed to "expired",
     * downgrade the member's access, and notify them once.
     */
    private function expirePastDueSubscriptions(): int
    {
        $count = 0;

        UserPackage::query()
            ->where('status', 'active')
            ->whereNotNull('end_date')
            ->whereDate('end_date', '<', now()->toDateString())
            ->with(['user', 'package'])
            ->chunkById(100, function ($subscriptions) use (&$count) {
                foreach ($subscriptions as $userPackage) {
                    try {
                        $userPackage->update(['status' => 'expired']);

                        if ($userPackage->user) {
                            // Downgrade membership if the user no longer has an active subscription.
                            $this->membershipAccessService->syncMembershipFromSubscriptions($userPackage->user);
                            $userPackage->user->notify(new SubscriptionExpiredNotification($userPackage));
                        }

                        $count++;
                    } catch (\Throwable $exception) {
                        Log::error('Failed to expire subscription', [
                            'user_package_id' => $userPackage->id,
                            'error' => $exception->getMessage(),
                        ]);
                    }
                }
            });

        return $count;
    }

    /**
     * Notify users whose active subscription expires within the reminder window,
     * sending each reminder only once (tracked via expiry_reminder_sent_at).
     */
    private function sendExpiryReminders(int $reminderDays): int
    {
        $count = 0;
        $today = now()->startOfDay();
        $windowEnd = now()->startOfDay()->addDays($reminderDays);

        UserPackage::query()
            ->where('status', 'active')
            ->whereNotNull('end_date')
            ->whereNull('expiry_reminder_sent_at')
            ->whereDate('end_date', '>=', $today->toDateString())
            ->whereDate('end_date', '<=', $windowEnd->toDateString())
            ->with(['user', 'package'])
            ->chunkById(100, function ($subscriptions) use (&$count, $today) {
                foreach ($subscriptions as $userPackage) {
                    try {
                        if (!$userPackage->user) {
                            continue;
                        }

                        $endDate = $userPackage->end_date->copy()->startOfDay();
                        $daysRemaining = (int) $today->diffInDays($endDate, false);
                        $daysRemaining = max(0, $daysRemaining);

                        $userPackage->user->notify(
                            new TrialEndingSoonNotification($userPackage, $daysRemaining)
                        );

                        $userPackage->update(['expiry_reminder_sent_at' => now()]);

                        $count++;
                    } catch (\Throwable $exception) {
                        Log::error('Failed to send expiry reminder', [
                            'user_package_id' => $userPackage->id,
                            'error' => $exception->getMessage(),
                        ]);
                    }
                }
            });

        return $count;
    }
}
