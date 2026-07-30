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
    const { t, language } = useTranslation();
    const isAr = language === 'ar';

    const displayTitle = title || t('sections.cta.title');
    const displayDescription = description || t('sections.cta.description');
    const displayPrimaryButtonText = primaryButtonText || t('sections.cta.registerNow');
    const displaySecondaryButtonText = secondaryButtonText || t('sections.cta.contactUs');

    return (
        <div className="relative overflow-hidden">
            {/* UAE-themed decorative elements */}
            <div className="pointer-events-none absolute inset-0">
                {/* Left city silhouette */}
                <div className="absolute bottom-0 start-0 h-40 w-48 opacity-10">
                    <svg viewBox="0 0 200 160" fill="white" className="h-full w-full">
                        <rect x="10" y="60" width="18" height="100" rx="2" />
                        <rect x="35" y="30" width="14" height="130" rx="2" />
                        <rect x="55" y="50" width="20" height="110" rx="2" />
                        <rect x="80" y="10" width="12" height="150" rx="2" />
                        <rect x="98" y="40" width="22" height="120" rx="2" />
                        <rect x="126" y="70" width="16" height="90" rx="2" />
                        <rect x="148" y="20" width="14" height="140" rx="2" />
                        <rect x="168" y="55" width="20" height="105" rx="2" />
                    </svg>
                </div>
                {/* Right city silhouette */}
                <div className="absolute bottom-0 end-0 h-40 w-48 opacity-10">
                    <svg viewBox="0 0 200 160" fill="white" className="h-full w-full" style={{ transform: 'scaleX(-1)' }}>
                        <rect x="10" y="60" width="18" height="100" rx="2" />
                        <rect x="35" y="30" width="14" height="130" rx="2" />
                        <rect x="55" y="50" width="20" height="110" rx="2" />
                        <rect x="80" y="10" width="12" height="150" rx="2" />
                        <rect x="98" y="40" width="22" height="120" rx="2" />
                        <rect x="126" y="70" width="16" height="90" rx="2" />
                        <rect x="148" y="20" width="14" height="140" rx="2" />
                        <rect x="168" y="55" width="20" height="105" rx="2" />
                    </svg>
                </div>
                {/* Glowing orbs */}
                <div className="absolute -top-20 start-1/4 h-40 w-40 rounded-full bg-[#A3C042]/20 blur-3xl" />
                <div className="absolute -bottom-10 end-1/3 h-32 w-32 rounded-full bg-[#8CA635]/20 blur-3xl" />
            </div>

            <div className="relative z-10 text-center py-4">
                {/* Title with decorative dots */}
                <div className="mb-2 flex items-center justify-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#A3C042]" />
                    <span className="text-xs font-bold uppercase tracking-widest text-[#A3C042]">
                        {isAr ? 'ابنِ اليوم' : 'Build Today'}
                    </span>
                    <span className="h-1.5 w-1.5 rounded-full bg-[#A3C042]" />
                </div>

                <h2 className="mb-4 text-2xl font-extrabold text-white md:text-3xl lg:text-4xl">
                    {isAr ? 'إرث المستقبل' : displayTitle}
                </h2>

                <p className="mx-auto mb-8 max-w-2xl text-sm text-white/80 md:text-base leading-relaxed">
                    {displayDescription}
                </p>

                <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
                    <button
                        onClick={onPrimaryButtonClick}
                        className="group relative overflow-hidden rounded-xl bg-white px-10 py-3.5 text-sm font-bold text-gray-900 shadow-lg transition hover:shadow-xl"
                    >
                        <span className="relative z-10">{displayPrimaryButtonText}</span>
                        <div className="absolute inset-0 bg-gradient-to-r from-[#A3C042]/10 to-[#8CA635]/10 opacity-0 transition group-hover:opacity-100" />
                    </button>
                    {onSecondaryButtonClick && (
                        <button
                            onClick={onSecondaryButtonClick}
                            className="rounded-xl border-2 border-white/30 px-10 py-3.5 text-sm font-bold text-white transition hover:border-white/60 hover:bg-white/10"
                        >
                            {displaySecondaryButtonText}
                        </button>
                    )}
                </div>

                {/* UAE flag colors accent bar */}
                <div className="mx-auto mt-8 flex h-1 w-40 overflow-hidden rounded-full">
                    <div className="flex-1 bg-red-500" />
                    <div className="flex-1 bg-green-500" />
                    <div className="flex-1 bg-white" />
                    <div className="flex-1 bg-black" />
                </div>
            </div>
        </div>
    );
}