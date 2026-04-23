import DashboardLayout from '@/Layouts/DashboardLayout';
import { useTranslation } from '@/i18n';
import { Head, Link, router } from '@inertiajs/react';
import { FaBook, FaPlus, FaCalendar, FaEye, FaEdit, FaTrash } from 'react-icons/fa';
import { useState } from 'react';
import { getPublicationImageUrl } from '@/utils/imageUtils';
import { toHijriDate } from '@/utils/dateUtils';
import { useConfirmDialog } from '@/Contexts/ConfirmContext';

const publicationTypeKeys = {
    magazine: 'magazine',
    booklet: 'booklet',
    report: 'report',
    article: 'article',
    study: 'study',
    news: 'news',
    other: 'other',
};

export default function SchoolPublicationsIndex({ auth, publications, stats, filters }) {
    const { t, language } = useTranslation();
    const { confirm } = useConfirmDialog();
    const [processing, setProcessing] = useState(null);
    const [selectedStatus, setSelectedStatus] = useState(filters?.status || '');
    const [activeTab, setActiveTab] = useState('all');

    const handleStatusFilter = (status) => {
        setSelectedStatus(status);
        router.get('/school/publications', {
            status: status || undefined,
        }, {
            preserveState: true,
        });
    };

    const handleDelete = async (publicationId, publicationTitle) => {
        const confirmed = await confirm({
            title: t('schoolPublicationsPage.deleteConfirm.title'),
            message: t('schoolPublicationsPage.deleteConfirm.message', { title: publicationTitle }),
            confirmText: t('schoolPublicationsPage.deleteConfirm.confirmText'),
            cancelText: t('common.cancel'),
            variant: 'danger',
        });

        if (confirmed) {
            setProcessing(publicationId);
            router.delete(`/school/publications/${publicationId}`, {
                preserveScroll: true,
                onFinish: () => setProcessing(null),
            });
        }
    };

    const getPublicationTitle = (publication) => (
        language === 'ar'
            ? (publication.title_ar || publication.title)
            : (publication.title || publication.title_ar)
    );

    const getPublicationDescription = (publication) => (
        language === 'ar'
            ? (publication.description_ar || publication.description)
            : (publication.description || publication.description_ar)
    );

    const getTypeLabel = (type) => {
        const key = publicationTypeKeys[type];
        return key ? t(`schoolPublicationsPage.types.${key}`) : type;
    };

    const getStatusBadge = (status) => {
        const badges = {
            pending: {
                bg: 'bg-yellow-100',
                text: 'text-yellow-800',
                label: t('schoolPublicationsPage.filters.pending'),
            },
            approved: {
                bg: 'bg-green-100',
                text: 'text-green-800',
                label: t('schoolPublicationsPage.filters.approved'),
            },
            rejected: {
                bg: 'bg-red-100',
                text: 'text-red-800',
                label: t('schoolPublicationsPage.stats.rejected'),
            },
        };
        const badge = badges[status] || badges.pending;

        return (
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${badge.bg} ${badge.text}`}>
                {badge.label}
            </span>
        );
    };

    const pageTitle = t('schoolPublicationsPage.pageTitle', {
        appName: t('common.appName'),
    });

    return (
        <DashboardLayout auth={auth} header={t('schoolPublicationsPage.title')}>
            <Head title={pageTitle} />

            <div className="py-6">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-white rounded-lg shadow p-4">
                            <div className="text-gray-600 text-sm mb-1">{t('schoolPublicationsPage.stats.total')}</div>
                            <div className="text-2xl font-bold text-gray-900">{stats?.total || 0}</div>
                        </div>
                        <div className="bg-white rounded-lg shadow p-4">
                            <div className="text-gray-600 text-sm mb-1">{t('schoolPublicationsPage.stats.pending')}</div>
                            <div className="text-2xl font-bold text-yellow-600">{stats?.pending || 0}</div>
                        </div>
                        <div className="bg-white rounded-lg shadow p-4">
                            <div className="text-gray-600 text-sm mb-1">{t('schoolPublicationsPage.stats.approved')}</div>
                            <div className="text-2xl font-bold text-green-600">{stats?.approved || 0}</div>
                        </div>
                        <div className="bg-white rounded-lg shadow p-4">
                            <div className="text-gray-600 text-sm mb-1">{t('schoolPublicationsPage.stats.rejected')}</div>
                            <div className="text-2xl font-bold text-red-600">{stats?.rejected || 0}</div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow mb-6 p-4">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                            <div className="flex gap-2">
                                <Link
                                    href={route('school.publications.pending')}
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200 transition shadow-sm"
                                >
                                    <FaBook />
                                    {language === 'ar' ? 'المعلّق للمراجعة' : 'Pending review'}
                                </Link>
                                <Link
                                    href="/school/publications/create"
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-[#A3C042] text-white rounded-lg hover:opacity-90 transition shadow-sm"
                                >
                                    <FaPlus />
                                    {t('schoolPublicationsPage.actions.create')}
                                </Link>
                            </div>

                            <div className="flex gap-2 bg-gray-50 p-1.5 rounded-xl border border-gray-100 overflow-x-auto no-scrollbar max-w-full">
                                <button
                                    onClick={() => handleStatusFilter('')}
                                    className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${!selectedStatus
                                        ? 'bg-white text-gray-900 shadow-sm'
                                        : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    {t('schoolPublicationsPage.filters.all')}
                                </button>
                                <button
                                    onClick={() => handleStatusFilter('pending')}
                                    className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${selectedStatus === 'pending'
                                        ? 'bg-yellow-100 text-yellow-700 shadow-sm'
                                        : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    {t('schoolPublicationsPage.filters.pending')}
                                </button>
                                <button
                                    onClick={() => handleStatusFilter('approved')}
                                    className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${selectedStatus === 'approved'
                                        ? 'bg-green-100 text-green-700 shadow-sm'
                                        : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    {t('schoolPublicationsPage.filters.approved')}
                                </button>
                                <button
                                    onClick={() => handleStatusFilter('rejected')}
                                    className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${selectedStatus === 'rejected'
                                        ? 'bg-red-100 text-red-700 shadow-sm'
                                        : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    {t('schoolPublicationsPage.stats.rejected')}
                                </button>
                            </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-2 overflow-x-auto no-scrollbar">
                            {[
                                { id: 'all', label: t('common.all') },
                                { id: 'magazine', label: t('schoolPublicationsPage.types.magazine') },
                                { id: 'booklet', label: t('schoolPublicationsPage.types.booklet') },
                                { id: 'report', label: t('schoolPublicationsPage.types.report') },
                                { id: 'article', label: t('schoolPublicationsPage.types.article') },
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${
                                        activeTab === tab.id
                                            ? 'bg-[#A3C042]/10 text-[#A3C042] border border-[#A3C042]/20'
                                            : 'text-gray-500 hover:text-gray-700'
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow">
                        {publications.data && publications.data.length > 0 ? (
                            <div className="divide-y divide-gray-200">
                                {publications.data
                                    .filter(p => activeTab === 'all' || p.type === activeTab)
                                    .map((publication) => {
                                    const coverImage = getPublicationImageUrl(publication.cover_image);
                                    const title = getPublicationTitle(publication);
                                    const description = getPublicationDescription(publication);

                                    return (
                                        <div key={publication.id} className="p-6 hover:bg-gray-50 transition">
                                            <div className="flex flex-col md:flex-row gap-6">
                                                <div className="md:w-32 flex-shrink-0">
                                                    <img
                                                        src={coverImage}
                                                        alt={title}
                                                        className="w-full h-32 object-cover rounded-lg"
                                                    />
                                                </div>

                                                <div className="flex-1">
                                                    <div className="flex items-start justify-between mb-2">
                                                        <div>
                                                            <h3 className="text-lg font-bold text-gray-900 mb-1">
                                                                {title}
                                                                {publication.issue_number && (
                                                                    <span className="text-gray-600">
                                                                        {' '}
                                                                        - {t('schoolPublicationsPage.issueNumber', {
                                                                            number: publication.issue_number,
                                                                        })}
                                                                    </span>
                                                                )}
                                                            </h3>
                                                            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                                                                <span className="px-2 py-1 bg-[#A3C042]/10 text-[#A3C042] rounded">
                                                                    {getTypeLabel(publication.type)}
                                                                </span>
                                                                {publication.created_at && (
                                                                    <div className="flex items-center gap-1">
                                                                        <FaCalendar className="text-xs" />
                                                                        {toHijriDate(publication.created_at, false, language)}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                        {getStatusBadge(publication.status)}
                                                    </div>

                                                    {description && (
                                                        <p className="text-gray-700 mb-4 line-clamp-2">
                                                            {description}
                                                        </p>
                                                    )}

                                                    <div className="flex items-center gap-2">
                                                        <Link
                                                            href={`/publications/${publication.id}`}
                                                            target="_blank"
                                                            className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition text-sm"
                                                        >
                                                            <FaEye />
                                                            {t('schoolPublicationsPage.actions.view')}
                                                        </Link>
                                                        {publication.author_id === auth.user.id && (
                                                            <Link
                                                                href={`/school/publications/${publication.id}/edit`}
                                                                className="inline-flex items-center gap-2 px-3 py-1.5 bg-legacy-blue/10 text-legacy-blue rounded hover:bg-legacy-blue/20 transition text-sm"
                                                            >
                                                                <FaEdit />
                                                                {t('schoolPublicationsPage.actions.edit')}
                                                            </Link>
                                                        )}
                                                        {publication.author_id === auth.user.id && (
                                                            <button
                                                                onClick={() => handleDelete(publication.id, title)}
                                                                disabled={processing === publication.id}
                                                                className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-100 text-red-600 rounded hover:bg-red-200 transition text-sm disabled:opacity-50"
                                                            >
                                                                <FaTrash />
                                                                {t('schoolPublicationsPage.actions.delete')}
                                                            </button>
                                                        )}
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
                                <p className="text-gray-500 text-lg mb-4">{t('schoolPublicationsPage.empty')}</p>
                                <Link
                                    href="/school/publications/create"
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-[#A3C042] text-white rounded-lg hover:opacity-90 transition"
                                >
                                    <FaPlus />
                                    {t('schoolPublicationsPage.actions.create')}
                                </Link>
                            </div>
                        )}

                        {publications.links && publications.links.length > 3 && (
                            <div className="p-6 border-t border-gray-200 flex justify-center">
                                <div className="flex gap-2">
                                    {publications.links.map((link, index) => (
                                        <Link
                                            key={index}
                                            href={link.url || '#'}
                                            className={`px-4 py-2 rounded-lg ${link.active
                                                ? 'bg-[#A3C042] text-white'
                                                : 'bg-white text-gray-700 hover:bg-gray-100'
                                                } ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
