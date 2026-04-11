import DashboardLayout from '@/Layouts/DashboardLayout';
import { useTranslation } from '@/i18n';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { FaCheckCircle, FaClock, FaEye, FaMedal, FaSearch, FaTimesCircle } from 'react-icons/fa';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import { useState } from 'react';
import { useConfirmDialog } from '@/Contexts/ConfirmContext';
import { toHijriDate } from '@/utils/dateUtils';

const getInitialQueryValue = (key) => {
    if (typeof window === 'undefined') {
        return '';
    }

    return new URLSearchParams(window.location.search).get(key) || '';
};

export default function PendingBadges({ badges, auth }) {
    const { t, language } = useTranslation();
    const { confirm } = useConfirmDialog();
    const { data, setData, get } = useForm({
        search: getInitialQueryValue('search'),
    });

    const [rejectReason, setRejectReason] = useState('');
    const [rejectingBadgeId, setRejectingBadgeId] = useState(null);

    const pageTitle = t('schoolPendingBadgesPage.pageTitle', {
        appName: t('common.appName'),
    });

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

        get('/school/badges/pending', {
            preserveScroll: true,
            preserveState: true,
            replace: true,
        });
    };

    const handleApprove = async (badgeId, badgeName) => {
        const confirmed = await confirm({
            title: t('schoolPendingBadgesPage.confirm.approveTitle'),
            message: t('schoolPendingBadgesPage.confirm.approveMessage', { name: badgeName }),
            confirmText: t('schoolPendingBadgesPage.confirm.approveButton'),
            cancelText: t('common.cancel'),
            variant: 'info',
        });

        if (confirmed) {
            router.post(`/school/badges/${badgeId}/approve`, {}, {
                preserveScroll: true,
            });
        }
    };

    const handleReject = async (badgeId, badgeName) => {
        if (rejectReason.trim() === '') {
            window.alert(t('schoolPendingBadgesPage.validation.rejectionReasonRequired'));
            return;
        }

        const confirmed = await confirm({
            title: t('schoolPendingBadgesPage.confirm.rejectTitle'),
            message: t('schoolPendingBadgesPage.confirm.rejectMessage', { name: badgeName }),
            confirmText: t('schoolPendingBadgesPage.confirm.rejectButton'),
            cancelText: t('common.cancel'),
            variant: 'warning',
        });

        if (confirmed) {
            router.post(`/school/badges/${badgeId}/reject`, {
                rejection_reason: rejectReason,
            }, {
                preserveScroll: true,
                onSuccess: () => {
                    setRejectReason('');
                    setRejectingBadgeId(null);
                },
            });
        }
    };

    const startRejecting = (badgeId) => {
        setRejectReason('');
        setRejectingBadgeId(badgeId);
    };

    const cancelRejecting = () => {
        setRejectReason('');
        setRejectingBadgeId(null);
    };

    return (
        <DashboardLayout auth={auth} header={t('schoolPendingBadgesPage.title')}>
            <Head title={pageTitle} />

            <div className="mb-6 rounded-xl bg-white p-6 shadow-lg">
                <form onSubmit={handleSearch} className="flex flex-col gap-4 md:flex-row">
                    <div className="flex-1">
                        <TextInput
                            type="text"
                            placeholder={t('schoolPendingBadgesPage.searchPlaceholder')}
                            value={data.search}
                            onChange={(event) => setData('search', event.target.value)}
                            className="w-full"
                        />
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
                        <FaClock className="text-[#A3C042]" />
                        {t('schoolPendingBadgesPage.cardsTitle', {
                            count: badges?.total || badges?.data?.length || 0,
                        })}
                    </h3>
                </div>

                <div className="p-6">
                    {badges?.data?.length > 0 ? (
                        <div className="space-y-4">
                            {badges.data.map((badge) => {
                                const badgeName = getBadgeName(badge);
                                const badgeDescription = getBadgeDescription(badge);

                                return (
                                    <div key={badge.id} className="rounded-lg border border-gray-200 p-6 transition hover:shadow-md">
                                        <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
                                            <div className="flex-1">
                                                <div className="mb-3 flex items-center gap-3">
                                                    {badge.image && (
                                                        <img
                                                            src={badge.image.startsWith('http') ? badge.image : `/storage/${badge.image}`}
                                                            alt={badgeName}
                                                            className="h-16 w-16 rounded-lg object-cover"
                                                        />
                                                    )}
                                                    <div>
                                                        <h4 className="text-xl font-bold text-gray-900">{badgeName}</h4>
                                                        {badgeDescription && (
                                                            <p className="text-sm text-gray-600">{badgeDescription}</p>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="mb-3 flex flex-wrap items-center gap-4 text-sm text-gray-600">
                                                    {badge.creator && (
                                                        <span>
                                                            <strong>{t('schoolPendingBadgesPage.labels.teacher')}:</strong>{' '}
                                                            {badge.creator.name}
                                                        </span>
                                                    )}
                                                    <span>
                                                        <strong>{t('schoolPendingBadgesPage.labels.pointsRequired')}:</strong>{' '}
                                                        {badge.points_required}
                                                    </span>
                                                    <span>
                                                        <strong>{t('schoolPendingBadgesPage.labels.submittedAt')}:</strong>{' '}
                                                        {toHijriDate(badge.created_at, false, language)}
                                                    </span>
                                                </div>

                                                <div className="space-y-1 text-sm text-gray-600">
                                                    <p>
                                                        <strong>{t('schoolPendingBadgesPage.labels.type')}:</strong> {badge.type}
                                                    </p>
                                                    {badge.icon && (
                                                        <p>
                                                            <strong>{t('schoolPendingBadgesPage.labels.icon')}:</strong> {badge.icon}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex w-full flex-col gap-2 xl:ms-6 xl:w-72">
                                                <Link
                                                    href={`/school/badges/${badge.id}`}
                                                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-gray-100 px-4 py-2 font-medium text-gray-700 transition hover:bg-gray-200"
                                                >
                                                    <FaEye />
                                                    {t('schoolPendingBadgesPage.actions.view')}
                                                </Link>

                                                <button
                                                    type="button"
                                                    onClick={() => handleApprove(badge.id, badgeName)}
                                                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#A3C042] px-4 py-2 font-medium text-white shadow-md transition duration-300 hover:bg-primary-600"
                                                >
                                                    <FaCheckCircle />
                                                    {t('schoolPendingBadgesPage.actions.approve')}
                                                </button>

                                                {rejectingBadgeId === badge.id ? (
                                                    <div className="space-y-2">
                                                        <textarea
                                                            value={rejectReason}
                                                            onChange={(event) => setRejectReason(event.target.value)}
                                                            placeholder={t('schoolPendingBadgesPage.rejectionReasonPlaceholder')}
                                                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                                                            rows="3"
                                                        />
                                                        <div className="flex gap-2">
                                                            <button
                                                                type="button"
                                                                onClick={() => handleReject(badge.id, badgeName)}
                                                                className="flex-1 rounded-lg bg-red-500 px-3 py-2 text-sm font-medium text-white transition hover:bg-red-600"
                                                            >
                                                                {t('schoolPendingBadgesPage.actions.confirmReject')}
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={cancelRejecting}
                                                                className="flex-1 rounded-lg bg-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-300"
                                                            >
                                                                {t('schoolPendingBadgesPage.actions.cancel')}
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        onClick={() => startRejecting(badge.id)}
                                                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-500 px-4 py-2 font-medium text-white shadow-md transition duration-300 hover:bg-red-600"
                                                    >
                                                        <FaTimesCircle />
                                                        {t('schoolPendingBadgesPage.actions.reject')}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="py-12 text-center">
                            <FaMedal className="mx-auto mb-4 text-6xl text-gray-300" />
                            <p className="text-lg text-gray-600">{t('schoolPendingBadgesPage.empty')}</p>
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
