import { useState } from 'react';
import { Link, useForm } from '@inertiajs/react';
import { FaEnvelope, FaArrowRight, FaLock } from 'react-icons/fa';
import ApplicationLogo from '@/Components/ApplicationLogo';

export default function ForgotPassword({ status }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post('/forgot-password');
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
                    <h2 className="text-center text-3xl font-extrabold text-gray-900">
                        نسيان كلمة المرور
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة تعيين كلمة المرور
                    </p>
                </div>

                {status && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <FaEnvelope className="h-5 w-5 text-green-400" />
                            </div>
                            <div className="mr-3">
                                <p className="text-sm text-green-800">{status}</p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="bg-white shadow-lg rounded-2xl px-8 py-10">
                    <form className="space-y-6" onSubmit={submit}>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                البريد الإلكتروني
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                    <FaEnvelope className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    className="block w-full pr-10 pl-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-yellow-400 focus:border-yellow-400 sm:text-sm"
                                    placeholder="example@email.com"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                />
                            </div>
                            {errors.email && (
                                <p className="mt-2 text-sm text-red-600">{errors.email}</p>
                            )}
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-yellow-400 hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50"
                            >
                                {processing ? (
                                    <div className="flex items-center">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        جاري الإرسال...
                                    </div>
                                ) : (
                                    'إرسال رابط إعادة التعيين'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}