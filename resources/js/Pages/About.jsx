import { Head, router } from '@inertiajs/react';
import { FaRocket, FaUsers, FaLightbulb, FaBullseye, FaTrophy, FaCheckCircle, FaEnvelope, FaPhone, FaMapMarkerAlt, FaArrowRight, FaStar, FaAward, FaGraduationCap } from 'react-icons/fa';
import MobileAppLayout from '../Layouts/MobileAppLayout';
import MobileTopBar from '@/Components/Mobile/MobileTopBar';
import MobileBottomNav from '@/Components/Mobile/MobileBottomNav';
import DesktopFooter from '@/Components/Mobile/DesktopFooter';

export default function About({ auth }) {
    const user = auth?.user || null;
    const isAuthed = !!user;

    const achievements = [
        { icon: FaTrophy, number: '500+', label: 'مشروع إبداعي منشور', color: 'from-yellow-400 to-orange-500' },
        { icon: FaRocket, number: '50+', label: 'تحدٍ تعليمي نشط', color: 'from-blue-400 to-purple-500' },
        { icon: FaAward, number: '200+', label: 'شارة ممنوحة', color: 'from-green-400 to-emerald-500' },
        { icon: FaGraduationCap, number: '30+', label: 'مدرسة في الإمارات', color: 'from-pink-400 to-rose-500' },
    ];

    const goals = [
        "توفير بيئة محفزة للطلاب لعرض مشاريعهم الإبداعية",
        "تمكين المعلمين من متابعة وتقييم مشاريع الطلاب",
        "تنظيم تحديبات ومسابقات تعليمية في مجالات متنوعة",
        "بناء نظام تحفيزي بالشارات والنقاط والمكافآت",
        "إصدار الشهادات للمؤسسات تعليمية والطلاب المتميزين",
        "المساهمة في بناء جيل من المبتكرين والموهوبين"
    ];

    const contactInfo = [
        { icon: FaEnvelope, text: "info@innovatorslegacy.ae", label: "البريد الإلكتروني", color: "from-blue-500/20 to-cyan-500/20", iconColor: "text-blue-600" },
        { icon: FaPhone, text: "+971 4 XXX XXXX", label: "الهاتف", color: "from-green-500/20 to-emerald-500/20", iconColor: "text-green-600" },
        { icon: FaMapMarkerAlt, text: "دبي، الإمارات العربية المتحدة", label: "العنوان", color: "from-purple-500/20 to-pink-500/20", iconColor: "text-purple-600" },
    ];

    const AboutContent = ({ isDesktop = false }) => (
        <div className={`space-y-6 ${isDesktop ? 'lg:space-y-8' : ''}`}>
            {/* Hero Section */}
            <div className="relative bg-gradient-to-br from-[#A3C042] via-[#93b03a] to-[#7a9a2f] rounded-3xl p-6 md:p-12 text-white overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24 blur-2xl"></div>
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 md:w-16 md:h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                            <FaRocket className="text-2xl md:text-3xl" />
                        </div>
                        <h1 className="text-2xl md:text-4xl font-extrabold">من نحن</h1>
                    </div>
                    <p className="text-white/90 text-sm md:text-lg leading-relaxed max-w-3xl">
                        منصة إرث المبتكرين هي منصة إلكترونية تعليمية تهدف إلى بناء مجتمع من المبتكرين والموهوبين في المؤسسات تعليمية. تعمل على ربط الطلاب المبتكرين مع المعلمين والمشرفين، وتتيح مشاركة المشاريع الإبداعية والمشاركة في التحديات والمسابقات التعليمية.
                    </p>
                </div>
            </div>

            {/* About Details Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#A3C042]/20 to-[#93b03a]/20 rounded-xl flex items-center justify-center">
                            <FaUsers className="text-[#A3C042] text-xl" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">مجتمع المبتكرين</h3>
                    </div>
                    <p className="text-gray-700 leading-relaxed">
                        توفر المنصة بيئة محفزة للطلاب لعرض مشاريعهم الإبداعية، وتمكن المعلمين من متابعة وتقييم مشاريع الطلاب، وتنظيم تحديبات ومسابقات تعليمية في مجالات متنوعة (علوم، فني، تراثي، تقني).
                    </p>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl flex items-center justify-center">
                            <FaStar className="text-blue-600 text-xl" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">نظام التحفيز</h3>
                    </div>
                    <p className="text-gray-700 leading-relaxed">
                        اليوم، نعمل على بناء نظام تحفيزي بالشارات والنقاط والمكافآت، وإصدار الشهادات للمؤسسات تعليمية والطلاب المتميزين، لتحفيز الإبداع والابتكار في المجتمع التعليمي.
                    </p>
                </div>
            </div>

            {/* Achievements Section */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#A3C042]/20 to-[#93b03a]/20 rounded-xl flex items-center justify-center">
                        <FaTrophy className="text-[#A3C042] text-xl" />
                    </div>
                    <h2 className="text-xl md:text-2xl font-bold text-gray-900">إنجازاتنا</h2>
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

            {/* Vision & Goals Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                {/* Vision Card */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8 shadow-sm hover:shadow-md transition">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#A3C042]/20 to-[#93b03a]/20 rounded-xl flex items-center justify-center">
                            <FaLightbulb className="text-[#A3C042] text-xl" />
                        </div>
                        <h2 className="text-xl md:text-2xl font-bold text-gray-900">رؤيتنا</h2>
                    </div>
                    <p className="text-gray-700 leading-relaxed text-sm md:text-base">
                        أن نكون المنصة التعليمية الرائدة في المنطقة التي تبني مجتمعاً من المبتكرين والموهوبين في المؤسسات تعليمية، من خلال توفير بيئة محفزة للإبداع والابتكار، وربط الطلاب المبتكرين مع المعلمين والمشرفين، وتنظيم التحديات والمسابقات التعليمية المثيرة.
                    </p>
                </div>

                {/* Goals Card */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8 shadow-sm hover:shadow-md transition">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl flex items-center justify-center">
                            <FaBullseye className="text-purple-600 text-xl" />
                        </div>
                        <h2 className="text-xl md:text-2xl font-bold text-gray-900">أهدافنا</h2>
                    </div>
                    <div className="space-y-3">
                        {goals.map((goal, index) => (
                            <div key={index} className="flex items-start gap-3">
                                <div className="w-6 h-6 bg-gradient-to-br from-[#A3C042]/20 to-[#93b03a]/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <FaCheckCircle className="text-[#A3C042] text-xs" />
                                </div>
                                <p className="text-gray-700 text-sm md:text-base leading-relaxed flex-1">{goal}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Contact Section */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#A3C042]/20 to-[#93b03a]/20 rounded-xl flex items-center justify-center">
                        <FaEnvelope className="text-[#A3C042] text-xl" />
                    </div>
                    <h2 className="text-xl md:text-2xl font-bold text-gray-900">تواصل معنا</h2>
                </div>
                <p className="text-sm md:text-base text-gray-600 mb-6">نحن هنا للإجابة على استفساراتك ومساعدتك</p>
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
        <div dir="rtl" className="min-h-screen bg-gray-50">
            <Head title="من نحن - إرث المبتكرين" />

            {/* Mobile View */}
            <div className="block md:hidden">
                <MobileAppLayout
                    auth={auth}
                    title="من نحن"
                    activeNav="explore"
                    unreadCount={isAuthed ? (auth?.unreadCount || 0) : 0}
                    onNotifications={() => router.visit(isAuthed ? '/notifications' : '/login')}
                    onBack={() => router.visit('/')}
                >
                    <AboutContent isDesktop={false} />
                </MobileAppLayout>
            </div>

            {/* Desktop View */}
            <div className="hidden md:block">
                <MobileTopBar
                    title="من نحن"
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
