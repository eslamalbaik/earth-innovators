import { Link } from '@inertiajs/react';
import { FaRocket } from 'react-icons/fa';
import { useTranslation } from '@/i18n';

export default function CTASection({
    title,
    description,
    primaryButtonText,
    secondaryButtonText,
    primaryButtonLink = "/register",
    onPrimaryButtonClick,
    onSecondaryButtonClick,
    compact = false
}) {
    const { t } = useTranslation();
    
    const displayTitle = title || t('sections.cta.title');
    const displayDescription = description || t('sections.cta.description');
    const displayPrimaryButtonText = primaryButtonText || t('sections.cta.registerNow');
    const displaySecondaryButtonText = secondaryButtonText || t('sections.cta.contactUs');

    return (
        <div className="text-center">
            <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center">
                    <FaRocket className="text-white text-3xl" />
                </div>
            </div>
            
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
                {displayTitle}
            </h2>
            
            <p className="text-white/80 text-sm md:text-base mb-6 max-w-2xl mx-auto">
                {displayDescription}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                    onClick={onPrimaryButtonClick}
                    className="px-8 py-3 bg-white text-[#A3C042] font-bold rounded-xl hover:bg-gray-100 transition shadow-lg"
                >
                    {displayPrimaryButtonText}
                </button>
                {onSecondaryButtonClick && (
                    <button
                        onClick={onSecondaryButtonClick}
                        className="px-8 py-3 bg-transparent border-2 border-white text-white font-bold rounded-xl hover:bg-white/10 transition"
                    >
                        {displaySecondaryButtonText}
                    </button>
                )}
            </div>
        </div>
    );
}