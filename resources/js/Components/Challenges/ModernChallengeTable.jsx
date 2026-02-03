import { Link } from '@inertiajs/react';
import { memo, useMemo } from 'react';
import { FaTrophy, FaCalendar, FaUsers, FaSchool, FaUser, FaChartLine } from 'react-icons/fa';
import ActionsMenu from './ActionsMenu';

/**
 * Modern Challenge Table Row - Card-like row design
 * Combines table structure with card aesthetics
 */
const ModernChallengeTableRow = memo(function ModernChallengeTableRow({
    challenge,
    onEdit,
    onDelete,
    onView,
    onPause,
    showSchool,
    showAnalytics,
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
        <tr
            className={`hover:bg-gray-50 transition-colors duration-150 border-b border-gray-100 ${isDeleting ? 'opacity-50 pointer-events-none' : ''
                } ${isUpdating ? 'bg-blue-50' : ''}`}
        >
            {/* Challenge Info with Points */}
            <td className="px-4 sm:px-6 py-5">
                <div className="flex items-start gap-3 sm:gap-4">
                    {/* Points Badge */}
                    {challenge.points_reward > 0 && (
                        <div className="flex-shrink-0">
                            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shadow-md">
                                <FaTrophy className="text-white text-lg" />
                            </div>
                            <div className="text-center mt-1">
                                <div className="text-sm font-bold text-gray-900">
                                    {challenge.points_reward}
                                </div>
                                <div className="text-xs text-gray-600">نقطة</div>
                            </div>
                        </div>
                    )}

                    <div className="flex-1 min-w-0">
                        <Link
                            href={showRoute}
                            className="text-base font-bold text-gray-900 hover:text-primary-600 transition-colors block mb-1"
                        >
                            {challenge.title}
                        </Link>
                        {challenge.objective && (
                            <p className="text-sm text-gray-600 line-clamp-1 mb-2">
                                {challenge.objective}
                            </p>
                        )}
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="inline-flex items-center px-2.5 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-medium">
                                {challenge.challenge_type_label || challenge.challenge_type}
                            </span>
                            <span className="inline-flex items-center px-2.5 py-1 bg-purple-50 text-purple-700 rounded-md text-xs font-medium">
                                {categoryLabel}
                            </span>
                        </div>
                    </div>
                </div>
            </td>

            {/* School & Teacher */}
            {showSchool && (
                <td className="px-4 sm:px-6 py-5 hidden md:table-cell">
                    <div className="space-y-1">
                        {challenge.school_name && (
                            <div className="flex items-center gap-2 text-sm text-gray-900">
                                <FaSchool className="text-gray-400 text-xs" />
                                <span className="font-medium">{challenge.school_name}</span>
                            </div>
                        )}
                        {challenge.creator_name && (
                            <div className="flex items-center gap-2 text-xs text-gray-600">
                                <FaUser className="text-gray-400" />
                                <span>{challenge.creator_name}</span>
                            </div>
                        )}
                    </div>
                </td>
            )}

            {/* Dates - Grouped */}
            <td className="px-4 sm:px-6 py-5">
                <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-xs text-gray-700">
                        <FaCalendar className="text-gray-400 flex-shrink-0" />
                        <div>
                            <span className="font-medium">بدء:</span> {formattedStartDate}
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                        <FaCalendar className="text-gray-400 flex-shrink-0" />
                        <div>
                            <span className="font-medium">انتهاء:</span> {formattedDeadline}
                        </div>
                    </div>
                </div>
            </td>

            {/* Participants */}
            <td className="px-4 sm:px-6 py-5">
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <FaUsers className="text-gray-400 text-sm flex-shrink-0" />
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
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-[#A3C042] h-2 rounded-full transition-all duration-300"
                                style={{ width: `${participantPercentage}%` }}
                            />
                        </div>
                    )}
                </div>
            </td>

            {/* Status */}
            <td className="px-4 sm:px-6 py-5">
                {statusBadge}
            </td>

            {/* Analytics (Admin only) */}
            {showAnalytics && (
                <td className="px-4 sm:px-6 py-5 hidden lg:table-cell">
                    <Link
                        href={showRoute}
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors text-xs font-medium"
                    >
                        <FaChartLine className="text-xs" />
                        تحليل
                    </Link>
                </td>
            )}

            {/* Actions */}
            <td className="px-4 sm:px-6 py-5">
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
            </td>
        </tr>
    );
});

/**
 * Modern Challenge Table - Hybrid table-card design
 * Features:
 * - Card-like rows with better spacing
 * - Prominent points display
 * - Grouped information
 * - Status badges
 * - 3-dot actions menu
 */
function ModernChallengeTable({
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
        <div className="overflow-x-auto" dir="rtl">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                    <tr>
                        <th className="px-4 sm:px-6 py-4  text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            التحدي
                        </th>
                        {showSchool && (
                            <th className="px-4 sm:px-6 py-4  text-xs font-semibold text-gray-700 uppercase tracking-wider hidden md:table-cell">
                                المدرسة
                            </th>
                        )}
                        <th className="px-4 sm:px-6 py-4  text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            التواريخ
                        </th>
                        <th className="px-4 sm:px-6 py-4  text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            المشاركون
                        </th>
                        <th className="px-4 sm:px-6 py-4  text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            الحالة
                        </th>
                        {showAnalytics && (
                            <th className="px-4 sm:px-6 py-4  text-xs font-semibold text-gray-700 uppercase tracking-wider hidden lg:table-cell">
                                الأداء
                            </th>
                        )}
                        <th className="px-4 sm:px-6 py-4  text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            الإجراءات
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {challenges.map((challenge) => (
                        <ModernChallengeTableRow
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
                </tbody>
            </table>
        </div>
    );
}

export default memo(ModernChallengeTable);

