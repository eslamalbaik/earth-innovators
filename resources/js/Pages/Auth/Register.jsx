import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import SelectInput from '@/Components/SelectInput';
import GuestLayout from '@/Layouts/GuestLayout';
import ApplicationLogo from '@/Components/ApplicationLogo';
import { Head, Link, useForm, usePage, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaPhone, FaChevronDown, FaExclamationTriangle, FaTimes, FaSchool } from 'react-icons/fa';

const DEFAULT_DIAL_CODE = '+966';

// قائمة مقدمات الدول
const dialCodeOptions = [
    // الدول الخليجية
    { value: '+966', label: '+966 (السعودية)', flag: '🇸🇦' },
    // { value: '+971', label: '+971 (الإمارات)', flag: '🇦🇪' },
    // { value: '+973', label: '+973 (البحرين)', flag: '🇧🇭' },
    // { value: '+974', label: '+974 (قطر)', flag: '🇶🇦' },
    // { value: '+965', label: '+965 (الكويت)', flag: '🇰🇼' },
    // { value: '+968', label: '+968 (عمان)', flag: '🇴🇲' },
    // // بلاد الشام
    // { value: '+970', label: '+970 (فلسطين)', flag: '🇵🇸' },
    // { value: '+963', label: '+963 (سوريا)', flag: '🇸🇾' },
    // { value: '+964', label: '+964 (العراق)', flag: '🇮🇶' },
    // // مصر والأردن
    // { value: '+20', label: '+20 (مصر)', flag: '🇪🇬' },
    // { value: '+962', label: '+962 (الأردن)', flag: '🇯🇴' },
];

