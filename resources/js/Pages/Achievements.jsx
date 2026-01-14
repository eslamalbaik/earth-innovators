import { Head, router } from '@inertiajs/react';
import { FaTrophy, FaHeart, FaBug, FaRocket, FaBrain, FaCheckCircle, FaLock, FaMedal, FaStar, FaAward, FaChartLine } from 'react-icons/fa';
import MobileTopBar from '@/Components/Mobile/MobileTopBar';
import MobileBottomNav from '@/Components/Mobile/MobileBottomNav';

export default function Achievements({ auth, user, badges = [], points = 0, recentAchievements = [] }) {
    const totalPoints = user?.points || points || 0;

    // Learner Journey Levels
    const learnerLevels = [
        {
            title: 'رائد في الإبداع المجتمعي',
            points: '21-50 نقطة',
            gradient: 'from-pink-500 to-green-500',
            leftIcon: FaHeart,
            rightIcon: '❤️',
        },
        {
            title: 'ملهم في طور التكوين',
            points: '0-20 نقطة',
            gradient: 'from-green-500 to-purple-500',
            leftIcon: FaBug,
            rightIcon: '🐛',
        },
        {
            title: 'صانع لتغيير إبداعي',
            points: '21-50 نقطة',
            gradient: 'from-yellow-500 to-blue-500',
            leftIcon: FaRocket,
            rightIcon: '🚀',
        },
        {
            title: 'قائد إبداعي',
            points: '51-80 نقطة',
            gradient: 'from-purple-500 to-purple-700',
            leftIcon: FaBrain,
            rightIcon: '🧠',
        },
    ];

    // Points Distribution
    const pointsDistribution = [
        { type: 'مشاركة بسيطة', icon: '✏️', points: '2 نقطة', multiplier: 'x10', total: '= 20', color: 'bg-green-100', iconBg: 'bg-green-100' },
        { type: 'مهمة متوسطة', icon: '🔧', points: '4-6 نقطة', multiplier: 'x8', total: '= 48', color: 'bg-blue-100', iconBg: 'bg-blue-100' },
        { type: 'مبادرة مجتمعية', icon: '▼', points: '6-8 نقطة', multiplier: 'x5', total: '= 40', color: 'bg-purple-100', iconBg: 'bg-purple-100' },
        { type: 'مشروع مؤثر', icon: '🚀', points: '8-10 نقطة', multiplier: 'x3', total: '= 30', color: 'bg-orange-100', iconBg: 'bg-orange-100' },
    ];

    // Badges (earned and locked) - use backend data if available
    const allBadges = badges.length > 0 ? badges.map((badge, index) => ({
        id: badge.id || index + 1,
        name: badge.name_ar || badge.name || 'شارة',
        icon: FaMedal,
        color: badge.color || 'bg-green-500',
        earned: true,
    })) : [
        { id: 1, name: 'مشروع مميز', icon: FaMedal, color: 'bg-green-500', earned: true },
        { id: 2, name: '5 مشاريع مكتملة', icon: FaStar, color: 'bg-blue-500', earned: true },
        { id: 3, name: 'مقفلة', icon: FaLock, color: 'bg-gray-300', earned: false },
        { id: 4, name: 'مبتكر الشهر', icon: FaTrophy, color: 'bg-orange-500', earned: true },
    ];

    // Recent Achievements - use backend data if available
    const achievements = recentAchievements.length > 0 ? recentAchievements.map((achievement, index) => ({
        id: achievement.id || index + 1,
        title: achievement.title || achievement.description || 'إنجاز جديد',
        description: achievement.description || achievement.title || 'حصلت على نقاط جديدة',
        points: achievement.points || 0,
        icon: FaStar,
        iconColor: 'bg-pink-500',
        created_at: achievement.created_at,
    })) : [
        {
            id: 1,
            title: 'إكمال المشروع الثالث',
            description: 'أكملت مشروع "الابتكار الرقمي" بنجاح',
            points: 15,
            icon: FaStar,
            iconColor: 'bg-pink-500',
        },
        {
            id: 2,
            title: 'الحصول على شارة مميزة',
            description: 'حصلت على شارة "مبتكر الشهر" لتميزك في المشاريع',
            points: 25,
            icon: FaMedal,
            iconColor: 'bg-orange-500',
        },
    ];

    const AchievementsContent = ({ isDesktop = false }) => (
        <div className={`space-y-4 ${isDesktop ? 'lg:grid lg:grid-cols-2 lg:gap-6 lg:space-y-0' : ''}`}>
            {/* Left Column - Desktop */}
            <div className={isDesktop ? 'space-y-4' : ''}>
                {/* Learner Journey Levels */}
                <div>
                    <h3 className="text-sm font-extrabold text-gray-900 mb-3">مستويات رحلة المتعلم</h3>
                    <div className="grid grid-cols-2 gap-3">
                    {learnerLevels.map((level, index) => {
                        const LeftIcon = level.leftIcon;
                        return (
                            <div
                                key={index}
                                className={`bg-gradient-to-br ${level.gradient} rounded-2xl p-4 text-white relative overflow-hidden`}
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-2xl">{level.rightIcon}</span>
                                </div>
                                <div className="mt-3">
                                    <div className="text-xs font-bold mb-1">{level.title}</div>
                                    <div className="text-[10px] opacity-90">{level.points}</div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Points Distribution */}
            <div className="bg-white rounded-2xl border border-gray-100 p-4">
                <div className="flex items-center gap-2 mb-3">
                    <FaCheckCircle className="text-[#A3C042] text-lg" />
                    <h3 className="text-sm font-extrabold text-gray-900">توزيع النقاط</h3>
                </div>
                <div className="text-xs text-gray-600 mb-4">الحد الاقصى : 100 نقطة</div>
                <div className="space-y-3">
                    {pointsDistribution.map((item, index) => (
                        <div key={index} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className={`w-6 h-6 rounded-full ${item.iconBg} flex items-center justify-center`}>
                                    <span className="text-xs">{item.icon}</span>
                                </div>
                                <span className="text-xs text-gray-700">{item.type}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold text-gray-700">{item.points}</span>
                                <span className="text-xs text-gray-500">{item.multiplier}</span>
                                <span className="text-xs font-bold text-gray-900">{item.total}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            </div>

            {/* Right Column - Desktop */}
            <div className={isDesktop ? 'space-y-4' : ''}>
                {/* Badges */}
                <div className="bg-white rounded-2xl border border-gray-100 p-4">
                    <h3 className="text-sm font-extrabold text-gray-900 mb-3">الشارات</h3>
                    <div className="grid grid-cols-2 gap-3">
                        {allBadges.map((badge) => {
                            const Icon = badge.icon;
                            return (
                                <div
                                    key={badge.id}
                                    className={`${badge.color} rounded-2xl p-4 text-white text-center ${
                                        !badge.earned ? 'opacity-50' : ''
                                    }`}
                                >
                                    <Icon className="mx-auto text-2xl mb-2" />
                                    <div className="text-[10px] font-bold">{badge.name}</div>
                                </div>
                            );
                        })}
                    </div>
                </div>

            {/* Link to Store Membership */}
            <button
                type="button"
                onClick={() => router.visit('/store-membership')}
                className="w-full bg-gradient-to-r from-[#A3C042] to-[#93b03a] text-white rounded-2xl p-4 font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition"
            >
                <FaChartLine />
                بطاقة عضوية المتجر
            </button>

            {/* Recent Achievements */}
            <div className="bg-white rounded-2xl border border-gray-100 p-4">
                <h3 className="text-sm font-extrabold text-gray-900 mb-3">إنجازات حديثة</h3>
                <div className="space-y-3">
                    {achievements.map((achievement) => {
                        const Icon = achievement.icon;
                        return (
                            <div
                                key={achievement.id}
                                className="bg-[#eef8d6] rounded-2xl p-3 flex items-start justify-between gap-3"
                            >
                                <div className="flex-1">
                                    <div className="text-xs font-bold text-gray-900 mb-1">{achievement.title}</div>
                                    <div className="text-[10px] text-gray-600">{achievement.description}</div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="px-2 py-1 rounded-full bg-[#A3C042] text-white text-[10px] font-bold">
                                        +{achievement.points} نقطة
                                    </span>
                                    <div className={`${achievement.iconColor} w-8 h-8 rounded-full flex items-center justify-center`}>
                                        <Icon className="text-white text-xs" />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div dir="rtl" className="min-h-screen bg-gray-50">
            <Head title="الإنجازات والنقاط - إرث المبتكرين" />

            {/* Mobile View */}
            <div className="block md:hidden">
                <MobileTopBar
                    title="الإنجازات والنقاط"
                    unreadCount={auth?.unreadCount || 0}
                    onNotifications={() => router.visit('/notifications')}
                    onBack={() => router.visit('/profile')}
                />
                <main className="px-4 pb-24 pt-4">
                    <AchievementsContent isDesktop={false} />
                </main>
                <MobileBottomNav active="profile" role={auth?.user?.role} isAuthed={!!auth?.user} user={auth?.user} />
            </div>

            {/* Desktop View */}
            <div className="hidden md:block">
                <MobileTopBar
                    title="الإنجازات والنقاط"
                    unreadCount={auth?.unreadCount || 0}
                    onNotifications={() => router.visit('/notifications')}
                    onBack={() => router.visit('/profile')}
                />
                <main className="mx-auto w-full max-w-6xl px-4 pb-24 pt-4">
                    <div className="mx-auto w-full max-w-4xl">
                        <AchievementsContent isDesktop={true} />
                    </div>
                </main>
                <MobileBottomNav active="profile" role={auth?.user?.role} isAuthed={!!auth?.user} user={auth?.user} />
            </div>
        </div>
    );
}

