<?php

namespace App\Http\Resources;

use App\Support\StorageUrl;
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
            'cover_image' => StorageUrl::url($this->cover_image),
            'file' => StorageUrl::url($this->file),
            'content' => $this->content,
            'likes_count' => $this->likes_count ?? 0,
            'publish_date' => $this->publish_date?->format('Y-m-d'),
            'created_at' => $this->created_at->format('Y-m-d H:i'),
            'author' => new UserResource($this->whenLoaded('author')),
            'school' => new UserResource($this->whenLoaded('school')),
        ];
    }
}
