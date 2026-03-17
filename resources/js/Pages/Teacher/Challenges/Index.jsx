import DashboardLayout from '../../../Layouts/DashboardLayout';
import { Head, Link, router } from '@inertiajs/react';
import { FaTrophy, FaPlus, FaCalendar, FaEye, FaEdit, FaTrash, FaUsers, FaSearch } from 'react-icons/fa';
import { useState } from 'react';
import InnovationChallengeCard from '@/Components/Challenges/InnovationChallengeCard';
import { useConfirmDialog } from '@/Contexts/ConfirmContext';
import { useTranslation } from '@/i18n';

export default function TeacherChallengesIndex({ auth, challenges }) {
    const { confirm } = useConfirmDialog();
    const { t, language } = useTranslation();
    const [processing, setProcessing] = useState(null);

    const handleDelete = async (challengeId) => {
        const confirmed = await confirm({
            title: t('teacherChallengesIndexPage.deleteConfirm.title'),
            message: t('teacherChallengesIndexPage.deleteConfirm.message'),
            confirmText: t('common.delete'),
            cancelText: t('common.cancel'),
            variant: 'danger',
        });

        if (confirmed) {
            setProcessing(challengeId);
            router.delete(`/teacher/challenges/${challengeId}`, {
                preserveScroll: true,
                onFinish: () => setProcessing(null),
            });
        }
    };

    const formatDate = (date) => {
        if (!date) return '';
        const d = new Date(date);
        const months = [
            t('common.months.january'),
            t('common.months.february'),
            t('common.months.march'),
            t('common.months.april'),
            t('common.months.may'),
            t('common.months.june'),
            t('common.months.july'),
            t('common.months.august'),
            t('common.months.september'),
            t('common.months.october'),
            t('common.months.november'),
            t('common.months.december'),
        ];
        return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
    };

    const getChallengeTypeLabel = (type) => {
        const labels = {
            cognitive: t('challenges.cognitive'),
            applied: t('challenges.applied'),
            creative: t('challenges.creative'),
            artistic_creative: t('challenges.artisticCreative'),
            collaborative: t('challenges.collaborative'),
            analytical: t('challenges.analytical'),
            technological: t('challenges.technological'),
            behavioral: t('challenges.behavioral'),
            '60_seconds': t('challenges.minseconds'),
            mental_math: t('challenges.mentalMath'),
            conversions: t('challenges.conversions'),
            team_fastest: t('challenges.teamFastest'),
            build_problem: t('challenges.buildProblem'),
            custom: t('teacherChallengesIndexPage.types.custom'),
        };
        return labels[type] || type;
    };

    const getCategoryLabel = (category) => {
        const labels = {
            science: t('categories.science'),
            technology: t('categories.technology'),
            engineering: t('categories.engineering'),
            mathematics: t('categories.mathematics'),
            arts: t('categories.arts'),
            other: t('categories.other'),
        };
        return labels[category] || category;
    };

    const getStatusBadge = (status) => {
        const badges = {
            draft: { bg: 'bg-gray-100', text: 'text-gray-800', label: t('common.draft') },
            active: { bg: 'bg-green-100', text: 'text-green-800', label: t('common.active') },
            completed: { bg: 'bg-blue-100', text: 'text-blue-800', label: t('common.completed') },
            cancelled: { bg: 'bg-red-100', text: 'text-red-800', label: t('common.cancelled') },
        };
        const badge = badges[status] || badges.draft;
        return (
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${badge.bg} ${badge.text}`}>
                {badge.label}
            </span>
        );
    };

    return (
        <DashboardLayout
            auth={auth}
            header={t('teacherChallengesIndexPage.title')}
        >
            <Head title={t('teacherChallengesIndexPage.pageTitle', { appName: t('common.appName') })} />

            <div className="min-h-screen bg-gray-50 pb-32" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Header with Actions */}
                    <div className="mb-8">
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                    {t('teacherChallengesIndexPage.title')}
                                </h1>
                                <p className="text-gray-600">
                                    {t('teacherChallengesIndexPage.subtitle')}
                                </p>
                            </div>
                            <Link
                                href="/teacher/challenges/create"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-[#A3C042] text-white rounded-lg hover:bg-[#8CA635] transition-colors font-semibold shadow-md hover:shadow-lg"
                            >
                                <FaPlus />
                                {t('teacherChallengesIndexPage.actions.launchNew')}
                            </Link>
                        </div>

                        {/* Navigation Tabs */}
                        <div className="flex flex-wrap items-center gap-4 mb-6">
                            <button
                                onClick={() => router.get('/teacher/challenges', { status: '' }, { preserveState: true })}
                                className="px-4 py-2 rounded-lg font-medium transition-colors bg-[#A3C042] text-white"
                            >
                                {t('common.all')}
                            </button>
                            <button
                                onClick={() => router.get('/teacher/challenges', { status: 'completed' }, { preserveState: true })}
                                className="px-4 py-2 rounded-lg font-medium transition-colors bg-white text-gray-700 hover:bg-gray-100"
                            >
                                {t('common.completed')}
                            </button>
                            <button
                                onClick={() => router.get('/teacher/challenges', { status: 'upcoming' }, { preserveState: true })}
                                className="px-4 py-2 rounded-lg font-medium transition-colors bg-white text-gray-700 hover:bg-gray-100"
                            >
                                {t('teacherChallengesIndexPage.tabs.upcoming')}
                            </button>
                            <button
                                onClick={() => router.get('/teacher/challenges', { status: 'active' }, { preserveState: true })}
                                className="px-4 py-2 rounded-lg font-medium transition-colors bg-white text-gray-700 hover:bg-gray-100"
                            >
                                {t('common.active')}
                            </button>
                        </div>

                        {/* Search Bar */}
                        <form onSubmit={(e) => { e.preventDefault(); }} className="mb-6">
                            <div className="relative max-w-md">
                                <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder={t('teacherChallengesIndexPage.searchPlaceholder')}
                                    className="w-full ps-10 pe-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                />
                            </div>
                        </form>
                    </div>

                    {/* Challenges Grid */}
                    <div className="bg-white rounded-lg shadow">
                        {challenges.data && challenges.data.length > 0 ? (
                            <div className="p-6">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {challenges.data.map((challenge) => (
                                        <InnovationChallengeCard
                                            key={challenge.id}
                                            challenge={challenge}
                                            onEdit={(challenge) => router.visit(`/teacher/challenges/${challenge.id}/edit`)}
                                            onManageParticipants={(challenge) => {
                                                router.visit(`/teacher/challenges/${challenge.id}?tab=participants`);
                                            }}
                                            routePrefix="teacher.challenges"
                                        />
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <FaTrophy className="mx-auto text-6xl text-gray-300 mb-4" />
                                <p className="text-gray-500 text-lg mb-4">{t('teacherChallengesIndexPage.empty')}</p>
                                <Link
                                    href="/teacher/challenges/create"
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-[#A3C042] text-white rounded-lg hover:opacity-90 transition"
                                >
                                    <FaPlus />
                                    {t('teacherChallengesIndexPage.actions.createNew')}
                                </Link>
                            </div>
                        )}

                        {/* Pagination */}
                        {challenges.links && challenges.links.length > 3 && (
                            <div className="p-6 border-t border-gray-200 flex justify-center">
                                <div className="flex gap-2">
                                    {challenges.links.map((link, index) => (
                                        <Link
                                            key={index}
                                            href={link.url || '#'}
                                            className={`px-4 py-2 rounded-lg ${link.active
                                                ? 'bg-[#A3C042] text-white'
                                                : 'bg-white text-gray-700 hover:bg-gray-100'
                                                } ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Bottom Banner */}
            <div className="mt-8 bg-purple-900 text-white p-6 rounded-xl shadow-2xl" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    {/* Right Side */}
                    <div className="hidden md:flex items-center justify-center">
                        <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center">
                            <FaTrophy className="text-4xl text-white" />
                        </div>
                    </div>

                    {/* Center */}
                    <div className="flex-1 text-center md:">
                        <h3 className="text-2xl font-bold mb-2">{t('teacherChallengesIndexPage.banner.title')}</h3>
                        <p className="text-purple-100 text-sm md:text-base">
                            {t('teacherChallengesIndexPage.banner.description')}
                        </p>
                    </div>

                    {/* Left Side */}
                    <div className="flex-shrink-0">
                        <Link
                            href="/teacher/challenges/create"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-purple-900 rounded-lg hover:bg-purple-50 transition-colors font-bold shadow-lg hover:shadow-xl"
                        >
                            <FaPlus />
                            {t('teacherChallengesIndexPage.actions.createCustom')}
                        </Link>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

