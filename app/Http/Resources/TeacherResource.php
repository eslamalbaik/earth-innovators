<?php

namespace App\Http\Resources;

use App\Support\StorageUrl;
use Illuminate\Http\Resources\Json\JsonResource;

class TeacherResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'name_ar' => $this->name_ar,
            'name_en' => $this->name_en,
            'city' => $this->city,
            'bio' => $this->bio,
            'subjects' => $this->subjects ?? [],
            'stages' => $this->stages ?? [],
            'price_per_hour' => $this->price_per_hour,
            'experience_years' => $this->experience_years,
            'rating' => $this->rating ?? 0,
            'reviews_count' => $this->whenLoaded('reviews', fn() => $this->reviews->count()),
            'image' => StorageUrl::url($this->image),
            'is_verified' => (bool) $this->is_verified,
            'is_active' => (bool) $this->is_active,
            'user' => new UserResource($this->whenLoaded('user')),
            'subjects_relation' => SubjectResource::collection($this->whenLoaded('subjectsRelation')),
        ];
    }
}
