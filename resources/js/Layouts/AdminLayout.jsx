import { Head, Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import {
    FaBars, FaUser, FaSignOutAlt, FaHome, FaUsers, FaBook, FaCalendar, FaChartBar,
    FaFileAlt, FaTrophy, FaCreditCard, FaShieldAlt, FaCog, FaUserTie, FaUserGraduate,
    FaUserShield, FaNewspaper, FaTags, FaSitemap, FaFlag, FaRuler, FaLightbulb,
    FaProjectDiagram, FaRocket, FaClipboardList, FaCheckDouble, FaAward, FaMedal,
    FaCertificate, FaGift, FaShoppingCart, FaStar, FaBoxOpen, FaMoneyBillWave,
    FaWallet, FaBrain, FaMapMarkedAlt, FaSearch, FaComments, FaGavel, FaBalanceScale,
    FaDatabase, FaFileImport,
} from 'react-icons/fa';
import { useSelector } from 'react-redux';
import ApplicationLogo from '@/Components/ApplicationLogo';
import LanguageSwitcher from '@/Components/LanguageSwitcher';
import SidebarItem from '@/Components/SidebarItem';
import SidebarSubMenu from '@/Components/SidebarSubMenu';
import { useTranslation } from '@/i18n';
import { logout } from '@/utils/logout';

export default function AdminLayout({ children, title = null }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { dir } = useSelector((state) => state.language);
    const { t } = useTranslation();
    const { url } = usePage();

    // Grouped so the ~37 admin sections stay navigable in one column. Every href
    // below maps to a registered GET route under the admin prefix; sections
    // without a listing route (submissions, challenge-submissions) are reached
    // from their parent record instead and are deliberately absent here.
    const navigation = [
        { name: t('adminLayout.nav.dashboard'), href: '/admin/dashboard', icon: FaHome },
        {
            name: t('adminLayout.nav.groups.users'),
            icon: FaUsers,
            subItems: [
                { name: t('adminLayout.nav.teachers'), href: '/admin/teachers', icon: FaUserTie },
                { name: t('adminLayout.nav.teacherApplications'), href: '/admin/teacher-applications', icon: FaFileAlt },
                { name: t('adminLayout.nav.students'), href: '/admin/students', icon: FaUserGraduate },
                { name: t('adminLayout.nav.users'), href: '/admin/users', icon: FaUser },
                { name: t('adminLayout.nav.customRoles'), href: '/admin/custom-roles', icon: FaUserShield },
                { name: t('adminLayout.nav.permissions'), href: '/admin/permissions', icon: FaShieldAlt },
            ],
        },
        {
            name: t('adminLayout.nav.groups.content'),
            icon: FaBook,
            subItems: [
                { name: t('adminLayout.nav.subjects'), href: '/admin/subjects', icon: FaBook },
                { name: t('adminLayout.nav.publications'), href: '/admin/publications', icon: FaNewspaper },
                { name: t('adminLayout.nav.categories'), href: '/admin/categories', icon: FaTags },
                { name: t('adminLayout.nav.academicStructure'), href: '/admin/academic-structure', icon: FaSitemap },
                { name: t('adminLayout.nav.nationalLevels'), href: '/admin/national-levels', icon: FaFlag },
                { name: t('adminLayout.nav.referenceStandards'), href: '/admin/reference-standards', icon: FaRuler },
            ],
        },
        {
            name: t('adminLayout.nav.groups.challenges'),
            icon: FaTrophy,
            subItems: [
                { name: t('adminLayout.nav.challenges'), href: '/admin/challenges', icon: FaTrophy },
                { name: t('adminLayout.nav.challengeSuggestions'), href: '/admin/challenge-suggestions', icon: FaLightbulb },
                { name: t('adminLayout.nav.projects'), href: '/admin/projects', icon: FaProjectDiagram },
                { name: t('adminLayout.nav.initiatives'), href: '/admin/initiatives', icon: FaRocket },
                { name: t('adminLayout.nav.rubricLibrary'), href: '/admin/rubric-library', icon: FaClipboardList },
                { name: t('adminLayout.nav.acceptanceCriteria'), href: '/admin/acceptance-criteria', icon: FaCheckDouble },
            ],
        },
        {
            name: t('adminLayout.nav.groups.rewards'),
            icon: FaAward,
            subItems: [
                { name: t('adminLayout.nav.badges'), href: '/admin/badges', icon: FaMedal },
                { name: t('adminLayout.nav.certificates'), href: '/admin/certificates', icon: FaCertificate },
                { name: t('adminLayout.nav.storeRewards'), href: '/admin/store-rewards', icon: FaGift },
                { name: t('adminLayout.nav.storeRewardRequests'), href: '/admin/store-reward-requests', icon: FaShoppingCart },
            ],
        },
        {
            name: t('adminLayout.nav.groups.bookings'),
            icon: FaCalendar,
            subItems: [
                { name: t('adminLayout.nav.bookings'), href: '/admin/bookings', icon: FaCalendar },
                { name: t('adminLayout.nav.reviews'), href: '/admin/reviews', icon: FaStar },
            ],
        },
        {
            name: t('adminLayout.nav.groups.finance'),
            icon: FaCreditCard,
            subItems: [
                { name: t('adminLayout.nav.subscriptions'), href: '/admin/subscriptions', icon: FaCreditCard },
                { name: t('adminLayout.nav.packages'), href: '/admin/packages', icon: FaBoxOpen },
                { name: t('adminLayout.nav.payments'), href: '/admin/payments', icon: FaMoneyBillWave },
                { name: t('adminLayout.nav.paymentGateways'), href: '/admin/payment-gateways', icon: FaWallet },
            ],
        },
        {
            name: t('adminLayout.nav.groups.innovation'),
            icon: FaBrain,
            subItems: [
                { name: t('adminLayout.nav.analytics'), href: '/admin/analytics', icon: FaChartBar },
                { name: t('adminLayout.nav.talentMap'), href: '/admin/innovation/talent-map', icon: FaMapMarkedAlt },
                { name: t('adminLayout.nav.smartSearch'), href: '/admin/innovation/smart-search', icon: FaSearch },
                { name: t('adminLayout.nav.aiChat'), href: '/admin/innovation/chat', icon: FaComments },
                { name: t('adminLayout.nav.aiAppeals'), href: '/admin/ai-appeals', icon: FaGavel },
                { name: t('adminLayout.nav.biasReport'), href: '/admin/bias-report', icon: FaBalanceScale },
            ],
        },
        {
            name: t('adminLayout.nav.groups.system'),
            icon: FaCog,
            subItems: [
                { name: t('adminLayout.nav.dataRequests'), href: '/admin/data-requests', icon: FaDatabase },
                { name: t('adminLayout.nav.import'), href: '/admin/import', icon: FaFileImport },
            ],
        },
    ];

    const isRouteActive = (href) => {
        if (!href || !url) return false;
        const [currentPath] = url.split('?');
        return currentPath === href || currentPath.startsWith(href + '/');
    };

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
                    <Link href="/" className="flex items-center">
                        <ApplicationLogo />
                    </Link>
                    <div className="text-xs text-gray-500 mt-1">
                        {t('adminLayout.subtitle')}
                    </div>
                </div>

                {/* h-20 is the logo header above; the rest scrolls so expanded groups stay reachable */}
                <nav className="mt-6 px-3 pb-6 h-[calc(100vh-5rem-1.5rem)] overflow-y-auto">
                    <div className="space-y-1">
                        {navigation.map((item) => {
                            const closeOnMobile = () => {
                                if (window.innerWidth < 1024) {
                                    setSidebarOpen(false);
                                }
                            };

                            if (item.subItems && item.subItems.length > 0) {
                                return (
                                    <SidebarSubMenu
                                        key={item.name}
                                        item={item}
                                        isActive={false}
                                        currentUrl={url}
                                        onSubItemClick={closeOnMobile}
                                    />
                                );
                            }

                            return (
                                <SidebarItem
                                    key={item.name}
                                    item={item}
                                    isActive={isRouteActive(item.href)}
                                    onClick={closeOnMobile}
                                />
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

                            {/* No settings link here: /admin/settings has no registered
                                route, so the gear it used to hold always 404'd. */}
                            <div className="flex items-center space-x-2">
                                <button
                                    type="button"
                                    className="text-gray-500 hover:text-gray-700"
                                    onClick={logout}
                                >
                                    <FaSignOutAlt className="h-5 w-5" />
                                </button>
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
