import { useState } from 'react';
import { Link, useForm } from '@inertiajs/react';
import { FaLock, FaEye, FaEyeSlash, FaCheck, FaArrowRight } from 'react-icons/fa';
import GuestLayout from '@/Layouts/GuestLayout';
import ApplicationLogo from '@/Components/ApplicationLogo';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import { Head } from '@inertiajs/react';
import { useTranslation } from '@/i18n';

export default function ResetPassword({ token, email, status }) {
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);
    const { t } = useTranslation();

    const { data, setData, post, processing, errors } = useForm({
        token: token,
        email: email,
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('password.store'));
    };

    return (
        <GuestLayout>
            <Head title={t('auth.resetPasswordTitle')} />
            <div className="flex items-center justify-center sm:px-4">
                <div className="w-full sm:space-y-8">
                    {status && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 animate-fadeInUp">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <FaCheck className="h-5 w-5 text-green-400" />
                                </div>
                                <div className="ms-3">
                                    <p className="text-sm font-medium text-green-800">{status}</p>
                                </div>
                            </div>
                        </div>
                    )}

<div className="relative min-h-screen overflow-hidden bg-white shadow-lg sm:rounded-2xl px-4 py-10 w-[100vw] sm:w-[400px] md:w-[450px] max-w-5xl sm:mx-auto">
<form onSubmit={submit} className="space-y-6">
                            <img src="/images/avatar.svg" alt={t('common.avatar')} className="absolute -top-24 -left-24 w-48 h-48" />
                            <img src="/images/avatar1.svg" alt={t('common.avatar')} className="absolute -bottom-8 right-0 w-28 h-28" />
                            <div className="flex flex-col items-center">
                                <div>
                                    <img
                                        src="/images/logo-modified.png"
                                        alt={t('common.appName')}
                                        className="h-24 w-auto object-contain"
                                    />
                                </div>
                            </div>

                            <div className="text-center">
                                <h2 className="text-2xl font-extrabold text-gray-900 mb-2">
                                    {t('auth.resetPasswordTitle')}
                                </h2>
                                <p className="text-sm text-gray-600">
                                    {t('auth.resetPasswordSubtitle')}
                                </p>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 start-0 ps-3 flex items-center pointer-events-none">
                                            <FaLock className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <TextInput
                                            id="password"
                                            name="password"
                                            type={showPassword ? 'text' : 'password'}
                                            autoComplete="new-password"
                                            required
                                            className="block w-full ps-10 pe-3 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#A3C042] focus:border-[#A3C042] sm:text-sm"
                                            placeholder={t('auth.newPassword')}
                                            value={data.password}
                                            onChange={(e) => setData('password', e.target.value)}
                                        />
                                        <button
                                            type="button"
                                            className="absolute inset-y-0 end-0 pe-3 flex items-center"
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
                                    <div className="relative">
                                        <div className="absolute inset-y-0 start-0 ps-3 flex items-center pointer-events-none">
                                            <FaLock className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <TextInput
                                            id="password_confirmation"
                                            name="password_confirmation"
                                            type={showPasswordConfirmation ? 'text' : 'password'}
                                            autoComplete="new-password"
                                            required
                                            className="block w-full ps-10 pe-3 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#A3C042] focus:border-[#A3C042] sm:text-sm"
                                            placeholder={t('auth.confirmPassword')}
                                            value={data.password_confirmation}
                                            onChange={(e) => setData('password_confirmation', e.target.value)}
                                        />
                                        <button
                                            type="button"
                                            className="absolute inset-y-0 end-0 pe-3 flex items-center"
                                            onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
                                        >
                                            {showPasswordConfirmation ? (
                                                <FaEyeSlash className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                            ) : (
                                                <FaEye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                            )}
                                        </button>
                                    </div>
                                    <InputError message={errors.password_confirmation} className="mt-2" />
                                </div>
                            </div>

                            <div>
                                <PrimaryButton
                                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white !bg-[#A3C042] hover:!bg-[#F9D536] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#A3C042] disabled:opacity-50"
                                    disabled={processing}
                                >
                                    {processing ? (
                                        <div className="flex items-center">
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white me-2"></div>
                                            {t('auth.updating')}
                                        </div>
                                    ) : (
                                        t('auth.updatePassword')
                                    )}
                                </PrimaryButton>
                            </div>

                            <div className="text-center">
                                <Link
                                    href={route('login')}
                                    className="font-medium text-[#A3C042] hover:text-[#F9D536] flex items-center justify-center gap-2"
                                >
                                    <FaArrowRight />
                                    {t('auth.backToLogin')}
                                </Link>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
}
