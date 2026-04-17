import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { FaEdit, FaEnvelope, FaPhone, FaSave, FaUpload, FaUser } from 'react-icons/fa';
import { useEffect, useRef, useState } from 'react';
import { getColorFromName, getInitials } from '@/utils/imageUtils';
import { useToast } from '@/Contexts/ToastContext';
import { useTranslation } from '@/i18n';
import PhoneInput from '@/Components/PhoneInput';

const NATIONALITY_OPTIONS = [
    { value: 'إماراتي', key: 'emirati' },
    { value: 'سعودي', key: 'saudi' },
    { value: 'مصري', key: 'egyptian' },
    { value: 'سوري', key: 'syrian' },
    { value: 'أردني', key: 'jordanian' },
    { value: 'لبناني', key: 'lebanese' },
    { value: 'أخرى', key: 'other' },
];

const GENDER_OPTIONS = [
    { value: 'ذكر', translationKey: 'common.gender.male' },
    { value: 'أنثى', translationKey: 'common.gender.female' },
];

const getImageUrl = (image) => {
    if (!image) return null;
    if (image.startsWith('http://') || image.startsWith('https://')) {
        return image;
    }
    if (image.startsWith('/storage/')) {
        return image;
    }
    return `/storage/${image}`;
};

const getMembershipTypeKey = (membershipType) => {
    if (membershipType === 'subscription' || membershipType === 'premium') {
        return 'subscription';
    }

    return 'basic';
};

const getContractStatusKey = (contractStatus, isActive) => {
    if (['active', 'inactive', 'expired', 'pending'].includes(contractStatus)) {
        return contractStatus;
    }

    return isActive ? 'active' : 'inactive';
};

