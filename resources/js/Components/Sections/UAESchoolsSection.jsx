import SectionTitle from '../SectionTitle';
import { FaSchool, FaUsers, FaTrophy } from 'react-icons/fa';

export default function UAESchoolsSection({
    title = "مؤسسات تعليمية مشاركة من الإمارات",
    subtitle = "نفتخر بشراكتنا مع مؤسسات تعليمية متميزة من دولة الإمارات العربية المتحدة",
    schools = []
}) {
    return (
        <section className="py-16 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <SectionTitle
                        text={title}
                        size="2xl"
                        align="center"
                        className="pb-2"
                    />

                    <p className="mb-8 text-lg text-gray-800 max-w-3xl mx-auto leading-relaxed">
                        {subtitle}
                    </p>
                </div>

                {schools.length === 0 ? (
                    <div className="text-center py-12">
                        <FaSchool className="mx-auto text-6xl text-gray-300 mb-4" />
                        <p className="text-gray-600">لا توجد مؤسسات تعليمية متاحة حالياً</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {schools.map((school) => (
                            <div
                                key={school.id}
                                className="bg-white rounded-lg p-6 border border-gray-200 hover:shadow-lg transition duration-300"
                            >
                                <div className="flex items-center justify-center mb-4">
                                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center">
                                        <FaSchool className="text-white text-2xl" />
                                    </div>
                                </div>

                                <h3 className="text-lg font-bold text-gray-900 mb-2 text-center">
                                    {school.name}
                                </h3>

                                {school.total_students !== undefined && (
                                    <div className="flex items-center justify-center gap-2 text-sm text-gray-600 mb-2">
                                        <FaUsers className="text-gray-400" />
                                        <span>{school.total_students || 0} طالب</span>
                                    </div>
                                )}

                                {school.projects_count !== undefined && (
                                    <div className="flex items-center justify-center gap-2 text-sm text-gray-600 mb-2">
                                        <FaTrophy className="text-yellow-500" />
                                        <span>{school.projects_count || 0} مشروع</span>
                                    </div>
                                )}

                                {school.total_points !== undefined && (
                                    <div className="text-center mt-4 pt-4 border-t border-gray-200">
                                        <div className="text-2xl font-bold text-legacy-green">
                                            {school.total_points || 0}
                                        </div>
                                        <div className="text-xs text-gray-500">نقطة</div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}

