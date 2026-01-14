import { FaEye, FaHeart, FaStar, FaProjectDiagram } from 'react-icons/fa';
import { Link } from '@inertiajs/react';

function ProjectCard({ project, onOpen }) {
    if (!project) return null;

    const title = project.title || 'مشروع بدون عنوان';
    const views = project.views ?? 0;
    const likes = project.likes ?? 0;
    const rating = project.rating ?? null;
    const createdAt = project.created_at || '';
    const isPlaceholder = !project.id || project.id.toString().startsWith('placeholder-');
    const status = project.status || 'pending';

    const formatDate = (dateString) => {
        if (!dateString) return '';
        try {
            const date = new Date(dateString);
            const now = new Date();
            const diffTime = Math.abs(now - date);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays === 0) return 'اليوم';
            if (diffDays === 1) return 'منذ يوم';
            if (diffDays < 7) return `منذ ${diffDays} أيام`;
            if (diffDays < 30) return `منذ ${Math.floor(diffDays / 7)} أسبوع`;
            return `منذ ${Math.floor(diffDays / 30)} شهر`;
        } catch {
            return dateString;
        }
    };

    const getStatusLabel = () => {
        if (project.is_submission) return 'ملف تقييمي';
        switch (status) {
            case 'approved':
                return 'معتمد';
            case 'pending':
                return 'قيد المراجعة';
            case 'rejected':
                return 'مرفوض';
            default:
                return 'ملف إبداعي';
        }
    };

    const getStatusColor = () => {
        switch (status) {
            case 'approved':
                return 'bg-green-100 text-green-700 border-green-200';
            case 'pending':
                return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'rejected':
                return 'bg-red-100 text-red-700 border-red-200';
            default:
                return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const getProjectImage = () => {
        if (project.image_url) return project.image_url;
        if (project.image) return `/storage/${project.image}`;
        return '/images/hero.png';
    };

    return (
        <button
            type="button"
            onClick={() => onOpen?.(project.id)}
            disabled={isPlaceholder || !onOpen}
            className={`w-full bg-white rounded-2xl border border-gray-100 overflow-hidden transition ${
                isPlaceholder || !onOpen
                    ? 'opacity-60 cursor-default'
                    : 'hover:shadow-md cursor-pointer'
            }`}
        >
            <div className="relative">
                <img
                    src={getProjectImage()}
                    alt={title}
                    className="h-40 w-full object-cover"
                    loading="lazy"
                    onError={(e) => {
                        e.target.src = '/images/hero.png';
                    }}
                />
                <div className={`absolute top-3 right-3 rounded-full px-3 py-1 text-[11px] font-semibold border ${getStatusColor()}`}>
                    {getStatusLabel()}
                </div>
            </div>

            <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#A3C042]/20 to-[#93b03a]/20 border border-gray-200 flex items-center justify-center">
                            <FaProjectDiagram className="text-[#A3C042] text-sm" />
                        </div>
                        <div className="text-xs text-gray-600">مشروعي</div>
                    </div>
                    {createdAt && (
                        <div className="text-xs text-gray-400">{formatDate(createdAt)}</div>
                    )}
                </div>

                <h3 className="text-sm font-bold text-gray-900 line-clamp-2 mb-1 text-right">
                    {title}
                </h3>

                <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                        <FaEye className="text-gray-400" />
                        <span>{views}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <FaHeart className="text-rose-400" />
                        <span>{likes}</span>
                    </div>
                    {rating !== null && (
                        <div className="flex items-center gap-1">
                            <FaStar className="text-yellow-400" />
                            <span>{rating.toFixed(1)}</span>
                        </div>
                    )}
                </div>
            </div>
        </button>
    );
}

export default function StudentLatestProjectsSection({ projects = [], onViewAll, onOpenProject }) {
    const list = Array.isArray(projects) ? projects.slice(0, 2) : [];

    if (list.length === 0) {
        return (
            <section>
                <div className="flex items-center justify-between px-1 mb-3">
                    <div className="text-sm font-bold text-gray-900">أحدث المشاريع</div>
                    <button
                        type="button"
                        onClick={onViewAll}
                        className="text-xs font-semibold text-[#A3C042] hover:text-[#93b03a]"
                    >
                        عرض الكل
                    </button>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <FaProjectDiagram className="text-gray-400 text-2xl" />
                    </div>
                    <h3 className="text-sm font-bold text-gray-900 mb-2">لا توجد مشاريع بعد</h3>
                    <p className="text-xs text-gray-600 mb-4">
                        ابدأ رحلتك الإبداعية برفع مشروعك الأول!
                    </p>
                    <button
                        type="button"
                        onClick={onViewAll}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-[#A3C042] text-white rounded-xl text-xs font-bold hover:bg-[#93b03a] transition"
                    >
                        <FaProjectDiagram className="text-xs" />
                        رفع مشروع جديد
                    </button>
                </div>
            </section>
        );
    }

    return (
        <section>
            <div className="flex items-center justify-between px-1 mb-3">
                <div className="text-sm font-bold text-gray-900">أحدث المشاريع</div>
                <button
                    type="button"
                    onClick={onViewAll}
                    className="text-xs font-semibold text-[#A3C042] hover:text-[#93b03a]"
                >
                    عرض الكل
                </button>
            </div>

            <div className="mt-3 space-y-4 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0">
                {list.map((project) => (
                    <ProjectCard
                        key={project.id}
                        project={project}
                        onOpen={onOpenProject}
                    />
                ))}
            </div>
        </section>
    );
}
