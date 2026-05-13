import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link } from '@inertiajs/react';
import { FaArrowRight, FaCheckCircle, FaClock, FaMedal, FaTimesCircle } from 'react-icons/fa';
import { useTranslation } from '@/i18n';
import { toHijriDate } from '@/utils/dateUtils';
import { getBadgeImageUrl } from '@/utils/imageUtils';

const statusConfig = {
    pending: { icon: FaClock, color: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
    approved: { icon: FaCheckCircle, color: 'bg-green-100 text-green-700 border-green-300' },
    rejected: { icon: FaTimesCircle, color: 'bg-red-100 text-red-700 border-red-300' },
};

export default function TeacherBadgeShow({ badge, auth }) {
    const { t, language } = useTranslation();
    const status = statusConfig[badge.status] || statusConfig.pending;
    const StatusIcon = status.icon;
    const badgeName = badge.name_ar || badge.name;
    const imageUrl = getBadgeImageUrl(badge.image);

    return (
        <DashboardLayout auth={auth} header={t('teacherBadgesPage.viewDetails')}>
            <Head title={`${badgeName} - ${t('common.appName')}`} />

            <div className="mx-auto max-w-4xl">
                <Link
                    href="/teacher/badges"
                    className="mb-6 inline-flex items-center gap-2 text-gray-600 transition hover:text-gray-900"
                >
                    <FaArrowRight />
                    {t('teacherBadgesPage.title')}
                </Link>

                <div className="overflow-hidden rounded-xl bg-white shadow-lg">
                    <div className="border-b border-gray-100 bg-gradient-to-r from-[#A3C042]/10 to-legacy-blue/10 p-6">
                        <div className="flex flex-col gap-5 md:flex-row md:items-center">
                            <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl bg-white shadow-sm">
                                {imageUrl ? (
                                    <img src={imageUrl} alt={badgeName} className="h-full w-full object-cover" />
                                ) : (
                                    <FaMedal className="text-5xl text-[#A3C042]" />
                                )}
                            </div>
                            <div className="flex-1">
                                <h1 className="text-2xl font-bold text-gray-900">{badgeName}</h1>
                                <p className="mt-2 text-gray-600">{badge.description_ar || badge.description}</p>
                                <div className="mt-4 flex flex-wrap items-center gap-3">
                                    <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-semibold ${status.color}`}>
                                        <StatusIcon />
                                        {t(`teacherBadgesPage.statuses.${badge.status || 'pending'}`)}
                                    </span>
                                    <span className="text-sm font-semibold text-gray-700">
                                        {t('teacherBadgesPage.pointsRequired', { count: badge.points_required || 0 })}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-4 p-6 md:grid-cols-2">
                        <div className="rounded-lg border border-gray-100 p-4">
                            <div className="text-sm text-gray-500">{t('teacherBadgesPage.schoolLabel')}</div>
                            <div className="mt-1 font-semibold text-gray-900">{badge.school?.name || '-'}</div>
                        </div>
                        <div className="rounded-lg border border-gray-100 p-4">
                            <div className="text-sm text-gray-500">{t('teacherBadgesPage.approvalDateLabel')}</div>
                            <div className="mt-1 font-semibold text-gray-900">
                                {badge.approved_at ? toHijriDate(badge.approved_at, false, language) : '-'}
                            </div>
                        </div>
                        {badge.rejection_reason && (
                            <div className="rounded-lg border border-red-100 bg-red-50 p-4 md:col-span-2">
                                <div className="text-sm font-semibold text-red-700">{t('teacherBadgesPage.rejectionReasonLabel')}</div>
                                <div className="mt-1 text-red-700">{badge.rejection_reason}</div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
