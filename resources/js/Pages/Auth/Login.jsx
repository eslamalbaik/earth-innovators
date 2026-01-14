import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaUserGraduate, FaChalkboardTeacher, FaSchool, FaUniversity } from 'react-icons/fa';
import { useState } from 'react';
import ApplicationLogo from '@/Components/ApplicationLogo';

export default function Login({ status, canResetPassword }) {
    const [showPassword, setShowPassword] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
        role: 'student',
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
            onSuccess: () => {
                // التحقق من وجود pendingBooking في sessionStorage
                try {
                    const pendingBooking = sessionStorage.getItem('pendingBooking');
                    if (pendingBooking) {
                        // التحقق من صلاحية البيانات (أقل من 24 ساعة)
                        const bookingState = JSON.parse(pendingBooking);
                        const oneDayInMs = 24 * 60 * 60 * 1000;
                        if (Date.now() - bookingState.timestamp < oneDayInMs) {
                            // إذا كان هناك حجز معلق، التوجيه إلى الصفحة الرئيسية
                            // استخدام window.location.href للتأكد من التوجيه حتى لو كان هناك redirect من الـ server
                            window.location.href = '/';
                            return;
                        } else {
                            // حذف البيانات القديمة
                            sessionStorage.removeItem('pendingBooking');
                        }
                    }
                    // إذا لم يكن هناك حجز معلق، السماح بالسلوك الافتراضي (التوجيه إلى /dashboard)
                } catch (error) {
                    console.error('Error checking pending booking:', error);
                    sessionStorage.removeItem('pendingBooking');
                    // في حالة الخطأ، السماح بالسلوك الافتراضي
                }
            },
        });
    };

    return (
        <GuestLayout>
            <Head title="تسجيل الدخول" />

            <div className="flex items-center justify-center sm:px-4">
                <div className="w-full sm:space-y-8">
                    {status && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 animate-fadeInUp">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="mr-3">
                                    <p className="text-sm font-medium text-green-800">
                                        {status}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

<div className="relative min-h-screen overflow-hidden bg-white shadow-lg sm:rounded-2xl px-4 py-10 w-[100vw] sm:w-[400px] md:w-[450px] max-w-5xl sm:mx-auto">
<form onSubmit={submit} className="space-y-6">
                            <img src="/images/avatar.svg" alt="avatar" className="absolute -top-24 -left-24 w-48 h-48" />
                            <img src="/images/avatar1.svg" alt="avatar" className="absolute -bottom-8 right-0 w-28 h-28" />
                            <div className="flex flex-col items-center">
                                <div>
                                    <img
                                        src="/images/logo-modified.png"
                                        alt="إرث المبتكرين - Innovators Legacy"
                                        className="h-24 w-auto object-contain"
                                    />
                                </div>
                            </div>

                            <div>
                            <div className='text-xs mb-1 opacity-75'>الدخول كـ</div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5 md:gap-3">
                                    {[
                                        { key: 'student', label: 'طالب', description: 'للوصول إلى لوحة الطالب', icon: FaUserGraduate },
                                        { key: 'teacher', label: 'معلم', description: 'للوصول إلى لوحة المعلم', icon: FaChalkboardTeacher },
                                        { key: 'school', label: 'مدرسة', description: 'للوصول إلى لوحة المدرسة', icon: FaSchool },
                                        { key: 'educational_institution', label: 'مؤسسة تعليمية', description: 'للوصول إلى لوحة المؤسسة التعليمية', icon: FaUniversity },
                                    ].map((roleOption) => {
                                        const isActive = data.role === roleOption.key;
                                        const IconComponent = roleOption.icon;
                                        return (
                                            <button
                                                key={roleOption.key}
                                                type="button"
                                                onClick={() => setData('role', roleOption.key)}
                                                className={`relative flex flex-col items-center justify-center rounded-xl border px-3 py-3 transition duration-200 ${isActive
                                                    ? 'border-[#A3C042] bg-gradient-to-br from-[#A3C042]/10 to-legacy-blue/10 text-[#A3C042] shadow-sm'
                                                    : 'border-gray-200 bg-gray-50 hover:border-[#A3C042]/50 hover:bg-[#A3C042]/5 text-gray-700'
                                                    }`}
                                            >
                                                <IconComponent className={`h-4 w-4 md:h-5 md:w-5 mb-1 ${isActive ? 'text-[#A3C042]' : 'text-gray-500'}`} />
                                                <span className="text-xs md:text-sm font-medium text-center">
                                                    {roleOption.label}
                                                </span>

                                                {isActive && (
                                                    <span className="absolute top-3 left-3 h-2 w-2 rounded-full bg-[#A3C042]" aria-hidden="true"></span>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                                <InputError message={errors.role} className="mt-2" />
                            </div>

                            <div>
                                <div className="relative">
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                        <FaEnvelope className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <TextInput
                                        id="email"
                                        type="email"
                                        name="email"
                                        value={data.email}
                                        className="block w-full ps-10 pe-3 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#A3C042] focus:border-[#A3C042] sm:text-sm"
                                        autoComplete="username"
                                        isFocused={true}
                                        onChange={(e) => setData('email', e.target.value)}
                                        placeholder="البريد الإلكتروني"
                                    />
                                </div>
                                <InputError message={errors.email} className="mt-2" />
                            </div>

                            <div>
                                <div className="relative">
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                        <FaLock className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <TextInput
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        value={data.password}
                                        className="block w-full ps-10 pe-3 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#A3C042] focus:border-[#A3C042] sm:text-sm"
                                        autoComplete="current-password"
                                        onChange={(e) => setData('password', e.target.value)}
                                        placeholder="كلمة المرور"
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

                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <Checkbox
                                        name="remember"
                                        checked={data.remember}
                                        onChange={(e) => setData('remember', e.target.checked)}
                                    />
                                    <label className="ms-2 block text-sm text-gray-900">
                                        تذكرني
                                    </label>
                                </div>

                                {canResetPassword && (
                                    <div className="text-sm">
                                        <Link
                                            href={route('password.request')}
                                            className="font-medium text-[#A3C042] hover:text-[#F9D536]"
                                        >
                                            نسيت كلمة المرور؟
                                        </Link>
                                    </div>
                                )}
                            </div>

                            <div className='flex flex-col items-center justify-start gap-2'>
                                <PrimaryButton
                                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white !bg-[#A3C042] hover:!bg-[#F9D536] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#A3C042] disabled:opacity-50"
                                    disabled={processing}
                                >
                                    {processing ? (
                                        <div className="flex items-center">
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white me-2"></div>
                                            جاري تسجيل الدخول...
                                        </div>
                                    ) : (
                                        'تسجيل الدخول'
                                    )}
                                </PrimaryButton>
                            </div>

                            <div className="text-center space-y-2"> 
                                <div className="text-sm text-gray-600">
                                    <p>
                                        ليس لديك حساب؟{' '}
                                        <Link
                                            href={route('register')}
                                            className="font-medium text-[#A3C042] hover:text-[#F9D536]"
                                            >
                                            إنشاء حساب جديد
                                        </Link>
                                    </p>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
}
