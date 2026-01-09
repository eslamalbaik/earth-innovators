import { Head } from '@inertiajs/react';
import React from 'react';
import MainLayout from '../Layouts/MainLayout';
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
        <MainLayout auth={auth}>
            <Head title="الشارات - إرث المبتكرين" />

            <div className="bg-gradient-to-r from-legacy-green to-legacy-blue py-16 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <FaMedal className="mx-auto text-6xl mb-4 opacity-90" />
                        <h1 className="text-4xl font-bold mb-4">الشارات والإنجازات</h1>
                        <p className="text-xl text-white/90 max-w-2xl mx-auto">
                            احصل على الشارات عند تحقيق الإنجازات والمشاركة في التحديات والمشاريع
                        </p>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* ترتيب المؤسسات تعليمية */}
                <div className="mb-12 bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-legacy-green/10 to-legacy-blue/10">
                        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <FaTrophy className="text-legacy-green" />
                            ترتيب المؤسسات تعليمية
                        </h2>
                    </div>
                    <div className="p-6">
                        {currentSchoolRank && (
                            <div className="mb-6 bg-gradient-to-r from-legacy-green to-legacy-blue rounded-xl shadow-lg p-6 text-white">
                                <div className="flex items-center justify-between flex-wrap gap-4">
                                    <div>
                                        <h3 className="text-xl font-bold mb-4">ترتيب مدرستك</h3>
                                        <div className="flex items-center gap-6 flex-wrap">
                                            <div className="bg-white/20 rounded-lg px-6 py-3 backdrop-blur-sm">
                                                <div className="flex items-center gap-3">
                                                    <FaTrophy className="text-yellow-300 text-2xl" />
                                                    <div>
                                                        <p className="text-sm opacity-90">الترتيب</p>
                                                        <p className="text-3xl font-bold">{currentSchoolRank.rank}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="bg-white/20 rounded-lg px-6 py-3 backdrop-blur-sm">
                                                <div className="flex items-center gap-3">
                                                    <FaStar className="text-yellow-300 text-2xl" />
                                                    <div>
                                                        <p className="text-sm opacity-90">إجمالي النقاط</p>
                                                        <p className="text-3xl font-bold">{currentSchoolRank.total_points?.toLocaleString() || 0}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="bg-white/20 rounded-lg px-6 py-3 backdrop-blur-sm">
                                                <div className="flex items-center gap-3">
                                                    <FaUsers className="text-white text-2xl" />
                                                    <div>
                                                        <p className="text-sm opacity-90">عدد الطلاب</p>
                                                        <p className="text-3xl font-bold">{currentSchoolRank.total_students || 0}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="bg-white/20 rounded-lg px-6 py-3 backdrop-blur-sm">
                                                <div className="flex items-center gap-3">
                                                    <FaProjectDiagram className="text-white text-2xl" />
                                                    <div>
                                                        <p className="text-sm opacity-90">المشاريع</p>
                                                        <p className="text-3xl font-bold">{currentSchoolRank.projects_count || 0}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {schoolsRanking && schoolsRanking.length > 0 ? (
                            <div className="space-y-4">
                                {schoolsRanking.map((school) => (
                                    <div
                                        key={school.id}
                                        className={`border rounded-lg p-4 transition ${
                                            school.is_current_school
                                                ? 'border-legacy-green bg-gradient-to-r from-legacy-green/10 to-legacy-blue/10 shadow-md'
                                                : 'border-gray-200 hover:shadow-md'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4 flex-1">
                                                <div className="w-12 h-12 flex items-center justify-center">
                                                    {getRankIcon(school.rank)}
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-bold text-lg text-gray-900">{school.name}</h4>
                                                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                                                        <span className="flex items-center gap-1">
                                                            <FaStar className="text-yellow-500" />
                                                            {school.total_points?.toLocaleString() || 0} نقطة
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <FaUsers />
                                                            {school.total_students || 0} طالب
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <FaProjectDiagram />
                                                            {school.projects_count || 0} مشروع
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            {school.is_current_school && (
                                                <span className="bg-legacy-green text-white px-3 py-1 rounded-full text-xs font-semibold">
                                                    مدرستك
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <FaTrophy className="text-6xl text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-600">لا توجد مؤسسات تعليمية في الترتيب حالياً</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* User's Badges Summary */}
                {auth?.user && (
                    <div className="mb-8 bg-gradient-to-r from-legacy-green/10 to-legacy-blue/10 rounded-xl p-6 border-2 border-legacy-green/20">
                        <div className="flex items-center justify-between flex-wrap gap-4">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">شاراتي</h2>
                                <p className="text-gray-600">
                                    {userBadges.length} شارة إنجاز • {userCommunityBadgeProgress.length} شارة مجتمعية
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Achievement Badges Section */}
                {achievementBadges.length > 0 && (
                    <div className="mb-12">
                        <div className="mb-6">
                            <h2 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                                <FaAward className="text-legacy-green" />
                                شارات الإنجاز
                            </h2>
                            <p className="text-gray-600">
                                شارات يتم منحها يدوياً من قبل المعلمين أو المؤسسات تعليمية عند إكمال إنجاز معين
                            </p>
                        </div>

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

                {/* Community Badges Section */}
                {communityBadges.length > 0 && (
                    <div className="mb-12">
                        <div className="mb-6">
                            <h2 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                                <FaMedal className="text-legacy-green" />
                                الشارات المجتمعية
                            </h2>
                            <p className="text-gray-600">
                                شارات تعتمد على النقاط المتراكمة من النشاط المجتمعي (0-100 نقطة)
                            </p>
                        </div>

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

                {/* Empty State */}
                {achievementBadges.length === 0 && communityBadges.length === 0 && (
                    <div className="text-center py-12">
                        <FaMedal className="mx-auto text-6xl text-gray-300 mb-4" />
                        <p className="text-gray-500 text-lg">لا توجد شارات متاحة حالياً</p>
                    </div>
                )}
            </div>
        </MainLayout>
    );
}
