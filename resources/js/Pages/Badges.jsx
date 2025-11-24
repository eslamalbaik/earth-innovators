import { Head, Link } from '@inertiajs/react';
import React, { useState } from 'react';
import MainLayout from '../Layouts/MainLayout';
import { FaMedal, FaTrophy, FaAward, FaStar, FaCheckCircle, FaCrown, FaUsers, FaProjectDiagram } from 'react-icons/fa';

// Badge Image Component with fallback
function BadgeImage({ badge, isEarned, size = 'w-24 h-24' }) {
    const [imageError, setImageError] = useState(false);
    const imageUrl = badge.image || badge.icon;
    
    const IconMap = {
        rank_first: FaTrophy,
        rank_second: FaMedal,
        rank_third: FaAward,
        excellent_innovator: FaStar,
        active_participant: FaCheckCircle,
        custom: FaMedal
    };
    const BadgeIcon = IconMap[badge.type] || FaMedal;
    
    // Get badge colors based on type
    const getBadgeColors = (type, isEarned) => {
        if (isEarned) {
            // Colors when badge is earned
            const earnedColors = {
                rank_first: 'bg-gradient-to-br from-yellow-400 to-yellow-600',
                rank_second: 'bg-gradient-to-br from-gray-300 to-gray-500',
                rank_third: 'bg-gradient-to-br from-orange-400 to-orange-600',
                excellent_innovator: 'bg-gradient-to-br from-purple-400 to-purple-600',
                active_participant: 'bg-gradient-to-br from-blue-400 to-blue-600',
                custom: 'bg-gradient-to-br from-legacy-green to-legacy-blue'
            };
            return earnedColors[type] || 'bg-gradient-to-br from-legacy-green to-legacy-blue';
        } else {
            // Colors when badge is not earned
            const unearnedColors = {
                rank_first: 'bg-gradient-to-br from-yellow-100 to-yellow-200',
                rank_second: 'bg-gradient-to-br from-gray-100 to-gray-200',
                rank_third: 'bg-gradient-to-br from-orange-100 to-orange-200',
                excellent_innovator: 'bg-gradient-to-br from-purple-100 to-purple-200',
                active_participant: 'bg-gradient-to-br from-blue-100 to-blue-200',
                custom: 'bg-gradient-to-br from-gray-200 to-gray-300'
            };
            return unearnedColors[type] || 'bg-gradient-to-br from-gray-200 to-gray-300';
        }
    };

    const getIconColor = (type, isEarned) => {
        if (isEarned) {
            return 'text-white';
        } else {
            const iconColors = {
                rank_first: 'text-yellow-600',
                rank_second: 'text-gray-600',
                rank_third: 'text-orange-600',
                excellent_innovator: 'text-purple-600',
                active_participant: 'text-blue-600',
                custom: 'text-gray-600'
            };
            return iconColors[type] || 'text-gray-600';
        }
    };
    
    // Check if URL is valid
    const isValidUrl = imageUrl && 
                       imageUrl.trim() !== '' && 
                       imageUrl !== 'null' && 
                       imageUrl !== 'undefined' &&
                       !imageError;

    if (isValidUrl) {
        return (
            <img
                src={imageUrl}
                alt={badge.name_ar || badge.name}
                className={`${size} object-contain`}
                onError={() => setImageError(true)}
            />
        );
    }

    const bgColor = getBadgeColors(badge.type, isEarned);
    const iconColor = getIconColor(badge.type, isEarned);
    const iconSize = size === 'w-24 h-24' ? 'text-5xl' : 'text-3xl';

    return (
        <div className={`${size} rounded-full flex items-center justify-center ${bgColor}`}>
            <BadgeIcon className={`${iconSize} ${iconColor}`} />
        </div>
    );
}

export default function Badges({ auth, badges = [], userBadges = [], schoolsRanking = [], currentSchoolRank = null }) {
    const earnedBadgeIds = userBadges.map(ub => ub.badge_id);

    const getRankIcon = (rank) => {
        if (rank === 1) return <FaCrown className="text-yellow-500 text-3xl" />;
        if (rank === 2) return <FaMedal className="text-gray-400 text-3xl" />;
        if (rank === 3) return <FaMedal className="text-orange-400 text-3xl" />;
        return <span className="text-2xl font-bold text-gray-600">#{rank}</span>;
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
                {/* ترتيب المدارس */}
                <div className="mb-12 bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-legacy-green/10 to-legacy-blue/10">
                        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <FaTrophy className="text-legacy-green" />
                            ترتيب المدارس
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
                                <p className="text-gray-600">لا توجد مدارس في الترتيب حالياً</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* الشارات */}
                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <FaMedal className="text-legacy-green" />
                        الشارات المتاحة
                    </h2>
                </div>

                {auth?.user && (
                    <div className="mb-8 bg-gradient-to-r from-legacy-green/10 to-legacy-blue/10 rounded-xl p-6 border-2 border-legacy-green/20">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">شاراتي</h2>
                                <p className="text-gray-600">لديك {userBadges.length} شارة من أصل {badges.length}</p>
                            </div>
                            <div className="flex gap-2">
                                {userBadges.slice(0, 5).map((userBadge) => {
                                    // Use badge from userBadge if available, otherwise find from badges array
                                    const badge = userBadge.badge || badges.find(b => b.id === userBadge.badge_id);
                                    if (!badge) return null;
                                    
                                    return (
                                        <div key={userBadge.id} className="text-center p-3 bg-white rounded-lg shadow-md">
                                            <div className="flex justify-center mb-2">
                                                <BadgeImage badge={badge} isEarned={true} size="w-16 h-16" />
                                            </div>
                                            <p className="text-xs font-semibold text-gray-900">{badge.name_ar || badge.name}</p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {badges.map((badge) => {
                        const isEarned = earnedBadgeIds.includes(badge.id);

                        return (
                            <div
                                key={badge.id}
                                className={`bg-white rounded-xl shadow-lg overflow-hidden border-2 transition-all ${
                                    isEarned
                                        ? 'border-legacy-green shadow-legacy-green/20'
                                        : 'border-gray-200 hover:border-legacy-green/50'
                                }`}
                            >
                                <div className={`p-6 ${isEarned ? 'bg-gradient-to-br from-legacy-green/10 to-legacy-blue/10' : 'bg-gray-50'}`}>
                                    <div className="flex items-center justify-center mb-4">
                                        <BadgeImage badge={badge} isEarned={isEarned} />
                                    </div>
                                    {isEarned && (
                                        <div className="text-center mb-2">
                                            <span className="inline-block bg-gradient-to-r from-legacy-green to-legacy-blue text-white px-3 py-1 rounded-full text-xs font-bold shadow-md">
                                                ✓ مكتسبة
                                            </span>
                                        </div>
                                    )}
                                    <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
                                        {badge.name_ar || badge.name}
                                    </h3>
                                    <p className="text-gray-600 text-center text-sm mb-4">
                                        {badge.description_ar || badge.description}
                                    </p>
                                    <div className="flex items-center justify-center gap-4 text-sm">
                                        <div className="text-gray-500">
                                            <FaStar className="inline ml-1 text-yellow-500" />
                                            {badge.points_required} نقطة
                                        </div>
                                        {badge.type && (
                                            <div className="text-gray-500 capitalize">
                                                {badge.type.replace('_', ' ')}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {badges.length === 0 && (
                    <div className="text-center py-12">
                        <FaMedal className="mx-auto text-6xl text-gray-300 mb-4" />
                        <p className="text-gray-500 text-lg">لا توجد شارات متاحة حالياً</p>
                    </div>
                )}
            </div>
        </MainLayout>
    );
}

