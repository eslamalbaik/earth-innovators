import { FaCheck, FaRocket } from 'react-icons/fa';

export default function WhyChooseSection({
    title = "لماذا منصة إرث المبتكرين؟",
    subtitle = "منصة تعليمية شاملة تهدف إلى بناء مجتمع من المبتكرين والموهوبين في المؤسسات تعليمية. نوفر بيئة محفزة للإبداع والابتكار.",
    benefits = [],
    imageSrc = "/images/erth-img.jpg",
    imageAlt = "منصة إرث المبتكرين",
    compact = false
}) {
    return (
        <div className="space-y-4 md:space-y-6">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-[#A3C042]/20 to-[#8CA635]/20 rounded-xl flex items-center justify-center">
                    <FaRocket className="text-[#A3C042] text-xl" />
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-900">{title}</h2>
            </div>

            <p className="text-sm md:text-base text-gray-700 leading-relaxed mb-6">
                {subtitle}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                {benefits.map((benefit, index) => (
                    <div key={index} className="bg-white rounded-2xl border border-gray-100 p-4 md:p-6 shadow-sm hover:shadow-md transition">
                        <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-[#A3C042]/20 to-[#8CA635]/20 rounded-xl flex items-center justify-center mt-1">
                                <FaCheck className="text-[#A3C042] text-sm" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-base md:text-lg font-bold text-gray-900 mb-2">{benefit.title}</h3>
                                <p className="text-sm md:text-base text-gray-700 leading-relaxed">
                                    {benefit.description}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
