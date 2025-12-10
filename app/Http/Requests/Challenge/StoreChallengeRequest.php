<?php

namespace App\Http\Requests\Challenge;

use Illuminate\Foundation\Http\FormRequest;

class StoreChallengeRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'title' => 'required|string|max:255',
            'objective' => 'required|string|max:1000',
            'description' => 'required|string',
            'instructions' => 'required|string',
            'challenge_type' => 'required|in:60_seconds,mental_math,conversions,team_fastest,build_problem,custom',
            'category' => 'required|in:science,technology,engineering,mathematics,arts,other',
            'age_group' => 'required|in:6-9,10-13,14-17,18+',
            'school_id' => 'nullable|exists:users,id',
            'start_date' => 'required|date|after_or_equal:today',
            'deadline' => 'required|date|after:start_date',
            'status' => 'nullable|in:draft,active,completed,cancelled',
            'points_reward' => 'nullable|integer|min:0',
            'max_participants' => 'nullable|integer|min:1',
        ];
    }

    public function messages(): array
    {
        return [
            'title.required' => 'عنوان التحدي مطلوب',
            'title.max' => 'عنوان التحدي يجب ألا يتجاوز 255 حرفاً',
            'objective.required' => 'الهدف من التحدي مطلوب',
            'objective.max' => 'الهدف يجب ألا يتجاوز 1000 حرف',
            'description.required' => 'وصف التحدي مطلوب',
            'instructions.required' => 'كيفية التنفيذ مطلوبة',
            'challenge_type.required' => 'نوع التحدي مطلوب',
            'challenge_type.in' => 'نوع التحدي غير صحيح',
            'category.required' => 'الفئة مطلوبة',
            'category.in' => 'الفئة غير صحيحة',
            'age_group.required' => 'الفئة العمرية مطلوبة',
            'age_group.in' => 'الفئة العمرية غير صحيحة',
            'start_date.required' => 'تاريخ البدء مطلوب',
            'start_date.after_or_equal' => 'تاريخ البدء يجب أن يكون اليوم أو بعده',
            'deadline.required' => 'تاريخ الانتهاء مطلوب',
            'deadline.after' => 'تاريخ الانتهاء يجب أن يكون بعد تاريخ البدء',
            'points_reward.min' => 'نقاط المكافأة يجب أن تكون أكبر من أو تساوي 0',
            'max_participants.min' => 'الحد الأقصى للمشاركين يجب أن يكون أكبر من 0',
        ];
    }
}
