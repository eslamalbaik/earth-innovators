<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class ProjectResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'status' => $this->status,
            'points' => $this->points ?? 0,
            'deadline' => $this->deadline?->format('Y-m-d'),
            'created_at' => $this->created_at->format('Y-m-d H:i'),
            'school' => new UserResource($this->whenLoaded('school')),
            'submissions_count' => $this->whenLoaded('submissions', fn() => $this->submissions->count()),
            'approved_submissions_count' => $this->whenLoaded('submissions', fn() => $this->submissions->where('status', 'approved')->count()),
        ];
    }
}

