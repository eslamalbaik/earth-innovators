<?php

namespace App\Events;

use App\Models\Challenge;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ChallengeCreated
{
    use Dispatchable, SerializesModels;

    public Challenge $challenge;

    /**
     * Create a new event instance.
     */
    public function __construct(Challenge $challenge)
    {
        $this->challenge = $challenge;
    }
}

