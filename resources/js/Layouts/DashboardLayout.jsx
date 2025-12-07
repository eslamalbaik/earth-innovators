import { useState, useEffect, useRef } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import axios from 'axios';
import {
    FaBars, FaTimes, FaHome, FaUsers, FaBookOpen,
    FaCalendar, FaChartLine, FaUser, FaCog, FaSignOutAlt,
    FaGraduationCap, FaCommentDots, FaTachometerAlt, FaBell, FaBook,
    FaChevronDown, FaCreditCard, FaTrophy, FaProjectDiagram, FaMedal, FaFile
} from 'react-icons/fa';
import ApplicationLogo from '@/Components/ApplicationLogo';
import SidebarItem from '@/Components/SidebarItem';
import SidebarSubMenu from '@/Components/SidebarSubMenu';
import { getUserImageUrl, getInitials, getColorFromName } from '@/utils/imageUtils';
import { useToast } from '@/Contexts/ToastContext';

export default function DashboardLayout({ children, header }) {
    const { auth } = usePage().props;
    const { showInfo } = useToast();
    const [sidebarOpen, setSidebarOpen] = useState(() => {
        if (typeof window !== 'undefined') {
            return window.innerWidth >= 1100;
        }
        return true;
    });
    const [userDropdownOpen, setUserDropdownOpen] = useState(false);
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const dropdownRef = useRef(null);
    const notificationsRef = useRef(null);
    const previousDashboardDataRef = useRef(null);

    const getUserImage = () => {
        if (auth?.user?.image) {
            return auth.user.image;
        }
        if (auth?.user?.role === 'teacher' && auth?.user?.teacher?.image) {
            return auth.user.teacher.image;
        }
        return null;
    };

    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

    // جلب الإشعارات وإعداد Real-time listeners
    useEffect(() => {
        if (auth?.user) {
            fetchNotifications();
            
            // إعداد Real-time notifications باستخدام Echo (Redis + Laravel Echo Server)
            let notificationChannel = null;
            let pollingInterval = null;
            let reconnectAttempts = 0;
            const maxReconnectAttempts = 5;
            
            const setupEchoListener = () => {
                if (window.Echo) {
                    try {
                        const userId = auth.user.id;
                        const channelName = `App.Models.User.${userId}`;
                        
                        // Only log in development mode
                        if (import.meta.env.DEV) {
                            console.log('🔌 Setting up Echo listener for user:', userId);
                        }
                        
                        // الاستماع للإشعارات الجديدة
                        notificationChannel = window.Echo.private(channelName);
                        
                        // Laravel يرسل الإشعارات عبر event: Illuminate\Notifications\Events\BroadcastNotificationCreated
                        notificationChannel.listen('.Illuminate\\Notifications\\Events\\BroadcastNotificationCreated', (e) => {
                            console.log('📬 New notification received via Echo:', e);
                            
                            try {
                                // Laravel يرسل البيانات في هيكل محدد
                                const notification = {
                                    id: e.id || `notif_${Date.now()}_${Math.random()}`,
                                    type: e.type || 'notification',
                                    data: e.data || {},
                                    read_at: e.read_at || null,
                                    created_at: e.created_at || new Date().toISOString(),
                                    created_at_human: e.created_at 
                                        ? new Date(e.created_at).toLocaleString('ar-SA', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })
                                        : new Date().toLocaleString('ar-SA', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        }),
                                };
                                
                                console.log('✅ Processed notification:', notification);
                                
                                setNotifications(prev => {
                                    // تجنب الإشعارات المكررة
                                    const exists = prev.find(n => n.id === notification.id);
                                    if (exists) {
                                        console.log('⚠️ Notification already exists, skipping:', notification.id);
                                        return prev;
                                    }
                                    console.log('➕ Adding new notification to list');
                                    return [notification, ...prev];
                                });
                                
                                setUnreadCount(prev => {
                                    const newCount = prev + 1;
                                    console.log('📊 Unread count updated:', newCount);
                                    return newCount;
                                });
                                
                                // إعادة جلب الإشعارات للتأكد من التزامن مع قاعدة البيانات
                                setTimeout(() => {
                                    console.log('🔄 Refreshing notifications from server...');
                                    fetchNotifications();
                                }, 500);
                            } catch (error) {
                                console.error('❌ Error processing notification:', error);
                                // إعادة جلب الإشعارات في حالة الخطأ
                                fetchNotifications();
                            }
                        });
                        
                        // معالجة الأخطاء في الاتصال
                        notificationChannel.error((error) => {
                            console.error('❌ Echo channel error:', error);
                            reconnectAttempts++;
                            
                            if (reconnectAttempts < maxReconnectAttempts) {
                                console.log(`🔄 Attempting to reconnect (${reconnectAttempts}/${maxReconnectAttempts})...`);
                                setTimeout(setupEchoListener, 2000 * reconnectAttempts);
                            } else {
                                console.warn('⚠️ Max reconnection attempts reached, falling back to polling');
                                // Fallback to polling on error
                                if (pollingInterval) {
                                    clearInterval(pollingInterval);
                                }
                                pollingInterval = setInterval(fetchNotifications, 10000); // Poll every 10 seconds
                            }
                        });
                        
                        // Connection status listeners
                        if (window.Echo.connector && window.Echo.connector.socket) {
                            window.Echo.connector.socket.on('connect', () => {
                                console.log('✅ Echo connected successfully');
                                reconnectAttempts = 0; // Reset on successful connection
                            });
                            
                            window.Echo.connector.socket.on('disconnect', () => {
                                console.warn('⚠️ Echo disconnected');
                                reconnectAttempts++;
                                if (reconnectAttempts < maxReconnectAttempts) {
                                    setTimeout(setupEchoListener, 2000 * reconnectAttempts);
                                }
                            });
                        }
                        
                        // Only log in development mode
                        if (import.meta.env.DEV) {
                            console.log('✅ Echo notification listener initialized for user:', userId, 'on channel:', channelName);
                        }
                        reconnectAttempts = 0; // Reset on successful setup
                    } catch (error) {
                        console.error('❌ Error setting up Echo listener:', error);
                        reconnectAttempts++;
                        if (reconnectAttempts < maxReconnectAttempts) {
                            setTimeout(setupEchoListener, 2000 * reconnectAttempts);
                        } else {
                            // Fallback to polling
                            pollingInterval = setInterval(fetchNotifications, 10000);
                        }
                    }
                } else {
                    // Fallback: تحديث الإشعارات كل 10 ثوانٍ إذا لم يكن Echo متاحاً
                    console.warn('⚠️ Echo not available, using polling for notifications');
                    pollingInterval = setInterval(fetchNotifications, 10000);
                }
            };
            
            // Initial setup
            setupEchoListener();
            
            // تنظيف عند إلغاء التحميل
            return () => {
                if (notificationChannel && window.Echo) {
                    try {
                        const channelName = `App.Models.User.${auth.user.id}`;
                        notificationChannel.stopListening('.Illuminate\\Notifications\\Events\\BroadcastNotificationCreated');
                        window.Echo.leave(channelName);
                        // Only log in development mode
                        if (import.meta.env.DEV) {
                            console.log('👋 Left Echo channel:', channelName);
                        }
                    } catch (error) {
                        console.error('❌ Error leaving Echo channel:', error);
                    }
                }
                if (pollingInterval) {
                    clearInterval(pollingInterval);
                }
            };
        }
    }, [auth?.user]);

    const fetchNotifications = async () => {
        try {
            const response = await axios.get('/notifications');
            setNotifications(response.data.notifications || []);
            setUnreadCount(response.data.unread_count || 0);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    const markAsRead = async (notificationId) => {
        try {
            await axios.post(`/notifications/${notificationId}/read`);
            fetchNotifications();
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await axios.post('/notifications/mark-all-read');
            fetchNotifications();
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setUserDropdownOpen(false);
            }
            if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
                setNotificationsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    useEffect(() => {
        const handleResize = () => {
            setSidebarOpen(window.innerWidth >= 1100);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Get current URL from Inertia page props
    const { url } = usePage();
    const pageProps = usePage().props;

    // Detect dashboard changes and show toast notifications
    useEffect(() => {
        const currentUrl = url || window.location.pathname;
        
        // Only track changes on dashboard pages
        const isDashboardPage = currentUrl.includes('/dashboard') || 
                               currentUrl.includes('/teacher/dashboard') ||
                               currentUrl.includes('/student/dashboard') ||
                               currentUrl.includes('/school/dashboard');
        
        if (!isDashboardPage) {
            previousDashboardDataRef.current = null;
            return;
        }

        // Get current dashboard data
        const currentData = {
            url: currentUrl,
            stats: pageProps.stats || {},
            teacher: pageProps.teacher || null,
            auth: pageProps.auth || {},
            timestamp: Date.now(),
        };

        // Compare with previous data
        const previousData = previousDashboardDataRef.current;
        
        // Determine dashboard type
        let dashboardType = 'لوحة التحكم';
        if (currentUrl.includes('/teacher')) {
            dashboardType = 'لوحة تحكم المعلم';
        } else if (currentUrl.includes('/student')) {
            dashboardType = 'لوحة تحكم الطالب';
        } else if (currentUrl.includes('/school')) {
            dashboardType = 'لوحة تحكم المدرسة';
        }

        // If this is the first time on this dashboard, don't show toast
        if (!previousData) {
            previousDashboardDataRef.current = currentData;
            return;
        }

        // If URL changed (navigated to different dashboard), show toast
        if (previousData.url !== currentData.url) {
            showInfo('تم تحميل البيانات', {
                title: `${dashboardType}`,
                message: 'تم تحميل معلومات لوحة التحكم بنجاح',
                autoDismiss: 5000,
            });
            previousDashboardDataRef.current = currentData;
            return;
        }

        // Same URL - check for data changes
        if (previousData.url === currentData.url) {
            // Check for changes in stats (deep comparison of key values)
            const statsChanged = JSON.stringify(previousData.stats) !== JSON.stringify(currentData.stats);
            const teacherChanged = JSON.stringify(previousData.teacher) !== JSON.stringify(currentData.teacher);
            
            // Only show toast if there's a meaningful change (not just timestamp)
            if (statsChanged || teacherChanged) {
                showInfo('تم تحديث البيانات', {
                    title: `تحديث ${dashboardType}`,
                    message: 'تم تحديث معلومات لوحة التحكم بنجاح',
                    autoDismiss: 5000,
                });
            }
        }

        // Update previous data
        previousDashboardDataRef.current = currentData;
    }, [url, pageProps, showInfo]);

    /**
     * Check if a route is active
     * Handles exact matches and path prefixes for better UX
     */
    const isRouteActive = (href, currentUrl) => {
        if (currentUrl === href) {
            return true;
        }
        // For dashboard routes, only match exact
        if (href.includes('/dashboard')) {
            return currentUrl === href;
        }
        // For other routes, match if current URL starts with the href
        // But exclude parent routes when on child routes
        if (currentUrl.startsWith(href)) {
            // Special handling for create routes - only match exact
            if (href.includes('/create')) {
                return currentUrl === href;
            }
            // For pending routes, match exact or if it's the parent
            if (href.includes('/pending')) {
                return currentUrl === href || currentUrl === href.replace('/pending', '');
            }
            return true;
        }
        return false;
    };

    const navigation = {
        admin: [
            { name: 'لوحة التحكم', href: '/admin/dashboard', icon: FaTachometerAlt },
            { name: 'الإحصائيات', href: '/admin/statistics', icon: FaChartLine },
            { name: 'المشاريع', href: '/admin/projects', icon: FaBook },
            { name: 'تسليمات المشاريع', href: '/admin/submissions', icon: FaFile },
            { name: 'التحديات', href: '/admin/challenges', icon: FaCalendar },
            { name: 'المستخدمون', href: '/admin/users', icon: FaUsers },
            { name: 'الشارات', href: '/admin/badges', icon: FaCommentDots },
            { name: 'الباقات', href: '/admin/packages', icon: FaCreditCard },
            { name: 'الشهادات', href: '/admin/certificates', icon: FaGraduationCap },
            { name: 'الملف الشخصي', href: '/profile', icon: FaUser },
        ],
        teacher: [
            { name: 'لوحة التحكم', href: '/teacher/dashboard', icon: FaTachometerAlt },
            {
                name: 'المشاريع',
                href: '/teacher/projects',
                icon: FaProjectDiagram,
                subItems: [
                    { name: 'تسليمات المشاريع', href: '/teacher/submissions', icon: FaFile },
                    { name: 'مراجعة المشاريع', href: '/teacher/projects', icon: FaBookOpen },
                    { name: 'مشاريعي', href: '/teacher/projects', icon: FaProjectDiagram },
                    { name: 'إنشاء مشروع', href: '/teacher/projects/create', icon: FaProjectDiagram },
                ]
            },
            {
                name: 'التحديات',
                href: '/teacher/challenges',
                icon: FaCalendar,
                subItems: [
                    { name: 'تسليمات التحديات', href: '/teacher/challenge-submissions', icon: FaFile },
                    { name: 'مراجعة التحديات', href: '/teacher/challenge-submissions?status=submitted', icon: FaBookOpen },
                    { name: 'تحدياتي', href: '/teacher/challenges', icon: FaCalendar },
                    { name: 'إنشاء تحدّي', href: '/teacher/challenges/create', icon: FaCalendar },
                ]
            },
            { name: 'مقالاتي', href: '/teacher/publications', icon: FaBook },
            { name: 'إنشاء مقال', href: '/teacher/publications/create', icon: FaBook },
            { name: 'الطلاب المتابعون', href: '/teacher/students', icon: FaGraduationCap },
            { name: 'شاراتي', href: '/teacher/badges', icon: FaMedal },
            { name: 'إرسال شارة', href: '/teacher/badges/create', icon: FaCommentDots },
            { name: 'الملف الشخصي', href: '/teacher/profile', icon: FaUser },
        ],
        school: [
            { name: 'لوحة التحكم', href: '/school/dashboard', icon: FaTachometerAlt },
            {
                name: 'المشاريع',
                href: '/school/projects',
                icon: FaProjectDiagram,
                subItems: [
                    { name: 'تسليمات المشاريع', href: '/school/submissions', icon: FaFile },
                    { name: 'مراجعة المشاريع', href: '/school/projects/pending', icon: FaBookOpen },
                    { name: 'مشاريع المدرسة', href: '/school/projects', icon: FaProjectDiagram },
                    { name: 'إنشاء مشروع', href: '/school/projects/create', icon: FaProjectDiagram },
                ]
            },
            { name: 'مراجعة الشارات', href: '/school/badges/pending', icon: FaMedal },
            { name: 'الشارات المرسلة', href: '/school/badges', icon: FaCommentDots },
            { name: 'مراجعة مقالات المجلة', href: '/school/publications/pending', icon: FaBookOpen },
            { name: 'مقالات المدرسة', href: '/school/publications', icon: FaBook },
            { name: 'إنشاء مقال', href: '/school/publications/create', icon: FaBook },
            {
                name: 'التحديات',
                href: '/school/challenges',
                icon: FaCalendar,
                subItems: [
                    { name: 'تسليمات التحديات', href: '/school/challenge-submissions', icon: FaFile },
                    { name: 'مراجعة التحديات', href: '/school/challenge-submissions?status=submitted', icon: FaBookOpen },
                    { name: 'تحديات المدرسة', href: '/school/challenges', icon: FaCalendar },
                    { name: 'إنشاء تحدّي', href: '/school/challenges/create', icon: FaCalendar },
                ]
            },
            { name: 'الطلاب', href: '/school/students', icon: FaGraduationCap },
            { name: 'الترتيب والشارات', href: '/school/ranking', icon: FaTrophy },
            { name: 'الإحصائيات', href: '/school/statistics', icon: FaChartLine },
            { name: 'الملف الشخصي', href: '/profile', icon: FaUser },
        ],
        student: [
            { name: 'لوحة التحكم', href: '/student/dashboard', icon: FaTachometerAlt },
            { name: 'مشاريعي', href: '/student/projects', icon: FaBook },
            { name: 'التحديات', href: '/student/challenges', icon: FaCalendar },
            { name: 'الشارات', href: '/student/badges', icon: FaCommentDots },
            { name: 'النقاط', href: '/student/points', icon: FaChartLine },
            { name: 'الباقات', href: '/packages', icon: FaCreditCard },
            { name: 'الملف الشخصي', href: '/profile', icon: FaUser },
        ]
    };

    const currentNavigation = navigation[auth.user?.role] || navigation.student;

    return (
        <div dir="rtl" className="min-h-screen bg-gray-100">
            <aside
                className={`fixed top-0 right-0 z-40 h-screen transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'
                    } ${sidebarOpen ? 'w-64' : 'w-0'} bg-white shadow-lg`}
            >
                {/* Logo */}
                <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
                    <div className="w-full flex justify-center items-center gap-3">
                        <Link href="/">
                            <ApplicationLogo className="block h-9 w-auto fill-current text-gray-800 dark:text-gray-200" />
                        </Link>
                    </div>
                    {sidebarOpen && (
                        <button
                            onClick={toggleSidebar}
                            className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
                        >
                            <FaTimes className="text-gray-600" />
                        </button>
                    )}
                </div>

                <div className="flex flex-col justify-between h-[calc(100vh-64px)]">
                    {sidebarOpen && (
                        <nav className="px-4 py-6 space-y-1 overflow-y-auto">
                            {currentNavigation.map((item) => {
                                const isActive = isRouteActive(item.href, url);

                                // Check if item has subItems (submenu)
                                if (item.subItems && item.subItems.length > 0) {
                                    return (
                                        <SidebarSubMenu
                                            key={item.name}
                                            item={item}
                                            isActive={isActive}
                                            currentUrl={url}
                                            onSubItemClick={() => {
                                                // Close sidebar on mobile after navigation
                                                if (window.innerWidth < 1100) {
                                                    setSidebarOpen(false);
                                                }
                                            }}
                                        />
                                    );
                                }

                                // Regular menu item
                                return (
                                    <SidebarItem
                                        key={item.name}
                                        item={item}
                                        isActive={isActive}
                                        onClick={() => {
                                            // Close sidebar on mobile after navigation
                                            if (window.innerWidth < 1100) {
                                                setSidebarOpen(false);
                                            }
                                        }}
                                    />
                                );
                            })}
                        </nav>
                    )}

                    <div>
                        {sidebarOpen && (
                            <div className="px-3 py-2 border-t border-gray-200">
                                <div className="flex justify-start items-center gap-3">
                                    {getUserImage() ? (
                                        <img
                                            src={getUserImage()}
                                            alt={auth.user?.name}
                                            className="w-10 h-10 rounded-full object-cover border-2 border-legacy-green"
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                                const fallback = e.target.nextElementSibling;
                                                if (fallback) fallback.style.display = 'flex';
                                            }}
                                            key={getUserImage()}
                                        />
                                    ) : null}
                                    <div
                                        className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${getUserImage() ? 'hidden' : ''}`}
                                        style={{
                                            background: `linear-gradient(135deg, ${getColorFromName(auth.user?.name || 'User')})`
                                        }}
                                    >
                                        {getInitials(auth.user?.name || 'User')}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-semibold text-gray-900">{auth.user?.name}</p>
                                        <p className="text-xs text-gray-500">
                                            {auth.user?.role === 'admin' && 'أدمن'}
                                            {auth.user?.role === 'teacher' && 'معلم'}
                                            {auth.user?.role === 'student' && 'طالب'}
                                            {auth.user?.role === 'school' && 'مدرسة'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </aside>

            <div className={`transition-all duration-300 ${sidebarOpen ? 'mr-64' : 'mr-0'}`}>
                <header className="bg-white shadow-sm sticky top-0 z-30">
                    <div className="flex items-center justify-between px-6 py-2">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={toggleSidebar}
                                className="p-2 rounded-lg hover:bg-gray-100 transition"
                            >
                                <FaBars className="text-gray-600" />
                            </button>
                            {header && (
                                <div className="text-xl font-bold text-gray-900">{header}</div>
                            )}
                        </div>

                        <div className="flex items-center gap-4">
                            {/* صندوق الإشعارات */}
                            {(auth?.user?.role === 'student' || auth?.user?.role === 'teacher' || auth?.user?.role === 'school') && (
                                <div className="relative" ref={notificationsRef}>
                                    <button
                                        onClick={() => setNotificationsOpen(!notificationsOpen)}
                                        className="relative p-2 rounded-lg hover:bg-gray-100 transition"
                                    >
                                        <FaBell className="text-gray-600 text-xl" />
                                        {unreadCount > 0 && (
                                            <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                                                {unreadCount > 9 ? '9+' : unreadCount}
                                            </span>
                                        )}
                                    </button>

                                    {notificationsOpen && (
                                        <div className="absolute left-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-hidden flex flex-col">
                                            <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
                                                <h3 className="font-bold text-gray-900">الإشعارات</h3>
                                                {unreadCount > 0 && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            markAllAsRead();
                                                        }}
                                                        className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                                                    >
                                                        تحديد الكل كمقروء
                                                    </button>
                                                )}
                                            </div>
                                            <div className="overflow-y-auto flex-1" style={{ maxHeight: '400px' }}>
                                                {notifications.length > 0 ? (
                                                    <div className="divide-y divide-gray-100">
                                                        {notifications.map((notification) => (
                                                            <div
                                                                key={notification.id}
                                                                className={`px-4 py-3 hover:bg-gray-50 transition cursor-pointer border-r-4 ${
                                                                    !notification.read_at 
                                                                        ? 'bg-blue-50 border-blue-400' 
                                                                        : 'border-transparent'
                                                                }`}
                                                                onClick={() => {
                                                                    if (!notification.read_at) {
                                                                        markAsRead(notification.id);
                                                                    }
                                                                    // التنقل إلى رابط الإشعار إذا كان موجوداً
                                                                    let actionUrl = notification.data?.action_url || 
                                                                                   notification.data?.actions?.[0]?.url ||
                                                                                   null;
                                                                    
                                                                    // إذا لم يكن هناك action_url، قم ببناء URL بناءً على البيانات المتاحة
                                                                    if (!actionUrl) {
                                                                        const userRole = auth?.user?.role || 'student';
                                                                        
                                                                        if (notification.data?.challenge_id) {
                                                                            // بناء URL التحدي بناءً على role المستخدم
                                                                            if (userRole === 'student') {
                                                                                actionUrl = `/student/challenges/${notification.data.challenge_id}`;
                                                                            } else if (userRole === 'teacher') {
                                                                                actionUrl = `/teacher/challenge-submissions?challenge_id=${notification.data.challenge_id}`;
                                                                            } else if (userRole === 'school') {
                                                                                actionUrl = `/school/challenges/${notification.data.challenge_id}`;
                                                                            } else {
                                                                                actionUrl = `/student/challenges/${notification.data.challenge_id}`;
                                                                            }
                                                                        } else if (notification.data?.project_id) {
                                                                            // بناء URL المشروع بناءً على role المستخدم
                                                                            if (userRole === 'student') {
                                                                                actionUrl = `/student/projects/${notification.data.project_id}`;
                                                                            } else if (userRole === 'teacher') {
                                                                                actionUrl = `/teacher/projects/${notification.data.project_id}`;
                                                                            } else if (userRole === 'school') {
                                                                                actionUrl = `/school/projects/${notification.data.project_id}`;
                                                                            } else {
                                                                                actionUrl = `/student/projects/${notification.data.project_id}`;
                                                                            }
                                                                        } else if (notification.data?.publication_id) {
                                                                            actionUrl = `/publications/${notification.data.publication_id}`;
                                                                        } else if (notification.data?.submission_id) {
                                                                            // بناء URL التسليم بناءً على role المستخدم
                                                                            if (userRole === 'student') {
                                                                                // للطلاب، اذهب إلى صفحة التحدي
                                                                                if (notification.data?.challenge_id) {
                                                                                    actionUrl = `/student/challenges/${notification.data.challenge_id}`;
                                                                                }
                                                                            } else if (userRole === 'teacher') {
                                                                                actionUrl = `/teacher/challenge-submissions/${notification.data.submission_id}`;
                                                                            } else if (userRole === 'school') {
                                                                                actionUrl = `/school/challenge-submissions/${notification.data.submission_id}`;
                                                                            }
                                                                        }
                                                                    }
                                                                    
                                                                    // تنظيف URL من أي متغيرات غير مستبدلة
                                                                    if (actionUrl && typeof actionUrl === 'string') {
                                                                        // إزالة أي {variable} غير مستبدلة
                                                                        actionUrl = actionUrl.replace(/\{[^}]+\}/g, '');
                                                                        
                                                                        // إذا كان هناك challenge_id في البيانات والـ URL يحتوي على placeholder، استبدله
                                                                        if (notification.data?.challenge_id && actionUrl.includes('/challenges/') && actionUrl.includes('{')) {
                                                                            actionUrl = actionUrl.replace(/\{[^}]+\}/, notification.data.challenge_id);
                                                                        }
                                                                        
                                                                        // إذا كان هناك project_id في البيانات والـ URL يحتوي على placeholder، استبدله
                                                                        if (notification.data?.project_id && actionUrl.includes('/projects/') && actionUrl.includes('{')) {
                                                                            actionUrl = actionUrl.replace(/\{[^}]+\}/, notification.data.project_id);
                                                                        }
                                                                        
                                                                        // إذا كان هناك submission_id في البيانات والـ URL يحتوي على placeholder، استبدله
                                                                        if (notification.data?.submission_id && actionUrl.includes('/submissions/') && actionUrl.includes('{')) {
                                                                            actionUrl = actionUrl.replace(/\{[^}]+\}/, notification.data.submission_id);
                                                                        }
                                                                        
                                                                        console.log('🔗 Navigating to:', actionUrl, 'from notification:', notification);
                                                                    }
                                                                    
                                                                    if (actionUrl && actionUrl.trim() !== '' && !actionUrl.includes('{')) {
                                                                        router.visit(actionUrl);
                                                                        setNotificationsOpen(false);
                                                                    } else {
                                                                        console.warn('⚠️ No valid action URL found for notification:', notification, 'actionUrl:', actionUrl);
                                                                    }
                                                                }}
                                                            >
                                                                <div className="flex items-start gap-2">
                                                                    {!notification.read_at && (
                                                                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                                                                    )}
                                                                    <div className="flex-1 min-w-0">
                                                                        <p className="text-sm text-gray-900 font-medium mb-1">
                                                                            {notification.data?.title || 
                                                                             notification.data?.message_ar || 
                                                                             notification.data?.message || 
                                                                             notification.data?.body ||
                                                                             'إشعار جديد'}
                                                                        </p>
                                                                        {(notification.data?.message || notification.data?.body) && 
                                                                         notification.data?.title && (
                                                                            <p className="text-xs text-gray-600 mb-1">
                                                                                {notification.data?.message || notification.data?.body}
                                                                            </p>
                                                                        )}
                                                                        {notification.data?.project_title && (
                                                                            <p className="text-xs text-gray-600 mb-1">
                                                                                المشروع: {notification.data.project_title}
                                                                            </p>
                                                                        )}
                                                                        {notification.data?.challenge_title && (
                                                                            <p className="text-xs text-gray-600 mb-1">
                                                                                التحدي: {notification.data.challenge_title}
                                                                            </p>
                                                                        )}
                                                                        {notification.data?.publication_title && (
                                                                            <p className="text-xs text-gray-600 mb-1">
                                                                                المقال: {notification.data.publication_title}
                                                                            </p>
                                                                        )}
                                                                        {notification.data?.rating && (
                                                                            <div className="flex items-center gap-1 mb-1">
                                                                                {[1, 2, 3, 4, 5].map((star) => (
                                                                                    <span
                                                                                        key={star}
                                                                                        className={`text-xs ${
                                                                                            star <= notification.data.rating
                                                                                                ? 'text-yellow-400'
                                                                                                : 'text-gray-300'
                                                                                        }`}
                                                                                    >
                                                                                        ★
                                                                                    </span>
                                                                                ))}
                                                                                <span className="text-xs text-gray-600 mr-1">
                                                                                    ({notification.data.rating}/5)
                                                                                </span>
                                                                            </div>
                                                                        )}
                                                                        <p className="text-xs text-gray-500">
                                                                            {notification.created_at_human || 
                                                                             (notification.created_at ? new Date(notification.created_at).toLocaleString('ar-SA', {
                                                                                 year: 'numeric',
                                                                                 month: 'short',
                                                                                 day: 'numeric',
                                                                                 hour: '2-digit',
                                                                                 minute: '2-digit'
                                                                             }) : '')}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="px-4 py-8 text-center text-gray-500">
                                                        لا توجد إشعارات
                                                    </div>
                                                )}
                                            </div>
                                            {notifications.length > 0 && (
                                                <div className="px-4 py-2 border-t border-gray-200 bg-gray-50">
                                                    <Link
                                                        href="/notifications"
                                                        className="text-sm text-blue-600 hover:text-blue-700 font-medium block text-center"
                                                        onClick={() => setNotificationsOpen(false)}
                                                    >
                                                        عرض جميع الإشعارات
                                                    </Link>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="relative" ref={dropdownRef}>
                                <button
                                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                                    className="flex items-center gap-3 hover:bg-gray-50 rounded-lg p-2 transition"
                                >
                                    {getUserImage() ? (
                                        <img
                                            src={getUserImage()}
                                            alt={auth.user?.name}
                                            className="w-8 h-8 rounded-full object-cover border-2 border-legacy-green"
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                                const fallback = e.target.nextElementSibling;
                                                if (fallback) fallback.style.display = 'flex';
                                            }}
                                            key={getUserImage()}
                                        />
                                    ) : null}
                                    <div
                                        className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${getUserImage() ? 'hidden' : ''}`}
                                        style={{
                                            background: `linear-gradient(135deg, ${getColorFromName(auth.user?.name || 'User')})`
                                        }}
                                    >
                                        {getInitials(auth.user?.name || 'User')}
                                    </div>
                                    <div className="text-start hidden md:block pe-3">
                                        <p className="text-sm font-semibold text-gray-900">{auth.user?.name}</p>
                                        <p className="text-xs text-gray-500">
                                            {auth.user?.role === 'admin' && 'أدمن'}
                                            {auth.user?.role === 'teacher' && 'معلم'}
                                            {auth.user?.role === 'student' && 'طالب'}
                                            {auth.user?.role === 'school' && 'مدرسة'}
                                        </p>
                                    </div>
                                    <FaChevronDown className={`text-gray-400 text-xs transition-transform ${userDropdownOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {userDropdownOpen && (
                                    <div className="absolute left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                                        <div className="py-2">
                                            <Link
                                                href={auth?.user?.role === 'teacher' ? '/teacher/profile' : '/profile'}
                                                className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
                                                onClick={() => setUserDropdownOpen(false)}
                                            >
                                                <FaUser className="text-gray-400" />
                                                الملف الشخصي
                                            </Link>
                                            <hr className="my-1" />
                                            {sidebarOpen && (
                                                <Link
                                                    href="/logout"
                                                    method="post"
                                                    as="button"
                                                    className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition w-full text-right"
                                                    onClick={() => setUserDropdownOpen(false)}
                                                >
                                                    <FaSignOutAlt className="text-red-500" />
                                                    تسجيل الخروج
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                <main className="p-6">
                    {children}
                </main>
            </div>

            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
                    onClick={toggleSidebar}
                ></div>
            )}
        </div>
    );
}