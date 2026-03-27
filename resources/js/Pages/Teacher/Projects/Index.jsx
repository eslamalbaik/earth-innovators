import { Head, Link, router } from '@inertiajs/react';
import { FaPlus, FaClock, FaCheckCircle, FaTimesCircle, FaEdit, FaTrash } from 'react-icons/fa';
import { toHijriDate } from '@/utils/dateUtils';
import { useConfirmDialog } from '@/Contexts/ConfirmContext';
import MobileAppLayout from '@/Layouts/MobileAppLayout';
import MobileTopBar from '@/Components/Mobile/MobileTopBar';
import MobileBottomNav from '@/Components/Mobile/MobileBottomNav';
import { useToast } from '@/Contexts/ToastContext';
import { useMemo, useState } from 'react';
import { useDir, useTranslation } from '@/i18n';

export default function TeacherProjects({ projects, auth }) {
    const { confirm } = useConfirmDialog();
    const { showError } = useToast();
    const { t, language } = useTranslation();
    const dir = useDir();
    const [filter, setFilter] = useState('all');

    const handleDelete = async (projectId, projectTitle, e) => {
        e.preventDefault();
        e.stopPropagation();

        const confirmed = await confirm({
            title: t('teacherProjectsPage.deleteConfirm.title'),
            message: t('teacherProjectsPage.deleteConfirm.message', { title: projectTitle }),
            confirmText: t('teacherProjectsPage.deleteAction'),
            cancelText: t('common.cancel'),
            variant: 'danger',
        });

        if (confirmed) {
            router.delete(`/teacher/projects/${projectId}`, {
                preserveScroll: true,
                onError: () => {
                    showError(t('teacherProjectsPage.deleteError'));
                },
            });
        }
    };

    const categoryLabels = {
        science: t('teacherProjectsPage.categories.science'),
        technology: t('teacherProjectsPage.categories.technology'),
        engineering: t('teacherProjectsPage.categories.engineering'),
        mathematics: t('teacherProjectsPage.categories.mathematics'),
        arts: t('teacherProjectsPage.categories.arts'),
        other: t('teacherProjectsPage.categories.other'),
    };

    const statusLabels = {
        pending: { label: t('teacherProjectsPage.statuses.pending'), color: 'bg-yellow-100 text-yellow-700 border-yellow-300', icon: FaClock },
        approved: { label: t('teacherProjectsPage.statuses.approved'), color: 'bg-green-100 text-green-700 border-green-300', icon: FaCheckCircle },
        rejected: { label: t('teacherProjectsPage.statuses.rejected'), color: 'bg-red-100 text-red-700 border-red-300', icon: FaTimesCircle },
    };

    const formatDate = (value) => {
        if (!value) return '-';

        if (language === 'ar') {
            return toHijriDate(value, false, language);
        }

        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        }).format(new Date(value));
    };

    const filteredProjects = useMemo(() => {
        const list = projects?.data || [];
        if (filter === 'all') return list;
        if (filter === 'pending') return list.filter((project) => project.status === 'pending');
        if (filter === 'evaluated') return list.filter((project) => project.status === 'approved' || project.status === 'rejected');
        if (filter === 'winners') return list.filter((project) => project.status === 'approved');
        return list;
    }, [projects?.data, filter]);

    const ProjectsContent = () => (
        <>
            <div className="flex items-center justify-between mb-3">
                <div className="text-lg font-extrabold text-gray-900">{t('teacherProjectsPage.title')}</div>
                <div className="flex items-center gap-2 text-gray-400">
                    <span className="text-sm">{t('teacherProjectsPage.filterLabel')}</span>
                </div>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2">
                <button
                    type="button"
                    onClick={() => setFilter('all')}
                    className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-bold transition ${filter === 'all' ? 'bg-[#A3C042] text-white' : 'bg-gray-100 text-gray-700'}`}
                >
                    {t('teacherProjectsPage.filters.all')}
                </button>
                <button
                    type="button"
                    onClick={() => setFilter('pending')}
                    className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-bold transition ${filter === 'pending' ? 'bg-[#A3C042] text-white' : 'bg-gray-100 text-gray-700'}`}
                >
                    {t('teacherProjectsPage.filters.pending')}
                </button>
                <button
                    type="button"
                    onClick={() => setFilter('evaluated')}
                    className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-bold transition ${filter === 'evaluated' ? 'bg-[#A3C042] text-white' : 'bg-gray-100 text-gray-700'}`}
                >
                    {t('teacherProjectsPage.filters.evaluated')}
                </button>
                <button
                    type="button"
                    onClick={() => setFilter('winners')}
                    className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-bold transition ${filter === 'winners' ? 'bg-[#A3C042] text-white' : 'bg-gray-100 text-gray-700'}`}
                >
                    {t('teacherProjectsPage.filters.winners')}
                </button>
            </div>

            <div className="mt-3 space-y-4">
                {filteredProjects.length > 0 ? (
                    filteredProjects.map((project) => {
                        const StatusIcon = statusLabels[project.status]?.icon || FaClock;
                        const status = statusLabels[project.status] || statusLabels.pending;
                        const categoryLabel = categoryLabels[project.category] || t('teacherProjectsPage.categories.other');

                        return (
                            <button
                                key={project.id}
                                type="button"
                                onClick={() => router.visit(`/teacher/projects/${project.id}`)}
                                className="w-full bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition"
                            >
                                <div className="flex items-stretch">
                                    <div className="flex-1 p-4">
                                        <div className="flex items-center justify-between gap-2">
                                            <div className="flex items-center gap-2">
                                                <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700">
                                                    {t('teacherProjectsPage.projectTypeTag')}
                                                </span>
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${status.color}`}>
                                                    {status.label}
                                                </span>
                                            </div>
                                            <div className="text-xs text-gray-400">{formatDate(project.created_at)}</div>
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

                                        {project.status === 'pending' && (
                                            <div className="absolute left-2 top-1/2 -translate-y-1/2 flex flex-col gap-2">
                                                <button
                                                    type="button"
                                                    onClick={(e) => handleDelete(project.id, project.title, e)}
                                                    className="h-9 w-9 rounded-full bg-white shadow border border-gray-100 flex items-center justify-center text-red-500"
                                                    aria-label={t('teacherProjectsPage.deleteAction')}
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
                                                    aria-label={t('teacherProjectsPage.editAction')}
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
                        {t('teacherProjectsPage.empty')}
                    </div>
                )}
            </div>

            <div className="mt-4">
                <Link
                    href="/teacher/projects/create"
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#A3C042] py-3 text-sm font-extrabold text-white hover:bg-[#8CA635] transition"
                >
                    <FaPlus />
                    {t('teacherProjectsPage.createAction')}
                </Link>
            </div>

            {projects?.links && projects.links.length > 3 && (
                <div className="mt-4 bg-white rounded-2xl border border-gray-100 p-3">
                    <div className="flex flex-wrap gap-2 justify-center">
                        {projects.links.map((link, index) => (
                            <Link
                                key={index}
                                href={link.url || '#'}
                                className={`px-3 py-2 rounded-xl text-sm font-semibold transition ${link.active ? 'bg-[#A3C042] text-white' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'} ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                </div>
            )}
        </>
    );

    return (
        <div dir={dir} className="min-h-screen bg-gray-50">
            <Head title={t('teacherProjectsPage.pageTitle', { appName: t('common.appName') })} />

            <div className="block md:hidden">
                <MobileAppLayout
                    auth={auth}
                    title={t('common.appName')}
                    activeNav="projects"
                    unreadCount={0}
                    onNotifications={() => router.visit('/notifications')}
                    onBack={() => router.visit('/teacher/dashboard')}
                >
                    <ProjectsContent />
                </MobileAppLayout>
            </div>

            <div className="hidden md:block">
                <MobileTopBar
                    title={t('common.appName')}
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
