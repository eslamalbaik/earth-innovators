import { useState, useRef, useEffect } from 'react';
import { Link, useForm, router } from '@inertiajs/react';
import { FaKey, FaEnvelope, FaExclamationTriangle, FaTimes, FaLock } from 'react-icons/fa';
import GuestLayout from '@/Layouts/GuestLayout';
import ApplicationLogo from '@/Components/ApplicationLogo';
import PrimaryButton from '@/Components/PrimaryButton';
import InputError from '@/Components/InputError';
import { Head } from '@inertiajs/react';

export default function ResetPasswordOtp({ token, email, status }) {
    const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);
    const [activeIndex, setActiveIndex] = useState(0);
    const inputRefs = [
        useRef(null),
        useRef(null),
        useRef(null),
        useRef(null),
        useRef(null),
        useRef(null),
    ];
    const [showErrorsAlert, setShowErrorsAlert] = useState(true);

    const { data, setData, post, processing, errors } = useForm({
        token: token,
        email: email,
        otp_code: '',
    });

    useEffect(() => {
        if (inputRefs[0].current) {
            setTimeout(() => {
                inputRefs[0].current?.focus();
            }, 100);
        }
    }, []);

    useEffect(() => {
        if (Object.keys(errors).length > 0) {
            setShowErrorsAlert(true);
        }
    }, [errors]);

    const handleOtpChange = (index, value) => {
        // Allow only numbers
        const numericValue = value.replace(/\D/g, '');

        if (numericValue.length > 1) {
            // If multiple digits pasted
            const digits = numericValue.slice(0, 6).split('');
            const newOtpValues = [...otpValues];
            digits.forEach((digit, i) => {
                if (index + i < 6) {
                    newOtpValues[index + i] = digit;
                }
            });
            setOtpValues(newOtpValues);

            // Update otp_code
            const otpCode = newOtpValues.join('');
            setData('otp_code', otpCode);

            // Move to appropriate box in RTL
            const lastIndex = Math.min(index + digits.length - 1, 5);
            if (lastIndex < 5 && otpCode.length < 6) {
                setActiveIndex(lastIndex + 1);
                inputRefs[lastIndex + 1].current?.focus();
            } else if (otpCode.length === 6) {
                // Auto-submit when 6 digits complete
                setTimeout(() => {
                    handleSubmit();
                }, 100);
            }
        } else {
            // Single digit input
            const newOtpValues = [...otpValues];
            newOtpValues[index] = numericValue;
            setOtpValues(newOtpValues);

            // Update otp_code
            const otpCode = newOtpValues.join('');
            setData('otp_code', otpCode);

            // Move to next box in RTL
            if (numericValue && index < 5) {
                setActiveIndex(index + 1);
                inputRefs[index + 1].current?.focus();
            } else if (otpCode.length === 6) {
                // Auto-submit when 6 digits complete
                setTimeout(() => {
                    handleSubmit();
                }, 100);
            }
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
            setActiveIndex(index - 1);
            inputRefs[index - 1].current?.focus();
        } else if (e.key === 'Backspace' && otpValues[index]) {
            const newOtpValues = [...otpValues];
            newOtpValues[index] = '';
            setOtpValues(newOtpValues);
            setData('otp_code', newOtpValues.join(''));
        } else if (e.key === 'ArrowLeft' && index > 0) {
            setActiveIndex(index - 1);
            inputRefs[index - 1].current?.focus();
        } else if (e.key === 'ArrowRight' && index < 5) {
            setActiveIndex(index + 1);
            inputRefs[index + 1].current?.focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        if (pastedData.length > 0) {
            const digits = pastedData.split('');
            const newOtpValues = [...otpValues];
            digits.forEach((digit, i) => {
                if (i < 6) {
                    newOtpValues[i] = digit;
                }
            });
            setOtpValues(newOtpValues);
            const otpCode = newOtpValues.join('');
            setData('otp_code', otpCode);

            if (otpCode.length === 6) {
                setTimeout(() => {
                    handleSubmit();
                }, 100);
            } else {
                const nextIndex = Math.min(5, pastedData.length);
                setActiveIndex(nextIndex);
                inputRefs[nextIndex].current?.focus();
            }
        }
    };

    const handleSubmit = (e) => {
        if (e) e.preventDefault();

        const otpCode = otpValues.join('');
        if (otpCode.length !== 6) {
            return;
        }

        setData('otp_code', otpCode);

        post('/reset-password/verify-otp', {
            preserveScroll: true,
            onSuccess: () => {
                setShowErrorsAlert(false);
            },
            onError: (errors) => {
                setShowErrorsAlert(true);
                // Clear OTP on error
                setOtpValues(['', '', '', '', '', '']);
                setActiveIndex(0);
                inputRefs[0].current?.focus();
            },
        });
    };

    return (
        <GuestLayout>
            <Head title="التحقق من رمز إعادة تعيين كلمة المرور" />
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

                        <div className="text-center mb-6">
                            <h2 className="text-2xl font-extrabold text-gray-900 mb-2">
                                التحقق من رمز إعادة تعيين كلمة المرور
                            </h2>
                            <p className="text-sm text-gray-600 mb-4">
                                أدخل رمز التحقق المكون من 6 أرقام المرسل إلى بريدك الإلكتروني
                            </p>
                            <div className="flex items-center justify-center gap-3 text-sm text-gray-700">
                                <FaEnvelope className="text-gray-400" />
                                <span className="font-medium">البريد الإلكتروني:</span>
                                <span>{email}</span>
                            </div>
                        </div>

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
                                                    return (
                                                        <li key={key}>{errorMessage}</li>
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

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-4 text-center">
                                    أدخل رمز التحقق المكون من 6 أرقام
                                </label>
                                <div className="flex justify-center gap-3">
                                    {otpValues.slice().reverse().map((value, reverseIndex) => {
                                        const originalIndex = 5 - reverseIndex;
                                        return (
                                            <input
                                                key={originalIndex}
                                                ref={inputRefs[originalIndex]}
                                                type="text"
                                                inputMode="numeric"
                                                maxLength={1}
                                                value={value}
                                                onChange={(e) => handleOtpChange(originalIndex, e.target.value)}
                                                onKeyDown={(e) => handleKeyDown(originalIndex, e)}
                                                onPaste={originalIndex === 0 ? handlePaste : undefined}
                                                onFocus={() => setActiveIndex(originalIndex)}
                                                className={`w-14 h-14 text-center text-2xl font-bold border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A3C042] transition-all ${activeIndex === originalIndex
                                                        ? 'border-[#A3C042] ring-2 ring-[#A3C042]'
                                                        : value
                                                            ? 'border-green-400'
                                                            : 'border-gray-300'
                                                    }`}
                                                autoComplete="off"
                                                dir="ltr"
                                            />
                                        );
                                    })}
                                </div>
                                <InputError message={errors.otp_code} className="mt-2 text-center" />
                                <p className="mt-4 text-xs text-gray-500 text-center">
                                    تم إرسال رمز مكون من 6 أرقام إلى بريدك الإلكتروني{' '}
                                    <span className="font-medium">{email}</span>.
                                    <br />
                                    يرجى إدخاله خلال 10 دقائق لإعادة تعيين كلمة المرور.
                                </p>
                            </div>

                            <div>
                                <PrimaryButton
                                    type="submit"
                                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white !bg-[#A3C042] hover:!bg-[#F9D536] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#A3C042] disabled:opacity-50"
                                    disabled={processing || otpValues.join('').length !== 6}
                                >
                                    {processing ? (
                                        <div className="flex items-center">
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white me-2"></div>
                                            جاري التحقق...
                                        </div>
                                    ) : (
                                        'التحقق من الرمز'
                                    )}
                                </PrimaryButton>
                            </div>

                            <div className="text-center space-y-2">
                                <p className="text-sm text-gray-600">
                                    لم تستلم الرمز؟{' '}
                                    <Link
                                        href={route('password.request')}
                                        className="font-medium text-[#A3C042] hover:text-[#F9D536]"
                                    >
                                        إعادة الإرسال
                                    </Link>
                                </p>
                                <p className="text-sm text-gray-600">
                                    <Link
                                        href={route('login')}
                                        className="font-medium text-[#A3C042] hover:text-[#F9D536] flex items-center justify-center gap-2"
                                    >
                                        <FaLock />
                                        العودة لتسجيل الدخول
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
