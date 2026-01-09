import SectionTitle from '../SectionTitle';
import { FaCheck } from 'react-icons/fa';

export default function WhyChooseSection({
    title = "لماذا منصة إرث المبتكرين؟",
    subtitle = "منصة تعليمية شاملة تهدف إلى بناء مجتمع من المبتكرين والموهوبين في المؤسسات تعليمية. نوفر بيئة محفزة للإبداع والابتكار.",
    benefits = [],
    imageSrc = "/images/erth-img.jpg",
    imageAlt = "معلم متخصص"
}) {
    return (
        <section className="py-16 bg-white">
            <div className="max-w-6xl mx-auto px-6 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div className="flex justify-center">
                        <div className="relative">
                            <img
                                src={imageSrc}
                                alt={imageAlt}
                                className="w-full max-w-xl h-auto"
                            />
                        </div>
                    </div>
                    <div className="">
                        <div className="">
                            <SectionTitle
                                text={title}
                                size="2xl"
                                align="start"
                                className="pb-4 md:pb-8"
                            />
                        </div>

                        <p className="text-md md:text-lg text-center md:text-start text-gray-700 leading-relaxed mb-4">
                            {subtitle}
                        </p>

                        <div className="space-y-6">
                            {benefits.map((benefit, index) => (
                                <div key={index} className="flex items-start space-x-4 space-x-reverse">
                                    <div className="flex-shrink-0 w-4 h-4 md:w-6 md:h-6 bg-legacy-green/20 rounded-full flex items-center justify-center mt-1">
                                        <FaCheck className="text-legacy-green text-[10px] md:text-sm" />
                                    </div>
                                    <div>
                                        <p className="text-gray-700 leading-relaxed text-[16px] md:text-md">
                                            <span className="font-bold text-gray-900 mb-2">{benefit.title}: </span>
                                            {benefit.description}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
