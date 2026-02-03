import { Link } from '@inertiajs/react';
import { FaRocket } from 'react-icons/fa';

export default function CTASection({
    title = "ابدأ رحلتك مع إرث المبتكرين!",
    description = "انضم إلى مجتمع المبتكرين والموهوبين، شارك مشاريعك الإبداعية، وكن جزءاً من التحديات التعليمية المثيرة.",
    primaryButtonText = "سجل الآن",
    secondaryButtonText = "تواصل معنا",
    primaryButtonLink = "/register",
    onPrimaryButtonClick,
    onSecondaryButtonClick,
    compact = false
}) {
    return (
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                        <FaRocket className="text-xl" />
                    </div>
                    <h2 className="text-xl md:text-2xl font-bold">{title}</h2>
                </div>

                <p className="text-sm md:text-base text-white/90 leading-relaxed mb-6">
                    {description}
                </p>

                <div className="flex flex-col sm:flex-row gap-3">
                    {onSecondaryButtonClick && (
                        <button
                            onClick={onSecondaryButtonClick}
                            className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl font-bold text-sm md:text-base transition border border-white/20"
                        >
                            {secondaryButtonText}
                        </button>
                    )}

                    {primaryButtonLink ? (
                        <Link
                            href={primaryButtonLink}
                            className="bg-[#A3C042] hover:bg-[#8CA635] text-white px-6 py-3 rounded-xl font-bold text-sm md:text-base transition shadow-lg text-center"
                        >
                            {primaryButtonText}
                        </Link>
                    ) : (
                        <button
                            onClick={onPrimaryButtonClick}
                            className="bg-[#A3C042] hover:bg-[#8CA635] text-white px-6 py-3 rounded-xl font-bold text-sm md:text-base transition shadow-lg"
                        >
                            {primaryButtonText}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
