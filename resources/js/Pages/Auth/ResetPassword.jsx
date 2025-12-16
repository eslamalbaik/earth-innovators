import { useState } from 'react';
import { Link, useForm } from '@inertiajs/react';
import { FaLock, FaEye, FaEyeSlash, FaCheck, FaArrowRight } from 'react-icons/fa';
import ApplicationLogo from '@/Components/ApplicationLogo';

export default function ResetPassword({ token, email, status }) {
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        token: token,
        email: email,
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post('/reset-password');
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8" dir="rtl">
            <div className="max-w-md w-full space-y-8">
                <div className="flex flex-col items-center">
                    <div>
                        <Link href="/">
                            <ApplicationLogo className="block h-9 w-auto fill-current text-gray-800" />
                        </Link>
                    </div>
                    <h2 className="text-center text-3xl font-extrabold text-gray-900 mt-4">
                        إعادة تعيين كلمة المرور
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        أدخل كلمة المرور الجديدة
                    </p>
                </div>

                {status && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <FaCheck className="h-5 w-5 text-green-400" />
                            </div>
                            <div className="mr-3">
                                <p className="text-sm text-green-800">{status}</p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="bg-white shadow-lg rounded-2xl px-8 py-10">
                    <form className="space-y-6" onSubmit={submit}>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                    كلمة المرور الجديدة
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                        <FaLock className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        id="password"
                                        name="password"
                                        type={showPassword ? 'text' : 'password'}
                                        autoComplete="new-password"
                                        required
                                        className="block w-full pr-10 pl-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-legacy-green focus:border-legacy-green sm:text-sm"
                                        placeholder="كلمة المرور الجديدة"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
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
                                {errors.password && (
                                    <p className="mt-2 text-sm text-red-600">{errors.password}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700 mb-2">
                                    تأكيد كلمة المرور
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                        <FaLock className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        id="password_confirmation"
                                        name="password_confirmation"
                                        type={showPasswordConfirmation ? 'text' : 'password'}
                                        autoComplete="new-password"
                                        required
                                        className="block w-full pr-10 pl-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-legacy-green focus:border-legacy-green sm:text-sm"
                                        placeholder="تأكيد كلمة المرور"
                                        value={data.password_confirmation}
                                        onChange={(e) => setData('password_confirmation', e.target.value)}
                                    />
                                    <button
                                        type="button"
                                        className="absolute inset-y-0 left-0 pl-3 flex items-center"
                                        onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
                                    >
                                        {showPasswordConfirmation ? (
                                            <FaEyeSlash className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                        ) : (
                                            <FaEye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                        )}
                                    </button>
                                </div>
                                {errors.password_confirmation && (
                                    <p className="mt-2 text-sm text-red-600">{errors.password_confirmation}</p>
                                )}
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-legacy-green to-legacy-blue hover:from-primary-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-legacy-green disabled:opacity-50"
                            >
                                {processing ? (
                                    <div className="flex items-center">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        جاري التحديث...
                                    </div>
                                ) : (
                                    'تحديث كلمة المرور'
                                )}
                            </button>
                        </div>

                        <div className="text-center">
                            <Link
                                href="/login"
                                className="font-medium text-legacy-green hover:text-primary-600 flex items-center justify-center gap-2"
                            >
                                <FaArrowRight />
                                العودة لتسجيل الدخول
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
