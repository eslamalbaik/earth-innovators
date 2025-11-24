import SectionTitle from '../SectionTitle';
import { FaStar, FaUserCircle } from 'react-icons/fa';
import { getInitials, getColorFromName } from '../../utils/imageUtils';

export default function TestimonialsSection({
    title = "ماذا يقول المبتكرون عن منصة إرث المبتكرين؟",
    subtitle = "تجارب إيجابية من الطلاب والمعلمين والمدارس في مجتمع المبتكرين.",
    testimonials = []
}) {
    return (
        <section className="py-16 bg-white">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <SectionTitle
                        text={title}
                        size="2xl"
                        align="center"
                        className="pb-2"
                    />

                    <p className="mb-8 text-lg text-gray-800 max-w-3xl mx-auto leading-relaxed">
                        {subtitle}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {testimonials.length === 0 ? (
                        <div className="col-span-3 text-center py-12">
                            <p className="text-gray-600">لا توجد تقييمات متاحة حالياً</p>
                        </div>
                    ) : (
                        testimonials.map((testimonial) => (
                            <div key={testimonial.id} className="bg-white rounded-lg p-4 border border-gray-100 flex flex-col items-between justify-between">
                                <div className="mb-4">
                                    <p className="text-gray-700 leading-relaxed">
                                        {testimonial.text}
                                    </p>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-md"
                                            style={{
                                                background: `linear-gradient(135deg, ${getColorFromName(testimonial.name || 'User')})`
                                            }}
                                        >
                                            {getInitials(testimonial.name || 'User')}
                                        </div>
                                        <div className="flex flex-col items-start">
                                            <span className="text-sm font-medium text-gray-900">{testimonial.name}</span>
                                            <span className="text-xs text-gray-600">{testimonial.location}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <FaStar className="text-yellow-500 text-sm" />
                                        <span className="text-lg font-bold text-gray-900">{testimonial.rating}</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </section>
    );
}
