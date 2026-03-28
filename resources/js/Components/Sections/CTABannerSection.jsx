import { Link } from '@inertiajs/react';
import { useTranslation } from '@/i18n';

export default function CTABannerSection({
    title,
    buttonText,
    buttonLink = null,
    onButtonClick,
}) {
    const { t } = useTranslation();
    const resolvedTitle = title ?? t('sections.cta.title');
    const resolvedButtonText = buttonText ?? t('sections.cta.registerNow');

    return (
        <section className="px-2 py-4">
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col items-center justify-between gap-6 rounded-3xl border-2 border-[#A3C042]/20 bg-gradient-to-r from-[#A3C042]/10 to-legacy-blue/10 p-4 sm:flex-row">
                    <div className="flex-1 text-center">
                        <h2 className="text-md font-semibold leading-tight text-gray-900 sm:text-lg lg:text-xl">
                            {resolvedTitle}
                        </h2>
                    </div>

                    <div className="flex-shrink-0">
                        {onButtonClick ? (
                            <button
                                onClick={onButtonClick}
                                className="inline-block rounded-2xl bg-[#A3C042] px-6 py-3 text-lg font-semibold text-white shadow-md transition duration-300 hover:scale-105 hover:bg-primary-600"
                            >
                                {resolvedButtonText}
                            </button>
                        ) : (
                            <Link
                                href={buttonLink || '/projects'}
                                className="inline-block rounded-2xl bg-[#A3C042] px-6 py-3 text-lg font-semibold text-white shadow-md transition duration-300 hover:scale-105 hover:bg-primary-600"
                            >
                                {resolvedButtonText}
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
