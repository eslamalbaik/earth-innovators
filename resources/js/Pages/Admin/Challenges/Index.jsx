import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { useState, useMemo, useCallback, lazy, Suspense, useEffect, useRef } from 'react';
import {
    FaSearch,
    FaFilter,
    FaEye,
    FaEdit,
    FaTrash,
    FaPlus,
    FaSave,
    FaTimes,
    FaTable,
    FaTh,
    FaChartLine,
    FaTrophy
} from 'react-icons/fa';
import ChallengeTable from '@/Components/Challenges/ChallengeTable';
import ChallengeCardGrid from '@/Components/Challenges/ChallengeCardGrid';
import ModernChallengeTable from '@/Components/Challenges/ModernChallengeTable';
import ModernChallengeCardGrid from '@/Components/Challenges/ModernChallengeCard';
import InnovationChallengeCard from '@/Components/Challenges/InnovationChallengeCard';
import { useConfirmDialog } from '@/Contexts/ConfirmContext';
import { useTranslation } from '@/i18n';

// PERFORMANCE: Lazy load AnalyticsPreview - only loads when analytics prop exists
// This reduces initial bundle size since analytics is optional
const AnalyticsPreview = lazy(() => import('@/Components/Challenges/AnalyticsPreview'));

export default function AdminChallengesIndex({ challenges, stats, filters, schools = [], analytics = null }) {
    const { confirm } = useConfirmDialog();
    const { t, language } = useTranslation();
    const [search, setSearch] = useState(filters?.search || '');
    const [status, setStatus] = useState(filters?.status || '');
    const [category, setCategory] = useState(filters?.category || '');
    const [challengeType, setChallengeType] = useState(filters?.challenge_type || '');
    const [viewMode, setViewMode] = useState('table'); // 'table' or 'card'
    const [showEditModal, setShowEditModal] = useState(false);
    const [challengeToEdit, setChallengeToEdit] = useState(null);

    // PERFORMANCE: Optimistic UI state management for instant feedback
    const [optimisticChallenges, setOptimisticChallenges] = useState(null);
    const [deletingIds, setDeletingIds] = useState(new Set());
    const [updatingId, setUpdatingId] = useState(null);

    const { data: editData, setData: setEditData, put: updateChallenge, processing: editProcessing, errors: editErrors, reset: resetEditForm } = useForm({
        title: '',
        objective: '',
        description: '',
        instructions: '',
        challenge_type: '',
        category: '',
        age_group: '',
        school_id: '',
        start_date: '',
        deadline: '',
        status: 'draft',
        points_reward: 0,
        max_participants: null,
    });

    /**
     * PERFORMANCE: Use partial reload for filtering to preserve other component state
     */
    const handleFilter = useCallback(() => {
        router.get(route('admin.challenges.index'), {
            search: search || undefined,
            status: status || undefined,
            category: category || undefined,
            challenge_type: challengeType || undefined,
        }, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
            only: ['challenges', 'filters'], // PARTIAL RELOAD: Only refresh challenges and filters
        });
    }, [search, status, category, challengeType]);

    // PERFORMANCE: Debounce search input for auto-filtering (optional enhancement)
    // Users can still use the manual filter button for immediate filtering
    const filterTimeoutRef = useRef(null);

    useEffect(() => {
        // Clear existing timeout
        if (filterTimeoutRef.current) {
            clearTimeout(filterTimeoutRef.current);
        }

        // Only auto-filter on search changes, not on status/category changes
        // This prevents too many requests while user is selecting filters
        if (search !== (filters?.search || '')) {
            filterTimeoutRef.current = setTimeout(() => {
                handleFilter();
            }, 500); // 500ms debounce delay
        }

        // Cleanup on unmount or when search changes
        return () => {
            if (filterTimeoutRef.current) {
                clearTimeout(filterTimeoutRef.current);
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search]); // Only trigger on search changes for debouncing

    /**
     * PERFORMANCE OPTIMIZED: Optimistic delete with instant UI feedback
     * Removes item from UI immediately, then syncs with server
     */
    const handleDelete = useCallback(async (challengeId) => {
        const confirmed = await confirm({
            title: t('adminChallengesIndexPage.deleteConfirm.title'),
            message: t('adminChallengesIndexPage.deleteConfirm.message'),
            confirmText: t('common.delete'),
            cancelText: t('common.cancel'),
            variant: 'danger',
        });

        if (!confirmed) {
            return;
        }

        // INSTANT UI UPDATE: Remove from local state immediately
        const challengesData = challenges?.data || [];
        setOptimisticChallenges(challengesData.filter(c => c.id !== challengeId));
        setDeletingIds(prev => new Set([...prev, challengeId]));

        // Server sync: Use partial reload to only refresh challenges and stats
        router.delete(route('admin.challenges.destroy', challengeId), {
            preserveState: true,
            preserveScroll: true,
            only: ['challenges', 'stats'], // PARTIAL RELOAD: Only refresh these props
            onSuccess: () => {
                setDeletingIds(prev => {
                    const next = new Set(prev);
                    next.delete(challengeId);
                    return next;
                });
                setOptimisticChallenges(null);
            },
            onError: () => {
                // Revert optimistic update on error
                setOptimisticChallenges(null);
                setDeletingIds(prev => {
                    const next = new Set(prev);
                    next.delete(challengeId);
                    return next;
                });
            },
        });
    }, [challenges]);

    /**
     * PERFORMANCE: Memoize handlers to prevent unnecessary re-renders
     */
    const handleEdit = useCallback((challenge) => {
        setChallengeToEdit(challenge);
        const startDate = new Date(challenge.start_date).toISOString().slice(0, 16);
        const deadlineDate = new Date(challenge.deadline).toISOString().slice(0, 16);

        setEditData({
            title: challenge.title || '',
            objective: challenge.objective || '',
            description: challenge.description || '',
            instructions: challenge.instructions || '',
            challenge_type: challenge.challenge_type || '',
            category: challenge.category || '',
            age_group: challenge.age_group || '',
            school_id: challenge.school_id || '',
            start_date: startDate,
            deadline: deadlineDate,
            status: challenge.status || 'draft',
            points_reward: challenge.points_reward || 0,
            max_participants: challenge.max_participants || null,
        });
        setShowEditModal(true);
    }, [setEditData]);

    const handleView = useCallback((challenge) => {
        router.visit(route('admin.challenges.show', challenge.id));
    }, []);

    /**
     * PERFORMANCE OPTIMIZED: Optimistic update with partial reload
     * Note: updateChallenge and resetEditForm from useForm are stable references
     */
    const handleEditSubmit = useCallback((e) => {
        e.preventDefault();

        if (!challengeToEdit) return;

        // INSTANT UI UPDATE: Mark as updating for visual feedback
        setUpdatingId(challengeToEdit.id);

        // Update with partial reload - only refresh challenges and stats
        updateChallenge(route('admin.challenges.update', challengeToEdit.id), {
            preserveState: true,
            preserveScroll: true,
            only: ['challenges', 'stats'], // PARTIAL RELOAD: Only refresh these props
            onSuccess: () => {
                setShowEditModal(false);
                setChallengeToEdit(null);
                resetEditForm();
                setUpdatingId(null);
            },
            onError: () => {
                setUpdatingId(null);
            },
        });
    }, [challengeToEdit]);

    const closeEditModal = useCallback(() => {
        setShowEditModal(false);
        setChallengeToEdit(null);
        resetEditForm();
    }, [resetEditForm]);

    /**
     * PERFORMANCE: Memoize helper functions to prevent recreation on each render
     */
    const getStatusBadge = useCallback((status) => {
        const statusMap = {
            active: { bg: 'bg-green-100', text: 'text-green-800', label: t('common.active'), border: 'border-green-300' },
            draft: { bg: 'bg-gray-100', text: 'text-gray-800', label: t('common.draft'), border: 'border-gray-300' },
            completed: { bg: 'bg-gray-100', text: 'text-gray-800', label: t('common.completed'), border: 'border-gray-300' },
            cancelled: { bg: 'bg-red-100', text: 'text-red-800', label: t('common.cancelled'), border: 'border-red-300' },
            upcoming: { bg: 'bg-blue-100', text: 'text-blue-800', label: t('common.upcoming'), border: 'border-blue-300' },
        };
        const statusConfig = statusMap[status] || { bg: 'bg-gray-100', text: 'text-gray-800', label: status, border: 'border-gray-300' };
        return (
            <span className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}>
                {statusConfig.label}
            </span>
        );
    }, [t]);

    const getCategoryLabel = useCallback((category) => {
        const categoryMap = {
            science: t('categories.science'),
            technology: t('categories.technology'),
            engineering: t('categories.engineering'),
            mathematics: t('categories.mathematics'),
            arts: t('categories.arts'),
            other: t('categories.other'),
        };
        return categoryMap[category] || category;
    }, [t]);

    const formatDate = useCallback((dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
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
        return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
    }, [t]);

    /**
     * PERFORMANCE: Use optimistic state if available, otherwise use server data
     * This provides instant UI feedback while server processes the request
     */
    const challengesData = useMemo(() => {
        if (optimisticChallenges !== null) {
            return optimisticChallenges;
        }
        return challenges?.data || [];
    }, [optimisticChallenges, challenges]);

    const hasChallenges = challengesData.length > 0;

    return (
        <DashboardLayout header={t('adminChallengesIndexPage.title')}>
            <Head title={t('adminChallengesIndexPage.pageTitle', { appName: t('common.appName') })} />

            <div className="min-h-screen bg-gray-50 pb-32" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Analytics Preview - Admin Only */}
                    {/* PERFORMANCE: Lazy loaded with Suspense to prevent blocking initial render */}
                    {analytics && (
                        <div className="mb-8">
                            <Suspense fallback={
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
                                    <div className="h-6 bg-gray-200 rounded w-1/3 mb-6"></div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="h-24 bg-gray-200 rounded"></div>
                                        <div className="h-24 bg-gray-200 rounded"></div>
                                    </div>
                                </div>
                            }>
                                <AnalyticsPreview stats={analytics} />
                            </Suspense>
                        </div>
                    )}

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
                        <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm font-medium text-gray-600">{t('adminChallengesIndexPage.stats.totalChallenges')}</p>
                                <FaTrophy className="text-gray-400 text-lg" />
                            </div>
                            <p className="text-3xl font-bold text-gray-900">{stats?.total || 0}</p>
                        </div>
                        <div className="bg-gradient-to-br from-green-50 to-white rounded-xl shadow-sm border border-green-200 p-6 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm font-medium text-gray-600">{t('adminChallengesIndexPage.stats.active')}</p>
                                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            </div>
                            <p className="text-3xl font-bold text-green-600">{stats?.active || 0}</p>
                        </div>
                        <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm font-medium text-gray-600">{t('common.draft')}</p>
                                <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                            </div>
                            <p className="text-3xl font-bold text-gray-600">{stats?.draft || 0}</p>
                        </div>
                        <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl shadow-sm border border-blue-200 p-6 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm font-medium text-gray-600">{t('common.completed')}</p>
                                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                            </div>
                            <p className="text-3xl font-bold text-blue-600">{stats?.completed || 0}</p>
                        </div>
                        <div className="bg-gradient-to-br from-red-50 to-white rounded-xl shadow-sm border border-red-200 p-6 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm font-medium text-gray-600">{t('common.cancelled')}</p>
                                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                            </div>
                            <p className="text-3xl font-bold text-red-600">{stats?.cancelled || 0}</p>
                        </div>
                    </div>

                    {/* Header with Actions */}
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
                                onClick={() => {
                                    setStatus('');
                                    handleFilter();
                                }}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${!status
                                    ? 'bg-[#A3C042] text-white'
                                    : 'bg-white text-gray-700 hover:bg-gray-100'
                                    }`}
                            >
                                {t('adminChallengesIndexPage.filters.all')}
                            </button>
                            <button
                                onClick={() => {
                                    setStatus('completed');
                                    handleFilter();
                                }}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${status === 'completed'
                                    ? 'bg-[#A3C042] text-white'
                                    : 'bg-white text-gray-700 hover:bg-gray-100'
                                    }`}
                            >
                                {t('common.completed')}
                            </button>
                            <button
                                onClick={() => {
                                    setStatus('upcoming');
                                    handleFilter();
                                }}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${status === 'upcoming'
                                    ? 'bg-[#A3C042] text-white'
                                    : 'bg-white text-gray-700 hover:bg-gray-100'
                                    }`}
                            >
                                {t('common.upcoming')}
                            </button>
                            <button
                                onClick={() => {
                                    setStatus('active');
                                    handleFilter();
                                }}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${status === 'active'
                                    ? 'bg-[#A3C042] text-white'
                                    : 'bg-white text-gray-700 hover:bg-gray-100'
                                    }`}
                            >
                                {t('common.active')}
                            </button>
                        </div>
                    </div>

                    {/* Search Bar */}
                    <form onSubmit={(e) => { e.preventDefault(); handleFilter(); }} className="mb-6">
                        <div className="relative max-w-md">
                            <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleFilter()}
                                placeholder={t('adminChallengesIndexPage.searchPlaceholder')}
                                className="w-full ps-10 pe-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />
                        </div>
                    </form>

                    {/* Challenges List */}
                    {hasChallenges ? (
                        <>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                                {challengesData.map((challenge) => (
                                    <InnovationChallengeCard
                                        key={challenge.id}
                                        challenge={challenge}
                                        onEdit={handleEdit}
                                        onManageParticipants={(challenge) => {
                                            router.visit(route('admin.challenges.show', challenge.id) + '?tab=participants');
                                        }}
                                        routePrefix="admin.challenges"
                                    />
                                ))}
                            </div>
                            {/* Pagination */}
                            {challenges.links && challenges.links.length > 3 && (
                                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                                    <div className="flex items-center justify-between">
                                        <div className="text-sm text-gray-700">
                                            {t('adminChallengesIndexPage.paginationSummary', { from: challenges.from, to: challenges.to, total: challenges.total })}
                                        </div>
                                        <div className="flex gap-2">
                                            {challenges.links.map((link, index) => (
                                                <Link
                                                    key={index}
                                                    href={link.url || '#'}
                                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${link.active
                                                        ? 'bg-primary-500 text-white shadow-sm'
                                                        : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                                                        } ${!link.url ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}`}
                                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
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

                    {/* Edit Modal */}
                    {showEditModal && challengeToEdit && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
                            <div className="bg-white rounded-xl shadow-xl p-6 max-w-4xl w-full my-8 max-h-[90vh] overflow-y-auto">
                                <div className="flex items-center justify-between mb-6 sticky top-0 bg-white pb-4 border-b">
                                    <h3 className="text-2xl font-bold text-gray-900">{t('adminChallengesIndexPage.editModal.title')}</h3>
                                    <button
                                        onClick={closeEditModal}
                                        className="text-gray-400 hover:text-gray-600 transition"
                                    >
                                        <FaTimes className="text-xl" />
                                    </button>
                                </div>

                                <form onSubmit={handleEditSubmit} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Title */}
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                {t('adminChallengesIndexPage.editModal.titleLabel')} <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={editData.title}
                                                onChange={(e) => setEditData('title', e.target.value)}
                                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${editErrors.title ? 'border-red-500' : 'border-gray-300'
                                                    }`}
                                                required
                                            />
                                            {editErrors.title && (
                                                <p className="mt-1 text-sm text-red-600">{editErrors.title}</p>
                                            )}
                                        </div>

                                        {/* Objective */}
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                {t('adminChallengesIndexPage.editModal.objectiveLabel')} <span className="text-red-500">*</span>
                                            </label>
                                            <textarea
                                                value={editData.objective}
                                                onChange={(e) => setEditData('objective', e.target.value)}
                                                rows={3}
                                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${editErrors.objective ? 'border-red-500' : 'border-gray-300'
                                                    }`}
                                                required
                                            />
                                            {editErrors.objective && (
                                                <p className="mt-1 text-sm text-red-600">{editErrors.objective}</p>
                                            )}
                                        </div>

                                        {/* Description */}
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                {t('adminChallengesIndexPage.editModal.descriptionLabel')} <span className="text-red-500">*</span>
                                            </label>
                                            <textarea
                                                value={editData.description}
                                                onChange={(e) => setEditData('description', e.target.value)}
                                                rows={4}
                                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${editErrors.description ? 'border-red-500' : 'border-gray-300'
                                                    }`}
                                                required
                                            />
                                            {editErrors.description && (
                                                <p className="mt-1 text-sm text-red-600">{editErrors.description}</p>
                                            )}
                                        </div>

                                        {/* Instructions */}
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                {t('adminChallengesIndexPage.editModal.instructionsLabel')} <span className="text-red-500">*</span>
                                            </label>
                                            <textarea
                                                value={editData.instructions}
                                                onChange={(e) => setEditData('instructions', e.target.value)}
                                                rows={4}
                                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${editErrors.instructions ? 'border-red-500' : 'border-gray-300'
                                                    }`}
                                                required
                                            />
                                            {editErrors.instructions && (
                                                <p className="mt-1 text-sm text-red-600">{editErrors.instructions}</p>
                                            )}
                                        </div>

                                        {/* Challenge Type */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                {t('adminChallengesIndexPage.editModal.challengeTypeLabel')} <span className="text-red-500">*</span>
                                            </label>
                                            <select
                                                value={editData.challenge_type}
                                                onChange={(e) => setEditData('challenge_type', e.target.value)}
                                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${editErrors.challenge_type ? 'border-red-500' : 'border-gray-300'
                                                    }`}
                                                required
                                            >
                                                <option value="">{t('adminChallengesIndexPage.editModal.selectChallengeType')}</option>
                                                <option value="60_seconds">{t('challenges.minseconds')}</option>
                                                <option value="mental_math">{t('challenges.mentalMath')}</option>
                                                <option value="conversions">{t('challenges.conversions')}</option>
                                                <option value="team_fastest">{t('challenges.teamFastest')}</option>
                                                <option value="build_problem">{t('challenges.buildProblem')}</option>
                                                <option value="custom">{t('adminChallengesIndexPage.types.custom')}</option>
                                            </select>
                                            {editErrors.challenge_type && (
                                                <p className="mt-1 text-sm text-red-600">{editErrors.challenge_type}</p>
                                            )}
                                        </div>

                                        {/* Category */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                {t('adminChallengesIndexPage.editModal.categoryLabel')} <span className="text-red-500">*</span>
                                            </label>
                                            <select
                                                value={editData.category}
                                                onChange={(e) => setEditData('category', e.target.value)}
                                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${editErrors.category ? 'border-red-500' : 'border-gray-300'
                                                    }`}
                                                required
                                            >
                                                <option value="">{t('adminChallengesIndexPage.editModal.selectCategory')}</option>
                                                <option value="science">{t('categories.science')}</option>
                                                <option value="technology">{t('categories.technology')}</option>
                                                <option value="engineering">{t('categories.engineering')}</option>
                                                <option value="mathematics">{t('categories.mathematics')}</option>
                                                <option value="arts">{t('categories.arts')}</option>
                                                <option value="other">{t('categories.other')}</option>
                                            </select>
                                            {editErrors.category && (
                                                <p className="mt-1 text-sm text-red-600">{editErrors.category}</p>
                                            )}
                                        </div>

                                        {/* Age Group */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                {t('adminChallengesIndexPage.editModal.ageGroupLabel')} <span className="text-red-500">*</span>
                                            </label>
                                            <select
                                                value={editData.age_group}
                                                onChange={(e) => setEditData('age_group', e.target.value)}
                                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${editErrors.age_group ? 'border-red-500' : 'border-gray-300'
                                                    }`}
                                                required
                                            >
                                                <option value="">{t('adminChallengesIndexPage.editModal.selectAgeGroup')}</option>
                                                <option value="6-9">{t('adminChallengesIndexPage.ageGroups.6to9')}</option>
                                                <option value="10-13">{t('adminChallengesIndexPage.ageGroups.10to13')}</option>
                                                <option value="14-17">{t('adminChallengesIndexPage.ageGroups.14to17')}</option>
                                                <option value="18+">{t('adminChallengesIndexPage.ageGroups.18plus')}</option>
                                            </select>
                                            {editErrors.age_group && (
                                                <p className="mt-1 text-sm text-red-600">{editErrors.age_group}</p>
                                            )}
                                        </div>

                                        {/* School */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                {t('adminChallengesIndexPage.editModal.schoolLabel')}
                                            </label>
                                            <select
                                                value={editData.school_id}
                                                onChange={(e) => setEditData('school_id', e.target.value)}
                                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${editErrors.school_id ? 'border-red-500' : 'border-gray-300'
                                                    }`}
                                            >
                                                <option value="">{t('adminChallengesIndexPage.editModal.selectSchool')}</option>
                                                {schools.map((school) => (
                                                    <option key={school.id} value={school.id}>
                                                        {school.name}
                                                    </option>
                                                ))}
                                            </select>
                                            {editErrors.school_id && (
                                                <p className="mt-1 text-sm text-red-600">{editErrors.school_id}</p>
                                            )}
                                        </div>

                                        {/* Start Date */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                {t('adminChallengesIndexPage.editModal.startDateLabel')} <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="datetime-local"
                                                value={editData.start_date}
                                                onChange={(e) => setEditData('start_date', e.target.value)}
                                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${editErrors.start_date ? 'border-red-500' : 'border-gray-300'
                                                    }`}
                                                required
                                            />
                                            {editErrors.start_date && (
                                                <p className="mt-1 text-sm text-red-600">{editErrors.start_date}</p>
                                            )}
                                        </div>

                                        {/* Deadline */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                {t('adminChallengesIndexPage.editModal.deadlineLabel')} <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="datetime-local"
                                                value={editData.deadline}
                                                onChange={(e) => setEditData('deadline', e.target.value)}
                                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${editErrors.deadline ? 'border-red-500' : 'border-gray-300'
                                                    }`}
                                                required
                                            />
                                            {editErrors.deadline && (
                                                <p className="mt-1 text-sm text-red-600">{editErrors.deadline}</p>
                                            )}
                                        </div>

                                        {/* Status */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                {t('common.status')}
                                            </label>
                                            <select
                                                value={editData.status}
                                                onChange={(e) => setEditData('status', e.target.value)}
                                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${editErrors.status ? 'border-red-500' : 'border-gray-300'
                                                    }`}
                                            >
                                                <option value="draft">{t('common.draft')}</option>
                                                <option value="active">{t('common.active')}</option>
                                                <option value="completed">{t('common.completed')}</option>
                                                <option value="cancelled">{t('common.cancelled')}</option>
                                            </select>
                                            {editErrors.status && (
                                                <p className="mt-1 text-sm text-red-600">{editErrors.status}</p>
                                            )}
                                        </div>

                                        {/* Points Reward */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                {t('adminChallengesIndexPage.editModal.pointsRewardLabel')}
                                            </label>
                                            <input
                                                type="number"
                                                min="0"
                                                value={editData.points_reward}
                                                onChange={(e) => setEditData('points_reward', parseInt(e.target.value) || 0)}
                                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${editErrors.points_reward ? 'border-red-500' : 'border-gray-300'
                                                    }`}
                                            />
                                            {editErrors.points_reward && (
                                                <p className="mt-1 text-sm text-red-600">{editErrors.points_reward}</p>
                                            )}
                                        </div>

                                        {/* Max Participants */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                {t('adminChallengesIndexPage.editModal.maxParticipantsLabel')}
                                            </label>
                                            <input
                                                type="number"
                                                min="1"
                                                value={editData.max_participants || ''}
                                                onChange={(e) => setEditData('max_participants', e.target.value ? parseInt(e.target.value) : null)}
                                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${editErrors.max_participants ? 'border-red-500' : 'border-gray-300'
                                                    }`}
                                                placeholder={t('adminChallengesIndexPage.editModal.unlimitedPlaceholder')}
                                            />
                                            {editErrors.max_participants && (
                                                <p className="mt-1 text-sm text-red-600">{editErrors.max_participants}</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-4 pt-6 border-t border-gray-200">
                                        <button
                                            type="submit"
                                            disabled={editProcessing}
                                            className="px-6 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-lg flex items-center gap-2 disabled:opacity-50 transition-colors"
                                        >
                                            <FaSave />
                                            {editProcessing ? t('adminChallengesIndexPage.editModal.saving') : t('adminChallengesIndexPage.editModal.saveChanges')}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={closeEditModal}
                                            className="px-6 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg flex items-center gap-2 transition-colors"
                                        >
                                            <FaTimes />
                                            {t('common.cancel')}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </DashboardLayout>
    );
}
