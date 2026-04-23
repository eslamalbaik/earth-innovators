import DashboardLayout from '@/Layouts/DashboardLayout';
import { useTranslation } from '@/i18n';
import { Head, Link, router } from '@inertiajs/react';
import { FaArrowLeft, FaArrowRight, FaBook, FaCalendar, FaCheck, FaTimes, FaUser } from 'react-icons/fa';
import { useState } from 'react';
import { getPublicationImageUrl } from '@/utils/imageUtils';
import { toHijriDate } from '@/utils/dateUtils';
import { useConfirmDialog } from '@/Contexts/ConfirmContext';

export default function SchoolPublicationsPending({ auth, publications }) {
    const { t, language } = useTranslation();
    const { confirm } = useConfirmDialog();
    const [processingId, setProcessingId] = useState(null);
    const BackIcon = language === 'ar' ? FaArrowRight : FaArrowLeft;
    const pendingTitle = language === 'ar' ? 'المقالات المعلقة للمراجعة' : 'Pending publications for review';
    const emptyText = language === 'ar' ? 'لا توجد مقالات معلقة للمراجعة حاليًا' : 'No pending publications for review right now';
    const approveText = language === 'ar' ? 'اعتماد' : 'Approve';
    const rejectText = language === 'ar' ? 'رفض' : 'Reject';
    const authorText = language === 'ar' ? 'الكاتب' : 'Author';

    const handleApprove = async (publication) => {
        const confirmed = await confirm({
            title: language === 'ar' ? 'اعتماد المقال' : 'Approve publication',
            message: language === 'ar'
                ? `هل تريد اعتماد "${publication.title}" ونشره الآن؟`
                : `Do you want to approve "${publication.title}" and publish it now?`,
            confirmText: approveText,
            cancelText: t('common.cancel'),
        });

        if (!confirmed) {
            return;
        }

        setProcessingId(publication.id);
        router.post(route('school.publications.approve', publication.id), {}, {
            preserveScroll: true,
            onFinish: () => setProcessingId(null),
        });
    };

    const handleReject = async (publication) => {
        const confirmed = await confirm({
            title: language === 'ar' ? 'رفض المقال' : 'Reject publication',
            message: language === 'ar'
                ? `هل تريد رفض "${publication.title}"؟`
                : `Do you want to reject "${publication.title}"?`,
            confirmText: rejectText,
            cancelText: t('common.cancel'),
            variant: 'danger',
        });

        if (!confirmed) {
            return;
        }

        setProcessingId(publication.id);
        router.post(route('school.publications.reject', publication.id), {}, {
            preserveScroll: true,
            onFinish: () => setProcessingId(null),
        });
    };

    return (
        <DashboardLayout auth={auth} header={pendingTitle}>
            <Head title={`${pendingTitle} - ${t('common.appName')}`} />

            <div className="py-6">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="mb-6 flex items-center justify-between gap-4">
                        <Link
                            href={route('school.publications.index')}
                            className="inline-flex items-center gap-2 text-gray-600 transition hover:text-gray-900"
                        >
                            <BackIcon />
                            <span>{t('schoolPublicationsPage.backToList')}</span>
                        </Link>

                        <div className="rounded-xl bg-yellow-50 px-4 py-2 text-sm font-semibold text-yellow-800">
                            {(publications?.total || 0)} {language === 'ar' ? 'مقالة بانتظار المراجعة' : 'publication(s) awaiting review'}
                        </div>
                    </div>

                    <div className="rounded-xl bg-white shadow-sm">
                        {publications?.data?.length > 0 ? (
                            <div className="divide-y divide-gray-200">
                                {publications.data.map((publication) => {
                                    const title = language === 'ar'
                                        ? (publication.title_ar || publication.title)
                                        : (publication.title || publication.title_ar);
                                    const description = language === 'ar'
                                        ? (publication.description_ar || publication.description)
                                        : (publication.description || publication.description_ar);
                                    const coverImage = getPublicationImageUrl(publication.cover_image);
                                    const processing = processingId === publication.id;

                                    return (
                                        <div key={publication.id} className="p-6">
                                            <div className="flex flex-col gap-6 md:flex-row">
                                                <div className="w-full shrink-0 md:w-36">
                                                    <img
                                                        src={coverImage}
                                                        alt={title}
                                                        className="h-36 w-full rounded-xl object-cover"
                                                    />
                                                </div>

                                                <div className="flex-1">
                                                    <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                                                        <div>
                                                            <h2 className="text-lg font-bold text-gray-900">{title}</h2>
                                                            <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-gray-600">
                                                                <span className="rounded-full bg-yellow-100 px-3 py-1 font-semibold text-yellow-800">
                                                                    {t('schoolPublicationsPage.filters.pending')}
                                                                </span>
                                                                {publication.author?.name && (
                                                                    <span className="flex items-center gap-1">
                                                                        <FaUser className="text-xs" />
                                                                        {authorText}: {publication.author.name}
                                                                    </span>
                                                                )}
                                                                {publication.created_at && (
                                                                    <span className="flex items-center gap-1">
                                                                        <FaCalendar className="text-xs" />
                                                                        {toHijriDate(publication.created_at, false, language)}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {description && (
                                                        <p className="mb-4 line-clamp-3 text-sm text-gray-700">
                                                            {description}
                                                        </p>
                                                    )}

                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <Link
                                                            href={route('publications.show', publication.id)}
                                                            target="_blank"
                                                            className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-200"
                                                        >
                                                            {t('schoolPublicationsPage.actions.view')}
                                                        </Link>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleApprove(publication)}
                                                            disabled={processing}
                                                            className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700 disabled:opacity-50"
                                                        >
                                                            <FaCheck />
                                                            {approveText}
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleReject(publication)}
                                                            disabled={processing}
                                                            className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
                                                        >
                                                            <FaTimes />
                                                            {rejectText}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="py-16 text-center">
                                <FaBook className="mx-auto mb-4 text-6xl text-gray-300" />
                                <p className="text-lg text-gray-500">{emptyText}</p>
                            </div>
                        )}

                        {publications?.links && publications.links.length > 3 && (
                            <div className="flex justify-center gap-2 border-t border-gray-200 p-6">
                                {publications.links.map((link, index) => (
                                    <Link
                                        key={index}
                                        href={link.url || '#'}
                                        className={`rounded-lg px-4 py-2 text-sm ${
                                            link.active ? 'bg-[#A3C042] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        } ${!link.url ? 'cursor-not-allowed opacity-50' : ''}`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
