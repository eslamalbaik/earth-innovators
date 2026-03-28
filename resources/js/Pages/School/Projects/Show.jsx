import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, router } from '@inertiajs/react';
import {
    FaCalendar,
    FaDownload,
    FaEdit,
    FaEye,
    FaFile,
    FaImage,
    FaTag,
    FaTrash,
    FaUser,
} from 'react-icons/fa';
import { useConfirmDialog } from '@/Contexts/ConfirmContext';
import { useToast } from '@/Contexts/ToastContext';
import { useBackIcon, useTranslation } from '@/i18n';
import { toHijriDate } from '@/utils/dateUtils';

const CATEGORY_COLORS = {
    science: 'bg-blue-100 text-blue-700',
    technology: 'bg-purple-100 text-purple-700',
    engineering: 'bg-orange-100 text-orange-700',
    mathematics: 'bg-green-100 text-green-700',
    arts: 'bg-pink-100 text-pink-700',
    other: 'bg-gray-100 text-gray-700',
};

const STATUS_COLORS = {
    pending: 'bg-yellow-100 text-yellow-700',
    approved: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
};

export default function ShowSchoolProject({ project, auth }) {
    const { t, language } = useTranslation();
    const BackIcon = useBackIcon();
    const { confirm } = useConfirmDialog();
    const { showError } = useToast();

    const canEdit = project.user_id === auth.user.id || project.school_id === auth.user.id || Boolean(project.teacher_id);

    const handleDelete = async () => {
        const confirmed = await confirm({
            title: t('confirmDialog.title'),
            message: t('schoolProjectsPage.deleteConfirm.message'),
            confirmText: t('schoolProjectsPage.deleteConfirm.confirmText'),
            cancelText: t('common.cancel'),
            variant: 'danger',
        });

        if (!confirmed) {
            return;
        }

        router.post(`/school/projects/${project.id}`, {
            _method: 'DELETE',
        }, {
            preserveScroll: false,
            onSuccess: () => {
                router.visit('/school/projects');
            },
            onError: () => {
                showError(t('toastMessages.schoolProjectDeleteError'));
            },
        });
    };

    const pageTitle = t('schoolProjectShowPage.pageTitle', {
        title: project.title,
        appName: t('common.appName'),
    });

    const categoryLabel = t(`common.categories.${project.category || 'other'}`);
    const statusLabel = t(`schoolProjectsPage.statuses.${project.status || 'pending'}`);
    const ownerName = project.user?.name || t('schoolProjectShowPage.details.ownerFallback');

    return (
        <DashboardLayout auth={auth} header={t('schoolProjectShowPage.header')}>
            <Head title={pageTitle} />

            <div className="mx-auto max-w-6xl">
                <div className="mb-6 flex items-center justify-between">
                    <Link
                        href="/school/projects"
                        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
                    >
                        <BackIcon />
                        <span>{t('schoolProjectShowPage.backToProjects')}</span>
                    </Link>

                    {canEdit && (
                        <div className="flex items-center gap-2">
                            <Link
                                href={`/school/projects/${project.id}/edit`}
                                className="flex items-center gap-2 rounded-lg bg-[#A3C042] px-4 py-2 font-medium text-white shadow-md transition duration-300 hover:bg-[#8CA635]"
                            >
                                <FaEdit />
                                {t('schoolProjectShowPage.editAction')}
                            </Link>
                            <button
                                onClick={handleDelete}
                                className="flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2 font-medium text-white shadow-md transition duration-300 hover:bg-red-600"
                            >
                                <FaTrash />
                                {t('schoolProjectShowPage.deleteAction')}
                            </button>
                        </div>
                    )}
                </div>

                <div className="overflow-hidden rounded-xl bg-white shadow-lg">
                    <div className="border-b border-gray-200 bg-gradient-to-r from-[#A3C042]/10 to-legacy-blue/10 px-6 py-4">
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                                <h1 className="mb-3 text-3xl font-bold text-gray-900">{project.title}</h1>
                                <div className="flex flex-wrap items-center gap-3">
                                    <span className={`rounded-full px-3 py-1 text-sm font-semibold ${CATEGORY_COLORS[project.category] || CATEGORY_COLORS.other}`}>
                                        <FaTag className="me-1 inline" />
                                        {categoryLabel}
                                    </span>
                                    <span className={`rounded-full px-3 py-1 text-sm font-semibold ${STATUS_COLORS[project.status] || STATUS_COLORS.pending}`}>
                                        {statusLabel}
                                    </span>
                                    {project.points_earned > 0 && (
                                        <span className="rounded-full bg-yellow-100 px-3 py-1 text-sm font-semibold text-yellow-700">
                                            {t('schoolProjectShowPage.pointsBadge', { points: project.points_earned })}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-6">
                        <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">
                            <div className="flex items-center gap-3 text-gray-700">
                                <FaUser className="text-[#A3C042]" />
                                <span className="font-medium">{t('schoolProjectShowPage.details.ownerLabel')}:</span>
                                <span>{ownerName}</span>
                            </div>
                            <div className="flex items-center gap-3 text-gray-700">
                                <FaCalendar className="text-[#A3C042]" />
                                <span className="font-medium">{t('schoolProjectShowPage.details.createdAtLabel')}:</span>
                                <span>{toHijriDate(project.created_at, false, language)}</span>
                            </div>
                            {project.approved_at && (
                                <div className="flex items-center gap-3 text-gray-700">
                                    <FaCalendar className="text-[#A3C042]" />
                                    <span className="font-medium">{t('schoolProjectShowPage.details.approvedAtLabel')}:</span>
                                    <span>{toHijriDate(project.approved_at, false, language)}</span>
                                </div>
                            )}
                        </div>

                        <div className="mb-6">
                            <h2 className="mb-3 text-xl font-bold text-gray-900">
                                {t('schoolProjectShowPage.details.descriptionTitle')}
                            </h2>
                            <p className="whitespace-pre-wrap leading-relaxed text-gray-700">{project.description}</p>
                        </div>

                        {project.report && (
                            <div className="mb-6">
                                <h2 className="mb-3 text-xl font-bold text-gray-900">
                                    {t('schoolProjectShowPage.details.reportTitle')}
                                </h2>
                                <div className="rounded-lg bg-gray-50 p-4">
                                    <p className="whitespace-pre-wrap leading-relaxed text-gray-700">{project.report}</p>
                                </div>
                            </div>
                        )}

                        {Array.isArray(project.images) && project.images.length > 0 && (
                            <div className="mb-6">
                                <h2 className="mb-3 flex items-center gap-2 text-xl font-bold text-gray-900">
                                    <FaImage className="text-[#A3C042]" />
                                    {t('schoolProjectShowPage.details.imagesTitle', { count: project.images.length })}
                                </h2>
                                <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                                    {project.images.map((image, index) => {
                                        const imageUrl = image.startsWith('http') ? image : `/storage/${image}`;

                                        return (
                                            <div key={`${imageUrl}-${index}`} className="group relative">
                                                <img
                                                    src={imageUrl}
                                                    alt={`${project.title} ${index + 1}`}
                                                    className="h-48 w-full rounded-lg object-cover shadow-md transition hover:shadow-xl"
                                                />
                                                <a
                                                    href={imageUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/0 transition group-hover:bg-black/40"
                                                >
                                                    <FaEye className="text-2xl text-white opacity-0 transition group-hover:opacity-100" />
                                                </a>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {Array.isArray(project.files) && project.files.length > 0 && (
                            <div>
                                <h2 className="mb-3 flex items-center gap-2 text-xl font-bold text-gray-900">
                                    <FaFile className="text-[#A3C042]" />
                                    {t('schoolProjectShowPage.details.filesTitle', { count: project.files.length })}
                                </h2>
                                <div className="space-y-2">
                                    {project.files.map((file, index) => {
                                        const fileName = typeof file === 'string' ? file.split('/').pop() : file;
                                        const fileUrl = file.startsWith('http') ? file : `/storage/${file}`;

                                        return (
                                            <a
                                                key={`${fileUrl}-${index}`}
                                                href={fileUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="group flex items-center justify-between rounded-lg bg-gray-50 p-4 transition hover:bg-gray-100"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <FaFile className="text-xl text-gray-400" />
                                                    <span className="font-medium text-gray-700">{fileName}</span>
                                                </div>
                                                <FaDownload className="text-[#A3C042] opacity-0 transition group-hover:opacity-100" />
                                            </a>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
