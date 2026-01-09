import { useState } from 'react';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

const defaultFAQs = [
    {
        question: "كيف يمكنني مشاركة مشروعي الإبداعي؟",
        answer: "يمكنك رفع مشروعك من خلال لوحة التحكم. قم بتسجيل الدخول، ثم اضغط على 'إضافة مشروع جديد' واملأ البيانات المطلوبة (العنوان، الوصف، الملفات، الصور، التقرير). سيتم مراجعته من قبل المعلمين أو الإدارة قبل الموافقة عليه."
    },
    {
        question: "كيف أحصل على الشارات والنقاط؟",
        answer: "تحصل على الشارات والنقاط عند مشاركة المشاريع، المشاركة في التحديات، تحقيق مراكز متقدمة، أو عند إنجازات معينة. كل شارة لها متطلباتها الخاصة من النقاط أو الإنجازات."
    },
    {
        question: "كيف يمكنني المشاركة في التحديات؟",
        answer: "تصفح قائمة التحديات النشطة، اختر التحدي المناسب لفئتك العمرية ومجال اهتمامك، ثم قم برفع مشروعك المرتبط بالتحدي. يجب أن يتم التقديم قبل الموعد النهائي للتحدي."
    },
    {
        question: "ما هي الباقات المتاحة وكيف يمكنني الاشتراك؟",
        answer: "نوفر باقات متنوعة للمؤسسات تعليمية والطلاب (شهرية، ربع سنوية، سنوية). كل باقة توفر ميزات مختلفة مثل عدد المشاريع المسموح بها، عدد التحديات، إمكانية الحصول على شهادات، وغيرها. يمكنك الاشتراك من صفحة الباقات."
    }
];

export default function FAQSection({
    title = "الأسئلة الشائعة",
    subtitle = "أجوبة على أهم الأسئلة المتعلقة بمنصة إرث المبتكرين والمشاريع والتحديات والشارات.",
    faqs = defaultFAQs,
    openFAQ: externalOpenFAQ,
    onToggleFAQ
}) {
    const [internalOpenFAQ, setInternalOpenFAQ] = useState(null);

    const openFAQ = externalOpenFAQ !== undefined ? externalOpenFAQ : internalOpenFAQ;
    const setOpenFAQ = onToggleFAQ || setInternalOpenFAQ;

    const toggleFAQ = (index) => {
        setOpenFAQ(openFAQ === index ? null : index);
    };

    return (
        <section className="py-16 bg-gradient-to-r from-legacy-green/20 to-legacy-blue/20">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                        {title}
                    </h2>

                    <p className="text-lg text-gray-700">
                        {subtitle}
                    </p>
                </div>

                <div className="space-y-4">
                    {faqs.map((faq, index) => (
                        <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                            <button
                                onClick={() => toggleFAQ(index)}
                                className="w-full px-6 py-4 text-right flex items-center justify-between hover:bg-gray-50 transition duration-200"
                            >
                                <div className="flex-1 text-right">
                                    <h3 className="text-lg font-medium text-gray-900">
                                        {faq.question}
                                    </h3>
                                </div>
                                <div className="mr-4 flex-shrink-0">
                                    {openFAQ === index ? (
                                        <FaChevronUp className="text-gray-500 text-sm" />
                                    ) : (
                                        <FaChevronDown className="text-gray-500 text-sm" />
                                    )}
                                </div>
                            </button>

                            {openFAQ === index && (
                                <div className="px-6 pb-4 border-t border-gray-100">
                                    <div className="pt-4">
                                        <p className="text-gray-700 leading-relaxed">
                                            {faq.answer}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
