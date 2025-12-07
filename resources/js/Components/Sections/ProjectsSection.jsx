import SectionTitle from '../SectionTitle';
import { FaProjectDiagram, FaEye, FaUser, FaGraduationCap, FaArrowLeft } from 'react-icons/fa';
import { Link } from '@inertiajs/react';

export default function ProjectsSection({
    title = "أبرز المشاريع الإبداعية",
    subtitle = "استكشف مشاريع الطلاب المبتكرين في مختلف المجالات والفئات العمرية.",
    projects = [],
    onViewAllProjects
}) {
    const getCategoryLabel = (category) => {
        const categories = {
            'science': 'علوم',
            'technology': 'تقنية',
            'engineering': 'هندسة',
            'mathematics': 'رياضيات',
            'arts': 'فنون',
            'other': 'أخرى'
        };
        return categories[category] || 'أخرى';
    };

    return (
        <section className="py-16 bg-white">
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

                <div className="relative">
                    {projects.length === 0 ? (
                        <div className="text-center py-12">
                            <FaProjectDiagram className="mx-auto text-6xl text-gray-300 mb-4" />
                            <p className="text-gray-600">لا توجد مشاريع متاحة حالياً</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {projects.map((project) => (
                                <Link
                                    key={project.id}
                                    href={`/projects/${project.id}`}
                                    className="flex flex-col bg-white rounded-lg p-6 border border-gray-100 hover:shadow-lg transition duration-300 cursor-pointer"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-2">
                                            <FaProjectDiagram className="text-blue-600 text-xl" />
                                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                                                معتمد
                                            </span>
                                        </div>
                                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded">
                                            {getCategoryLabel(project.category)}
                                        </span>
                                    </div>

                                    <h3 className="text-lg font-bold text-gray-900 mb-2 hover:text-blue-600 transition line-clamp-2">
                                        {project.title}
                                    </h3>

                                    <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-grow">
                                        {project.description}
                                    </p>

                                    <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-200 mt-auto">
                                        <div className="flex items-center gap-2">
                                            {project.teacher ? (
                                                <>
                                                    <FaGraduationCap className="text-gray-400" />
                                                    <span className="text-xs">
                                                        {project.teacher.name_ar || project.teacher.user?.name || 'معلم'}
                                                    </span>
                                                </>
                                            ) : (
                                                <>
                                                    <FaUser className="text-gray-400" />
                                                    <span className="text-xs">
                                                        {project.user?.name || 'طالب'}
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <FaEye className="text-gray-400" />
                                            <span className="text-xs">{project.views || 0}</span>
                                        </div>
                                    </div>

                                    {project.school && (
                                        <div className="mt-2 text-xs text-gray-500">
                                            مدرسة: {project.school.name}
                                        </div>
                                    )}
                                </Link>
                            ))}
                        </div>
                    )}

                    <div className="flex justify-end items-center mt-8">
                        <button
                            onClick={onViewAllProjects}
                            className="bg-legacy-green hover:bg-primary-600 text-white px-4 py-2 md:px-6 md:py-3 rounded-lg font-bold text-xs md:text-sm transition duration-300 flex items-center gap-3 shadow-lg"
                        >
                            عرض جميع المشاريع
                            <FaArrowLeft className="text-md" />
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}

