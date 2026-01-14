import { FaVideo, FaCalendarAlt, FaUserCheck, FaHeadset, FaStar, FaShieldAlt, FaLightbulb } from 'react-icons/fa';

const defaultFeatures = [
    {
        icon: FaVideo,
        title: "مشاركة المشاريع الإبداعية",
        description: "ارفع مشاريعك الإبداعية (ملفات، صور، تقارير) وشاركها مع المجتمع التعليمي.",
        color: "from-blue-500/20 to-cyan-500/20",
        iconColor: "text-blue-600"
    },
    {
        icon: FaCalendarAlt,
        title: "تحديات تعليمية مثيرة",
        description: "شارك في التحديات والمسابقات التعليمية في مجالات متنوعة (علوم، بيني، تراثي، تقني).",
        color: "from-yellow-500/20 to-orange-500/20",
        iconColor: "text-yellow-600"
    },
    {
        icon: FaUserCheck,
        title: "نظام تحفيزي متكامل",
        description: "احصل على الشارات والنقاط والمكافآت عند تحقيق الإنجازات والمشاركة في التحديات.",
        color: "from-green-500/20 to-emerald-500/20",
        iconColor: "text-green-600"
    },
    {
        icon: FaHeadset,
        title: "دعم المعلمين والمشرفين",
        description: "متابعة وتقييم من قبل المعلمين المشرفين للمساعدة في تطوير المشاريع.",
        color: "from-purple-500/20 to-pink-500/20",
        iconColor: "text-purple-600"
    },
    {
        icon: FaStar,
        title: "شهادات تقدير",
        description: "احصل على شهادات تقدير للمؤسسات تعليمية والطلاب المتميزين في الابتكار والإبداع.",
        color: "from-[#A3C042]/20 to-[#93b03a]/20",
        iconColor: "text-[#A3C042]"
    },
    {
        icon: FaShieldAlt,
        title: "باقات متنوعة",
        description: "باقات اشتراك مناسبة للمؤسسات تعليمية والطلاب مع ميزات متقدمة ودعم شامل.",
        color: "from-indigo-500/20 to-blue-500/20",
        iconColor: "text-indigo-600"
    }
];

export default function PlatformFeaturesSection({
    title = "منصة متكاملة للإبداع والابتكار",
    subtitle = "جميع الأدوات والميزات التي تحتاجها لتكون جزءاً من مجتمع المبتكرين والموهوبين.",
    features = defaultFeatures,
    compact = false
}) {
    return (
        <div className="space-y-4 md:space-y-6">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-[#A3C042]/20 to-[#93b03a]/20 rounded-xl flex items-center justify-center">
                    <FaLightbulb className="text-[#A3C042] text-xl" />
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-900">{title}</h2>
            </div>

            <p className="text-sm md:text-base text-gray-700 leading-relaxed mb-6">
                {subtitle}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {features.map((feature, index) => {
                    const Icon = feature.icon;
                    return (
                        <div key={index} className="bg-white rounded-2xl border border-gray-100 p-4 md:p-6 shadow-sm hover:shadow-md transition">
                            <div className={`w-12 h-12 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-4`}>
                                <Icon className={`${feature.iconColor} text-xl`} />
                            </div>
                            <h3 className="text-base md:text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                            <p className="text-sm md:text-base text-gray-700 leading-relaxed">
                                {feature.description}
                            </p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
