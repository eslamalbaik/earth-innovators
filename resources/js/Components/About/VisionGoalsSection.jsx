import { FaLightbulb, FaBullseye } from 'react-icons/fa';
import { useTranslation } from '@/i18n';

export default function VisionGoalsSection() {
    const { t } = useTranslation();
    
    const goals = [
        t('about.goals.goal1'),
        t('about.goals.goal2'),
        t('about.goals.goal3'),
        t('about.goals.goal4'),
        t('about.goals.goal5'),
        t('about.goals.goal6')
    ];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className=" bg-white shadow-xl border border-gray-200 rounded-3xl p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#A3C042] to-legacy-blue rounded-lg flex items-center justify-center">
                        <FaLightbulb className="text-white text-xl" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">{t('about.vision')}</h2>
                </div>
                <p className="text-lg text-gray-800 leading-relaxed">
                    {t('about.visionDescription')}
                </p>
            </div>

            <div className=" bg-white shadow-xl border border-gray-200 rounded-3xl p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#A3C042] to-legacy-blue rounded-lg flex items-center justify-center">
                        <FaBullseye className="text-white text-xl" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">{t('about.goalsTitle')}</h2>
                </div>
                <div className="space-y-3 text-gray-800">
                    {goals.map((goal, index) => (
                        <div key={index} className="flex items-start gap-3">
                            <span className="font-bold text-lg">{index + 1}.</span>
                            <p className="text-lg">{goal}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
