import { FaVideo, FaCalendarAlt, FaUserCheck, FaHeadset, FaStar, FaShieldAlt, FaLightbulb } from 'react-icons/fa';
import { useTranslation } from '@/i18n';

export default function PlatformFeaturesSection({
    title,
    subtitle,
    features,
    compact = false
}) {
    const { t } = useTranslation();
    
    const defaultFeatures = [
        {
            icon: FaVideo,
            title: t('features.feature1Title'),
            description: t('features.feature1Desc'),
            color: "from-blue-500/20 to-cyan-500/20",
            iconColor: "text-blue-600"
        },
        {
            icon: FaCalendarAlt,
            title: t('features.feature2Title'),
            description: t('features.feature2Desc'),
            color: "from-yellow-500/20 to-orange-500/20",
            iconColor: "text-yellow-600"
        },
        {
            icon: FaUserCheck,
            title: t('features.feature3Title'),
            description: t('features.feature3Desc'),
            color: "from-green-500/20 to-emerald-500/20",
            iconColor: "text-green-600"
        },
        {
            icon: FaHeadset,
            title: t('features.feature4Title'),
            description: t('features.feature4Desc'),
            color: "from-purple-500/20 to-pink-500/20",
            iconColor: "text-purple-600"
        },
        {
            icon: FaStar,
            title: t('features.feature5Title'),
            description: t('features.feature5Desc'),
            color: "from-[#A3C042]/20 to-[#8CA635]/20",
            iconColor: "text-[#A3C042]"
        },
        {
            icon: FaShieldAlt,
            title: t('features.feature6Title'),
            description: t('features.feature6Desc'),
            color: "from-indigo-500/20 to-blue-500/20",
            iconColor: "text-indigo-600"
        }
    ];
    
    const displayTitle = title || t('features.title');
    const displaySubtitle = subtitle || t('features.subtitle');
    const displayFeatures = features || defaultFeatures;
    return (
        <div className="space-y-4 md:space-y-6">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-[#A3C042]/20 to-[#8CA635]/20 rounded-xl flex items-center justify-center">
                    <FaLightbulb className="text-[#A3C042] text-xl" />
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-900">{displayTitle}</h2>
            </div>

            <p className="text-sm md:text-base text-gray-700 leading-relaxed mb-6">
                {displaySubtitle}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {displayFeatures.map((feature, index) => {
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