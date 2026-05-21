import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import PasswordInput from '@/Components/PasswordInput';
import GuestLayout from '@/Layouts/GuestLayout';
import ApplicationLogo from '@/Components/ApplicationLogo';
import { Head, Link, usePage } from '@inertiajs/react';
import { FaEnvelope, FaLock } from 'react-icons/fa';
import { useTranslation } from '@/i18n';

const csrfToken = () =>
    typeof document !== 'undefined'
        ? document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? ''
        : '';

export default function AdminLogin({ status }) {
    const { t } = useTranslation();
    const { errors, old: oldInput = {} } = usePage().props;

    const fieldError = (name) => {
        const value = errors?.[name];
        return Array.isArray(value) ? value[0] : value;
    };

    return (
        <GuestLayout>
            <Head title={t('adminLoginPage.pageTitle', { appName: t('common.appName') })} />

            <div className="min-h-screen flex items-center justify-center py-8 px-4">
                <div className="max-w-md w-full space-y-6">
                    <div className="flex flex-col items-center">
                        <div>
                            <Link href="/">
                                <ApplicationLogo className="block h-9 w-auto fill-current text-gray-800" />
                            </Link>
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900">
                            {t('adminLoginPage.title')}
                        </h2>
                    </div>

                    {status && (
                        <div className="rounded-md bg-green-50 p-4">
                            <div className="flex">
                                <div className="me-3">
                                    <p className="text-sm font-medium text-green-800">
                                        {status}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="bg-white shadow-lg rounded-2xl px-4 py-10 min-w-[92vw] sm:min-w-[350px]">
                        {/* Full page POST avoids Inertia 409 (CSRF / asset version) loops on production */}
                        <form
                            method="POST"
                            action={route('admin.login.store')}
                            className="space-y-6"
                        >
                            <input type="hidden" name="_token" value={csrfToken()} />
                            <input type="hidden" name="role" value="admin" />

                            <div>
                                <InputLabel htmlFor="email" value={t('adminLoginPage.emailLabel')} className="text-sm font-medium text-gray-700 mb-2" />
                                <div className="relative">
                                    <div className="absolute inset-y-0 start-0 ps-3 flex items-center pointer-events-none">
                                        <FaEnvelope className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <TextInput
                                        id="email"
                                        type="email"
                                        name="email"
                                        defaultValue={oldInput.email ?? ''}
                                        className="block w-full ps-10 pe-3 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#A3C042] focus:border-[#A3C042] sm:text-sm"
                                        autoComplete="username"
                                        isFocused
                                        placeholder={t('adminLoginPage.emailPlaceholder')}
                                        required
                                    />
                                </div>
                                <InputError message={fieldError('email')} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="password" value={t('adminLoginPage.passwordLabel')} className="text-sm font-medium text-gray-700 mb-2" />
                                <div className="relative">
                                    <div className="absolute inset-y-0 start-0 ps-3 flex items-center pointer-events-none">
                                        <FaLock className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <PasswordInput
                                        id="password"
                                        name="password"
                                        className="block w-full"
                                        inputClassName="ps-10 pe-11 py-3 border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#A3C042] focus:border-[#A3C042] sm:text-sm"
                                        autoComplete="current-password"
                                        placeholder={t('adminLoginPage.passwordPlaceholder')}
                                        required
                                    />
                                </div>
                                <InputError message={fieldError('password')} className="mt-2" />
                            </div>

                            <InputError message={fieldError('role')} className="mt-2" />

                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <Checkbox
                                        name="remember"
                                        defaultChecked={!!oldInput.remember}
                                    />
                                    <label className="ms-2 block text-sm text-gray-900">
                                        {t('adminLoginPage.rememberMe')}
                                    </label>
                                </div>
                            </div>

                            <div>
                                <PrimaryButton
                                    type="submit"
                                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#A3C042] hover:from-primary-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#A3C042] disabled:opacity-50"
                                >
                                    {t('adminLoginPage.loginButton')}
                                </PrimaryButton>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
}
