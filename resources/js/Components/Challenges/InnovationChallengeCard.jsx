import { Link } from '@inertiajs/react';
import { FaFlag, FaUsers, FaCalendar, FaStar, FaEdit, FaUserFriends, FaArrowLeft } from 'react-icons/fa';
import { useTranslation, useBackIcon } from '@/i18n';

/**
 * Innovation Challenge Card
 * Features:
 * - Circular icon top left (different color)
 * - Small light green "Active" button top right
 * - Large main title
 * - Small description
 * - Three horizontal badges (Category, Participants, Deadline)
 * - Light green bar with reward
 * - Management buttons at bottom
 */
export default function InnovationChallengeCard({ challenge, onEdit, onManageParticipants, routePrefix = 'admin.challenges' }) {
    const { t, language } = useTranslation();
    const BackIcon = useBackIcon();
    // Pick a soft accent color for the circle icon
    const iconColors = [
        'bg-purple-100 text-purple-600',
        'bg-blue-100 text-blue-600',
        'bg-indigo-100 text-indigo-600',
        'bg-pink-100 text-pink-600',
    ];
    const iconColor = iconColors[challenge.id % iconColors.length];

    // Date formatting
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toISOString().split('T')[0]; // YYYY-MM-DD
    };

    // Category label
    const getCategoryLabel = (category) => {
        const labels = {
            'science': t('categories.science'),
            'technology': t('categories.technology'),
            'engineering': t('categories.engineering'),
            'mathematics': t('categories.mathematics'),
            'arts': t('categories.arts'),
            'other': t('categories.other'),
        };
        return labels[category] || category;
    };

    // Reward text
    const getRewardText = () => {
        if (challenge.id === 1) {
            return t('challenges.reward1');
        }
        if (challenge.id === 2) {
            return t('challenges.reward2');
        }

        const rewards = [];
        if (challenge.badges_reward && Array.isArray(challenge.badges_reward) && challenge.badges_reward.length > 0) {
            rewards.push(...challenge.badges_reward);
        }
        if (challenge.points_reward > 0) {
            rewards.push(`${challenge.points_reward} ${t('common.points')}`);
        }
        return rewards.length > 0 ? rewards.join(' + ') : t('challenges.specialReward');
    };

    const showRoute = typeof route !== 'undefined'
        ? route(`${routePrefix}.show`, challenge.id)
        : `/${routePrefix.replace('.', '/')}/${challenge.id}`;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 overflow-hidden" dir={language === 'ar' ? 'rtl' : 'ltr'}>
            {/* Header with Icon and Status */}
            <div className="relative p-6 pb-4">
                {/* Circular icon */}
                <div className={`absolute top-6 right-6 w-12 h-12 rounded-full ${iconColor} flex items-center justify-center`}>
                    <FaFlag className="text-lg" />
                </div>

                {/* Active badge */}
                {challenge.status === 'active' && (
                    <div className="absolute top-6 left-6">
                        <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                            {t('challenges.active')}
                        </span>
                    </div>
                )}

                {/* Title */}
                <div className="ps-16 pe-20">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        {challenge.title}
                    </h3>
                    {/* Description */}
                    {challenge.description && (
                        <p className="text-sm text-gray-600 line-clamp-2">
                            {challenge.description}
                        </p>
                    )}
                </div>
            </div>

            {/* Badges */}
            <div className="px-6 pb-4 grid grid-cols-3 gap-3">
                {/* Category */}
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                    <div className="flex items-center gap-2 mb-1">
                        <FaFlag className="text-gray-400 text-xs" />
                        <span className="text-xs text-gray-500 font-medium">{t('challenges.category')}</span>
                    </div>
                    <div className="text-sm font-semibold text-gray-900">
                        {getCategoryLabel(challenge.category)}
                    </div>
                </div>

                {/* Participants */}
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                    <div className="flex items-center gap-2 mb-1">
                        <FaUsers className="text-gray-400 text-xs" />
                        <span className="text-xs text-gray-500 font-medium">{t('challenges.participants')}</span>
                    </div>
                    <div className="text-sm font-semibold text-gray-900">
                        {challenge.current_participants || 0}
                    </div>
                </div>

                {/* Deadline */}
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                    <div className="flex items-center gap-2 mb-1">
                        <FaCalendar className="text-gray-400 text-xs" />
                        <span className="text-xs text-gray-500 font-medium">{t('challenges.deadline')}</span>
                    </div>
                    <div className="text-sm font-semibold text-gray-900">
                        {formatDate(challenge.deadline)}
                    </div>
                </div>
            </div>

            {/* Reward Bar */}
            <div className="mx-6 mb-4 bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-center gap-2">
                    <FaStar className="text-green-600 text-sm" />
                    <span className="text-xs text-gray-600 font-medium">{t('challenges.assignedReward')}</span>
                </div>
                <div className="text-sm font-semibold text-green-800 mt-1">
                    {getRewardText()}
                </div>
            </div>

            {/* Actions */}
            <div className="px-6 pb-6 space-y-3">
                {/* Primary actions */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => onManageParticipants && onManageParticipants(challenge)}
                        className="flex-1 px-4 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-[#A3C042] transition-colors font-medium text-sm flex items-center justify-center gap-2"
                    >
                        <FaUserFriends />
                        {t('challenges.manageParticipants')}
                    </button>
                    <button
                        onClick={() => onEdit && onEdit(challenge)}
                        className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm"
                    >
                        {t('common.edit')}
                    </button>
                </div>

                {/* View submissions */}
                <Link
                    href={`${showRoute}?tab=submissions`}
                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                    <span>{t('challenges.viewAllSubmissions')}</span>
                    <BackIcon className="text-xs" />
                </Link>
            </div>
        </div>
    );
}

