import { Head, Link, router } from '@inertiajs/react';
import MobileAppLayout from '../../Layouts/MobileAppLayout';
import MobileTopBar from '@/Components/Mobile/MobileTopBar';
import MobileBottomNav from '@/Components/Mobile/MobileBottomNav';
import DesktopFooter from '@/Components/Mobile/DesktopFooter';
import { FaBook, FaFileAlt, FaHeart, FaSearch, FaDownload, FaNewspaper } from 'react-icons/fa';
import { useState } from 'react';
import axios from 'axios';
import { getPublicationFileUrl, getPublicationImageUrl, getPublicationTypeFallbackImage } from '../../utils/imageUtils';
import { useTranslation } from '@/i18n';

const TYPE_ACCENTS = {
    magazine: '#A3C042',
    booklet: '#8CA635',
    report: '#64748B',
    article: '#0E9F6E',
};

const STATUS_ACCENTS = {
    approved: '#15803D',
    pending: '#B45309',
    rejected: '#DC2626',
};

export default function PublicationsIndex({ auth, publications, filters, myPublications = [] }) {
    const { t, language } = useTranslation();
    const [searchTerm, setSearchTerm] = useState(filters?.search || '');
    const [likedPublications, setLikedPublications] = useState(new Set());
    const [activeTab, setActiveTab] = useState(filters?.type || 'all');

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
            type: activeTab !== 'all' ? activeTab : undefined,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const selectTab = (typeId) => {
        setActiveTab(typeId);
        router.get('/publications', {
            search: searchTerm || undefined,
            type: typeId !== 'all' ? typeId : undefined,
        }, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const goToPublicationsPage = (url) => {
        if (!url) {
            return;
        }

        // Avoid relying on backend-generated absolute pagination URLs (APP_URL/proxy/cache can break them).
        // Instead, extract `page` and re-request the current list with the same filters.
        try {
            const parsed = new URL(url, window.location.origin);
            const page = parsed.searchParams.get('page');

            router.get('/publications', {
                search: filters?.search || undefined,
                type: filters?.type || undefined,
                page: page ? Number(page) : undefined,
            }, {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            });
        } catch (e) {
            // Fallback: if URL parsing fails, let Inertia handle it as-is.
            router.visit(url, { preserveState: true, preserveScroll: true });
        }
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

    const TypeTag = ({ type }) => (
        <span
            className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest"
            style={{ color: TYPE_ACCENTS[type] || TYPE_ACCENTS.report }}
        >
            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: TYPE_ACCENTS[type] || TYPE_ACCENTS.report }} />
            {getTypeLabel(type)}
        </span>
    );

    const renderMyPublicationCard = (publication) => {
        const publicationTitle = getLocalizedField(publication, 'title');
        const typeFallbackImage = getPublicationTypeFallbackImage(publication.type);
        const coverImage = getPublicationImageUrl(publication.cover_image, typeFallbackImage);
        const statusLabel = t(`common.${publication.status}`) || publication.status;
        const statusColor = STATUS_ACCENTS[publication.status] || '#6B7280';
        const isApproved = publication.status === 'approved';

        const body = (
            <>
                <div className="aspect-[4/3] overflow-hidden rounded-2xl bg-gray-100">
                    <img
                        src={coverImage}
                        alt={publicationTitle}
                        className="h-full w-full object-cover"
                        onError={(event) => { event.target.src = typeFallbackImage; }}
                        loading="lazy"
                    />
                </div>
                <div className="mt-2">
                    <TypeTag type={publication.type} />
                    <h4 className="mt-1 line-clamp-2 text-sm font-bold leading-snug text-gray-900">
                        {publicationTitle}
                    </h4>
                    <span className="mt-1 inline-block text-[11px] font-bold" style={{ color: statusColor }}>
                        {statusLabel}
                    </span>
                </div>
            </>
        );

        return isApproved ? (
            <Link key={publication.id} href={`/publications/${publication.id}`} className="w-44 flex-shrink-0">
                {body}
            </Link>
        ) : (
            <div key={publication.id} className="w-44 flex-shrink-0">
                {body}
            </div>
        );
    };

    const CardActions = ({ publication, hasReadableContent }) => {
        const isLiked = publication.is_liked || likedPublications.has(publication.id);

        return (
            <div className="mt-3 flex flex-wrap items-center gap-4">
                {hasReadableContent && (
                    <Link
                        href={`/publications/${publication.id}`}
                        className="rounded-xl bg-gradient-to-r from-[#A3C042] to-[#8CA635] px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[#A3C042]/50 focus:ring-offset-1"
                    >
                        {t('common.read')}
                    </Link>
                )}
                {publication.file && (
                    <a
                        href={getPublicationFileUrl(publication.file) || '#'}
                        download
                        className="flex items-center gap-1.5 text-xs font-bold text-gray-500 transition-colors duration-200 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#A3C042]/50 focus:ring-offset-1"
                    >
                        <FaDownload className="text-xs" />
                        {t('common.download')}
                    </a>
                )}
                <button
                    type="button"
                    onClick={() => toggleLike(publication)}
                    aria-label={isLiked ? t('publicationsPage.unlike') : t('publicationsPage.like')}
                    aria-pressed={isLiked}
                    className={`ms-auto flex items-center gap-1.5 text-xs font-bold transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#A3C042]/50 focus:ring-offset-1 ${
                        isLiked ? 'text-red-600' : 'text-gray-500 hover:text-gray-900'
                    }`}
                >
                    <FaHeart className={isLiked ? 'fill-current' : ''} />
                    {publication.likes_count || 0}
                </button>
            </div>
        );
    };

    const renderLead = (publication) => {
        const publicationTitle = getLocalizedField(publication, 'title');
        const publicationDescription = getLocalizedField(publication, 'description');
        const hasReadableContent = Boolean(getLocalizedField(publication, 'content'));
        const typeFallbackImage = getPublicationTypeFallbackImage(publication.type);
        const coverImage = getPublicationImageUrl(publication.cover_image, typeFallbackImage);

        return (
            <div key={publication.id}>
                <Link href={`/publications/${publication.id}`} className="block">
                    <div className="aspect-[16/9] overflow-hidden rounded-2xl bg-gray-100">
                        <img
                            src={coverImage}
                            alt={publicationTitle}
                            className="h-full w-full object-cover"
                            onError={(event) => { event.target.src = typeFallbackImage; }}
                            loading="lazy"
                        />
                    </div>
                </Link>
                <div className="mt-4">
                    <TypeTag type={publication.type} />
                    <Link href={`/publications/${publication.id}`}>
                        <h2 className="mt-2 text-2xl md:text-3xl font-black leading-tight text-gray-900 transition-colors duration-200 hover:text-[#A3C042]">
                            {publicationTitle}
                        </h2>
                    </Link>
                    <div className="mt-2 text-xs font-medium text-gray-500">
                        {publication.publisher_name || publication.school?.name}
                        {publication.publish_date && ` · ${formatDate(publication.publish_date)}`}
                    </div>
                    {publicationDescription && (
                        <p className="mt-3 text-sm leading-relaxed text-gray-600 line-clamp-3">
                            {publicationDescription}
                        </p>
                    )}
                    <CardActions publication={publication} hasReadableContent={hasReadableContent} />
                </div>
            </div>
        );
    };

    const renderRailItem = (publication, number) => {
        const publicationTitle = getLocalizedField(publication, 'title');

        return (
            <div key={publication.id} className="flex gap-4 border-b border-gray-200 py-5 last:border-b-0">
                <span className="text-2xl font-black leading-none text-[#A3C042]/40">
                    {String(number).padStart(2, '0')}
                </span>
                <Link href={`/publications/${publication.id}`} className="min-w-0 flex-1">
                    <TypeTag type={publication.type} />
                    <h4 className="mt-1.5 line-clamp-2 text-base font-bold leading-snug text-gray-900 transition-colors duration-200 hover:text-[#A3C042]">
                        {publicationTitle}
                    </h4>
                    {publication.publish_date && (
                        <div className="mt-1 text-xs text-gray-500">{formatDate(publication.publish_date)}</div>
                    )}
                </Link>
            </div>
        );
    };

    const renderListRow = (publication) => {
        const isRecent = publication.publish_date
            && (Date.now() - new Date(publication.publish_date).getTime()) < 7 * 24 * 60 * 60 * 1000;
        const publicationTitle = getLocalizedField(publication, 'title');
        const publicationDescription = getLocalizedField(publication, 'description');
        const hasReadableContent = Boolean(getLocalizedField(publication, 'content'));
        const typeFallbackImage = getPublicationTypeFallbackImage(publication.type);
        const coverImage = getPublicationImageUrl(publication.cover_image, typeFallbackImage);

        return (
            <article key={publication.id} className="flex flex-col gap-5 border-b border-gray-200 py-6 sm:flex-row last:border-b-0">
                <Link href={`/publications/${publication.id}`} className="block flex-shrink-0 sm:w-48">
                    <div className="aspect-[4/3] overflow-hidden rounded-2xl bg-gray-100">
                        <img
                            src={coverImage}
                            alt={publicationTitle}
                            className="h-full w-full object-cover"
                            onError={(event) => { event.target.src = typeFallbackImage; }}
                            loading="lazy"
                        />
                    </div>
                </Link>
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3">
                        <TypeTag type={publication.type} />
                        {isRecent && (
                            <span className="text-[11px] font-bold uppercase tracking-widest text-[#A3C042]">
                                {t('common.new')}
                            </span>
                        )}
                    </div>
                    <Link href={`/publications/${publication.id}`}>
                        <h3 className="mt-1.5 line-clamp-2 text-xl font-black leading-snug text-gray-900 transition-colors duration-200 hover:text-[#A3C042]">
                            {publicationTitle}
                            {publication.issue_number && (
                                <span className="block text-sm font-semibold text-gray-500 mt-0.5">
                                    {t('publicationsPage.issueLabel', { number: publication.issue_number })}
                                </span>
                            )}
                        </h3>
                    </Link>
                    <div className="mt-1.5 text-xs font-medium text-gray-500">
                        {publication.publisher_name || publication.school?.name}
                        {publication.publish_date && ` · ${formatDate(publication.publish_date)}`}
                    </div>
                    {publicationDescription && (
                        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-gray-600">
                            {publicationDescription}
                        </p>
                    )}
                    <CardActions publication={publication} hasReadableContent={hasReadableContent} />
                </div>
            </article>
        );
    };

    // Server already filters by search + type (see selectTab/handleSearch), so publications.data
    // is the correct set to render directly — no client-side re-filtering needed.
    const currentPublications = publications.data || [];

    // Most-liked first for the featured rail (real signal only).
    const likedTop = activeTab === 'all'
        ? [...currentPublications]
            .filter((p) => (p.likes_count || 0) > 0)
            .sort((a, b) => (b.likes_count || 0) - (a.likes_count || 0))
        : [];

    // Always surface two lead stories side by side; when fewer than two have
    // likes, top up with the most recent publications so the pair stays balanced.
    const leadCandidates = activeTab === 'all'
        ? [...likedTop, ...currentPublications.filter((p) => !likedTop.some((l) => l.id === p.id))]
        : [];
    const leads = leadCandidates.slice(0, 2);
    const rail = likedTop.slice(2, 5);
    const featuredIds = new Set([...leads, ...rail].map((p) => p.id));
    const listPublications = currentPublications.filter((p) => !featuredIds.has(p.id));

    // On the "all" tab, group the remaining publications into labeled sections by type
    // (Magazines, Booklets, Reports, Articles) instead of one flat undifferentiated list.
    const TYPE_ORDER = ['magazine', 'booklet', 'report', 'article'];
    const sections = activeTab === 'all'
        ? TYPE_ORDER
            .map((type) => ({ type, items: listPublications.filter((p) => p.type === type) }))
            .filter((section) => section.items.length > 0)
        : [{ type: activeTab, items: listPublications }];

    const tabs = [
        { id: 'all', label: t('common.all') },
        { id: 'magazine', label: t('publicationsPage.sections.magazineTitle') },
        { id: 'booklet', label: t('publicationsPage.sections.bookletTitle') },
        { id: 'report', label: t('publicationsPage.sections.reportTitle') },
        { id: 'article', label: t('publicationsPage.sections.articleTitle') },
    ];

    const PublicationsContent = () => (
        <div className="space-y-10">
            <style>{`
                * {
                    scrollbar-color: rgba(163, 192, 66, 0.5) rgba(0, 0, 0, 0.05);
                    scrollbar-width: thin;
                }
                ::-webkit-scrollbar { width: 8px; height: 8px; }
                ::-webkit-scrollbar-track { background: rgba(0, 0, 0, 0.05); }
                ::-webkit-scrollbar-thumb { background: rgba(163, 192, 66, 0.5); border-radius: 4px; }
                ::-webkit-scrollbar-thumb:hover { background: rgba(163, 192, 66, 0.8); }
            `}</style>

            {/* Masthead */}
            <div className="border-b border-gray-200 pb-6">
                <div className="flex items-end justify-between gap-4">
                    <div>
                        <span className="text-xs font-bold uppercase tracking-widest text-[#A3C042]">
                            {t('common.discover')}
                        </span>
                        <h1 className="mt-1 text-4xl font-black leading-tight text-gray-900 md:text-5xl">
                            {t('sections.publications.title')}
                        </h1>
                    </div>
                    <div className="hidden text-sm font-semibold text-gray-500 sm:block">
                        {publications.total ?? currentPublications.length} {t('publicationsPage.publicationsAvailable')}
                    </div>
                </div>
            </div>

            {/* My Posts — the current user's own submissions, any status, always at the top */}
            {auth?.user && myPublications.length > 0 && (
                <div className="border-b border-gray-200 pb-8">
                    <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-gray-500">
                        {t('publicationsPage.myPosts')}
                    </h2>
                    <div className="flex gap-5 overflow-x-auto pb-2 scrollbar-hide no-scrollbar">
                        {myPublications.map((pub) => renderMyPublicationCard(pub))}
                    </div>
                </div>
            )}

            {/* Search */}
            <div className="flex flex-col gap-3 border-b border-gray-200 pb-6 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                    <FaSearch className="absolute left-0 top-1/2 -translate-y-1/2 text-[#A3C042]" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(event) => setSearchTerm(event.target.value)}
                        onKeyDown={(event) => event.key === 'Enter' && handleSearch()}
                        placeholder={t('publicationsPage.searchPlaceholder')}
                        aria-label={t('publicationsPage.searchPlaceholder')}
                        className="h-11 w-full border-b border-gray-200 bg-transparent ps-7 pe-2 text-sm font-medium text-gray-900 placeholder:text-gray-500 focus:border-[#A3C042] focus:outline-none"
                    />
                </div>
                <button
                    type="button"
                    onClick={handleSearch}
                    className="h-11 rounded-xl bg-gradient-to-r from-[#A3C042] to-[#8CA635] px-6 text-sm font-bold text-white shadow-sm transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[#A3C042]/50 focus:ring-offset-2"
                >
                    {t('common.search')}
                </button>
            </div>

            {/* Category nav — underline tabs, single source of truth for type filtering */}
            <div>
                <div
                    className="flex items-center gap-7 overflow-x-auto border-b border-gray-200 scrollbar-hide no-scrollbar"
                    role="tablist"
                    aria-label={t('publicationsPage.allTypes')}
                >
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            role="tab"
                            aria-selected={activeTab === tab.id}
                            onClick={() => selectTab(tab.id)}
                            className={`whitespace-nowrap border-b-2 pb-3 text-sm font-bold transition-colors duration-200 focus:outline-none ${
                                activeTab === tab.id
                                    ? 'border-[#A3C042] text-gray-900'
                                    : 'border-transparent text-gray-500 hover:text-gray-900'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
                <div className="mt-3 text-sm font-semibold text-gray-500">
                    {publications.total ?? currentPublications.length} {t('publicationsPage.publicationsFound')}
                </div>
            </div>

            {/* Lead + rail — two lead stories, not one */}
            {leads.length > 0 && (
                <div className={`grid grid-cols-1 gap-10 border-b border-gray-200 pb-10 ${rail.length > 0 ? 'lg:grid-cols-[1.6fr_1fr]' : ''}`}>
                    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
                        {leads.map((pub) => renderLead(pub))}
                    </div>
                    {rail.length > 0 && (
                        <div>
                            <span className="text-xs font-bold uppercase tracking-widest text-gray-500">
                                {t('publicationsPage.featured')}
                            </span>
                            <div className="mt-2">
                                {rail.map((pub, idx) => renderRailItem(pub, idx + leads.length + 1))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Sections — grouped by type (Magazines, Booklets, Reports, Articles) on the "all" tab */}
            <div className="min-h-[300px] space-y-10">
                {sections.length > 0 ? (
                    sections.map((section) => (
                        <div key={section.type}>
                            {activeTab === 'all' && (
                                <div className="mb-2 flex items-center gap-3 border-b border-gray-200 pb-3">
                                    <h2 className="text-lg font-black text-gray-900">{getTypeLabel(section.type)}</h2>
                                    <span className="text-sm font-semibold text-gray-500">{section.items.length}</span>
                                </div>
                            )}
                            <div>{section.items.map((pub) => renderListRow(pub))}</div>
                        </div>
                    ))
                ) : currentPublications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center border-y border-dashed border-gray-200 py-24 text-center">
                        <div className="mb-4 text-4xl text-gray-300">
                            {getTypeIcon(activeTab)({})}
                        </div>
                        <p className="text-lg font-semibold text-gray-900">{t('publicationsPage.empty')}</p>
                        <p className="mt-1 text-sm text-gray-500">{t('publicationsPage.emptyHint')}</p>
                    </div>
                ) : null}

                {/* Pagination */}
                {publications.links && publications.links.length > 3 && (
                    <div className="mt-8 flex flex-wrap items-center justify-center gap-5 border-t border-gray-200 pt-6">
                        {publications.links.map((link, index) => {
                            const isActive = link.active;
                            const isDisabled = !link.url;

                            const className = `text-sm font-bold transition-colors duration-200 ${
                                isActive
                                    ? 'text-[#A3C042] underline underline-offset-4'
                                    : isDisabled
                                    ? 'cursor-not-allowed text-gray-300'
                                    : 'text-gray-500 hover:text-gray-900'
                            }`;

                            if (isDisabled) {
                                return (
                                    <span
                                        key={index}
                                        className={className}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                );
                            }

                            return (
                                <button
                                    key={index}
                                    type="button"
                                    onClick={() => goToPublicationsPage(link.url)}
                                    className={className}
                                >
                                    <span dangerouslySetInnerHTML={{ __html: link.label }} />
                                </button>
                            );
                        })}
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
                <main className="mx-auto w-full max-w-6xl px-4 pb-24 pt-6">
                    <div className="mx-auto w-full max-w-5xl">
                        <PublicationsContent />
                    </div>
                </main>
                <MobileBottomNav active="explore" role={auth?.user?.role} isAuthed={!!auth?.user} user={auth?.user} />
                <DesktopFooter auth={auth} />
            </div>
        </div>
    );
}
