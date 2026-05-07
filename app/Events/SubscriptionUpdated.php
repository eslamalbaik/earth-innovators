<?php

namespace App\Events;

use App\Models\UserPackage;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class SubscriptionUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public int $userPackageId;
    public int $userId;
    public string $status;
    public ?string $packageName;
    public ?string $packageNameAr;
    public ?string $endDate;

    public function __construct(UserPackage $userPackage)
    {
        $this->userPackageId = $userPackage->id;
        $this->userId = $userPackage->user_id;
        $this->status = $userPackage->status;
        $this->packageName = $userPackage->package?->name;
        $this->packageNameAr = $userPackage->package?->name_ar;
        $this->endDate = $userPackage->end_date?->toDateString();
    }

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('user.' . $this->userId),
        ];
    }

    public function broadcastAs(): string
    {
        return 'subscription.updated';
    }

    public function broadcastWith(): array
    {
        return [
            'user_package_id' => $this->userPackageId,
            'status' => $this->status,
            'package' => [
                'name' => $this->packageName,
                'name_ar' => $this->packageNameAr,
            ],
            'end_date' => $this->endDate,
        ];
    }
}
