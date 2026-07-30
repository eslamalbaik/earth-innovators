import { useTranslation } from '@/i18n';
import { FaLightbulb, FaCogs, FaRocket, FaTrophy } from 'react-icons/fa';

const STEPS = [
    {
        icon: FaLightbulb,
        ar: 'الفكرة',
        en: 'The Idea',
        descAr: 'ابتكر فكرة جديدة ومبدعة',
        descEn: 'Come up with a creative idea',
        color: 'from-yellow-400 to-amber-500',
    },
    {
        icon: FaCogs,
        ar: 'التطوير',
        en: 'Development',
        descAr: 'طوّر فكرتك مع فريقك',
        descEn: 'Develop your idea with your team',
        color: 'from-blue-400 to-cyan-500',
    },
    {
        icon: FaRocket,
        ar: 'التنفيذ',
        en: 'Execution',
        descAr: 'نفّذ مشروعك على أرض الواقع',
        descEn: 'Bring your project to life',
        color: 'from-[#A3C042] to-[#8CA635]',
    },
    {
        icon: FaTrophy,
        ar: 'الإنجاز',
        en: 'Achievement',
        descAr: 'احتفل بإنجازك واحصل على شهادتك',
        descEn: 'Celebrate and earn your certificate',
        color: 'from-purple-500 to-indigo-500',
    },
];

export default function InnovatorJourneySection() {
    const { language } = useTranslation();
    const isAr = language === 'ar';

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="text-center">
                <h2 className="text-2xl font-extrabold text-gray-900 md:text-3xl">
                    {isAr ? 'رحلة المبتكر' : "Innovator's Journey"}
                </h2>
                <div className="mx-auto mt-3 h-1 w-16 rounded-full bg-gradient-to-r from-[#A3C042] to-[#8CA635]" />
                <p className="mx-auto mt-3 max-w-xl text-sm text-gray-600 md:text-base">
                    {isAr
                        ? 'أربع خطوات تأخذك من الفكرة إلى الإنجاز'
                        : 'Four steps that take you from idea to achievement'}
                </p>
            </div>

            {/* Timeline */}
            <div className="relative">
                {/* Connecting line — desktop only */}
                <div className="pointer-events-none absolute top-[52px] hidden h-0.5 bg-gradient-to-r from-yellow-300 via-[#A3C042] to-purple-400 lg:block"
                     style={{ left: '12.5%', right: '12.5%' }} />

                <div className="grid grid-cols-2 gap-6 lg:grid-cols-4 lg:gap-4">
                    {STEPS.map((step, i) => {
                        const Icon = step.icon;
                        return (
                            <div key={i} className="group flex flex-col items-center text-center">
                                {/* Step number + icon circle */}
                                <div className="relative mb-4">
                                    <div className={`flex h-[104px] w-[104px] items-center justify-center rounded-full bg-gradient-to-br ${step.color} shadow-lg ring-4 ring-white transition-transform duration-300 group-hover:scale-110`}>
                                        <Icon className="text-3xl text-white" />
                                    </div>
                                    {/* Step number badge */}
                                    <span className="absolute -bottom-1 -end-1 flex h-8 w-8 items-center justify-center rounded-full bg-white text-sm font-extrabold text-gray-800 shadow ring-2 ring-gray-100">
                                        {i + 1}
                                    </span>
                                </div>

                                {/* Label */}
                                <h3 className="mb-1 text-base font-bold text-gray-900 md:text-lg">
                                    {isAr ? step.ar : step.en}
                                </h3>
                                <p className="text-xs text-gray-500 md:text-sm">
                                    {isAr ? step.descAr : step.descEn}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
