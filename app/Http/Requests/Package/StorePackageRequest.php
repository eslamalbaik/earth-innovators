<?php

namespace App\Http\Requests\Package;

use Illuminate\Foundation\Http\FormRequest;

class StorePackageRequest extends FormRequest
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
            'price' => 'required|numeric|min:0',
            'currency' => 'required|in:SAR,USD,AED',
            'duration_type' => 'required|in:monthly,quarterly,yearly,lifetime',
            'duration_months' => 'nullable|integer|min:1',
            'points_bonus' => 'integer|min:0',
            'projects_limit' => 'nullable|integer|min:0',
            'challenges_limit' => 'nullable|integer|min:0',
            'certificate_access' => 'boolean',
            'badge_access' => 'boolean',
            'features' => 'nullable|array',
            'features_ar' => 'nullable|array',
            'is_active' => 'boolean',
            'is_popular' => 'boolean',
        ];
    }
}

