import DashboardLayout from '../../../Layouts/DashboardLayout';
import { Head, Link } from '@inertiajs/react';
import {
    FaArrowLeft,
    FaAward,
    FaCalendar,
    FaCheckCircle,
    FaClock,
    FaEdit,
    FaTimesCircle,
    FaTrophy,
    FaUsers,
} from 'react-icons/fa';
import { useTranslation } from '@/i18n';

export default function TeacherChallengeShow({ auth, challenge }) {
    const { t } = useTranslation();

    const formatDate = (date) => {
        if (!date) return '';
        const d = new Date(date);
        const months = [
            t('common.january'),
            t('common.february'),
            t('common.march'),
            t('common.april'),
            t('common.may'),
            t('common.june'),
            t('common.july'),
            t('common.august'),
            t('common.september'),
            t('common.october'),
            t('common.november'),
            t('common.december'),
        ];
        return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
    };

    const getStatusBadge = (status) => {
        const badges = {
            draft: { bg: 'bg-gray-100', text: 'text-gray-800', label: t('common.draft'), icon: FaClock },
            active: { bg: 'bg-green-100', text: 'text-green-800', label: t('common.active'), icon: FaCheckCircle },
            completed: { bg: 'bg-blue-100', text: 'text-blue-800', label: t('common.completed'), icon: FaCheckCircle },
            cancelled: { bg: 'bg-red-100', text: 'text-red-800', label: t('common.cancelled'), icon: FaTimesCircle },
        };
        const badge = badges[status] || badges.draft;
        const Icon = badge.icon;
        return (
            <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${badge.bg} ${badge.text}`}>
                <Icon className="text-xs" />
                {badge.label}
            </span>
        );
    };

    return (
        <DashboardLayout auth={auth} header={t('teacherChallengesIndexPage.title')}>
            <Head title={`${challenge?.title || t('teacherChallengesIndexPage.title')} - ${t('common.appName')}`} />

            <div className="py-6">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <div className="mb-6">
                        <Link href="/teacher/challenges" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition">
                            <FaArrowLeft />
                            {t('common.back')}
                        </Link>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-start justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <FaTrophy className="text-yellow-600 text-3xl" />
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900 mb-2">{challenge?.title}</h1>
                                    {getStatusBadge(challenge?.status)}
                                </div>
                            </div>
                            <Link
                                href={`/teacher/challenges/${challenge?.id}/edit`}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-[#A3C042]/10 text-[#6b7f2c] rounded-lg hover:bg-[#A3C042]/20 transition"
                            >
                                <FaEdit />
                                {t('common.edit')}
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 text-gray-700">
                            <div><strong>{t('challenges.challengeType')}:</strong> {challenge?.challenge_type || '-'}</div>
                            <div><strong>{t('challenges.category')}:</strong> {challenge?.category || '-'}</div>
                            <div className="flex items-center gap-2">
                                <FaCalendar />
                                <span><strong>{t('adminChallengesIndexPage.table.startDate')}:</strong> {formatDate(challenge?.start_date)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <FaCalendar />
                                <span><strong>{t('adminChallengesIndexPage.table.endDate')}:</strong> {formatDate(challenge?.deadline)}</span>
                            </div>
                            {challenge?.max_participants && (
                                <div className="flex items-center gap-2">
                                    <FaUsers />
                                    <span><strong>{t('challenges.participants')}:</strong> {challenge?.current_participants || 0} / {challenge?.max_participants}</span>
                                </div>
                            )}
                            {challenge?.points_reward > 0 && (
                                <div className="flex items-center gap-2">
                                    <FaAward />
                                    <span><strong>{t('challenges.points')}:</strong> {challenge?.points_reward}</span>
                                </div>
                            )}
                        </div>

                        {challenge?.objective && (
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('studentChallengesShowPage.sections.objective')}</h3>
                                <p className="text-gray-700 leading-relaxed">{challenge.objective}</p>
                            </div>
                        )}

                        {challenge?.description && (
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('studentChallengesShowPage.sections.description')}</h3>
                                <p className="text-gray-700 leading-relaxed whitespace-pre-line">{challenge.description}</p>
                            </div>
                        )}

                        {challenge?.instructions && (
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('studentChallengesShowPage.sections.howTo')}</h3>
                                <p className="text-gray-700 leading-relaxed whitespace-pre-line">{challenge.instructions}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
