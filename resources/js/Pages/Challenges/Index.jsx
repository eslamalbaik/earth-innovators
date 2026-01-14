import { Head, Link, router } from '@inertiajs/react';
import { useState, useMemo } from 'react';
import { FaSearch, FaFilter, FaTrophy, FaTimes, FaUsers, FaCalendar, FaClock, FaCheckCircle, FaExclamationCircle, FaQuestionCircle, FaRocket, FaBrain } from 'react-icons/fa';
import MobileTopBar from '@/Components/Mobile/MobileTopBar';
import MobileBottomNav from '@/Components/Mobile/MobileBottomNav';
import DesktopFooter from '@/Components/Mobile/DesktopFooter';

export default function ChallengesIndex({ auth, challenges, userRole, previousWinners = [], participationConditions = [] }) {
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('');
    const [challengeType, setChallengeType] = useState('');
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [filterStatus, setFilterStatus] = useState('');

    const categories = [
        { value: '', label: 'الكل' },
        { value: 'science', label: 'علمي' },
        { value: 'arts', label: 'فني' },
        { value: 'technology', label: 'تقني' },
        { value: 'heritage', label: 'تراثي' },
        { value: 'environmental', label: 'بيئي' },
    ];

    const challengeTypes = [
        { value: '', label: 'الكل' },
        { value: '60_seconds', label: '60 ثانية' },
        { value: 'mental_math', label: 'بدون قلم' },
        { value: 'conversions', label: 'التحويلات' },
        { value: 'team_fastest', label: 'الفريق الأسرع' },
        { value: 'build_problem', label: 'ابنِ مسألة' },
    ];

    const statusOptions = [
        { value: '', label: 'الكل' },
        { value: 'active', label: 'نشط' },
        { value: 'upcoming', label: 'قادم' },
        { value: 'finished', label: 'منتهي' },
    ];

    const handleSearch = (e) => {
        e.preventDefault();
        router.get('/challenges', { search, category, challenge_type: challengeType }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleApplyFilters = () => {
        const params = {
            search,
            category,
            challenge_type: challengeType,
        };
        
        // Add status filter if user is authenticated (students, teachers, schools can filter by status)
        if (auth?.user && filterStatus) {
            params.status = filterStatus;
        }
        
        router.get('/challenges', params, {
            preserveState: true,
            preserveScroll: true,
        });
        setShowFilterModal(false);
    };

    const handleClearFilters = () => {
        setSearch('');
        setCategory('');
        setChallengeType('');
        setFilterStatus('');
        router.get('/challenges', {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const getCategoryLabel = (cat) => {
        const found = categories.find((c) => c.value === cat);
        return found ? found.label : 'أخرى';
    };

    const getChallengeTypeLabel = (type) => {
        const found = challengeTypes.find((t) => t.value === type);
        return found ? found.label : type;
    };

    const formatDate = (date) => {
        if (!date) return '';
        const d = new Date(date);
        const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
        return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
    };

    const getChallengeStatus = (challenge) => {
        const now = new Date();
        const startDate = new Date(challenge.start_date);
        const endDate = new Date(challenge.end_date);

        if (now < startDate) return { label: 'قادم', color: 'bg-blue-100 text-blue-700 border-blue-300', icon: FaClock };
        if (now > endDate) return { label: 'منتهي', color: 'bg-gray-100 text-gray-700 border-gray-300', icon: FaCalendar };
        return { label: 'نشط', color: 'bg-green-100 text-green-700 border-green-300', icon: FaTrophy };
    };

    const filteredChallenges = useMemo(() => {
        const list = challenges?.data || [];
        if (!filterStatus) return list;
        return list.filter((c) => {
            const status = getChallengeStatus(c);
            return status.label === filterStatus;
        });
    }, [challenges?.data, filterStatus]);

    const ChallengesContent = () => (
        <div className="space-y-4">
            {/* Search and Filter Bar */}
            <div className="flex items-center gap-2">
                <button
                    type="button"
                    onClick={() => setShowFilterModal(true)}
                    className="h-10 w-10 rounded-xl bg-[#A3C042] flex items-center justify-center hover:bg-[#93b03a] transition flex-shrink-0"
                    aria-label="فلترة"
                >
                    <FaFilter className="text-white text-sm" />
                </button>
                <form onSubmit={handleSearch} className="flex-1">
                    <div className="relative">
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="ابحث عن التحديات .."
                            className="w-full h-10 pr-10 pl-4 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#A3C042]/30 focus:border-[#A3C042] text-sm"
                        />
                        <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                    </div>
                </form>
            </div>

            {/* Category Filter Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {categories.map((cat) => (
                    <button
                        key={cat.value}
                        type="button"
                        onClick={() => {
                            setCategory(cat.value);
                            router.get('/challenges', { search, category: cat.value, challenge_type: challengeType }, {
                                preserveState: true,
                                preserveScroll: true,
                            });
                        }}
                        className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-bold transition ${
                            category === cat.value
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
                {filteredChallenges.length} تحديات
            </div>

            {/* Challenges Grid */}
            {filteredChallenges.length > 0 ? (
                <div className="grid grid-cols-2 gap-4">
                    {filteredChallenges.map((challenge) => {
                        const statusInfo = getChallengeStatus(challenge);
                        const StatusIcon = statusInfo.icon;
                        const categoryLabel = getCategoryLabel(challenge.category);
                        const challengeImage = challenge.image || challenge.thumbnail || '/images/hero.png';
                        const participants = challenge.participants_count || 0;
                        const startDate = formatDate(challenge.start_date);
                        const endDate = formatDate(challenge.end_date);

                        return (
                            <Link
                                key={challenge.id}
                                href={`/challenges/${challenge.id}`}
                                className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition"
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
                                    <div className={`absolute top-2 left-2 px-2 py-1 rounded-full text-[10px] font-semibold border flex items-center gap-1 ${statusInfo.color}`}>
                                        <StatusIcon className="text-xs" />
                                        {statusInfo.label}
                                    </div>
                                </div>
                                <div className="p-3">
                                    <h3 className="text-sm font-bold text-gray-900 mb-2 line-clamp-2 min-h-[2.5rem]">
                                        {challenge.title || 'تحدي الابتكار'}
                                    </h3>
                                    <div className="text-xs text-gray-600 mb-2 space-y-1">
                                        {startDate && <div>بداية: {startDate}</div>}
                                        {endDate && <div>نهاية: {endDate}</div>}
                                    </div>
                                    <div className="flex items-center gap-3 text-xs text-gray-500">
                                        <div className="flex items-center gap-1">
                                            <FaUsers className="text-gray-400" />
                                            <span>{participants}</span>
                                        </div>
                                        {challenge.challenge_type && (
                                            <div className="text-xs text-gray-500">
                                                {getChallengeTypeLabel(challenge.challenge_type)}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-16">
                    <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                        <FaTrophy className="text-gray-400 text-4xl" />
                    </div>
                    <p className="text-gray-400 text-sm mb-2">
                        {auth?.user?.role === 'student' 
                            ? 'لا توجد تحديات متاحة لمدرستك حالياً'
                            : auth?.user?.role === 'teacher'
                            ? 'لا توجد تحديات متاحة لمدرستك أو التي أنشأتها'
                            : auth?.user?.role === 'school'
                            ? 'لا توجد تحديات متاحة لمدرستك حالياً'
                            : 'لا توجد تحديات تطابق معايير البحث'}
                    </p>
                    {(search || category || challengeType || filterStatus) && (
                        <button
                            type="button"
                            onClick={handleClearFilters}
                            className="text-[#A3C042] text-sm font-semibold hover:text-[#93b03a] mt-2"
                        >
                            عرض كل التحديات
                        </button>
                    )}
                </div>
            )}

            {/* Participation Conditions and Previous Winners - Desktop Grid Layout */}
            <div className="space-y-4 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0">
                {/* Participation Conditions Section */}
                <div className="bg-white rounded-2xl border border-gray-100 p-4">
                    <div className="flex items-center gap-2 mb-4">
                        <FaCheckCircle className="text-[#A3C042] text-lg" />
                        <h3 className="text-sm font-extrabold text-gray-900">شروط المشاركة في التحديات</h3>
                    </div>
                    <div className="space-y-3">
                        {participationConditions.length > 0 ? (
                            participationConditions.map((condition, index) => {
                                const Icon = condition.icon === 'required' ? FaExclamationCircle : FaQuestionCircle;
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
                            })
                        ) : (
                            <p className="text-xs text-gray-500 text-center py-2">لا توجد شروط متاحة حالياً</p>
                        )}
                    </div>
                </div>

                {/* Previous Winners Section */}
                <div className="bg-white rounded-2xl border border-gray-100 p-4">
                    <div className="flex items-center gap-2 mb-4">
                        <FaTrophy className="text-yellow-500 text-lg" />
                        <h3 className="text-sm font-extrabold text-gray-900">الفائزون السابقون</h3>
                    </div>
                    <div className="space-y-4">
                        {previousWinners.length > 0 ? (
                            previousWinners.map((winner, index) => {
                                const getAvatarUrl = (avatar) => {
                                    if (!avatar) return '/images/hero.png';
                                    if (avatar.startsWith('http://') || avatar.startsWith('https://')) return avatar;
                                    if (avatar.startsWith('/storage/')) return avatar;
                                    return `/storage/${avatar}`;
                                };

                                return (
                                    <div key={winner.id || index} className="flex items-start gap-3 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
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
                                                {winner.rating > 0 && (
                                                    <span className="px-2 py-1 rounded-full text-[10px] font-semibold border bg-green-100 text-green-700 border-green-300">
                                                        {winner.rating.toFixed(1)} ⭐
                                                    </span>
                                                )}
                                                {winner.points > 0 && (
                                                    <span className="px-2 py-1 rounded-full text-[10px] font-semibold border bg-blue-100 text-blue-700 border-blue-300">
                                                        {winner.points} نقطة
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <p className="text-xs text-gray-500 text-center py-4">لا توجد فائزين سابقين حالياً</p>
                        )}
                    </div>
                    <button
                        type="button"
                        onClick={() => router.visit('/challenges/winners')}
                        className="mt-4 w-full text-center text-xs font-semibold text-[#A3C042] hover:text-[#93b03a] transition"
                    >
                        عرض جميع الفائزين
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
                                className={`px-3 py-2 rounded-xl text-sm font-semibold transition ${
                                    link.active
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
        <div dir="rtl" className="min-h-screen bg-gray-50">
            <Head title="التحديات - إرث المبتكرين" />

            {/* Mobile View */}
            <div className="block md:hidden">
                <MobileTopBar
                    title="إرث المبتكرين"
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
                    title="إرث المبتكرين"
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
                                aria-label="إغلاق"
                            >
                                <FaTimes />
                            </button>
                            <div className="text-sm font-extrabold text-gray-900">خيارات الفلترة</div>
                            <div className="w-6" />
                        </div>

                        {/* Modal Content */}
                        <div className="p-4 space-y-6 max-h-[70vh] overflow-y-auto">
                            {/* Status Filter */}
                            <div>
                                <div className="text-sm font-bold text-gray-900 mb-3">الحالة</div>
                                <div className="grid grid-cols-2 gap-2">
                                    {statusOptions.map((status) => (
                                        <button
                                            key={status.value}
                                            type="button"
                                            onClick={() => setFilterStatus(filterStatus === status.value ? '' : status.value)}
                                            className={`px-4 py-3 rounded-xl text-sm font-semibold transition ${
                                                filterStatus === status.value
                                                    ? 'bg-[#eef8d6] text-[#6b7f2c] border-2 border-[#A3C042]'
                                                    : 'bg-white text-gray-700 border border-gray-200'
                                            }`}
                                        >
                                            {status.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Challenge Type Filter */}
                            <div>
                                <div className="text-sm font-bold text-gray-900 mb-3">نوع التحدي</div>
                                <div className="grid grid-cols-2 gap-2">
                                    {challengeTypes.map((type) => (
                                        <button
                                            key={type.value}
                                            type="button"
                                            onClick={() => setChallengeType(challengeType === type.value ? '' : type.value)}
                                            className={`px-4 py-3 rounded-xl text-sm font-semibold transition ${
                                                challengeType === type.value
                                                    ? 'bg-[#eef8d6] text-[#6b7f2c] border-2 border-[#A3C042]'
                                                    : 'bg-white text-gray-700 border border-gray-200'
                                            }`}
                                        >
                                            {type.label}
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
                                className="w-full rounded-xl bg-[#A3C042] py-3 text-sm font-bold text-white hover:bg-[#93b03a] transition"
                            >
                                تطبيق الفلاتر
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
