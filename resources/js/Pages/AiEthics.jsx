import { Head, router } from '@inertiajs/react';
import {
    FaRobot, FaShieldAlt, FaBalanceScale, FaUserCheck, FaLock,
    FaHistory, FaGavel, FaTrashAlt, FaCommentDots, FaLightbulb, FaLandmark,
} from 'react-icons/fa';
import MobileAppLayout from '../Layouts/MobileAppLayout';
import MobileTopBar from '@/Components/Mobile/MobileTopBar';
import MobileBottomNav from '@/Components/Mobile/MobileBottomNav';
import DesktopFooter from '@/Components/Mobile/DesktopFooter';
import { useTranslation } from '@/i18n';

export default function AiEthics({ auth }) {
    const { t, language } = useTranslation();
    const user = auth?.user || null;
    const isAuthed = !!user;
    const isArabic = language === 'ar';

    const principles = [
        { icon: FaCommentDots, key: 'disclosure' },
        { icon: FaLightbulb, key: 'explainability' },
        { icon: FaUserCheck, key: 'humanReview' },
        { icon: FaBalanceScale, key: 'fairness' },
        { icon: FaLock, key: 'dataProtection' },
        { icon: FaHistory, key: 'auditLog' },
        { icon: FaGavel, key: 'appeal' },
        { icon: FaTrashAlt, key: 'retention' },
    ];

    const AiEthicsContent = ({ isDesktop = false }) => (
        <div className={`space-y-6 ${isDesktop ? 'lg:space-y-8' : ''}`}>
            <div className="relative bg-gradient-to-br from-[#A3C042] via-[#8CA635] to-[#7a9a2f] rounded-3xl p-6 md:p-12 text-white overflow-hidden">
                <div className="absolute top-0 start-0 w-64 h-64 bg-white/10 rounded-full -ms-32 -mt-32 blur-3xl"></div>
                <div className="absolute bottom-0 end-0 w-48 h-48 bg-white/10 rounded-full -me-24 -mb-24 blur-2xl"></div>
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 md:w-16 md:h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                            <FaRobot className="text-2xl md:text-3xl" />
                        </div>
                        <h1 className="text-2xl md:text-4xl font-extrabold">{t('aiEthics.title')}</h1>
                    </div>
                    <p className="text-white/90 text-sm md:text-lg leading-relaxed max-w-3xl">
                        {t('aiEthics.heroDescription')}
                    </p>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#A3C042]/20 to-[#8CA635]/20 rounded-xl flex items-center justify-center">
                        <FaShieldAlt className="text-[#A3C042] text-xl" />
                    </div>
                    <h2 className="text-xl md:text-2xl font-bold text-gray-900">{t('aiEthics.commitmentTitle')}</h2>
                </div>
                <p className="text-gray-700 leading-relaxed text-sm md:text-base">
                    {t('aiEthics.commitmentDescription')}
                </p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-xl flex items-center justify-center">
                        <FaLandmark className="text-emerald-600 text-xl" />
                    </div>
                    <h2 className="text-xl md:text-2xl font-bold text-gray-900">{t('aiEthics.complianceTitle')}</h2>
                </div>
                <p className="text-gray-700 leading-relaxed text-sm md:text-base">
                    {t('aiEthics.complianceDescription')}
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                {principles.map(({ icon: Icon, key }) => (
                    <div
                        key={key}
                        className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition"
                    >
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-[#A3C042]/20 to-[#8CA635]/20 rounded-xl flex items-center justify-center flex-shrink-0">
                                <Icon className="text-[#A3C042] text-lg" />
                            </div>
                            <h3 className="text-base md:text-lg font-bold text-gray-900">
                                {t(`aiEthics.principles.${key}.title`)}
                            </h3>
                        </div>
                        <p className="text-gray-700 text-sm leading-relaxed">
                            {t(`aiEthics.principles.${key}.description`)}
                        </p>
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl flex items-center justify-center">
                        <FaCommentDots className="text-purple-600 text-xl" />
                    </div>
                    <h2 className="text-xl md:text-2xl font-bold text-gray-900">{t('aiEthics.contactTitle')}</h2>
                </div>
                <p className="text-gray-700 leading-relaxed text-sm md:text-base">
                    {t('aiEthics.contactDescription')}
                </p>
            </div>
        </div>
    );

    return (
        <div dir={isArabic ? 'rtl' : 'ltr'} className="min-h-screen bg-gray-50">
            <Head title={t('aiEthics.pageTitle', { appName: t('common.appName') })} />

            <div className="block md:hidden">
                <MobileAppLayout
                    auth={auth}
                    title={t('aiEthics.title')}
                    activeNav="explore"
                    unreadCount={isAuthed ? (auth?.unreadCount || 0) : 0}
                    onNotifications={() => router.visit(isAuthed ? '/notifications' : '/login')}
                    onBack={() => router.visit('/')}
                >
                    <AiEthicsContent isDesktop={false} />
                </MobileAppLayout>
            </div>

            <div className="hidden md:block">
                <MobileTopBar
                    title={t('aiEthics.title')}
                    unreadCount={isAuthed ? (auth?.unreadCount || 0) : 0}
                    onNotifications={() => router.visit(isAuthed ? '/notifications' : '/login')}
                    onBack={() => router.visit('/')}
                    reverseOrder={false}
                    auth={auth}
                />
                <main className="mx-auto w-full max-w-7xl px-6 pb-24 pt-8">
                    <AiEthicsContent isDesktop={true} />
                </main>
                <MobileBottomNav active="explore" role={user?.role} isAuthed={isAuthed} user={user} />
                <DesktopFooter auth={auth} />
            </div>
        </div>
    );
}
