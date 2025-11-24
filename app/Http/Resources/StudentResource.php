<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class StudentResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'phone' => $this->phone,
            'points' => $this->points ?? 0,
            'projects_count' => $this->whenLoaded('projects', fn() => $this->projects->count()),
            'badges_count' => $this->whenLoaded('badges', fn() => $this->badges->count()),
            'badges' => BadgeResource::collection($this->whenLoaded('badges')),
            'created_at' => $this->created_at->format('Y-m-d'),
        ];
    }
}

