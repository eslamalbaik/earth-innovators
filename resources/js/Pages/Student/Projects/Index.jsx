import { Head, Link, router } from '@inertiajs/react';
import { useState, useMemo } from 'react';
import { FaFilter, FaChevronDown, FaImage, FaEye, FaStar, FaTrophy, FaTrash } from 'react-icons/fa';
import MobileTopBar from '@/Components/Mobile/MobileTopBar';
import MobileBottomNav from '@/Components/Mobile/MobileBottomNav';
import { useToast } from '@/Contexts/ToastContext';

export default function StudentProjectsIndex({ auth, projects, message }) {
    const [filter, setFilter] = useState('all'); // all | pending | evaluated | winners
    const [showFilterDropdown, setShowFilterDropdown] = useState(false);

    // Map project status to filter categories
    const getProjectStatus = (project) => {
        // If project has submission status, use it
        if (project.submission_status) {
            if (project.submission_status === 'pending' || project.submission_status === 'under_review') {
                return 'pending';
            }
            if (project.submission_status === 'evaluated' || project.submission_status === 'approved') {
                return project.rating >= 4.5 ? 'winners' : 'evaluated';
            }
        }
        // Otherwise use project status
        if (project.status === 'pending' || project.status === 'under_review') {
            return 'pending';
        }
        if (project.status === 'approved' || project.status === 'evaluated') {
            return project.rating >= 4.5 ? 'winners' : 'evaluated';
        }
        return 'evaluated';
    };

    const filteredProjects = useMemo(() => {
        const list = projects?.data || [];
        if (filter === 'all') return list;
        return list.filter((p) => getProjectStatus(p) === filter);
    }, [projects?.data, filter]);

    const getStatusLabel = (project) => {
        const status = getProjectStatus(project);
        if (status === 'pending') return { label: 'تحت التقييم', color: 'bg-yellow-100 text-yellow-700 border-yellow-300' };
        if (status === 'evaluated') return { label: 'تم التقييم', color: 'bg-blue-100 text-blue-700 border-blue-300' };
        if (status === 'winners') return { label: 'فائز', color: 'bg-green-100 text-green-700 border-green-300' };
        return { label: 'تم التقييم', color: 'bg-blue-100 text-blue-700 border-blue-300' };
    };

    const getCategoryLabel = (category) => {
        const labels = {
            science: 'علوم',
            technology: 'تقنية',
            engineering: 'هندسة',
            mathematics: 'رياضيات',
            arts: 'فنون',
            mobile: 'تطبيقات الجوال',
            other: 'أخرى',
        };
        return labels[category] || 'أخرى';
    };

    const formatDate = (date) => {
        if (!date) return '';
        const d = new Date(date);
        const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
        return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
    };

    const handleViewProject = (projectId) => {
        router.visit(`/student/projects/${projectId}`);
    };

    const ProjectsContent = () => (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <div className="text-lg font-extrabold text-gray-900">المشاريع</div>
                <div className="flex items-center gap-2 text-gray-400 relative">
                    <button
                        type="button"
                        onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                        className="flex items-center gap-1 text-sm"
                    >
                        <FaFilter />
                        <span>فلترة</span>
                        <FaChevronDown className="text-xs" />
                    </button>
                    {showFilterDropdown && (
                        <div className="absolute top-full right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-200 p-2 z-10 min-w-[150px]">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowFilterDropdown(false);
                                    // يمكن إضافة فلترة إضافية هنا
                                }}
                                className="w-full  px-3 py-2 text-sm hover:bg-gray-50 rounded-lg"
                            >
                                فلترة متقدمة
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
                    الكل
                </button>
                <button
                    type="button"
                    onClick={() => setFilter('pending')}
                    className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-bold transition ${filter === 'pending' ? 'bg-[#A3C042] text-white' : 'bg-white text-gray-700'
                        }`}
                >
                    تحت التقييم
                </button>
                <button
                    type="button"
                    onClick={() => setFilter('evaluated')}
                    className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-bold transition ${filter === 'evaluated' ? 'bg-[#A3C042] text-white' : 'bg-white text-gray-700'
                        }`}
                >
                    تم التقييم
                </button>
                <button
                    type="button"
                    onClick={() => setFilter('winners')}
                    className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-bold transition ${filter === 'winners' ? 'bg-[#A3C042] text-white' : 'bg-white text-gray-700'
                        }`}
                >
                    الفائزيين
                </button>
            </div>

            {/* Projects List */}
            {message && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 text-sm text-yellow-800">
                    {message}
                </div>
            )}

            {filteredProjects.length > 0 ? (
                <div className="space-y-4">
                    {filteredProjects.map((project) => {
                        const statusInfo = getStatusLabel(project);
                        const categoryLabel = getCategoryLabel(project.category);
                        const projectDate = formatDate(project.submitted_at || project.created_at || project.approved_at);

                        return (
                            <div
                                key={project.id}
                                onClick={() => handleViewProject(project.id)}
                                className="bg-white rounded-2xl border border-gray-100 p-4 flex items-start gap-4 cursor-pointer hover:shadow-md transition"
                            >
                                {/* Project Image */}
                                <div className="flex-shrink-0">
                                    {project.image || project.thumbnail ? (
                                        <img
                                            src={project.image || project.thumbnail || '/images/hero.png'}
                                            alt={project.title}
                                            className="w-20 h-20 rounded-xl object-cover"
                                        />
                                    ) : (
                                        <div className="w-20 h-20 rounded-xl bg-gray-200 flex items-center justify-center">
                                            <FaImage className="text-gray-400 text-2xl" />
                                        </div>
                                    )}
                                </div>

                                {/* Project Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2 mb-2">
                                        <div className="flex-1">
                                            <h3 className="text-sm font-bold text-gray-900 mb-1 line-clamp-1">
                                                {project.title || 'تطبيق إدارة المهام'}
                                            </h3>
                                            <p className="text-xs text-gray-500">{projectDate || '2 أغسطس 2025'}</p>
                                        </div>
                                        <FaEye className="text-gray-400 text-sm flex-shrink-0" />
                                    </div>

                                    <div className="flex items-center gap-2 flex-wrap mb-2">
                                        <span className="px-2 py-1 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-700 border border-gray-200">
                                            {categoryLabel}
                                        </span>
                                        <span className={`px-2 py-1 rounded-full text-[10px] font-semibold border ${statusInfo.color}`}>
                                            {statusInfo.label}
                                        </span>
                                    </div>

                                    {/* Rating and Points */}
                                    {(project.rating > 0 || project.points_earned > 0) && (
                                        <div className="flex items-center gap-3 mt-2">
                                            {project.rating > 0 && (
                                                <div className="flex items-center gap-1 text-xs text-yellow-600">
                                                    <FaStar className="text-yellow-500" />
                                                    <span className="font-semibold">{project.rating.toFixed(1)}</span>
                                                </div>
                                            )}
                                            {project.points_earned > 0 && (
                                                <div className="flex items-center gap-1 text-xs text-blue-600">
                                                    <FaTrophy className="text-blue-500" />
                                                    <span className="font-semibold">{project.points_earned} نقطة</span>
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
                    <p className="text-gray-500 text-sm">لا توجد مشاريع</p>
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
        <div dir="rtl" className="min-h-screen bg-gray-50">
            <Head title="مشاريعي - إرث المبتكرين" />

            {/* Mobile View */}
            <div className="block md:hidden">
                <MobileTopBar
                    title="إرث المبتكرين"
                    unreadCount={auth?.unreadCount || 0}
                    onNotifications={() => router.visit('/notifications')}
                    onBack={() => router.visit('/')}
                />
                <main className="px-4 pb-24 pt-4">
                    <ProjectsContent />
                </main>
                <MobileBottomNav active="projects" role={auth?.user?.role} isAuthed={!!auth?.user} user={auth?.user} />
            </div>

            {/* Desktop View */}
            <div className="hidden md:block">
                <MobileTopBar
                    title="إرث المبتكرين"
                    unreadCount={auth?.unreadCount || 0}
                    onNotifications={() => router.visit('/notifications')}
                    onBack={() => router.visit('/')}
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
