<?php

namespace App\Events;

use App\Models\Publication;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ArticleApproved
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public Publication $publication;

    /**
     * Create a new event instance.
     */
    public function __construct(Publication $publication)
    {
        $this->publication = $publication;
    }
}
