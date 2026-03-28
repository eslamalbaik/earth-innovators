import DashboardLayout from '@/Layouts/DashboardLayout';
import { useTranslation } from '@/i18n';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { FaBook, FaPlus, FaSearch, FaEye, FaEdit, FaTrash } from 'react-icons/fa';
import TextInput from '@/Components/TextInput';
import SelectInput from '@/Components/SelectInput';
import PrimaryButton from '@/Components/PrimaryButton';
import { toHijriDate } from '@/utils/dateUtils';
import { useConfirmDialog } from '@/Contexts/ConfirmContext';

const getInitialQueryValue = (key) => {
    if (typeof window === 'undefined') {
        return '';
    }

    return new URLSearchParams(window.location.search).get(key) || '';
};

const categoryColors = {
    science: 'bg-blue-100 text-blue-700',
    technology: 'bg-purple-100 text-purple-700',
    engineering: 'bg-orange-100 text-orange-700',
    mathematics: 'bg-green-100 text-green-700',
    arts: 'bg-pink-100 text-pink-700',
    other: 'bg-gray-100 text-gray-700',
};

const categoryKeys = ['science', 'technology', 'engineering', 'mathematics', 'arts', 'other'];

export default function SchoolProjects({ projects, auth }) {
    const { t, language } = useTranslation();
    const { confirm } = useConfirmDialog();
    const { data, setData, get } = useForm({
        search: getInitialQueryValue('search'),
        status: getInitialQueryValue('status'),
        category: getInitialQueryValue('category'),
    });

    const getCategoryLabel = (category) => t(`schoolProjectsPage.categories.${category || 'other'}`);

    const getStatusMeta = (status) => ({
        label: t(`schoolProjectsPage.statuses.${status || 'pending'}`),
        color: {
            pending: 'bg-yellow-100 text-yellow-700',
            approved: 'bg-green-100 text-green-700',
            rejected: 'bg-red-100 text-red-700',
        }[status] || 'bg-yellow-100 text-yellow-700',
    });

    const getProjectTitle = (project) => (
        language === 'ar'
            ? (project.title_ar || project.title)
            : (project.title || project.title_ar)
    );

    const getProjectDescription = (project) => (
        language === 'ar'
            ? (project.description_ar || project.description)
            : (project.description || project.description_ar)
    );

    const handleSearch = (e) => {
        e.preventDefault();
        get('/school/projects', {
            preserveScroll: true,
            preserveState: true,
        });
    };

    const handleDelete = async (projectId, e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        const confirmed = await confirm({
            title: t('schoolProjectsPage.deleteConfirm.title'),
            message: t('schoolProjectsPage.deleteConfirm.message'),
            confirmText: t('schoolProjectsPage.deleteConfirm.confirmText'),
            cancelText: t('common.cancel'),
            variant: 'danger',
        });

        if (confirmed) {
            router.post(`/school/projects/${projectId}`, {
                _method: 'DELETE',
            }, {
                preserveScroll: false,
                onSuccess: () => {
                    router.reload({ only: ['projects'] });
                },
                onError: () => {
                    window.alert(t('schoolProjectsPage.deleteError'));
                },
            });
        }
    };

    const pageTitle = t('schoolProjectsPage.pageTitle', {
        appName: t('common.appName'),
    });

    return (
        <DashboardLayout auth={auth} header={t('schoolProjectsPage.title')}>
            <Head title={pageTitle} />

            <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">{t('schoolProjectsPage.title')}</h2>
                <Link
                    href="/school/projects/create"
                    className="bg-[#A3C042] text-white px-6 py-3 rounded-lg font-semibold transition duration-300 flex items-center gap-2 shadow-md hover:shadow-xl"
                >
                    <FaPlus />
                    {t('schoolProjectsPage.actions.create')}
                </Link>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                <form onSubmit={handleSearch} className="flex gap-4">
                    <div className="flex-1">
                        <TextInput
                            type="text"
                            placeholder={t('schoolProjectsPage.filters.searchPlaceholder')}
                            value={data.search}
                            onChange={(e) => setData('search', e.target.value)}
                            className="w-full"
                        />
                    </div>
                    <div className="w-48">
                        <SelectInput
                            value={data.status}
                            onChange={(e) => setData('status', e.target.value)}
                        >
                            <option value="">{t('schoolProjectsPage.filters.allStatuses')}</option>
                            <option value="pending">{t('schoolProjectsPage.statuses.pending')}</option>
                            <option value="approved">{t('schoolProjectsPage.statuses.approved')}</option>
                            <option value="rejected">{t('schoolProjectsPage.statuses.rejected')}</option>
                        </SelectInput>
                    </div>
                    <div className="w-48">
                        <SelectInput
                            value={data.category}
                            onChange={(e) => setData('category', e.target.value)}
                        >
                            <option value="">{t('schoolProjectsPage.filters.allCategories')}</option>
                            {categoryKeys.map((category) => (
                                <option key={category} value={category}>
                                    {getCategoryLabel(category)}
                                </option>
                            ))}
                        </SelectInput>
                    </div>
                    <PrimaryButton type="submit">
                        <FaSearch className="inline me-2" />
                        {t('schoolProjectsPage.actions.search')}
                    </PrimaryButton>
                </form>
            </div>

            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-[#A3C042]/10 to-legacy-blue/10">
                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <FaBook className="text-[#A3C042]" />
                        {t('schoolProjectsPage.listTitle', { count: projects.total || 0 })}
                    </h3>
                </div>
                <div className="p-6">
                    {projects.data && projects.data.length > 0 ? (
                        <div className="space-y-4">
                            {projects.data.map((project) => {
                                const title = getProjectTitle(project);
                                const description = getProjectDescription(project);
                                const statusMeta = getStatusMeta(project.status);
                                const ownerName = project.user?.name || project.student_name || t('schoolProjectsPage.details.ownerSchool');

                                return (
                                    <div key={project.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <h4 className="text-xl font-bold text-gray-900">{title}</h4>
                                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${categoryColors[project.category] || categoryColors.other}`}>
                                                        {getCategoryLabel(project.category || 'other')}
                                                    </span>
                                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusMeta.color}`}>
                                                        {statusMeta.label}
                                                    </span>
                                                </div>
                                                <p className="text-gray-700 mb-2 line-clamp-2">{description}</p>
                                                <div className="flex items-center gap-4 text-sm text-gray-600">
                                                    <span>{t('schoolProjectsPage.details.owner')}: {ownerName}</span>
                                                    <span>•</span>
                                                    <span>{t('schoolProjectsPage.details.date')}: {toHijriDate(project.created_at, false, language)}</span>
                                                    {project.points_earned > 0 && (
                                                        <>
                                                            <span>•</span>
                                                            <span>{project.points_earned} {t('schoolProjectsPage.details.points')}</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 ms-6">
                                                <Link
                                                    href={`/school/projects/${project.id}`}
                                                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition duration-300 flex items-center gap-2"
                                                >
                                                    <FaEye />
                                                    {t('schoolProjectsPage.actions.view')}
                                                </Link>
                                                {(project.user_id === auth.user.id || project.school_id === auth.user.id || project.teacher_id) && (
                                                    <>
                                                        <Link
                                                            href={`/school/projects/${project.id}/edit`}
                                                            className="bg-[#A3C042] hover:bg-primary-600 text-white px-4 py-2 rounded-lg font-medium transition duration-300 flex items-center gap-2 shadow-md"
                                                        >
                                                            <FaEdit />
                                                            {t('schoolProjectsPage.actions.edit')}
                                                        </Link>
                                                        <button
                                                            onClick={(e) => handleDelete(project.id, e)}
                                                            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition duration-300 flex items-center gap-2 shadow-md"
                                                        >
                                                            <FaTrash />
                                                            {t('schoolProjectsPage.actions.delete')}
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <FaBook className="text-6xl text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-600 text-lg">{t('schoolProjectsPage.empty')}</p>
                        </div>
                    )}

                    {projects.links && projects.links.length > 3 && (
                        <div className="mt-6 flex justify-center">
                            <div className="flex gap-2">
                                {projects.links.map((link, index) => (
                                    <Link
                                        key={index}
                                        href={link.url || '#'}
                                        className={`px-4 py-2 rounded-lg font-medium transition ${link.active
                                            ? 'bg-[#A3C042] text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            } ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
