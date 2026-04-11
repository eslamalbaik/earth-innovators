import { Head, Link, router } from '@inertiajs/react';
import MobileAppLayout from '@/Layouts/MobileAppLayout';
import MobileTopBar from '@/Components/Mobile/MobileTopBar';
import MobileBottomNav from '@/Components/Mobile/MobileBottomNav';
import { FaBook, FaBuilding, FaCalendar, FaEye, FaFileAlt, FaHeart } from 'react-icons/fa';
import { useState } from 'react';
import axios from 'axios';
import { getPublicationFileUrl, getPublicationImageUrl } from '@/utils/imageUtils';
import { useTranslation } from '@/i18n';

const monthKeys = [
    'common.months.january',
    'common.months.february',
    'common.months.march',
    'common.months.april',
    'common.months.may',
    'common.months.june',
    'common.months.july',
    'common.months.august',
    'common.months.september',
    'common.months.october',
    'common.months.november',
    'common.months.december',
];

const stripDuplicateCoverImage = (html, coverImagePath) => {
    if (!html || !coverImagePath) {
        return html;
    }

    const coverFileName = coverImagePath.split('?')[0].split('/').pop();

    if (!coverFileName) {
        return html;
    }

    const escapedFileName = coverFileName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    return html.replace(
        new RegExp(`<img[^>]*src=["'][^"']*${escapedFileName}[^"']*["'][^>]*>`, 'i'),
        ''
    );
};

