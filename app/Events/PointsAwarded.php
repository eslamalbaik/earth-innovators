<?php

namespace App\Events;

use App\Models\Point;
use App\Models\User;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class PointsAwarded
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public User $user;
    public Point $point;
    public int $totalPoints;

    /**
     * Create a new event instance.
     */
    public function __construct(User $user, Point $point, int $totalPoints)
    {
        $this->user = $user;
        $this->point = $point;
        $this->totalPoints = $totalPoints;
    }
}

