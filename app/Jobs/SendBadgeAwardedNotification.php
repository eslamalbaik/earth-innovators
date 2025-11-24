<?php

namespace App\Jobs;

use App\Models\User;
use App\Models\Badge;
use App\Notifications\BadgeAwardedNotification;
use Illuminate\Bus\Queueable;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class SendBadgeAwardedNotification
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        private User $student,
        private Badge $badge,
        private User $awardedBy
    ) {}

    public function handle(): void
    {
        $this->student->notify(new BadgeAwardedNotification($this->badge, $this->awardedBy));
    }
}

