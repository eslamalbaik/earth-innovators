import { Link } from '@inertiajs/react';

export default function CTABannerSection({
    title = "انضم إلى منصة إرث المبتكرين وشارك مشاريعك الإبداعية",
    buttonText = "ابدأ الآن",
    buttonLink = null,
    onButtonClick
}) {
    return (
        <section className="py-4 px-2">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-gradient-to-r from-[#A3C042]/10 to-legacy-blue/10 rounded-3xl p-4 flex flex-col sm:flex-row items-center justify-between gap-6 border-2 border-[#A3C042]/20">
                    <div className="flex-1 text-center sm:">
                        <h2 className="text-md sm:text-lg lg:text-xl font-semibold text-gray-900 leading-tight">
                            {title}
                        </h2>
                    </div>

                    <div className="flex-shrink-0">
                        {onButtonClick ? (
                            <button
                                onClick={onButtonClick}
                                className="inline-block bg-[#A3C042] hover:bg-primary-600 text-white px-6 py-3 rounded-2xl font-semibold text-lg transition duration-300 transform hover:scale-105 shadow-md"
                            >
                                {buttonText}
                            </button>
                        ) : buttonLink ? (
                            <Link
                                href={buttonLink}
                                className="inline-block bg-[#A3C042] hover:bg-primary-600 text-white px-6 py-3 rounded-2xl font-semibold text-lg transition duration-300 transform hover:scale-105 shadow-md"
                            >
                                {buttonText}
                            </Link>
                        ) : (
                            <Link
                                href="/projects"
                                className="inline-block bg-[#A3C042] hover:bg-primary-600 text-white px-6 py-3 rounded-2xl font-semibold text-lg transition duration-300 transform hover:scale-105 shadow-md"
                            >
                                {buttonText}
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
