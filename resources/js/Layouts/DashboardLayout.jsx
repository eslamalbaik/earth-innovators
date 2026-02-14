import { useState, useEffect, useRef } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import axios from 'axios';
import {
    FaBars, FaTimes, FaUsers, FaBookOpen,
    FaCalendar, FaChartLine, FaUser, FaSignOutAlt,
    FaGraduationCap, FaCommentDots, FaTachometerAlt, FaBell, FaBook,
    FaChevronDown, FaCreditCard, FaTrophy, FaProjectDiagram, FaMedal, FaFile,
    FaCheckCircle
} from 'react-icons/fa';
import ApplicationLogo from '@/Components/ApplicationLogo';
import SidebarItem from '@/Components/SidebarItem';
import SidebarSubMenu from '@/Components/SidebarSubMenu';
import { getInitials, getColorFromName } from '@/utils/imageUtils';
import { useToast } from '@/Contexts/ToastContext';
import { useFlashNotifications } from '@/Hooks/useFlashNotifications';

export default function DashboardLayout({ children, header }) {
    const { auth } = usePage().props;
    const { showInfo } = useToast();

    useFlashNotifications();
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

    const getDashboardTitle = () => {
        const role = auth?.user?.role;
        switch (role) {
            case 'student':
                return 'لوحة تحكم الطالب';
            case 'teacher':
                return 'لوحة تحكم المعلم';
            case 'school':
                return 'لوحة تحكم المدرسة';
            case 'admin':
                return 'لوحة الإدارة';
            default:
                return 'لوحة التحكم';
        }
    };

    useEffect(() => {
        if (auth?.user) {
            fetchNotifications();
            let notificationChannel = null;
            let pollingInterval = null;
            let reconnectAttempts = 0;
            const maxReconnectAttempts = 5;

            const setupEchoListener = () => {
                if (window.Echo) {
                    try {
                        const userId = auth.user.id;
                        const channelName = `App.Models.User.${userId}`;
                        notificationChannel = window.Echo.private(channelName);
                        notificationChannel.listen('.Illuminate\\Notifications\\Events\\BroadcastNotificationCreated', (e) => {
                            try {
                                const notification = {
                                    id: e.id || `notif_${Date.now()}_${Math.random()}`,
                                    type: e.type || 'notification',
                                    data: e.data || {},
                                    read_at: e.read_at || null,
                                    created_at: e.created_at || new Date().toISOString(),
                                    created_at_human: e.created_at
                                        ? new Date(e.created_at).toLocaleString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })
                                        : new Date().toLocaleString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        }),
                                };

                                setNotifications(prev => {
                                    const exists = prev.find(n => n.id === notification.id);
                                    if (exists) {
                                        return prev;
                                    }
                                    return [notification, ...prev];
                                });

                                setUnreadCount(prev => {
                                    const newCount = prev + 1;
                                    return newCount;
                                });
                                setTimeout(() => {
                                    fetchNotifications();
                                }, 500);
                            } catch (error) {
                                fetchNotifications();
                            }
                        });

                        notificationChannel.error((error) => {
                            reconnectAttempts++;
                            if (reconnectAttempts < maxReconnectAttempts) {
                                setTimeout(setupEchoListener, 2000 * reconnectAttempts);
                            } else {
                                if (pollingInterval) {
                                    clearInterval(pollingInterval);
                                }
                                pollingInterval = setInterval(fetchNotifications, 10000);
                            }
                        });

                        if (window.Echo.connector && window.Echo.connector.socket) {
                            window.Echo.connector.socket.on('connect', () => {
                                reconnectAttempts = 0;
                            });

                            window.Echo.connector.socket.on('disconnect', () => {
                                reconnectAttempts++;
                                if (reconnectAttempts < maxReconnectAttempts) {
                                    setTimeout(setupEchoListener, 2000 * reconnectAttempts);
                                } else {
                                    // After max attempts, use polling only
                                    if (pollingInterval) {
                                        clearInterval(pollingInterval);
                                    }
                                    pollingInterval = setInterval(fetchNotifications, 10000);
                                }
                            });

                            window.Echo.connector.socket.on('connect_error', () => {
                                // Silent error - will use polling fallback
                                if (reconnectAttempts >= maxReconnectAttempts) {
                                    if (pollingInterval) {
                                        clearInterval(pollingInterval);
                                    }
                                    pollingInterval = setInterval(fetchNotifications, 10000);
                                }
                            });
                        }
                        reconnectAttempts = 0;
                    } catch (error) {
                        reconnectAttempts++;
                        if (reconnectAttempts < maxReconnectAttempts) {
                            setTimeout(setupEchoListener, 2000 * reconnectAttempts);
                        } else {
                            pollingInterval = setInterval(fetchNotifications, 10000);
                        }
                    }
                } else {
                    pollingInterval = setInterval(fetchNotifications, 10000);
                }
            };
            setupEchoListener();
            return () => {
                if (notificationChannel && window.Echo) {
                    try {
                        const channelName = `App.Models.User.${auth.user.id}`;
                        notificationChannel.stopListening('.Illuminate\\Notifications\\Events\\BroadcastNotificationCreated');
                        window.Echo.leave(channelName);
                        if (import.meta.env.DEV) {
                        }
                    } catch (error) {
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
        }
    };

    const markAsRead = async (notificationId) => {
        try {
            await axios.post(`/notifications/${notificationId}/read`);
            fetchNotifications();
        } catch (error) {
        }
    };

    const markAllAsRead = async () => {
        try {
            await axios.post('/notifications/mark-all-read');
            fetchNotifications();
        } catch (error) {
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

    const { url } = usePage();
    const pageProps = usePage().props;

    useEffect(() => {
        const currentUrl = url || window.location.pathname;

        const isDashboardPage = currentUrl.includes('/dashboard') ||
            currentUrl.includes('/teacher/dashboard') ||
            currentUrl.includes('/student/dashboard') ||
            currentUrl.includes('/school/dashboard');

        if (!isDashboardPage) {
            previousDashboardDataRef.current = null;
            return;
        }

        const currentData = {
            url: currentUrl,
            stats: pageProps.stats || {},
            teacher: pageProps.teacher || null,
            auth: pageProps.auth || {},
            timestamp: Date.now(),
        };

        const previousData = previousDashboardDataRef.current;

        let dashboardType = 'لوحة التحكم';
        if (currentUrl.includes('/teacher')) {
            dashboardType = 'لوحة تحكم المعلم';
        } else if (currentUrl.includes('/student')) {
            dashboardType = 'لوحة تحكم الطالب';
        } else if (currentUrl.includes('/school')) {
            dashboardType = 'لوحة تحكم المدرسة';
        }

        if (!previousData) {
            previousDashboardDataRef.current = currentData;
            return;
        }

        if (previousData.url !== currentData.url) {
            showInfo('تم تحميل البيانات', {
                title: `${dashboardType}`,
                message: 'تم تحميل معلومات لوحة التحكم بنجاح',
                autoDismiss: 5000,
            });
            previousDashboardDataRef.current = currentData;
            return;
        }

        if (previousData.url === currentData.url) {
            const statsChanged = JSON.stringify(previousData.stats) !== JSON.stringify(currentData.stats);
            const teacherChanged = JSON.stringify(previousData.teacher) !== JSON.stringify(currentData.teacher);

            if (statsChanged || teacherChanged) {
                showInfo('تم تحديث البيانات', {
                    title: `تحديث ${dashboardType}`,
                    message: 'تم تحديث معلومات لوحة التحكم بنجاح',
                    autoDismiss: 5000,
                });
            }
        }
        previousDashboardDataRef.current = currentData;
    }, [url, pageProps, showInfo]);

    const isRouteActive = (href, currentUrl) => {
        const getPath = (url) => {
            const [path] = url.split('?');
            return path;
        };

        const getQuery = (url) => {
            const [, query] = url.split('?');
            return query || '';
        };

        const hrefPath = getPath(href);
        const currentPath = getPath(currentUrl);
        const hrefQuery = getQuery(href);
        const currentQuery = getQuery(currentUrl);

        if (currentUrl === href) {
            return true;
        }

        if (hrefQuery) {
            const hrefParams = new URLSearchParams(hrefQuery);
            const currentParams = new URLSearchParams(currentQuery);
            if (currentPath !== hrefPath) {
                return false;
            }
            let allMatch = true;
            for (const [key, value] of hrefParams.entries()) {
                if (currentParams.get(key) !== value) {
                    allMatch = false;
                    break;
                }
            }
            return allMatch;
        }

        if (currentQuery && !hrefQuery) {
            return currentPath === hrefPath;
        }

        if (hrefPath.includes('/dashboard')) {
            return currentPath === hrefPath;
        }

        if (hrefPath.includes('/create')) {
            return currentPath === hrefPath;
        }

        if (currentPath.includes('/create')) {
            return false;
        }

        if (currentPath.includes('/pending')) {
            return currentPath === hrefPath;
        }

        if (currentPath.startsWith(hrefPath)) {
            const remainingPath = currentPath.slice(hrefPath.length);
            if (remainingPath && remainingPath !== '/') {
                const nextSegment = remainingPath.split('/')[1];
                if (nextSegment === 'create' || nextSegment === 'pending') {
                    return false;
                }
            }
            return true;
        }

        return false;
    };

    const navigation = {
        admin: [
            { name: 'لوحة التحكم', href: '/admin/dashboard', icon: FaTachometerAlt },
            { name: 'صندوق المشاريع', href: '/admin/projects', icon: FaBook },
            {
                name: 'مقالات',
                href: '/admin/publications',
                icon: FaBook,
                subItems: [
                    // { name: 'مراجعة مقالات المجلة', href: '/admin/publications?status=pending', icon: FaBookOpen },
                    { name: 'مقالات المدرسة', href: '/admin/publications', icon: FaBook },
                ]
            },
            { name: 'التحديات', href: '/admin/challenges', icon: FaCalendar },
            { name: 'المستخدمون', href: '/admin/users', icon: FaUsers },
            { name: 'الشارات', href: '/admin/badges', icon: FaCommentDots },
            { name: 'الباقات', href: '/admin/packages', icon: FaCreditCard },
            { name: 'الاشتراكات والمدفوعات', href: '/admin/subscriptions', icon: FaCreditCard },
            { name: 'الشهادات', href: '/admin/certificates', icon: FaGraduationCap },
            { name: 'بوابات الدفع', href: '/admin/payment-gateways', icon: FaCreditCard },
            { name: 'معايير القبول', href: '/admin/acceptance-criteria', icon: FaCheckCircle },
            { name: 'الملف الشخصي', href: '/profile', icon: FaUser },
        ],
        teacher: [
            { name: 'لوحة التحكم', href: '/teacher/dashboard', icon: FaTachometerAlt },
            {
                name: 'صندوق المشاريع',
                href: '/teacher/projects',
                icon: FaProjectDiagram,
                subItems: [
                    { name: 'تسليمات المشاريع', href: '/teacher/submissions', icon: FaFile },
                    { name: 'مراجعة المشاريع', href: '/teacher/projects', icon: FaBookOpen },
                    { name: 'مشاريعي', href: '/teacher/projects', icon: FaProjectDiagram },
                    // { name: 'إنشاء مشروع', href: '/teacher/projects/create', icon: FaProjectDiagram },
                ]
            },
            {
                name: 'مقالات',
                href: '/teacher/publications',
                icon: FaBook,
                subItems: [
                    // { name: 'مراجعة مقالات المجلة', href: '/school/publications/pending', icon: FaBookOpen },
                    { name: 'مقالات المدرسة', href: '/teacher/publications', icon: FaBook },
                    // { name: 'إنشاء مقال', href: '/teacher/publications/create', icon: FaBook },
                ]
            },
            {
                name: 'التحديات',
                href: '/teacher/challenges',
                icon: FaCalendar,
                subItems: [
                    { name: 'تسليمات التحديات', href: '/teacher/challenge-submissions', icon: FaFile },
                    // { name: 'مراجعة التحديات', href: '/teacher/challenge-submissions?status=submitted', icon: FaBookOpen },
                    { name: 'تحدياتي', href: '/teacher/challenges', icon: FaCalendar },
                    // { name: 'إنشاء تحدّي', href: '/teacher/challenges/create', icon: FaCalendar },
                ]
            },
            { name: 'الطلاب المتابعون', href: '/teacher/students', icon: FaGraduationCap },
            { name: 'شاراتي', href: '/teacher/badges', icon: FaMedal },
            // { name: 'إرسال شارة', href: '/teacher/badges/create', icon: FaCommentDots },
            { name: 'الشهادات', href: '/teacher/certificates', icon: FaFile },
            { name: 'الملف الشخصي', href: '/teacher/profile', icon: FaUser },
        ],
        school: [
            { name: 'لوحة التحكم', href: '/school/dashboard', icon: FaTachometerAlt },
            {
                name: 'صندوق المشاريع',
                href: '/school/projects',
                icon: FaProjectDiagram,
                subItems: [
                    { name: 'تسليمات المشاريع', href: '/school/submissions', icon: FaFile },
                    { name: 'مراجعة المشاريع', href: '/school/projects/pending', icon: FaBookOpen },
                    { name: 'مشاريع المدرسة', href: '/school/projects', icon: FaProjectDiagram },
                    // { name: 'إنشاء مشروع', href: '/school/projects/create', icon: FaProjectDiagram },
                ]
            },
            {
                name: 'الشارات',
                href: '/school/badges',
                icon: FaMedal,
                subItems: [
                    { name: 'مراجعة الشارات', href: '/school/badges/pending', icon: FaMedal },
                    { name: 'الشارات المرسلة', href: '/school/badges', icon: FaCommentDots },
                    { name: 'الترتيب والشارات', href: '/school/ranking', icon: FaTrophy },
                ]
            },
            {
                name: 'المقالات',
                href: '/school/publications',
                icon: FaBook,
                subItems: [
                    { name: 'مقالات المدرسة', href: '/school/publications', icon: FaBook },
                    // { name: 'إنشاء مقال', href: '/school/publications/create', icon: FaBook },
                ]
            },
            {
                name: 'التحديات',
                href: '/school/challenges',
                icon: FaCalendar,
                subItems: [
                    { name: 'تسليمات التحديات', href: '/school/challenge-submissions', icon: FaFile },
                    { name: 'تحديات المدرسة', href: '/school/challenges', icon: FaCalendar },
                    // { name: 'إنشاء تحدّي', href: '/school/challenges/create', icon: FaCalendar },
                ]
            },
            { name: 'إضافة تقارير', href: '/school/reports', icon: FaFile },
            { name: 'الطلاب', href: '/school/students', icon: FaGraduationCap },
            { name: 'الشهادات', href: '/school/certificates', icon: FaFile },
            { name: 'الملف الشخصي', href: '/profile', icon: FaUser },
        ],
        educational_institution: [
            { name: 'لوحة التحكم', href: '/school/dashboard', icon: FaTachometerAlt },
            {
                name: 'صندوق المشاريع',
                href: '/school/projects',
                icon: FaProjectDiagram,
                subItems: [
                    { name: 'تسليمات صندوق المشاريع', href: '/school/submissions', icon: FaFile },
                    { name: 'مراجعة المشاريع', href: '/school/projects/pending', icon: FaBookOpen },
                    { name: 'مشاريع المدرسة', href: '/school/projects', icon: FaProjectDiagram },
                    // { name: 'إنشاء مشروع', href: '/school/projects/create', icon: FaProjectDiagram },
                ]
            },
            {
                name: 'الشارات',
                href: '/school/badges',
                icon: FaMedal,
                subItems: [
                    { name: 'مراجعة الشارات', href: '/school/badges/pending', icon: FaMedal },
                    { name: 'الشارات المرسلة', href: '/school/badges', icon: FaCommentDots },
                    { name: 'الترتيب والشارات', href: '/school/ranking', icon: FaTrophy },
                ]
            },
            {
                name: 'المقالات',
                href: '/school/publications',
                icon: FaBook,
                subItems: [
                    { name: 'مقالات المدرسة', href: '/school/publications', icon: FaBook },
                    // { name: 'إنشاء مقال', href: '/school/publications/create', icon: FaBook },
                ]
            },
            {
                name: 'التحديات',
                href: '/school/challenges',
                icon: FaCalendar,
                subItems: [
                    { name: 'تسليمات التحديات', href: '/school/challenge-submissions', icon: FaFile },
                    { name: 'تحديات المدرسة', href: '/school/challenges', icon: FaCalendar },
                    // { name: 'إنشاء تحدّي', href: '/school/challenges/create', icon: FaCalendar },
                ]
            },
            { name: 'إضافة تقارير', href: '/school/reports', icon: FaFile },
            { name: 'الطلاب', href: '/school/students', icon: FaGraduationCap },
            { name: 'الشهادات', href: '/school/certificates', icon: FaFile },
            { name: 'الملف الشخصي', href: '/profile', icon: FaUser },
        ],
        student: [
            { name: 'لوحة التحكم', href: '/student/dashboard', icon: FaTachometerAlt },
            { name: 'مشاريعي', href: '/student/projects', icon: FaBook },
            { name: 'التحديات', href: '/student/challenges', icon: FaCalendar },
            { name: 'الشارات', href: '/student/badges', icon: FaCommentDots },
            { name: 'النقاط', href: '/student/points', icon: FaChartLine },
            { name: 'الباقات', href: '/packages', icon: FaCreditCard },
            { name: 'الملف الشخصي', href: '/student/profile', icon: FaUser },
        ]
    };

    const currentNavigation = navigation[auth.user?.role];

    return (
        <div dir="rtl" className="min-h-screen bg-gray-50">
            <aside
                className={`fixed top-2 right-4 bottom-2 z-40 transition-all duration-300 ${sidebarOpen ? 'translate-x-0 opacity-100' : 'translate-x-[120%] opacity-0 pointer-events-none'
                    } w-72 bg-white rounded-2xl shadow-2xl border border-gray-100`}
            >
                <div className="relative flex flex-col items-center justify-center h-24 px-6 border-b border-gray-100">
                    {sidebarOpen && (
                        <button
                            onClick={toggleSidebar}
                            className="absolute left-4 top-4 lg:hidden p-2 rounded-xl hover:bg-gray-50 transition"
                        >
                            <FaTimes className="text-gray-500" />
                        </button>
                    )}
                    <div className="w-full flex justify-center items-center gap-3">
                        <Link href="/" className="flex items-center gap-3">
                            <ApplicationLogo />
                            <span className="text-lg font-bold bg-[#A3C042] bg-clip-text text-transparent">إرث المبتكرين</span>
                        </Link>
                    </div>
                    {auth?.user && (
                        <div className="text-xs text-gray-500 mt-1">
                            {getDashboardTitle()}
                        </div>
                    )}
                </div>

                <div className="flex flex-col justify-between h-[calc(100vh-144px)]">
                    {sidebarOpen && (
                        <nav className="px-4 py-6 space-y-2 overflow-y-auto">
                            {currentNavigation.map((item) => {
                                const isActive = isRouteActive(item.href, url);

                                if (item.subItems && item.subItems.length > 0) {
                                    return (
                                        <SidebarSubMenu
                                            key={item.name}
                                            item={item}
                                            isActive={isActive}
                                            currentUrl={url}
                                            onSubItemClick={() => {
                                                if (window.innerWidth < 1100) {
                                                    setSidebarOpen(false);
                                                }
                                            }}
                                        />
                                    );
                                }

                                return (
                                    <SidebarItem
                                        key={item.name}
                                        item={item}
                                        isActive={isActive}
                                        onClick={() => {
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
                            <div className="px-4 py-4 border-t border-gray-100">
                                <div className="flex justify-start items-center gap-3">
                                    {getUserImage() ? (
                                        <img
                                            src={getUserImage()}
                                            alt={auth.user?.name}
                                            className="w-10 h-10 rounded-xl object-cover border border-gray-200"
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                                const fallback = e.target.nextElementSibling;
                                                if (fallback) fallback.style.display = 'flex';
                                            }}
                                            key={getUserImage()}
                                        />
                                    ) : null}
                                    <div
                                        className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold ${getUserImage() ? 'hidden' : ''}`}
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
                                            {auth.user?.role === 'educational_institution' && 'مؤسسة تعليمية'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </aside>

            <div className={`transition-all duration-300 ${sidebarOpen ? 'ms-[300px]' : 'ms-0'}`}>
                <header className={`sticky top-2 z-30 pt-0 mb-2 mx-4 md:mx-6 lg:mx-8"${sidebarOpen ? 'max-w-full' : 'max-w-7xl'}`}>
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 backdrop-blur-sm">
                        <div className="flex items-center justify-between px-4 py-2">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={toggleSidebar}
                                    className="p-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-100 transition-all duration-200 hover:shadow-sm"
                                >
                                    <FaBars className="text-gray-700 text-lg" />
                                </button>
                                {header && (
                                    <div className="flex items-center gap-3">
                                        <h1 className="text-base md:text-xl font-bold text-gray-900">{header}</h1>
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center gap-3">
                                {(auth?.user?.role === 'student' || auth?.user?.role === 'teacher' || auth?.user?.role === 'school' || auth?.user?.role === 'educational_institution' || auth?.user?.role === 'admin') && (
                                    <div className="relative" ref={notificationsRef}>
                                        <button
                                            onClick={() => setNotificationsOpen(!notificationsOpen)}
                                            className={`relative p-2.5 rounded-xl transition-all duration-200 ${notificationsOpen
                                                ? 'bg-[#A3C042]/10 border border-[#A3C042]/20'
                                                : 'bg-gray-50 hover:bg-gray-100 border border-gray-100'
                                                }`}
                                        >
                                            <FaBell className={`text-lg transition ${notificationsOpen ? 'text-[#A3C042]' : 'text-gray-600'}`} />
                                            {unreadCount > 0 && (
                                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] px-1 flex items-center justify-center border-2 border-white">
                                                    {unreadCount > 9 ? '9+' : unreadCount}
                                                </span>
                                            )}
                                        </button>

                                        {notificationsOpen && (
                                            <div className="absolute left-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 max-h-96 overflow-hidden flex flex-col">
                                                <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between rounded-t-2xl">
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
                                                                    className={`px-4 py-3 hover:bg-gray-50 transition cursor-pointer border-r-4 ${!notification.read_at
                                                                        ? 'bg-blue-50 border-blue-400'
                                                                        : 'border-transparent'
                                                                        }`}
                                                                    onClick={() => {
                                                                        if (!notification.read_at) {
                                                                            markAsRead(notification.id);
                                                                        }
                                                                        let actionUrl = notification.data?.action_url ||
                                                                            notification.data?.actions?.[0]?.url ||
                                                                            null;

                                                                        if (!actionUrl) {
                                                                            const userRole = auth?.user?.role || 'student';
                                                                            if (notification.data?.challenge_id) {
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
                                                                                if (userRole === 'student') {
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

                                                                        if (actionUrl && typeof actionUrl === 'string') {
                                                                            actionUrl = actionUrl.replace(/\{[^}]+\}/g, '');
                                                                            if (notification.data?.challenge_id && actionUrl.includes('/challenges/') && actionUrl.includes('{')) {
                                                                                actionUrl = actionUrl.replace(/\{[^}]+\}/, notification.data.challenge_id);
                                                                            }
                                                                            if (notification.data?.project_id && actionUrl.includes('/projects/') && actionUrl.includes('{')) {
                                                                                actionUrl = actionUrl.replace(/\{[^}]+\}/, notification.data.project_id);
                                                                            }
                                                                            if (notification.data?.submission_id && actionUrl.includes('/submissions/') && actionUrl.includes('{')) {
                                                                                actionUrl = actionUrl.replace(/\{[^}]+\}/, notification.data.submission_id);
                                                                            }
                                                                        }

                                                                        if (actionUrl && actionUrl.trim() !== '' && !actionUrl.includes('{')) {
                                                                            router.visit(actionUrl);
                                                                            setNotificationsOpen(false);
                                                                        } else {
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
                                                                                            className={`text-xs ${star <= notification.data.rating
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
                                                                                    (notification.created_at ? new Date(notification.created_at).toLocaleString('en-US', {
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
                                        className={`flex items-center gap-2.5 rounded-xl p-0.5 px-2 transition-all duration-200 border ${userDropdownOpen
                                            ? 'bg-[#A3C042]/10 border-[#A3C042]/20 shadow-sm'
                                            : 'bg-gray-50 hover:bg-gray-100 border-gray-100 hover:shadow-sm'
                                            }`}
                                    >
                                        {getUserImage() ? (
                                            <img
                                                src={getUserImage()}
                                                alt={auth.user?.name}
                                                className="w-8 h-8 rounded-xl object-cover border-2 border-white shadow-sm"
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                    const fallback = e.target.nextElementSibling;
                                                    if (fallback) fallback.style.display = 'flex';
                                                }}
                                                key={getUserImage()}
                                            />
                                        ) : null}
                                        <div
                                            className={`w-8 h-8 rounded-xl flex items-center justify-center text-white font-bold border-2 border-white shadow-sm ${getUserImage() ? 'hidden' : ''}`}
                                            style={{
                                                background: `linear-gradient(135deg, ${getColorFromName(auth.user?.name || 'User')})`
                                            }}
                                        >
                                            {getInitials(auth.user?.name || 'User')}
                                        </div>
                                        <div className="hidden sm:block ">
                                            <div className="text-sm font-semibold text-gray-900">{auth.user?.name?.split(' ')[0] || 'المستخدم'}</div>
                                            <div className="text-xs text-gray-500">
                                                {auth.user?.role === 'admin' && 'أدمن'}
                                                {auth.user?.role === 'teacher' && 'معلم'}
                                                {auth.user?.role === 'student' && 'طالب'}
                                                {auth.user?.role === 'school' && 'مدرسة'}
                                                {auth.user?.role === 'educational_institution' && 'مؤسسة تعليمية'}
                                            </div>
                                        </div>
                                        <FaChevronDown className={`text-gray-400 text-xs transition-transform duration-200 ${userDropdownOpen ? 'rotate-180' : ''}`} />
                                    </button>

                                    {userDropdownOpen && (
                                        <div className="absolute left-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden">
                                            <div className="py-2">
                                                {/* لوحة التحكم */}
                                                {(auth?.user?.role === 'admin' || auth?.user?.role === 'teacher' || auth?.user?.role === 'school' || auth?.user?.role === 'student') && (
                                                    <>
                                                        <Link
                                                            href={
                                                                auth?.user?.role === 'admin'
                                                                    ? '/admin/dashboard'
                                                                    : auth?.user?.role === 'teacher'
                                                                        ? '/teacher/dashboard'
                                                                        : auth?.user?.role === 'school'
                                                                            ? '/school/dashboard'
                                                                            : '/student/dashboard'
                                                            }
                                                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#A3C042] hover:bg-[#A3C042]/10 transition font-semibold"
                                                            onClick={() => setUserDropdownOpen(false)}
                                                        >
                                                            <FaTachometerAlt className="text-[#A3C042]" />
                                                            لوحة التحكم
                                                        </Link>
                                                        <div className="border-t border-gray-100 my-1" />
                                                    </>
                                                )}
                                                <Link
                                                    href={
                                                        auth?.user?.role === 'teacher'
                                                            ? '/teacher/profile'
                                                            : auth?.user?.role === 'student'
                                                                ? '/student/profile'
                                                                : '/profile'
                                                    }
                                                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition"
                                                    onClick={() => setUserDropdownOpen(false)}
                                                >
                                                    <FaUser className="text-gray-400" />
                                                    الملف الشخصي
                                                </Link>
                                                <div className="border-t border-gray-100 my-1" />
                                                <Link
                                                    href="/logout"
                                                    method="post"
                                                    as="button"
                                                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition w-full "
                                                    onClick={() => setUserDropdownOpen(false)}
                                                >
                                                    <FaSignOutAlt className="text-red-500" />
                                                    تسجيل الخروج
                                                </Link>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="p-6 px-4 md:px-6">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>

            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 lg:hidden"
                    onClick={toggleSidebar}
                ></div>
            )}
        </div>
    );
}