import UserEngagementCard from './UserEngagementCard';
import { useTranslation } from '@/i18n';

export function ExampleWithDefaults() {
    return (
        <div className="p-4 md:p-8">
            <UserEngagementCard />
        </div>
    );
}

export function ExampleWithCustomData() {
    const { t } = useTranslation();

    const customListItems = [
        {
            id: 1,
            name: 'Mohammed Ahmed',
            nameEn: 'Mohammed Ahmed',
            activity: 95,
            project: 'Project 420 badges',
            projectEn: 'Project 420 badges',
            date: 'Published on 20/3/2025',
            image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
            badge: 1,
        },
        {
            id: 2,
            name: 'Fatima Ali',
            nameEn: 'Fatima Ali',
            activity: 88,
            project: 'Project 250 badges',
            projectEn: 'Project 250 badges',
            date: 'Published on 18/3/2025',
            image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face',
            badge: 2,
        },
        {
            id: 3,
            name: 'Khalid Saeed',
            nameEn: 'Khalid Saeed',
            activity: 82,
            project: 'Project 180 badges',
            projectEn: 'Project 180 badges',
            date: 'Published on 16/3/2025',
            image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
            badge: 3,
        },
    ];

    const customChartData = [
        { month: t('common.months.january'), value: 80 },
        { month: t('common.months.february'), value: 75 },
        { month: t('common.months.march'), value: 70 },
        { month: t('common.months.april'), value: 78 },
        { month: t('common.months.may'), value: 85 },
        { month: t('common.months.june'), value: 88 },
        { month: t('common.months.july'), value: 90 },
    ];

    return (
        <div className="p-4 md:p-8">
            <UserEngagementCard
                listItems={customListItems}
                chartData={customChartData}
                trendPercentage="+15%"
            />
        </div>
    );
}

export function DashboardExample() {
    const { t, language } = useTranslation();

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8">
            <div className="mx-auto max-w-7xl">
                <h1 className="mb-8 text-3xl font-bold text-gray-900" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                    {t('dashboard.dashboard')}
                </h1>
                <UserEngagementCard />
            </div>
        </div>
    );
}