export default function Profile({ teacher }) {
    const { showError } = useToast();
    const { t } = useTranslation();
    const [isEditing, setIsEditing] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);
    const fileInputRef = useRef(null);

    const { data, setData, processing, errors, reset } = useForm({
        name_ar: teacher?.name_ar || '',
        name_en: teacher?.name_en || '',
        nationality: teacher?.nationality || 'إماراتي',
        gender: teacher?.gender || '',
        bio: teacher?.bio || '',
        email: teacher?.email || teacher?.user?.email || '',
        phone: teacher?.phone || teacher?.user?.phone || '',
    });

    useEffect(() => {
        return () => {
            if (imagePreview) {
                URL.revokeObjectURL(imagePreview);
            }
        };
    }, [imagePreview]);

    const handleImageChange = (event) => {
        const file = event.target.files?.[0];

        if (!file) {
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            showError(t('teacherDashboardProfilePage.errors.imageTooLarge', { maxMb: 2 }));
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
            return;
        }

        if (!file.type.startsWith('image/')) {
            showError(t('teacherDashboardProfilePage.errors.fileNotImage'));
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
            return;
        }

        if (imagePreview) {
            URL.revokeObjectURL(imagePreview);
        }

        setSelectedImage(file);
        setImagePreview(URL.createObjectURL(file));
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        const formData = new FormData();

        [
            'name_ar',
            'name_en',
            'nationality',
            'gender',
            'bio',
            'email',
            'phone',
        ].forEach((field) => {
            formData.append(field, data[field] ?? '');
        });

        if (selectedImage) {
            formData.append('image', selectedImage);
        }

        formData.append('_method', 'PUT');

        router.post('/teacher/profile', formData, {
            forceFormData: true,
            preserveScroll: false,
            onSuccess: () => {
                setIsEditing(false);
                if (imagePreview) {
                    URL.revokeObjectURL(imagePreview);
                }
                setImagePreview(null);
                setSelectedImage(null);
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }

                setTimeout(() => {
                    router.reload({
                        only: ['teacher', 'auth'],
                        preserveScroll: false,
                    });
                }, 200);
            },
            onError: (formErrors) => {
                const visibleFields = [
                    'image',
                    'name_ar',
                    'name_en',
                    'nationality',
                    'gender',
                    'bio',
                    'email',
                    'phone',
                ];

                const validationSummary = Object.entries(formErrors)
                    .filter(([field]) => visibleFields.includes(field))
                    .map(([field, message]) => {
                        const fieldLabels = {
                            image: t('teacherDashboardProfilePage.fields.image'),
                            name_ar: t('teacherDashboardProfilePage.fields.nameAr'),
                            name_en: t('teacherDashboardProfilePage.fields.nameEn'),
                            nationality: t('teacherDashboardProfilePage.fields.nationality'),
                            gender: t('teacherDashboardProfilePage.fields.gender'),
                            bio: t('teacherDashboardProfilePage.fields.bio'),
                            email: t('teacherDashboardProfilePage.fields.email'),
                            phone: t('teacherDashboardProfilePage.fields.phone'),
                        };

                        const normalizedMessage = Array.isArray(message) ? message.join(', ') : message;

                        return `${fieldLabels[field] || field}: ${normalizedMessage}`;
                    })
                    .join('\n');

                showError(
                    validationSummary
                        ? `${t('teacherDashboardProfilePage.errors.saveFailed')}\n${validationSummary}`
                        : t('teacherDashboardProfilePage.errors.saveFailed'),
                    { autoDismiss: 6000 }
                );
            },
        });
    };

    const toggleEdit = () => {
        if (isEditing) {
            reset();
            if (imagePreview) {
                URL.revokeObjectURL(imagePreview);
            }
            setImagePreview(null);
            setSelectedImage(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }

        setIsEditing((current) => !current);
    };

    const teacherName = teacher?.name_ar || t('common.teacher');
    const membershipTypeKey = getMembershipTypeKey(data.membership_type);
    const contractStatusKey = getContractStatusKey(data.contract_status, teacher?.is_active);
    const statusNoteKey = teacher?.is_active
        ? 'teacherDashboardProfilePage.statusNote.active'
        : 'teacherDashboardProfilePage.statusNote.awaitingSchoolActivation';

    return (
        <DashboardLayout header={t('teacherDashboardProfilePage.title')}>
            <Head title={t('teacherDashboardProfilePage.pageTitle', { appName: t('common.appName') })} />

            <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
                <section className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200">
                    <div className="bg-gradient-to-r from-[#fff7d6] via-[#fef3c7] to-white px-6 py-6 sm:px-8">
                        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                            <div className="flex items-start gap-4">
                                <div className="relative shrink-0">
                                    {imagePreview || getImageUrl(teacher?.image) ? (
                                        <img
                                            src={imagePreview || getImageUrl(teacher?.image)}
                                            alt={teacherName}
                                            className="h-24 w-24 rounded-3xl border-4 border-white object-cover shadow-md"
                                        />
                                    ) : (
                                        <div
                                            className="flex h-24 w-24 items-center justify-center rounded-3xl border-4 border-white text-3xl font-bold text-white shadow-md"
                                            style={{
                                                background: `linear-gradient(135deg, ${getColorFromName(teacherName).split(', ')[0]}, ${getColorFromName(teacherName).split(', ')[1]})`,
                                            }}
                                        >
                                            {getInitials(teacherName)}
                                        </div>
                                    )}

                                    {isEditing && (
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="absolute -bottom-2 start-2 inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#A3C042] text-white shadow-lg transition hover:bg-[#8aac35]"
                                            title={t('teacherDashboardProfilePage.actions.changeImage')}
                                        >
                                            <FaUpload className="text-sm" />
                                        </button>
                                    )}

                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="hidden"
                                    />
                                </div>

                                <div className="min-w-0">
                                    <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">{teacherName}</h1>
                                    {teacher?.name_en && (
                                        <p className="mt-1 text-sm text-slate-600 sm:text-base">{teacher.name_en}</p>
                                    )}

                                    <div className="mt-4 flex flex-wrap items-center gap-3">
                                        <span
                                            className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${
                                                teacher?.is_active
                                                    ? 'bg-emerald-100 text-emerald-800'
                                                    : 'bg-amber-100 text-amber-800'
                                            }`}
                                        >
                                            {teacher?.is_active
                                                ? t('teacherDashboardProfilePage.badges.active')
                                                : t('teacherDashboardProfilePage.badges.inactive')}
                                        </span>
                                        <span className="text-sm text-slate-600">{t(statusNoteKey)}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-3">
                                <div className="rounded-2xl bg-white/90 px-4 py-3 text-sm text-slate-700 shadow-sm ring-1 ring-slate-200">
                                    <div className="font-semibold text-slate-900">{t('teacherDashboardProfilePage.fields.email')}</div>
                                    <div>{data.email || t('common.notAvailable')}</div>
                                </div>
                                <button
                                    type="button"
                                    onClick={toggleEdit}
                                    className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                                >
                                    <FaEdit />
                                    {isEditing
                                        ? t('teacherDashboardProfilePage.actions.cancelEdit')
                                        : t('teacherDashboardProfilePage.actions.editProfile')}
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8">
                            <div className="mb-6">
                                <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900">
                                    <FaUser className="text-[#A3C042]" />
                                    {t('teacherDashboardProfilePage.sections.personalInfo')}
                                </h2>
                                <p className="mt-2 text-sm text-slate-600">
                                    {t('teacherDashboardProfilePage.statusNote.membershipManagedBySchool')}
                                </p>
                            </div>

                            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-slate-700">
                                        {t('teacherDashboardProfilePage.fields.nameAr')} *
                                    </label>
                                    <input
                                        type="text"
                                        value={data.name_ar}
                                        onChange={(event) => setData('name_ar', event.target.value)}
                                        disabled={!isEditing}
                                        className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm shadow-sm focus:border-[#A3C042] focus:outline-none focus:ring-2 focus:ring-[#DCE8B3] disabled:bg-slate-50"
                                        required
                                    />
                                    {errors.name_ar && <p className="mt-2 text-sm text-red-600">{errors.name_ar}</p>}
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-slate-700">
                                        {t('teacherDashboardProfilePage.fields.nameEn')} *
                                    </label>
                                    <input
                                        type="text"
                                        value={data.name_en}
                                        onChange={(event) => setData('name_en', event.target.value)}
                                        disabled={!isEditing}
                                        className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm shadow-sm focus:border-[#A3C042] focus:outline-none focus:ring-2 focus:ring-[#DCE8B3] disabled:bg-slate-50"
                                        required
                                    />
                                    {errors.name_en && <p className="mt-2 text-sm text-red-600">{errors.name_en}</p>}
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-slate-700">
                                        {t('teacherDashboardProfilePage.fields.nationality')} *
                                    </label>
                                    <select
                                        value={data.nationality}
                                        onChange={(event) => setData('nationality', event.target.value)}
                                        disabled={!isEditing}
                                        className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm shadow-sm focus:border-[#A3C042] focus:outline-none focus:ring-2 focus:ring-[#DCE8B3] disabled:bg-slate-50"
                                        required
                                    >
                                        <option value="">{t('teacherDashboardProfilePage.placeholders.selectNationality')}</option>
                                        {NATIONALITY_OPTIONS.map((option) => (
                                            <option key={option.key} value={option.value}>
                                                {option.key === 'other'
                                                    ? t('common.other')
                                                    : t(`teacherDashboardProfilePage.nationalities.${option.key}`)}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.nationality && <p className="mt-2 text-sm text-red-600">{errors.nationality}</p>}
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-slate-700">
                                        {t('teacherDashboardProfilePage.fields.gender')} *
                                    </label>
                                    <select
                                        value={data.gender}
                                        onChange={(event) => setData('gender', event.target.value)}
                                        disabled={!isEditing}
                                        className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm shadow-sm focus:border-[#A3C042] focus:outline-none focus:ring-2 focus:ring-[#DCE8B3] disabled:bg-slate-50"
                                        required
                                    >
                                        <option value="">{t('teacherDashboardProfilePage.placeholders.selectGender')}</option>
                                        {GENDER_OPTIONS.map((option) => (
                                            <option key={option.value} value={option.value}>
                                                {t(option.translationKey)}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.gender && <p className="mt-2 text-sm text-red-600">{errors.gender}</p>}
                                </div>

                                <div>
                                    <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                                        <FaEnvelope className="text-slate-400" />
                                        {t('teacherDashboardProfilePage.fields.email')} *
                                    </label>
                                    <input
                                        type="email"
                                        value={data.email}
                                        onChange={(event) => setData('email', event.target.value)}
                                        disabled={!isEditing}
                                        className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm shadow-sm focus:border-[#A3C042] focus:outline-none focus:ring-2 focus:ring-[#DCE8B3] disabled:bg-slate-50"
                                        required
                                    />
                                    {errors.email && <p className="mt-2 text-sm text-red-600">{errors.email}</p>}
                                </div>

                                <div>
                                    <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                                        <FaPhone className="text-slate-400" />
                                        {t('teacherDashboardProfilePage.fields.phone')} *
                                    </label>
                                    <PhoneInput
                                        id="phone"
                                        name="phone"
                                        value={data.phone || ''}
                                        onChange={(full) => setData('phone', full)}
                                        disabled={!isEditing}
                                        error={errors.phone || ''}
                                    />
                                </div>
                            </div>

                            <div className="mt-5">
                                <label className="mb-2 block text-sm font-medium text-slate-700">
                                    {t('teacherDashboardProfilePage.fields.bio')} *
                                </label>
                                <textarea
                                    value={data.bio}
                                    onChange={(event) => setData('bio', event.target.value)}
                                    disabled={!isEditing}
                                    rows={5}
                                    className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm shadow-sm focus:border-[#A3C042] focus:outline-none focus:ring-2 focus:ring-[#DCE8B3] disabled:bg-slate-50"
                                    placeholder={t('teacherDashboardProfilePage.placeholders.bio')}
                                    required
                                />
                                {errors.bio && <p className="mt-2 text-sm text-red-600">{errors.bio}</p>}
                            </div>
                        </div>

                        {isEditing && (
                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="inline-flex items-center gap-2 rounded-2xl bg-[#A3C042] px-6 py-3 text-sm font-bold text-slate-900 transition hover:bg-[#8aac35] disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    <FaSave />
                                    {processing ? t('teacherDashboardProfilePage.actions.saving') : t('common.saveChanges')}
                                </button>
                            </div>
                        )}
                    </form>

                    <aside className="space-y-6">
                        <div className="rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-700 p-6 text-white shadow-sm">
                            <h2 className="text-xl font-bold">{t('teacherDashboardProfilePage.membershipCard.title')}</h2>
                            <div className="mt-5 space-y-4">
                                <div>
                                    <div className="text-sm text-emerald-100">
                                        {t('teacherDashboardProfilePage.membershipCard.membershipType')}
                                    </div>
                                    <div className="text-lg font-semibold">
                                        {t(`teacherDashboardProfilePage.membershipTypes.${membershipTypeKey}`)}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-sm text-emerald-100">
                                        {t('teacherDashboardProfilePage.membershipCard.contractStatus')}
                                    </div>
                                    <div className="text-lg font-semibold">
                                        {t(`teacherDashboardProfilePage.contractStatus.${contractStatusKey}`)}
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <div className="text-sm text-emerald-100">
                                            {t('teacherDashboardProfilePage.membershipCard.startDate')}
                                        </div>
                                        <div className="font-semibold">
                                            {teacher?.contract_start_date || t('common.notAvailable')}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-emerald-100">
                                            {t('teacherDashboardProfilePage.membershipCard.endDate')}
                                        </div>
                                        <div className="font-semibold">
                                            {teacher?.contract_end_date || t('common.notAvailable')}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <p className="mt-5 rounded-2xl bg-white/10 px-4 py-3 text-sm leading-6 text-emerald-50">
                                {t('teacherDashboardProfilePage.statusNote.membershipManagedBySchool')}
                            </p>
                        </div>

                        <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                            <h3 className="text-lg font-bold text-slate-900">
                                {t('teacherDashboardProfilePage.sections.accountStatus')}
                            </h3>
                            <div className="mt-4 space-y-3 text-sm text-slate-600">
                                <div className="rounded-2xl bg-slate-50 px-4 py-3">
                                    {t(statusNoteKey)}
                                </div>
                                <div className="rounded-2xl bg-slate-50 px-4 py-3">
                                    {t('teacherDashboardProfilePage.statusNote.membershipManagedBySchool')}
                                </div>
                            </div>
                        </div>
                    </aside>
                </section>
            </div>
        </DashboardLayout>
    );
}
