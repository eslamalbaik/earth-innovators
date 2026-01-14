import { useState } from 'react';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';
import { FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';

export default function ConfirmPassword() {
    const [showPassword, setShowPassword] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({
        password: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('password.confirm'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="تأكيد كلمة المرور" />
            <div className="flex items-center justify-center sm:px-4">
                <div className="w-full sm:space-y-8">
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
                                <h2 className="text-2xl font-extrabold text-gray-900 mb-2">
                                    تأكيد كلمة المرور
                                </h2>
                                <p className="text-sm text-gray-600">
                                    هذه منطقة آمنة من التطبيق. يرجى تأكيد كلمة المرور للمتابعة.
                                </p>
                            </div>

                            <div>
                                <div className="relative">
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                        <FaLock className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <TextInput
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        value={data.password}
                                        className="block w-full ps-10 pe-3 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#A3C042] focus:border-[#A3C042] sm:text-sm"
                                        autoComplete="current-password"
                                        isFocused={true}
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

                            <div>
                                <PrimaryButton
                                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white !bg-[#A3C042] hover:!bg-[#F9D536] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#A3C042] disabled:opacity-50"
                                    disabled={processing}
                                >
                                    {processing ? (
                                        <div className="flex items-center">
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white me-2"></div>
                                            جاري التأكيد...
                                        </div>
                                    ) : (
                                        'تأكيد'
                                    )}
                                </PrimaryButton>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
}
