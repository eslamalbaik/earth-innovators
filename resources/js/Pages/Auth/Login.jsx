import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
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

            <div className="min-h-screen flex items-center justify-center py-8 px-4">
                <div className="max-w-md w-full space-y-6">
                    <div className="flex flex-col items-center">
                        <div>
                            <Link href="/">
                                <ApplicationLogo className="block h-9 w-auto fill-current text-gray-800" />
                            </Link>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">
                            تسجيل الدخول
                        </h2>
                    </div>

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

                    <div className="bg-white shadow-lg rounded-2xl px-4 py-10">
                        <form onSubmit={submit} className="space-y-6">
                            <div>
                                <InputLabel value="الدخول كـ" className="text-sm font-medium text-gray-700 mb-3" />
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    {[
                                        { key: 'student', label: 'طالب', description: 'للوصول إلى لوحة الطالب' },
                                        { key: 'teacher', label: 'معلم', description: 'للوصول إلى لوحة المعلم' },
                                        { key: 'school', label: 'مدرسة', description: 'للوصول إلى لوحة المدرسة' },
                                        { key: 'educational_institution', label: 'مؤسسة تعليمية', description: 'للوصول إلى لوحة المؤسسة التعليمية' },
                                    ].map((roleOption) => {
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
                                                    {roleOption.key === 'student' ? 'الدخول كطالب' : roleOption.key === 'teacher' ? 'الدخول كمعلم' : roleOption.key === 'school' ? 'الدخول كمدرسة' : 'الدخول كمؤسسة تعليمية'}
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
                                        className="block w-full pr-10 pl-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-legacy-green focus:border-legacy-green sm:text-sm"
                                        autoComplete="username"
                                        isFocused={true}
                                        onChange={(e) => setData('email', e.target.value)}
                                        placeholder="example@email.com"
                                    />
                                </div>
                                <InputError message={errors.email} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="password" value="كلمة المرور" className="text-sm font-medium text-gray-700 mb-2" />
                                <div className="relative">
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                        <FaLock className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <TextInput
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        value={data.password}
                                        className="block w-full pr-10 pl-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-legacy-green focus:border-legacy-green sm:text-sm"
                                        autoComplete="current-password"
                                        onChange={(e) => setData('password', e.target.value)}
                                        placeholder="••••••••"
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
                                            className="font-medium text-legacy-green hover:text-primary-600"
                                        >
                                            نسيت كلمة المرور؟
                                        </Link>
                                    </div>
                                )}
                            </div>

                            <div>
                                <PrimaryButton
                                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-legacy-green to-legacy-blue hover:from-primary-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-legacy-green disabled:opacity-50"
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
                                            className="font-medium text-legacy-green hover:text-primary-600"
                                        >
                                            إنشاء حساب جديد
                                        </Link>
                                    </p>
                                </div>
                                <div className="text-sm text-gray-500 border-t border-gray-200 pt-3">
                                    <p>
                                        أنت مشرف؟{' '}
                                        <Link
                                            href={route('admin.login')}
                                            className="font-medium text-legacy-blue hover:text-blue-700"
                                        >
                                            تسجيل دخول الأدمن
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
