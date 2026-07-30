import { FaStar, FaChevronLeft, FaChevronRight, FaComments, FaQuoteRight } from 'react-icons/fa';
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

    const secondTestimonial = displayTestimonials[(currentIndex + 1) % displayTestimonials.length];
    const visibleCards = displayTestimonials.length > 1
        ? [currentTestimonial, secondTestimonial]
        : [currentTestimonial];

    const renderStars = (size = 'text-sm') =>
        [...Array(5)].map((_, i) => (
            <FaStar key={i} className={`text-yellow-400 ${size}`} />
        ));

    const avatarGradient = (name) => {
        const [c0, c1] = getColorFromName(name).split(', ');
        return `linear-gradient(135deg, ${c0 || '#A3C042'}, ${c1 || '#8CA635'})`;
    };

    return (
        <div className="mx-auto max-w-6xl">
            <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-3">
                {/* Left panel — brand-green identity */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#A3C042] to-[#8CA635] p-8 text-white lg:col-span-1">
                    <div className="pointer-events-none absolute -top-10 -left-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
                    <div className="relative z-10 flex h-full flex-col">
                        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-white/20">
                            <FaQuoteRight className="text-3xl text-white" />
                        </div>
                        <h2 className="mb-4 text-2xl font-extrabold leading-tight md:text-3xl">
                            {displayTitle}
                        </h2>
                        <p className="mb-8 text-sm leading-relaxed text-white/90">
                            {displaySubtitle}
                        </p>

                        {displayTestimonials.length > 1 && (
                            <div className="mt-auto flex items-center gap-3">
                                <button
                                    onClick={goToPrevious}
                                    aria-label="Previous"
                                    className="flex h-11 w-11 items-center justify-center rounded-full bg-white/20 text-white transition hover:bg-white/30"
                                >
                                    <FaChevronRight />
                                </button>
                                <button
                                    onClick={goToNext}
                                    aria-label="Next"
                                    className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#8CA635] transition hover:bg-gray-100"
                                >
                                    <FaChevronLeft />
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Testimonial cards */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:col-span-2">
                    {visibleCards.map((item, idx) => (
                        <div
                            key={`${item.id ?? item.name}-${idx}`}
                            className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-lg ring-1 ring-gray-100"
                        >
                            {item.image ? (
                                <img
                                    src={item.image}
                                    alt={item.name}
                                    className="h-56 w-full object-cover object-[center_top]"
                                />
                            ) : (
                                <div
                                    className="flex h-56 items-center justify-center text-4xl font-extrabold text-white"
                                    style={{ background: avatarGradient(item.name) }}
                                >
                                    {getInitials(item.name)}
                                </div>
                            )}
                            <div className="flex flex-1 flex-col p-5">
                                <h3 className="mb-1 text-base font-bold text-gray-900">
                                    {item.name}
                                </h3>
                                <p className="mb-3 text-xs font-semibold text-[#A3C042]">
                                    {item.location || item.role}
                                </p>
                                <p className="mb-4 flex-1 text-sm leading-relaxed text-gray-600 line-clamp-5">
                                    "{item.text || item.content}"
                                </p>
                                <div className="flex items-center justify-end border-t border-gray-100 pt-3">
                                    <div className="flex gap-0.5">{renderStars('text-sm')}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Pagination dots */}
            {displayTestimonials.length > 1 && (
                <div className="mt-6 flex justify-center gap-2">
                    {displayTestimonials.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentIndex(index)}
                            aria-label={`${index + 1}`}
                            className={`h-2 rounded-full transition ${
                                index === currentIndex
                                    ? 'w-6 bg-[#A3C042]'
                                    : 'w-2 bg-gray-300 hover:bg-gray-400'
                            }`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}