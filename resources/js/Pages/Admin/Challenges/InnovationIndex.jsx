import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState, useCallback } from 'react';
import { FaPlus, FaSearch, FaTrophy } from 'react-icons/fa';
import InnovationChallengeCard from '@/Components/Challenges/InnovationChallengeCard';
import { useConfirmDialog } from '@/Contexts/ConfirmContext';
import { useTranslation } from '@/i18n';

export default function AdminInnovationChallengesIndex({ challenges, stats, filters }) {
    const { confirm } = useConfirmDialog();
    const { t, language } = useTranslation();
    const [search, setSearch] = useState(filters?.search || '');
    const [selectedStatus, setSelectedStatus] = useState(filters?.status || 'active');

    const handleStatusFilter = useCallback((status) => {
        setSelectedStatus(status);
        router.get(route('admin.challenges.index'), {
            status: status || undefined,
            search: search || undefined,
        }, {
            preserveState: true,
            preserveScroll: true,
            only: ['challenges', 'filters'],
        });
    }, [search]);

    const handleSearch = useCallback((e) => {
        e.preventDefault();
        router.get(route('admin.challenges.index'), {
            status: selectedStatus || undefined,
            search: search || undefined,
        }, {
            preserveState: true,
            preserveScroll: true,
            only: ['challenges', 'filters'],
        });
    }, [search, selectedStatus]);

    const handleEdit = useCallback((challenge) => {
        router.visit(route('admin.challenges.edit', challenge.id));
    }, []);

    const handleManageParticipants = useCallback((challenge) => {
        router.visit(route('admin.challenges.show', challenge.id) + '?tab=participants');
    }, []);

    const challengesData = (challenges?.data || []).filter(challenge => {
        if (!selectedStatus) return true;
        return challenge.status === selectedStatus;
    });
    const hasChallenges = challengesData.length > 0;

    return (
        <DashboardLayout header={t('adminChallengesIndexPage.title')}>
            <Head title={t('adminChallengesIndexPage.pageTitle', { appName: t('common.appName') })} />

            <div className="min-h-screen bg-gray-50 pb-32" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Header Section */}
                    <div className="mb-8">
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                    {t('adminChallengesIndexPage.title')}
                                </h1>
                                <p className="text-gray-600">
                                    {t('adminChallengesIndexPage.subtitle')}
                                </p>
                            </div>
                            <Link
                                href={route('admin.challenges.create')}
                                className="inline-flex items-center gap-2 px-6 py-3 bg-[#A3C042] text-white rounded-lg hover:bg-[#8CA635] transition-colors font-semibold shadow-md hover:shadow-lg"
                            >
                                <FaPlus />
                                {t('adminChallengesIndexPage.actions.launchNew')}
                            </Link>
                        </div>

                        {/* Navigation Tabs */}
                        <div className="flex flex-wrap items-center gap-4 mb-6">
                            <button
                                onClick={() => handleStatusFilter('')}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${!selectedStatus
                                    ? 'bg-[#A3C042] text-white'
                                    : 'bg-white text-gray-700 hover:bg-gray-100'
                                    }`}
                            >
                                {t('adminChallengesIndexPage.filters.all')}
                            </button>
                            <button
                                onClick={() => handleStatusFilter('completed')}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${selectedStatus === 'completed'
                                    ? 'bg-[#A3C042] text-white'
                                    : 'bg-white text-gray-700 hover:bg-gray-100'
                                    }`}
                            >
                                {t('common.completed')}
                            </button>
                            <button
                                onClick={() => handleStatusFilter('upcoming')}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${selectedStatus === 'upcoming'
                                    ? 'bg-[#A3C042] text-white'
                                    : 'bg-white text-gray-700 hover:bg-gray-100'
                                    }`}
                            >
                                {t('common.upcoming')}
                            </button>
                            <button
                                onClick={() => handleStatusFilter('active')}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${selectedStatus === 'active'
                                    ? 'bg-[#A3C042] text-white'
                                    : 'bg-white text-gray-700 hover:bg-gray-100'
                                    }`}
                            >
                                {t('common.active')}
                            </button>
                        </div>

                        {/* Search Bar */}
                        <form onSubmit={handleSearch} className="mb-6">
                            <div className="relative max-w-md">
                                <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder={t('adminChallengesIndexPage.searchPlaceholder')}
                                    className="w-full ps-10 pe-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                />
                            </div>
                        </form>
                    </div>

                    {/* Challenges Grid */}
                    {hasChallenges ? (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {challengesData.map((challenge) => (
                                <InnovationChallengeCard
                                    key={challenge.id}
                                    challenge={challenge}
                                    onEdit={handleEdit}
                                    onManageParticipants={handleManageParticipants}
                                    routePrefix="admin.challenges"
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                            <div className="max-w-md mx-auto">
                                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                                    <FaTrophy className="text-4xl text-gray-400" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">{t('adminChallengesIndexPage.empty.title')}</h3>
                                <p className="text-gray-500 mb-6">
                                    {t('adminChallengesIndexPage.empty.description')}
                                </p>
                                <Link
                                    href={route('admin.challenges.create')}
                                    className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#A3C042] text-white rounded-xl hover:bg-[#8CA635] transition-all shadow-lg hover:shadow-xl font-bold"
                                >
                                    <FaPlus />
                                    <span>{t('adminChallengesIndexPage.actions.create')}</span>
                                </Link>
                            </div>
                        </div>
                    )}

                    {/* Pagination */}
                    {challenges?.links && challenges.links.length > 3 && (
                        <div className="mt-8 flex items-center justify-center">
                            <div className="flex gap-2">
                                {challenges.links.map((link, index) => (
                                    <Link
                                        key={index}
                                        href={link.url || '#'}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${link.active
                                            ? 'bg-[#A3C042] text-white shadow-sm'
                                            : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                                            } ${!link.url ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
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
                        <h3 className="text-2xl font-bold mb-2">{t('adminChallengesIndexPage.banner.title')}</h3>
                        <p className="text-purple-100 text-sm md:text-base">
                            {t('adminChallengesIndexPage.banner.description')}
                        </p>
                    </div>

                    {/* Left Side */}
                    <div className="flex-shrink-0">
                        <Link
                            href={route('admin.challenges.create')}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-purple-900 rounded-lg hover:bg-purple-50 transition-colors font-bold shadow-lg hover:shadow-xl"
                        >
                            <FaPlus />
                            {t('adminChallengesIndexPage.actions.createCustom')}
                        </Link>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

