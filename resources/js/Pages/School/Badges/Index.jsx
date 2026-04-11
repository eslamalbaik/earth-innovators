import DashboardLayout from '@/Layouts/DashboardLayout';
import { useTranslation } from '@/i18n';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { FaCheckCircle, FaClock, FaEye, FaMedal, FaSearch, FaTimesCircle } from 'react-icons/fa';
import TextInput from '@/Components/TextInput';
import SelectInput from '@/Components/SelectInput';
import PrimaryButton from '@/Components/PrimaryButton';
import { toHijriDate } from '@/utils/dateUtils';

const getInitialQueryValue = (key) => {
    if (typeof window === 'undefined') {
        return '';
    }

    return new URLSearchParams(window.location.search).get(key) || '';
};

export default function SchoolBadges({ badges, auth }) {
    const { t, language } = useTranslation();
    const { data, setData, get } = useForm({
        search: getInitialQueryValue('search'),
        status: getInitialQueryValue('status'),
    });

    const pageTitle = t('schoolBadgesPage.pageTitle', {
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

    const getBadgeName = (badge) => (
        language === 'ar'
            ? (badge.name_ar || badge.name)
            : (badge.name || badge.name_ar)
    );

    const getBadgeDescription = (badge) => (
        language === 'ar'
            ? (badge.description_ar || badge.description)
            : (badge.description || badge.description_ar)
    );

    const handleSearch = (event) => {
        event.preventDefault();

        get('/school/badges', {
            preserveScroll: true,
            preserveState: true,
            replace: true,
        });
    };

    return (
        <DashboardLayout auth={auth} header={t('schoolBadgesPage.title')}>
            <Head title={pageTitle} />

            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <h2 className="text-2xl font-bold text-gray-900">
                    {t('schoolBadgesPage.cardsTitle', {
                        count: badges?.total || badges?.data?.length || 0,
                    })}
                </h2>
                <Link
                    href="/school/badges/pending"
                    className="inline-flex items-center gap-2 rounded-lg bg-[#A3C042] px-6 py-3 font-semibold text-white shadow-md transition duration-300 hover:shadow-xl"
                >
                    <FaClock />
                    {t('schoolBadgesPage.pendingLink')}
                </Link>
            </div>

            <div className="mb-6 rounded-xl bg-white p-6 shadow-lg">
                <form onSubmit={handleSearch} className="flex flex-col gap-4 md:flex-row">
                    <div className="flex-1">
                        <TextInput
                            type="text"
                            placeholder={t('schoolBadgesPage.searchPlaceholder')}
                            value={data.search}
                            onChange={(event) => setData('search', event.target.value)}
                            className="w-full"
                        />
                    </div>
                    <div className="md:w-56">
                        <SelectInput
                            value={data.status}
                            onChange={(event) => setData('status', event.target.value)}
                        >
                            <option value="">{t('schoolBadgesPage.filters.allStatuses')}</option>
                            <option value="pending">{t('schoolBadgesPage.statuses.pending')}</option>
                            <option value="approved">{t('schoolBadgesPage.statuses.approved')}</option>
                            <option value="rejected">{t('schoolBadgesPage.statuses.rejected')}</option>
                        </SelectInput>
                    </div>
                    <PrimaryButton type="submit">
                        <FaSearch className="inline me-2" />
                        {t('common.search')}
                    </PrimaryButton>
                </form>
            </div>

            <div className="overflow-hidden rounded-xl bg-white shadow-lg">
                <div className="border-b border-gray-200 bg-gradient-to-r from-[#A3C042]/10 to-legacy-blue/10 px-6 py-4">
                    <h3 className="flex items-center gap-2 text-xl font-bold text-gray-900">
                        <FaMedal className="text-[#A3C042]" />
                        {t('schoolBadgesPage.cardsTitle', {
                            count: badges?.total || badges?.data?.length || 0,
                        })}
                    </h3>
                </div>

                <div className="p-6">
                    {badges?.data?.length > 0 ? (
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {badges.data.map((badge) => {
                                const status = statusLabels[badge.status] || statusLabels.pending;
                                const StatusIcon = status.icon;
                                const badgeName = getBadgeName(badge);
                                const badgeDescription = getBadgeDescription(badge);

                                return (
                                    <div key={badge.id} className="rounded-xl border border-gray-200 p-6 transition hover:shadow-lg">
                                        <div className="mb-4 flex items-start justify-between gap-4">
                                            <div className="flex-1">
                                                <div className="mb-2 flex items-center gap-2">
                                                    {badge.icon && (
                                                        <span className="text-2xl">{badge.icon}</span>
                                                    )}
                                                    <h4 className="text-lg font-bold text-gray-900">{badgeName}</h4>
                                                </div>
                                                {badgeDescription && (
                                                    <p className="line-clamp-2 text-sm text-gray-600">{badgeDescription}</p>
                                                )}
                                            </div>
                                            {badge.image && (
                                                <img
                                                    src={badge.image.startsWith('http') ? badge.image : `/storage/${badge.image}`}
                                                    alt={badgeName}
                                                    className="h-16 w-16 rounded-lg object-cover"
                                                />
                                            )}
                                        </div>

                                        <div className="mb-4 flex items-center justify-between gap-4">
                                            <span className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold ${status.color}`}>
                                                <StatusIcon className="text-xs" />
                                                {status.label}
                                            </span>
                                            <span className="text-sm text-gray-600">
                                                {t('schoolBadgesPage.pointsRequired', {
                                                    count: badge.points_required || 0,
                                                })}
                                            </span>
                                        </div>

                                        <div className="mb-4 space-y-2 text-sm text-gray-500">
                                            {badge.creator && (
                                                <p>
                                                    <strong>{t('schoolBadgesPage.labels.teacher')}:</strong>{' '}
                                                    {badge.creator.name}
                                                </p>
                                            )}
                                            {badge.approved_at && (
                                                <p>
                                                    <strong>{t('schoolBadgesPage.labels.approvalDate')}:</strong>{' '}
                                                    {toHijriDate(badge.approved_at, false, language)}
                                                </p>
                                            )}
                                            {badge.rejection_reason && (
                                                <p className="text-red-600">
                                                    <strong>{t('schoolBadgesPage.labels.rejectionReason')}:</strong>{' '}
                                                    {badge.rejection_reason}
                                                </p>
                                            )}
                                        </div>

                                        <Link
                                            href={`/school/badges/${badge.id}`}
                                            className="block w-full rounded-lg bg-gray-100 px-4 py-2 text-center font-medium text-gray-700 transition hover:bg-gray-200"
                                        >
                                            <FaEye className="inline me-2" />
                                            {t('schoolBadgesPage.actions.details')}
                                        </Link>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="py-12 text-center">
                            <FaMedal className="mx-auto mb-4 text-6xl text-gray-300" />
                            <p className="text-lg text-gray-600">{t('schoolBadgesPage.empty')}</p>
                        </div>
                    )}

                    {badges?.links?.length > 3 && (
                        <div className="mt-6 flex justify-center">
                            <div className="flex gap-2">
                                {badges.links.map((link, index) => (
                                    <button
                                        key={index}
                                        type="button"
                                        onClick={() => {
                                            if (!link.url) {
                                                return;
                                            }
                                            router.visit(link.url, {
                                                preserveScroll: true,
                                                preserveState: true,
                                            });
                                        }}
                                        className={`rounded-lg px-4 py-2 font-medium transition ${
                                            link.active
                                                ? 'bg-[#A3C042] text-white'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        } ${!link.url ? 'cursor-not-allowed opacity-50' : ''}`}
                                        disabled={!link.url}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
