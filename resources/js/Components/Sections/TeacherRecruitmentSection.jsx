import { FaChalkboardTeacher } from 'react-icons/fa';
import { useTranslation } from '@/i18n';

export default function TeacherRecruitemstSection({
    title,
    callToAction,
    description,
    buttonText,
    imageSrc = "/images/avatar2.svg",
    imageAlt,
    onJoinClick,
    compact = false
}) {
    const { t } = useTranslation();
    
    const displayTitle = title || t('sections.teacherRecruitment.title');
    const displayCallToAction = callToAction || t('sections.teacherRecruitment.callToAction');
    const displayDescription = description || t('sections.teacherRecruitment.description');
    const displayButtonText = buttonText || t('sections.teacherRecruitment.joinButton');
    const displayImageAlt = imageAlt || t('sections.teacherRecruitment.teacherImageAlt');
    return (
        <div className="bg-gradient-to-br from-[#A3C042] to-[#8CA635] rounded-3xl p-6 md:p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 start-0 w-32 h-32 bg-white/10 rounded-full -ms-16 -mt-16 blur-2xl"></div>
            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                        <FaChalkboardTeacher className="text-xl" />
                    </div>
                    <h2 className="text-xl md:text-2xl font-bold">{displayTitle}</h2>
                </div>

                <h3 className="text-lg md:text-xl font-bold mb-3 text-white/95">
                    {displayCallToAction}
                </h3>

                <p className="text-sm md:text-base text-white/90 leading-relaxed mb-6">
                    {displayDescription}
                </p>

                <button
                    onClick={onJoinClick}
                    className="bg-white text-[#A3C042] px-6 py-3 rounded-xl font-bold text-sm md:text-base hover:bg-gray-100 transition shadow-lg"
                >
                    {displayButtonText}
                </button>
            </div>
        </div>
    );
}
