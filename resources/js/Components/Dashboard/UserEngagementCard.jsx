import { memo, useMemo, lazy, Suspense } from 'react';
import { FaBolt } from 'react-icons/fa';
import { FaArrowUp } from 'react-icons/fa';

// Lazy load the chart component for better performance
const EngagementChart = lazy(() => import('./EngagementChart'));

/**
 * UserEngagementCard Component
 * 
 * A professional, high-performance, fully responsive React component
 * for displaying user engagement analytics with full RTL support.
 * 
 * @param {Object} props
 * @param {Array} props.listItems - Array of top engaged innovators
 * @param {Array} props.chartData - Array of monthly engagement data points
 * @param {string} props.trendPercentage - Trend percentage (e.g., "+12%")
 */
function UserEngagementCard({ 
    listItems = [],
    chartData = [],
    trendPercentage = "+12%"
}) {
    // Memoize default data to prevent unnecessary recalculations
    const defaultListItems = useMemo(() => [
        {
            id: 1,
            name: 'سارة خالد',
            nameEn: 'Sara Khalid',
            activity: 98,
            project: 'مشروع 315 أوسمة',
            projectEn: 'Project 315 badges',
            date: 'منشور في 15 | 3 | 2025',
            image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face',
            badge: 1
        },
        {
            id: 2,
            name: 'لينا عمر',
            nameEn: 'Lina Omar',
            activity: 91,
            project: 'مشروع 114 أوسمة',
            projectEn: 'Project 114 badges',
            date: 'منشور في 12 | 3 | 2025',
            image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
            badge: 2
        },
        {
            id: 3,
            name: 'أحمد محمود',
            nameEn: 'Ahmed Mahmoud',
            activity: 85,
            project: 'مشروع 213 أوسمة',
            projectEn: 'Project 213 badges',
            date: 'منشور في 10 | 3 | 2025',
            image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
            badge: 3
        }
    ], []);

    const defaultChartData = useMemo(() => [
        { month: 'يناير', value: 75 },
        { month: 'فبراير', value: 70 },
        { month: 'مارس', value: 65 },
        { month: 'أبريل', value: 68 },
        { month: 'مايو', value: 75 },
        { month: 'يونيو', value: 78 },
        { month: 'يوليو', value: 80 }
    ], []);

    // Use provided data or fallback to defaults
    const displayListItems = useMemo(() => 
        listItems.length > 0 ? listItems : defaultListItems,
        [listItems, defaultListItems]
    );

    const displayChartData = useMemo(() => 
        chartData.length > 0 ? chartData : defaultChartData,
        [chartData, defaultChartData]
    );

    return (
        <div 
            dir="rtl" 
            className="w-full bg-white rounded-2xl shadow-lg border border-gray-100 p-6 md:p-8"
            role="region"
            aria-label="تحليلات تفاعل الطلاب"
        >
            {/* Header Section */}
            <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                    <FaBolt 
                        className="text-blue-600 text-2xl md:text-3xl" 
                        aria-hidden="true"
                    />
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                        تفاعل الطلاب
                        <span className="text-lg md:text-xl font-normal text-gray-600 mr-2">
                            (User Engagement)
                        </span>
                    </h2>
                </div>
                <p className="text-sm md:text-base text-gray-600 mr-10">
                    قياس مدى تفاعل الطلاب ونشاطهم داخل المنصة
                </p>
            </div>

            {/* Trend Badge */}
            <div className="flex items-center justify-center md:justify-start mb-6">
                <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 rounded-full px-4 py-2">
                    <span className="text-sm font-semibold text-gray-700">
                        أفضل التفاعلات الإيجابية
                    </span>
                    <div className="flex items-center gap-1 bg-green-100 rounded-full px-3 py-1">
                        <FaArrowUp className="text-green-600 text-xs" aria-hidden="true" />
                        <span className="text-sm font-bold text-green-700">
                            {trendPercentage}
                        </span>
                    </div>
                </div>
            </div>

            {/* Main Content: List and Chart */}
            {/* In RTL, flex-row places first child on right, so we reverse order to get list on left, chart on right */}
            <div className="flex flex-col md:flex-row-reverse gap-6 md:gap-8">
                {/* Left Section: Top Engaged Innovators List */}
                <div className="flex-1 lg:max-w-md space-y-4">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">
                        أبرز المبتكرين المتفاعلين
                    </h3>
                    <div 
                        className="space-y-4"
                        role="list"
                        aria-label="قائمة أبرز المبتكرين المتفاعلين"
                    >
                        {displayListItems.map((item, index) => (
                            <EngagementListItem
                                key={item.id || index}
                                item={item}
                                index={index}
                            />
                        ))}
                    </div>
                </div>

                {/* Right Section: Monthly Engagement Chart */}
                <div className="flex-1 lg:flex-[1.5]">
                    <div className="bg-white rounded-xl p-4 md:p-6 border border-gray-100">
                        <h3 className="text-lg font-bold text-green-700 mb-4 flex items-center gap-2">
                            <span>متوسط نقاط التفاعل الشهري</span>
                        </h3>
                        <Suspense 
                            fallback={
                                <div 
                                    className="w-full h-64 flex items-center justify-center bg-gray-50 rounded-lg"
                                    role="status"
                                    aria-label="جاري تحميل الرسم البياني"
                                >
                                    <div className="animate-pulse text-gray-400">
                                        جاري التحميل...
                                    </div>
                                </div>
                            }
                        >
                            <EngagementChart data={displayChartData} />
                        </Suspense>
                    </div>
                </div>
            </div>
        </div>
    );
}

/**
 * EngagementListItem Component
 * Individual item in the top engaged innovators list
 */
const EngagementListItem = memo(({ item, index }) => {
    return (
        <div
            className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 p-4 flex items-center gap-4"
            role="listitem"
            aria-label={`${item.name} - نشاط ${item.activity}%`}
        >
            {/* Avatar with Badge */}
            <div className="relative flex-shrink-0">
                {item.image ? (
                    <img
                        src={item.image}
                        alt={`صورة ${item.name}`}
                        className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover border-2 border-gray-100"
                        loading="lazy"
                        onError={(e) => {
                            // Fallback to a placeholder if image fails to load
                            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(item.nameEn || item.name)}&background=3b82f6&color=fff&size=150`;
                        }}
                    />
                ) : (
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xl md:text-2xl font-bold border-2 border-gray-100">
                        {(item.nameEn || item.name || '?').charAt(0).toUpperCase()}
                    </div>
                )}
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center border-2 border-white">
                    <span className="text-xs font-bold text-white">
                        {item.badge || index + 1}
                    </span>
                </div>
            </div>

            {/* Name and Project Info */}
            <div className="flex-1 min-w-0">
                <h4 className="text-base md:text-lg font-bold text-gray-900 mb-1 truncate">
                    {item.name}
                </h4>
                <p className="text-xs md:text-sm text-gray-600 mb-1">
                    {item.project}
                </p>
                <p className="text-xs text-gray-500">
                    {item.date}
                </p>
            </div>

            {/* Activity Percentage */}
            <div className="flex-shrink-0 text-left">
                <div className="text-3xl md:text-4xl font-bold text-blue-600">
                    {item.activity}%
                </div>
                <div className="text-xs text-gray-500 mt-1">
                    متوسط
                </div>
            </div>
        </div>
    );
});

EngagementListItem.displayName = 'EngagementListItem';

// Export memoized component for performance
export default memo(UserEngagementCard);