export default function Register({ schools = [] }) {
    const { props } = usePage();

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [selectedDialCode, setSelectedDialCode] = useState(DEFAULT_DIAL_CODE);
    const [showDialCodeDropdown, setShowDialCodeDropdown] = useState(false);
    const [showErrorsAlert, setShowErrorsAlert] = useState(true);
    const [pageErrors, setPageErrors] = useState({});

    const { data, setData, post, processing, errors: formErrors } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: 'student',
        phone: '',
        school_id: '',
    });

    const roleOptions = [
        { key: 'student', label: 'طالب', description: 'إنشاء حساب كطالب' },
        { key: 'teacher', label: 'معلم', description: 'إنشاء حساب كمعلم' },
        { key: 'school', label: 'مدرسة', description: 'إنشاء حساب كمدرسة' },
    ];

    // الحصول على الأخطاء من Inertia (من usePage) أو من state المحلي أو من useForm
    const errors = props.errors || pageErrors || formErrors;

    // إظهار تنبيه الأخطاء عند وجود أخطاء جديدة
    useEffect(() => {
        if (Object.keys(errors).length > 0) {
            setShowErrorsAlert(true);
        }
    }, [errors]);

    // تحديث الأخطاء من props.errors عند تغييرها
    useEffect(() => {
        if (props.errors && Object.keys(props.errors).length > 0) {
            setPageErrors(props.errors);
            setShowErrorsAlert(true);
        }
    }, [props.errors]);

    // مسح school_id عند تغيير role إلى school
    useEffect(() => {
        if (data.role === 'school') {
            setData('school_id', '');
        }
    }, [data.role]);

    const handlePhoneInputChange = (e) => {
        // السماح فقط بالأرقام والرموز الخاصة (+)
        const sanitized = e.target.value.replace(/[^\d+]/g, '');
        setData('phone', sanitized);
    };

    const submit = (e) => {
        e.preventDefault();

        // إنشاء نسخة من البيانات
        const dataToSend = { ...data };

        // تنظيف رقم الجوال فقط إذا كان موجوداً
        if (data.phone && data.phone.trim() !== '') {
            let cleanedPhone = String(data.phone || '').replace(/\D/g, '');

            // إزالة 0 من البداية إذا كان موجوداً (مثل 0501234567 -> 501234567)
            if (cleanedPhone.startsWith('0')) {
                cleanedPhone = cleanedPhone.substring(1);
            }

            // استخدام المقدمة المختارة إذا كان هناك رقم
            const dialCode = selectedDialCode || DEFAULT_DIAL_CODE;
            const fullPhone = `${dialCode}${cleanedPhone}`;
            dataToSend.phone = fullPhone;
        } else {
            // إذا كان رقم الجوال فارغاً، لا نرسله
            dataToSend.phone = null;
        }

        // استخدام router.post لإرسال البيانات المخصصة
        router.post(route('register'), dataToSend, {
            preserveScroll: true,
            onSuccess: () => {
                // إخفاء تنبيه الأخطاء عند النجاح ومسح الأخطاء
                setShowErrorsAlert(false);
                setPageErrors({});
            },
            onError: (errors) => {
                console.error('Registration errors:', errors);
                // حفظ الأخطاء في state المحلي
                setPageErrors(errors);
                // إظهار تنبيه الأخطاء عند وجود أخطاء
                setShowErrorsAlert(true);
            },
        });
    };

    return (
        <GuestLayout>
            <Head title="إنشاء حساب" />

            <div className="flex items-center justify-center py-8 px-4">
                <div className="max-w-md w-full space-y-6">
                    <div className="flex flex-col items-center">
                        <div>
                            <Link href="/">
                                <ApplicationLogo className="block h-9 w-auto fill-current text-gray-800" />
                            </Link>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">
                            إنشاء حساب جديد
                        </h2>
                    </div>

                    <div className="bg-white shadow-lg rounded-2xl px-4 py-10 min-w-[92vw] sm:min-w-[350px]">
                        <form onSubmit={submit} className="space-y-6">
                            <div>
                                <InputLabel value="إنشاء حساب كـ" className="text-sm font-medium text-gray-700 mb-3" />
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    {roleOptions.map((roleOption) => {
                                        const isActive = data.role === roleOption.key;
                                        return (
                                            <button
                                                key={roleOption.key}
                                                type="button"
                                                onClick={() => setData('role', roleOption.key)}
                                                className={`relative flex flex-col items-start rounded-xl border px-4 py-3 transition duration-200 ${isActive
                                                    ? 'border-legacy-green bg-gradient-to-br from-legacy-green/10 to-legacy-blue/10 text-legacy-green shadow-sm'
                                                    : 'border-gray-200 bg-gray-50 hover:border-legacy-green/50 hover:bg-legacy-green/5'
                                                    }`}
                                            >
                                                <span className="text-base font-semibold">
                                                    {roleOption.label}
                                                </span>
                                                <span className="mt-1 text-xs text-gray-500">
                                                    {roleOption.description}
                                                </span>
                                                {isActive && (
                                                    <span className="absolute top-3 left-3 h-2 w-2 rounded-full bg-legacy-green" aria-hidden="true"></span>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                                <InputError message={errors.role} className="mt-2" />
                            </div>

                            {/* حقل اختيار المدرسة للطلاب والمعلمين */}
                            {(data.role === 'student' || data.role === 'teacher') && (
                                <div>
                                    <InputLabel htmlFor="school_id" value="اختر مدرستك *" className="text-sm font-medium text-gray-700 mb-2" />
                                    <div className="relative">
                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                            <FaSchool className="h-5 w-5 text-gray-400" />
                                        </div>
                                        {schools && schools.length > 0 ? (
                                            <SelectInput
                                                id="school_id"
                                                name="school_id"
                                                value={data.school_id}
                                                onChange={(e) => setData('school_id', e.target.value)}
                                                className="block w-full pr-10 pl-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-legacy-green focus:border-legacy-green sm:text-sm"
                                                required
                                            >
                                                <option value="">-- اختر مدرستك --</option>
                                                {schools.map((school) => (
                                                    <option key={school.id} value={school.id}>
                                                        {school.name}
                                                    </option>
                                                ))}
                                            </SelectInput>
                                        ) : (
                                            <div className="block w-full pr-10 pl-3 py-2 border border-red-300 rounded-md shadow-sm bg-red-50 text-red-700 text-sm">
                                                <p className="font-semibold">تحذير: لا توجد مدارس مسجلة في النظام</p>
                                                <p className="text-xs mt-1">يرجى التواصل مع الإدارة لإنشاء حساب مدرسة أولاً</p>
                                            </div>
                                        )}
                                    </div>
                                    <InputError message={errors.school_id} className="mt-2" />
                                    {schools && schools.length === 0 && (
                                        <p className="mt-2 text-sm text-red-600">
                                            يجب أن تكون هناك مدرسة مسجلة في النظام أولاً. يرجى التواصل مع الإدارة.
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* عرض جميع الأخطاء في أعلى النموذج */}
                            {showErrorsAlert && Object.keys(errors).length > 0 && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start">
                                            <FaExclamationTriangle className="text-red-500 text-xl mt-0.5 ml-3 flex-shrink-0" />
                                            <div className="flex-1">
                                                <h3 className="text-sm font-semibold text-red-800 mb-2">
                                                    يرجى تصحيح الأخطاء التالية:
                                                </h3>
                                                <ul className="list-disc list-inside space-y-1 text-sm text-red-700">
                                                    {Object.entries(errors).map(([key, value]) => {
                                                        const errorMessage = Array.isArray(value) ? value[0] : value;
                                                        // إبراز رسالة رقم الهاتف المستخدم
                                                        const isPhoneUniqueError = key === 'phone' && errorMessage && errorMessage.includes('مسجل لمستخدم آخر');
                                                        return (
                                                            <li
                                                                key={key}
                                                                className={isPhoneUniqueError ? 'font-bold text-red-900 bg-red-100 px-2 py-1 rounded' : ''}
                                                            >
                                                                {errorMessage}
                                                            </li>
                                                        );
                                                    })}
                                                </ul>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setShowErrorsAlert(false)}
                                            className="text-red-400 hover:text-red-600 flex-shrink-0"
                                        >
                                            <FaTimes className="text-sm" />
                                        </button>
                                    </div>
                                </div>
                            )}

                            <div>
                                <InputLabel htmlFor="name" value="الاسم الكامل" className="text-sm font-medium text-gray-700 mb-2" />
                                <div className="relative">
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                        <FaUser className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <TextInput
                                        id="name"
                                        name="name"
                                        value={data.name}
                                        className="block w-full pr-10 pl-3 py-3 border-2 border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-legacy-green focus:border-legacy-green sm:text-sm transition-all"
                                        autoComplete="name"
                                        isFocused={true}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="أدخل اسمك الكامل"
                                        required
                                    />
                                </div>
                                <InputError message={errors.name} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="email" value="البريد الإلكتروني" className="text-sm font-medium text-gray-700 mb-2" />
                                <div className="relative">
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                        <FaEnvelope className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <TextInput
                                        id="email"
                                        type="email"
                                        name="email"
                                        value={data.email}
                                        className="block w-full pr-10 pl-3 py-3 border-2 border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-legacy-green focus:border-legacy-green sm:text-sm transition-all"
                                        autoComplete="username"
                                        onChange={(e) => setData('email', e.target.value)}
                                        placeholder="example@email.com"
                                        required
                                    />
                                </div>
                                <InputError message={errors.email} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="phone" value="رقم الجوال" className="text-sm font-medium text-gray-700 mb-2" />
                                <div className="relative">
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                        <FaPhone className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center z-10">
                                        <div className="relative">
                                            <button
                                                type="button"
                                                onClick={() => setShowDialCodeDropdown(!showDialCodeDropdown)}
                                                className="flex items-center space-x-1 space-x-reverse text-gray-700 hover:text-gray-900 focus:outline-none"
                                            >
                                                <span className="text-sm font-medium">
                                                    {dialCodeOptions.find(opt => opt.value === selectedDialCode)?.flag || '🇸🇦'} {selectedDialCode}
                                                </span>
                                                <FaChevronDown className={`h-3 w-3 transition-transform ${showDialCodeDropdown ? 'rotate-180' : ''}`} />
                                            </button>
                                            {showDialCodeDropdown && (
                                                <>
                                                    <div
                                                        className="fixed inset-0 z-10"
                                                        onClick={() => setShowDialCodeDropdown(false)}
                                                    ></div>
                                                    <div className="absolute left-0 mt-1 w-56 bg-white border border-gray-300 rounded-md shadow-lg z-20 max-h-60 overflow-y-auto">
                                                        {dialCodeOptions.map((option) => (
                                                            <button
                                                                key={option.value}
                                                                type="button"
                                                                onClick={() => {
                                                                    setSelectedDialCode(option.value);
                                                                    setShowDialCodeDropdown(false);
                                                                }}
                                                                className={`w-full text-right px-4 py-2 text-sm hover:bg-legacy-green/10 flex items-center justify-between ${selectedDialCode === option.value ? 'bg-gradient-to-r from-legacy-green/20 to-legacy-blue/20' : ''
                                                                    }`}
                                                            >
                                                                <span className="text-gray-700">{option.label}</span>
                                                                <span className="text-lg ml-2">{option.flag}</span>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    <TextInput
                                        id="phone"
                                        type="tel"
                                        name="phone"
                                        value={data.phone || ''}
                                        className="block w-full pr-10 pl-28 py-3 border-2 border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-legacy-green focus:border-legacy-green sm:text-sm transition-all"
                                        autoComplete="tel"
                                        onChange={handlePhoneInputChange}
                                        placeholder="501234567 (اختياري)"
                                    />
                                </div>
                                <InputError
                                    message={errors.phone}
                                    className={`mt-2 ${errors.phone && errors.phone.includes('مسجل لمستخدم آخر') ? 'font-bold text-red-800 bg-red-50 px-3 py-2 rounded border border-red-200' : ''}`}
                                />
                            </div>

                            <div>
                                <InputLabel htmlFor="password" value="كلمة المرور" className="text-sm font-medium text-gray-700 mb-2" />
                                <div className="relative">
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                        <FaLock className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <TextInput
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        value={data.password}
                                        className="block w-full pr-10 pl-3 py-3 border-2 border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-legacy-green focus:border-legacy-green sm:text-sm transition-all"
                                        autoComplete="new-password"
                                        onChange={(e) => setData('password', e.target.value)}
                                        placeholder="••••••••"
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="absolute inset-y-0 left-0 pl-3 flex items-center"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? (
                                            <FaEyeSlash className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                        ) : (
                                            <FaEye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                        )}
                                    </button>
                                </div>
                                <InputError message={errors.password} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel
                                    htmlFor="password_confirmation"
                                    value="تأكيد كلمة المرور"
                                    className="text-sm font-medium text-gray-700 mb-2"
                                />
                                <div className="relative">
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                        <FaLock className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <TextInput
                                        id="password_confirmation"
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        name="password_confirmation"
                                        value={data.password_confirmation}
                                        className="block w-full pr-10 pl-3 py-3 border-2 border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-legacy-green focus:border-legacy-green sm:text-sm transition-all"
                                        autoComplete="new-password"
                                        onChange={(e) => setData('password_confirmation', e.target.value)}
                                        placeholder="••••••••"
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="absolute inset-y-0 left-0 pl-3 flex items-center"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    >
                                        {showConfirmPassword ? (
                                            <FaEyeSlash className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                        ) : (
                                            <FaEye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                        )}
                                    </button>
                                </div>
                                <InputError
                                    message={errors.password_confirmation}
                                    className="mt-2"
                                />
                            </div>

                            <div>
                                <PrimaryButton
                                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-legacy-green to-legacy-blue hover:from-primary-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-legacy-green disabled:opacity-50"
                                    disabled={processing || ((data.role === 'student' || data.role === 'teacher') && !data.school_id) || (schools && schools.length === 0 && (data.role === 'student' || data.role === 'teacher'))}
                                >
                                    {processing ? (
                                        <div className="flex items-center">
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            جاري إنشاء الحساب...
                                        </div>
                                    ) : (
                                        'إنشاء حساب'
                                    )}
                                </PrimaryButton>
                            </div>

                            <div className="text-center">
                                <p className="text-sm text-gray-600">
                                    لديك حساب بالفعل؟{' '}
                                    <Link
                                        href={route('login')}
                                        className="font-medium text-legacy-green hover:text-primary-600"
                                    >
                                        سجل الدخول
                                    </Link>
                                </p>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
}