import { memo, useMemo } from 'react';
import { FaUsers, FaCheckCircle, FaChartLine, FaTrophy } from 'react-icons/fa';

/**
 * PERFORMANCE OPTIMIZED: AnalyticsPreview with React.memo and useMemo
 * Memoizes calculations to prevent unnecessary recalculations
 */
function AnalyticsPreview({ stats }) {
    // PERFORMANCE: Early return with memoization check
    if (!stats) return null;

    // PERFORMANCE: Memoize participation rate calculation
    const participationRate = useMemo(() => {
        return stats.total_challenges > 0 
            ? ((stats.total_participants || 0) / (stats.total_challenges * 10)) * 100 // Assuming avg 10 participants per challenge
            : 0;
    }, [stats.total_challenges, stats.total_participants]);

    // PERFORMANCE: Memoize completion rate calculation
    const completionRate = useMemo(() => {
        return stats.total_participants > 0
            ? ((stats.completed_submissions || 0) / stats.total_participants) * 100
            : 0;
    }, [stats.total_participants, stats.completed_submissions]);

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <FaChartLine className="text-primary-500" />
                    نظرة سريعة على الأداء
                </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Participation Rate */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                <FaUsers className="text-blue-600" />
                            </div>
                            <div>
                                <div className="text-sm font-medium text-gray-700">معدل المشاركة</div>
                                <div className="text-xs text-gray-500">من إجمالي التحديات</div>
                            </div>
                        </div>
                        <div className="text-2xl font-bold text-blue-600">
                            {participationRate.toFixed(1)}%
                        </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                            className="bg-blue-500 h-2.5 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(100, participationRate)}%` }}
                        />
                    </div>
                </div>

                {/* Completion Rate */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                                <FaCheckCircle className="text-green-600" />
                            </div>
                            <div>
                                <div className="text-sm font-medium text-gray-700">معدل الإتمام</div>
                                <div className="text-xs text-gray-500">من إجمالي المشاركين</div>
                            </div>
                        </div>
                        <div className="text-2xl font-bold text-green-600">
                            {completionRate.toFixed(1)}%
                        </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                            className="bg-green-500 h-2.5 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(100, completionRate)}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-200">
                <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{stats.total_participants || 0}</div>
                    <div className="text-xs text-gray-500 mt-1">إجمالي المشاركين</div>
                </div>
                <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{stats.completed_submissions || 0}</div>
                    <div className="text-xs text-gray-500 mt-1">تسليمات مكتملة</div>
                </div>
            </div>
        </div>
    );
}

// PERFORMANCE: Export memoized component to prevent unnecessary re-renders
export default memo(AnalyticsPreview);

