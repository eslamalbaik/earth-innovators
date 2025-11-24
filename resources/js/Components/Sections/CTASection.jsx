import { Link } from '@inertiajs/react';

export default function CTASection({
    title = "ابدأ رحلتك مع إرث المبتكرين!",
    description = "انضم إلى مجتمع المبتكرين والموهوبين، شارك مشاريعك الإبداعية، وكن جزءاً من التحديات التعليمية المثيرة.",
    primaryButtonText = "سجل الآن",
    secondaryButtonText = "تواصل معنا",
    primaryButtonLink = "/register",
    onPrimaryButtonClick,
    onSecondaryButtonClick
}) {
    return (
        <section className="py-16 bg-white">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="relative bg-black rounded-3xl p-8 md:p-12 shadow-2xl">
                    <div className="relative z-10 flex flex-col justify-center items-center">
                        <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-legacy-green mb-6 leading-tight">
                            {title}
                        </h2>

                        <p className="text-center max-w-2xl text-md sm:text-xl text-gray-300 mb-8 leading-relaxed">
                            {description}
                        </p>

                        <div className="flex gap-4 justify-center">
                            <button
                                onClick={onSecondaryButtonClick}
                                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-1 md:px-8 md:py-3 rounded-lg md:rounded-2xl font-bold text-sm md:text-lg transition duration-300 transform hover:scale-105 shadow-lg"
                            >
                                {secondaryButtonText}
                            </button>

                            {primaryButtonLink ? (
                                <Link
                                    href={primaryButtonLink}
                                    className="bg-legacy-green hover:bg-primary-600 text-white px-4 py-1 md:px-8 md:py-3 rounded-lg md:rounded-2xl font-bold text-md md:text-lg transition duration-300 transform hover:scale-105 shadow-lg text-center"
                                >
                                    {primaryButtonText}
                                </Link>
                            ) : (
                                <button
                                    onClick={onPrimaryButtonClick}
                                    className="bg-gradient-to-r from-legacy-green to-legacy-blue hover:from-primary-600 hover:to-blue-700 text-white px-4 py-1 md:px-8 md:py-3 rounded-lg md:rounded-2xl font-bold text-md md:text-lg transition duration-300 transform hover:scale-105 shadow-lg"
                                >
                                    {primaryButtonText}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
