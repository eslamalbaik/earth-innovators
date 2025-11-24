<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class BookingResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'subject' => $this->subject,
            'status' => $this->status,
            'payment_status' => $this->payment_status ?? 'pending',
            'price' => (float) ($this->price ?? 0),
            'total_price' => (float) ($this->total_price ?? $this->price ?? 0),
            'created_at' => $this->created_at->format('Y-m-d H:i'),
            'student' => new UserResource($this->whenLoaded('student')),
            'teacher' => new TeacherResource($this->whenLoaded('teacher')),
            'availability' => $this->whenLoaded('availability', fn() => [
                'id' => $this->availability->id,
                'start_time' => $this->availability->start_time,
                'end_time' => $this->availability->end_time,
                'date' => $this->availability->date,
            ]),
        ];
    }
}

