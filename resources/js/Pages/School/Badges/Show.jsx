import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link } from '@inertiajs/react';
import {
    FaArrowLeft,
    FaCalendarAlt,
    FaCheckCircle,
    FaClock,
    FaLayerGroup,
    FaMedal,
    FaSchool,
    FaTimesCircle,
    FaUser,
    FaUsers,
} from 'react-icons/fa';
import { useTranslation } from '@/i18n';
import { toHijriDate } from '@/utils/dateUtils';

export default function SchoolBadgeShow({ auth, badge }) {
    const { t, language } = useTranslation();

    const pageTitle = t('schoolBadgesPage.showPageTitle', {
        name: language === 'ar' ? (badge?.name_ar || badge?.name || '') : (badge?.name || badge?.name_ar || ''),
        appName: t('common.appName'),
    });

    const statusLabels = {
        pending: {
            label: t('schoolBadgesPage.statuses.pending'),
            color: 'bg-yellow-100 text-yellow-700 border-yellow-300',
            icon: FaClock,
        },
        approved: {
            label: t('schoolBadgesPage.statuses.approved'),
            color: 'bg-green-100 text-green-700 border-green-300',
            icon: FaCheckCircle,
        },
        rejected: {
            label: t('schoolBadgesPage.statuses.rejected'),
            color: 'bg-red-100 text-red-700 border-red-300',
            icon: FaTimesCircle,
        },
    };

    const badgeName = language === 'ar'
        ? (badge?.name_ar || badge?.name || '')
        : (badge?.name || badge?.name_ar || '');

    const badgeDescription = language === 'ar'
        ? (badge?.description_ar || badge?.description || '')
        : (badge?.description || badge?.description_ar || '');

    const status = statusLabels[badge?.status] || statusLabels.pending;
    const StatusIcon = status.icon;

    const formatDate = (value) => {
        if (!value) {
            return t('common.notAvailable');
        }

        if (language === 'ar') {
            return toHijriDate(value, false, language);
        }

        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        }).format(new Date(value));
    };

    const categoryLabel = badge?.badge_category
        ? t(`schoolBadgesPage.categories.${badge.badge_category}`)
        : t('common.notAvailable');

    const levelLabel = badge?.level
        ? t(`schoolBadgesPage.levels.${badge.level}`)
        : t('common.notAvailable');

    return (
        <DashboardLayout auth={auth} header={badgeName || t('schoolBadgesPage.title')}>
            <Head title={pageTitle} />

            <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                    <p className="mb-2 text-sm font-medium text-[#A3C042]">
                        {t('schoolBadgesPage.actions.details')}
                    </p>
                    <h1 className="text-3xl font-bold text-gray-900">{badgeName}</h1>
                </div>

                <div className="flex flex-wrap gap-3">
                    {badge?.status === 'pending' && (
                        <Link
                            href="/school/badges/pending"
                            className="flex items-center gap-2 rounded-lg bg-[#A3C042] px-4 py-2 font-semibold text-white transition hover:bg-[#8CA635]"
                        >
                            <FaClock />
                            {t('schoolBadgesPage.actions.reviewPending')}
                        </Link>
                    )}
                    <Link
                        href="/school/badges"
                        className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 font-semibold text-gray-700 transition hover:bg-gray-50"
                    >
                        <FaArrowLeft />
                        {t('schoolBadgesPage.backToList')}
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                <div className="overflow-hidden rounded-2xl bg-white shadow-lg">
                    <div className="border-b border-gray-100 bg-gradient-to-r from-[#A3C042]/10 to-legacy-blue/10 px-6 py-5">
                        <h2 className="text-xl font-bold text-gray-900">{t('schoolBadgesPage.summaryTitle')}</h2>
                    </div>

                    <div className="space-y-5 p-6">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                            <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-2xl border border-[#A3C042]/20 bg-[#A3C042]/10">
                                {badge?.image ? (
                                    <img
                                        src={badge.image.startsWith('http') ? badge.image : `/storage/${badge.image}`}
                                        alt={badgeName}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <div className="flex flex-col items-center gap-2 text-[#A3C042]">
                                        <span className="text-5xl">{badge?.icon || ''}</span>
                                        {!badge?.icon && <FaMedal className="text-5xl" />}
                                    </div>
                                )}
                            </div>

                            <div className="flex-1">
                                <div className="mb-3 flex flex-wrap items-center gap-3">
                                    <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${status.color}`}>
                                        <StatusIcon className="text-xs" />
                                        {status.label}
                                    </span>
                                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                                        {t('schoolBadgesPage.pointsRequired', { count: badge?.points_required || 0 })}
                                    </span>
                                </div>

                                <p className="text-sm leading-7 text-gray-700">
                                    {badgeDescription || t('schoolBadgesPage.labels.noDescription')}
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                                <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-800">
                                    <FaLayerGroup className="text-[#A3C042]" />
                                    {t('schoolBadgesPage.labels.category')}
                                </div>
                                <p className="text-sm text-gray-600">{categoryLabel}</p>
                            </div>

                            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                                <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-800">
                                    <FaMedal className="text-[#A3C042]" />
                                    {t('schoolBadgesPage.labels.level')}
                                </div>
                                <p className="text-sm text-gray-600">{levelLabel}</p>
                            </div>

                            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                                <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-800">
                                    <FaUsers className="text-[#A3C042]" />
                                    {t('schoolBadgesPage.labels.recipients')}
                                </div>
                                <p className="text-sm text-gray-600">{badge?.users_count || 0}</p>
                            </div>

                            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                                <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-800">
                                    <FaMedal className="text-[#A3C042]" />
                                    {t('schoolBadgesPage.labels.type')}
                                </div>
                                <p className="text-sm text-gray-600">{badge?.type || t('common.notAvailable')}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="overflow-hidden rounded-2xl bg-white shadow-lg">
                    <div className="border-b border-gray-100 bg-gradient-to-r from-legacy-blue/10 to-[#A3C042]/10 px-6 py-5">
                        <h2 className="text-xl font-bold text-gray-900">{t('schoolBadgesPage.detailsTitle')}</h2>
                    </div>

                    <div className="space-y-4 p-6">
                        <div className="rounded-xl border border-gray-100 p-4">
                            <div className="mb-1 flex items-center gap-2 text-sm font-semibold text-gray-800">
                                <FaUser className="text-[#A3C042]" />
                                {t('schoolBadgesPage.labels.teacher')}
                            </div>
                            <p className="text-sm text-gray-600">{badge?.creator?.name || t('common.notAvailable')}</p>
                        </div>

                        <div className="rounded-xl border border-gray-100 p-4">
                            <div className="mb-1 flex items-center gap-2 text-sm font-semibold text-gray-800">
                                <FaSchool className="text-[#A3C042]" />
                                {t('schoolBadgesPage.labels.school')}
                            </div>
                            <p className="text-sm text-gray-600">{badge?.school?.name || t('common.notAvailable')}</p>
                        </div>

                        <div className="rounded-xl border border-gray-100 p-4">
                            <div className="mb-1 flex items-center gap-2 text-sm font-semibold text-gray-800">
                                <FaCalendarAlt className="text-[#A3C042]" />
                                {t('schoolBadgesPage.labels.createdAt')}
                            </div>
                            <p className="text-sm text-gray-600">{formatDate(badge?.created_at)}</p>
                        </div>

                        <div className="rounded-xl border border-gray-100 p-4">
                            <div className="mb-1 flex items-center gap-2 text-sm font-semibold text-gray-800">
                                <FaCalendarAlt className="text-[#A3C042]" />
                                {t('schoolBadgesPage.labels.approvalDate')}
                            </div>
                            <p className="text-sm text-gray-600">{formatDate(badge?.approved_at)}</p>
                        </div>

                        <div className="rounded-xl border border-gray-100 p-4">
                            <div className="mb-1 flex items-center gap-2 text-sm font-semibold text-gray-800">
                                <StatusIcon className="text-[#A3C042]" />
                                {t('schoolBadgesPage.labels.status')}
                            </div>
                            <p className="text-sm text-gray-600">{status.label}</p>
                        </div>

                        <div className="rounded-xl border border-gray-100 p-4">
                            <div className="mb-1 flex items-center gap-2 text-sm font-semibold text-gray-800">
                                {badge?.is_active ? <FaCheckCircle className="text-[#A3C042]" /> : <FaTimesCircle className="text-[#A3C042]" />}
                                {t('schoolBadgesPage.labels.active')}
                            </div>
                            <p className="text-sm text-gray-600">
                                {badge?.is_active ? t('schoolBadgesPage.states.active') : t('schoolBadgesPage.states.inactive')}
                            </p>
                        </div>

                        {badge?.rejection_reason && (
                            <div className="rounded-xl border border-red-100 bg-red-50 p-4">
                                <div className="mb-1 text-sm font-semibold text-red-700">
                                    {t('schoolBadgesPage.labels.rejectionReason')}
                                </div>
                                <p className="text-sm leading-6 text-red-600">{badge.rejection_reason}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
