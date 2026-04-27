import { router } from '@inertiajs/react';
import { useState, useRef, useEffect } from 'react';
import { FaHome, FaFolderOpen, FaCompass, FaTrophy, FaUser, FaSignOutAlt, FaBook, FaMedal, FaTachometerAlt, FaCreditCard } from 'react-icons/fa';
import { getUserImageUrl, getInitials, getColorFromName } from '@/utils/imageUtils';
import { useTranslation } from '@/i18n';
import { logout } from '@/utils/logout';

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
            home: '/dashboard',
            dashboard: '/dashboard',
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

export default function MobileBottomNav({ active = 'home', role, isAuthed = false, user = null }) {
    const { t } = useTranslation();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [userDropdownOpen, setUserDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    const userDropdownRef = useRef(null);
    const links = getRoleLinks(role);
    const exploreHref = role === 'student' ? '/student/projects' : '/projects';

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
            if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
                setUserDropdownOpen(false);
            }
        };

        if (dropdownOpen || userDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [dropdownOpen, userDropdownOpen]);

    const handleLogout = () => {
        logout();
    };

    const items = [
        { key: 'home', label: t('common.home'), icon: FaHome, href: links.home },
        { key: 'projects', label: t('dashboard.myProjects'), icon: FaFolderOpen, href: links.projects },
        { key: 'explore', label: t('common.projects'), icon: FaCompass, href: exploreHref },
        { key: 'challenges', label: t('common.challenges'), icon: FaTrophy, href: links.challenges },
    ];

    // If user is not authenticated or doesn't have a role, hide "My Projects" and show only explore
    const filteredItems = isAuthed && role ? items : items.filter(item => item.key !== 'projects');

    const userImage = user ? getUserImageUrl(user) : null;
    const userName = user?.name || '';

    // Desktop Sidebar
    const DesktopSidebar = () => {
        const sidebarItems = [
            { key: 'home', label: t('common.home'), icon: FaHome, href: links.home },
            { key: 'projects', label: t('dashboard.myProjects'), icon: FaFolderOpen, href: links.projects },
            { key: 'explore', label: t('common.projects'), icon: FaCompass, href: exploreHref },
            { key: 'challenges', label: t('common.challenges'), icon: FaTrophy, href: links.challenges },
        ];

        const filteredSidebarItems = isAuthed && role ? sidebarItems : sidebarItems.filter(item => item.key !== 'projects');

        return (
            <aside className="hidden lg:block fixed start-0 top-20 bottom-0 w-72 bg-white border-l border-gray-200 z-30">
                <div className="h-full overflow-y-auto">
                    <div className="p-6 space-y-2">
                        <div className="mb-6">
                            <h3 className="text-xs font-bold text-gray-500 uppercase mb-4 px-3">{t('sections.quickLinks')}</h3>
                            {filteredSidebarItems.map((item) => {
                                const isActive = item.key === active;
                                const Icon = item.icon;
                                return (
                                    <button
                                        key={item.key}
                                        type="button"
                                        onClick={() => router.visit(item.href)}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all mb-1 ${isActive
                                            ? 'bg-[#A3C042]/10 text-[#A3C042] border border-[#A3C042]/20'
                                            : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                                            }`}
                                    >
                                        <Icon className="text-lg" />
                                        <span>{item.label}</span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Quick Links Section */}
                        <div className="pt-6 border-t border-gray-200">
                            <h3 className="text-xs font-bold text-gray-500 uppercase mb-4 px-3">{t('sections.quickLinks')}</h3>
                            <div className="space-y-1">
                                <button
                                    type="button"
                                    onClick={() => router.visit('/packages')}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-gray-700 hover:bg-gray-50 transition"
                                >
                                    <FaCreditCard className="text-base" />
                                    <span>{t('common.packages')}</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => router.visit('/publications')}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-gray-700 hover:bg-gray-50 transition"
                                >
                                    <FaCompass className="text-base" />
                                    <span>{t('common.publications')}</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => router.visit('/badges')}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-gray-700 hover:bg-gray-50 transition"
                                >
                                    <FaTrophy className="text-base" />
                                    <span>{t('common.badges')}</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => router.visit('/about')}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-gray-700 hover:bg-gray-50 transition"
                                >
                                    <FaCompass className="text-base" />
                                    <span>{t('common.about')}</span>
                                </button>
                            </div>
                        </div>

                        {/* User Profile Section */}
                        {isAuthed && user && (
                            <div className="pt-6 border-t border-gray-200 mt-6">
                                <div className="px-4 py-3 bg-gradient-to-r from-[#A3C042]/5 to-[#8CA635]/5 rounded-xl border border-[#A3C042]/10">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="relative">
                                            {userImage ? (
                                                <img
                                                    src={userImage}
                                                    alt={userName}
                                                    className="w-10 h-10 rounded-full object-cover border-2 border-[#A3C042]/20"
                                                    onError={(e) => {
                                                        e.target.style.display = 'none';
                                                        const fallback = e.target.nextElementSibling;
                                                        if (fallback) fallback.style.display = 'flex';
                                                    }}
                                                />
                                            ) : null}
                                            <div
                                                className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold border-2 border-[#A3C042]/20 ${userImage ? 'hidden' : 'flex'
                                                    }`}
                                                style={{
                                                    background: `linear-gradient(135deg, ${getColorFromName(userName)})`
                                                }}
                                            >
                                                {getInitials(userName)}
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-bold text-gray-900 truncate">{userName}</div>
                                            <div className="text-xs text-gray-500">
                                                {role === 'student' && t('roles.student')}
                                                {role === 'teacher' && t('roles.teacher')}
                                                {role === 'school' && t('roles.school')}
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => router.visit(links.profile)}
                                        className="w-full mt-2 px-3 py-2 bg-[#A3C042] text-white rounded-lg text-xs font-semibold hover:bg-[#8CA635] transition"
                                    >
                                        {t('profile.viewProfile')}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </aside>
        );
    };

    return (
        <>
            {/* Mobile Bottom Navigation */}
            <nav className="fixed bottom-0 end-0 start-0 z-40 bg-white border-t border-gray-100 md:hidden">
                <div className="px-2">
                    <div className={`grid py-2 ${isAuthed && role ? 'grid-cols-5' : 'grid-cols-4'}`}>
                        {filteredItems.map((item) => {
                            const isActive = item.key === active;
                            const Icon = item.icon;
                            return (
                                <button
                                    key={item.key}
                                    type="button"
                                    onClick={() => router.visit(item.href)}
                                    className="flex flex-col items-center justify-center gap-1 py-2"
                                >
                                    <Icon className={`text-lg ${isActive ? 'text-[#A3C042]' : 'text-gray-300'}`} />
                                    <span className={`text-[11px] font-semibold ${isActive ? 'text-[#A3C042]' : 'text-gray-400'}`}>
                                        {item.label}
                                    </span>
                                </button>
                            );
                        })}

                        {/* Profile/Auth Section */}
                        {isAuthed && user ? (
                            <div className="relative" ref={userDropdownRef}>
                                <button
                                    type="button"
                                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                                    className={`flex flex-col items-center justify-center gap-1 py-2 w-full ${active === 'profile' ? 'text-[#A3C042]' : ''
                                        }`}
                                >
                                    <div className="relative">
                                        {userImage ? (
                                            <img
                                                src={userImage}
                                                alt={userName}
                                                className="w-6 h-6 rounded-full object-cover border-2 border-gray-200"
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                    const fallback = e.target.nextElementSibling;
                                                    if (fallback) fallback.style.display = 'flex';
                                                }}
                                            />
                                        ) : null}
                                        <div
                                            className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold border-2 border-gray-200 ${userImage ? 'hidden' : 'flex'
                                                }`}
                                            style={{
                                                background: `linear-gradient(135deg, ${getColorFromName(userName)})`
                                            }}
                                        >
                                            {getInitials(userName)}
                                        </div>
                                    </div>
                                    <span className={`text-[11px] font-semibold truncate max-w-[60px] ${active === 'profile' ? 'text-[#A3C042]' : 'text-gray-400'
                                        }`}>
                                        {userName.split(' ')[0] || t('profile.profile')}
                                    </span>
                                </button>

                                {/* User Dropdown Menu */}
                                {userDropdownOpen && (
                                    <div className="absolute bottom-full end-0 mb-2 w-40 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden z-50">
                                        {/* Dashboard link for all roles */}
                                        {(role === 'admin' || role === 'teacher' || role === 'school' || role === 'student') && (
                                            <>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        router.visit(links.dashboard);
                                                        setUserDropdownOpen(false);
                                                    }}
                                                    className="w-full px-4 py-3 text-sm font-semibold text-[#A3C042] hover:bg-[#A3C042]/10 transition flex items-center justify-between gap-2"
                                                >
                                                    <span>{t('sidebar.dashboard')}</span>
                                                    <FaTachometerAlt className="text-xs" />
                                                </button>
                                                <div className="border-t border-gray-100" />
                                            </>
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => {
                                                router.visit(links.profile);
                                                setUserDropdownOpen(false);
                                            }}
                                            className="w-full  px-4 py-3 text-sm font-semibold text-gray-900 hover:bg-gray-50 transition flex items-center justify-between"
                                        >
                                            <span>{t('profile.profile')}</span>
                                        </button>
                                        {role === 'student' && (
                                            <>
                                                <div className="border-t border-gray-100" />
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        router.visit('/packages');
                                                        setUserDropdownOpen(false);
                                                    }}
                                                    className="w-full  px-4 py-3 text-sm font-semibold text-[#A3C042] hover:bg-[#A3C042]/10 transition flex items-center justify-between gap-2"
                                                >
                                                    <span>{t('common.packages')}</span>
                                                    <FaCreditCard className="text-xs" />
                                                </button>
                                            </>
                                        )}
                                        <div className="border-t border-gray-100" />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                handleLogout();
                                                setUserDropdownOpen(false);
                                            }}
                                            className="w-full  px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 transition flex items-center justify-between gap-2"
                                        >
                                            <span>{t('profile.logout')}</span>
                                            <FaSignOutAlt className="text-xs" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="relative" ref={dropdownRef}>
                                <button
                                    type="button"
                                    onClick={() => setDropdownOpen(!dropdownOpen)}
                                    className="flex flex-col items-center justify-center gap-1 py-2 w-full"
                                >
                                    <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                                        <FaUser className="text-gray-400 text-xs" />
                                    </div>
                                    <span className="text-[11px] font-semibold text-gray-400">{t('common.login')}</span>
                                </button>

                                {/* Dropdown Menu */}
                                {dropdownOpen && (
                                    <div className="absolute bottom-full end-0 mb-2 w-40 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden z-50">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                router.visit('/login');
                                                setDropdownOpen(false);
                                            }}
                                            className="w-full  px-4 py-3 text-sm font-semibold text-gray-900 hover:bg-gray-50 transition flex items-center justify-between"
                                        >
                                            <span>{t('common.login')}</span>
                                        </button>
                                        <div className="border-t border-gray-100" />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                router.visit('/register');
                                                setDropdownOpen(false);
                                            }}
                                            className="w-full  px-4 py-3 text-sm font-semibold text-[#A3C042] hover:bg-[#A3C042]/5 transition flex items-center justify-between"
                                        >
                                            <span>{t('common.register')}</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </nav>
        </>
    );
}
