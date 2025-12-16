import React, { useState } from 'react';
import { FaMedal, FaTrophy, FaAward, FaStar, FaCheckCircle, FaSchool, FaUserTie } from 'react-icons/fa';

/**
 * AchievementBadge Component
 * Displays a binary achievement badge (earned/not earned)
 * Shows source (Teacher/School) and earned state
 */
export default function AchievementBadge({ badge, isEarned = false, source = null }) {
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

    // Get badge colors based on type and earned state
    const getBadgeColors = (type, isEarned) => {
        if (isEarned) {
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

    const bgColor = getBadgeColors(badge.type, isEarned);
    const iconColor = getIconColor(badge.type, isEarned);

    return (
        <div
            className={`bg-white rounded-xl shadow-lg overflow-hidden border-2 transition-all ${
                isEarned
                    ? 'border-legacy-green shadow-legacy-green/20'
                    : 'border-gray-200 hover:border-legacy-green/50'
            }`}
        >
            <div className={`p-6 ${isEarned ? 'bg-gradient-to-br from-legacy-green/10 to-legacy-blue/10' : 'bg-gray-50'}`}>
                <div className="flex items-center justify-center mb-4">
                    {isValidUrl ? (
                        <img
                            src={imageUrl}
                            alt={badge.name_ar || badge.name}
                            className="w-24 h-24 object-contain"
                            onError={() => setImageError(true)}
                        />
                    ) : (
                        <div className={`w-24 h-24 rounded-full flex items-center justify-center ${bgColor}`}>
                            <BadgeIcon className={`text-5xl ${iconColor}`} />
                        </div>
                    )}
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

                {/* Source label */}
                {source && (
                    <div className="flex items-center justify-center gap-2 mb-3">
                        {source === 'teacher' || source === 'Teacher' ? (
                            <FaUserTie className="text-blue-500 text-sm" />
                        ) : (
                            <FaSchool className="text-green-500 text-sm" />
                        )}
                        <span className="text-xs text-gray-600">
                            {source === 'teacher' || source === 'Teacher' ? 'معلم' : 'مدرسة'}
                        </span>
                    </div>
                )}

                <div className="flex items-center justify-center gap-4 text-sm">
                    {badge.points_required > 0 && (
                        <div className="text-gray-500">
                            <FaStar className="inline ml-1 text-yellow-500" />
                            {badge.points_required} نقطة
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
