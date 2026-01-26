import { FaBell, FaArrowRight, FaHome, FaFolderOpen, FaCompass, FaTrophy, FaBook, FaMedal, FaUser, FaSignOutAlt, FaChevronDown, FaTachometerAlt } from 'react-icons/fa';
import { Link, usePage, router } from '@inertiajs/react';
import { useState, useRef, useEffect } from 'react';
import { getUserImageUrl, getInitials, getColorFromName } from '@/utils/imageUtils';

export default function MobileTopBar({
    title,
    unreadCount = 0,
    onNotifications,
    onBack,
    leftIcon,
    rightIcon,
    reverseOrder = false,
    showLogo = true,
    auth,
}) {
    const { url } = usePage();
    const currentPath = url.split('?')[0];
    const isHomePage = currentPath === '/';
    
    const LeftIcon = FaArrowRight;
    const RightIcon = FaBell;
    // Get user from auth prop or from usePage if auth is not provided
    const page = usePage();
    const pageAuth = page.props.auth;
    const finalAuth = auth || pageAuth;
    const user = finalAuth?.user || null;
    const isAuthed = !!(user);

    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [navMenuOpen, setNavMenuOpen] = useState(false);
    const userMenuRef = useRef(null);
    const navMenuRef = useRef(null);

    // Close menus when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
                setUserMenuOpen(false);
            }
            if (navMenuRef.current && !navMenuRef.current.contains(event.target)) {
                setNavMenuOpen(false);
            }
        };

        if (userMenuOpen || navMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [userMenuOpen, navMenuOpen]);

    const handleLogout = () => {
        router.post('/logout');
    };

    const getRoleLinks = (role) => {
        if (role === 'teacher') {
            return {
                home: '/teacher/dashboard',
                dashboard: '/teacher/dashboard',
                projects: '/teacher/projects',
                challenges: '/teacher/challenges',
                profile: '/teacher/profile',
            };
        }
        if (role === 'school') {
            return {
                home: '/school/dashboard',
                dashboard: '/school/dashboard',
                projects: '/school/projects',
                challenges: '/school/challenges',
                profile: '/profile',
            };
        }
        if (role === 'student') {
            return {
                home: '/student/dashboard',
                dashboard: '/student/dashboard',
                projects: '/student/projects',
                challenges: '/student/challenges',
                profile: '/student/profile',
            };
        }
        if (role === 'admin') {
            return {
                home: '/admin/dashboard',
                dashboard: '/admin/dashboard',
                projects: '/projects',
                challenges: '/challenges',
                profile: '/profile',
            };
        }
        return {
            home: '/',
            dashboard: '/dashboard',
            projects: '/projects',
            challenges: '/challenges',
            profile: '/profile',
        };
    };

    const links = getRoleLinks(user?.role);
    const userImage = user ? getUserImageUrl(user) : null;
    const userName = user?.name || '';

    const navItems = [
        { key: 'home', label: 'الرئيسية', icon: FaHome, href: links.home },
        { key: 'projects', label: 'المشاريع', icon: FaFolderOpen, href: '/projects' },
        { key: 'challenges', label: 'التحديات', icon: FaTrophy, href: '/challenges' },
        { key: 'publications', label: 'الإصدارات', icon: FaBook, href: '/publications' },
        { key: 'badges', label: 'الشارات', icon: FaMedal, href: '/badges' },
        { key: 'about', label: 'من نحن', icon: FaCompass, href: '/about' },
    ];

    // Mobile View
    const MobileHeader = () => (
        <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-sm border-b border-gray-100 md:hidden">
            <div className="px-4 py-3">
                <div className="flex items-center justify-between">
                            {!isHomePage && (
                                <button
                                    type="button"
                                    onClick={onBack}
                                    className="h-10 w-10 me-2 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center hover:bg-gray-100 transition"
                                    aria-label="رجوع"
                                >
                                    <LeftIcon className="text-gray-700" />
                                </button>
                            )}
                            <div className="flex-shrink-0">
                            <Link href="/" className="flex items-center space-x-3 space-x-reverse">
                                <img
                                    src="/images/logo-modified.png"
                                    alt="إرث المبتكرين - Innovators Legacy"
                                    className="h-10 w-auto object-contain"
                                />
                            </Link>
                        </div>
                            <div className="text-center flex-1 flex items-center justify-center gap-2">
                                <div className="text-sm font-bold text-[#A3C042]">{title}</div>
                            </div>
                            <button
                                type="button"
                                onClick={onNotifications}
                                className="relative h-10 w-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center hover:bg-gray-100 transition"
                                aria-label="الإشعارات"
                            >
                                <RightIcon className="text-gray-700" />
                                {unreadCount > 0 && (
                                    <span className="absolute -top-1 -left-1 min-w-5 h-5 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                                        {unreadCount > 9 ? '9+' : unreadCount}
                                    </span>
                                )}
                            </button>
                </div>
            </div>
        </header>
    );

    // Desktop View - Professional Navigation Bar
    const DesktopHeader = () => (
        <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm hidden md:block">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <div className="flex-shrink-0">
                        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition">
                            <img
                                src="/images/logo-modified.png"
                                alt="إرث المبتكرين - Innovators Legacy"
                                className="h-12 w-auto object-contain"
                            />
                            <div className="flex flex-col">
                                <p className="text-xl font-bold bg-gradient-to-r from-[#A3C042] to-[#93b03a] bg-clip-text text-transparent">
                                    إرث المبتكرين
                                </p>
                                <p className="text-xs text-gray-500">Innovators Legacy</p>
                            </div>
                        </Link>
                    </div>

                    {/* Navigation Menu */}
                    <nav className="flex-1 flex items-center justify-center gap-1">
                        {navItems.map((item) => {
                            const isActive = currentPath === item.href || 
                                (item.href !== '/' && currentPath.startsWith(item.href));
                            const Icon = item.icon;
                            
                            return (
                                <Link
                                    key={item.key}
                                    href={item.href}
                                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                                        isActive
                                            ? 'bg-[#A3C042]/10 text-[#A3C042] border border-[#A3C042]/20'
                                            : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                                    }`}
                                >
                                    <span>{item.label}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Right Side - Notifications & User */}
                    <div className="flex items-center gap-3">
                        {/* Notifications */}
                        {isAuthed && (
                            <button
                                type="button"
                                onClick={onNotifications}
                                className="relative h-11 w-11 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center hover:bg-gray-100 hover:border-gray-300 transition group"
                                aria-label="الإشعارات"
                            >
                                <RightIcon className="text-gray-600 group-hover:text-[#A3C042] transition" />
                                {unreadCount > 0 && (
                                    <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1.5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center border-2 border-white">
                                        {unreadCount > 9 ? '9+' : unreadCount}
                                    </span>
                                )}
                            </button>
                        )}

                        {/* User Menu */}
                        {isAuthed && user ? (
                            <div className="relative" ref={userMenuRef}>
                                <button
                                    type="button"
                                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                                    className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-50 transition border border-transparent hover:border-gray-200"
                                >
                                    <div className="relative">
                                        {userImage ? (
                                            <img
                                                src={userImage}
                                                alt={userName}
                                                className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                    const fallback = e.target.nextElementSibling;
                                                    if (fallback) fallback.style.display = 'flex';
                                                }}
                                            />
                                        ) : null}
                                        <div
                                            className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold border-2 border-gray-200 ${
                                                userImage ? 'hidden' : 'flex'
                                            }`}
                                            style={{
                                                background: `linear-gradient(135deg, ${getColorFromName(userName)})`
                                            }}
                                        >
                                            {getInitials(userName)}
                                        </div>
                                    </div>
                                    <div className=" hidden lg:block">
                                        <div className="text-sm font-bold text-gray-900">{userName?.split(' ')[0] || 'المستخدم'}</div>
                                        <div className="text-xs text-gray-500">
                                            {user?.role === 'student' && 'طالب'}
                                            {user?.role === 'teacher' && 'معلم'}
                                            {user?.role === 'school' && 'مدرسة'}
                                            {user?.role === 'admin' && 'مدير'}
                                        </div>
                                    </div>
                                    <FaChevronDown className={`text-xs text-gray-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {/* User Dropdown */}
                                {userMenuOpen && (
                                    <div className="absolute left-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden z-50">
                                        <div className="p-4 border-b border-gray-100">
                                            <div className="font-bold text-gray-900">{userName || 'المستخدم'}</div>
                                            <div className="text-xs text-gray-500 mt-1">{user?.email || ''}</div>
                                        </div>
                                        <div className="py-2">
                                            {/* لوحة التحكم - تظهر لجميع الأدوار */}
                                            {(user?.role === 'admin' || user?.role === 'teacher' || user?.role === 'school' || user?.role === 'student') && (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        router.visit(links.dashboard);
                                                        setUserMenuOpen(false);
                                                    }}
                                                    className="w-full px-4 py-3 text-sm font-semibold text-[#A3C042] hover:bg-[#A3C042]/10 transition flex items-center justify-between gap-2 border-b border-gray-100"
                                                >
                                                    <span>لوحة التحكم</span>
                                                    <FaTachometerAlt className="text-[#A3C042]" />
                                                </button>
                                            )}
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    router.visit(links.profile);
                                                    setUserMenuOpen(false);
                                                }}
                                                className="w-full  px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition flex items-center justify-between gap-2"
                                            >
                                                <span>الملف الشخصي</span>
                                                <FaUser className="text-gray-400" />
                                            </button>
                                            {user?.role === 'student' && (
                                                <>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            router.visit('/student/points');
                                                            setUserMenuOpen(false);
                                                        }}
                                                        className="w-full  px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition flex items-center justify-between gap-2"
                                                    >
                                                        <span>النقاط</span>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            router.visit('/achievements');
                                                            setUserMenuOpen(false);
                                                        }}
                                                        className="w-full  px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition flex items-center justify-between gap-2"
                                                    >
                                                        <span>الإنجازات</span>
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                        <div className="border-t border-gray-100">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    handleLogout();
                                                    setUserMenuOpen(false);
                                                }}
                                                className="w-full px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 transition flex items-center justify-between gap-2"
                                            >
                                                <span>تسجيل الخروج</span>
                                                <FaSignOutAlt className="text-xs" />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Link
                                    href="/login"
                                    className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-100 transition"
                                >
                                    تسجيل الدخول
                                </Link>
                                <Link
                                    href="/register"
                                    className="px-4 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-[#A3C042] to-[#93b03a] text-white hover:opacity-90 transition shadow-md"
                                >
                                    انضم للمنصة
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );

    return (
        <>
            <MobileHeader />
            <DesktopHeader />
        </>
    );
}


