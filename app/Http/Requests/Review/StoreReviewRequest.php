<?php

namespace App\Http\Requests\Review;

use Illuminate\Foundation\Http\FormRequest;

class StoreReviewRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'teacher_id' => 'required|exists:teachers,id',
            'booking_id' => 'nullable|exists:bookings,id',
            'rating' => 'required|numeric|min:1|max:5',
            'comment' => 'required|string|max:1000',
            'reviewer_name' => 'required|string|max:255',
            'reviewer_location' => 'nullable|string|max:255',
            'reviewer_image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
        ];
    }
}

