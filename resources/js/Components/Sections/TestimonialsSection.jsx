import { FaStar, FaChevronLeft, FaChevronRight, FaComments } from 'react-icons/fa';
import { getInitials, getColorFromName } from '../../utils/imageUtils';
import { useState, useEffect } from 'react';

export default function TestimonialsSection({
    title = "آراء العملاء",
    subtitle = "",
    testimonials = [],
    compact = false
}) {
    const [currentIndex, setCurrentIndex] = useState(0);
    // Default testimonials if none provided
    const defaultTestimonials = [
        {
            id: 1,
            title: "منصة رائعة للإبداع والتعلم",
            text: "منصة إرث المبتكرين ساعدتني كثيراً في عرض مشاريعي الإبداعية والحصول على تقييمات من المعلمين. التحديات والمسابقات شجعتني على الابتكار أكثر. أنصح جميع الطلاب بتجربة هذه المنصة المميزة.",
            name: "سارة أحمد",
            location: "الرياض",
            rating: 5.0,
            initials: "سأ",
            role: "طالبة"
        },
        {
            id: 2,
            title: "تجربة ممتازة للمؤسسات تعليمية",
            text: "كمديرة مدرسة، منصة إرث المبتكرين ساعدتنا في تنظيم مشاريع الطلاب وتشجيعهم على الإبداع. النظام سهل الاستخدام والنتائج واضحة. الطلاب أصبحوا أكثر حماساً للمشاركة في التحديات والمسابقات.",
            name: "فاطمة محمد",
            location: "جدة",
            rating: 5.0,
            initials: "فم",
            role: "مديرة مدرسة"
        },
        {
            id: 3,
            title: "أفضل منصة تعليمية",
            text: "منصة إرث المبتكرين منصة رائعة لطلابنا. ابنتي شاركت في عدة تحديات وحصلت على شارات ونقاط. النظام واضح وسهل الاستخدام. شكراً لكم على هذه المبادرة الرائعة.",
            name: "أم خالد",
            location: "الدمام",
            rating: 4.9,
            initials: "أخ",
            role: "ولي أمر"
        },
        {
            id: 4,
            title: "منصة محترفة ومبتكرة",
            text: "كمعلم، استخدمت منصة إرث المبتكرين لتقييم مشاريع الطلاب وتشجيعهم. النظام سهل الاستخدام والواجهة جميلة. الطلاب يستمتعون بالمشاركة في التحديات والحصول على الشارات.",
            name: "أحمد علي",
            location: "الرياض",
            rating: 4.8,
            initials: "أع",
            role: "معلم"
        },
        {
            id: 5,
            title: "تجربة إيجابية جداً",
            text: "ابني شارك في عدة مشاريع على منصة إرث المبتكرين وحصل على تقييمات إيجابية. التحديات شجعته على الابتكار والإبداع. المنصة سهلة الاستخدام والنتائج واضحة.",
            name: "أبو ناصر",
            location: "مكة المكرمة",
            rating: 4.7,
            initials: "أن",
            role: "ولي أمر"
        },
        {
            id: 6,
            title: "منصة متميزة للطلاب",
            text: "منصة إرث المبتكرين ساعدتني في تطوير مهاراتي الإبداعية. التحديات متنوعة والشارات تشجعني على المشاركة أكثر. أنصح جميع الطلاب بتجربة هذه المنصة الرائعة.",
            name: "محمد خالد",
            location: "الرياض",
            rating: 5.0,
            initials: "مخ",
            role: "طالب"
        }
    ];

    const displayTestimonials = testimonials.length > 0 ? testimonials : defaultTestimonials;
    const itemsPerView = 3; // Number of items to show at once
    const maxIndex = Math.max(0, displayTestimonials.length - itemsPerView);

    const nextSlide = () => {
        setCurrentIndex((prev) =>
            prev >= maxIndex ? 0 : prev + 1
        );
    };

    const prevSlide = () => {
        setCurrentIndex((prev) =>
            prev === 0 ? maxIndex : prev - 1
        );
    };

    // Auto-play carousel
    useEffect(() => {
        if (displayTestimonials.length <= itemsPerView) return;

        const interval = setInterval(() => {
            setCurrentIndex((prev) => {
                const newMaxIndex = Math.max(0, displayTestimonials.length - itemsPerView);
                return prev >= newMaxIndex ? 0 : prev + 1;
            });
        }, 5000); // Change slide every 5 seconds

        return () => clearInterval(interval);
    }, [displayTestimonials.length]);

    return (
        <div className="space-y-4 md:space-y-6">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-[#A3C042]/20 to-[#93b03a]/20 rounded-xl flex items-center justify-center">
                    <FaComments className="text-[#A3C042] text-xl" />
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-900">{title}</h2>
            </div>

            {subtitle && (
                <p className="text-sm md:text-base text-gray-700 leading-relaxed mb-6">
                    {subtitle}
                </p>
            )}

            <div className="relative">
                {/* Carousel Container */}
                <div className="overflow-hidden">
                    <div
                        className="flex transition-transform duration-500 ease-in-out"
                        style={{
                            transform: `translateX(${currentIndex * (100 / itemsPerView)}%)`
                        }}
                    >
                        {displayTestimonials.map((testimonial) => (
                            <div
                                key={testimonial.id}
                                className="flex-shrink-0 w-full md:w-1/2 lg:w-1/3 px-2"
                            >
                                <div className="bg-white rounded-2xl border border-gray-100 p-4 md:p-6 shadow-sm hover:shadow-md transition flex flex-col h-full">
                                    {/* Star Rating */}
                                    <div className="flex items-center gap-1 mb-4">
                                        {[...Array(5)].map((_, i) => (
                                            <FaStar
                                                key={i}
                                                className={`text-lg ${
                                                    i < Math.floor(testimonial.rating)
                                                        ? 'text-yellow-400'
                                                        : 'text-gray-300'
                                                }`}
                                            />
                                        ))}
                                    </div>

                                    {/* Title */}
                                    {testimonial.title && (
                                        <h3 className="text-base md:text-lg font-bold text-[#A3C042] mb-3">
                                            {testimonial.title}
                                        </h3>
                                    )}

                                    {/* Review Text */}
                                    <p className="text-sm md:text-base text-gray-700 leading-relaxed mb-4 flex-grow">
                                        {testimonial.text || testimonial.comment}
                                    </p>

                                    {/* Reviewer Info */}
                                    <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                                        <div
                                            className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-xs shadow-sm"
                                            style={{
                                                background: `linear-gradient(135deg, ${getColorFromName(testimonial.name || 'User')})`
                                            }}
                                        >
                                            {testimonial.initials || getInitials(testimonial.name || 'User')}
                                        </div>
                                        <div className="flex flex-col flex-grow">
                                            <span className="text-sm md:text-base font-bold text-[#A3C042]">{testimonial.name}</span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs md:text-sm text-gray-600">{testimonial.location}</span>
                                                {testimonial.role && (
                                                    <>
                                                        <span className="text-gray-400">•</span>
                                                        <span className="text-xs md:text-sm text-gray-500">{testimonial.role}</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Navigation Buttons */}
                {displayTestimonials.length > itemsPerView && (
                    <>
                        <button
                            onClick={prevSlide}
                            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 md:-translate-x-4 bg-[#A3C042] text-white rounded-full p-2 md:p-3 shadow-lg hover:bg-[#93b03a] transition-colors z-10"
                            aria-label="Previous"
                        >
                            <FaChevronLeft className="text-sm md:text-base" />
                        </button>
                        <button
                            onClick={nextSlide}
                            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 md:translate-x-4 bg-[#A3C042] text-white rounded-full p-2 md:p-3 shadow-lg hover:bg-[#93b03a] transition-colors z-10"
                            aria-label="Next"
                        >
                            <FaChevronRight className="text-sm md:text-base" />
                        </button>
                    </>
                )}

                {/* Dots Indicator */}
                {displayTestimonials.length > itemsPerView && (
                    <div className="flex justify-center gap-2 mt-6">
                        {Array.from({ length: maxIndex + 1 }).map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentIndex(index)}
                                className={`h-2 rounded-full transition-all ${
                                    currentIndex === index
                                        ? 'bg-[#A3C042] w-6'
                                        : 'bg-gray-300 w-2'
                                }`}
                                aria-label={`Go to slide ${index + 1}`}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
