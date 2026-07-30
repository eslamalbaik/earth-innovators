import { useTranslation } from '@/i18n';
import {
    RiBuilding2Fill,
    RiRobotFill,
    RiBrainFill,
    RiSignalTowerFill,
    RiLeafFill,
    RiFlaskFill,
} from 'react-icons/ri';

const AXES = [
    {
        icon: RiBuilding2Fill,
        ar: 'المدن المستدامة',
        en: 'Sustainable Cities',
        descAr: 'ابتكار حلول ذكية للمدن الحديثة',
        descEn: 'Smart solutions for modern cities',
        iconBg: 'bg-teal-500',
        cardBg: 'bg-teal-50',
    },
    {
        icon: RiRobotFill,
        ar: 'الروبوتات',
        en: 'Robotics',
        descAr: 'بناء وبرمجة الروبوتات التفاعلية',
        descEn: 'Build and program interactive robots',
        iconBg: 'bg-teal-400',
        cardBg: 'bg-slate-50',
    },
    {
        icon: RiBrainFill,
        ar: 'الذكاء الاصطناعي',
        en: 'AI',
        descAr: 'تعلّم أساسيات الذكاء الاصطناعي',
        descEn: 'Learn the fundamentals of AI',
        iconBg: 'bg-violet-500',
        cardBg: 'bg-violet-50',
    },
    {
        icon: RiSignalTowerFill,
        ar: 'الفضاء',
        en: 'Space',
        descAr: 'استكشاف علوم الفضاء والفلك',
        descEn: 'Explore space and astronomy',
        iconBg: 'bg-orange-500',
        cardBg: 'bg-orange-50',
    },
    {
        icon: RiLeafFill,
        ar: 'البيئة',
        en: 'Environment',
        descAr: 'حماية البيئة والتنمية المستدامة',
        descEn: 'Environmental protection & sustainability',
        iconBg: 'bg-[#A3C042]',
        cardBg: 'bg-green-50',
    },
    {
        icon: RiFlaskFill,
        ar: 'العلوم',
        en: 'Science',
        descAr: 'تجارب علمية ومشاريع مبتكرة',
        descEn: 'Scientific experiments & innovative projects',
        iconBg: 'bg-cyan-500',
        cardBg: 'bg-cyan-50',
    },
];

export default function InnovationAxesSection() {
    const { language } = useTranslation();
    const isAr = language === 'ar';

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="text-center">
                <h2 className="text-2xl font-extrabold text-gray-900 md:text-3xl">
                    {isAr ? 'محاور الابتكار' : 'Innovation Axes'}
                </h2>
                <div className="mx-auto mt-3 h-1 w-16 rounded-full bg-gradient-to-r from-[#A3C042] to-[#8CA635]" />
                <p className="mx-auto mt-3 max-w-xl text-sm text-gray-600 md:text-base">
                    {isAr
                        ? 'ستة محاور أساسية تغطّي مجالات الابتكار والإبداع'
                        : 'Six core axes covering the fields of innovation and creativity'}
                </p>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:gap-6">
                {AXES.map((axis, i) => {
                    const Icon = axis.icon;
                    return (
                        <div
                            key={i}
                            className={`group relative overflow-hidden rounded-2xl border border-gray-100 ${axis.cardBg} p-5 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg md:p-6`}
                        >
                            <div className="relative z-10 flex flex-col items-center">
                                {/* Rounded-xl icon tile — flat solid color like the design */}
                                <div className={`mb-4 flex h-14 w-14 items-center justify-center rounded-xl ${axis.iconBg} text-white shadow-md transition-transform duration-300 group-hover:scale-110`}>
                                    <Icon className="text-2xl" />
                                </div>
                                <h3 className="mb-1 text-sm font-bold text-gray-900 md:text-base">
                                    {isAr ? axis.ar : axis.en}
                                </h3>
                                <p className="text-xs text-gray-500 md:text-sm">
                                    {isAr ? axis.descAr : axis.descEn}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
