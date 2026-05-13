<?php

namespace App\Http\Requests\Student;

use Illuminate\Foundation\Http\FormRequest;

class StoreStudentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $creatingNewStudent = !$this->filled('existing_student_id');

        return [
            'existing_student_id' => 'nullable|integer|exists:users,id',
            'name' => [$creatingNewStudent ? 'required' : 'nullable', 'string', 'max:255'],
            'email' => [$creatingNewStudent ? 'required' : 'nullable', 'string', 'email', 'max:255', 'unique:users'],
            'phone' => 'nullable|string|max:20|unique:users',
            'password' => [$creatingNewStudent ? 'required' : 'nullable', 'string', 'min:8'],
            'year' => 'nullable|integer|min:1900|max:2100',
        ];
    }
}
