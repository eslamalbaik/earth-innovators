import { Link } from '@inertiajs/react';
import { FaProjectDiagram, FaEye } from 'react-icons/fa';
import { useTranslation, useForwardIcon } from '@/i18n';

export default function FeaturedProjectsSection({ projects = [], getCategoryLabel }) {
    const { t, language } = useTranslation();
    const ForwardIcon = useForwardIcon();
    const isAr = language === 'ar';

    if (!projects || projects.length === 0) return null;

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="text-center flex-1">
                    <h2 className="text-2xl font-extrabold text-gray-900 md:text-3xl">
                        {isAr ? 'مشاريع مميزة من مجتمعنا' : 'Featured Community Projects'}
                    </h2>
                    <div className="mx-auto mt-3 h-1 w-16 rounded-full bg-gradient-to-r from-[#A3C042] to-[#8CA635]" />
                    <p className="mx-auto mt-3 max-w-xl text-sm text-gray-600 md:text-base">
                        {isAr
                            ? 'مشاريع ابتكارية ملهمة من طلابنا ومبتكرينا'
                            : 'Inspiring innovative projects from our students and innovators'}
                    </p>
                </div>
            </div>

            {/* Projects Grid */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {projects.slice(0, 4).map((project) => (
                    <Link
                        key={project.id}
                        href={`/projects/${project.id}`}
                        className="group relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                    >
                        {/* Image / placeholder */}
                        <div className="relative h-48 overflow-hidden bg-gradient-to-br from-[#A3C042]/20 to-[#8CA635]/20">
                            {project.image_url || project.thumbnail ? (
                                <img
                                    src={project.image_url || project.thumbnail}
                                    alt={project.title}
                                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center">
                                    <FaProjectDiagram className="text-4xl text-[#A3C042]/40" />
                                </div>
                            )}
                            {/* Overlay gradient */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                            {/* Category badge */}
                            {project.category && (
                                <span className="absolute start-3 top-3 rounded-full bg-white/90 px-3 py-1 text-[11px] font-bold text-gray-700 shadow-sm backdrop-blur-sm">
                                    {getCategoryLabel ? getCategoryLabel(project.category) : project.category}
                                </span>
                            )}
                        </div>

                        {/* Body */}
                        <div className="flex flex-1 flex-col p-4">
                            <h3 className="mb-2 text-sm font-bold text-gray-900 line-clamp-2 md:text-base">
                                {project.title}
                            </h3>
                            <p className="mb-3 flex-1 text-xs text-gray-500 line-clamp-2">
                                {project.description}
                            </p>
                            <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                                {project.views > 0 && (
                                    <span className="flex items-center gap-1 text-xs text-gray-400">
                                        <FaEye className="text-[10px]" />
                                        {project.views}
                                    </span>
                                )}
                                <span className="ms-auto flex items-center gap-1 text-xs font-semibold text-[#A3C042] transition group-hover:gap-2">
                                    {t('common.viewAll')}
                                    <ForwardIcon className="text-[10px]" />
                                </span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {/* View all link */}
            <div className="text-center">
                <Link
                    href="/projects"
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#A3C042] to-[#8CA635] px-8 py-3 text-sm font-bold text-white shadow-md transition hover:shadow-lg hover:brightness-105"
                >
                    {isAr ? 'عرض جميع المشاريع' : 'View All Projects'}
                    <ForwardIcon />
                </Link>
            </div>
        </div>
    );
}
