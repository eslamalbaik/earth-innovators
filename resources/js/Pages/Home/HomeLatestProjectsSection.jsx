import { FaEye, FaHeart, FaStar } from 'react-icons/fa';

function ProjectCard({ project, onOpen }) {
    const title = project?.title || 'تصميم واجهة مستخدم لتطبيق تعليمي';
    const views = project?.views ?? 156;
    const likes = project?.likes ?? 24;
    const rating = project?.rating ?? 0;
    const createdAt = project?.created_at || 'منذ يومين';
    const isPlaceholder = !project?.id || project.id.toString().startsWith('placeholder-');

    return (
        <button
            type="button"
            onClick={onOpen}
            disabled={isPlaceholder || !onOpen}
            className={`w-full  bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition ${
                isPlaceholder || !onOpen
                    ? 'opacity-60 cursor-default'
                    : 'hover:shadow-md cursor-pointer'
            }`}
        >
            <div className="relative">
                <img
                    src="/images/hero.png"
                    alt={title}
                    className="h-40 w-full object-cover"
                    loading="lazy"
                />
                <div className="absolute top-3 right-3 rounded-full bg-white/90 border border-gray-100 px-3 py-1 text-[11px] font-semibold text-gray-700">
                    ملف إبداعي
                </div>
            </div>

            <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-gray-200 border border-white" />
                        <div className="text-xs text-gray-600">أحمد محمد</div>
                    </div>
                    <div className="text-xs text-gray-400">{createdAt}</div>
                </div>

                <div className="text-sm font-bold text-gray-900 line-clamp-2">{title}</div>
                <div className="mt-1 text-xs text-gray-500 line-clamp-2">
                    مشروع تصميم واجهة مستخدم سهلة الاستخدام لتطبيق تعليمي يستهدف طلاب المرحلة الثانوية
                </div>

                <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                        <FaEye className="text-gray-400" />
                        <span>{views}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <FaHeart className="text-rose-400" />
                        <span>{likes}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <FaStar className="text-yellow-400" />
                        <span>{rating}</span>
                    </div>
                </div>
            </div>
        </button>
    );
}

export default function HomeLatestProjectsSection({ projects = [], onViewAll, onOpenProject }) {
    const list = Array.isArray(projects) ? projects.slice(0, 2) : [];

    return (
        <section>
            <div className="flex items-center justify-between px-1">
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
                {(list.length ? list : [{ id: 'placeholder-1' }, { id: 'placeholder-2' }]).map((p, idx) => {
                    const isPlaceholder = !p.id || p.id.toString().startsWith('placeholder-');
                    return (
                        <ProjectCard
                            key={p.id ?? idx}
                            project={p}
                            onOpen={isPlaceholder ? undefined : () => onOpenProject?.(p)}
                        />
                    );
                })}
            </div>
        </section>
    );
}


