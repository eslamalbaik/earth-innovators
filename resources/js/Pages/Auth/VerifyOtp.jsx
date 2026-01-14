import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import GuestLayout from '@/Layouts/GuestLayout';
import ApplicationLogo from '@/Components/ApplicationLogo';
import { Head, Link, useForm, usePage, router } from '@inertiajs/react';
import { useEffect, useState, useRef } from 'react';
import { FaKey, FaEnvelope, FaUser, FaPhone, FaExclamationTriangle, FaTimes } from 'react-icons/fa';

export default function VerifyOtp() {
    const { props } = usePage();
    const otpData = props.otp || null;
    const userData = props.userData || null;

    const [otpValues, setOtpValues] = useState(['', '', '', '']);
    const [activeIndex, setActiveIndex] = useState(0);
    const inputRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];
    const [showErrorsAlert, setShowErrorsAlert] = useState(true);
    const [pageErrors, setPageErrors] = useState({});

    const { data, setData, post, processing, errors: formErrors } = useForm({
        otp_code: '',
        otp_token: otpData?.token || '',
        name: userData?.name || '',
        email: userData?.email || '',
        password: userData?.password || '',
        password_confirmation: userData?.password_confirmation || '',
        phone: userData?.phone || '',
        role: 'student',
    });

    const errors = props.errors || pageErrors || formErrors;

    useEffect(() => {
        if (otpData?.token) {
            setData('otp_token', otpData.token);
        }
        if (inputRefs[0].current) {
            setTimeout(() => {
                inputRefs[0].current?.focus();
            }, 100);
        }
    }, [otpData]);

    useEffect(() => {
        if (Object.keys(errors).length > 0) {
            setShowErrorsAlert(true);
        }
    }, [errors]);

    useEffect(() => {
        if (props.errors && Object.keys(props.errors).length > 0) {
            setPageErrors(props.errors);
            setShowErrorsAlert(true);
        }
    }, [props.errors]);

    const handleOtpChange = (index, value) => {
        // السماح فقط بالأرقام
        const numericValue = value.replace(/\D/g, '');

        if (numericValue.length > 1) {
            // إذا تم لصق عدة أرقام
            const digits = numericValue.slice(0, 4).split('');
            const newOtpValues = [...otpValues];
            digits.forEach((digit, i) => {
                if (index + i < 4) {
                    newOtpValues[index + i] = digit;
                }
            });
            setOtpValues(newOtpValues);

            // تحديث otp_code
            const otpCode = newOtpValues.join('');
            setData('otp_code', otpCode);

            // الانتقال إلى المربع المناسب في RTL
            const lastIndex = Math.min(index + digits.length - 1, 3);
            if (lastIndex < 3 && otpCode.length < 4) {
                // الانتقال إلى المربع التالي (من اليسار) في RTL
                setActiveIndex(lastIndex + 1);
                inputRefs[lastIndex + 1].current?.focus();
            } else if (otpCode.length === 4) {
                // إرسال تلقائي عند اكتمال 4 أرقام
                setTimeout(() => {
                    handleSubmit();
                }, 100);
            }
        } else {
            // إدخال رقم واحد
            const newOtpValues = [...otpValues];
            newOtpValues[index] = numericValue;
            setOtpValues(newOtpValues);

            // تحديث otp_code
            const otpCode = newOtpValues.join('');
            setData('otp_code', otpCode);

            // الانتقال إلى المربع التالي (من اليسار) في RTL
            if (numericValue && index < 3) {
                setActiveIndex(index + 1);
                inputRefs[index + 1].current?.focus();
            } else if (otpCode.length === 4) {
                // إرسال تلقائي عند اكتمال 4 أرقام
                setTimeout(() => {
                    handleSubmit();
                }, 100);
            }
        }
    };

    const handleKeyDown = (index, e) => {
        // في RTL: index 0 هو المربع الأول من اليسار، index 3 هو المربع الأخير من اليمين
        if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
            // الانتقال إلى المربع السابق (من اليمين) عند الضغط على Backspace
            setActiveIndex(index - 1);
            inputRefs[index - 1].current?.focus();
        } else if (e.key === 'Backspace' && otpValues[index]) {
            // مسح الرقم الحالي
            const newOtpValues = [...otpValues];
            newOtpValues[index] = '';
            setOtpValues(newOtpValues);
            setData('otp_code', newOtpValues.join(''));
        } else if (e.key === 'ArrowLeft' && index > 0) {
            // الانتقال إلى المربع السابق (من اليمين) في RTL
            setActiveIndex(index - 1);
            inputRefs[index - 1].current?.focus();
        } else if (e.key === 'ArrowRight' && index < 3) {
            // الانتقال إلى المربع التالي (من اليسار) في RTL
            setActiveIndex(index + 1);
            inputRefs[index + 1].current?.focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4);
        if (pastedData.length > 0) {
            const digits = pastedData.split('');
            const newOtpValues = [...otpValues];
            // في RTL: index 0 هو أول مربع من اليسار
            digits.forEach((digit, i) => {
                if (i < 4) {
                    newOtpValues[i] = digit;
                }
            });
            setOtpValues(newOtpValues);
            const otpCode = newOtpValues.join('');
            setData('otp_code', otpCode);

            if (otpCode.length === 4) {
                setTimeout(() => {
                    handleSubmit();
                }, 100);
            } else {
                // الانتقال إلى المربع التالي (من اليسار) في RTL
                const nextIndex = Math.min(3, pastedData.length);
                setActiveIndex(nextIndex);
                inputRefs[nextIndex].current?.focus();
            }
        }
    };

    const handleSubmit = (e) => {
        if (e) e.preventDefault();

        const otpCode = otpValues.join('');
        if (otpCode.length !== 4) {
            return;
        }

        setData('otp_code', otpCode);

        // إرسال البيانات مع OTP
        // ملاحظة: كلمة المرور موجودة في payload داخل EmailOtp ولا نحتاج إرسالها
        const dataToSend = {
            otp_code: otpCode,
            otp_token: otpData?.token || data.otp_token,
            name: userData?.name || data.name,
            email: userData?.email || otpData?.email || data.email,
            phone: userData?.phone || data.phone,
            role: 'student',
        };

        router.post(route('register'), dataToSend, {
            preserveScroll: true,
            onSuccess: () => {
                setShowErrorsAlert(false);
                setPageErrors({});
            },
            onError: (errors) => {
                console.error('OTP verification errors:', errors);
                setPageErrors(errors);
                setShowErrorsAlert(true);
                // مسح OTP عند الخطأ
                setOtpValues(['', '', '', '']);
                setActiveIndex(0);
                inputRefs[0].current?.focus();
            },
        });
    };

    if (!otpData?.token) {
        return (
            <GuestLayout>
                <Head title="رمز التحقق" />
                <div className="flex items-center justify-center min-h-screen py-8 px-4">
                    <div className="max-w-md w-full text-center">
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                            <p className="text-red-800">رمز التحقق غير متوفر. يرجى العودة إلى صفحة التسجيل.</p>
                        </div>
                        <Link
                            href={route('register')}
                            className="text-yellow-600 hover:text-yellow-500 font-medium"
                        >
                            العودة إلى التسجيل
                        </Link>
                    </div>
                </div>
            </GuestLayout>
        );
    }

    return (
        <GuestLayout>
            <Head title="رمز التحقق" />
            <div className="flex items-center justify-center sm:px-4">
                <div className="w-full sm:space-y-8">
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
                                تأكيد رمز التحقق
                            </h2>
                            <p className="text-sm text-gray-600 mb-4">
                                أدخل رمز التحقق المكون من 4 أرقام المرسل إلى بريدك الإلكتروني
                            </p>
                            <div className="space-y-2 text-sm text-gray-700">
                                <div className="flex items-center justify-center gap-3">
                                    <FaUser className="text-gray-400" />
                                    <span className="font-medium">الاسم:</span>
                                    <span>{userData?.name || 'غير متوفر'}</span>
                                </div>
                                <div className="flex items-center justify-center gap-3">
                                    <FaEnvelope className="text-gray-400" />
                                    <span className="font-medium">البريد الإلكتروني:</span>
                                    <span>{otpData?.email || userData?.email || 'غير متوفر'}</span>
                                </div>
                                {userData?.phone && (
                                    <div className="flex items-center justify-center gap-3">
                                        <FaPhone className="text-gray-400" />
                                        <span className="font-medium">رقم الجوال:</span>
                                        <span>{userData.phone}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* عرض جميع الأخطاء */}
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
                                    أدخل رمز التحقق المكون من 4 أرقام
                                </label>
                                <div className="flex justify-center gap-3">
                                    {otpValues.slice().reverse().map((value, reverseIndex) => {
                                        // حساب index الأصلي (من اليمين إلى اليسار)
                                        const originalIndex = 3 - reverseIndex;
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
                                                className={`w-16 h-16 text-center text-2xl font-bold border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A3C042] transition-all ${activeIndex === originalIndex
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
                                    تم إرسال رمز مكون من 4 أرقام إلى بريدك الإلكتروني{' '}
                                    <span className="font-medium">{otpData?.email || userData?.email}</span>.
                                    <br />
                                    يرجى إدخاله خلال 10 دقائق لإكمال إنشاء الحساب.
                                </p>
                            </div>

                            <div>
                                <PrimaryButton
                                    type="submit"
                                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white !bg-[#A3C042] hover:!bg-[#F9D536] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#A3C042] disabled:opacity-50"
                                    disabled={processing || otpValues.join('').length !== 4}
                                >
                                    {processing ? (
                                        <div className="flex items-center">
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white me-2"></div>
                                            جاري التحقق...
                                        </div>
                                    ) : (
                                        'تأكيد الرمز'
                                    )}
                                </PrimaryButton>
                            </div>

                            <div className="text-center">
                                <p className="text-sm text-gray-600">
                                    لم تستلم الرمز؟{' '}
                                    <Link
                                        href={route('register')}
                                        className="font-medium text-[#A3C042] hover:text-[#F9D536]"
                                    >
                                        العودة إلى التسجيل
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

