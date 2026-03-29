<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreRewardFormRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $storeReward = $this->route('store_reward');

        return [
            'slug' => [
                'required',
                'string',
                'max:64',
                'regex:/^[a-z0-9_]+$/',
                Rule::unique('store_rewards', 'slug')->ignore($storeReward?->id),
            ],
            'name_en' => 'required|string|max:255',
            'name_ar' => 'required|string|max:255',
            'icon' => 'nullable|string|max:32',
            'points_cost' => 'required|integer|min:1|max:1000000',
            'is_active' => 'boolean',
            'sort_order' => 'integer|min:0|max:32767',
            'requires_manual_approval' => 'boolean',
        ];
    }
}
