<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class PublicationResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'type' => $this->type,
            'status' => $this->status,
            'cover_image' => $this->cover_image ? asset('storage/' . $this->cover_image) : null,
            'file' => $this->file ? asset('storage/' . $this->file) : null,
            'content' => $this->content,
            'likes_count' => $this->likes_count ?? 0,
            'publish_date' => $this->publish_date?->format('Y-m-d'),
            'created_at' => $this->created_at->format('Y-m-d H:i'),
            'author' => new UserResource($this->whenLoaded('author')),
            'school' => new UserResource($this->whenLoaded('school')),
        ];
    }
}

