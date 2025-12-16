<?php

namespace App\Http\Requests\Challenge;

use Illuminate\Foundation\Http\FormRequest;

class UpdateChallengeRequest extends FormRequest
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
            'title' => 'sometimes|required|string|max:255',
            'objective' => 'sometimes|required|string|max:1000',
            'description' => 'sometimes|required|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
            'instructions' => 'sometimes|required|string',
            'challenge_type' => 'sometimes|required|in:60_seconds,mental_math,conversions,team_fastest,build_problem,custom',
            'category' => 'sometimes|required|in:science,technology,engineering,mathematics,arts,other',
            'age_group' => 'sometimes|required|in:6-9,10-13,14-17,18+',
            'school_id' => 'nullable|exists:users,id',
            'start_date' => 'sometimes|required|date',
            'deadline' => 'sometimes|required|date|after:start_date',
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
            'deadline.required' => 'تاريخ الانتهاء مطلوب',
            'deadline.after' => 'تاريخ الانتهاء يجب أن يكون بعد تاريخ البدء',
            'points_reward.min' => 'نقاط المكافأة يجب أن تكون أكبر من أو تساوي 0',
            'max_participants.min' => 'الحد الأقصى للمشاركين يجب أن يكون أكبر من 0',
        ];
    }
}
