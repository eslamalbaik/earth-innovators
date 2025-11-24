import { Head, Link, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { useState } from 'react';
import {
    FaBell, FaCheck, FaCheckCircle, FaMedal, FaAward,
    FaTimes, FaCircle
} from 'react-icons/fa';

export default function Index({ auth, notifications, unread_count }) {
    const [selectedNotification, setSelectedNotification] = useState(null);

    const handleMarkAsRead = (notificationId) => {
        router.post(`/notifications/${notificationId}/read`, {}, {
            preserveScroll: true,
            onSuccess: () => {
                router.reload({ only: ['notifications', 'unread_count'] });
            },
        });
    };

    const handleMarkAllAsRead = () => {
        router.post('/notifications/mark-all-read', {}, {
            preserveScroll: true,
            onSuccess: () => {
                router.reload({ only: ['notifications', 'unread_count'] });
            },
        });
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'badge_awarded':
                return <FaMedal className="text-2xl text-orange-500" />;
            default:
                return <FaBell className="text-2xl text-blue-500" />;
        }
    };

    const getNotificationColor = (type) => {
        switch (type) {
            case 'badge_awarded':
                return 'bg-orange-50 border-orange-200';
            default:
                return 'bg-blue-50 border-blue-200';
        }
    };

    return (
        <DashboardLayout header="الإشعارات">
            <Head title="الإشعارات - إرث المبتكرين" />

            <div className="space-y-6">
                {/* رأس الصفحة */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                                <FaBell className="text-legacy-green" />
                                الإشعارات
                            </h2>
                            <p className="text-gray-600 mt-1">
                                {unread_count > 0 ? (
                                    <span className="text-orange-600 font-semibold">
                                        لديك {unread_count} إشعار غير مقروء
                                    </span>
                                ) : (
                                    'لا توجد إشعارات غير مقروءة'
                                )}
                            </p>
                        </div>
                        {unread_count > 0 && (
                            <button
                                onClick={handleMarkAllAsRead}
                                className="bg-legacy-green hover:bg-legacy-blue text-white px-6 py-3 rounded-lg font-medium transition flex items-center gap-2"
                            >
                                <FaCheckCircle />
                                تحديد الكل كمقروء
                            </button>
                        )}
                    </div>
                </div>

                {/* قائمة الإشعارات */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    {notifications.data && notifications.data.length === 0 ? (
                        <div className="text-center py-12">
                            <FaBell className="mx-auto text-6xl text-gray-300 mb-4" />
                            <p className="text-gray-500 text-lg">لا توجد إشعارات</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-200">
                            {notifications.data.map((notification) => {
                                const data = notification.data || {};
                                const isRead = notification.read_at !== null;

                                return (
                                    <div
                                        key={notification.id}
                                        className={`p-6 hover:bg-gray-50 transition ${
                                            !isRead ? getNotificationColor(notification.type) : 'bg-white'
                                        }`}
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className="flex-shrink-0 mt-1">
                                                {getNotificationIcon(notification.type)}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <h3 className={`text-lg font-semibold mb-1 ${
                                                            !isRead ? 'text-gray-900' : 'text-gray-700'
                                                        }`}>
                                                            {data.title || 'إشعار جديد'}
                                                        </h3>
                                                        <p className="text-gray-600 mb-2">
                                                            {data.message || 'لديك إشعار جديد'}
                                                        </p>
                                                        {data.badge_name && (
                                                            <div className="flex items-center gap-2 mt-2">
                                                                <span className="text-2xl">{data.badge_icon || '🏅'}</span>
                                                                <span className="text-sm font-medium text-gray-700">
                                                                    {data.badge_name}
                                                                </span>
                                                            </div>
                                                        )}
                                                        <p className="text-xs text-gray-500 mt-2">
                                                            {notification.created_at_human || notification.created_at}
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        {!isRead && (
                                                            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                                                        )}
                                                        {!isRead && (
                                                            <button
                                                                onClick={() => handleMarkAsRead(notification.id)}
                                                                className="text-gray-400 hover:text-green-600 transition p-2 rounded-lg hover:bg-gray-100"
                                                                title="تحديد كمقروء"
                                                            >
                                                                <FaCheck className="text-sm" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Pagination */}
                    {notifications.links && notifications.links.length > 3 && (
                        <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
                            <div className="flex items-center justify-between">
                                <div className="flex-1 flex justify-between sm:hidden">
                                    {notifications.links[0].url && (
                                        <Link
                                            href={notifications.links[0].url}
                                            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                        >
                                            السابق
                                        </Link>
                                    )}
                                    {notifications.links[notifications.links.length - 1].url && (
                                        <Link
                                            href={notifications.links[notifications.links.length - 1].url}
                                            className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                        >
                                            التالي
                                        </Link>
                                    )}
                                </div>
                                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                    <div>
                                        <p className="text-sm text-gray-700">
                                            عرض <span className="font-medium">{notifications.from}</span> إلى{' '}
                                            <span className="font-medium">{notifications.to}</span> من{' '}
                                            <span className="font-medium">{notifications.total}</span> نتيجة
                                        </p>
                                    </div>
                                    <div>
                                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                            {notifications.links.map((link, index) => (
                                                <Link
                                                    key={index}
                                                    href={link.url || '#'}
                                                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                                        link.active
                                                            ? 'z-10 bg-legacy-green border-legacy-green text-white'
                                                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                                    } ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                                />
                                            ))}
                                        </nav>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}

