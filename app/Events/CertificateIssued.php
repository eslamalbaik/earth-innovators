<?php

namespace App\Events;

use App\Models\Certificate;
use App\Models\User;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class CertificateIssued
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public Certificate $certificate;
    public User $user;

    /**
     * Create a new event instance.
     */
    public function __construct(Certificate $certificate, User $user)
    {
        $this->certificate = $certificate;
        $this->user = $user;
    }
}
