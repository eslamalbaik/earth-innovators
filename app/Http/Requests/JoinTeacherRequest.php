<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class JoinTeacherRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255', 'min:2'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'phone' => ['required', 'string', 'regex:/^(\+966|\+971|\+973|\+974|\+965|\+968|\+964|\+967|\+970|\+963|\+962|\+20)[0-9]{8,10}$/', 'unique:users,phone'],
            'city' => ['required', 'string', 'max:100'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'password_confirmation' => ['required', 'string', 'min:8'],
            'bio' => ['nullable', 'string', 'max:1000'],
            'profile_image' => ['nullable', 'image', 'mimes:jpeg,png,jpg,gif', 'max:2048'],

            'subjects' => ['required', 'array', 'min:1'],
            'subjects.*' => ['required', 'integer', 'exists:subjects,id'],
            'stages' => ['required', 'array', 'min:1'],
            'stages.*' => ['required', 'string', 'in:الابتدائية,المتوسطة,الثانوية'],
            'price_per_hour' => ['required', 'numeric', 'min:1'],

            'certifications' => ['nullable', 'array'],
            'certifications.*.name' => ['required_with:certifications', 'string', 'max:255'],
            'certifications.*.issuer' => ['required_with:certifications', 'string', 'max:255'],

            'experiences' => ['nullable', 'array'],
            'experiences.*.title' => ['required_with:experiences', 'string', 'max:255'],
            'experiences.*.employer' => ['required_with:experiences', 'string', 'max:255'],
            'experiences.*.start_date' => ['required_with:experiences', 'date', 'before_or_equal:today'],
            'experiences.*.end_date' => ['nullable', 'date', 'after:experiences.*.start_date'],
            'experiences.*.still_working' => ['boolean'],
            'experiences.*.description' => ['nullable', 'string', 'max:1000'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'الاسم الكامل مطلوب',
            'name.min' => 'الاسم يجب أن يكون على الأقل حرفين',
            'name.max' => 'الاسم لا يجب أن يتجاوز 255 حرف',

            'email.required' => 'البريد الإلكتروني مطلوب',
            'email.email' => 'البريد الإلكتروني غير صحيح',
            'email.unique' => 'هذا البريد الإلكتروني مستخدم بالفعل',

            'phone.required' => 'رقم الجوال مطلوب',
            'phone.regex' => 'رقم الجوال غير صحيح. يجب أن يبدأ بمقدمة صحيحة (مثل +966)',
            'phone.unique' => 'رقم الجوال مستخدم بالفعل',

            'city.required' => 'المدينة مطلوبة',

            'password.required' => 'كلمة المرور مطلوبة',
            'password.min' => 'كلمة المرور يجب أن تكون على الأقل 8 أحرف',
            'password.confirmed' => 'تأكيد كلمة المرور غير متطابق',

            'password_confirmation.required' => 'تأكيد كلمة المرور مطلوب',

            'bio.max' => 'النبذة الشخصية لا يجب أن تتجاوز 1000 حرف',

            'profile_image.image' => 'يجب أن يكون الملف صورة',
            'profile_image.mimes' => 'نوع الصورة غير مدعوم. الأنواع المدعومة: jpeg, png, jpg, gif',
            'profile_image.max' => 'حجم الصورة لا يجب أن يتجاوز 2 ميجابايت',

            'subjects.required' => 'يجب اختيار مادة واحدة على الأقل',
            'subjects.min' => 'يجب اختيار مادة واحدة على الأقل',
            'subjects.*.exists' => 'المادة المختارة غير موجودة',

            'stages.required' => 'يجب اختيار مرحلة دراسية واحدة على الأقل',
            'stages.min' => 'يجب اختيار مرحلة دراسية واحدة على الأقل',
            'stages.*.in' => 'المرحلة الدراسية المختارة غير صحيحة',

            'price_per_hour.required' => 'سعر الحصة مطلوب',
            'price_per_hour.numeric' => 'سعر الحصة يجب أن يكون رقماً',
            'price_per_hour.min' => 'سعر الحصة يجب أن يكون على الأقل 1 ريال',

            'certifications.*.name.required_with' => 'اسم الشهادة مطلوب',
            'certifications.*.issuer.required_with' => 'جهة الإصدار مطلوبة',

            'experiences.*.title.required_with' => 'المسمى الوظيفي مطلوب عند إضافة خبرة',
            'experiences.*.employer.required_with' => 'جهة التوظيف مطلوبة عند إضافة خبرة',
            'experiences.*.start_date.required_with' => 'تاريخ البداية مطلوب عند إضافة خبرة',
            'experiences.*.start_date.before_or_equal' => 'تاريخ البداية لا يجب أن يكون في المستقبل',
            'experiences.*.end_date.after' => 'تاريخ النهاية يجب أن يكون بعد تاريخ البداية',
            'experiences.*.description.max' => 'وصف الخبرة لا يجب أن يتجاوز 1000 حرف',
        ];
    }

    public function attributes(): array
    {
        return [
            'name' => 'الاسم الكامل',
            'email' => 'البريد الإلكتروني',
            'phone' => 'رقم الجوال',
            'city' => 'المدينة',
            'password' => 'كلمة المرور',
            'password_confirmation' => 'تأكيد كلمة المرور',
            'bio' => 'النبذة الشخصية',
            'profile_image' => 'الصورة الشخصية',
            'subjects' => 'المواد',
            'stages' => 'المراحل الدراسية',
            'price_per_hour' => 'سعر الحصة',
            'certifications' => 'الشهادات',
            'experiences' => 'الخبرات',
        ];
    }

    protected function prepareForValidation()
    {
        if ($this->phone) {
            $this->merge([
                'phone' => $this->cleanPhoneNumber($this->phone)
            ]);
        }

        $this->parseJsonFields();
        if ($this->has('price_per_hour')) {
            $price = $this->input('price_per_hour');
            if (is_string($price)) {
                $this->merge(['price_per_hour' => (float) $price]);
            }
        }
    }

    protected function parseJsonFields()
    {
        $jsonFields = ['subjects', 'stages', 'certifications', 'experiences'];

        foreach ($jsonFields as $field) {
            if ($this->has($field)) {
                $value = $this->input($field);
                
                // Log للتشخيص
                \Log::info("Parsing JSON field: {$field}", [
                    'raw_value' => $value,
                    'type' => gettype($value),
                    'is_string' => is_string($value),
                    'is_array' => is_array($value),
                ]);
                
                if (is_string($value)) {
                    $decoded = json_decode($value, true);
                    if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
                        $this->merge([$field => $decoded]);
                        \Log::info("Successfully parsed {$field}", ['decoded' => $decoded]);
                    } else {
                        \Log::warning("Failed to parse {$field} as JSON", [
                            'json_error' => json_last_error_msg(),
                            'value' => $value,
                        ]);
                    }
                } elseif (is_array($value)) {
                    $this->merge([$field => $value]);
                    \Log::info("Field {$field} is already array", ['value' => $value]);
                }
            } else {
                \Log::info("Field {$field} not present in request");
            }
        }

        if ($this->experiences && is_array($this->experiences)) {
            $experiences = $this->experiences;
            foreach ($experiences as $key => $experience) {
                if (isset($experience['still_working'])) {
                    $experiences[$key]['still_working'] = (bool) $experience['still_working'];
                }
            }
            $this->merge(['experiences' => $experiences]);
        }
    }

    private function cleanPhoneNumber($phone)
    {
        // إذا كان الرقم يحتوي على + بالفعل، اتركه كما هو
        if (strpos($phone, '+') === 0) {
            return $phone;
        }
        
        // تنظيف الرقم من أي أحرف غير رقمية
        $phone = preg_replace('/[^0-9+]/', '', $phone);
        
        // إذا كان الرقم يبدأ بـ +، اتركه كما هو
        if (strpos($phone, '+') === 0) {
            return $phone;
        }
        
        // إذا كان الرقم 9 أرقام ويبدأ بـ 5، أضف +966
        if (strlen($phone) == 9 && substr($phone, 0, 1) == '5') {
            $phone = '+966' . $phone;
        } 
        // إذا كان الرقم 10 أرقام ويبدأ بـ 05، أضف +966
        elseif (strlen($phone) == 10 && substr($phone, 0, 2) == '05') {
            $phone = '+966' . substr($phone, 1);
        } 
        // إذا كان الرقم 12 رقم ويبدأ بـ 966، أضف +
        elseif (strlen($phone) == 12 && substr($phone, 0, 3) == '966') {
            $phone = '+' . $phone;
        }

        return $phone;
    }
}
