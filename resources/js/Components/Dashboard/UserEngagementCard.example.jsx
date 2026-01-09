/**
 * Example Usage of UserEngagementCard Component
 * 
 * This file demonstrates how to use the UserEngagementCard component
 * with custom data or default data.
 */

import UserEngagementCard from './UserEngagementCard';

// Example 1: Using default data (no props needed)
export function ExampleWithDefaults() {
    return (
        <div className="p-4 md:p-8">
            <UserEngagementCard />
        </div>
    );
}

// Example 2: Using custom data
export function ExampleWithCustomData() {
    const customListItems = [
        {
            id: 1,
            name: 'محمد أحمد',
            nameEn: 'Mohammed Ahmed',
            activity: 95,
            project: 'مشروع 420 أوسمة',
            projectEn: 'Project 420 badges',
            date: 'منشور في 20 | 3 | 2025',
            image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
            badge: 1
        },
        {
            id: 2,
            name: 'فاطمة علي',
            nameEn: 'Fatima Ali',
            activity: 88,
            project: 'مشروع 250 أوسمة',
            projectEn: 'Project 250 badges',
            date: 'منشور في 18 | 3 | 2025',
            image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face',
            badge: 2
        },
        {
            id: 3,
            name: 'خالد سعيد',
            nameEn: 'Khalid Saeed',
            activity: 82,
            project: 'مشروع 180 أوسمة',
            projectEn: 'Project 180 badges',
            date: 'منشور في 16 | 3 | 2025',
            image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
            badge: 3
        }
    ];

    const customChartData = [
        { month: 'يناير', value: 80 },
        { month: 'فبراير', value: 75 },
        { month: 'مارس', value: 70 },
        { month: 'أبريل', value: 78 },
        { month: 'مايو', value: 85 },
        { month: 'يونيو', value: 88 },
        { month: 'يوليو', value: 90 }
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

// Example 3: Using in a dashboard page
export function DashboardExample() {
    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-8" dir="rtl">
                    لوحة التحكم
                </h1>
                <UserEngagementCard />
            </div>
        </div>
    );
}

