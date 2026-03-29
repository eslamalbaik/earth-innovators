import { Head, Link, router } from '@inertiajs/react';
import { useMemo } from 'react';
import { FaChevronRight, FaClipboardList, FaStar, FaTasks } from 'react-icons/fa';
import MobileTopBar from '@/Components/Mobile/MobileTopBar';
import MobileBottomNav from '@/Components/Mobile/MobileBottomNav';
import { useTranslation } from '@/i18n';

const STATUS_FILTERS = ['all', 'submitted', 'reviewed', 'approved', 'rejected'];

export default function StudentSubmissionsIndex({ auth, submissions, filterStatus = 'all' }) {
    const { t, language } = useTranslation();
    const list = submissions?.data || [];

    const statusStyle = useMemo(() => ({
        submitted: 'bg-amber-100 text-amber-800 border-amber-200',
        reviewed: 'bg-blue-100 text-blue-800 border-blue-200',
        approved: 'bg-green-100 text-green-800 border-green-200',
        rejected: 'bg-red-100 text-red-800 border-red-200',
    }), []);

    const applyFilter = (status) => {
        const params = status === 'all' ? {} : { status };
        router.get('/student/submissions', params, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const SubmissionsContent = () => (
        <div className="space-y-4">
            <div className="rounded-2xl border border-indigo-100 bg-indigo-50/70 p-4">
                <div className="mb-2 flex items-center gap-2 text-indigo-900">
                    <FaTasks className="text-lg" />
                    <h1 className="text-lg font-bold">{t('studentSubmissionsPage.title')}</h1>
                </div>
                <p className="text-sm text-indigo-900/80">{t('studentSubmissionsPage.subtitle')}</p>
            </div>

            <div className="flex flex-wrap gap-2">
                {STATUS_FILTERS.map((key) => (
                    <button
                        key={key}
                        type="button"
                        onClick={() => applyFilter(key)}
                        className={`rounded-full px-3 py-1.5 text-xs font-semibold border transition ${
                            filterStatus === key
                                ? 'border-[#A3C042] bg-[#A3C042] text-white'
                                : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        {t(`studentSubmissionsPage.filters.${key}`)}
                    </button>
                ))}
            </div>

            {list.length > 0 ? (
                <ul className="space-y-3">
                    {list.map((row) => {
                        const projectId = row.project_id;
                        const title = row.project?.title || t('studentSubmissionsPage.untitledProject');
                        const st = row.status || 'submitted';
                        return (
                            <li key={row.id}>
                                <button
                                    type="button"
                                    onClick={() => projectId && router.visit(`/student/projects/${projectId}`)}
                                    className="flex w-full items-start gap-3 rounded-2xl border border-gray-100 bg-white p-4 text-start shadow-sm transition hover:shadow-md"
                                >
                                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                                        <FaClipboardList className="text-lg" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="font-bold text-gray-900 line-clamp-2">{title}</span>
                                            <span
                                                className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${statusStyle[st] || 'bg-gray-100 text-gray-700'}`}
                                            >
                                                {t(`studentSubmissionsPage.statuses.${st}`)}
                                            </span>
                                        </div>
                                        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                                            {row.submitted_at && (
                                                <span>{t('studentSubmissionsPage.submittedAt')}: {row.submitted_at}</span>
                                            )}
                                            {row.rating != null && Number(row.rating) > 0 && (
                                                <span className="inline-flex items-center gap-1 text-amber-700">
                                                    <FaStar className="text-amber-500" />
                                                    {Number(row.rating).toFixed(1)}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <FaChevronRight className="mt-1 flex-shrink-0 text-gray-300" />
                                </button>
                            </li>
                        );
                    })}
                </ul>
            ) : (
                <div className="rounded-2xl border border-gray-100 bg-white p-10 text-center">
                    <FaClipboardList className="mx-auto mb-3 text-3xl text-gray-300" />
                    <p className="text-sm font-semibold text-gray-800">{t('studentSubmissionsPage.emptyTitle')}</p>
                    <p className="mt-2 text-sm text-gray-500">{t('studentSubmissionsPage.emptyHint')}</p>
                    <button
                        type="button"
                        onClick={() => router.visit('/student/projects')}
                        className="mt-4 rounded-xl bg-[#A3C042] px-4 py-2 text-sm font-bold text-white hover:bg-[#8CA635]"
                    >
                        {t('studentSubmissionsPage.browseProjects')}
                    </button>
                </div>
            )}

            {submissions?.links && submissions.links.length > 3 && (
                <div className="rounded-2xl border border-gray-100 bg-white p-3">
                    <div className="flex flex-wrap justify-center gap-2">
                        {submissions.links.map((link, index) => (
                            <Link
                                key={index}
                                href={link.url || '#'}
                                className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${
                                    link.active
                                        ? 'bg-[#A3C042] text-white'
                                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                                } ${!link.url ? 'cursor-not-allowed opacity-50' : ''}`}
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
            <Head title={t('studentSubmissionsPage.pageTitle', { appName: t('common.appName') })} />

            <MobileTopBar
                title={t('studentSubmissionsPage.shortTitle')}
                unreadCount={auth?.unreadCount || 0}
                onNotifications={() => router.visit('/notifications')}
                onBack={() => router.visit('/dashboard')}
                reverseOrder={false}
            />

            <main className="mx-auto w-full max-w-6xl px-4 pb-24 pt-4">
                <div className="mx-auto w-full max-w-3xl">
                    <SubmissionsContent />
                </div>
            </main>

            <MobileBottomNav active="home" role={auth?.user?.role} isAuthed={!!auth?.user} user={auth?.user} />
        </div>
    );
}
