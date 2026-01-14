import { FaProjectDiagram, FaUsers, FaTrophy } from 'react-icons/fa';
import { router } from '@inertiajs/react';

export default function HeroSection({
    title = "نحن معا نحو التقدم والتطور",
    subtitle = "مشاريع إبداعية في كل المجالات",
    cities = [],
    subjects = []
}) {
    const handleStartJourney = () => {
        router.visit('/register');
    };

    return (
        <section className="relative min-h-screen px-24 flex items-center overflow-hidden bg-gradient-to-br from-[#A3C042]/10 via-white to-legacy-blue/10">
            {/* Background decorative elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {/* Dotted lines and arrows */}
                <div className="absolute top-20 left-10 w-64 h-64 opacity-20">
                    <svg className="w-full h-full" viewBox="0 0 200 200" fill="none">
                        <circle cx="100" cy="100" r="80" stroke="url(#gradient)" strokeWidth="2" strokeDasharray="5,5" opacity="0.3"/>
                        <path d="M 100 20 L 120 60 L 140 40" stroke="#22c55e" strokeWidth="2" fill="none" opacity="0.3"/>
                        <circle cx="150" cy="50" r="4" fill="#22c55e" opacity="0.3"/>
                        <circle cx="170" cy="70" r="4" fill="#3b82f6" opacity="0.3"/>
                        <circle cx="140" cy="80" r="4" fill="#22c55e" opacity="0.3"/>
                    </svg>
                </div>

                <div className="absolute top-40 right-20 w-48 h-48 opacity-15">
                    <svg className="w-full h-full" viewBox="0 0 150 150" fill="none">
                        <path d="M 20 75 L 60 45 L 90 75 L 130 55" stroke="#3b82f6" strokeWidth="2" strokeDasharray="3,3" fill="none"/>
                        <circle cx="50" cy="60" r="3" fill="#22c55e"/>
                        <circle cx="70" cy="75" r="3" fill="#3b82f6"/>
                        <circle cx="110" cy="65" r="3" fill="#22c55e"/>
                    </svg>
                </div>

                {/* Large green/blue play button/arrow shape */}
                <div className="absolute top-32 left-32 w-32 h-32 bg-[#A3C042] rounded-full opacity-10 transform rotate-45"></div>
                <div className="absolute top-36 left-36 w-24 h-24 bg-legacy-blue rounded-full opacity-15 transform rotate-45"></div>

                {/* Small decorative dots */}
                <div className="absolute top-1/4 left-1/3 w-2 h-2 bg-[#A3C042] rounded-full"></div>
                <div className="absolute top-1/3 left-1/4 w-2 h-2 bg-legacy-blue rounded-full"></div>
                <div className="absolute top-1/5 right-1/4 w-2 h-2 bg-[#A3C042] rounded-full"></div>
                <div className="absolute top-2/5 right-1/3 w-2 h-2 bg-legacy-blue rounded-full"></div>
            </div>

            <div className="container mx-auto px-4 lg:px-12 py-24 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                    {/* Left side - Text and CTA Button */}
                    <div className="space-y-8 order-1 lg:order-1">
                        {/* Top small text */}
                        <div className="text-[#A3C042] text-lg font-medium">
                            كل ما عليك هو التعلم
                        </div>

                        {/* Main headline */}
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-[#A3C042] to-legacy-blue bg-clip-text text-transparent leading-tight">
                            {title}
                        </h1>

                        {/* Subtitle */}
                        <p className="text-xl md:text-2xl text-legacy-blue font-medium">
                            {subtitle}
                        </p>

                        {/* CTA Button */}
                        <div className="mt-8">
                            <button
                                onClick={handleStartJourney}
                                className="bg-gradient-to-r from-[#A3C042] to-legacy-blue hover:from-primary-600 hover:to-blue-700 text-white px-12 py-4 rounded-xl font-semibold text-lg transition duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                            >
                                ابدأ رحلتك معنا
                            </button>
                        </div>
                    </div>

                    {/* Right side - Hero Image */}
                    <div className="relative order-2 lg:order-2">
                        <div className="relative w-full h-full flex items-center justify-center">
                            <img
                                src="/images/hero.png"
                                alt="Hero"
                                className="w-full h-auto max-w-xl object-contain"
                            />
                        </div>
                    </div>
                </div>

                {/* Statistics at the bottom */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 pt-12 border-t border-[#A3C042]/20">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-[#A3C042]/20 to-legacy-blue/20 rounded-full flex items-center justify-center">
                            <FaProjectDiagram className="text-[#A3C042] text-xl" />
                        </div>
                        <div>
                            <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-[#A3C042] to-legacy-blue bg-clip-text text-transparent">٣٢ ألف</div>
                            <div className="text-sm text-gray-700">ساعة تعليمية</div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-[#A3C042]/20 to-legacy-blue/20 rounded-full flex items-center justify-center">
                            <FaTrophy className="text-legacy-blue text-xl" />
                        </div>
                        <div>
                            <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-[#A3C042] to-legacy-blue bg-clip-text text-transparent">٣.٤ ألف</div>
                            <div className="text-sm text-gray-700">درس</div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-[#A3C042]/20 to-legacy-blue/20 rounded-full flex items-center justify-center">
                            <FaUsers className="text-[#A3C042] text-xl" />
                        </div>
                        <div>
                            <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-[#A3C042] to-legacy-blue bg-clip-text text-transparent">١٣٥.١ ألف</div>
                            <div className="text-sm text-gray-700">طالب</div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-[#A3C042]/20 to-legacy-blue/20 rounded-full flex items-center justify-center">
                            <FaProjectDiagram className="text-legacy-blue text-xl" />
                        </div>
                        <div>
                            <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-[#A3C042] to-legacy-blue bg-clip-text text-transparent">٣١٧</div>
                            <div className="text-sm text-gray-700">كورس</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* SVG gradient definition */}
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
