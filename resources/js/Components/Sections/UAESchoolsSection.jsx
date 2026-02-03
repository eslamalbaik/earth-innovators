import { FaSchool, FaUsers, FaTrophy, FaGraduationCap } from 'react-icons/fa';

export default function UAESchoolsSection({
    title = "مؤسسات تعليمية مشاركة من الإمارات",
    subtitle = "نفتخر بشراكتنا مع مؤسسات تعليمية متميزة من دولة الإمارات العربية المتحدة",
    schools = [],
    compact = false
}) {
    return (
        <div className="space-y-4 md:space-y-6">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-[#A3C042]/20 to-[#8CA635]/20 rounded-xl flex items-center justify-center">
                    <FaGraduationCap className="text-[#A3C042] text-xl" />
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-900">{title}</h2>
            </div>

            <p className="text-sm md:text-base text-gray-700 leading-relaxed mb-6">
                {subtitle}
            </p>

            {schools.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 p-8 md:p-12 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <FaSchool className="text-gray-400 text-2xl" />
                    </div>
                    <p className="text-gray-600 font-semibold">لا توجد مؤسسات تعليمية متاحة حالياً</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                    {schools.map((school) => (
                        <div
                            key={school.id}
                            className="bg-white rounded-2xl border border-gray-100 p-4 md:p-6 shadow-sm hover:shadow-md transition"
                        >
                            <div className="flex items-center justify-center mb-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-[#A3C042]/20 to-[#8CA635]/20 rounded-xl flex items-center justify-center">
                                    <FaSchool className="text-[#A3C042] text-xl" />
                                </div>
                            </div>

                            <h3 className="text-base md:text-lg font-bold text-gray-900 mb-3 text-center">
                                {school.name}
                            </h3>

                            <div className="space-y-2 mb-4">
                                {school.total_students !== undefined && (
                                    <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                                        <FaUsers className="text-gray-400" />
                                        <span>{school.total_students || 0} طالب</span>
                                    </div>
                                )}

                                {school.projects_count !== undefined && (
                                    <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                                        <FaTrophy className="text-yellow-500" />
                                        <span>{school.projects_count || 0} مشروع</span>
                                    </div>
                                )}
                            </div>

                            {school.total_points !== undefined && (
                                <div className="text-center pt-4 border-t border-gray-100">
                                    <div className="text-2xl font-extrabold text-[#A3C042] mb-1">
                                        {school.total_points || 0}
                                    </div>
                                    <div className="text-xs text-gray-500 font-semibold">نقطة</div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
