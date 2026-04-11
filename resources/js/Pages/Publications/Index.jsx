import { Head, Link, router } from '@inertiajs/react';
import MobileAppLayout from '../../Layouts/MobileAppLayout';
import MobileTopBar from '@/Components/Mobile/MobileTopBar';
import MobileBottomNav from '@/Components/Mobile/MobileBottomNav';
import DesktopFooter from '@/Components/Mobile/DesktopFooter';
import { FaBook, FaFileAlt, FaCalendar, FaBuilding, FaHeart, FaSearch, FaDownload, FaNewspaper } from 'react-icons/fa';
import { useState } from 'react';
import axios from 'axios';
import { getPublicationImageUrl } from '../../utils/imageUtils';
import { useTranslation } from '@/i18n';

export default function PublicationsIndex({ auth, publications, filters }) {
    const { t, language } = useTranslation();
    const [searchTerm, setSearchTerm] = useState(filters?.search || '');
    const [selectedType, setSelectedType] = useState(filters?.type || '');
    const [likedPublications, setLikedPublications] = useState(new Set());

    const getLocalizedField = (publication, field) => {
        if (!publication) {
            return '';
        }

        const arabicValue = publication[`${field}_ar`];
        const defaultValue = publication[field];

        return language === 'ar'
            ? (arabicValue || defaultValue || '')
            : (defaultValue || arabicValue || '');
    };

    const handleSearch = () => {
        router.get('/publications', {
            search: searchTerm || undefined,
            type: selectedType || undefined,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const toggleLike = async (publication) => {
        if (!auth?.user) {
            router.visit('/login');
            return;
        }

        try {
            const response = await axios.post(`/publications/${publication.id}/like`);

            if (response.data.success) {
                if (response.data.liked) {
                    setLikedPublications((prev) => new Set(prev).add(publication.id));
                } else {
                    setLikedPublications((prev) => {
                        const next = new Set(prev);
                        next.delete(publication.id);
                        return next;
                    });
                }

                publication.likes_count = response.data.likes_count;
            }
        } catch (error) {
            // Keep the current UI state when the request fails.
        }
    };

    const getTypeLabel = (type) => {
        const labels = {
            magazine: t('sections.publications.types.magazine'),
            booklet: t('sections.publications.types.booklet'),
            report: t('sections.publications.types.report'),
            article: t('publicationsPage.types.article'),
        };

        return labels[type] || type;
    };

    const getTypeIcon = (type) => {
        if (type === 'magazine') return FaNewspaper;
        if (type === 'booklet') return FaBook;
        return FaFileAlt;
    };

    const formatDate = (date) => {
        if (!date) {
            return '';
        }

        const parsedDate = new Date(date);
        const months = [
            t('common.months.january'),
            t('common.months.february'),
            t('common.months.march'),
            t('common.months.april'),
            t('common.months.may'),
            t('common.months.june'),
            t('common.months.july'),
            t('common.months.august'),
            t('common.months.september'),
            t('common.months.october'),
            t('common.months.november'),
            t('common.months.december'),
        ];

        return `${parsedDate.getDate()} ${months[parsedDate.getMonth()]} ${parsedDate.getFullYear()}`;
    };

    const magazines = publications.data?.filter((publication) => publication.type === 'magazine') || [];
    const booklets = publications.data?.filter((publication) => publication.type === 'booklet') || [];
    const reports = publications.data?.filter((publication) => publication.type === 'report') || [];
    const articles = publications.data?.filter((publication) => publication.type === 'article') || [];

    const renderPublicationCard = (publication) => {
        const TypeIcon = getTypeIcon(publication.type);
        const isLiked = publication.is_liked || likedPublications.has(publication.id);
        const publicationTitle = getLocalizedField(publication, 'title');
        const publicationDescription = getLocalizedField(publication, 'description');
        const hasReadableContent = Boolean(getLocalizedField(publication, 'content'));
        const coverImage = getPublicationImageUrl(publication.cover_image);

        const getBadgeColor = (type) => {
            if (type === 'magazine') return 'bg-blue-50 border-blue-200 text-blue-800';
            if (type === 'booklet') return 'bg-amber-50 border-amber-200 text-amber-800';
            if (type === 'article') return 'bg-green-50 border-green-200 text-green-800';
            return 'bg-gray-50 border-gray-200 text-gray-800';
        };

        return (
            <div key={publication.id} className="overflow-hidden rounded-2xl border border-gray-100 bg-white transition hover:shadow-md">
                <div className="relative">
                    <img
                        src={coverImage}
                        alt={publicationTitle || t('publicationsPage.sections.articleTitle')}
                        className="h-64 w-full object-cover"
                        onError={(event) => {
                            event.target.src = '/images/default-publication.jpg';
                        }}
                        loading="lazy"
                    />
                    <div className="absolute top-3 right-3 rounded-full bg-red-500 px-3 py-1 text-xs font-semibold text-white">
                        {t('common.new')}
                    </div>
                    <div className={`absolute top-3 left-3 flex items-center gap-2 rounded-lg border px-3 py-1 text-xs font-semibold ${getBadgeColor(publication.type)}`}>
                        <TypeIcon className="text-xs" />
                        {getTypeLabel(publication.type)}
                    </div>
                </div>

                <div className="p-4">
                    <h3 className="mb-2 line-clamp-2 text-base font-bold text-gray-900">
                        {publicationTitle}
                        {publication.issue_number && (
                            <span className="text-gray-600">
                                {' '}
                                - {t('publicationsPage.issueLabel', { number: publication.issue_number })}
                            </span>
                        )}
                    </h3>

                    <div className="mb-2 flex flex-wrap items-center gap-2 text-xs text-gray-600">
                        {publication.publish_date && (
                            <div className="flex items-center gap-1">
                                <FaCalendar className="text-[10px]" />
                                {formatDate(publication.publish_date)}
                            </div>
                        )}
                        {(publication.publisher_name || publication.school?.name) && (
                            <div className="flex items-center gap-1">
                                <FaBuilding className="text-[10px]" />
                                <span className="line-clamp-1">{publication.publisher_name || publication.school?.name}</span>
                            </div>
                        )}
                    </div>

                    {publicationDescription && (
                        <p className="mb-3 line-clamp-2 text-xs leading-relaxed text-gray-700">
                            {publicationDescription}
                        </p>
                    )}

                    <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                            {publication.file && (
                                <a
                                    href={publication.file.startsWith('http') || publication.file.startsWith('/storage/') || publication.file.startsWith('/images/')
                                        ? publication.file
                                        : `/storage/${publication.file}`}
                                    download
                                    className="flex items-center gap-1 rounded-xl border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-600 transition hover:bg-blue-100"
                                >
                                    <FaDownload className="text-xs" />
                                    <span>{t('common.download')}</span>
                                </a>
                            )}
                            {hasReadableContent && (
                                <Link
                                    href={`/publications/${publication.id}`}
                                    className="flex items-center gap-1 rounded-xl border border-[#A3C042]/20 bg-[#A3C042]/10 px-3 py-1.5 text-xs font-semibold text-[#A3C042] transition hover:bg-[#A3C042]/20"
                                >
                                    <FaBook className="text-xs" />
                                    <span>{t('common.read')}</span>
                                </Link>
                            )}
                        </div>
                        <button
                            type="button"
                            onClick={() => toggleLike(publication)}
                            className={`flex items-center gap-1 rounded-xl px-2 py-1.5 text-xs transition ${
                                isLiked
                                    ? 'bg-red-100 text-red-600 hover:bg-red-200'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                            title={isLiked ? t('publicationsPage.unlike') : t('publicationsPage.like')}
                        >
                            <FaHeart className={isLiked ? 'fill-current' : ''} />
                            <span>{publication.likes_count || 0}</span>
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const PublicationsContent = () => (
        <div className="space-y-4">
            <div className="space-y-3 rounded-2xl border border-gray-100 bg-white p-4">
                <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(event) => setSearchTerm(event.target.value)}
                            onKeyDown={(event) => event.key === 'Enter' && handleSearch()}
                            placeholder={t('publicationsPage.searchPlaceholder')}
                            className="h-10 w-full rounded-xl border border-gray-200 bg-gray-50 ps-10 pe-4 text-sm focus:border-[#A3C042] focus:outline-none focus:ring-2 focus:ring-[#A3C042]/30"
                        />
                        <FaSearch className="absolute right-3 top-1/2 -translate-y-1/2 transform text-sm text-gray-400" />
                    </div>
                    <select
                        value={selectedType}
                        onChange={(event) => setSelectedType(event.target.value)}
                        className="h-10 rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm focus:border-[#A3C042] focus:outline-none focus:ring-2 focus:ring-[#A3C042]/30"
                    >
                        <option value="">{t('publicationsPage.allTypes')}</option>
                        <option value="magazine">{t('sections.publications.types.magazine')}</option>
                        <option value="booklet">{t('sections.publications.types.booklet')}</option>
                        <option value="report">{t('sections.publications.types.report')}</option>
                        <option value="article">{t('publicationsPage.types.article')}</option>
                    </select>
                    <button
                        type="button"
                        onClick={handleSearch}
                        className="h-10 rounded-xl bg-[#A3C042] px-4 text-sm font-bold text-white transition hover:bg-[#8CA635]"
                    >
                        {t('common.search')}
                    </button>
                </div>
            </div>

            <div>
                {publications.data && publications.data.length > 0 ? (
                    <>
                        {magazines.length > 0 && (
                            <div className="mb-6">
                                <div className="mb-4 flex items-center gap-2">
                                    <FaNewspaper className="text-lg text-gray-700" />
                                    <h2 className="text-lg font-bold text-gray-900">{t('publicationsPage.sections.magazineTitle')}</h2>
                                </div>
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                                    {magazines.map(renderPublicationCard)}
                                </div>
                            </div>
                        )}

                        {booklets.length > 0 && (
                            <div className="mb-6">
                                <div className="mb-4 flex items-center gap-2">
                                    <FaBook className="text-lg text-gray-700" />
                                    <h2 className="text-lg font-bold text-gray-900">{t('publicationsPage.sections.bookletTitle')}</h2>
                                </div>
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                                    {booklets.map(renderPublicationCard)}
                                </div>
                            </div>
                        )}

                        {reports.length > 0 && (
                            <div className="mb-6">
                                <div className="mb-4 flex items-center gap-2">
                                    <FaFileAlt className="text-lg text-gray-700" />
                                    <h2 className="text-lg font-bold text-gray-900">{t('publicationsPage.sections.reportTitle')}</h2>
                                </div>
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                                    {reports.map(renderPublicationCard)}
                                </div>
                            </div>
                        )}

                        {articles.length > 0 && (
                            <div className="mb-6">
                                <div className="mb-4 flex items-center gap-2">
                                    <FaFileAlt className="text-lg text-gray-700" />
                                    <h2 className="text-lg font-bold text-gray-900">{t('publicationsPage.sections.articleTitle')}</h2>
                                </div>
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                                    {articles.map(renderPublicationCard)}
                                </div>
                            </div>
                        )}

                        {magazines.length === 0 && booklets.length === 0 && reports.length === 0 && articles.length === 0 && (
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                                {publications.data.map(renderPublicationCard)}
                            </div>
                        )}
                    </>
                ) : (
                    <div className="rounded-2xl border border-gray-100 bg-white p-12 text-center">
                        <p className="text-sm text-gray-500">{t('publicationsPage.empty')}</p>
                    </div>
                )}

                {publications.links && publications.links.length > 3 && (
                    <div className="rounded-2xl border border-gray-100 bg-white p-3">
                        <div className="flex flex-wrap justify-center gap-2">
                            {publications.links.map((link, index) => (
                                <button
                                    key={index}
                                    type="button"
                                    onClick={() => {
                                        if (!link.url) {
                                            return;
                                        }
                                        router.visit(link.url, {
                                            preserveScroll: true,
                                            preserveState: true,
                                        });
                                    }}
                                    className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${
                                        link.active
                                            ? 'bg-[#A3C042] text-white'
                                            : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                                    } ${!link.url ? 'cursor-not-allowed opacity-50' : ''}`}
                                    disabled={!link.url}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div dir={language === 'ar' ? 'rtl' : 'ltr'} className="min-h-screen bg-gray-50">
            <Head title={t('publicationsPage.pageTitle', { appName: t('common.appName') })} />

            <div className="block md:hidden">
                <MobileAppLayout
                    auth={auth}
                    title={t('sections.publications.title')}
                    activeNav="explore"
                    unreadCount={auth?.unreadCount || 0}
                    onNotifications={() => router.visit('/notifications')}
                    onBack={() => router.visit('/')}
                >
                    <PublicationsContent />
                </MobileAppLayout>
            </div>

            <div className="hidden md:block">
                <MobileTopBar
                    title={t('sections.publications.title')}
                    unreadCount={auth?.unreadCount || 0}
                    onNotifications={() => router.visit('/notifications')}
                    onBack={() => router.visit('/')}
                    reverseOrder={false}
                />
                <main className="mx-auto w-full max-w-6xl px-4 pb-24 pt-4">
                    <div className="mx-auto w-full max-w-4xl">
                        <PublicationsContent />
                    </div>
                </main>
                <MobileBottomNav active="explore" role={auth?.user?.role} isAuthed={!!auth?.user} user={auth?.user} />
                <DesktopFooter auth={auth} />
            </div>
        </div>
    );
}
