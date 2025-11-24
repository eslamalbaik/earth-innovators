<?php

namespace App\Http\Requests\Publication;

use Illuminate\Foundation\Http\FormRequest;

class StorePublicationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'type' => 'required|in:magazine,booklet,report',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'content' => 'required|string',
            'cover_image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'file' => 'nullable|file|mimes:pdf|max:10240',
            'issue_number' => 'nullable|integer|min:1',
            'publish_date' => 'nullable|date',
            'publisher_name' => 'nullable|string|max:255',
        ];
    }

    public function messages(): array
    {
        return [
            'type.required' => 'نوع الإصدار مطلوب',
            'type.in' => 'نوع الإصدار غير صحيح',
            'title.required' => 'اسم المقال مطلوب',
            'title.max' => 'اسم المقال يجب ألا يتجاوز 255 حرفاً',
            'content.required' => 'محتوى المقال مطلوب',
            'cover_image.image' => 'صورة المقال يجب أن تكون صورة',
            'cover_image.mimes' => 'صورة المقال يجب أن تكون من نوع: jpeg, png, jpg, gif',
            'cover_image.max' => 'صورة المقال يجب ألا تتجاوز 2 ميجابايت',
            'file.file' => 'الملف يجب أن يكون ملف PDF',
            'file.mimes' => 'الملف يجب أن يكون من نوع PDF',
            'file.max' => 'الملف يجب ألا يتجاوز 10 ميجابايت',
        ];
    }
}

