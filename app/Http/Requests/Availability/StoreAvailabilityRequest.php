<?php

namespace App\Http\Requests\Availability;

use Illuminate\Foundation\Http\FormRequest;

class StoreAvailabilityRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'date' => 'required|date|after_or_equal:today',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
            'subject_id' => 'nullable|exists:subjects,id',
        ];
    }

    public function messages(): array
    {
        return [
            'date.required' => 'التاريخ مطلوب',
            'date.date' => 'التاريخ غير صحيح',
            'date.after_or_equal' => 'التاريخ يجب أن يكون اليوم أو بعده',
            'start_time.required' => 'وقت البداية مطلوب',
            'start_time.date_format' => 'وقت البداية يجب أن يكون بصيغة H:i',
            'end_time.required' => 'وقت النهاية مطلوب',
            'end_time.date_format' => 'وقت النهاية يجب أن يكون بصيغة H:i',
            'end_time.after' => 'وقت النهاية يجب أن يكون بعد وقت البداية',
            'subject_id.exists' => 'المادة المحددة غير موجودة',
        ];
    }
}

