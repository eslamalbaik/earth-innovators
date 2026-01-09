import { Link } from '@inertiajs/react';
import { memo, useMemo } from 'react';
import { FaTrophy, FaCalendar, FaUsers, FaEye, FaEdit, FaTrash, FaChartLine } from 'react-icons/fa';

/**
 * PERFORMANCE: Memoized card component to prevent unnecessary re-renders
 * Only re-renders when its specific challenge data changes
 */
const ChallengeCard = memo(function ChallengeCard({ 
    challenge, 
    onEdit, 
    onDelete, 
    onView,
    showSchool,
    showAnalytics,
    getStatusBadge,
    getCategoryLabel,
    formatDate,
    routePrefix,
    deletingIds,
    updatingId
}) {
    const isDeleting = deletingIds.has(challenge.id);
    const isUpdating = updatingId === challenge.id;
    
    // PERFORMANCE: Memoize formatted dates
    const formattedStartDate = useMemo(() => 
        formatDate ? formatDate(challenge.start_date) : challenge.start_date,
        [formatDate, challenge.start_date]
    );
    
    const formattedDeadline = useMemo(() => 
        formatDate ? formatDate(challenge.deadline) : challenge.deadline,
        [formatDate, challenge.deadline]
    );
    
    // PERFORMANCE: Memoize status badge
    const statusBadge = useMemo(() => 
        getStatusBadge ? getStatusBadge(challenge.status) : null,
        [getStatusBadge, challenge.status]
    );
    
    // PERFORMANCE: Memoize category label
    const categoryLabel = useMemo(() => 
        getCategoryLabel ? getCategoryLabel(challenge.category) : challenge.category,
        [getCategoryLabel, challenge.category]
    );
    
    // PERFORMANCE: Memoize participant percentage
    const participantPercentage = useMemo(() => {
        if (!challenge.max_participants) return 0;
        return Math.min(100, ((challenge.current_participants || 0) / challenge.max_participants) * 100);
    }, [challenge.current_participants, challenge.max_participants]);
    
    // PERFORMANCE: Memoize route URL
    const showRoute = useMemo(() => 
        typeof route !== 'undefined' 
            ? route(`${routePrefix}.show`, challenge.id) 
            : `/${routePrefix.replace('.', '/')}/${challenge.id}`,
        [routePrefix, challenge.id]
    );
    
    return (
        <div
            className={`bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-200 overflow-hidden group ${isDeleting ? 'opacity-50 pointer-events-none' : ''} ${isUpdating ? 'ring-2 ring-blue-300' : ''}`}
        >
            {/* Card Header */}
            <div className="p-6 pb-4">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center flex-shrink-0">
                            <FaTrophy className="text-white text-lg" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <Link
                                href={showRoute}
                                className="text-lg font-bold text-gray-900 hover:text-primary-600 transition-colors block truncate"
                            >
                                {challenge.title}
                            </Link>
                            {showSchool && challenge.school_name && (
                                <p className="text-sm text-gray-500 mt-1 truncate">
                                    {challenge.school_name}
                                </p>
                            )}
                        </div>
                    </div>
                    {statusBadge}
                </div>

                {/* Objective */}
                {challenge.objective && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {challenge.objective}
                    </p>
                )}

                {/* Badges */}
                <div className="flex flex-wrap items-center gap-2 mb-4">
                    <span className="inline-flex items-center px-2.5 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-medium">
                        {challenge.challenge_type_label || challenge.challenge_type}
                    </span>
                    <span className="inline-flex items-center px-2.5 py-1 bg-purple-50 text-purple-700 rounded-md text-xs font-medium">
                        {categoryLabel}
                    </span>
                    {challenge.points_reward > 0 && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-yellow-50 text-yellow-700 rounded-md text-xs font-medium">
                            <FaTrophy className="text-xs" />
                            {challenge.points_reward} نقطة
                        </span>
                    )}
                </div>
            </div>

            {/* Card Body - Details */}
            <div className="px-6 pb-4 space-y-3">
                {/* Dates */}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                    <FaCalendar className="text-gray-400 flex-shrink-0" />
                    <div className="flex-1">
                        <div className="font-medium text-gray-700">تاريخ البدء</div>
                        <div className="text-xs text-gray-500">
                            {formattedStartDate}
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                    <FaCalendar className="text-gray-400 flex-shrink-0" />
                    <div className="flex-1">
                        <div className="font-medium text-gray-700">تاريخ الانتهاء</div>
                        <div className="text-xs text-gray-500">
                            {formattedDeadline}
                        </div>
                    </div>
                </div>

                {/* Participants */}
                <div className="flex items-center gap-2 text-sm">
                    <FaUsers className="text-gray-400 flex-shrink-0" />
                    <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-gray-700">المشاركون</span>
                            <span className="text-sm font-semibold text-gray-900">
                                {challenge.current_participants || 0}
                                {challenge.max_participants && ` / ${challenge.max_participants}`}
                            </span>
                        </div>
                        {challenge.max_participants && (
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${participantPercentage}%` }}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Card Footer - Actions */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {onView && (
                            <button
                                onClick={() => onView(challenge)}
                                className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                                title="عرض"
                            >
                                <FaEye className="text-sm" />
                            </button>
                        )}
                        {onEdit && (
                            <button
                                onClick={() => onEdit(challenge)}
                                className="p-2 text-amber-600 hover:bg-amber-100 rounded-lg transition-colors"
                                title="تعديل"
                            >
                                <FaEdit className="text-sm" />
                            </button>
                        )}
                        {onDelete && (
                            <button
                                onClick={() => onDelete(challenge.id)}
                                disabled={isDeleting || isUpdating}
                                className={`p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors ${isDeleting || isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
                                title={isDeleting ? 'جاري الحذف...' : 'حذف'}
                            >
                                {isDeleting ? (
                                    <span className="animate-spin text-xs">⏳</span>
                                ) : (
                                    <FaTrash className="text-sm" />
                                )}
                            </button>
                        )}
                    </div>
                    {showAnalytics && (
                        <Link
                            href={showRoute}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors text-xs font-medium"
                        >
                            <FaChartLine className="text-xs" />
                            تحليل
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
});

/**
 * PERFORMANCE OPTIMIZED: ChallengeCardGrid with React.memo
 * Prevents re-renders when parent re-renders but props haven't changed
 * Uses memoized card components for optimal performance
 */
function ChallengeCardGrid({ 
    challenges, 
    onEdit, 
    onDelete, 
    onView,
    showSchool = true,
    showAnalytics = false,
    getStatusBadge,
    getCategoryLabel,
    formatDate,
    routePrefix = 'admin.challenges',
    deletingIds = new Set(),
    updatingId = null
}) {
    if (!challenges || challenges.length === 0) {
        return null;
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {challenges.map((challenge) => (
                <ChallengeCard
                    key={challenge.id}
                    challenge={challenge}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onView={onView}
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

// PERFORMANCE: Export memoized component to prevent unnecessary re-renders
export default memo(ChallengeCardGrid);

