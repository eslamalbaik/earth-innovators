import { Head, router } from '@inertiajs/react';
import { FaRocket, FaUsers, FaLightbulb, FaBullseye, FaTrophy, FaCheckCircle, FaEnvelope, FaPhone, FaMapMarkerAlt, FaStar, FaAward, FaGraduationCap } from 'react-icons/fa';
import MobileAppLayout from '../Layouts/MobileAppLayout';
import MobileTopBar from '@/Components/Mobile/MobileTopBar';
import MobileBottomNav from '@/Components/Mobile/MobileBottomNav';
import DesktopFooter from '@/Components/Mobile/DesktopFooter';
import { useTranslation } from '@/i18n';

export default function About({ auth }) {
    const { t, language } = useTranslation();
    const user = auth?.user || null;
    const isAuthed = !!user;
    const isArabic = language === 'ar';

    const achievements = [
        { icon: FaTrophy, number: '500+', label: t('aboutPage.achievements.publishedProjects'), color: 'from-yellow-400 to-orange-500' },
        { icon: FaRocket, number: '50+', label: t('aboutPage.achievements.activeChallenges'), color: 'from-blue-400 to-purple-500' },
        { icon: FaAward, number: '200+', label: t('aboutPage.achievements.badgesAwarded'), color: 'from-green-400 to-emerald-500' },
        { icon: FaGraduationCap, number: '30+', label: t('aboutPage.achievements.uaeSchools'), color: 'from-pink-400 to-rose-500' },
    ];

    const goals = [
        t('aboutPage.goals.goal1'),
        t('aboutPage.goals.goal2'),
        t('aboutPage.goals.goal3'),
        t('aboutPage.goals.goal4'),
        t('aboutPage.goals.goal5'),
        t('aboutPage.goals.goal6'),
    ];

    const contactInfo = [
        { icon: FaEnvelope, text: t('aboutPage.contact.email'), label: t('aboutPage.contact.emailLabel'), color: 'from-blue-500/20 to-cyan-500/20', iconColor: 'text-blue-600' },
        { icon: FaPhone, text: t('aboutPage.contact.phone'), label: t('aboutPage.contact.phoneLabel'), color: 'from-green-500/20 to-emerald-500/20', iconColor: 'text-green-600' },
        { icon: FaMapMarkerAlt, text: t('aboutPage.contact.address'), label: t('aboutPage.contact.addressLabel'), color: 'from-purple-500/20 to-pink-500/20', iconColor: 'text-purple-600' },
    ];

    const AboutContent = ({ isDesktop = false }) => (
        <div className={`space-y-6 ${isDesktop ? 'lg:space-y-8' : ''}`}>
            <div className="relative bg-gradient-to-br from-[#A3C042] via-[#8CA635] to-[#7a9a2f] rounded-3xl p-6 md:p-12 text-white overflow-hidden">
                <div className="absolute top-0 start-0 w-64 h-64 bg-white/10 rounded-full -ms-32 -mt-32 blur-3xl"></div>
                <div className="absolute bottom-0 end-0 w-48 h-48 bg-white/10 rounded-full -me-24 -mb-24 blur-2xl"></div>
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 md:w-16 md:h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                            <FaRocket className="text-2xl md:text-3xl" />
                        </div>
                        <h1 className="text-2xl md:text-4xl font-extrabold">{t('aboutPage.title')}</h1>
                    </div>
                    <p className="text-white/90 text-sm md:text-lg leading-relaxed max-w-3xl">
                        {t('aboutPage.heroDescription')}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#A3C042]/20 to-[#8CA635]/20 rounded-xl flex items-center justify-center">
                            <FaUsers className="text-[#A3C042] text-xl" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">{t('aboutPage.communityTitle')}</h3>
                    </div>
                    <p className="text-gray-700 leading-relaxed">
                        {t('aboutPage.communityDescription')}
                    </p>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl flex items-center justify-center">
                            <FaStar className="text-blue-600 text-xl" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">{t('aboutPage.incentiveTitle')}</h3>
                    </div>
                    <p className="text-gray-700 leading-relaxed">
                        {t('aboutPage.incentiveDescription')}
                    </p>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#A3C042]/20 to-[#8CA635]/20 rounded-xl flex items-center justify-center">
                        <FaTrophy className="text-[#A3C042] text-xl" />
                    </div>
                    <h2 className="text-xl md:text-2xl font-bold text-gray-900">{t('aboutPage.achievementsTitle')}</h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                    {achievements.map((achievement, index) => {
                        const Icon = achievement.icon;
                        return (
                            <div
                                key={index}
                                className="bg-gray-50 rounded-2xl p-4 md:p-6 border border-gray-100 hover:shadow-md transition text-center"
                            >
                                <div className={`w-12 h-12 md:w-14 md:h-14 mx-auto mb-3 bg-gradient-to-br ${achievement.color} rounded-xl flex items-center justify-center shadow-sm`}>
                                    <Icon className="text-white text-lg md:text-xl" />
                                </div>
                                <div className="text-xl md:text-2xl font-extrabold text-gray-900 mb-1">{achievement.number}</div>
                                <div className="text-xs md:text-sm text-gray-600 font-semibold">{achievement.label}</div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8 shadow-sm hover:shadow-md transition">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#A3C042]/20 to-[#8CA635]/20 rounded-xl flex items-center justify-center">
                            <FaLightbulb className="text-[#A3C042] text-xl" />
                        </div>
                        <h2 className="text-xl md:text-2xl font-bold text-gray-900">{t('aboutPage.visionTitle')}</h2>
                    </div>
                    <p className="text-gray-700 leading-relaxed text-sm md:text-base">
                        {t('aboutPage.visionDescription')}
                    </p>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8 shadow-sm hover:shadow-md transition">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl flex items-center justify-center">
                            <FaBullseye className="text-purple-600 text-xl" />
                        </div>
                        <h2 className="text-xl md:text-2xl font-bold text-gray-900">{t('aboutPage.goalsTitle')}</h2>
                    </div>
                    <div className="space-y-3">
                        {goals.map((goal, index) => (
                            <div key={index} className="flex items-start gap-3">
                                <div className="w-6 h-6 bg-gradient-to-br from-[#A3C042]/20 to-[#8CA635]/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <FaCheckCircle className="text-[#A3C042] text-xs" />
                                </div>
                                <p className="text-gray-700 text-sm md:text-base leading-relaxed flex-1">{goal}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#A3C042]/20 to-[#8CA635]/20 rounded-xl flex items-center justify-center">
                        <FaEnvelope className="text-[#A3C042] text-xl" />
                    </div>
                    <h2 className="text-xl md:text-2xl font-bold text-gray-900">{t('aboutPage.contactTitle')}</h2>
                </div>
                <p className="text-sm md:text-base text-gray-600 mb-6">{t('aboutPage.contactSubtitle')}</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                    {contactInfo.map((contact, index) => {
                        const Icon = contact.icon;
                        return (
                            <div
                                key={index}
                                className="bg-gray-50 rounded-2xl p-4 md:p-6 border border-gray-100 hover:shadow-md transition"
                            >
                                <div className={`w-12 h-12 bg-gradient-to-br ${contact.color} rounded-xl flex items-center justify-center mb-4`}>
                                    <Icon className={`${contact.iconColor} text-lg`} />
                                </div>
                                <div className="text-xs font-semibold text-gray-500 mb-2">{contact.label}</div>
                                <div className="text-sm md:text-base font-bold text-gray-900">{contact.text}</div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );

    return (
        <div dir={isArabic ? 'rtl' : 'ltr'} className="min-h-screen bg-gray-50">
            <Head title={t('aboutPage.pageTitle', { appName: t('common.appName') })} />

            <div className="block md:hidden">
                <MobileAppLayout
                    auth={auth}
                    title={t('aboutPage.title')}
                    activeNav="explore"
                    unreadCount={isAuthed ? (auth?.unreadCount || 0) : 0}
                    onNotifications={() => router.visit(isAuthed ? '/notifications' : '/login')}
                    onBack={() => router.visit('/')}
                >
                    <AboutContent isDesktop={false} />
                </MobileAppLayout>
            </div>

            <div className="hidden md:block">
                <MobileTopBar
                    title={t('aboutPage.title')}
                    unreadCount={isAuthed ? (auth?.unreadCount || 0) : 0}
                    onNotifications={() => router.visit(isAuthed ? '/notifications' : '/login')}
                    onBack={() => router.visit('/')}
                    reverseOrder={false}
                    auth={auth}
                />
                <main className="mx-auto w-full max-w-7xl px-6 pb-24 pt-8">
                    <AboutContent isDesktop={true} />
                </main>
                <MobileBottomNav active="explore" role={user?.role} isAuthed={isAuthed} user={user} />
                <DesktopFooter auth={auth} />
            </div>
        </div>
    );
}
