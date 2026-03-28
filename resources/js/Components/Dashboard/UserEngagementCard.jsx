import { memo, useMemo, lazy, Suspense } from 'react';
import { FaBolt, FaArrowUp } from 'react-icons/fa';
import { useTranslation } from '@/i18n';

const EngagementChart = lazy(() => import('./EngagementChart'));

function UserEngagementCard({
    listItems = [],
    chartData = [],
    trendPercentage = '+12%',
}) {
    const { t, language } = useTranslation();

    const defaultListItems = useMemo(() => [
        {
            id: 1,
            name: t('dashboard.defaultStudent1'),
            nameEn: 'Sara Khalid',
            activity: 98,
            project: t('dashboard.defaultProject1'),
            projectEn: 'Project 315 badges',
            date: t('dashboard.defaultDate1'),
            image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face',
            badge: 1,
        },
        {
            id: 2,
            name: t('dashboard.defaultStudent2'),
            nameEn: 'Lina Omar',
            activity: 91,
            project: t('dashboard.defaultProject2'),
            projectEn: 'Project 114 badges',
            date: t('dashboard.defaultDate2'),
            image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
            badge: 2,
        },
        {
            id: 3,
            name: t('dashboard.defaultStudent3'),
            nameEn: 'Ahmed Mahmoud',
            activity: 85,
            project: t('dashboard.defaultProject3'),
            projectEn: 'Project 213 badges',
            date: t('dashboard.defaultDate3'),
            image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
            badge: 3,
        },
    ], [t]);

    const defaultChartData = useMemo(() => [
        { month: t('common.months.january'), value: 75 },
        { month: t('common.months.february'), value: 70 },
        { month: t('common.months.march'), value: 65 },
        { month: t('common.months.april'), value: 68 },
        { month: t('common.months.may'), value: 75 },
        { month: t('common.months.june'), value: 78 },
        { month: t('common.months.july'), value: 80 },
    ], [t]);

    const displayListItems = useMemo(
        () => (listItems.length > 0 ? listItems : defaultListItems),
        [listItems, defaultListItems],
    );

    const displayChartData = useMemo(
        () => (chartData.length > 0 ? chartData : defaultChartData),
        [chartData, defaultChartData],
    );

    return (
        <div
            dir={language === 'ar' ? 'rtl' : 'ltr'}
            className="w-full rounded-2xl border border-gray-100 bg-white p-6 shadow-lg md:p-8"
            role="region"
            aria-label={t('dashboard.studentEngagementAnalytics')}
        >
            <div className="mb-6">
                <div className="mb-2 flex items-center gap-3">
                    <FaBolt className="text-2xl text-blue-600 md:text-3xl" aria-hidden="true" />
                    <h2 className="text-2xl font-bold text-gray-900 md:text-3xl">
                        {t('dashboard.studentEngagement')}
                    </h2>
                </div>
                <p className="ms-10 text-sm text-gray-600 md:text-base">
                    {t('dashboard.engagementDescription')}
                </p>
            </div>

            <div className="mb-6 flex items-center justify-center md:justify-start">
                <div className="inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-4 py-2">
                    <span className="text-sm font-semibold text-gray-700">
                        {t('dashboard.bestPositiveEngagement')}
                    </span>
                    <div className="flex items-center gap-1 rounded-full bg-green-100 px-3 py-1">
                        <FaArrowUp className="text-xs text-green-600" aria-hidden="true" />
                        <span className="text-sm font-bold text-green-700">
                            {trendPercentage}
                        </span>
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-6 md:flex-row-reverse md:gap-8">
                <div className="flex-1 space-y-4 lg:max-w-md">
                    <h3 className="mb-4 text-lg font-bold text-gray-900">
                        {t('dashboard.topEngagedInnovators')}
                    </h3>
                    <div
                        className="space-y-4"
                        role="list"
                        aria-label={t('dashboard.topInnovatorsList')}
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

                <div className="flex-1 lg:flex-[1.5]">
                    <div className="rounded-xl border border-gray-100 bg-white p-4 md:p-6">
                        <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-green-700">
                            <span>{t('dashboard.monthlyAvgEngagementPoints')}</span>
                        </h3>
                        <Suspense
                            fallback={(
                                <div
                                    className="flex h-64 w-full items-center justify-center rounded-lg bg-gray-50"
                                    role="status"
                                    aria-label={t('common.loading')}
                                >
                                    <div className="animate-pulse text-gray-400">
                                        {t('common.loading')}
                                    </div>
                                </div>
                            )}
                        >
                            <EngagementChart data={displayChartData} />
                        </Suspense>
                    </div>
                </div>
            </div>
        </div>
    );
}

const EngagementListItem = memo(({ item, index }) => {
    const { t } = useTranslation();

    return (
        <div
            className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-shadow duration-200 hover:shadow-md"
            role="listitem"
            aria-label={t('dashboard.activityAriaLabel', { name: item.name, activity: item.activity })}
        >
            <div className="relative flex-shrink-0">
                {item.image ? (
                    <img
                        src={item.image}
                        alt={t('dashboard.userImageAlt', { name: item.name })}
                        className="h-16 w-16 rounded-full border-2 border-gray-100 object-cover md:h-20 md:w-20"
                        loading="lazy"
                        onError={(e) => {
                            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(item.nameEn || item.name)}&background=3b82f6&color=fff&size=150`;
                        }}
                    />
                ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-gray-100 bg-gradient-to-br from-blue-500 to-blue-600 text-xl font-bold text-white md:h-20 md:w-20 md:text-2xl">
                        {(item.nameEn || item.name || '?').charAt(0).toUpperCase()}
                    </div>
                )}
                <div className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-orange-500">
                    <span className="text-xs font-bold text-white">
                        {item.badge || index + 1}
                    </span>
                </div>
            </div>

            <div className="min-w-0 flex-1">
                <h4 className="mb-1 truncate text-base font-bold text-gray-900 md:text-lg">
                    {item.name}
                </h4>
                <p className="mb-1 text-xs text-gray-600 md:text-sm">
                    {item.project}
                </p>
                <p className="text-xs text-gray-500">
                    {item.date}
                </p>
            </div>

            <div className="flex-shrink-0 text-left">
                <div className="text-3xl font-bold text-blue-600 md:text-4xl">
                    {item.activity}%
                </div>
                <div className="mt-1 text-xs text-gray-500">
                    {t('dashboard.average')}
                </div>
            </div>
        </div>
    );
});

EngagementListItem.displayName = 'EngagementListItem';

export default memo(UserEngagementCard);
