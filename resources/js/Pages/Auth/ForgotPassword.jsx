import { Link, useForm } from '@inertiajs/react';
import { FaEnvelope, FaArrowRight, FaLock } from 'react-icons/fa';
import GuestLayout from '@/Layouts/GuestLayout';
import ApplicationLogo from '@/Components/ApplicationLogo';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import { Head } from '@inertiajs/react';

export default function ForgotPassword({ status }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('password.email'));
    };

    return (
        <GuestLayout>
            <Head title="نسيان كلمة المرور" />
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
                                    <p className="text-sm font-medium text-green-800">{status}</p>
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

                            <div className="text-center">
                                <h2 className="text-2xl font-extrabold text-gray-900 mb-2">
                                    نسيان كلمة المرور
                                </h2>
                                <p className="text-sm text-gray-600">
                                    أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة تعيين كلمة المرور
                                </p>
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
                                        autoComplete="email"
                                        isFocused={true}
                                        onChange={(e) => setData('email', e.target.value)}
                                        placeholder="البريد الإلكتروني"
                                    />
                                </div>
                                <InputError message={errors.email} className="mt-2" />
                            </div>

                            <div>
                                <PrimaryButton
                                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white !bg-[#A3C042] hover:!bg-[#F9D536] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#A3C042] disabled:opacity-50"
                                    disabled={processing}
                                >
                                    {processing ? (
                                        <div className="flex items-center">
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white me-2"></div>
                                            جاري الإرسال...
                                        </div>
                                    ) : (
                                        'إرسال رابط إعادة التعيين'
                                    )}
                                </PrimaryButton>
                            </div>

                            <div className="text-center">
                                <Link
                                    href={route('login')}
                                    className="font-medium text-[#A3C042] hover:text-[#F9D536] flex items-center justify-center gap-2"
                                >
                                    <FaArrowRight />
                                    العودة لتسجيل الدخول
                                </Link>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
}