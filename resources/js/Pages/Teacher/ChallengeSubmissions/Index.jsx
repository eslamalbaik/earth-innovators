import { Head, Link, router, usePage } from '@inertiajs/react';
import DashboardLayout from '../../../Layouts/DashboardLayout';
import { useState, useEffect } from 'react';
import {
    FaTrophy,
    FaUser,
    FaCalendar,
    FaStar,
    FaCheckCircle,
    FaClock,
    FaTimesCircle,
    FaEye,
    FaTimes,
} from 'react-icons/fa';
import { useBackIcon, useTranslation } from '@/i18n';
import { toHijriDate } from '@/utils/dateUtils';

export default function TeacherChallengeSubmissionsIndex({ auth, submissions, challenge, filters }) {
    const { flash } = usePage().props;
    const { t, language } = useTranslation();
    const BackIcon = useBackIcon();
    const [selectedStatus, setSelectedStatus] = useState(filters?.status || '');
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');

    const handleStatusFilter = (status) => {
        setSelectedStatus(status);
        router.get('/teacher/challenge-submissions', {
            challenge_id: challenge.id,
            status: status || undefined,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
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

    const getStatusBadge = (status) => {
        const badges = {
            submitted: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: t('submissionStatuses.submitted'), icon: FaClock },
            reviewed: { bg: 'bg-blue-100', text: 'text-blue-800', label: t('submissionStatuses.reviewed'), icon: FaCheckCircle },
            approved: { bg: 'bg-green-100', text: 'text-green-800', label: t('submissionStatuses.approved'), icon: FaCheckCircle },
            rejected: { bg: 'bg-red-100', text: 'text-red-800', label: t('submissionStatuses.rejected'), icon: FaTimesCircle },
        };
        return badges[status] || badges.submitted;
    };

    useEffect(() => {
        if (flash?.success) {
            setToastMessage(flash.success);
            setShowToast(true);
            setTimeout(() => setShowToast(false), 5000);
        }
        if (flash?.error) {
            setToastMessage(flash.error);
            setShowToast(true);
            setTimeout(() => setShowToast(false), 5000);
        }
    }, [flash]);

    return (
        <DashboardLayout auth={auth}>
            <Head title={t('teacherChallengeSubmissionsIndexPage.pageTitle', {
                title: challenge.title,
                appName: t('common.appName'),
            })}
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Link
                    href="/teacher/challenge-submissions"
                    className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
                >
                    <BackIcon />
                    {t('teacherChallengeSubmissionsIndexPage.backToChallenges')}
                </Link>

                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <FaTrophy className="text-yellow-600 text-2xl" />
                        <h1 className="text-3xl font-bold text-gray-900">{challenge.title}</h1>
                    </div>
                    <p className="text-gray-600">{t('teacherChallengeSubmissionsIndexPage.subtitle')}</p>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => handleStatusFilter('')}
                            className={`px-4 py-2 rounded-lg transition ${!selectedStatus
                                ? 'bg-[#A3C042] text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            {t('common.all')}
                        </button>
                        <button
                            onClick={() => handleStatusFilter('submitted')}
                            className={`px-4 py-2 rounded-lg transition ${selectedStatus === 'submitted'
                                ? 'bg-yellow-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            {t('submissionStatuses.submitted')}
                        </button>
                        <button
                            onClick={() => handleStatusFilter('reviewed')}
                            className={`px-4 py-2 rounded-lg transition ${selectedStatus === 'reviewed'
                                ? 'bg-[#A3C042] text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            {t('submissionStatuses.reviewed')}
                        </button>
                        <button
                            onClick={() => handleStatusFilter('approved')}
                            className={`px-4 py-2 rounded-lg transition ${selectedStatus === 'approved'
                                ? 'bg-[#A3C042] text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            {t('submissionStatuses.approved')}
                        </button>
                        <button
                            onClick={() => handleStatusFilter('rejected')}
                            className={`px-4 py-2 rounded-lg transition ${selectedStatus === 'rejected'
                                ? 'bg-red-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            {t('submissionStatuses.rejected')}
                        </button>
                    </div>
                </div>

                {submissions.data && submissions.data.length > 0 ? (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            {t('teacherChallengeSubmissionsIndexPage.table.student')}
                                        </th>
                                        <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            {t('teacherChallengeSubmissionsIndexPage.table.submittedAt')}
                                        </th>
                                        <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            {t('teacherChallengeSubmissionsIndexPage.table.status')}
                                        </th>
                                        <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            {t('teacherChallengeSubmissionsIndexPage.table.rating')}
                                        </th>
                                        <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            {t('teacherChallengeSubmissionsIndexPage.table.actions')}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {submissions.data.map((submission) => {
                                        const statusBadge = getStatusBadge(submission.status);
                                        const StatusIcon = statusBadge.icon;
                                        return (
                                            <tr key={submission.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <FaUser className="text-gray-400 ms-2" />
                                                        <span className="text-sm font-medium text-gray-900">
                                                            {submission.student?.name || t('teacherChallengeSubmissionsIndexPage.unknownStudent')}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    <div className="flex items-center gap-1">
                                                        <FaCalendar className="text-xs" />
                                                        {formatDate(submission.submitted_at)}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 py-1 ${statusBadge.bg} ${statusBadge.text} text-xs font-medium rounded flex items-center gap-1 w-fit`}>
                                                        <StatusIcon className="text-xs" />
                                                        {statusBadge.label}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {submission.rating ? (
                                                        <div className="flex items-center gap-1">
                                                            <FaStar className="text-yellow-500" />
                                                            {t('teacherChallengeSubmissionsIndexPage.ratingValue', { rating: submission.rating })}
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-400">-</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <Link
                                                        href={`/teacher/challenge-submissions/${submission.id}`}
                                                        className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                                                    >
                                                        <FaEye />
                                                        {t('teacherChallengeSubmissionsIndexPage.viewAction')}
                                                    </Link>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                        <FaTrophy className="mx-auto text-6xl text-gray-300 mb-4" />
                        <p className="text-gray-500 text-lg">{t('teacherChallengeSubmissionsIndexPage.noSubmissions')}</p>
                    </div>
                )}

                {submissions.links && submissions.links.length > 3 && (
                    <div className="mt-6 flex justify-center">
                        <div className="flex gap-2">
                            {submissions.links.map((link, index) => (
                                <Link
                                    key={index}
                                    href={link.url || '#'}
                                    className={`px-4 py-2 rounded-lg ${link.active
                                        ? 'bg-[#A3C042] text-white'
                                        : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                                    } ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {showToast && (
                <div className="fixed top-4 left-4 right-4 md:left-4 md:right-auto md:w-96 z-50 animate-slide-up">
                    <div className="bg-green-500 text-white rounded-lg shadow-lg p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <FaCheckCircle className="text-xl" />
                            <p className="font-medium">{toastMessage}</p>
                        </div>
                        <button
                            onClick={() => setShowToast(false)}
                            className="me-4 text-white hover:text-gray-200 transition"
                        >
                            <FaTimes />
                        </button>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
