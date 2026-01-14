import { FaChalkboardTeacher } from 'react-icons/fa';

export default function TeacherRecruitemstSection({
    title = "هل أنت معلم أو مشرف؟",
    callToAction = "انضم إلى إرث المبتكرين!",
    description = "شارك في بناء مجتمع المبتكرين. قيّم مشاريع الطلاب، شارك في التحديات، ونشر المقالات التعليمية لتكون جزءاً من حركة الإبداع.",
    buttonText = "انضم كمعلم/مشرف",
    imageSrc = "/images/avatar2.svg",
    imageAlt = "معلم خصوصي",
    onJoinClick,
    compact = false
}) {
    return (
        <div className="bg-gradient-to-br from-[#A3C042] to-[#93b03a] rounded-3xl p-6 md:p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                        <FaChalkboardTeacher className="text-xl" />
                    </div>
                    <h2 className="text-xl md:text-2xl font-bold">{title}</h2>
                </div>

                <h3 className="text-lg md:text-xl font-bold mb-3 text-white/95">
                    {callToAction}
                </h3>

                <p className="text-sm md:text-base text-white/90 leading-relaxed mb-6">
                    {description}
                </p>

                <button
                    onClick={onJoinClick}
                    className="bg-white text-[#A3C042] px-6 py-3 rounded-xl font-bold text-sm md:text-base hover:bg-gray-100 transition shadow-lg"
                >
                    {buttonText}
                </button>
            </div>
        </div>
    );
}
