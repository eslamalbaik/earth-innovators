<?php

namespace App\Http\Requests\Badge;

use Illuminate\Foundation\Http\FormRequest;

class AwardBadgeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'user_id' => 'required|exists:users,id',
            'project_id' => 'nullable|exists:projects,id',
            'challenge_id' => 'nullable|exists:challenges,id',
            'reason' => 'nullable|string',
        ];
    }
}

