import { Head, Link, router } from '@inertiajs/react';
import { useMemo } from 'react';
import { FaChartLine, FaPlusCircle, FaMinusCircle, FaGift, FaExclamationTriangle, FaFilter } from 'react-icons/fa';
import MobileAppLayout from '@/Layouts/MobileAppLayout';
import MobileTopBar from '@/Components/Mobile/MobileTopBar';
import MobileBottomNav from '@/Components/Mobile/MobileBottomNav';
import DesktopFooter from '@/Components/Mobile/DesktopFooter';
import { useTranslation } from '@/i18n';

const typeColors = {
    earned: 'bg-green-100 text-green-800 border-green-200',
    bonus: 'bg-blue-100 text-blue-800 border-blue-200',
    redeemed: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    penalty: 'bg-red-100 text-red-800 border-red-200',
};

export default function StudentPoints({ auth, summary, points, filters }) {
    const { t, language } = useTranslation();
    const currentType = filters?.type || '';
    const list = points?.data || [];
    const user = auth?.user;
    const isAuthed = !!user;

    const stats = useMemo(() => ({
        current: summary?.current ?? 0,
        earned: summary?.earned ?? 0,
        bonus: summary?.bonus ?? 0,
        redeemed: summary?.redeemed ?? 0,
        penalty: summary?.penalty ?? 0,
    }), [summary]);

    const typeLabels = {
        earned: t('studentPointsPage.types.earned'),
        bonus: t('studentPointsPage.types.bonus'),
        redeemed: t('studentPointsPage.types.redeemed'),
        penalty: t('studentPointsPage.types.penalty'),
    };

    const sourceLabels = {
        challenge: t('studentPointsPage.sources.challenge'),
        package_bonus: t('studentPointsPage.sources.packageBonus'),
        publication_approval: t('studentPointsPage.sources.publicationApproval'),
        project_submission: t('studentPointsPage.sources.projectSubmission'),
        project_approval: t('studentPointsPage.sources.projectApproval'),
        teacher_project_approval: t('studentPointsPage.sources.teacherProjectApproval'),
    };

    const applyType = (type) => {
        router.get('/student/points', type ? { type } : {}, { preserveState: true, preserveScroll: true });
    };

    const formatDate = (date) => {
        if (!date) {
            return t('common.notAvailable');
        }

        const parsedDate = new Date(date);
        if (Number.isNaN(parsedDate.getTime())) {
            return date;
        }

        return new Intl.DateTimeFormat(language === 'ar' ? 'ar-EG' : 'en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        }).format(parsedDate);
    };

    const getLocalizedDescription = (row) => {
        if (!row) {
            return t('studentPointsPage.unknownDescription');
        }

        return language === 'ar'
            ? (row.description_ar || row.description || t('studentPointsPage.unknownDescription'))
            : (row.description || row.description_ar || t('studentPointsPage.unknownDescription'));
    };

    const getSourceLabel = (source) => {
        if (!source) {
            return t('studentPointsPage.unknownSource');
        }

        return sourceLabels[source]
            || source.replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
    };

    const PointsContent = ({ isDesktop = false }) => (
        <div className={`space-y-4 ${isDesktop ? 'md:space-y-6' : ''}`}>
            <div className={`grid gap-3 ${isDesktop ? 'grid-cols-2 lg:grid-cols-5' : 'grid-cols-2'}`}>
                <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-xs text-gray-500">{t('studentPointsPage.stats.currentBalance')}</div>
                            <div className={`mt-1 font-extrabold text-gray-900 ${isDesktop ? 'text-2xl' : 'text-xl'}`}>{stats.current}</div>
                        </div>
                        <div className={`flex items-center justify-center rounded-xl bg-purple-100 ${isDesktop ? 'h-10 w-10' : 'h-8 w-8'}`}>
                            <FaChartLine className={`text-purple-700 ${isDesktop ? 'text-lg' : 'text-sm'}`} />
                        </div>
                    </div>
                </div>

                <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-xs text-gray-500">{t('studentPointsPage.stats.earnedPoints')}</div>
                            <div className={`mt-1 font-extrabold text-green-700 ${isDesktop ? 'text-2xl' : 'text-xl'}`}>{stats.earned}</div>
                        </div>
                        <div className={`flex items-center justify-center rounded-xl bg-green-100 ${isDesktop ? 'h-10 w-10' : 'h-8 w-8'}`}>
                            <FaPlusCircle className={`text-green-700 ${isDesktop ? 'text-lg' : 'text-sm'}`} />
                        </div>
                    </div>
                </div>

                <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-xs text-gray-500">{t('studentPointsPage.stats.bonusPoints')}</div>
                            <div className={`mt-1 font-extrabold text-blue-700 ${isDesktop ? 'text-2xl' : 'text-xl'}`}>{stats.bonus}</div>
                        </div>
                        <div className={`flex items-center justify-center rounded-xl bg-blue-100 ${isDesktop ? 'h-10 w-10' : 'h-8 w-8'}`}>
                            <FaGift className={`text-blue-700 ${isDesktop ? 'text-lg' : 'text-sm'}`} />
                        </div>
                    </div>
                </div>

                <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-xs text-gray-500">{t('studentPointsPage.stats.redeemedPoints')}</div>
                            <div className={`mt-1 font-extrabold text-yellow-700 ${isDesktop ? 'text-2xl' : 'text-xl'}`}>{stats.redeemed}</div>
                        </div>
                        <div className={`flex items-center justify-center rounded-xl bg-yellow-100 ${isDesktop ? 'h-10 w-10' : 'h-8 w-8'}`}>
                            <FaMinusCircle className={`text-yellow-700 ${isDesktop ? 'text-lg' : 'text-sm'}`} />
                        </div>
                    </div>
                </div>

                <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-xs text-gray-500">{t('studentPointsPage.stats.penaltyPoints')}</div>
                            <div className={`mt-1 font-extrabold text-red-700 ${isDesktop ? 'text-2xl' : 'text-xl'}`}>{stats.penalty}</div>
                        </div>
                        <div className={`flex items-center justify-center rounded-xl bg-red-100 ${isDesktop ? 'h-10 w-10' : 'h-8 w-8'}`}>
                            <FaExclamationTriangle className={`text-red-700 ${isDesktop ? 'text-lg' : 'text-sm'}`} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-2 text-gray-700">
                        <FaFilter className="text-sm" />
                        <span className="text-xs font-bold">{t('studentPointsPage.filterLabel')}</span>
                    </div>

                    <button
                        type="button"
                        onClick={() => applyType('')}
                        className={`rounded-xl border px-3 py-1.5 text-xs font-semibold transition ${
                            !currentType
                                ? 'border-[#A3C042] bg-[#A3C042] text-white'
                                : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100'
                        }`}
                    >
                        {t('studentPointsPage.allTypes')}
                    </button>

                    {['earned', 'bonus', 'redeemed', 'penalty'].map((type) => (
                        <button
                            key={type}
                            type="button"
                            onClick={() => applyType(type)}
                            className={`rounded-xl border px-3 py-1.5 text-xs font-semibold transition ${
                                currentType === type
                                    ? 'border-[#A3C042] bg-[#A3C042] text-white'
                                    : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100'
                            }`}
                        >
                            {typeLabels[type]}
                        </button>
                    ))}
                </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                <div className={`flex items-center justify-between border-b border-gray-100 ${isDesktop ? 'p-4' : 'p-3'}`}>
                    <div className={`font-extrabold text-gray-900 ${isDesktop ? 'text-sm' : 'text-xs'}`}>{t('studentPointsPage.historyTitle')}</div>
                    <Link
                        href="/store-membership"
                        className={`font-bold text-[#A3C042] transition hover:text-[#8CA635] ${isDesktop ? 'text-sm' : 'text-xs'}`}
                    >
                        {t('studentPointsPage.storeMembershipAction')}
                    </Link>
                </div>

                {list.length === 0 ? (
                    <div className={`text-center ${isDesktop ? 'p-10' : 'p-6'}`}>
                        <FaChartLine className={`mx-auto mb-4 text-gray-200 ${isDesktop ? 'text-5xl' : 'text-4xl'}`} />
                        <div className={`font-bold text-gray-700 ${isDesktop ? 'text-base' : 'text-sm'}`}>{t('studentPointsPage.emptyTitle')}</div>
                        <div className={`mt-1 text-gray-500 ${isDesktop ? 'text-sm' : 'text-xs'}`}>{t('studentPointsPage.emptyDescription')}</div>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {list.map((row) => {
                            const color = typeColors[row.type] || 'border-gray-200 bg-gray-100 text-gray-800';

                            return (
                                <div key={row.id} className={`flex items-center justify-between gap-4 ${isDesktop ? 'p-4' : 'p-3'}`}>
                                    <div className="min-w-0 flex-1">
                                        <div className={`truncate font-bold text-gray-900 ${isDesktop ? 'text-sm' : 'text-xs'}`}>
                                            {getLocalizedDescription(row)}
                                        </div>
                                        <div className={`mt-1 text-gray-500 ${isDesktop ? 'text-xs' : 'text-[10px]'}`}>
                                            {formatDate(row.created_at)} • {getSourceLabel(row.source)}
                                        </div>
                                    </div>
                                    <div className="flex flex-shrink-0 items-center gap-2">
                                        <span className={`rounded-full border px-2 py-1 font-bold ${color} ${isDesktop ? 'text-xs' : 'text-[10px]'}`}>
                                            {typeLabels[row.type] || row.type}
                                        </span>
                                        <div className={`font-extrabold ${row.points >= 0 ? 'text-green-700' : 'text-red-700'} ${isDesktop ? 'text-lg' : 'text-base'}`}>
                                            {row.points >= 0 ? `+${row.points}` : row.points}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {points?.links?.length > 3 && (
                <div className="rounded-2xl border border-gray-100 bg-white p-3">
                    <div className="flex flex-wrap justify-center gap-2">
                        {points.links.map((link, idx) => (
                            <Link
                                key={idx}
                                href={link.url || '#'}
                                className={`rounded-xl px-2 py-1.5 font-semibold transition ${
                                    link.active ? 'bg-[#A3C042] text-white' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                                } ${!link.url ? 'cursor-not-allowed opacity-50' : ''} ${isDesktop ? 'text-sm' : 'text-xs'}`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );

    return (
        <div dir={language === 'ar' ? 'rtl' : 'ltr'} className="min-h-screen bg-gray-50">
            <Head title={t('studentPointsPage.pageTitle', { appName: t('common.appName') })} />

            <div className="block md:hidden">
                <MobileAppLayout
                    auth={auth}
                    title={t('studentPointsPage.title')}
                    activeNav="profile"
                    unreadCount={auth?.unreadCount || 0}
                    onNotifications={() => router.visit('/notifications')}
                    onBack={() => router.visit('/student/profile')}
                >
                    <PointsContent isDesktop={false} />
                </MobileAppLayout>
            </div>

            <div className="hidden md:block">
                <MobileTopBar
                    title={t('studentPointsPage.title')}
                    unreadCount={auth?.unreadCount || 0}
                    onNotifications={() => router.visit('/notifications')}
                    onBack={() => router.visit('/student/profile')}
                    reverseOrder={false}
                    auth={auth}
                />
                <main className="mx-auto w-full max-w-6xl px-4 pb-24 pt-4">
                    <div className="mx-auto w-full max-w-4xl">
                        <PointsContent isDesktop={true} />
                    </div>
                </main>
                <MobileBottomNav active="profile" role={user?.role} isAuthed={isAuthed} user={user} />
                <DesktopFooter auth={auth} />
            </div>
        </div>
    );
}
