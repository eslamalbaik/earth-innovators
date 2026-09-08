import { Head, Link, router } from '@inertiajs/react';
import { useState, useMemo } from 'react';
import { FaFilter, FaChevronDown, FaImage, FaEye, FaStar, FaTrophy, FaPlus } from 'react-icons/fa';
import MobileTopBar from '@/Components/Mobile/MobileTopBar';
import MobileBottomNav from '@/Components/Mobile/MobileBottomNav';
import { useDirection, getDropdownPosition } from '@/utils/directionUtils';
import { useTranslation } from '@/i18n';

export default function StudentProjectsIndex({ auth, projects, message, noticeKey, canStartNewSubmission = false }) {
    const { t, language } = useTranslation();
    const { dir } = useDirection();
    const isRtl = dir === 'rtl';
    const [filter, setFilter] = useState('all'); // all | pending | evaluated | winners
    const [showFilterDropdown, setShowFilterDropdown] = useState(false);
    const getRatingValue = (rating) => {
        const value = Number(rating);
        return Number.isFinite(value) ? value : 0;
    };

    // Map project status to filter categories. A project's own `status` is
    // always 'approved' here (this list only shows approved projects) — it
    // says nothing about whether *this student* submitted to it. Only the
    // student's own submission_status determines pending/evaluated/winner.
    const getProjectStatus = (project) => {
        if (!project.submission_status) {
            return 'available';
        }

        const rating = getRatingValue(project.rating);

        if (project.submission_status === 'pending' || project.submission_status === 'under_review') {
            return 'pending';
        }
        if (project.submission_status === 'evaluated' || project.submission_status === 'approved') {
            return rating >= 4.5 ? 'winners' : 'evaluated';
        }

        return 'available';
    };

    const filteredProjects = useMemo(() => {
        const list = projects?.data || [];
        if (filter === 'all') return list;
        return list.filter((p) => getProjectStatus(p) === filter);
    }, [projects?.data, filter]);

    const getStatusLabel = (project) => {
        const status = getProjectStatus(project);
        if (status === 'pending') {
            return { label: t('studentProjects.statusUnderReview'), color: 'bg-yellow-100 text-yellow-700 border-yellow-300' };
        }
        if (status === 'evaluated') {
            return { label: t('studentProjects.statusEvaluated'), color: 'bg-blue-100 text-blue-700 border-blue-300' };
        }
        if (status === 'winners') {
            return { label: t('studentProjects.statusWinner'), color: 'bg-green-100 text-green-700 border-green-300' };
        }
        return { label: t('studentProjects.statusAvailable'), color: 'bg-gray-100 text-gray-700 border-gray-300' };
    };

    const getCategoryLabel = (category) => {
        if (!category) return t('categories.other');
        const key = `categories.${category}`;
        const translated = t(key);
        if (translated === key) return t('categories.other');
        return translated;
    };

    const formatDate = (date) => {
        if (!date) return '';
        const d = new Date(date);
        const months = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
        const monthLabel = t(`common.${months[d.getMonth()]}`);
        return `${d.getDate()} ${monthLabel} ${d.getFullYear()}`;
    };

    const handleViewProject = (projectId) => {
        router.visit(`/student/projects/${projectId}`);
    };

    const ProjectsContent = () => (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <div className="text-lg font-extrabold text-gray-900">{t('studentProjects.heading')}</div>
                <div className="flex items-center gap-2 text-gray-400 relative">
                    <button
                        type="button"
                        onClick={() => router.visit('/student/projects/create')}
                        className="flex items-center gap-1.5 rounded-xl bg-[#A3C042] px-3 py-2 text-sm font-semibold text-white hover:bg-[#8CA635] transition"
                    >
                        <FaPlus className="text-xs" />
                        {t('studentProjects.actions.newSubmission')}
                    </button>
                    <button
                        type="button"
                        onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                        className="flex items-center gap-1 text-sm"
                    >
                        <FaFilter />
                        <span>{t('common.filter')}</span>
                        <FaChevronDown className="text-xs" />
                    </button>
                    {showFilterDropdown && (
                        <div className={`absolute ${getDropdownPosition(isRtl)} top-full mt-2 bg-white rounded-xl shadow-lg border border-gray-200 p-2 z-10 min-w-[150px]`}>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowFilterDropdown(false);
                                }}
                                className="w-full  px-3 py-2 text-sm hover:bg-gray-50 rounded-lg"
                            >
                                {t('studentProjects.advancedFilter')}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Filter Buttons */}
            <div className="flex gap-2 overflow-x-auto pb-2">
                <button
                    type="button"
                    onClick={() => setFilter('all')}
                    className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-bold transition ${filter === 'all' ? 'bg-[#A3C042] text-white' : 'bg-white text-gray-700'
                        }`}
                >
                    {t('common.all')}
                </button>
                <button
                    type="button"
                    onClick={() => setFilter('pending')}
                    className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-bold transition ${filter === 'pending' ? 'bg-[#A3C042] text-white' : 'bg-white text-gray-700'
                        }`}
                >
                    {t('studentProjects.filterPending')}
                </button>
                <button
                    type="button"
                    onClick={() => setFilter('evaluated')}
                    className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-bold transition ${filter === 'evaluated' ? 'bg-[#A3C042] text-white' : 'bg-white text-gray-700'
                        }`}
                >
                    {t('studentProjects.filterEvaluated')}
                </button>
                <button
                    type="button"
                    onClick={() => setFilter('winners')}
                    className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-bold transition ${filter === 'winners' ? 'bg-[#A3C042] text-white' : 'bg-white text-gray-700'
                        }`}
                >
                    {t('studentProjects.filterWinners')}
                </button>
            </div>

            {/* Projects List */}
            {(noticeKey || message) && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-900">
                    {noticeKey ? t(noticeKey) : message}
                </div>
            )}

            {!canStartNewSubmission && (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm text-slate-700">
                    {t('studentProjects.upload.cannotStartHint')}
                </div>
            )}

            {filteredProjects.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredProjects.map((project) => {
                        const statusInfo = getStatusLabel(project);
                        const categoryLabel = getCategoryLabel(project.category);
                        const projectDate = formatDate(project.submitted_at || project.created_at || project.approved_at);
                        const rating = getRatingValue(project.rating);
                        const pointsEarned = Number(project.points_earned) || 0;
                        const imageSrc = project.thumbnail || (Array.isArray(project.images) && project.images[0]) || null;
                        const title = (language === 'ar' ? (project.title_ar || project.title) : (project.title || project.title_ar)) || t('studentProjects.defaultProjectTitle');

                        return (
                            <div
                                key={project.id}
                                onClick={() => handleViewProject(project.id)}
                                className="group bg-white rounded-2xl border border-gray-100 overflow-hidden cursor-pointer hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
                            >
                                {/* Project Image */}
                                <div className="relative w-full aspect-video bg-gray-100 overflow-hidden">
                                    {imageSrc ? (
                                        <img
                                            src={imageSrc}
                                            alt={title}
                                            loading="lazy"
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                                            <FaImage className="text-gray-400 text-3xl" />
                                        </div>
                                    )}
                                    <span className={`absolute top-2 ${isRtl ? 'right-2' : 'left-2'} px-2 py-1 rounded-full text-[10px] font-semibold border shadow-sm bg-white/90 backdrop-blur ${statusInfo.color}`}>
                                        {statusInfo.label}
                                    </span>
                                </div>

                                {/* Project Info */}
                                <div className="p-4">
                                    <div className="flex items-start justify-between gap-2 mb-1">
                                        <h3 className="text-sm font-bold text-gray-900 line-clamp-1">{title}</h3>
                                        <FaEye className="text-gray-300 text-sm flex-shrink-0 group-hover:text-[#A3C042] transition-colors" />
                                    </div>
                                    <p className="text-xs text-gray-500 mb-2">{projectDate}</p>

                                    <div className="flex items-center gap-2 flex-wrap mb-2">
                                        <span className="px-2 py-1 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-700 border border-gray-200">
                                            {categoryLabel}
                                        </span>
                                    </div>

                                    {/* Rating and Points */}
                                    {(rating > 0 || pointsEarned > 0) && (
                                        <div className="flex items-center gap-3 pt-2 mt-2 border-t border-gray-100">
                                            {rating > 0 && (
                                                <div className="flex items-center gap-1 text-xs text-yellow-600">
                                                    <FaStar className="text-yellow-500" />
                                                    <span className="font-semibold">{rating.toFixed(1)}</span>
                                                </div>
                                            )}
                                            {pointsEarned > 0 && (
                                                <div className="flex items-center gap-1 text-xs text-blue-600">
                                                    <FaTrophy className="text-blue-500" />
                                                    <span className="font-semibold">{t('studentProjects.pointsCount', { count: pointsEarned })}</span>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                    <p className="text-gray-500 text-sm">{t('studentProjects.empty')}</p>
                </div>
            )}

            {/* Pagination */}
            {projects?.links && projects.links.length > 3 && (
                <div className="bg-white rounded-2xl border border-gray-100 p-3">
                    <div className="flex flex-wrap gap-2 justify-center">
                        {projects.links.map((link, index) => (
                            <Link
                                key={index}
                                href={link.url || '#'}
                                className={`px-3 py-2 rounded-xl text-sm font-semibold transition ${link.active
                                        ? 'bg-[#A3C042] text-white'
                                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                                    } ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );

    return (
        <div dir={dir} className="min-h-screen bg-gray-50">
            <Head title={t('studentProjects.pageTitle')} />

            {/* Mobile View */}
            <div className="block md:hidden">
                <MobileTopBar
                    title={t('common.appName')}
                    unreadCount={auth?.unreadCount || 0}
                    onNotifications={() => router.visit('/notifications')}
                    onBack={() => router.visit('/dashboard')}
                />
                <main className="px-4 pb-24 pt-4">
                    <ProjectsContent />
                </main>
                <MobileBottomNav active="projects" role={auth?.user?.role} isAuthed={!!auth?.user} user={auth?.user} />
            </div>

            {/* Desktop View */}
            <div className="hidden md:block">
                <MobileTopBar
                    title={t('common.appName')}
                    unreadCount={auth?.unreadCount || 0}
                    onNotifications={() => router.visit('/notifications')}
                    onBack={() => router.visit('/dashboard')}
                />
                <main className="mx-auto w-full max-w-6xl px-4 pb-24 pt-4">
                    <div className="mx-auto w-full max-w-3xl">
                        <ProjectsContent />
                    </div>
                </main>
                <MobileBottomNav active="projects" role={auth?.user?.role} isAuthed={!!auth?.user} user={auth?.user} />
            </div>
        </div>
    );
}
