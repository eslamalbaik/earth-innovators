import SectionTitle from '../SectionTitle';

export default function StatsSection({
    title = "أرقام تثبت نجاحنا!",
    subtitle = "مجتمع المبتكرين والموهوبين ينمو يومياً على منصة إرث المبتكرين.",
    stats = []
}) {
    return (
        <section className="py-12 bg-gradient-to-r from-legacy-green/10 to-legacy-blue/10">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center space-y-6">
                    <div className="space-y-2">
                        <SectionTitle
                            text={title}
                            size="2xl"
                            align="center"
                            className="pb-2 md:pb-6"
                        />
                        <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
                            {subtitle}
                        </p>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 pt-4">
                        {stats && stats.length > 0 ? (
                            stats.map((stat, index) => (
                                <div key={index} className="text-center">
                                    <div className="text-xl sm:text-2xl lg:text-4xl font-bold text-gray-800 mb-2">
                                        {stat.value || '0'}
                                    </div>
                                    <div className="text-lg text-gray-700 font-medium">
                                        {stat.label || ''}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-4 text-center text-gray-500 py-8">
                                <p>جاري تحميل الإحصائيات...</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
