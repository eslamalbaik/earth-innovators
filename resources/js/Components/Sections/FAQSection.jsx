import { useState, useMemo } from 'react';
import { FaChevronDown, FaChevronUp, FaQuestionCircle } from 'react-icons/fa';
import { useTranslation } from '@/i18n';

export default function FAQSection({
    title,
    subtitle,
    faqs,
    openFAQ: externalOpenFAQ,
    onToggleFAQ,
    compact = false
}) {
    const { t } = useTranslation();
    
    const defaultFAQs = useMemo(() => [
        {
            question: t('sections.faq.question1'),
            answer: t('sections.faq.answer1')
        },
        {
            question: t('sections.faq.question2'),
            answer: t('sections.faq.answer2')
        },
        {
            question: t('sections.faq.question3'),
            answer: t('sections.faq.answer3')
        },
        {
            question: t('sections.faq.question4'),
            answer: t('sections.faq.answer4')
        }
    ], [t]);

    const [internalOpenFAQ, setInternalOpenFAQ] = useState(null);

    const openFAQ = externalOpenFAQ !== undefined ? externalOpenFAQ : internalOpenFAQ;
    const setOpenFAQ = onToggleFAQ || setInternalOpenFAQ;

    const displayTitle = title || t('sections.faq.title');
    const displaySubtitle = subtitle || t('sections.faq.subtitle');

    const displayFAQs = faqs && faqs.length > 0 ? faqs : defaultFAQs;

    const toggleFAQ = (index) => {
        setOpenFAQ(openFAQ === index ? null : index);
    };

    if (compact) {
        return (
            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#A3C042]/20 to-[#8CA635]/20 rounded-xl flex items-center justify-center">
                        <FaQuestionCircle className="text-[#A3C042] text-xl" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">{displayTitle}</h2>
                </div>
                <p className="text-sm text-gray-600">{displaySubtitle}</p>
                
                <div className="space-y-2">
                    {displayFAQs.slice(0, 2).map((faq, index) => (
                        <div key={index} className="border border-gray-200 rounded-xl overflow-hidden">
                            <button
                                onClick={() => toggleFAQ(index)}
                                className="w-full flex items-center justify-between p-3 text-start bg-gray-50 hover:bg-gray-100 transition"
                            >
                                <span className="text-sm font-semibold text-gray-900">{faq.question}</span>
                                {openFAQ === index ? (
                                    <FaChevronUp className="text-[#A3C042]" />
                                ) : (
                                    <FaChevronDown className="text-gray-400" />
                                )}
                            </button>
                            {openFAQ === index && (
                                <div className="p-3 bg-white border-t border-gray-100">
                                    <p className="text-xs text-gray-600">{faq.answer}</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="text-center mb-8">
                <div className="flex items-center justify-center gap-3 mb-2">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#A3C042]/20 to-[#8CA635]/20 rounded-xl flex items-center justify-center">
                        <FaQuestionCircle className="text-[#A3C042] text-2xl" />
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{displayTitle}</h2>
                </div>
                <p className="text-gray-600 text-sm md:text-base">{displaySubtitle}</p>
            </div>

            <div className="max-w-3xl mx-auto space-y-3">
                {displayFAQs.map((faq, index) => (
                    <div key={index} className="border border-gray-200 rounded-xl overflow-hidden">
                        <button
                            onClick={() => toggleFAQ(index)}
                            className="w-full flex items-center justify-between p-4 text-start bg-gray-50 hover:bg-gray-100 transition"
                        >
                            <span className="font-semibold text-gray-900">{faq.question}</span>
                            {openFAQ === index ? (
                                <FaChevronUp className="text-[#A3C042] flex-shrink-0" />
                            ) : (
                                <FaChevronDown className="text-gray-400 flex-shrink-0" />
                            )}
                        </button>
                        {openFAQ === index && (
                            <div className="p-4 bg-white border-t border-gray-100">
                                <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
