import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import { FaBars, FaUser, FaCog, FaSignOutAlt, FaHome, FaUsers, FaBook, FaCalendar, FaChartBar, FaFileAlt, FaTrophy, FaCreditCard, FaShieldAlt } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import ApplicationLogo from '@/Components/ApplicationLogo';
import LanguageSwitcher from '@/Components/LanguageSwitcher';
import { useTranslation } from '@/i18n';

export default function AdminLayout({ children, title = null }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { dir } = useSelector((state) => state.language);
    const { t } = useTranslation();

    const navigation = [
        { name: t('adminLayout.nav.dashboard'), href: '/admin/dashboard', icon: FaHome },
        { name: t('adminLayout.nav.teachers'), href: '/admin/teachers', icon: FaUsers },
        { name: t('adminLayout.nav.teacherApplications'), href: '/admin/teacher-applications', icon: FaFileAlt },
        { name: t('adminLayout.nav.students'), href: '/admin/students', icon: FaUsers },
        { name: t('adminLayout.nav.bookings'), href: '/admin/bookings', icon: FaCalendar },
        { name: t('adminLayout.nav.reviews'), href: '/admin/reviews', icon: FaBook },
        { name: t('adminLayout.nav.subjects'), href: '/admin/subjects', icon: FaBook },
        { name: t('adminLayout.nav.publications'), href: '/admin/publications', icon: FaBook },
        { name: t('adminLayout.nav.challenges'), href: '/admin/challenges', icon: FaTrophy },
        { name: t('adminLayout.nav.subscriptions'), href: '/admin/subscriptions', icon: FaCreditCard },
        { name: t('adminLayout.nav.permissions'), href: '/admin/permissions', icon: FaShieldAlt },
    ];

    return (
        <div className="min-h-screen bg-gray-50" dir={dir}>
            <Head title={title || t('adminLayout.title')} />
            <div className={`fixed inset-y-0 start-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'
                } lg:translate-x-0 lg:static lg:inset-0`}>
                <div className="flex flex-col items-center justify-center h-20 px-6 border-b border-gray-200 relative">
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="absolute left-4 top-4 lg:hidden text-gray-500 hover:text-gray-700"
                    >
                        <FaBars />
                    </button>
                    <Link href="/" className="flex items-center gap-3">
                        <ApplicationLogo />
                        <span className="text-lg font-bold bg-[#A3C042] bg-clip-text text-transparent">{t('common.appName')}</span>
                    </Link>
                    <div className="text-xs text-gray-500 mt-1">
                        {t('adminLayout.subtitle')}
                    </div>
                </div>

                <nav className="mt-6 px-3">
                    <div className="space-y-1">
                        {navigation.map((item) => {
                            const Icon = item.icon;
                            return (
                                <a
                                    key={item.name}
                                    href={item.href}
                                    className="group flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 hover:text-gray-900 transition duration-200"
                                >
                                    <Icon className="me-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                                    {item.name}
                                </a>
                            );
                        })}
                    </div>
                </nav>
            </div>

            <div className="lg:ps-64">
                <div className="bg-white shadow-sm border-b border-gray-200">
                    <div className="flex items-center justify-between h-16 px-6">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden text-gray-500 hover:text-gray-700"
                        >
                            <FaBars />
                        </button>

                        <div className="flex items-center space-x-4">
                            <LanguageSwitcher />
                            <div className="relative">
                                <button className="flex items-center space-x-2 text-gray-700 hover:text-gray-900">
                                    <FaUser className="h-5 w-5" />
                                    <span className="text-sm font-medium">{t('adminLayout.admin')}</span>
                                </button>
                            </div>

                            <div className="flex items-center space-x-2">
                                <a
                                    href="/admin/settings"
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    <FaCog className="h-5 w-5" />
                                </a>
                                <Link
                                    href="/logout"
                                    method="post"
                                    as="button"
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    <FaSignOutAlt className="h-5 w-5" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
                <main className="p-6">
                    {children}
                </main>
            </div>

            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}
        </div>
    );
}
