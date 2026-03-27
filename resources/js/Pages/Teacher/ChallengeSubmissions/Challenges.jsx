import { Head, Link } from '@inertiajs/react';
import DashboardLayout from '../../../Layouts/DashboardLayout';
import { FaTrophy, FaUsers, FaCalendar, FaEye } from 'react-icons/fa';
import { useTranslation } from '@/i18n';
import { toHijriDate } from '@/utils/dateUtils';

export default function TeacherChallengeSubmissionsChallenges({ auth, challenges }) {
    const { t, language } = useTranslation();

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

    const getStatusBadge = (challenge) => {
        const now = new Date();
        const startDate = new Date(challenge.start_date);
        const deadline = new Date(challenge.deadline);

        if (challenge.status === 'active' && startDate <= now && deadline >= now) {
            return { bg: 'bg-green-100', text: 'text-green-800', label: t('teacherChallengeSubmissionsPage.statuses.active') };
        }

        if (challenge.status === 'active' && startDate > now) {
            return { bg: 'bg-blue-100', text: 'text-blue-800', label: t('teacherChallengeSubmissionsPage.statuses.upcoming') };
        }

        return { bg: 'bg-gray-100', text: 'text-gray-800', label: t('teacherChallengeSubmissionsPage.statuses.ended') };
    };

    return (
        <DashboardLayout auth={auth}>
            <Head title={t('teacherChallengeSubmissionsPage.pageTitle', { appName: t('common.appName') })} />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('teacherChallengeSubmissionsPage.title')}</h1>
                    <p className="text-gray-600">{t('teacherChallengeSubmissionsPage.subtitle')}</p>
                </div>

                {challenges.data && challenges.data.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {challenges.data.map((challenge) => {
                            const statusBadge = getStatusBadge(challenge);
                            return (
                                <Link
                                    key={challenge.id}
                                    href={`/teacher/challenge-submissions?challenge_id=${challenge.id}`}
                                    className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition duration-300 p-6"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-2">
                                            <FaTrophy className="text-yellow-600 text-xl" />
                                            <h3 className="text-lg font-bold text-gray-900">{challenge.title}</h3>
                                        </div>
                                        <span className={`px-2 py-1 ${statusBadge.bg} ${statusBadge.text} text-xs font-medium rounded`}>
                                            {statusBadge.label}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                                        <div className="flex items-center gap-1">
                                            <FaUsers />
                                            <span>{t('teacherChallengeSubmissionsPage.submissionsCount', { count: challenge.submissions_count || 0 })}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <FaCalendar />
                                            <span>{formatDate(challenge.deadline)}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 text-blue-600 hover:text-blue-700">
                                        <FaEye />
                                        <span className="text-sm font-medium">{t('teacherChallengeSubmissionsPage.viewSubmissions')}</span>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                        <FaTrophy className="mx-auto text-6xl text-gray-300 mb-4" />
                        <p className="text-gray-500 text-lg">{t('teacherChallengeSubmissionsPage.noChallenges')}</p>
                    </div>
                )}

                {challenges.links && challenges.links.length > 3 && (
                    <div className="mt-6 flex justify-center">
                        <div className="flex gap-2">
                            {challenges.links.map((link, index) => (
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
        </DashboardLayout>
    );
}
