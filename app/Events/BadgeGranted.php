<?php

namespace App\Events;

use App\Models\User;
use App\Models\Badge;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class BadgeGranted
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public User $user;
    public Badge $badge;

    /**
     * Create a new event instance.
     */
    public function __construct(User $user, Badge $badge)
    {
        $this->user = $user;
        $this->badge = $badge;
    }
}
