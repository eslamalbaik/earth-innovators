import { Link } from '@inertiajs/react';
import { memo, useMemo } from 'react';
import { FaTrophy, FaCalendar, FaUsers, FaChartLine, FaSchool, FaUser } from 'react-icons/fa';
import ActionsMenu from './ActionsMenu';

/**
 * Modern Challenge Card Component with improved visual hierarchy
 * Features:
 * - Prominent points display
 * - Status badges with colors
 * - Grouped information with icons
 * - 3-dot actions menu
 * - Performance indicators
 * - RTL Arabic support
 */
const ModernChallengeCard = memo(function ModernChallengeCard({
    challenge,
    onEdit,
    onDelete,
    onView,
    onPause,
    showSchool = false,
    showAnalytics = false,
    getStatusBadge,
    getCategoryLabel,
    formatDate,
    routePrefix,
    deletingIds,
    updatingId,
}) {
    const isDeleting = deletingIds?.has(challenge.id) || false;
    const isUpdating = updatingId === challenge.id;

    // Memoize formatted dates
    const formattedStartDate = useMemo(
        () => (formatDate ? formatDate(challenge.start_date) : challenge.start_date),
        [formatDate, challenge.start_date]
    );

    const formattedDeadline = useMemo(
        () => (formatDate ? formatDate(challenge.deadline) : challenge.deadline),
        [formatDate, challenge.deadline]
    );

    // Memoize status badge
    const statusBadge = useMemo(
        () => (getStatusBadge ? getStatusBadge(challenge.status) : null),
        [getStatusBadge, challenge.status]
    );

    // Memoize category label
    const categoryLabel = useMemo(
        () => (getCategoryLabel ? getCategoryLabel(challenge.category) : challenge.category),
        [getCategoryLabel, challenge.category]
    );

    // Memoize participant percentage
    const participantPercentage = useMemo(() => {
        if (!challenge.max_participants) return 0;
        return Math.min(100, ((challenge.current_participants || 0) / challenge.max_participants) * 100);
    }, [challenge.current_participants, challenge.max_participants]);

    // Memoize route URL
    const showRoute = useMemo(
        () =>
            typeof route !== 'undefined'
                ? route(`${routePrefix}.show`, challenge.id)
                : `/${routePrefix.replace('.', '/')}/${challenge.id}`,
        [routePrefix, challenge.id]
    );

    return (
        <div
            className={`bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-200 overflow-hidden group ${isDeleting ? 'opacity-50 pointer-events-none' : ''
                } ${isUpdating ? 'ring-2 ring-blue-300' : ''}`}
        >
            {/* Card Header - Points & Status */}
            <div className="bg-gradient-to-r from-primary-50 to-secondary-50 px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    {/* Points - Prominent Display */}
                    {challenge.points_reward > 0 && (
                        <div className="flex items-center gap-2">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shadow-md">
                                <FaTrophy className="text-white text-lg" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-gray-900">
                                    {challenge.points_reward}
                                </div>
                                <div className="text-xs font-medium text-gray-600">نقطة</div>
                            </div>
                        </div>
                    )}

                    {/* Status Badge */}
                    <div className="flex items-center gap-3">
                        {statusBadge}
                        <ActionsMenu
                            challenge={challenge}
                            onView={onView}
                            onEdit={onEdit}
                            onDelete={onDelete}
                            onPause={onPause}
                            showAnalytics={showAnalytics}
                            isDeleting={isDeleting}
                            isUpdating={isUpdating}
                        />
                    </div>
                </div>
            </div>

            {/* Card Body */}
            <div className="p-6">
                {/* Challenge Title */}
                <Link
                    href={showRoute}
                    className="block mb-3 group-hover:text-primary-600 transition-colors"
                >
                    <h3 className="text-lg font-bold text-gray-900 line-clamp-2 mb-2">
                        {challenge.title}
                    </h3>
                    {challenge.objective && (
                        <p className="text-sm text-gray-600 line-clamp-2">{challenge.objective}</p>
                    )}
                </Link>

                {/* Type & Category Badges */}
                <div className="flex flex-wrap items-center gap-2 mb-4">
                    <span className="inline-flex items-center px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium">
                        {challenge.challenge_type_label || challenge.challenge_type}
                    </span>
                    <span className="inline-flex items-center px-3 py-1 bg-purple-50 text-purple-700 rounded-lg text-xs font-medium">
                        {categoryLabel}
                    </span>
                </div>

                {/* School & Teacher Info */}
                {(showSchool || challenge.creator_name) && (
                    <div className="flex flex-wrap items-center gap-4 mb-4 text-sm text-gray-600">
                        {showSchool && challenge.school_name && (
                            <div className="flex items-center gap-2">
                                <FaSchool className="text-gray-400" />
                                <span>{challenge.school_name}</span>
                            </div>
                        )}
                        {challenge.creator_name && (
                            <div className="flex items-center gap-2">
                                <FaUser className="text-gray-400" />
                                <span>{challenge.creator_name}</span>
                            </div>
                        )}
                    </div>
                )}

                {/* Dates - Grouped */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-700 mb-2">
                        <FaCalendar className="text-gray-400 flex-shrink-0" />
                        <span className="font-medium">التواريخ</span>
                    </div>
                    <div className="space-y-1 text-xs text-gray-600 pr-6">
                        <div>
                            <span className="font-medium">بدء:</span> {formattedStartDate}
                        </div>
                        <div>
                            <span className="font-medium">انتهاء:</span> {formattedDeadline}
                        </div>
                    </div>
                </div>

                {/* Participants - Grouped */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                            <FaUsers className="text-gray-400 flex-shrink-0" />
                            <span className="font-medium">المشاركون</span>
                        </div>
                        <div className="text-sm font-semibold text-gray-900">
                            {challenge.current_participants || 0}
                            {challenge.max_participants && ` / ${challenge.max_participants}`}
                        </div>
                    </div>
                    {challenge.max_participants && (
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div
                                className="bg-[#A3C042] h-2.5 rounded-full transition-all duration-300"
                                style={{ width: `${participantPercentage}%` }}
                            />
                        </div>
                    )}
                </div>

                {/* Analytics CTA - Secondary */}
                {showAnalytics && (
                    <Link
                        href={showRoute}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors text-sm font-medium w-full justify-center"
                    >
                        <FaChartLine />
                        <span>تحليل الأداء</span>
                    </Link>
                )}
            </div>
        </div>
    );
});

/**
 * Modern Challenge Card Grid
 * Responsive grid layout:
 * - Desktop (lg): 3 columns
 * - Tablet (md): 2 columns
 * - Mobile (sm): 1 column with collapsible details
 * - RTL Arabic support
 */
function ModernChallengeCardGrid({
    challenges,
    onEdit,
    onDelete,
    onView,
    onPause,
    showSchool = true,
    showAnalytics = false,
    getStatusBadge,
    getCategoryLabel,
    formatDate,
    routePrefix = 'admin.challenges',
    deletingIds = new Set(),
    updatingId = null,
}) {
    if (!challenges || challenges.length === 0) {
        return null;
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6" dir="rtl">
            {challenges.map((challenge) => (
                <ModernChallengeCard
                    key={challenge.id}
                    challenge={challenge}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onView={onView}
                    onPause={onPause}
                    showSchool={showSchool}
                    showAnalytics={showAnalytics}
                    getStatusBadge={getStatusBadge}
                    getCategoryLabel={getCategoryLabel}
                    formatDate={formatDate}
                    routePrefix={routePrefix}
                    deletingIds={deletingIds}
                    updatingId={updatingId}
                />
            ))}
        </div>
    );
}

export default memo(ModernChallengeCardGrid);

