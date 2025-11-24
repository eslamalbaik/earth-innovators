import SectionTitle from '../SectionTitle';
import { FaCheck } from 'react-icons/fa';

export default function AchievementsSection() {
    const achievements = [
        "أكثر من 500 مشروع إبداعي منشور",
        "أكثر من 50 تحدٍ تعليمي نشط",
        "أكثر من 200 شارة ممنوحة للطلاب المبتكرين",
        "تغطية أكثر من 30 مدرسة في الإمارات"
    ];

    return (
        <div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="flex justify-center">
                    <div className="text-center text-gray-400">
                        <img
                            src="/images/avatar3.svg"
                            alt="Placeholder Illustration"
                            className="w-full max-w-md h-auto"
                        />
                    </div>
                </div>
                <div className="space-y-6">
                    <SectionTitle
                        text="انجازاتنا"
                        size="2xl"
                        align="start"
                        className="pb-0"
                    />
                    {achievements.map((achievement, index) => (
                        <div key={index} className="flex items-center gap-3 justify-start">
                            <div className="w-5 h-5 bg-green-200 rounded-full flex items-center justify-center">
                                <FaCheck className="text-green-500 text-[10px]" />
                            </div>
                            <p className="text-lg text-gray-800">{achievement}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
