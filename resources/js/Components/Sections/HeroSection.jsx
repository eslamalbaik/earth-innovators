import { FaProjectDiagram, FaUsers, FaTrophy } from 'react-icons/fa';
import { router } from '@inertiajs/react';
import { useSelector } from 'react-redux';
import { useTranslation } from '@/i18n';

export default function HeroSection({
    title,
    subtitle,
    cities = [],
    subjects = [],
}) {
    const { dir } = useSelector((state) => state.language);
    const { t } = useTranslation();
    const resolvedTitle = title ?? t('hero.title');
    const resolvedSubtitle = subtitle ?? t('hero.subtitle');

    const handleStartJourney = () => {
        router.visit('/register');
    };

    return (
        <section dir={dir} className="relative flex min-h-screen items-center overflow-hidden bg-gradient-to-br from-[#A3C042]/10 via-white to-legacy-blue/10 px-24">
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute left-10 top-20 h-64 w-64 opacity-20">
                    <svg className="h-full w-full" viewBox="0 0 200 200" fill="none">
                        <circle cx="100" cy="100" r="80" stroke="url(#gradient)" strokeWidth="2" strokeDasharray="5,5" opacity="0.3" />
                        <path d="M 100 20 L 120 60 L 140 40" stroke="#22c55e" strokeWidth="2" fill="none" opacity="0.3" />
                        <circle cx="150" cy="50" r="4" fill="#22c55e" opacity="0.3" />
                        <circle cx="170" cy="70" r="4" fill="#3b82f6" opacity="0.3" />
                        <circle cx="140" cy="80" r="4" fill="#22c55e" opacity="0.3" />
                    </svg>
                </div>

                <div className="absolute right-20 top-40 h-48 w-48 opacity-15">
                    <svg className="h-full w-full" viewBox="0 0 150 150" fill="none">
                        <path d="M 20 75 L 60 45 L 90 75 L 130 55" stroke="#3b82f6" strokeWidth="2" strokeDasharray="3,3" fill="none" />
                        <circle cx="50" cy="60" r="3" fill="#22c55e" />
                        <circle cx="70" cy="75" r="3" fill="#3b82f6" />
                        <circle cx="110" cy="65" r="3" fill="#22c55e" />
                    </svg>
                </div>

                <div className="absolute left-32 top-32 h-32 w-32 rotate-45 rounded-full bg-[#A3C042] opacity-10" />
                <div className="absolute left-36 top-36 h-24 w-24 rotate-45 rounded-full bg-legacy-blue opacity-15" />

                <div className="absolute left-1/3 top-1/4 h-2 w-2 rounded-full bg-[#A3C042]" />
                <div className="absolute left-1/4 top-1/3 h-2 w-2 rounded-full bg-legacy-blue" />
                <div className="absolute right-1/4 top-1/5 h-2 w-2 rounded-full bg-[#A3C042]" />
                <div className="absolute right-1/3 top-2/5 h-2 w-2 rounded-full bg-legacy-blue" />
            </div>

            <div className="container relative z-10 mx-auto px-4 py-24 lg:px-12">
                <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-2">
                    <div className="order-1 space-y-8">
                        <div className="text-lg font-medium text-[#A3C042]">
                            {t('hero.learn')}
                        </div>

                        <h1 className="bg-[#A3C042] bg-clip-text text-4xl font-bold leading-tight text-transparent md:text-5xl lg:text-6xl">
                            {resolvedTitle}
                        </h1>

                        <p className="text-xl font-medium text-legacy-blue md:text-2xl">
                            {resolvedSubtitle}
                        </p>

                        <div className="mt-8">
                            <button
                                onClick={handleStartJourney}
                                className="rounded-xl bg-[#A3C042] px-12 py-4 text-lg font-semibold text-white shadow-lg transition duration-300 hover:scale-105 hover:shadow-xl hover:from-primary-600 hover:to-blue-700"
                            >
                                {t('hero.startJourney')}
                            </button>
                        </div>
                    </div>

                    <div className="relative order-2">
                        <div className="relative flex h-full w-full items-center justify-center">
                            <img
                                src="/images/hero.png"
                                alt={t('hero.imageAlt')}
                                className="h-auto w-full max-w-xl object-contain"
                            />
                        </div>
                    </div>
                </div>

                <div className="mt-16 grid grid-cols-2 gap-6 border-t border-[#A3C042]/20 pt-12 md:grid-cols-4">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#A3C042]/20 to-legacy-blue/20">
                            <FaProjectDiagram className="text-xl text-[#A3C042]" />
                        </div>
                        <div>
                            <div className="bg-[#A3C042] bg-clip-text text-2xl font-bold text-transparent md:text-3xl">32K</div>
                            <div className="text-sm text-gray-700">{t('stats.hours')}</div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#A3C042]/20 to-legacy-blue/20">
                            <FaTrophy className="text-xl text-legacy-blue" />
                        </div>
                        <div>
                            <div className="bg-[#A3C042] bg-clip-text text-2xl font-bold text-transparent md:text-3xl">3.4K</div>
                            <div className="text-sm text-gray-700">{t('common.lessons')}</div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#A3C042]/20 to-legacy-blue/20">
                            <FaUsers className="text-xl text-[#A3C042]" />
                        </div>
                        <div>
                            <div className="bg-[#A3C042] bg-clip-text text-2xl font-bold text-transparent md:text-3xl">135.1K</div>
                            <div className="text-sm text-gray-700">{t('common.students')}</div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#A3C042]/20 to-legacy-blue/20">
                            <FaProjectDiagram className="text-xl text-legacy-blue" />
                        </div>
                        <div>
                            <div className="bg-[#A3C042] bg-clip-text text-2xl font-bold text-transparent md:text-3xl">317</div>
                            <div className="text-sm text-gray-700">{t('common.courses')}</div>
                        </div>
                    </div>
                </div>
            </div>

            <svg className="hidden">
                <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#22c55e" />
                        <stop offset="100%" stopColor="#3b82f6" />
                    </linearGradient>
                </defs>
            </svg>
        </section>
    );
}
