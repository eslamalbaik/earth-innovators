<?php

namespace App\Http\Requests\Badge;

use Illuminate\Foundation\Http\FormRequest;

class StoreBadgeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'name_ar' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'description_ar' => 'nullable|string',
            'icon' => 'nullable|string',
            'image' => 'nullable|image|max:2048',
            'type' => 'required|in:rank_first,rank_second,rank_third,excellent_innovator,active_participant,custom',
            'badge_category' => 'nullable|in:achievement,community',
            'level' => 'nullable|in:bronze,silver,gold',
            'points_required' => 'required|integer|min:0',
            'is_active' => 'boolean',
        ];
    }
}

