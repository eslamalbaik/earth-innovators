import PrimaryButton from '@/Components/PrimaryButton';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FaEnvelope, FaSignOutAlt } from 'react-icons/fa';

export default function VerifyEmail({ status }) {
    const { post, processing } = useForm({});

    const submit = (e) => {
        e.preventDefault();
        post(route('verification.send'));
    };

    return (
        <GuestLayout>
            <Head title="التحقق من البريد الإلكتروني" />
            <div className="flex items-center justify-center sm:px-4">
                <div className="w-full sm:space-y-8">
                    {status === 'verification-link-sent' && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 animate-fadeInUp">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="mr-3">
                                    <p className="text-sm font-medium text-green-800">
                                        تم إرسال رابط التحقق الجديد إلى عنوان البريد الإلكتروني الذي قدمته أثناء التسجيل.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="relative overflow-hidden bg-white shadow-lg sm:rounded-2xl px-4 py-10 w-[100vw] sm:w-[400px] md:w-[450px] max-w-5xl sm:mx-auto">
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
                                <div className="w-16 h-16 bg-gradient-to-br from-[#A3C042]/20 to-[#93b03a]/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <FaEnvelope className="text-[#A3C042] text-2xl" />
                                </div>
                                <h2 className="text-2xl font-extrabold text-gray-900 mb-2">
                                    التحقق من البريد الإلكتروني
                                </h2>
                                <p className="text-sm text-gray-600">
                                    شكراً لك على التسجيل! قبل البدء، يرجى التحقق من عنوان بريدك الإلكتروني بالنقر على الرابط الذي أرسلناه إليك. إذا لم تستلم البريد الإلكتروني، سنرسل لك رابطاً آخر بكل سرور.
                                </p>
                            </div>

                            <div className="space-y-3">
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
                                        'إعادة إرسال رابط التحقق'
                                    )}
                                </PrimaryButton>

                                <Link
                                    href={route('logout')}
                                    method="post"
                                    as="button"
                                    className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#A3C042]"
                                >
                                    <FaSignOutAlt />
                                    تسجيل الخروج
                                </Link>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
}
