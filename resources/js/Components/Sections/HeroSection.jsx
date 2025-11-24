import { FaSearch, FaProjectDiagram, FaUsers, FaTrophy, FaClock, FaMedal } from 'react-icons/fa';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { router } from '@inertiajs/react';

export default function HeroSection({
    title = "نحن معا نحو التقدم والتطور",
    subtitle = "مشاريع إبداعية في كل المجالات",
    searchPlaceholder = "البحث عن المشاريع أو التحديات",
    cities = [],
    subjects = []
}) {
    const [searchTerm, setSearchTerm] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    useEffect(() => {
        if (searchTerm.length >= 2) {
            const timeoutId = setTimeout(() => {
                fetchSuggestions();
            }, 300);
            return () => clearTimeout(timeoutId);
        } else {
            setSuggestions([]);
            setShowSuggestions(false);
        }
    }, [searchTerm]);

    const fetchSuggestions = async () => {
        try {
            const response = await axios.get('/search/suggestions', {
                params: { q: searchTerm }
            });
            setSuggestions(response.data.suggestions);
            setShowSuggestions(true);
        } catch (error) {
            // Handle error silently
        }
    };

    const handleSearch = () => {
        router.visit('/projects', {
            data: { search: searchTerm }
        });
    };

    const handleSuggestionClick = (suggestion) => {
        setSearchTerm(suggestion.text);
        setShowSuggestions(false);
    };

    return (
        <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-legacy-green/10 via-white to-legacy-blue/10">
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
                <div className="absolute top-32 left-32 w-32 h-32 bg-legacy-green rounded-full opacity-10 transform rotate-45"></div>
                <div className="absolute top-36 left-36 w-24 h-24 bg-legacy-blue rounded-full opacity-15 transform rotate-45"></div>

                {/* Small decorative dots */}
                <div className="absolute top-1/4 left-1/3 w-2 h-2 bg-legacy-green rounded-full"></div>
                <div className="absolute top-1/3 left-1/4 w-2 h-2 bg-legacy-blue rounded-full"></div>
                <div className="absolute top-1/5 right-1/4 w-2 h-2 bg-legacy-green rounded-full"></div>
                <div className="absolute top-2/5 right-1/3 w-2 h-2 bg-legacy-blue rounded-full"></div>
            </div>

            <div className="container mx-auto px-4 lg:px-12 py-24 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    {/* Left side - Illustration and text */}
                    <div className="relative">
                            {/* Student illustration circle */}
                            <div className="relative">
                                {/* Concentric circles */}
                                <div className="absolute top-0 right-0 w-80 h-80">
                                    <div className="absolute inset-0 border-4 border-legacy-green/30 rounded-full opacity-30"></div>
                                    <div className="absolute inset-4 border-4 border-legacy-blue/30 rounded-full opacity-40"></div>
                                    <div className="absolute inset-8 border-4 border-legacy-green/20 rounded-full opacity-50"></div>
                                </div>

                                {/* Student image placeholder - in a circular frame */}
                                <div className="relative w-64 h-64 mx-auto mt-8">
                                    <div className="absolute inset-0 border-4 border-legacy-green rounded-full bg-white shadow-2xl flex items-center justify-center overflow-hidden">
                                        {/* Placeholder for student image - using a gradient background */}
                                        <div className="w-full h-full bg-gradient-to-br from-legacy-green/20 to-legacy-blue/20 flex items-center justify-center">
                                            <div className="text-center">
                                                <div className="w-32 h-32 bg-gradient-to-br from-legacy-green to-legacy-blue rounded-full mx-auto mb-3 flex items-center justify-center">
                                                    <FaUsers className="text-white text-4xl" />
                                                </div>
                                                <div className="text-xs text-gray-600 font-semibold">طالب مبتكر</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Smartphone icon in bottom left */}
                                <div className="absolute bottom-0 left-0 w-24 h-24 transform rotate-12 opacity-60">
                                    <div className="w-full h-full bg-gradient-to-br from-legacy-blue to-legacy-green rounded-2xl shadow-lg flex items-center justify-center">
                                        <div className="w-12 h-20 bg-white rounded-lg shadow-inner flex items-center justify-center">
                                            <div className="w-2 h-2 bg-legacy-green rounded-full"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                    </div>

                    {/* Right side - Text and search */}
                    <div className="space-y-8">
                        {/* Top small text */}
                        <div className="text-legacy-green text-lg font-medium">
                            كل ما عليك هو التعلم
                        </div>

                        {/* Main headline */}
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-legacy-green to-legacy-blue bg-clip-text text-transparent leading-tight">
                            {title}
                        </h1>

                        {/* Subtitle */}
                        <p className="text-xl md:text-2xl text-legacy-blue font-medium">
                            {subtitle}
                        </p>

                        {/* Search bar */}
                        <div className="flex gap-4 mt-8">
                            <div className="flex-1 relative">
                                <input
                                    type="text"
                                    placeholder={searchPlaceholder}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onFocus={() => setShowSuggestions(suggestions.length > 0)}
                                    className="w-full bg-white text-gray-900 px-6 py-4 rounded-xl border-2 border-legacy-green/30 focus:ring-2 focus:ring-legacy-green focus:border-legacy-green text-lg shadow-md"
                                />
                                {showSuggestions && suggestions.length > 0 && (
                                    <div className="absolute top-full left-0 right-0 bg-white border-2 border-legacy-green/30 rounded-xl shadow-lg z-50 mt-2 max-h-60 overflow-y-auto">
                                        {suggestions.map((suggestion, index) => (
                                            <div
                                                key={index}
                                                onClick={() => handleSuggestionClick(suggestion)}
                                                className="px-6 py-3 hover:bg-legacy-green/10 cursor-pointer border-b border-gray-100 last:border-b-0"
                                            >
                                                <div className="font-medium text-gray-900">{suggestion.text}</div>
                                                <div className="text-sm text-gray-500">{suggestion.subtext}</div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <button
                                onClick={handleSearch}
                                className="bg-gradient-to-r from-legacy-green to-legacy-blue hover:from-primary-600 hover:to-blue-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition duration-300 shadow-lg hover:shadow-xl flex items-center gap-2"
                            >
                                <span>البحث</span>
                                <FaSearch />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Statistics at the bottom */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 pt-12 border-t border-legacy-green/20">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-legacy-green/20 to-legacy-blue/20 rounded-full flex items-center justify-center">
                            <FaProjectDiagram className="text-legacy-green text-xl" />
                        </div>
                        <div>
                            <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-legacy-green to-legacy-blue bg-clip-text text-transparent">٣٢ ألف</div>
                            <div className="text-sm text-gray-700">ساعة تعليمية</div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-legacy-green/20 to-legacy-blue/20 rounded-full flex items-center justify-center">
                            <FaTrophy className="text-legacy-blue text-xl" />
                        </div>
                        <div>
                            <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-legacy-green to-legacy-blue bg-clip-text text-transparent">٣.٤ ألف</div>
                            <div className="text-sm text-gray-700">درس</div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-legacy-green/20 to-legacy-blue/20 rounded-full flex items-center justify-center">
                            <FaUsers className="text-legacy-green text-xl" />
                        </div>
                        <div>
                            <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-legacy-green to-legacy-blue bg-clip-text text-transparent">١٣٥.١ ألف</div>
                            <div className="text-sm text-gray-700">طالب</div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-legacy-green/20 to-legacy-blue/20 rounded-full flex items-center justify-center">
                            <FaProjectDiagram className="text-legacy-blue text-xl" />
                        </div>
                        <div>
                            <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-legacy-green to-legacy-blue bg-clip-text text-transparent">٣١٧</div>
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