export default function PublicationShow({
    auth,
    publication,
    isLiked: initialIsLiked,
    relatedPublications = [],
}) {
    const { t, language } = useTranslation();
    const [isLiked, setIsLiked] = useState(initialIsLiked || false);
    const [likesCount, setLikesCount] = useState(publication?.likes_count || 0);

    const appName = t('common.appName');

    const getLocalizedField = (field) => {
        if (!publication) {
            return '';
        }

        const arabicValue = publication[`${field}_ar`];
        const defaultValue = publication[field];

        return language === 'ar'
            ? (arabicValue || defaultValue || '')
            : (defaultValue || arabicValue || '');
    };

    const coverImage = getPublicationImageUrl(publication?.cover_image);
    const publicationTitle = getLocalizedField('title');
    const publicationDescription = getLocalizedField('description');
    const publicationContent = stripDuplicateCoverImage(getLocalizedField('content'), coverImage);

    const getRelatedTitle = (item) => item?.title_ar || item?.title || '';
    const getRelatedDescription = (item) => item?.description_ar || item?.description || '';
    const getTypeLabel = (type) => {
        const labels = {
            magazine: t('sections.publications.types.magazine'),
            booklet: t('sections.publications.types.booklet'),
            report: t('sections.publications.types.report'),
            article: t('publicationsPage.types.article'),
        };

        return labels[type] || type;
    };

    const toggleLike = async () => {
        if (!auth?.user) {
            router.visit('/login');
            return;
        }

        try {
            const response = await axios.post(`/publications/${publication.id}/like`);

            if (response.data.success) {
                setIsLiked(response.data.liked);
                setLikesCount(response.data.likes_count);
            }
        } catch (error) {
            // Ignore request failures and keep the current UI state.
        }
    };

    const formatDate = (date) => {
        if (!date) {
            return '';
        }

        const currentDate = new Date(date);
        return `${t(monthKeys[currentDate.getMonth()])} ${currentDate.getFullYear()}`;
    };

    const pageTitle = publication
        ? t('publicationShowPage.pageTitle', {
            title: publicationTitle || appName,
            appName,
        })
        : t('publicationShowPage.missingPageTitle', { appName });

    const PublicationContent = () => {
        if (!publication) {
            return (
                <div className="rounded-2xl border border-gray-100 bg-white p-12 text-center">
                    <p className="text-sm text-gray-500">{t('publicationShowPage.missing')}</p>
                </div>
            );
        }

        return (
            <div className="space-y-4">
                {publication.cover_image && (
                    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white">
                        <img
                            src={coverImage}
                            alt={publicationTitle}
                            className="h-auto w-full"
                            onError={(event) => {
                                event.target.src = '/images/default-publication.jpg';
                            }}
                            loading="lazy"
                        />
                    </div>
                )}

                <div className="space-y-3 rounded-2xl border border-gray-100 bg-white p-4">
                    <h1 className="text-lg font-extrabold text-gray-900">
                        {publicationTitle}
                        {publication.issue_number && (
                            <span className="text-gray-600">
                                {' '}
                                - {t('publicationsPage.issueLabel', {
                                    number: publication.issue_number,
                                })}
                            </span>
                        )}
                    </h1>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600">
                        {publication.publish_date && (
                            <div className="flex items-center gap-1">
                                <FaCalendar className="text-[10px]" />
                                {formatDate(publication.publish_date)}
                            </div>
                        )}
                        {(publication.publisher_name || publication.school?.name) && (
                            <div className="flex items-center gap-1">
                                <FaBuilding className="text-[10px]" />
                                {publication.publisher_name || publication.school?.name}
                            </div>
                        )}
                        {publication.views !== undefined && (
                            <div className="flex items-center gap-1">
                                <FaEye className="text-[10px]" />
                                {publication.views}
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-2 border-t border-gray-100 pt-3">
                        {publication.file && (
                            <a
                                href={getPublicationFileUrl(publication.file) || '#'}
                                download
                                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#A3C042] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#8CA635]"
                            >
                                <FaFileAlt />
                                {t('publicationShowPage.downloadPdf')}
                            </a>
                        )}

                        <button
                            type="button"
                            onClick={toggleLike}
                            aria-label={isLiked ? t('publicationsPage.unlike') : t('publicationsPage.like')}
                            title={isLiked ? t('publicationsPage.unlike') : t('publicationsPage.like')}
                            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                                isLiked
                                    ? 'bg-red-100 text-red-600 hover:bg-red-200'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            <FaHeart className={isLiked ? 'fill-current' : ''} />
                            <span>({likesCount})</span>
                        </button>
                    </div>
                </div>

                {publicationDescription && (
                    <div className="rounded-2xl border border-gray-100 bg-white p-4">
                        <h2 className="mb-2 text-sm font-bold text-gray-900">
                            {t('publicationShowPage.descriptionTitle')}
                        </h2>
                        <p className="whitespace-pre-line text-sm leading-relaxed text-gray-700">
                            {publicationDescription}
                        </p>
                    </div>
                )}

                {publicationContent && (
                    <div className="rounded-2xl border border-gray-100 bg-white p-4">
                        <h2 className="mb-3 text-sm font-bold text-gray-900">
                            {t('publicationShowPage.contentTitle')}
                        </h2>
                        <div
                            className="prose prose-sm max-w-none leading-relaxed text-gray-700"
                            dangerouslySetInnerHTML={{ __html: publicationContent }}
                        />
                    </div>
                )}

                {relatedPublications.length > 0 && (
                    <div className="rounded-2xl border border-gray-100 bg-white p-4">
                        <div className="mb-4">
                            <h2 className="text-sm font-bold text-gray-900">
                                {t('publicationShowPage.relatedTitle')}
                            </h2>
                            <p className="mt-1 text-xs text-gray-500">
                                {t('publicationShowPage.relatedSubtitle')}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            {relatedPublications.map((item) => (
                                <Link
                                    key={item.id}
                                    href={`/publications/${item.id}`}
                                    className="overflow-hidden rounded-2xl border border-gray-100 bg-gray-50 transition hover:border-[#A3C042]/30 hover:bg-white"
                                >
                                    <div className="aspect-[4/3] overflow-hidden bg-gray-100">
                                        <img
                                            src={getPublicationImageUrl(item.cover_image) || '/images/default-publication.jpg'}
                                            alt={getRelatedTitle(item)}
                                            className="h-full w-full object-cover"
                                            loading="lazy"
                                        />
                                    </div>

                                    <div className="space-y-3 p-4">
                                        <div className="flex items-center gap-2 text-xs font-semibold text-[#A3C042]">
                                            <FaBook />
                                            <span>{getTypeLabel(item.type)}</span>
                                        </div>

                                        <h3 className="line-clamp-2 text-sm font-bold text-gray-900">
                                            {getRelatedTitle(item)}
                                        </h3>

                                        <p className="line-clamp-3 text-xs leading-6 text-gray-600">
                                            {getRelatedDescription(item) || t('publicationShowPage.noDescription')}
                                        </p>

                                        <div className="flex items-center justify-between text-xs text-gray-500">
                                            <span>{item.publisher_name || item.school?.name || t('common.appName')}</span>
                                            <span>{t('common.read')}</span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div dir={language === 'ar' ? 'rtl' : 'ltr'} className="min-h-screen bg-gray-50">
            <Head title={pageTitle} />

            <div className="block md:hidden">
                <MobileAppLayout
                    auth={auth}
                    title={appName}
                    activeNav="explore"
                    unreadCount={auth?.unreadCount || 0}
                    onNotifications={() => router.visit('/notifications')}
                    onBack={() => router.visit('/publications')}
                >
                    <PublicationContent />
                </MobileAppLayout>
            </div>

            <div className="hidden md:block">
                <MobileTopBar
                    title={appName}
                    unreadCount={auth?.unreadCount || 0}
                    onNotifications={() => router.visit('/notifications')}
                    onBack={() => router.visit('/publications')}
                    reverseOrder={false}
                />
                <main className="mx-auto w-full max-w-6xl px-4 pb-24 pt-4">
                    <div className="mx-auto w-full max-w-3xl">
                        <PublicationContent />
                    </div>
                </main>
                <MobileBottomNav active="explore" role={auth?.user?.role} isAuthed={!!auth?.user} user={auth?.user} />
            </div>
        </div>
    );
}
