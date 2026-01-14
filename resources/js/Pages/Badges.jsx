import { Head, router } from '@inertiajs/react';
import React from 'react';
import MobileAppLayout from '../Layouts/MobileAppLayout';
import MobileTopBar from '@/Components/Mobile/MobileTopBar';
import MobileBottomNav from '@/Components/Mobile/MobileBottomNav';
import DesktopFooter from '@/Components/Mobile/DesktopFooter';
import { FaMedal, FaTrophy, FaCrown, FaUsers, FaProjectDiagram, FaStar, FaAward } from 'react-icons/fa';
import AchievementBadge from '../Components/Badges/AchievementBadge';
import CommunityBadge from '../Components/Badges/CommunityBadge';

export default function Badges({
    auth,
    achievementBadges = [],
    communityBadges = [],
    userBadges = [],
    userCommunityBadgeProgress = [],
    schoolsRanking = [],
    currentSchoolRank = null
}) {
    const earnedBadgeIds = userBadges.map(ub => ub.badge_id);

    // Create a map of badge_id to progress for quick lookup
    const progressMap = {};
    userCommunityBadgeProgress.forEach(progress => {
        progressMap[progress.badge_id] = progress;
    });

    const getRankIcon = (rank) => {
        if (rank === 1) return <FaCrown className="text-yellow-500 text-3xl" />;
        if (rank === 2) return <FaMedal className="text-gray-400 text-3xl" />;
        if (rank === 3) return <FaMedal className="text-orange-400 text-3xl" />;
        return <span className="text-2xl font-bold text-gray-600">#{rank}</span>;
    };

    // Get source for achievement badges (from userBadges pivot data)
    const getBadgeSource = (badgeId) => {
        const userBadge = userBadges.find(ub => ub.badge_id === badgeId);
        if (!userBadge) return null;

        // Try to determine source from badge or userBadge data
        // This would need to be enhanced based on your actual data structure
        return userBadge.badge?.created_by ? 'teacher' : null;
    };

    return (
        <div dir="rtl" className="min-h-screen bg-gray-50">
            <Head title="الشارات - إرث المبتكرين" />

            {/* Mobile View */}
            <div className="block md:hidden">
                <MobileAppLayout
                    auth={auth}
                    title="الشارات"
                    activeNav="explore"
                    unreadCount={auth?.unreadCount || 0}
                    onNotifications={() => router.visit('/notifications')}
                    onBack={() => router.visit('/')}
                >
                    <div className="space-y-6">
                        {/* Hero Section */}
                        <div className="bg-gradient-to-r from-[#A3C042] to-[#93b03a] rounded-2xl p-6 text-white text-center">
                            <FaMedal className="mx-auto text-4xl mb-3 opacity-90" />
                            <h1 className="text-xl font-bold mb-2">الشارات والإنجازات</h1>
                            <p className="text-white/90 text-sm">
                                احصل على الشارات عند تحقيق الإنجازات والمشاركة في التحديات والمشاريع
                            </p>
                        </div>

                        {/* User Badges Summary */}
                        {auth?.user && (
                            <div className="bg-gradient-to-r from-[#A3C042]/10 to-[#93b03a]/10 rounded-2xl p-4 border-2 border-[#A3C042]/20">
                                <h2 className="text-lg font-bold text-gray-900 mb-2">شاراتي</h2>
                                <p className="text-sm text-gray-600">
                                    {userBadges.length} شارة إنجاز • {userCommunityBadgeProgress.length} شارة مجتمعية
                                </p>
                            </div>
                        )}

                        {/* School Ranking */}
                        {currentSchoolRank && (
                            <div className="bg-gradient-to-r from-[#A3C042] to-[#93b03a] rounded-2xl p-4 text-white shadow-lg">
                                <div className="flex items-center gap-2 mb-4">
                                    <FaTrophy className="text-yellow-300 text-xl" />
                                    <h3 className="text-base font-bold">ترتيب مدرستك</h3>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-white/20 rounded-xl p-3 backdrop-blur-sm border border-white/30">
                                        <div className="flex items-center gap-2 mb-1">
                                            <FaTrophy className="text-yellow-300 text-sm" />
                                            <p className="text-xs opacity-90">الترتيب</p>
                                        </div>
                                        <p className="text-2xl font-bold">{currentSchoolRank.rank}</p>
                                    </div>
                                    <div className="bg-white/20 rounded-xl p-3 backdrop-blur-sm border border-white/30">
                                        <div className="flex items-center gap-2 mb-1">
                                            <FaStar className="text-yellow-300 text-sm" />
                                            <p className="text-xs opacity-90">إجمالي النقاط</p>
                                        </div>
                                        <p className="text-2xl font-bold">{currentSchoolRank.total_points?.toLocaleString() || 0}</p>
                                    </div>
                                    <div className="bg-white/20 rounded-xl p-3 backdrop-blur-sm border border-white/30">
                                        <div className="flex items-center gap-2 mb-1">
                                            <FaUsers className="text-white text-sm" />
                                            <p className="text-xs opacity-90">عدد الطلاب</p>
                                        </div>
                                        <p className="text-2xl font-bold">{currentSchoolRank.total_students || 0}</p>
                                    </div>
                                    <div className="bg-white/20 rounded-xl p-3 backdrop-blur-sm border border-white/30">
                                        <div className="flex items-center gap-2 mb-1">
                                            <FaProjectDiagram className="text-white text-sm" />
                                            <p className="text-xs opacity-90">المشاريع</p>
                                        </div>
                                        <p className="text-2xl font-bold">{currentSchoolRank.projects_count || 0}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Schools Ranking Section */}
                        {schoolsRanking && schoolsRanking.length > 0 && (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="px-6 py-4 border-b border-2 border-gray-200 bg-gradient-to-r from-[#A3C042]/10 to-blue-50">
                                    <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                        <FaTrophy className="text-[#A3C042]" />
                                        ترتيب المدارس
                                    </h2>
                                </div>
                                <div className="divide-y divide-gray-100">
                                    {schoolsRanking.slice(0, 10).map((school, index) => (
                                        <div
                                            key={school.id}
                                            className={`px-4 py-3 flex items-center gap-3 ${
                                                school.is_current_school
                                                    ? 'bg-gradient-to-r from-[#A3C042]/10 to-[#93b03a]/10 border-r-4 border-[#A3C042]'
                                                    : 'hover:bg-gray-50'
                                            }`}
                                        >
                                            <div className="flex-shrink-0 w-10 flex items-center justify-center">
                                                {getRankIcon(school.rank)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="text-sm font-bold text-gray-900 truncate">
                                                        {school.name}
                                                    </h3>
                                                    {school.is_current_school && (
                                                        <span className="px-2 py-0.5 rounded-full bg-[#A3C042] text-white text-[10px] font-semibold">
                                                            مدرستك
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-4 mt-1 text-xs text-gray-600">
                                                    <span className="flex items-center gap-1">
                                                        <FaUsers className="text-gray-400" />
                                                        {school.total_students || 0} طالب
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <FaProjectDiagram className="text-gray-400" />
                                                        {school.projects_count || 0} مشروع
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <FaMedal className="text-gray-400" />
                                                        {school.total_badges || 0} شارة
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex-shrink-0 text-left">
                                                <div className="text-sm font-bold text-[#A3C042]">
                                                    {school.total_points?.toLocaleString() || 0}
                                                </div>
                                                <div className="text-xs text-gray-500">نقطة</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Achievement Badges */}
                        {achievementBadges.length > 0 && (
                            <div>
                                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <FaAward className="text-[#A3C042]" />
                                    شارات الإنجاز
                                </h2>
                                <div className="grid grid-cols-2 gap-3">
                                    {achievementBadges.map((badge) => {
                                        const isEarned = earnedBadgeIds.includes(badge.id);
                                        const source = getBadgeSource(badge.id);

                                        return (
                                            <AchievementBadge
                                                key={badge.id}
                                                badge={badge}
                                                isEarned={isEarned}
                                                source={source}
                                            />
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Community Badges */}
                        {communityBadges.length > 0 && (
                            <div>
                                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <FaMedal className="text-[#A3C042]" />
                                    الشارات المجتمعية
                                </h2>
                                <div className="grid grid-cols-2 gap-3">
                                    {communityBadges.map((badge) => {
                                        const progress = progressMap[badge.id] || null;

                                        return (
                                            <CommunityBadge
                                                key={badge.id}
                                                badge={badge}
                                                progress={progress}
                                            />
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </MobileAppLayout>
            </div>

            {/* Desktop View */}
            <div className="hidden md:block">
                <MobileTopBar
                    title="الشارات"
                    unreadCount={auth?.unreadCount || 0}
                    onNotifications={() => router.visit('/notifications')}
                    onBack={() => router.visit('/')}
                    reverseOrder={false}
                />
                <main className="mx-auto w-full max-w-6xl px-4 pb-24 pt-4">
                    <div className="space-y-6">
                        {/* Hero Section */}
                        <div className="bg-gradient-to-r from-[#A3C042] to-[#93b03a] rounded-2xl p-8 text-white text-center">
                            <FaMedal className="mx-auto text-6xl mb-4 opacity-90" />
                            <h1 className="text-3xl font-bold mb-4">الشارات والإنجازات</h1>
                            <p className="text-white/90 text-lg max-w-2xl mx-auto">
                                احصل على الشارات عند تحقيق الإنجازات والمشاركة في التحديات والمشاريع
                            </p>
                        </div>

                        {/* User Badges Summary */}
                        {auth?.user && (
                            <div className="bg-gradient-to-r from-[#A3C042]/10 to-[#93b03a]/10 rounded-2xl p-6 border-2 border-[#A3C042]/20">
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">شاراتي</h2>
                                <p className="text-gray-600">
                                    {userBadges.length} شارة إنجاز • {userCommunityBadgeProgress.length} شارة مجتمعية
                                </p>
                            </div>
                        )}
                        
                        {/* School Ranking */}
                        {currentSchoolRank && (
                            <div className="bg-yellow-500 rounded-2xl p-6 text-white shadow-lg">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="bg-white/20 rounded-xl p-3 backdrop-blur-sm border border-white/30">
                                        <FaTrophy className="text-white text-2xl" />
                                    </div>
                                    <h3 className="text-xl font-bold">ترتيب مدرستك</h3>
                                </div>
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                    <div className="bg-white/20 rounded-xl p-5 backdrop-blur-sm border border-white/30 hover:bg-white/25 transition-all">
                                        <div className="flex items-center gap-3 mb-3">
                                            <FaTrophy className="text-white text-xl" />
                                            <p className="text-sm opacity-90 font-medium">الترتيب</p>
                                        </div>
                                        <p className="text-3xl font-bold">{currentSchoolRank.rank}</p>
                                    </div>
                                    <div className="bg-white/20 rounded-xl p-5 backdrop-blur-sm border border-white/30 hover:bg-white/25 transition-all">
                                        <div className="flex items-center gap-3 mb-3">
                                            <FaStar className="text-white text-xl" />
                                            <p className="text-sm opacity-90 font-medium">إجمالي النقاط</p>
                                        </div>
                                        <p className="text-3xl font-bold">{currentSchoolRank.total_points?.toLocaleString() || 0}</p>
                                    </div>
                                    <div className="bg-white/20 rounded-xl p-5 backdrop-blur-sm border border-white/30 hover:bg-white/25 transition-all">
                                        <div className="flex items-center gap-3 mb-3">
                                            <FaUsers className="text-white text-xl" />
                                            <p className="text-sm opacity-90 font-medium">عدد الطلاب</p>
                                        </div>
                                        <p className="text-3xl font-bold">{currentSchoolRank.total_students || 0}</p>
                                    </div>
                                    <div className="bg-white/20 rounded-xl p-5 backdrop-blur-sm border border-white/30 hover:bg-white/25 transition-all">
                                        <div className="flex items-center gap-3 mb-3">
                                            <FaProjectDiagram className="text-white text-xl" />
                                            <p className="text-sm opacity-90 font-medium">المشاريع</p>
                                        </div>
                                        <p className="text-3xl font-bold">{currentSchoolRank.projects_count || 0}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Schools Ranking Section */}
                        {schoolsRanking && schoolsRanking.length > 0 && (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="px-6 py-4 border-b border-2 border-gray-200 bg-gradient-to-r from-[#A3C042]/10 to-blue-50">
                                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                        <FaTrophy className="text-[#A3C042]" />
                                        ترتيب المدارس
                                    </h2>
                                </div>
                                <div className="divide-y divide-gray-100">
                                    {schoolsRanking.slice(0, 10).map((school, index) => (
                                        <div
                                            key={school.id}
                                            className={`px-6 py-4 flex items-center gap-4 transition ${
                                                school.is_current_school
                                                    ? 'bg-gradient-to-r from-[#A3C042]/10 to-[#93b03a]/10 border-r-4 border-[#A3C042]'
                                                    : 'hover:bg-gray-50'
                                            }`}
                                        >
                                            <div className="flex-shrink-0 w-12 flex items-center justify-center">
                                                {getRankIcon(school.rank)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-3">
                                                    <h3 className="text-base font-bold text-gray-900">
                                                        {school.name}
                                                    </h3>
                                                    {school.is_current_school && (
                                                        <span className="px-3 py-1 rounded-full bg-[#A3C042] text-white text-xs font-semibold">
                                                            مدرستك
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-6 mt-2 text-sm text-gray-600">
                                                    <span className="flex items-center gap-2">
                                                        <FaUsers className="text-gray-400" />
                                                        {school.total_students || 0} طالب
                                                    </span>
                                                    <span className="flex items-center gap-2">
                                                        <FaProjectDiagram className="text-gray-400" />
                                                        {school.projects_count || 0} مشروع
                                                    </span>
                                                    <span className="flex items-center gap-2">
                                                        <FaMedal className="text-gray-400" />
                                                        {school.total_badges || 0} شارة
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex-shrink-0 text-left">
                                                <div className="text-xl font-bold text-[#A3C042]">
                                                    {school.total_points?.toLocaleString() || 0}
                                                </div>
                                                <div className="text-xs text-gray-500">نقطة</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Achievement Badges */}
                        {achievementBadges.length > 0 && (
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                    <FaAward className="text-[#A3C042]" />
                                    شارات الإنجاز
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {achievementBadges.map((badge) => {
                                        const isEarned = earnedBadgeIds.includes(badge.id);
                                        const source = getBadgeSource(badge.id);

                                        return (
                                            <AchievementBadge
                                                key={badge.id}
                                                badge={badge}
                                                isEarned={isEarned}
                                                source={source}
                                            />
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Community Badges */}
                        {communityBadges.length > 0 && (
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                    <FaMedal className="text-[#A3C042]" />
                                    الشارات المجتمعية
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {communityBadges.map((badge) => {
                                        const progress = progressMap[badge.id] || null;

                                        return (
                                            <CommunityBadge
                                                key={badge.id}
                                                badge={badge}
                                                progress={progress}
                                            />
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </main>
                <MobileBottomNav active="explore" role={auth?.user?.role} isAuthed={!!auth?.user} user={auth?.user} />
                <DesktopFooter auth={auth} />
            </div>
        </div>
    );
}
