import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState, useEffect, useCallback } from 'react';
import {
    FaBell, FaCheck, FaCheckCircle, FaMedal, FaAward, FaTimes, FaCircle,
    FaBellSlash, FaRocket, FaTrophy, FaProjectDiagram, FaBook, FaEnvelope,
    FaTrash, FaEye, FaEyeSlash
} from 'react-icons/fa';
import MobileTopBar from '@/Components/Mobile/MobileTopBar';
import MobileBottomNav from '@/Components/Mobile/MobileBottomNav';
import MobileAppLayout from '@/Layouts/MobileAppLayout';
import DesktopFooter from '@/Components/Mobile/DesktopFooter';

export default function Index({ auth, notifications, unread_count }) {
    const user = auth?.user;
    const isAuthed = !!user;
    const [selectedNotification, setSelectedNotification] = useState(null);
    const [notificationsList, setNotificationsList] = useState(notifications?.data || []);
    const [unreadCount, setUnreadCount] = useState(unread_count || 0);
    const [isLoading, setIsLoading] = useState(false);

    // Update local state when props change
    useEffect(() => {
        setNotificationsList(notifications?.data || []);
        setUnreadCount(unread_count || 0);
    }, [notifications, unread_count]);

    // Real-time notifications listener
    useEffect(() => {
        if (!isAuthed || !window.Echo) return;

        const userId = user?.id;
        if (!userId) return;

        const channelName = `App.Models.User.${userId}`;
        let notificationChannel = null;

        try {
            notificationChannel = window.Echo.private(channelName);

            notificationChannel.listen('.Illuminate\\Notifications\\Events\\BroadcastNotificationCreated', (e) => {                
                if (e.notification) {
                    const newNotification = {
                        id: e.notification.id,
                        type: e.notification.type,
                        data: e.notification.data || {},
                        read_at: null,
                        created_at: new Date().toISOString(),
                        created_at_human: 'الآن',
                    };
                    
                    setNotificationsList(prev => [newNotification, ...prev]);
                    setUnreadCount(prev => prev + 1);
                }
            });
        } catch (error) {
        }

        return () => {
            if (notificationChannel) {
                try {
                    window.Echo.leave(channelName);
                } catch (error) {
                }
            }
        };
    }, [isAuthed, user?.id]);

    // Polling fallback for unread count
    useEffect(() => {
        if (!isAuthed) return;

        const pollUnreadCount = async () => {
            try {
                const response = await fetch('/notifications/unread-count', {
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                });
                const data = await response.json();
                if (data.unread_count !== undefined) {
                    setUnreadCount(data.unread_count);
                }
            } catch (error) {
            }
        };

        // Poll every 30 seconds as fallback
        const interval = setInterval(pollUnreadCount, 30000);
        pollUnreadCount(); // Initial poll

        return () => clearInterval(interval);
    }, [isAuthed]);

    const handleMarkAsRead = useCallback((notificationId) => {
        setIsLoading(true);
        router.post(`/notifications/${notificationId}/read`, {}, {
            preserveScroll: true,
            onSuccess: (page) => {
                setNotificationsList(prev => 
                    prev.map(n => 
                        n.id === notificationId 
                            ? { ...n, read_at: new Date().toISOString() }
                            : n
                    )
                );
                setUnreadCount(prev => Math.max(0, prev - 1));
                setIsLoading(false);
            },
            onError: () => {
                setIsLoading(false);
            },
        });
    }, []);

    const handleMarkAllAsRead = useCallback(() => {
        setIsLoading(true);
        router.post('/notifications/mark-all-read', {}, {
            preserveScroll: true,
            onSuccess: () => {
                setNotificationsList(prev => 
                    prev.map(n => ({ ...n, read_at: n.read_at || new Date().toISOString() }))
                );
                setUnreadCount(0);
                setIsLoading(false);
            },
            onError: () => {
                setIsLoading(false);
            },
        });
    }, []);

    const getNotificationIcon = (type) => {
        const iconClass = "text-lg";
        switch (type) {
            case 'badge_awarded':
            case 'App\\Notifications\\BadgeAwardedNotification':
                return <FaMedal className={`${iconClass} text-orange-500`} />;
            case 'project_evaluated':
            case 'App\\Notifications\\ProjectEvaluatedNotification':
                return <FaCheckCircle className={`${iconClass} text-green-500`} />;
            case 'App\\Notifications\\NewProjectNotification':
                return <FaProjectDiagram className={`${iconClass} text-blue-500`} />;
            case 'App\\Notifications\\NewChallengeNotification':
            case 'App\\Notifications\\ChallengeStatusChangedNotification':
                return <FaTrophy className={`${iconClass} text-yellow-500`} />;
            case 'App\\Notifications\\NewPublicationNotification':
                return <FaBook className={`${iconClass} text-purple-500`} />;
            default:
                return <FaBell className={`${iconClass} text-blue-500`} />;
        }
    };

    const getNotificationColor = (type, isRead) => {
        if (isRead) {
            return 'bg-white border-gray-100';
        }
        
        switch (type) {
            case 'badge_awarded':
            case 'App\\Notifications\\BadgeAwardedNotification':
                return 'bg-orange-50 border-orange-200';
            case 'project_evaluated':
            case 'App\\Notifications\\ProjectEvaluatedNotification':
                return 'bg-green-50 border-green-200';
            case 'App\\Notifications\\NewProjectNotification':
                return 'bg-blue-50 border-blue-200';
            case 'App\\Notifications\\NewChallengeNotification':
            case 'App\\Notifications\\ChallengeStatusChangedNotification':
                return 'bg-yellow-50 border-yellow-200';
            case 'App\\Notifications\\NewPublicationNotification':
                return 'bg-purple-50 border-purple-200';
            default:
                return 'bg-blue-50 border-blue-200';
        }
    };

    const getNotificationLink = (notification) => {
        const data = notification.data || {};
        
        if (data.project_id) {
            return `/projects/${data.project_id}`;
        }
        if (data.challenge_id) {
            return `/challenges/${data.challenge_id}`;
        }
        if (data.publication_id) {
            return `/publications/${data.publication_id}`;
        }
        if (data.badge_id) {
            return '/badges';
        }
        
        return null;
    };

    const NotificationsContent = ({ isDesktop = false }) => {
        const hasNotifications = notificationsList.length > 0;

        if (!hasNotifications) {
            return (
                <div className="bg-white rounded-2xl border border-gray-100 p-8 md:p-12 text-center">
                    <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <FaBellSlash className="text-gray-400 text-3xl" />
                    </div>
                    <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">لا توجد إشعارات</h3>
                    <p className="text-sm md:text-base text-gray-600 mb-6">
                        لم تتلق أي إشعارات بعد. سنقوم بإشعارك عند وجود تحديثات جديدة.
                    </p>
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#A3C042] to-[#93b03a] text-white rounded-xl font-bold text-sm md:text-base hover:opacity-90 transition shadow-lg"
                    >
                        العودة للرئيسية
                        <FaRocket className="text-sm" />
                    </Link>
                </div>
            );
        }

        return (
            <div className="space-y-4 md:space-y-6">
                {/* Header with Mark All Read */}
                {unreadCount > 0 && (
                    <div className="flex items-center justify-between bg-white rounded-2xl border border-gray-100 p-4">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                                <FaBell className="text-red-500 text-sm" />
                            </div>
                            <span className="text-sm font-bold text-gray-900">
                                {unreadCount} إشعار غير مقروء
                            </span>
                        </div>
                        <button
                            type="button"
                            onClick={handleMarkAllAsRead}
                            disabled={isLoading}
                            className="flex items-center gap-2 px-4 py-2 bg-[#A3C042] text-white rounded-xl text-sm font-bold hover:bg-[#93b03a] transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <FaCheckCircle className="text-xs" />
                            تحديد الكل كمقروء
                        </button>
                    </div>
                )}

                {/* Notifications List */}
                <div className="space-y-3">
                    {notificationsList.map((notification) => {
                        const data = notification.data || {};
                        const isRead = notification.read_at !== null;
                        const link = getNotificationLink(notification);
                        const NotificationComponent = (
                            <div
                                className={`rounded-2xl border p-4 transition ${getNotificationColor(notification.type, isRead)} ${!isRead ? 'shadow-sm' : ''} ${link ? 'cursor-pointer hover:shadow-md' : ''}`}
                                onClick={() => {
                                    if (link && !isRead) {
                                        handleMarkAsRead(notification.id);
                                        setTimeout(() => router.visit(link), 300);
                                    } else if (link) {
                                        router.visit(link);
                                    }
                                }}
                            >
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center flex-shrink-0 border border-gray-100">
                                        {getNotificationIcon(notification.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2 mb-1">
                                            <h3 className="text-sm md:text-base font-bold text-gray-900 line-clamp-2">
                                                {data.title || data.message || 'إشعار جديد'}
                                            </h3>
                                            {!isRead && (
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleMarkAsRead(notification.id);
                                                    }}
                                                    className="flex-shrink-0 text-gray-400 hover:text-green-600 transition p-1.5 rounded-lg hover:bg-gray-50"
                                                    aria-label="تحديد كمقروء"
                                                    disabled={isLoading}
                                                >
                                                    <FaCheck className="text-xs" />
                                                </button>
                                            )}
                                        </div>
                                        {data.message && data.message !== data.title && (
                                            <p className="text-xs md:text-sm text-gray-600 mb-2 line-clamp-2">
                                                {data.message}
                                            </p>
                                        )}
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="text-[10px] md:text-xs text-gray-500">
                                                {notification.created_at_human || notification.created_at}
                                            </span>
                                            {!isRead && (
                                                <span className="w-2 h-2 bg-[#A3C042] rounded-full"></span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );

                        if (link) {
                            return (
                                <div key={notification.id}>
                                    {NotificationComponent}
                                </div>
                            );
                        }

                        return (
                            <div key={notification.id}>
                                {NotificationComponent}
                            </div>
                        );
                    })}
                </div>

                {/* Pagination */}
                {notifications?.links && notifications.links.length > 3 && (
                    <div className="bg-white rounded-2xl border border-gray-100 p-4">
                        <div className="flex flex-wrap gap-2 justify-center">
                            {notifications.links.map((link, index) => (
                                <Link
                                    key={index}
                                    href={link.url || '#'}
                                    className={`px-3 py-2 rounded-xl text-xs md:text-sm font-semibold transition ${
                                        link.active
                                            ? 'bg-[#A3C042] text-white'
                                            : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                                    } ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div dir="rtl" className="min-h-screen bg-gray-50">
            <Head title="الإشعارات - إرث المبتكرين" />

            {/* Mobile View */}
            <div className="block md:hidden">
                <MobileAppLayout
                    auth={auth}
                    title="الإشعارات"
                    activeNav="profile"
                    unreadCount={unreadCount}
                    onNotifications={() => router.visit('/notifications')}
                    onBack={() => router.visit('/')}
                >
                    <NotificationsContent isDesktop={false} />
                </MobileAppLayout>
            </div>

            {/* Desktop View */}
            <div className="hidden md:block">
                <MobileTopBar
                    title="الإشعارات"
                    unreadCount={unreadCount}
                    onNotifications={() => router.visit('/notifications')}
                    onBack={() => router.visit('/')}
                    reverseOrder={false}
                    auth={auth}
                />
                <main className="mx-auto w-full max-w-6xl px-4 pb-24 pt-4">
                    <div className="mx-auto w-full max-w-2xl">
                        <NotificationsContent isDesktop={true} />
                    </div>
                </main>
                <MobileBottomNav active="profile" role={user?.role} isAuthed={isAuthed} user={user} />
                <DesktopFooter auth={auth} />
            </div>
        </div>
    );
}

