import { Link } from '@inertiajs/react';
import { memo, useMemo } from 'react';
import { FaEye, FaEdit, FaTrash, FaCalendar, FaUsers, FaTrophy, FaChartLine } from 'react-icons/fa';

/**
 * PERFORMANCE: Memoized table row component to prevent unnecessary re-renders
 * Only re-renders when its specific challenge data changes
 */
const ChallengeTableRow = memo(function ChallengeTableRow({ 
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
    
    // PERFORMANCE: Memoize formatted dates to avoid recalculation on every render
    const formattedStartDate = useMemo(() => 
        formatDate ? formatDate(challenge.start_date) : challenge.start_date,
        [formatDate, challenge.start_date]
    );
    
    const formattedDeadline = useMemo(() => 
        formatDate ? formatDate(challenge.deadline) : challenge.deadline,
        [formatDate, challenge.deadline]
    );
    
    // PERFORMANCE: Memoize status badge to prevent recreation
    const statusBadge = useMemo(() => 
        getStatusBadge ? getStatusBadge(challenge.status) : (
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">
                {challenge.status}
            </span>
        ),
        [getStatusBadge, challenge.status]
    );
    
    // PERFORMANCE: Memoize category label
    const categoryLabel = useMemo(() => 
        getCategoryLabel ? getCategoryLabel(challenge.category) : challenge.category,
        [getCategoryLabel, challenge.category]
    );
    
    // PERFORMANCE: Memoize participant percentage calculation
    const participantPercentage = useMemo(() => {
        if (!challenge.max_participants) return 0;
        return Math.min(100, ((challenge.current_participants || 0) / challenge.max_participants) * 100);
    }, [challenge.current_participants, challenge.max_participants]);
    
    // PERFORMANCE: Memoize route URLs
    const showRoute = useMemo(() => 
        typeof route !== 'undefined' 
            ? route(`${routePrefix}.show`, challenge.id) 
            : `/${routePrefix.replace('.', '/')}/${challenge.id}`,
        [routePrefix, challenge.id]
    );
    
    return (
        <tr 
            className={`hover:bg-gray-50 transition-colors duration-150 ${isDeleting ? 'opacity-50 pointer-events-none' : ''} ${isUpdating ? 'bg-blue-50' : ''}`}
        >
            {/* Challenge Info */}
            <td className="px-6 py-4">
                <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
                            <FaTrophy className="text-white text-sm" />
                        </div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <Link
                            href={showRoute}
                            className="text-sm font-semibold text-gray-900 hover:text-primary-600 transition-colors block truncate"
                        >
                            {challenge.title}
                        </Link>
                        {challenge.objective && (
                            <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                                {challenge.objective}
                            </p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                            {challenge.points_reward > 0 && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-50 text-yellow-700 rounded-md text-xs font-medium">
                                    <FaTrophy className="text-xs" />
                                    {challenge.points_reward} نقطة
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </td>

            {/* School */}
            {showSchool && (
                <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 font-medium">
                        {challenge.school_name || 'غير محدد'}
                    </div>
                    {challenge.creator_name && (
                        <div className="text-xs text-gray-500 mt-1">
                            {challenge.creator_name}
                        </div>
                    )}
                </td>
            )}

            {/* Type / Category */}
            <td className="px-6 py-4">
                <div className="space-y-1">
                    <span className="inline-block px-2.5 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-medium">
                        {challenge.challenge_type_label || challenge.challenge_type}
                    </span>
                    <div className="text-xs text-gray-600">
                        {categoryLabel}
                    </div>
                    {challenge.age_group && (
                        <div className="text-xs text-gray-500">
                            {challenge.age_group}
                        </div>
                    )}
                </div>
            </td>

            {/* Dates */}
            <td className="px-6 py-4">
                <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-1.5 text-gray-700">
                        <FaCalendar className="text-gray-400 text-xs" />
                        <span className="font-medium">بدء:</span>
                        <span>{formattedStartDate}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-600">
                        <FaCalendar className="text-gray-400 text-xs" />
                        <span className="font-medium">انتهاء:</span>
                        <span>{formattedDeadline}</span>
                    </div>
                </div>
            </td>

            {/* Participants */}
            <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                    <FaUsers className="text-gray-400 text-sm" />
                    <div>
                        <div className="text-sm font-semibold text-gray-900">
                            {challenge.current_participants || 0}
                        </div>
                        {challenge.max_participants && (
                            <div className="text-xs text-gray-500">
                                من {challenge.max_participants}
                            </div>
                        )}
                    </div>
                </div>
                {challenge.max_participants && (
                    <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
                        <div
                            className="bg-primary-500 h-1.5 rounded-full transition-all duration-300"
                            style={{ width: `${participantPercentage}%` }}
                        />
                    </div>
                )}
            </td>

            {/* Status */}
            <td className="px-6 py-4">
                {statusBadge}
            </td>

            {/* Analytics (Admin only) */}
            {showAnalytics && (
                <td className="px-6 py-4">
                    <Link
                        href={showRoute}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors text-xs font-medium"
                    >
                        <FaChartLine className="text-xs" />
                        تحليل
                    </Link>
                </td>
            )}

            {/* Actions */}
            <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                    {onView && (
                        <button
                            onClick={() => onView(challenge)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="عرض"
                        >
                            <FaEye className="text-sm" />
                        </button>
                    )}
                    {onEdit && (
                        <button
                            onClick={() => onEdit(challenge)}
                            className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                            title="تعديل"
                        >
                            <FaEdit className="text-sm" />
                        </button>
                    )}
                    {onDelete && (
                        <button
                            onClick={() => onDelete(challenge.id)}
                            disabled={isDeleting || isUpdating}
                            className={`p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors ${isDeleting || isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
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
            </td>
        </tr>
    );
});

/**
 * PERFORMANCE OPTIMIZED: ChallengeTable with React.memo
 * Prevents re-renders when parent re-renders but props haven't changed
 * Uses memoized row components for optimal performance with large datasets
 */
function ChallengeTable({ 
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
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                    <tr>
                        <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            التحدي
                        </th>
                        {showSchool && (
                            <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                المدرسة
                            </th>
                        )}
                        <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            النوع / الفئة
                        </th>
                        <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            التواريخ
                        </th>
                        <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            المشاركون
                        </th>
                        <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            الحالة
                        </th>
                        {showAnalytics && (
                            <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                الأداء
                            </th>
                        )}
                        <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            الإجراءات
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {challenges.map((challenge) => (
                        <ChallengeTableRow
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
                </tbody>
            </table>
        </div>
    );
}

// PERFORMANCE: Export memoized component to prevent unnecessary re-renders
export default memo(ChallengeTable);

