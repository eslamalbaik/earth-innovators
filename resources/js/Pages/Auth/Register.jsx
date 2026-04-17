import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import SelectInput from '@/Components/SelectInput';
import GuestLayout from '@/Layouts/GuestLayout';
import ApplicationLogo from '@/Components/ApplicationLogo';
import { Head, Link, useForm, usePage, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaPhone, FaExclamationTriangle, FaTimes, FaSchool, FaUserGraduate, FaChalkboardTeacher, FaUniversity } from 'react-icons/fa';
import { getTranslation, useTranslation } from '@/i18n';
import PhoneInput from '@/Components/PhoneInput';

const getCsrfToken = () => document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';

export default function Register({ schools = [] }) {
    const { t, language } = useTranslation();
    const { props } = usePage();
    const phoneInUseMessage = getTranslation('ar', 'auth.phoneInUseMessage');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [showErrorsAlert, setShowErrorsAlert] = useState(true);
    const [pageErrors, setPageErrors] = useState({});

    const { data, setData, post, processing, errors: formErrors } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: 'student',
        phone: '',
        school_id: '',
    });

    const roleOptions = [
        { key: 'student', label: t('roles.student'), description: t('auth.createAsStudent'), icon: FaUserGraduate },
        { key: 'teacher', label: t('roles.teacher'), description: t('auth.createAsTeacher'), icon: FaChalkboardTeacher },
        { key: 'school', label: t('roles.school'), description: t('auth.createAsSchool'), icon: FaSchool },
        { key: 'educational_institution', label: t('roles.educationalInstitution'), description: t('auth.createAsInstitution'), icon: FaUniversity },
    ];

    // Collect errors from Inertia (usePage), local state, or useForm
    const errors = props.errors || pageErrors || formErrors;

    // Show error alert when new errors appear
    useEffect(() => {
        if (Object.keys(errors).length > 0) {
            setShowErrorsAlert(true);
        }
    }, [errors]);

    // Sync errors from props.errors when they change
    useEffect(() => {
        if (props.errors && Object.keys(props.errors).length > 0) {
            setPageErrors(props.errors);
            setShowErrorsAlert(true);
        }
    }, [props.errors]);

    // Clear school_id when switching role to school
    useEffect(() => {
        if (data.role === 'school') {
            setData('school_id', '');
        }
    }, [data.role]);

    const submit = (e) => {
        e.preventDefault();

        const dataToSend = { ...data };

        // PhoneInput already returns a full E.164 number e.g. +971501234567
        if (data.phone && data.phone.trim() !== '' && data.phone !== '+971') {
            dataToSend.phone = data.phone;
        } else {
            dataToSend.phone = null;
        }

        dataToSend._token = getCsrfToken();

        router.post(route('register'), dataToSend, {
            preserveScroll: true,
            onSuccess: () => {
                setShowErrorsAlert(false);
                setPageErrors({});
            },
            onError: (errors) => {
                setPageErrors(errors);
                setShowErrorsAlert(true);
            },
        });
    };

    return (
        <GuestLayout>
            <Head title={t('auth.register')} />
            <div dir={language === 'ar' ? 'rtl' : 'ltr'} className="flex items-center justify-center sm:px-4">
                <div className="w-full sm:space-y-8">
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
                            <div>
                                <div className='text-xs mb-1 opacity-75'>{t('auth.createAccountAs')}</div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5 md:gap-3">
                                    {roleOptions.map((roleOption) => {
                                        const isActive = data.role === roleOption.key;
                                        const IconComponent = roleOption.icon;
                                        return (
                                            <button
                                                key={roleOption.key}
                                                type="button"
                                                onClick={() => setData('role', roleOption.key)}
                                                className={`relative flex flex-col items-center justify-center rounded-xl border px-3 py-3 transition duration-200 ${isActive
                                                    ? 'border-[#A3C042] bg-gradient-to-br from-[#A3C042]/10 to-legacy-blue/10 text-[#A3C042] shadow-sm'
                                                    : 'border-gray-200 bg-gray-50 hover:border-[#A3C042]/50 hover:bg-[#A3C042]/5 text-gray-700'
                                                    }`}
                                            >
                                                <IconComponent className={`h-4 w-4 md:h-5 md:w-5 mb-1 ${isActive ? 'text-[#A3C042]' : 'text-gray-500'}`} />
                                                <span className="text-xs md:text-sm font-medium text-center">
                                                    {roleOption.label}
                                                </span>
                                                {isActive && (
                                                    <span className="absolute top-3 left-3 h-2 w-2 rounded-full bg-[#A3C042]" aria-hidden="true"></span>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                                <InputError message={errors.role} className="mt-2" />
                            </div>

                            {/* School selector for students and teachers */}
                            {(data.role === 'student' || data.role === 'teacher') && (
                                <div>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 start-0 ps-3 flex items-center pointer-events-none">
                                            <FaSchool className="h-5 w-5 text-gray-400" />
                                        </div>
                                        {schools && schools.length > 0 ? (
                                            <SelectInput
                                                id="school_id"
                                                name="school_id"
                                                value={data.school_id}
                                                onChange={(e) => setData('school_id', e.target.value)}
                                                className="block w-full ps-10 pe-3 py-3 border-2 border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-1 sm:text-sm transition-all"
                                                required
                                            >
                                                <option value="">{t('auth.selectSchool')}</option>
                                                {schools.map((school) => (
                                                    <option key={school.id} value={school.id}>
                                                        {school.name}
                                                    </option>
                                                ))}
                                            </SelectInput>
                                        ) : (
                                            <div className="block w-full ps-10 pe-3 py-2 border border-red-300 rounded-md shadow-sm bg-red-50 text-red-700 text-sm">
                                                <p className="font-semibold">{t('auth.noInstitutions')}</p>
                                                <p className="text-xs mt-1">{t('auth.contactAdmin')}</p>
                                            </div>
                                        )}
                                    </div>
                                    <InputError message={errors.school_id} className="mt-2" />
                                    {schools && schools.length === 0 && (
                                        <p className="mt-2 text-sm text-red-600">
                                            {t('auth.schoolRequired')}
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Show all errors at the top of the form */}
                            {showErrorsAlert && Object.keys(errors).length > 0 && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                                    <div className="flex items-start justify-between">
                                            <div className="flex items-start">
                                            <FaExclamationTriangle className="text-red-500 text-xl mt-0.5 me-3 flex-shrink-0" />
                                            <div className="flex-1">
                                                <h3 className="text-sm font-semibold text-red-800 mb-2">
                                                    {t('auth.fixErrors')}
                                                </h3>
                                                <ul className="list-disc list-inside space-y-1 text-sm text-red-700">
                                                    {Object.entries(errors).map(([key, value]) => {
                                                        const errorMessage = Array.isArray(value) ? value[0] : value;
                                                        // Highlight duplicate phone error
                                                        const isPhoneUniqueError = key === 'phone' && errorMessage && errorMessage.includes(phoneInUseMessage);
                                                        return (
                                                            <li
                                                                key={key}
                                                                className={isPhoneUniqueError ? 'font-bold text-red-900 bg-red-100 px-2 py-1 rounded' : ''}
                                                            >
                                                                {errorMessage}
                                                            </li>
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

                            <div>
                                <div className="relative">
                                    <div className="absolute inset-y-0 start-0 ps-3 flex items-center pointer-events-none">
                                        <FaUser className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <TextInput
                                        id="name"
                                        name="name"
                                        value={data.name}
                                        className="block w-full ps-10 pe-3 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#A3C042] focus:border-[#A3C042] sm:text-sm"
                                        autoComplete="name"
                                        isFocused={true}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder={t('auth.fullName')}
                                        required
                                    />
                                </div>
                                <InputError message={errors.name} className="mt-2" />
                            </div>

                            <div>
                                <div className="relative">
                                    <div className="absolute inset-y-0 start-0 ps-3 flex items-center pointer-events-none">
                                        <FaEnvelope className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <TextInput
                                        id="email"
                                        type="email"
                                        name="email"
                                        value={data.email}
                                        className="block w-full ps-10 pe-3 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#A3C042] focus:border-[#A3C042] sm:text-sm"
                                        autoComplete="username"
                                        onChange={(e) => setData('email', e.target.value)}
                                        placeholder={t('auth.email')}
                                        required
                                    />
                                </div>
                                <InputError message={errors.email} className="mt-2" />
                            </div>

                            <div>
                                <PhoneInput
                                    id="phone"
                                    name="phone"
                                    value={data.phone || ''}
                                    onChange={(full) => setData('phone', full)}
                                    error={errors.phone || ''}
                                />
                            </div>

                            <div>
                                <div className="relative">
                                    <div className="absolute inset-y-0 start-0 ps-3 flex items-center pointer-events-none">
                                        <FaLock className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <TextInput
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        value={data.password}
                                        className="block w-full ps-10 pe-3 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#A3C042] focus:border-[#A3C042] sm:text-sm"
                                        autoComplete="new-password"
                                        onChange={(e) => setData('password', e.target.value)}
                                        placeholder={t('auth.password')}
                                        required
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
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        name="password_confirmation"
                                        value={data.password_confirmation}
                                        className="block w-full ps-10 pe-3 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#A3C042] focus:border-[#A3C042] sm:text-sm"
                                        autoComplete="new-password"
                                        onChange={(e) => setData('password_confirmation', e.target.value)}
                                        placeholder={t('auth.confirmPassword')}
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="absolute inset-y-0 end-0 pe-3 flex items-center"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    >
                                        {showConfirmPassword ? (
                                            <FaEyeSlash className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                        ) : (
                                            <FaEye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                        )}
                                    </button>
                                </div>
                                <InputError
                                    message={errors.password_confirmation}
                                    className="mt-2"
                                />
                            </div>

                            <div>
                                <PrimaryButton
                                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white !bg-[#A3C042] hover:!bg-[#F9D536] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#A3C042] disabled:opacity-50"
                                    disabled={processing || ((data.role === 'student' || data.role === 'teacher') && !data.school_id) || (schools && schools.length === 0 && (data.role === 'student' || data.role === 'teacher'))}
                                >
                                    {processing ? (
                                        <div className="flex items-center">
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white ms-2"></div>
                                            {t('auth.creating')}
                                        </div>
                                    ) : (
                                        t('auth.register')
                                    )}
                                </PrimaryButton>
                            </div>

                            <div className="text-center">
                                <p className="text-sm text-gray-600">
                                    {t('auth.hasAccount')}{' '}
                                    <Link
                                        href={route('login')}
                                        className="font-medium text-[#A3C042] hover:text-[#F9D536]"
                                    >
                                        {t('auth.login')}
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
