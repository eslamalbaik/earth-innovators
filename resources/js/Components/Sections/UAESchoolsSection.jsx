import { FaSchool, FaUsers, FaTrophy, FaGraduationCap } from 'react-icons/fa';
import { useTranslation } from '@/i18n';

export default function UAESchoolsSection({
    title,
    subtitle,
    schools = [],
    compact = false,
}) {
    const { t } = useTranslation();
    const resolvedTitle = title ?? t('sections.uaeSchools');
    const resolvedSubtitle = subtitle ?? t('sections.uaeSchoolsSubtitle');

    return (
        <div className="space-y-4 md:space-y-6">
            <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#A3C042]/20 to-[#8CA635]/20">
                    <FaGraduationCap className="text-xl text-[#A3C042]" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 md:text-2xl">{resolvedTitle}</h2>
            </div>

            <p className="mb-6 text-sm leading-relaxed text-gray-700 md:text-base">
                {resolvedSubtitle}
            </p>

            {schools.length === 0 ? (
                <div className="rounded-2xl border border-gray-100 bg-white p-8 text-center md:p-12">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100">
                        <FaSchool className="text-2xl text-gray-400" />
                    </div>
                    <p className="font-semibold text-gray-600">{t('sections.noSchoolsAvailable')}</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-3 xl:grid-cols-4">
                    {schools.map((school) => (
                        <div
                            key={school.id}
                            className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition hover:shadow-md md:p-6"
                        >
                            <div className="mb-4 flex items-center justify-center">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#A3C042]/20 to-[#8CA635]/20">
                                    <FaSchool className="text-xl text-[#A3C042]" />
                                </div>
                            </div>

                            <h3 className="mb-3 text-center text-base font-bold text-gray-900 md:text-lg">
                                {school.name}
                            </h3>

                            <div className="mb-4 space-y-2">
                                {school.total_students !== undefined && (
                                    <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                                        <FaUsers className="text-gray-400" />
                                        <span>{t('sections.uaeSchoolsStudentsCount', { count: school.total_students || 0 })}</span>
                                    </div>
                                )}

                                {school.projects_count !== undefined && (
                                    <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                                        <FaTrophy className="text-yellow-500" />
                                        <span>{t('sections.uaeSchoolsProjectsCount', { count: school.projects_count || 0 })}</span>
                                    </div>
                                )}
                            </div>

                            {school.total_points !== undefined && (
                                <div className="border-t border-gray-100 pt-4 text-center">
                                    <div className="mb-1 text-2xl font-extrabold text-[#A3C042]">
                                        {school.total_points || 0}
                                    </div>
                                    <div className="text-xs font-semibold text-gray-500">{t('sections.uaeSchoolsPointsLabel')}</div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
