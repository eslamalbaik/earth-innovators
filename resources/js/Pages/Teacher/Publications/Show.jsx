import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, router } from '@inertiajs/react';
import {
    FaArrowRight,
    FaTrash,
    FaSchool,
    FaDownload,
    FaEye,
    FaEdit,
} from 'react-icons/fa';
import { getPublicationFileUrl, getPublicationImageUrl } from '@/utils/imageUtils';
import { useConfirmDialog } from '@/Contexts/ConfirmContext';
import { useTranslation } from '@/i18n';
import AiDisclosureBadge from '@/Components/Innovation/AiDisclosureBadge';

const MONTH_KEYS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];

export default function TeacherPublicationShow({ publication }) {
    const { confirm } = useConfirmDialog();
    const { t, language } = useTranslation();
    const publicationTitle = language === 'ar'
        ? (publication.title_ar || publication.title)
        : (publication.title || publication.title_ar);
    const publicationDescription = language === 'ar'
        ? (publication.description_ar || publication.description)
        : (publication.description || publication.description_ar);
    const publicationContent = language === 'ar'
        ? (publication.content_ar || publication.content)
        : (publication.content || publication.content_ar);

    const handleDelete = async () => {
        const confirmed = await confirm({
            title: t('adminPublicationShowPage.confirm.delete.title'),
            message: t('adminPublicationShowPage.confirm.delete.message', { title: publicationTitle }),
            confirmText: t('adminPublicationShowPage.confirm.delete.confirmText'),
            cancelText: t('common.cancel'),
            variant: 'danger',
        });

        if (confirmed) {
            router.delete(route('teacher.publications.destroy', publication.id));
        }
    };

    const formatDate = (date) => {
        if (!date) return '';
        const d = new Date(date);
        return `${d.getDate()} ${t(`common.${MONTH_KEYS[d.getMonth()]}`)} ${d.getFullYear()}`;
    };

    const getStatusBadge = (status) => {
        const statusMap = {
            'approved': { bg: 'bg-green-100', text: 'text-green-800', label: t('adminPublicationShowPage.status.approved') },
            'pending': { bg: 'bg-yellow-100', text: 'text-yellow-800', label: t('adminPublicationShowPage.status.pending') },
            'rejected': { bg: 'bg-red-100', text: 'text-red-800', label: t('adminPublicationShowPage.status.rejected') },
        };
        const statusConfig = statusMap[status] || { bg: 'bg-gray-100', text: 'text-gray-800', label: status };
        return (
            <span className={`px-4 py-2 rounded-full text-sm font-semibold ${statusConfig.bg} ${statusConfig.text}`}>
                {statusConfig.label}
            </span>
        );
    };

    const getTypeLabel = (type) => {
        const labels = {
            magazine: t('teacherPublicationsPage.types.magazine'),
            booklet: t('teacherPublicationsPage.types.booklet'),
            report: t('teacherPublicationsPage.types.report'),
            article: t('teacherPublicationsPage.types.article'),
        };
        return labels[type] || type;
    };

    const coverImage = getPublicationImageUrl(publication.cover_image);
    const canEdit = publication.status !== 'approved';

    return (
        <DashboardLayout header={t('adminPublicationShowPage.headerTitle')}>
            <Head title={`${publicationTitle} - ${t('adminPublicationShowPage.headerTitle')}`} />

            <div className="mb-6">
                <Link
                    href={route('teacher.publications.index')}
                    className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
                >
                    <FaArrowRight className="transform rotate-180" />
                    {t('adminPublicationShowPage.backToList')}
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 mb-2">{publicationTitle}</h1>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                                        {getTypeLabel(publication.type)}
                                    </span>
                                    {publication.is_ai_generated && <AiDisclosureBadge />}
                                </div>
                            </div>
                            {getStatusBadge(publication.status)}
                        </div>

                        {coverImage && (
                            <div className="mb-6">
                                <img
                                    src={coverImage}
                                    alt={publicationTitle}
                                    className="w-full h-64 object-cover rounded-lg"
                                />
                            </div>
                        )}

                        {publicationDescription && (
                            <div className="mb-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-2">{t('adminPublicationShowPage.descriptionTitle')}</h2>
                                <p className="text-gray-700 whitespace-pre-wrap">{publicationDescription}</p>
                            </div>
                        )}

                        {publicationContent && (
                            <div className="mb-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-2">{t('adminPublicationShowPage.contentTitle')}</h2>
                                <div className="prose max-w-none">
                                    <div className="text-gray-700 whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: publicationContent }} />
                                </div>
                            </div>
                        )}

                        {publication.file && (
                            <div className="mt-6 pt-6 border-t border-gray-200">
                                <a
                                    href={getPublicationFileUrl(publication.file) || '#'}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#A3C042] hover:bg-blue-700 text-white rounded-lg transition"
                                >
                                    <FaDownload />
                                    {t('adminPublicationShowPage.downloadFile')}
                                </a>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">{t('adminPublicationShowPage.sidebar.infoTitle')}</h2>
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">{t('adminPublicationShowPage.sidebar.createdAt')}</p>
                                <p className="font-semibold text-gray-900">{formatDate(publication.created_at)}</p>
                            </div>
                            {publication.publish_date && (
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">{t('adminPublicationShowPage.sidebar.publishDate')}</p>
                                    <p className="font-semibold text-gray-900">{formatDate(publication.publish_date)}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {publication.school && (
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <FaSchool className="text-green-500" />
                                {t('adminPublicationShowPage.sidebar.schoolTitle')}
                            </h2>
                            <p className="font-semibold text-gray-900">{publication.school.name}</p>
                        </div>
                    )}

                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">{t('adminPublicationShowPage.actions.title')}</h2>
                        <div className="space-y-3">
                            {publication.status === 'approved' && (
                                <a
                                    href={route('publications.show', publication.id)}
                                    target="_blank"
                                    className="w-full bg-[#A3C042] hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center justify-center gap-2"
                                >
                                    <FaEye />
                                    {t('adminPublicationShowPage.actions.view')}
                                </a>
                            )}
                            {canEdit && (
                                <Link
                                    href={route('teacher.publications.edit', publication.id)}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center justify-center gap-2"
                                >
                                    <FaEdit />
                                    {t('adminPublicationShowPage.actions.edit')}
                                </Link>
                            )}
                            <button
                                onClick={handleDelete}
                                className="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center justify-center gap-2"
                            >
                                <FaTrash />
                                {t('adminPublicationShowPage.actions.delete')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
