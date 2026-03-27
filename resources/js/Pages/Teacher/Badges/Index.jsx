import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link } from '@inertiajs/react';
import { FaMedal, FaPlus, FaEye, FaClock, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { useTranslation } from '@/i18n';
import { toHijriDate } from '@/utils/dateUtils';

export default function TeacherBadges({ badges, auth }) {
    const { t, language } = useTranslation();

    const statusLabels = {
        pending: { label: t('teacherBadgesPage.statuses.pending'), color: 'bg-yellow-100 text-yellow-700 border-yellow-300', icon: FaClock },
        approved: { label: t('teacherBadgesPage.statuses.approved'), color: 'bg-green-100 text-green-700 border-green-300', icon: FaCheckCircle },
        rejected: { label: t('teacherBadgesPage.statuses.rejected'), color: 'bg-red-100 text-red-700 border-red-300', icon: FaTimesCircle },
    };

    const formatDate = (value) => {
        if (!value) return '-';

        if (language === 'ar') {
            return toHijriDate(value, false, language);
        }

        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        }).format(new Date(value));
    };

    return (
        <DashboardLayout header={t('teacherBadgesPage.title')}>
            <Head title={t('teacherBadgesPage.pageTitle', { appName: t('common.appName') })} />

            <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">{t('teacherBadgesPage.subtitle')}</h2>
                <Link
                    href="/teacher/badges/create"
                    className="bg-[#A3C042] text-white px-6 py-3 rounded-lg font-semibold transition duration-300 flex items-center gap-2 shadow-md hover:shadow-xl"
                >
                    <FaPlus />
                    {t('teacherBadgesPage.createAction')}
                </Link>
            </div>

            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-[#A3C042]/10 to-legacy-blue/10">
                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <FaMedal className="text-[#A3C042]" />
                        {t('teacherBadgesPage.listTitle', { count: badges?.total || 0 })}
                    </h3>
                </div>
                <div className="p-6">
                    {badges.data && badges.data.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {badges.data.map((badge) => {
                                const StatusIcon = statusLabels[badge.status]?.icon || FaClock;
                                const typeLabel = statusLabels[badge.status]?.label || t('teacherBadgesPage.statuses.pending');

                                return (
                                    <div key={badge.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex-1">
                                                <h4 className="text-lg font-bold text-gray-900 mb-2">{badge.name_ar || badge.name}</h4>
                                                <p className="text-sm text-gray-600 line-clamp-2">{badge.description_ar || badge.description}</p>
                                            </div>
                                            {badge.image && (
                                                <img
                                                    src={badge.image.startsWith('http') ? badge.image : `/storage/${badge.image}`}
                                                    alt={badge.name_ar || badge.name}
                                                    className="w-16 h-16 rounded-lg object-cover"
                                                />
                                            )}
                                        </div>

                                        <div className="flex items-center justify-between mb-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold border flex items-center gap-1 ${statusLabels[badge.status]?.color || statusLabels.pending.color}`}>
                                                <StatusIcon className="text-xs" />
                                                {typeLabel}
                                            </span>
                                            <span className="text-sm text-gray-600">
                                                {t('teacherBadgesPage.pointsRequired', { count: badge.points_required || 0 })}
                                            </span>
                                        </div>

                                        <div className="text-sm text-gray-500 mb-4">
                                            {badge.school && (
                                                <p><strong>{t('teacherBadgesPage.schoolLabel')}:</strong> {badge.school.name}</p>
                                            )}
                                            {badge.approved_at && (
                                                <p><strong>{t('teacherBadgesPage.approvalDateLabel')}:</strong> {formatDate(badge.approved_at)}</p>
                                            )}
                                            {badge.rejection_reason && (
                                                <p className="text-red-600 mt-2"><strong>{t('teacherBadgesPage.rejectionReasonLabel')}:</strong> {badge.rejection_reason}</p>
                                            )}
                                        </div>

                                        <Link
                                            href={`/teacher/badges/${badge.id}`}
                                            className="block w-full text-center bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition"
                                        >
                                            <FaEye className="inline me-2" />
                                            {t('teacherBadgesPage.viewDetails')}
                                        </Link>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <FaMedal className="text-6xl text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-600 text-lg mb-4">{t('teacherBadgesPage.empty')}</p>
                            <Link
                                href="/teacher/badges/create"
                                className="inline-block bg-[#A3C042] text-white px-6 py-3 rounded-lg font-semibold transition"
                            >
                                <FaPlus className="inline me-2" />
                                {t('teacherBadgesPage.createAction')}
                            </Link>
                        </div>
                    )}

                    {badges.links && badges.links.length > 3 && (
                        <div className="mt-6 flex justify-center">
                            <div className="flex gap-2">
                                {badges.links.map((link, index) => (
                                    <Link
                                        key={index}
                                        href={link.url || '#'}
                                        className={`px-4 py-2 rounded-lg font-medium transition ${link.active
                                            ? 'bg-[#A3C042] text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        } ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
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
