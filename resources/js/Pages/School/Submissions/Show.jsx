import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import {
    FaCalendar,
    FaCheck,
    FaDownload,
    FaFile,
    FaFilePdf,
    FaImage,
    FaPaperPlane,
    FaSpinner,
    FaStar,
    FaTimes,
    FaUser,
} from 'react-icons/fa';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { useBackIcon, useTranslation } from '@/i18n';

const STATUS_META = {
    submitted: { badge: 'bg-yellow-100 text-yellow-800', option: 'border-yellow-500 bg-yellow-50 text-yellow-700', icon: FaCheck },
    reviewed: { badge: 'bg-blue-100 text-blue-800', option: 'border-blue-500 bg-blue-50 text-blue-700', icon: FaCheck },
    approved: { badge: 'bg-green-100 text-green-800', option: 'border-green-500 bg-green-50 text-green-700', icon: FaCheck },
    rejected: { badge: 'bg-red-100 text-red-800', option: 'border-red-500 bg-red-50 text-red-700', icon: FaTimes },
};

export default function SchoolSubmissionShow({ auth, submission, availableBadges = [], allSubmissions = [] }) {
    const { t, language } = useTranslation();
    const BackIcon = useBackIcon();
    const [rating, setRating] = useState(submission.rating || 0);
    const [hoveredRating, setHoveredRating] = useState(0);
    const [selectedBadges, setSelectedBadges] = useState(submission.badges || []);

    const { data, setData, post, processing, errors } = useForm({
        rating: submission.rating || 0,
        feedback: submission.feedback || '',
        status: submission.status || 'submitted',
        badges: submission.badges || [],
    });

    const handleRatingClick = (value) => {
        setRating(value);
        setData('rating', value);
    };

    const handleBadgeToggle = (badgeId) => {
        const updatedBadges = selectedBadges.includes(badgeId)
            ? selectedBadges.filter((id) => id !== badgeId)
            : [...selectedBadges, badgeId];

        setSelectedBadges(updatedBadges);
        setData('badges', updatedBadges);
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        post(`/school/submissions/${submission.id}/evaluate`);
    };

    const formatDate = (dateString) => {
        if (!dateString) {
            return '';
        }

        return new Intl.DateTimeFormat(language === 'ar' ? 'ar-EG' : 'en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        }).format(new Date(dateString));
    };

    const getFileUrl = (filePath) => {
        if (!filePath) {
            return '#';
        }

        return filePath.startsWith('http') ? filePath : `/storage/${filePath}`;
    };

    const getFileIcon = (fileName) => {
        const extension = fileName?.split('.').pop()?.toLowerCase();

        if (extension === 'pdf') {
            return <FaFilePdf className="text-xl text-red-500" />;
        }

        if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)) {
            return <FaImage className="text-xl text-blue-500" />;
        }

        return <FaFile className="text-xl text-gray-500" />;
    };

    const getStatusMeta = (status) => {
        const key = STATUS_META[status] ? status : 'submitted';

        return {
            ...STATUS_META[key],
            label: t(`schoolSubmissionShowPage.statuses.${key}`),
        };
    };

    const pageTitle = t('schoolSubmissionShowPage.pageTitle', {
        title: submission.project?.title || t('schoolSubmissionShowPage.fallbackProjectTitle'),
        appName: t('common.appName'),
    });

    const statusOptions = ['reviewed', 'approved', 'rejected'].map((value) => ({
        value,
        label: t(`schoolSubmissionShowPage.statusOptions.${value}`),
        icon: STATUS_META[value].icon,
        activeClass: STATUS_META[value].option,
    }));

    return (
        <DashboardLayout auth={auth} header={t('schoolSubmissionShowPage.header')}>
            <Head title={pageTitle} />

            <div className="py-6">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
                        <div className="space-y-6 lg:col-span-3">
                            <div>
                                <Link
                                    href="/school/submissions"
                                    className="inline-flex items-center gap-2 text-gray-600 transition hover:text-gray-900"
                                >
                                    <BackIcon />
                                    {t('schoolSubmissionShowPage.backToSubmissions')}
                                </Link>
                            </div>

                            <div className="rounded-xl bg-white p-6 shadow-lg">
                                <div className="mb-4 flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <h1 className="text-2xl font-bold text-gray-900">
                                            {submission.project?.title || t('schoolSubmissionShowPage.fallbackProjectTitle')}
                                        </h1>
                                        <div className="mt-2 flex flex-wrap items-center gap-4">
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <FaUser className="text-gray-400" />
                                                <span>{submission.student?.name || t('schoolSubmissionShowPage.unknownStudent')}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <FaCalendar className="text-gray-400" />
                                                <span>{formatDate(submission.submitted_at)}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <span className={`rounded-full px-3 py-1 text-sm font-semibold ${getStatusMeta(submission.status).badge}`}>
                                        {getStatusMeta(submission.status).label}
                                    </span>
                                </div>

                                {submission.project?.description && (
                                    <div className="mt-4 rounded-lg bg-gray-50 p-4">
                                        <p className="text-gray-700">{submission.project.description}</p>
                                    </div>
                                )}

                                {Array.isArray(submission.files) && submission.files.length > 0 && (
                                    <div className="mt-6">
                                        <h3 className="mb-3 text-lg font-bold text-gray-900">
                                            {t('schoolSubmissionShowPage.attachmentsTitle')}
                                        </h3>
                                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                                            {submission.files.map((file, index) => {
                                                const fileName = file?.split('/').pop() || t('schoolSubmissionShowPage.attachmentFallback');

                                                return (
                                                    <div
                                                        key={`${fileName}-${index}`}
                                                        className="flex items-center gap-3 rounded-lg border border-gray-100 bg-gray-50 p-3"
                                                    >
                                                        {getFileIcon(fileName)}
                                                        <span className="flex-1 truncate text-sm text-gray-900">{fileName}</span>
                                                        <a
                                                            href={getFileUrl(file)}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="p-2 text-blue-600 hover:text-blue-700"
                                                        >
                                                            <FaDownload />
                                                        </a>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6 rounded-xl bg-white p-6 shadow-lg">
                                <h2 className="text-xl font-bold text-gray-900">{t('schoolSubmissionShowPage.evaluationTitle')}</h2>

                                <div>
                                    <InputLabel value={t('schoolSubmissionShowPage.ratingLabel')} className="mb-2" />
                                    <div className="flex items-center gap-2" dir="ltr">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                type="button"
                                                onClick={() => handleRatingClick(star)}
                                                onMouseEnter={() => setHoveredRating(star)}
                                                onMouseLeave={() => setHoveredRating(0)}
                                                className="p-1 focus:outline-none"
                                            >
                                                <FaStar
                                                    className={`text-3xl transition ${star <= (hoveredRating || rating) ? 'fill-current text-yellow-400' : 'text-gray-300'}`}
                                                />
                                            </button>
                                        ))}
                                        <span className="ms-3 text-gray-600">
                                            {rating > 0 ? `${rating}/5` : t('schoolSubmissionShowPage.selectRating')}
                                        </span>
                                    </div>
                                    <InputError message={errors.rating} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel value={t('schoolSubmissionShowPage.statusLabel')} className="mb-2" />
                                    <div className="flex flex-wrap gap-3">
                                        {statusOptions.map((option) => {
                                            const Icon = option.icon;
                                            const isSelected = data.status === option.value;

                                            return (
                                                <button
                                                    key={option.value}
                                                    type="button"
                                                    onClick={() => setData('status', option.value)}
                                                    className={`flex flex-1 items-center justify-center gap-2 rounded-lg border-2 px-4 py-3 font-semibold transition ${
                                                        isSelected
                                                            ? option.activeClass
                                                            : 'border-gray-200 text-gray-600 hover:border-gray-300'
                                                    }`}
                                                >
                                                    <Icon className={isSelected ? '' : 'text-gray-400'} />
                                                    {option.label}
                                                </button>
                                            );
                                        })}
                                    </div>
                                    <InputError message={errors.status} className="mt-2" />
                                </div>

                                {availableBadges.length > 0 && (
                                    <div>
                                        <InputLabel value={t('schoolSubmissionShowPage.badgesLabel')} className="mb-2" />
                                        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                                            {availableBadges.map((badge) => {
                                                const isSelected = selectedBadges.includes(badge.id);
                                                const badgeName = language === 'ar'
                                                    ? (badge.name_ar || badge.name)
                                                    : (badge.name || badge.name_ar);
                                                const badgeDescription = language === 'ar'
                                                    ? (badge.description_ar || badge.description)
                                                    : (badge.description || badge.description_ar);

                                                return (
                                                    <button
                                                        key={badge.id}
                                                        type="button"
                                                        onClick={() => handleBadgeToggle(badge.id)}
                                                        className={`rounded-lg border-2 p-3 text-center transition ${
                                                            isSelected
                                                                ? 'border-[#A3C042] bg-[#A3C042]/10'
                                                                : 'border-gray-200 hover:border-gray-300'
                                                        }`}
                                                    >
                                                        <div className="text-sm font-medium text-gray-900">{badgeName}</div>
                                                        {badgeDescription && (
                                                            <div className="mt-1 line-clamp-2 text-xs text-gray-500">{badgeDescription}</div>
                                                        )}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <InputLabel value={t('schoolSubmissionShowPage.feedbackLabel')} className="mb-2" />
                                    <textarea
                                        value={data.feedback}
                                        onChange={(event) => setData('feedback', event.target.value)}
                                        rows={6}
                                        className="w-full rounded-lg border border-gray-300 p-4 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#A3C042]"
                                        placeholder={t('schoolSubmissionShowPage.feedbackPlaceholder')}
                                    />
                                    <InputError message={errors.feedback} className="mt-2" />
                                </div>

                                <div className="flex items-center gap-4">
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#A3C042] px-6 py-3 font-bold text-white transition hover:bg-[#8CA635] disabled:opacity-50"
                                    >
                                        {processing ? (
                                            <>
                                                <FaSpinner className="animate-spin" />
                                                {t('schoolSubmissionShowPage.saving')}
                                            </>
                                        ) : (
                                            <>
                                                <FaPaperPlane />
                                                {t('schoolSubmissionShowPage.saveEvaluation')}
                                            </>
                                        )}
                                    </button>
                                    <Link
                                        href="/school/submissions"
                                        className="rounded-lg bg-gray-200 px-6 py-3 font-semibold text-gray-800 transition hover:bg-gray-300"
                                    >
                                        {t('schoolSubmissionShowPage.cancelAction')}
                                    </Link>
                                </div>
                            </form>
                        </div>

                        <div className="lg:col-span-1">
                            <div className="sticky top-24 rounded-xl bg-white p-4 shadow-lg">
                                <h3 className="mb-4 text-lg font-bold text-gray-900">
                                    {t('schoolSubmissionShowPage.submissionsListTitle')}
                                </h3>
                                <div className="max-h-[calc(100vh-300px)] space-y-2 overflow-y-auto">
                                    {allSubmissions.length > 0 ? (
                                        allSubmissions.map((subItem) => (
                                            <Link
                                                key={subItem.id}
                                                href={`/school/submissions/${subItem.id}`}
                                                className={`block rounded-lg border p-3 transition ${
                                                    subItem.id === submission.id
                                                        ? 'border-[#A3C042] bg-[#A3C042]/10'
                                                        : 'border-gray-100 hover:bg-gray-50'
                                                }`}
                                            >
                                                <div className="line-clamp-2 text-sm font-semibold text-gray-900">
                                                    {subItem.project_title || t('schoolSubmissionShowPage.unknownProject')}
                                                </div>
                                                <div className="mt-1 text-xs text-gray-500">
                                                    {subItem.student_name || t('schoolSubmissionShowPage.unknownStudentSidebar')}
                                                </div>
                                                <div className="mt-1 text-xs text-gray-400">{subItem.submitted_at || ''}</div>
                                            </Link>
                                        ))
                                    ) : (
                                        <p className="py-4 text-center text-sm text-gray-500">
                                            {t('schoolSubmissionShowPage.emptyList')}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
