import { Head, Link, router } from '@inertiajs/react';
import { useState, useMemo } from 'react';
import { FaSearch, FaFilter, FaTrophy, FaTimes, FaUsers, FaCalendar, FaClock, FaCheckCircle, FaTimesCircle, FaExclamationCircle, FaQuestionCircle } from 'react-icons/fa';
import MobileTopBar from '@/Components/Mobile/MobileTopBar';
import MobileBottomNav from '@/Components/Mobile/MobileBottomNav';
import { useTranslation } from '@/i18n';

export default function StudentChallengesIndex({ auth, challenges, filters, message, categories = [], previousWinners = [] }) {
    const { t, language } = useTranslation();
    const [search, setSearch] = useState('');
    const [selectedStatus, setSelectedStatus] = useState(filters?.status || '');
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [category, setCategory] = useState('');

    // Use categories from database, fallback to default if empty
    const categoriesList = categories && categories.length > 0 ? categories : [
        { value: '', label: t('common.all') },
        { value: 'science', label: t('categories.science') },
        { value: 'arts', label: t('categories.arts') },
        { value: 'technology', label: t('categories.technology') },
        { value: 'heritage', label: t('studentChallengesIndexPage.categories.heritage') },
        { value: 'environmental', label: t('studentChallengesIndexPage.categories.environmental') },
    ];

    const statusOptions = [
        { value: '', label: t('common.all') },
        { value: 'active', label: t('common.active') },
        { value: 'upcoming', label: t('common.upcoming') },
        { value: 'finished', label: t('studentChallengesIndexPage.status.finished') },
    ];

    const handleStatusFilter = (status) => {
        setSelectedStatus(status);
        router.get('/student/challenges', {
            status: status || undefined,
            search,
            category,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleSearch = (e) => {
        e.preventDefault();
        router.get('/student/challenges', {
            search: search || undefined,
            status: selectedStatus || undefined,
            category: category || undefined,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleApplyFilters = () => {
        router.get('/student/challenges', {
            search: search || undefined,
            status: selectedStatus || undefined,
            category: category || undefined,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
        setShowFilterModal(false);
    };

    const handleClearFilters = () => {
        setSelectedStatus('');
        setCategory('');
        setSearch('');
        router.get('/student/challenges', {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const getAvatarUrl = (avatar) => {
        if (!avatar) return '/images/hero.png';
        if (avatar.startsWith('http://') || avatar.startsWith('https://')) return avatar;
        if (avatar.startsWith('/storage/')) return avatar;
        return `/storage/${avatar}`;
    };

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
            custom: t('studentChallengesIndexPage.types.custom'),
        };
        return labels[type] || type;
    };

    const getStatusBadge = (challenge) => {
        const now = new Date();
        const startDate = new Date(challenge.start_date);
        const deadline = new Date(challenge.deadline);

        if (challenge.status === 'active' && startDate <= now && deadline >= now) {
            return { key: 'active', bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-300', label: t('common.active'), icon: FaCheckCircle };
        } else if (challenge.status === 'active' && startDate > now) {
            return { key: 'upcoming', bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-300', label: t('common.upcoming'), icon: FaClock };
        } else {
            return { key: 'finished', bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-300', label: t('studentChallengesIndexPage.status.finished'), icon: FaTimesCircle };
        }
    };

    const getSubmissionStatusBadge = (status) => {
        const badges = {
            submitted: { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-300', label: t('studentChallengesIndexPage.submissionStatuses.submitted') },
            reviewed: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-300', label: t('studentChallengesIndexPage.submissionStatuses.reviewed') },
            approved: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-300', label: t('schoolChallengeSubmissionShowPage.statusApproved') },
            rejected: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300', label: t('schoolChallengeSubmissionShowPage.statusRejected') },
        };
        return badges[status] || null;
    };

    const getCategoryLabel = (cat) => {
        const found = categoriesList.find((c) => c.value === cat);
        return found ? found.label : t('categories.other');
    };

    // Use backend filtered data directly, but apply client-side filtering for status if needed
    const filteredChallenges = useMemo(() => {
        const list = challenges?.data || [];
        // Backend already handles search and category filtering
        // Only apply status filter if it's not handled by backend
        if (!selectedStatus) return list;
        return list.filter((c) => {
            const statusBadge = getStatusBadge(c);
            return statusBadge.key === selectedStatus;
        });
    }, [challenges?.data, selectedStatus]);

    const ChallengesContent = () => (
        <div className="space-y-4">
            {/* Message */}
            {message && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 text-sm text-yellow-800">
                    {message}
                </div>
            )}

            {/* Search and Filter Bar */}
            <div className="flex items-center gap-2">
                <button
                    type="button"
                    onClick={() => setShowFilterModal(true)}
                    className="h-10 w-10 rounded-xl bg-[#A3C042] flex items-center justify-center hover:bg-[#8CA635] transition flex-shrink-0"
                    aria-label={t('common.filter')}
                >
                    <FaFilter className="text-white text-sm" />
                </button>
                <form onSubmit={handleSearch} className="flex-1">
                    <div className="relative">
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder={t('studentChallengesIndexPage.searchPlaceholder')}
                            className="w-full h-10 ps-10 pe-4 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#A3C042]/30 focus:border-[#A3C042] text-sm"
                        />
                        <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                    </div>
                </form>
            </div>

            {/* Category Filter Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {categoriesList.map((cat) => (
                    <button
                        key={cat.value}
                        type="button"
                        onClick={() => {
                            setCategory(cat.value);
                            router.get('/student/challenges', {
                                search,
                                status: selectedStatus || undefined,
                                category: cat.value,
                            }, {
                                preserveState: true,
                                preserveScroll: true,
                            });
                        }}
                        className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-bold transition ${category === cat.value
                                ? 'bg-[#A3C042] text-white'
                                : 'bg-white text-gray-700'
                            }`}
                    >
                        {cat.label}
                    </button>
                ))}
            </div>

            {/* Challenges Count */}
            <div className="text-sm text-gray-700">
                {t('studentChallengesIndexPage.count', { count: filteredChallenges.length })}
            </div>

            {/* Challenges Grid */}
            {filteredChallenges.length > 0 ? (
                <div className="grid grid-cols-2 gap-4">
                    {filteredChallenges.map((challenge) => {
                        const statusBadge = getStatusBadge(challenge);
                        const StatusIcon = statusBadge.icon;
                        const submissionBadge = challenge.submission_status ? getSubmissionStatusBadge(challenge.submission_status) : null;
                        const categoryLabel = getCategoryLabel(challenge.category);
                        const challengeImage = challenge.image || challenge.thumbnail || '/images/hero.png';
                        const participants = challenge.current_participants || 0;
                        const maxParticipants = challenge.max_participants || null;
                        const deadline = formatDate(challenge.deadline);

                        return (
                            <div
                                key={challenge.id}
                                onClick={() => router.visit(`/student/challenges/${challenge.id}`)}
                                className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition cursor-pointer"
                            >
                                <div className="relative">
                                    <img
                                        src={challengeImage}
                                        alt={challenge.title}
                                        className="w-full h-32 object-cover"
                                    />
                                    <div className="absolute top-2 right-2 px-2 py-1 rounded-full bg-gray-100 text-gray-700 text-[10px] font-semibold border border-gray-200">
                                        {categoryLabel}
                                    </div>
                                    <div className={`absolute top-2 left-2 px-2 py-1 rounded-full text-[10px] font-semibold border flex items-center gap-1 ${statusBadge.bg} ${statusBadge.text} ${statusBadge.border}`}>
                                        <StatusIcon className="text-xs" />
                                        {statusBadge.label}
                                    </div>
                                    {submissionBadge && (
                                        <div className={`absolute bottom-2 left-2 px-2 py-1 rounded-full text-[10px] font-semibold border ${submissionBadge.bg} ${submissionBadge.text} ${submissionBadge.border}`}>
                                            {submissionBadge.label}
                                        </div>
                                    )}
                                </div>
                                <div className="p-3">
                                    <h3 className="text-sm font-bold text-gray-900 mb-2 line-clamp-2 min-h-[2.5rem]">
                                        {challenge.title || t('projects.innovationChallenge')}
                                    </h3>
                                    {challenge.objective && (
                                        <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                                            {challenge.objective}
                                        </p>
                                    )}
                                    <div className="text-xs text-gray-600 mb-2">
                                        {deadline && <div>{t('studentChallengesIndexPage.deadlineLabel', { date: deadline })}</div>}
                                    </div>
                                    <div className="flex items-center justify-between text-xs text-gray-500">
                                        <div className="flex items-center gap-1">
                                            <FaUsers className="text-gray-400" />
                                            <span>
                                                {participants}
                                                {maxParticipants && ` / ${maxParticipants}`}
                                            </span>
                                        </div>
                                        {challenge.challenge_type && (
                                            <div className="text-xs text-gray-500">
                                                {getChallengeTypeLabel(challenge.challenge_type)}
                                            </div>
                                        )}
                                    </div>
                                    {challenge.points_reward > 0 && (
                                        <div className="mt-2 text-xs text-green-600 font-semibold">
                                            {challenge.points_reward} {t('common.point')}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-16">
                    <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                        <FaTrophy className="text-gray-400 text-4xl" />
                    </div>
                    <p className="text-gray-400 text-sm mb-2">{t('studentChallengesIndexPage.empty')}</p>
                    <button
                        type="button"
                        onClick={handleClearFilters}
                        className="text-[#A3C042] text-sm font-semibold hover:text-[#8CA635]"
                    >
                        {t('studentChallengesIndexPage.actions.viewAll')}
                    </button>
                </div>
            )}

            {/* Participation Conditions and Previous Winners - Desktop Grid Layout */}
            <div className="space-y-4 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0">
                {/* Participation Conditions Section */}
                <div className="bg-white rounded-2xl border border-gray-100 p-4">
                    <div className="flex items-center gap-2 mb-4">
                        <FaCheckCircle className="text-[#A3C042] text-lg" />
                        <h3 className="text-sm font-extrabold text-gray-900">{t('studentChallengesIndexPage.conditions.title')}</h3>
                    </div>
                    <div className="space-y-3">
                        {[
                            {
                                text: t('studentChallengesIndexPage.conditions.items.register'),
                                icon: FaExclamationCircle,
                                tag: t('studentChallengesIndexPage.tags.mandatory'),
                                tagColor: 'bg-red-100 text-red-700 border-red-300'
                            },
                            {
                                text: t('studentChallengesIndexPage.conditions.items.completeProfile'),
                                icon: FaExclamationCircle,
                                tag: t('studentChallengesIndexPage.tags.mandatory'),
                                tagColor: 'bg-red-100 text-red-700 border-red-300'
                            },
                            {
                                text: t('studentChallengesIndexPage.conditions.items.requiredLevel'),
                                icon: FaExclamationCircle,
                                tag: t('studentChallengesIndexPage.tags.mandatory'),
                                tagColor: 'bg-red-100 text-red-700 border-red-300'
                            },
                            {
                                text: t('studentChallengesIndexPage.conditions.items.previousParticipation'),
                                icon: FaQuestionCircle,
                                tag: t('studentChallengesIndexPage.tags.preferred'),
                                tagColor: 'bg-blue-100 text-blue-700 border-blue-300'
                            },
                            {
                                text: t('studentChallengesIndexPage.conditions.items.commitDeadlines'),
                                icon: FaExclamationCircle,
                                tag: t('studentChallengesIndexPage.tags.mandatory'),
                                tagColor: 'bg-red-100 text-red-700 border-red-300'
                            },
                        ].map((condition, index) => {
                            const Icon = condition.icon;
                            return (
                                <div key={index} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Icon className="text-gray-400 text-sm" />
                                        <span className="text-xs text-gray-700">{condition.text}</span>
                                    </div>
                                    <span className={`px-2 py-1 rounded-full text-[10px] font-semibold border ${condition.tagColor}`}>
                                        {condition.tag}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Previous Winners Section */}
                <div className="bg-white rounded-2xl border border-gray-100 p-4">
                    <div className="flex items-center gap-2 mb-4">
                        <FaTrophy className="text-yellow-500 text-lg" />
                        <h3 className="text-sm font-extrabold text-gray-900">{t('studentChallengesIndexPage.winners.title')}</h3>
                    </div>
                    <div className="space-y-4">
                        {previousWinners.length > 0 ? (
                            previousWinners.map((winner, index) => (
                                <div key={winner.id ?? index} className="flex items-start gap-3 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                                    <img
                                        src={getAvatarUrl(winner.avatar)}
                                        alt={winner.name}
                                        className="w-12 h-12 rounded-full object-cover border border-gray-200"
                                        onError={(e) => {
                                            e.target.src = '/images/hero.png';
                                        }}
                                    />
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h4 className="text-sm font-bold text-gray-900">{winner.name}</h4>
                                            <FaTrophy className="text-yellow-500 text-xs" />
                                        </div>
                                        <p className="text-xs text-gray-600 mb-1">{winner.project}</p>
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="text-[10px] text-gray-500">{winner.date}</span>
                                            {Number(winner.rating) > 0 && (
                                                <span className="px-2 py-1 rounded-full text-[10px] font-semibold border bg-green-100 text-green-700 border-green-300">
                                                    {t('challengeWinnersPage.ratingLabel', { rating: Number(winner.rating).toFixed(1) })}
                                                </span>
                                            )}
                                            {Number(winner.points) > 0 && (
                                                <span className="px-2 py-1 rounded-full text-[10px] font-semibold border bg-blue-100 text-blue-700 border-blue-300">
                                                    {t('challengeWinnersPage.pointsLabel', { points: winner.points })}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-xs text-gray-500">{t('studentChallengesIndexPage.winners.empty')}</p>
                        )}
                    </div>
                    <button
                        type="button"
                        onClick={() => router.visit('/student/challenges/winners')}
                        className="mt-4 w-full text-center text-xs font-semibold text-[#A3C042] hover:text-[#8CA635] transition"
                    >
                        {t('studentChallengesIndexPage.actions.viewAllWinners')}
                    </button>
                </div>
            </div>

            {/* Pagination */}
            {challenges?.links && challenges.links.length > 3 && (
                <div className="bg-white rounded-2xl border border-gray-100 p-3">
                    <div className="flex flex-wrap gap-2 justify-center">
                        {challenges.links.map((link, index) => (
                            <Link
                                key={index}
                                href={link.url || '#'}
                                className={`px-3 py-2 rounded-xl text-sm font-semibold transition ${link.active
                                        ? 'bg-[#A3C042] text-white'
                                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                                    } ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );

    return (
        <div dir={language === 'ar' ? 'rtl' : 'ltr'} className="min-h-screen bg-gray-50">
            <Head title={t('studentChallengesIndexPage.pageTitle', { appName: t('common.appName') })} />

            {/* Mobile View */}
            <div className="block md:hidden">
                <MobileTopBar
                    title={t('common.appName')}
                    unreadCount={auth?.unreadCount || 0}
                    onNotifications={() => router.visit('/notifications')}
                    onBack={() => router.visit('/')}
                />
                <main className="px-4 pb-24 pt-4">
                    <ChallengesContent />
                </main>
                <MobileBottomNav active="challenges" role={auth?.user?.role} isAuthed={!!auth?.user} user={auth?.user} />
            </div>

            {/* Desktop View */}
            <div className="hidden md:block">
                <MobileTopBar
                    title={t('common.appName')}
                    unreadCount={auth?.unreadCount || 0}
                    onNotifications={() => router.visit('/notifications')}
                    onBack={() => router.visit('/')}
                />
                <main className="mx-auto w-full max-w-6xl px-4 pb-24 pt-4">
                    <div className="mx-auto w-full max-w-4xl">
                        <ChallengesContent />
                    </div>
                </main>
                <MobileBottomNav active="challenges" role={auth?.user?.role} isAuthed={!!auth?.user} user={auth?.user} />
            </div>

            {/* Filter Modal */}
            {showFilterModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm px-4">
                    <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                            <button
                                type="button"
                                onClick={() => setShowFilterModal(false)}
                                className="text-gray-700 text-xl leading-none"
                                aria-label={t('common.close')}
                            >
                                <FaTimes />
                            </button>
                            <div className="text-sm font-extrabold text-gray-900">{t('studentChallengesIndexPage.filterOptions')}</div>
                            <div className="w-6" />
                        </div>

                        {/* Modal Content */}
                        <div className="p-4 space-y-6 max-h-[70vh] overflow-y-auto">
                            {/* Status Filter */}
                            <div>
                                <div className="text-sm font-bold text-gray-900 mb-3">{t('common.status')}</div>
                                <div className="grid grid-cols-2 gap-2">
                                    {statusOptions.map((status) => (
                                        <button
                                            key={status.value}
                                            type="button"
                                            onClick={() => handleStatusFilter(status.value)}
                                            className={`px-4 py-3 rounded-xl text-sm font-semibold transition ${selectedStatus === status.value
                                                    ? 'bg-[#eef8d6] text-[#6b7f2c] border-2 border-[#A3C042]'
                                                    : 'bg-white text-gray-700 border border-gray-200'
                                                }`}
                                        >
                                            {status.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="px-4 py-3 border-t border-gray-100">
                            <button
                                type="button"
                                onClick={handleApplyFilters}
                                className="w-full rounded-xl bg-[#A3C042] py-3 text-sm font-bold text-white hover:bg-[#8CA635] transition"
                            >
                                {t('studentChallengesIndexPage.actions.applyFilters')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
