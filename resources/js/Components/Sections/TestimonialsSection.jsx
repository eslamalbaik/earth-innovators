import { FaStar, FaChevronLeft, FaChevronRight, FaComments } from 'react-icons/fa';
import { getInitials, getColorFromName } from '../../utils/imageUtils';
import { useState, useEffect } from 'react';
import { useTranslation } from '@/i18n';

export default function TestimonialsSection({
    title,
    subtitle,
    testimonials = [],
    compact = false
}) {
    const { t } = useTranslation();
    const [currentIndex, setCurrentIndex] = useState(0);
    
    const displayTitle = title || t('sections.testimonials.title');
    const displaySubtitle = subtitle || t('sections.testimonials.subtitle');
    
    const defaultTestimonials = [
        {
            id: 1,
            text: t('sections.testimonials.testimonial1.text'),
            name: t('sections.testimonials.testimonial1.name'),
            location: t('sections.testimonials.testimonial1.location'),
            role: t('sections.testimonials.roles.student'),
            rating: 5.0,
        },
        {
            id: 2,
            text: t('sections.testimonials.testimonial2.text'),
            name: t('sections.testimonials.testimonial2.name'),
            location: t('sections.testimonials.testimonial2.location'),
            role: t('sections.testimonials.roles.schoolPrincipal'),
            rating: 5.0,
        },
        {
            id: 3,
            text: t('sections.testimonials.testimonial3.text'),
            name: t('sections.testimonials.testimonial3.name'),
            location: t('sections.testimonials.testimonial3.location'),
            role: t('sections.testimonials.roles.teacher'),
            rating: 5.0,
        },
        {
            id: 4,
            text: t('sections.testimonials.testimonial4.text'),
            name: t('sections.testimonials.testimonial4.name'),
            location: t('sections.testimonials.testimonial4.location'),
            role: t('sections.testimonials.roles.parent'),
            rating: 5.0,
        },
    ];

    const displayTestimonials = testimonials.length > 0 ? testimonials : defaultTestimonials;

    useEffect(() => {
        if (displayTestimonials.length <= 1) return;
        
        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) => 
                prevIndex === displayTestimonials.length - 1 ? 0 : prevIndex + 1
            );
        }, 5000);

        return () => clearInterval(interval);
    }, [displayTestimonials.length]);

    const goToPrevious = () => {
        setCurrentIndex(currentIndex === 0 ? displayTestimonials.length - 1 : currentIndex - 1);
    };

    const goToNext = () => {
        setCurrentIndex(currentIndex === displayTestimonials.length - 1 ? 0 : currentIndex + 1);
    };

    const currentTestimonial = displayTestimonials[currentIndex];

    if (compact) {
        return (
            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#A3C042]/20 to-[#8CA635]/20 rounded-xl flex items-center justify-center">
                        <FaComments className="text-[#A3C042] text-xl" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">{displayTitle}</h2>
                </div>
                <p className="text-sm text-gray-600">{displaySubtitle}</p>
                
                <div className="bg-gradient-to-br from-[#A3C042]/5 to-[#8CA635]/5 rounded-xl p-4">
                    <p className="text-gray-700 text-sm mb-3 line-clamp-3">"{currentTestimonial.text}"</p>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div 
                                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                                style={{ background: getColorFromName(currentTestimonial.name) }}
                            >
                                {getInitials(currentTestimonial.name)}
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-gray-900">{currentTestimonial.name}</p>
                                <p className="text-[10px] text-gray-500">{currentTestimonial.role}</p>
                            </div>
                        </div>
                        <div className="flex">
                            {[...Array(5)].map((_, i) => (
                                <FaStar key={i} className="text-yellow-400 text-xs" />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="text-center mb-8">
                <div className="flex items-center justify-center gap-3 mb-2">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#A3C042]/20 to-[#8CA635]/20 rounded-xl flex items-center justify-center">
                        <FaComments className="text-[#A3C042] text-2xl" />
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{displayTitle}</h2>
                </div>
                <p className="text-gray-600 text-sm md:text-base">{displaySubtitle}</p>
            </div>

            <div className="relative max-w-4xl mx-auto">
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 md:p-8 min-h-[200px] flex items-center">
                    <div className="w-full">
                        <div className="flex flex-col md:flex-row gap-6 items-start">
                            <div className="flex-shrink-0 mx-auto md:mx-0">
                                <div 
                                    className="w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center text-white text-2xl font-bold"
                                    style={{ background: `linear-gradient(135deg, ${getColorFromName(currentTestimonial.name).split(', ')[0]}, ${getColorFromName(currentTestimonial.name).split(', ')[1]})` }}
                                >
                                    {getInitials(currentTestimonial.name)}
                                </div>
                            </div>
                            <div className="flex-1 text-center md:text-start">
                                <div className="flex justify-center md:justify-start mb-2">
                                    {[...Array(5)].map((_, i) => (
                                        <FaStar key={i} className="text-yellow-400 text-lg" />
                                    ))}
                                </div>
                                <p className="text-gray-700 text-base md:text-lg leading-relaxed mb-4">"{currentTestimonial.text}"</p>
                                <div>
                                    <p className="font-bold text-gray-900">{currentTestimonial.name}</p>
                                    <p className="text-sm text-gray-500">{currentTestimonial.role} - {currentTestimonial.location}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {displayTestimonials.length > 1 && (
                    <>
                        <button
                            onClick={goToPrevious}
                            className="absolute top-1/2 -translate-y-1/2 start-0 md:right-4 -translate-x-1/2 md:translate-x-0 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition"
                        >
                            <FaChevronLeft className="text-gray-700" />
                        </button>
                        <button
                            onClick={goToNext}
                            className="absolute top-1/2 -translate-y-1/2 end-0 md:left-4 translate-x-1/2 md:translate-x-0 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition"
                        >
                            <FaChevronRight className="text-gray-700" />
                        </button>

                        <div className="flex justify-center gap-2 mt-4">
                            {displayTestimonials.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentIndex(index)}
                                    className={`w-2 h-2 rounded-full transition ${
                                        index === currentIndex 
                                            ? 'bg-[#A3C042] w-6' 
                                            : 'bg-gray-300 hover:bg-gray-400'
                                    }`}
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}