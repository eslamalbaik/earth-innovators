import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import GuestLayout from '@/Layouts/GuestLayout';
import ApplicationLogo from '@/Components/ApplicationLogo';
import { Head, Link, useForm, usePage, router } from '@inertiajs/react';
import { useEffect, useState, useRef } from 'react';
import { FaKey, FaEnvelope, FaUser, FaPhone, FaExclamationTriangle, FaTimes } from 'react-icons/fa';
import axios from 'axios';

export default function VerifyOtpJoinTeacher() {
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
        phone: userData?.phone || '',
        dial_code: userData?.dial_code || '+966',
        city: userData?.city || '',
        password: userData?.password || '',
        password_confirmation: userData?.password_confirmation || '',
        bio: userData?.bio || '',
        subjects: userData?.subjects || [],
        stages: userData?.stages || [],
        price_per_hour: userData?.price_per_hour || 0,
        certifications: userData?.certifications || [],
        experiences: userData?.experiences || [],
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
        const numericValue = value.replace(/\D/g, '');

        if (numericValue.length > 1) {
            const digits = numericValue.slice(0, 4).split('');
            const newOtpValues = [...otpValues];
            digits.forEach((digit, i) => {
                if (index + i < 4) {
                    newOtpValues[index + i] = digit;
                }
            });
            setOtpValues(newOtpValues);

            const otpCode = newOtpValues.join('');
            setData('otp_code', otpCode);

            const lastIndex = Math.min(index + digits.length - 1, 3);
            if (lastIndex < 3 && otpCode.length < 4) {
                setActiveIndex(lastIndex + 1);
                inputRefs[lastIndex + 1].current?.focus();
            } else if (otpCode.length === 4) {
                setTimeout(() => {
                    handleSubmit();
                }, 100);
            }
        } else {
            const newOtpValues = [...otpValues];
            newOtpValues[index] = numericValue;
            setOtpValues(newOtpValues);

            const otpCode = newOtpValues.join('');
            setData('otp_code', otpCode);

            if (numericValue && index < 3) {
                setActiveIndex(index + 1);
                inputRefs[index + 1].current?.focus();
            } else if (otpCode.length === 4) {
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
        } else if (e.key === 'ArrowRight' && index < 3) {
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

        const formDataToSend = new FormData();

        // دمج رقم الجوال مع المقدمة
        let cleanedPhone = String(userData?.phone || data.phone || '').replace(/\D/g, '');
        if (cleanedPhone.startsWith('0')) {
            cleanedPhone = cleanedPhone.substring(1);
        }
        const fullPhone = `${userData?.dial_code || data.dial_code || '+966'}${cleanedPhone}`;

        // إضافة جميع البيانات من userData
        if (userData) {
            Object.keys(userData).forEach(key => {
                if (key === 'dial_code' || key === 'password' || key === 'password_confirmation') {
                    // dial_code تم دمجه مع phone، password موجود في userData
                    return;
                }
                if (key === 'subjects' || key === 'stages' || key === 'certifications' || key === 'experiences') {
                    if (userData[key] && Array.isArray(userData[key]) && userData[key].length > 0) {
                        formDataToSend.append(key, JSON.stringify(userData[key]));
                    }
                } else if (key === 'profile_image' && userData[key] instanceof File) {
                    formDataToSend.append(key, userData[key]);
                } else if (userData[key] !== null && userData[key] !== '' && userData[key] !== undefined) {
                    if (key === 'price_per_hour') {
                        formDataToSend.append(key, parseFloat(userData[key]) || 0);
                    } else {
                        formDataToSend.append(key, userData[key]);
                    }
                }
            });
        }

        // إضافة OTP
        formDataToSend.append('otp_code', otpCode);
        formDataToSend.append('otp_token', otpData?.token || data.otp_token);
        formDataToSend.append('phone', fullPhone);

        axios.post('/join-teacher', formDataToSend, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        }).then(response => {
            if (response.data.success) {
                if (response.data.redirect) {
                    router.visit(response.data.redirect);
                } else {
                    router.visit('/');
                }
            }
        }).catch(err => {
            if (err.response?.data?.errors) {
                if (err.response.data.errors.otp_code) {
                    setPageErrors({ otp_code: err.response.data.errors.otp_code[0] });
                    setShowErrorsAlert(true);
                    setOtpValues(['', '', '', '']);
                    setActiveIndex(0);
                    inputRefs[0].current?.focus();
                } else {
                    setPageErrors(err.response.data.errors);
                    setShowErrorsAlert(true);
                }
            } else {
                setPageErrors({ otp_code: err.response?.data?.message || 'حدث خطأ أثناء التحقق من الرمز' });
                setShowErrorsAlert(true);
            }
        });
    };

    if (!otpData?.token) {
        return (
            <GuestLayout>
                <Head title="رمز التحقق" />
                <div className="flex items-center justify-center min-h-screen py-8 px-4">
                    <div className="max-w-md w-full text-center">
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                            <p className="text-red-800">رمز التحقق غير متوفر. يرجى العودة إلى صفحة الانضمام.</p>
                        </div>
                        <Link
                            href="/join-teacher"
                            className="text-yellow-600 hover:text-yellow-500 font-medium"
                        >
                            العودة إلى صفحة الانضمام
                        </Link>
                    </div>
                </div>
            </GuestLayout>
        );
    }

    return (
        <GuestLayout>
            <Head title="رمز التحقق" />

            <div className="flex items-center justify-center py-8 px-4">
                <div className="max-w-md w-full space-y-6">
                    <div className="flex flex-col items-center">
                        <div>
                            <Link href="/">
                                <ApplicationLogo className="block h-9 w-auto fill-current text-gray-800" />
                            </Link>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mt-4">
                            تأكيد رمز التحقق
                        </h2>
                    </div>

                    <div className="bg-white shadow-lg rounded-2xl px-4 py-10 min-w-[92vw] sm:min-w-[350px]">
                        {/* عرض بيانات المستخدم */}
                        <div className="mb-6 space-y-3">
                            <div className="flex items-center gap-3 text-sm text-gray-700">
                                <FaUser className="text-gray-400" />
                                <span className="font-medium">الاسم:</span>
                                <span>{userData?.name || 'غير متوفر'}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-gray-700">
                                <FaEnvelope className="text-gray-400" />
                                <span className="font-medium">البريد الإلكتروني:</span>
                                <span>{otpData?.email || userData?.email || 'غير متوفر'}</span>
                            </div>
                            {userData?.phone && (
                                <div className="flex items-center gap-3 text-sm text-gray-700">
                                    <FaPhone className="text-gray-400" />
                                    <span className="font-medium">رقم الجوال:</span>
                                    <span>{userData.dial_code || '+966'} {userData.phone}</span>
                                </div>
                            )}
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
                                                className={`w-16 h-16 text-center text-2xl font-bold border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all ${activeIndex === originalIndex
                                                    ? 'border-yellow-400 ring-2 ring-yellow-400'
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
                                    يرجى إدخاله خلال 10 دقائق لإكمال عملية الانضمام.
                                </p>
                            </div>

                            <div>
                                <PrimaryButton
                                    type="submit"
                                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-yellow-400 hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50"
                                    disabled={processing || otpValues.join('').length !== 4}
                                >
                                    {processing ? (
                                        <div className="flex items-center">
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
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
                                        href="/join-teacher"
                                        className="font-medium text-yellow-600 hover:text-yellow-500"
                                    >
                                        العودة إلى صفحة الانضمام
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

