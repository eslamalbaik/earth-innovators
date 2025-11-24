import SectionTitle from '../SectionTitle';
import { FaVideo, FaCalendarAlt, FaUserCheck, FaHeadset, FaStar, FaShieldAlt } from 'react-icons/fa';

const defaultFeatures = [
    {
        icon: FaVideo,
        title: "مشاركة المشاريع الإبداعية",
        description: "ارفع مشاريعك الإبداعية (ملفات، صور، تقارير) وشاركها مع المجتمع التعليمي."
    },
    {
        icon: FaCalendarAlt,
        title: "تحديات تعليمية مثيرة",
        description: "شارك في التحديات والمسابقات التعليمية في مجالات متنوعة (علوم، بيني، تراثي، تقني)."
    },
    {
        icon: FaUserCheck,
        title: "نظام تحفيزي متكامل",
        description: "احصل على الشارات والنقاط والمكافآت عند تحقيق الإنجازات والمشاركة في التحديات."
    },
    {
        icon: FaHeadset,
        title: "دعم المعلمين والمشرفين",
        description: "متابعة وتقييم من قبل المعلمين المشرفين للمساعدة في تطوير المشاريع."
    },
    {
        icon: FaStar,
        title: "شهادات تقدير",
        description: "احصل على شهادات تقدير للمدارس والطلاب المتميزين في الابتكار والإبداع."
    },
    {
        icon: FaShieldAlt,
        title: "باقات متنوعة",
        description: "باقات اشتراك مناسبة للمدارس والطلاب مع ميزات متقدمة ودعم شامل."
    }
];

export default function PlatformFeaturesSection({
    title = "منصة متكاملة للإبداع والابتكار",
    subtitle = "جميع الأدوات والميزات التي تحتاجها لتكون جزءاً من مجتمع المبتكرين والموهوبين.",
    features = defaultFeatures
}) {
    return (
        <section className="py-16">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div>
                    <div className="text-center">
                        <SectionTitle
                            text={title}
                            size="xl"
                            align="center"
                            className="pb-2"
                        />

                        <p className="text-lg text-gray-800 max-w-3xl mx-auto leading-relaxed">
                            {subtitle}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 p-2 md:p-0 md:pt-12">
                        {features.map((feature, index) => (
                            <div key={index} className="bg-white rounded-lg p-4 md:p-6 shadow-lg">
                                <div className="w-12 h-12 bg-gradient-to-br from-legacy-green/20 to-legacy-blue/20 rounded-lg flex items-center justify-center mb-4">
                                    <feature.icon className="text-legacy-green text-xl" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-1">{feature.title}</h3>
                                <p className="text-gray-700 leading-relaxed">
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
