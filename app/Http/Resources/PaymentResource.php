<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class PaymentResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'booking_id' => $this->booking_id,
            'amount' => (float) $this->amount,
            'currency' => $this->currency ?? 'AED',
            'status' => $this->status,
            'payment_method' => $this->payment_method,
            'payment_gateway' => $this->payment_gateway,
            'transaction_id' => $this->transaction_id,
            'payment_reference' => $this->payment_reference,
            'paid_at' => $this->paid_at?->format('Y-m-d H:i'),
            'failed_at' => $this->failed_at?->format('Y-m-d H:i'),
            'created_at' => $this->created_at->format('Y-m-d H:i'),
            'booking' => new BookingResource($this->whenLoaded('booking')),
            'student' => new UserResource($this->whenLoaded('student')),
        ];
    }
}

