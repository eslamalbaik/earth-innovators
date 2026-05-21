<?php

namespace App\Http\Requests;

use App\Models\User;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProfileUpdateRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => [
                'required',
                'string',
                'lowercase',
                'email',
                'max:255',
                Rule::unique(User::class)->ignore($this->user()->id),
            ],
            'image' => ['nullable', 'image', 'mimes:jpeg,png,jpg,gif', 'max:2048'],
            'institution' => ['nullable', 'string', 'max:255'],
            'bio' => ['nullable', 'string', 'max:1000'],
            'teacher_data' => ['nullable', 'array'],
            'teacher_image' => ['nullable', 'image', 'mimes:jpeg,png,jpg,gif', 'max:2048'],
        ];
    }

    protected function failedValidation(Validator $validator): void
    {
        // #region agent log
        @file_put_contents(base_path('debug-75cfd5.log'), json_encode(['sessionId' => '75cfd5', 'hypothesisId' => 'H3', 'location' => 'ProfileUpdateRequest::failedValidation', 'message' => 'validation_failed', 'data' => ['fields' => array_keys($validator->errors()->toArray())], 'timestamp' => (int) (microtime(true) * 1000)]) . "\n", FILE_APPEND);
        // #endregion

        parent::failedValidation($validator);
    }
}
