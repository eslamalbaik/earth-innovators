import { FaLightbulb, FaBullseye } from 'react-icons/fa';

export default function VisionGoalsSection() {
    const goals = [
        "توفير بيئة محفزة للطلاب لعرض مشاريعهم الإبداعية",
        "تمكين المعلمين من متابعة وتقييم مشاريع الطلاب",
        "تنظيم تحديبات ومسابقات تعليمية في مجالات متنوعة",
        "بناء نظام تحفيزي بالشارات والنقاط والمكافآت",
        "إصدار الشهادات للمؤسسات تعليمية والطلاب المتميزين",
        "المساهمة في بناء جيل من المبتكرين والموهوبين"
    ];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="text-right bg-white shadow-xl border border-gray-200 rounded-3xl p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-legacy-green to-legacy-blue rounded-lg flex items-center justify-center">
                        <FaLightbulb className="text-white text-xl" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">رؤيتنا</h2>
                </div>
                <p className="text-lg text-gray-800 leading-relaxed">
                    أن نكون المنصة التعليمية الرائدة في المنطقة التي تبني مجتمعاً من المبتكرين والموهوبين في المؤسسات تعليمية، من خلال توفير بيئة محفزة للإبداع والابتكار، وربط الطلاب المبتكرين مع المعلمين والمشرفين، وتنظيم التحديات والمسابقات التعليمية المثيرة.
                </p>
            </div>

            <div className="text-right bg-white shadow-xl border border-gray-200 rounded-3xl p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-legacy-green to-legacy-blue rounded-lg flex items-center justify-center">
                        <FaBullseye className="text-white text-xl" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">أهدافنا</h2>
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
