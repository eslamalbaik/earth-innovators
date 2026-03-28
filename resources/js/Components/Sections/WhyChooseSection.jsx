import { FaCheck, FaRocket } from 'react-icons/fa';
import { useTranslation } from '@/i18n';

export default function WhyChooseSection({
    title,
    subtitle,
    benefits = [],
    imageSrc = '/images/erth-img.jpg',
    imageAlt = 'Innovators Legacy',
    compact = false,
}) {
    const { t } = useTranslation();
    const resolvedTitle = title ?? t('sections.whyChoose');
    const resolvedSubtitle = subtitle ?? t('sections.whyChooseSubtitle');

    return (
        <div className="space-y-4 md:space-y-6">
            <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#A3C042]/20 to-[#8CA635]/20">
                    <FaRocket className="text-xl text-[#A3C042]" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 md:text-2xl">{resolvedTitle}</h2>
            </div>

            <p className="mb-6 text-sm leading-relaxed text-gray-700 md:text-base">
                {resolvedSubtitle}
            </p>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
                {benefits.map((benefit, index) => (
                    <div key={index} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition hover:shadow-md md:p-6">
                        <div className="flex items-start gap-3">
                            <div className="mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#A3C042]/20 to-[#8CA635]/20">
                                <FaCheck className="text-sm text-[#A3C042]" />
                            </div>
                            <div className="flex-1">
                                <h3 className="mb-2 text-base font-bold text-gray-900 md:text-lg">{benefit.title}</h3>
                                <p className="text-sm leading-relaxed text-gray-700 md:text-base">
                                    {benefit.description}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
