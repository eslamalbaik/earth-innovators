import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import {
    FaArrowRight,
    FaCheckCircle,
    FaTimesCircle,
    FaTrash,
    FaUser,
    FaSchool,
    FaCalendar,
    FaBook,
    FaDownload,
    FaEye,
    FaEdit,
} from 'react-icons/fa';
import { getPublicationFileUrl, getPublicationImageUrl } from '@/utils/imageUtils';
import { useConfirmDialog } from '@/Contexts/ConfirmContext';
import { useTranslation } from '@/i18n';

const MONTH_KEYS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];

export default function AdminPublicationShow({ publication }) {
    const { confirm } = useConfirmDialog();
    const { t } = useTranslation();
    const publicationTitle = publication.title_ar || publication.title;
    const [showRejectModal, setShowRejectModal] = useState(false);
    const { data, setData, post: submitReject, processing: rejecting, errors: rejectErrors } = useForm({
        reason: '',
    });

    const handleApprove = async () => {
        const confirmed = await confirm({
            title: t('adminPublicationShowPage.confirm.approve.title'),
            message: t('adminPublicationShowPage.confirm.approve.message', { title: publicationTitle }),
            confirmText: t('adminPublicationShowPage.confirm.approve.confirmText'),
            cancelText: t('common.cancel'),
            variant: 'info',
        });

        if (confirmed) {
            router.post(route('admin.publications.approve', publication.id), {}, {
                preserveScroll: true,
                onSuccess: () => {
                    router.reload();
                },
            });
        }
    };

    const handleReject = (e) => {
        e.preventDefault();
        router.post(route('admin.publications.reject', publication.id), data, {
            preserveScroll: true,
            onSuccess: () => {
                setShowRejectModal(false);
                router.reload();
            },
        });
    };

    const handleDelete = async () => {
        const confirmed = await confirm({
            title: t('adminPublicationShowPage.confirm.delete.title'),
            message: t('adminPublicationShowPage.confirm.delete.message', { title: publicationTitle }),
            confirmText: t('adminPublicationShowPage.confirm.delete.confirmText'),
            cancelText: t('common.cancel'),
            variant: 'danger',
        });

        if (confirmed) {
            router.delete(route('admin.publications.destroy', publication.id));
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

    return (
        <DashboardLayout header={t('adminPublicationShowPage.headerTitle')}>
            <Head title={`${publicationTitle} - ${t('adminPublicationShowPage.headerTitle')}`} />

            <div className="mb-6">
                <Link
                    href={route('admin.publications.index')}
                    className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
                >
                    <FaArrowRight className="transform rotate-180" />
                    {t('adminPublicationShowPage.backToList')}
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Publication Info */}
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 mb-2">{publicationTitle}</h1>
                                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                                    {getTypeLabel(publication.type)}
                                </span>
                            </div>
                            {getStatusBadge(publication.status)}
                        </div>

                        {/* Cover Image */}
                        {coverImage && (
                            <div className="mb-6">
                                <img
                                    src={coverImage}
                                    alt={publicationTitle}
                                    className="w-full h-64 object-cover rounded-lg"
                                />
                            </div>
                        )}

                        {publication.description && (
                            <div className="mb-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-2">{t('adminPublicationShowPage.descriptionTitle')}</h2>
                                <p className="text-gray-700 whitespace-pre-wrap">{publication.description}</p>
                            </div>
                        )}

                        {publication.content && (
                            <div className="mb-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-2">{t('adminPublicationShowPage.contentTitle')}</h2>
                                <div className="prose max-w-none">
                                    <div className="text-gray-700 whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: publication.content }} />
                                </div>
                            </div>
                        )}

                        {/* File Download */}
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
                    {/* Publication Details */}
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">{t('adminPublicationShowPage.sidebar.infoTitle')}</h2>

                        <div className="space-y-4">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">{t('adminPublicationShowPage.sidebar.createdAt')}</p>
                                <p className="font-semibold text-gray-900">{formatDate(publication.created_at)}</p>
                            </div>
                            {publication.approved_at && (
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">{t('adminPublicationShowPage.sidebar.approvedAt')}</p>
                                    <p className="font-semibold text-gray-900">{formatDate(publication.approved_at)}</p>
                                </div>
                            )}
                            {publication.issue_number && (
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">{t('adminPublicationShowPage.sidebar.issueNumber')}</p>
                                    <p className="font-semibold text-gray-900">{publication.issue_number}</p>
                                </div>
                            )}
                            {publication.publish_date && (
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">{t('adminPublicationShowPage.sidebar.publishDate')}</p>
                                    <p className="font-semibold text-gray-900">{formatDate(publication.publish_date)}</p>
                                </div>
                            )}
                            {publication.publisher_name && (
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">{t('adminPublicationShowPage.sidebar.publisherName')}</p>
                                    <p className="font-semibold text-gray-900">{publication.publisher_name}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Author Info */}
                    {publication.author && (
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <FaUser className="text-blue-500" />
                                {t('adminPublicationShowPage.sidebar.authorInfoTitle')}
                            </h2>
                            <div className="space-y-2">
                                <p className="font-semibold text-gray-900">{publication.author.name}</p>
                                {publication.author.email && (
                                    <p className="text-sm text-gray-600">{publication.author.email}</p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* School Info */}
                    {publication.school && (
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <FaSchool className="text-green-500" />
                                {t('adminPublicationShowPage.sidebar.schoolTitle')}
                            </h2>
                            <p className="font-semibold text-gray-900">{publication.school.name}</p>
                        </div>
                    )}

                    {/* Approver Info */}
                    {publication.approver && (
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <FaCheckCircle className="text-green-500" />
                                {t('adminPublicationShowPage.sidebar.approverTitle')}
                            </h2>
                            <p className="font-semibold text-gray-900">{publication.approver.name}</p>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">{t('adminPublicationShowPage.actions.title')}</h2>
                        <div className="space-y-3">
                            {publication.status === 'pending' && (
                                <>
                                    <button
                                        onClick={handleApprove}
                                        className="w-full bg-[#A3C042] hover:bg-[#8CA635] text-white font-semibold py-2 px-4 rounded-lg flex items-center justify-center gap-2"
                                    >
                                        <FaCheckCircle />
                                        {t('adminPublicationShowPage.actions.approve')}
                                    </button>
                                    <button
                                        onClick={() => setShowRejectModal(true)}
                                        className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center justify-center gap-2"
                                    >
                                        <FaTimesCircle />
                                        {t('adminPublicationShowPage.actions.reject')}
                                    </button>
                                </>
                            )}
                            <a
                                href={route('publications.show', publication.id)}
                                target="_blank"
                                className="w-full bg-[#A3C042] hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center justify-center gap-2"
                            >
                                <FaEye />
                                {t('adminPublicationShowPage.actions.view')}
                            </a>
                            <Link
                                href={route('admin.publications.edit', publication.id)}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center justify-center gap-2"
                            >
                                <FaEdit />
                                {t('adminPublicationShowPage.actions.edit')}
                            </Link>
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

            {/* Reject Modal */}
            {showRejectModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">{t('adminPublicationShowPage.rejectModal.title')}</h3>
                        <form onSubmit={handleReject}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {t('adminPublicationShowPage.rejectModal.reasonLabel')}
                                </label>
                                <textarea
                                    value={data.reason}
                                    onChange={(e) => setData('reason', e.target.value)}
                                    rows="4"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                    placeholder={t('adminPublicationShowPage.rejectModal.reasonPlaceholder')}
                                />
                                {rejectErrors.reason && (
                                    <p className="mt-1 text-sm text-red-600">{rejectErrors.reason}</p>
                                )}
                            </div>
                            <div className="flex items-center gap-4">
                                <button
                                    type="submit"
                                    disabled={rejecting}
                                    className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg disabled:opacity-50"
                                >
                                    {rejecting ? t('adminPublicationShowPage.rejectModal.rejecting') : t('adminPublicationShowPage.rejectModal.rejectButton')}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowRejectModal(false)}
                                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg"
                                >
                                    {t('common.cancel')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
