import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import {
    FaSearch,
    FaFilter,
    FaEye,
    FaTrash,
    FaBook,
    FaCalendar,
    FaPlus,
} from 'react-icons/fa';
import { getPublicationImageUrl } from '@/utils/imageUtils';
import { useConfirmDialog } from '@/Contexts/ConfirmContext';
import { useTranslation } from '@/i18n';

export default function AdminPublicationsIndex({
    publications = { data: [], links: [] },
    stats = { total: 0, approved: 0, pending: 0, rejected: 0 },
    filters = {},
}) {
    const { t, language } = useTranslation();
    const { confirm } = useConfirmDialog();
    const [search, setSearch] = useState(filters?.search || '');
    const [status, setStatus] = useState(filters?.status || '');
    const [type, setType] = useState(filters?.type || '');

    const handleFilter = () => {
        router.get(route('admin.publications.index'), {
            search: search || undefined,
            status: status || undefined,
            type: type || undefined,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleDelete = async (publication) => {
        const confirmed = await confirm({
            title: t('adminPublicationsIndexPage.deleteConfirm.title'),
            message: t('adminPublicationsIndexPage.deleteConfirm.message', { title: publication.title }),
            confirmText: t('common.delete'),
            cancelText: t('common.cancel'),
            variant: 'danger',
        });

        if (confirmed) {
            router.delete(route('admin.publications.destroy', publication.id), {
                preserveScroll: true,
            });
        }
    };

    const getStatusBadge = (publicationStatus) => {
        const statusMap = {
            approved: { bg: 'bg-green-100', text: 'text-green-800', label: t('adminPublicationsIndexPage.statuses.approved') },
            pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: t('adminPublicationsIndexPage.statuses.pending') },
            rejected: { bg: 'bg-red-100', text: 'text-red-800', label: t('adminPublicationsIndexPage.statuses.rejected') },
        };
        const statusConfig = statusMap[publicationStatus] || { bg: 'bg-gray-100', text: 'text-gray-800', label: publicationStatus };

        return (
            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusConfig.bg} ${statusConfig.text}`}>
                {statusConfig.label}
            </span>
        );
    };

    const getTypeLabel = (publicationType) => {
        const translation = t(`common.publicationTypes.${publicationType}`);
        return translation === `common.publicationTypes.${publicationType}` ? publicationType : translation;
    };

    const formatDate = (date) => {
        if (!date) return '';
        return new Date(date).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    return (
        <DashboardLayout header={t('adminPublicationsIndexPage.title')}>
            <Head title={t('adminPublicationsIndexPage.pageTitle', { appName: t('common.appName') })} />

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <p className="text-sm text-gray-600 mb-2">{t('adminPublicationsIndexPage.stats.total')}</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.total || 0}</p>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <p className="text-sm text-gray-600 mb-2">{t('adminPublicationsIndexPage.stats.approved')}</p>
                    <p className="text-3xl font-bold text-green-600">{stats.approved || 0}</p>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <p className="text-sm text-gray-600 mb-2">{t('adminPublicationsIndexPage.stats.pending')}</p>
                    <p className="text-3xl font-bold text-yellow-600">{stats.pending || 0}</p>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <p className="text-sm text-gray-600 mb-2">{t('adminPublicationsIndexPage.stats.rejected')}</p>
                    <p className="text-3xl font-bold text-red-600">{stats.rejected || 0}</p>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-gray-900">{t('adminPublicationsIndexPage.filters.title')}</h2>
                    <Link
                        href={route('admin.publications.create')}
                        className="px-6 py-2 bg-[#A3C042] hover:bg-[#8CA635] text-white font-semibold rounded-lg flex items-center gap-2"
                    >
                        <FaPlus />
                        {t('adminPublicationsIndexPage.actions.add')}
                    </Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">{t('common.search')}</label>
                        <div className="relative">
                            <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder={t('adminPublicationsIndexPage.filters.searchPlaceholder')}
                                className="w-full ps-10 pe-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">{t('common.status')}</label>
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="">{t('common.all')}</option>
                            <option value="approved">{t('adminPublicationsIndexPage.statuses.approved')}</option>
                            <option value="pending">{t('adminPublicationsIndexPage.statuses.pending')}</option>
                            <option value="rejected">{t('adminPublicationsIndexPage.statuses.rejected')}</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">{t('adminPublicationsIndexPage.filters.typeLabel')}</label>
                        <select
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="">{t('common.all')}</option>
                            <option value="magazine">{t('common.publicationTypes.magazine')}</option>
                            <option value="booklet">{t('common.publicationTypes.booklet')}</option>
                            <option value="report">{t('common.publicationTypes.report')}</option>
                            <option value="article">{t('common.publicationTypes.article')}</option>
                        </select>
                    </div>
                    <div className="flex items-end">
                        <button
                            onClick={handleFilter}
                            className="w-full bg-[#A3C042] hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center justify-center gap-2"
                        >
                            <FaFilter />
                            {t('common.filter')}
                        </button>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                {publications?.data?.length > 0 ? (
                    <div className="divide-y divide-gray-200">
                        {publications.data.map((publication) => {
                            const coverImage = getPublicationImageUrl(publication.cover_image);

                            return (
                                <div key={publication.id} className="p-6 hover:bg-gray-50 transition">
                                    <div className="flex flex-col md:flex-row gap-6">
                                        <div className="md:w-32 flex-shrink-0">
                                            {coverImage ? (
                                                <img
                                                    src={coverImage}
                                                    alt={publication.title}
                                                    className="w-full h-32 object-cover rounded-lg"
                                                />
                                            ) : (
                                                <div className="w-full h-32 bg-gray-200 rounded-lg flex items-center justify-center">
                                                    <FaBook className="text-4xl text-gray-400" />
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex-1">
                                            <div className="flex items-start justify-between mb-2">
                                                <div>
                                                    <Link
                                                        href={route('admin.publications.show', publication.id)}
                                                        className="text-lg font-bold text-blue-600 hover:text-blue-800 mb-1 block"
                                                    >
                                                        {publication.title}
                                                        {publication.issue_number ? (
                                                            <span className="text-gray-600">{t('adminPublicationsIndexPage.issueNumber', { number: publication.issue_number })}</span>
                                                        ) : null}
                                                    </Link>
                                                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                                                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">
                                                            {getTypeLabel(publication.type)}
                                                        </span>
                                                        {publication.created_at ? (
                                                            <div className="flex items-center gap-1">
                                                                <FaCalendar className="text-xs" />
                                                                {formatDate(publication.created_at)}
                                                            </div>
                                                        ) : null}
                                                        {publication.author ? (
                                                            <span className="text-gray-600">
                                                                {t('adminPublicationsIndexPage.authorLabel', { name: publication.author.name })}
                                                            </span>
                                                        ) : null}
                                                        {publication.school ? (
                                                            <span className="text-gray-600">
                                                                {t('adminPublicationsIndexPage.schoolLabel', { name: publication.school.name })}
                                                            </span>
                                                        ) : null}
                                                    </div>
                                                </div>
                                                {getStatusBadge(publication.status)}
                                            </div>

                                            {publication.description ? (
                                                <p className="text-gray-700 mb-4 line-clamp-2">
                                                    {publication.description}
                                                </p>
                                            ) : null}

                                            <div className="flex items-center gap-2">
                                                <Link
                                                    href={route('admin.publications.show', publication.id)}
                                                    className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50 transition"
                                                    title={t('common.viewDetails')}
                                                >
                                                    <FaEye />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(publication)}
                                                    className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50 transition"
                                                    title={t('common.delete')}
                                                >
                                                    <FaTrash />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <FaBook className="mx-auto text-6xl text-gray-300 mb-4" />
                        <p className="text-gray-500 text-lg">{t('adminPublicationsIndexPage.empty')}</p>
                    </div>
                )}

                {publications?.links?.length > 3 ? (
                    <div className="px-6 py-4 border-t border-gray-200">
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-700">
                                {t('adminPublicationsIndexPage.pagination.showing', {
                                    from: publications.from,
                                    to: publications.to,
                                    total: publications.total,
                                })}
                            </div>
                            <div className="flex gap-2">
                                {publications.links.map((link, index) => (
                                    <Link
                                        key={index}
                                        href={link.url || '#'}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium ${
                                            link.active
                                                ? 'bg-[#A3C042] text-white'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        } ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                ) : null}
            </div>
        </DashboardLayout>
    );
}
