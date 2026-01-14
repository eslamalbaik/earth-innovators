import { Head, Link, router } from '@inertiajs/react';
import { FaProjectDiagram, FaPlus, FaEye, FaClock, FaCheckCircle, FaTimesCircle, FaEdit, FaTrash } from 'react-icons/fa';
import { toHijriDate } from '@/utils/dateUtils';
import { useConfirmDialog } from '@/Contexts/ConfirmContext';
import MobileAppLayout from '@/Layouts/MobileAppLayout';
import MobileTopBar from '@/Components/Mobile/MobileTopBar';
import MobileBottomNav from '@/Components/Mobile/MobileBottomNav';
import { useToast } from '@/Contexts/ToastContext';
import { useMemo, useState } from 'react';

export default function TeacherProjects({ projects, auth }) {
    const { confirm } = useConfirmDialog();
    const { showError } = useToast();
    const [filter, setFilter] = useState('all'); // all | pending | evaluated | winners

    const handleDelete = async (projectId, projectTitle, e) => {
        e.preventDefault();
        e.stopPropagation();
        
        const confirmed = await confirm({
            title: 'تأكيد الحذف',
            message: `هل أنت متأكد من حذف المشروع "${projectTitle}"؟ هذا الإجراء لا يمكن التراجع عنه.`,
            confirmText: 'حذف',
            cancelText: 'إلغاء',
            variant: 'danger',
        });

        if (confirmed) {
            router.delete(`/teacher/projects/${projectId}`, {
                preserveScroll: true,
                onSuccess: () => {
                    // تم الحذف بنجاح
                },
                onError: (errors) => {
                    console.error('Error deleting project:', errors);
                    showError('حدث خطأ أثناء حذف المشروع. يرجى المحاولة مرة أخرى.');
                },
            });
        }
    };

    const categoryColors = {
        science: 'bg-blue-100 text-blue-700 border-blue-300',
        technology: 'bg-purple-100 text-purple-700 border-purple-300',
        engineering: 'bg-orange-100 text-orange-700 border-orange-300',
        mathematics: 'bg-green-100 text-green-700 border-green-300',
        arts: 'bg-pink-100 text-pink-700 border-pink-300',
        other: 'bg-gray-100 text-gray-700 border-gray-300',
    };

    const categoryLabels = {
        science: 'علوم',
        technology: 'تقني',
        engineering: 'هندسة',
        mathematics: 'رياضيات',
        arts: 'فنون',
        other: 'أخرى',
    };

    const statusLabels = {
        pending: { label: 'قيد المراجعة', color: 'bg-yellow-100 text-yellow-700 border-yellow-300', icon: FaClock },
        approved: { label: 'موافق', color: 'bg-green-100 text-green-700 border-green-300', icon: FaCheckCircle },
        rejected: { label: 'مرفوض', color: 'bg-red-100 text-red-700 border-red-300', icon: FaTimesCircle },
    };

    const filteredProjects = useMemo(() => {
        const list = projects?.data || [];
        if (filter === 'all') return list;
        if (filter === 'pending') return list.filter((p) => p.status === 'pending');
        if (filter === 'evaluated') return list.filter((p) => p.status === 'approved' || p.status === 'rejected');
        if (filter === 'winners') return list.filter((p) => p.status === 'approved');
        return list;
    }, [projects?.data, filter]);

    const ProjectsContent = () => (
        <>
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-gray-400">
                    <span className="text-sm">فلترة</span>
                </div>
                <div className="text-lg font-extrabold text-gray-900">المشاريع</div>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2">
                <button
                    type="button"
                    onClick={() => setFilter('all')}
                    className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-bold transition ${
                        filter === 'all' ? 'bg-[#A3C042] text-white' : 'bg-gray-100 text-gray-700'
                    }`}
                >
                    الكل
                </button>
                <button
                    type="button"
                    onClick={() => setFilter('pending')}
                    className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-bold transition ${
                        filter === 'pending' ? 'bg-[#A3C042] text-white' : 'bg-gray-100 text-gray-700'
                    }`}
                >
                    تحت التقييم
                </button>
                <button
                    type="button"
                    onClick={() => setFilter('evaluated')}
                    className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-bold transition ${
                        filter === 'evaluated' ? 'bg-[#A3C042] text-white' : 'bg-gray-100 text-gray-700'
                    }`}
                >
                    تم التقييم
                </button>
                <button
                    type="button"
                    onClick={() => setFilter('winners')}
                    className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-bold transition ${
                        filter === 'winners' ? 'bg-[#A3C042] text-white' : 'bg-gray-100 text-gray-700'
                    }`}
                >
                    الفائزين
                </button>
            </div>

            <div className="mt-3 space-y-4">
                {filteredProjects.length > 0 ? (
                    filteredProjects.map((project) => {
                                const StatusIcon = statusLabels[project.status]?.icon || FaClock;
                        const status = statusLabels[project.status] || statusLabels.pending;
                        const categoryLabel = categoryLabels[project.category] || 'أخرى';

                                return (
                            <button
                                key={project.id}
                                type="button"
                                onClick={() => router.visit(`/teacher/projects/${project.id}`)}
                                className="w-full  bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition"
                            >
                                <div className="flex items-stretch">
                                    <div className="flex-1 p-4">
                                        <div className="flex items-center justify-between gap-2">
                                            <div className="flex items-center gap-2">
                                                <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700">
                                                    تطبيقات الجوال
                                                    </span>
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${status.color}`}>
                                                    {status.label}
                                                    </span>
                                                </div>
                                            <div className="text-xs text-gray-400">{toHijriDate(project.created_at)}</div>
                                        </div>

                                        <div className="mt-2 text-base font-extrabold text-gray-900 line-clamp-1">
                                            {project.title}
                                        </div>
                                        <div className="mt-1 text-sm text-gray-500 line-clamp-1">{project.description}</div>

                                        <div className="mt-3 flex items-center gap-2">
                                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700">
                                                {categoryLabel}
                                            </span>
                                            <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                                                <StatusIcon className="text-xs" />
                                            </span>
                                                </div>
                                            </div>

                                    <div className="relative w-28">
                                        <img
                                            src="/images/hero.png"
                                            alt={project.title}
                                            className="h-full w-full object-cover"
                                            loading="lazy"
                                        />

                                        {/* Actions (مثل الصورة: دوائر) */}
                                                {project.status === 'pending' && (
                                            <div className="absolute left-2 top-1/2 -translate-y-1/2 flex flex-col gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={(e) => handleDelete(project.id, project.title, e)}
                                                    className="h-9 w-9 rounded-full bg-white shadow border border-gray-100 flex items-center justify-center text-red-500"
                                                    aria-label="حذف"
                                                        >
                                                            <FaTrash />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        router.visit(`/teacher/projects/${project.id}/edit`);
                                                    }}
                                                    className="h-9 w-9 rounded-full bg-white shadow border border-gray-100 flex items-center justify-center text-gray-600"
                                                    aria-label="تعديل"
                                                >
                                                    <FaEdit />
                                                        </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </button>
                                );
                    })
                ) : (
                    <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center text-gray-600">
                        لا توجد مشاريع
                    </div>
                )}
                        </div>

            <div className="mt-4">
                            <Link
                                href="/teacher/projects/create"
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#A3C042] py-3 text-sm font-extrabold text-white hover:bg-[#93b03a] transition"
                            >
                    <FaPlus />
                    رفع مشروع جديد
                            </Link>
                        </div>

            {projects?.links && projects.links.length > 3 && (
                <div className="mt-4 bg-white rounded-2xl border border-gray-100 p-3">
                    <div className="flex flex-wrap gap-2 justify-center">
                                {projects.links.map((link, index) => (
                                    <Link
                                        key={index}
                                        href={link.url || '#'}
                                className={`px-3 py-2 rounded-xl text-sm font-semibold transition ${
                                    link.active ? 'bg-[#A3C042] text-white' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                                        } ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
        </>
    );

    return (
        <div dir="rtl" className="min-h-screen bg-gray-50">
            <Head title="المشاريع - إرث المبتكرين" />

            {/* Mobile View */}
            <div className="block md:hidden">
                <MobileAppLayout
                    auth={auth}
                    title="إرث المبتكرين"
                    activeNav="projects"
                    unreadCount={0}
                    onNotifications={() => router.visit('/notifications')}
                    onBack={() => router.visit('/teacher/dashboard')}
                >
                    <ProjectsContent />
                </MobileAppLayout>
            </div>

            {/* Desktop View */}
            <div className="hidden md:block">
                <MobileTopBar
                    title="إرث المبتكرين"
                    unreadCount={auth?.unreadCount || 0}
                    onNotifications={() => router.visit('/notifications')}
                    onBack={() => router.visit('/teacher/dashboard')}
                    reverseOrder={false}
                />
                <main className="mx-auto w-full max-w-6xl px-4 pb-24 pt-4">
                    <div className="mx-auto w-full max-w-4xl">
                        <ProjectsContent />
                    </div>
                </main>
                <MobileBottomNav active="projects" role={auth?.user?.role} isAuthed={!!auth?.user} user={auth?.user} />
            </div>
        </div>
    );
}

