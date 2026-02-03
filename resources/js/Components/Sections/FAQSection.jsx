import { useState } from 'react';
import { FaChevronDown, FaChevronUp, FaQuestionCircle } from 'react-icons/fa';

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
    onToggleFAQ,
    compact = false
}) {
    const [internalOpenFAQ, setInternalOpenFAQ] = useState(null);

    const openFAQ = externalOpenFAQ !== undefined ? externalOpenFAQ : internalOpenFAQ;
    const setOpenFAQ = onToggleFAQ || setInternalOpenFAQ;

    const toggleFAQ = (index) => {
        setOpenFAQ(openFAQ === index ? null : index);
    };

    return (
        <div className="space-y-4 md:space-y-6">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-[#A3C042]/20 to-[#8CA635]/20 rounded-xl flex items-center justify-center">
                    <FaQuestionCircle className="text-[#A3C042] text-xl" />
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-900">{title}</h2>
            </div>

            <p className="text-sm md:text-base text-gray-700 leading-relaxed mb-6">
                {subtitle}
            </p>

            <div className="space-y-3">
                {faqs.map((faq, index) => (
                    <div key={index} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition overflow-hidden">
                        <button
                            onClick={() => toggleFAQ(index)}
                            className="w-full px-4 md:px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition"
                        >
                            <div className="flex-1 text-right">
                                <h3 className="text-sm md:text-base font-bold text-gray-900">
                                    {faq.question}
                                </h3>
                            </div>
                            <div className="mr-3 flex-shrink-0">
                                {openFAQ === index ? (
                                    <FaChevronUp className="text-gray-500 text-sm" />
                                ) : (
                                    <FaChevronDown className="text-gray-500 text-sm" />
                                )}
                            </div>
                        </button>

                        {openFAQ === index && (
                            <div className="px-4 md:px-6 pb-4 border-t border-gray-100">
                                <div className="pt-4">
                                    <p className="text-sm md:text-base text-gray-700 leading-relaxed">
                                        {faq.answer}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
