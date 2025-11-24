<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class BadgeResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'name_ar' => $this->name_ar,
            'description' => $this->description,
            'description_ar' => $this->description_ar,
            'icon' => $this->icon,
            'image' => $this->image ? asset('storage/' . $this->image) : null,
            'points_required' => $this->points_required ?? 0,
            'pivot' => $this->when($this->pivot, [
                'reason' => $this->pivot->reason ?? null,
                'earned_at' => $this->pivot->earned_at?->format('Y-m-d'),
            ]),
        ];
    }
}

