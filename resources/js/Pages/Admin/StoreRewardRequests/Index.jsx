import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { FaArrowRight, FaCheck, FaGift, FaTimes } from 'react-icons/fa';
import { useConfirmDialog } from '@/Contexts/ConfirmContext';
import { useTranslation } from '@/i18n';
import { resolveLocalizedMessage } from '@/utils/resolveLocalizedMessage';

export default function AdminStoreRewardRequestsIndex({ requests, filters = {} }) {
    const { t, language } = useTranslation();
    const { confirm } = useConfirmDialog();
    const { flash } = usePage().props;
    const status = filters?.status || 'pending';
    const rows = requests?.data ?? [];

    const rewardName = (reward) => (language === 'ar' ? (reward?.name_ar || reward?.name_en) : (reward?.name_en || reward?.name_ar));

    const setStatus = (next) => {
        router.get(route('admin.store-reward-requests.index'), { status: next }, { preserveState: true, replace: true });
    };

    const handleApprove = async (id) => {
        const ok = await confirm({
            title: t('adminStoreRewardRequestsPage.approveConfirm.title'),
            message: t('adminStoreRewardRequestsPage.approveConfirm.message'),
            confirmText: t('adminStoreRewardRequestsPage.approve'),
            cancelText: t('common.cancel'),
            variant: 'info',
        });
        if (ok) {
            router.post(route('admin.store-reward-requests.approve', id), {}, { preserveScroll: true });
        }
    };

    const handleReject = async (id) => {
        const ok = await confirm({
            title: t('adminStoreRewardRequestsPage.rejectConfirm.title'),
            message: t('adminStoreRewardRequestsPage.rejectConfirm.message'),
            confirmText: t('adminStoreRewardRequestsPage.reject'),
            cancelText: t('common.cancel'),
            variant: 'danger',
        });
        if (ok) {
            router.post(route('admin.store-reward-requests.reject', id), { admin_note: '' }, { preserveScroll: true });
        }
    };

    return (
        <DashboardLayout header={t('adminStoreRewardRequestsPage.title')}>
            <Head title={t('adminStoreRewardRequestsPage.pageTitle', { appName: t('common.appName') })} />

            {flash?.success && (
                <div className="mb-4 p-3 rounded bg-green-100 text-green-800">
                    {resolveLocalizedMessage(flash.success, language)}
                </div>
            )}
            {flash?.error && (
                <div className="mb-4 p-3 rounded bg-red-100 text-red-800">
                    {resolveLocalizedMessage(flash.error, language)}
                </div>
            )}

            <div className="mb-6">
                <Link href={route('admin.store-rewards.index')} className="text-blue-600 hover:text-blue-800 flex items-center gap-2">
                    <FaArrowRight className="transform rotate-180" />
                    {t('adminStoreRewardRequestsPage.backToRewards')}
                </Link>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <h2 className="text-2xl font-bold text-gray-900">{t('adminStoreRewardRequestsPage.listTitle')}</h2>
                <div className="flex flex-wrap gap-2">
                    {['pending', 'approved', 'rejected'].map((s) => (
                        <button
                            key={s}
                            type="button"
                            onClick={() => setStatus(s)}
                            className={`px-4 py-2 rounded-lg text-sm font-semibold ${
                                status === s ? 'bg-[#A3C042] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            {t(`adminStoreRewardRequestsPage.status.${s}`)}
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-start text-xs font-medium text-gray-500 uppercase">{t('adminStoreRewardRequestsPage.table.student')}</th>
                                <th className="px-4 py-3 text-start text-xs font-medium text-gray-500 uppercase">{t('adminStoreRewardRequestsPage.table.reward')}</th>
                                <th className="px-4 py-3 text-start text-xs font-medium text-gray-500 uppercase">{t('adminStoreRewardRequestsPage.table.points')}</th>
                                <th className="px-4 py-3 text-start text-xs font-medium text-gray-500 uppercase">{t('adminStoreRewardRequestsPage.table.requestedAt')}</th>
                                <th className="px-4 py-3 text-start text-xs font-medium text-gray-500 uppercase">{t('common.status')}</th>
                                <th className="px-4 py-3 text-end text-xs font-medium text-gray-500 uppercase">{t('common.actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {rows.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                                        {t('adminStoreRewardRequestsPage.empty')}
                                    </td>
                                </tr>
                            )}
                            {rows.map((row) => (
                                <tr key={row.id}>
                                    <td className="px-4 py-3 text-sm">
                                        <div className="font-semibold text-gray-900">{row.student?.name}</div>
                                        <div className="text-xs text-gray-500">{row.student?.email}</div>
                                    </td>
                                    <td className="px-4 py-3 text-sm">
                                        <span className="inline-flex items-center gap-1">
                                            <FaGift className="text-[#A3C042]" />
                                            {rewardName(row.reward)}
                                        </span>
                                        <div className="text-xs font-mono text-gray-400">{row.reward?.slug}</div>
                                    </td>
                                    <td className="px-4 py-3 text-sm font-bold">{row.points_cost}</td>
                                    <td className="px-4 py-3 text-sm text-gray-600">{row.created_at}</td>
                                    <td className="px-4 py-3 text-sm">
                                        <span
                                            className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                                row.status === 'pending'
                                                    ? 'bg-amber-100 text-amber-800'
                                                    : row.status === 'approved'
                                                      ? 'bg-green-100 text-green-800'
                                                      : 'bg-red-100 text-red-800'
                                            }`}
                                        >
                                            {t(`adminStoreRewardRequestsPage.status.${row.status}`)}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-end whitespace-nowrap">
                                        {row.status === 'pending' && (
                                            <>
                                                <button
                                                    type="button"
                                                    onClick={() => handleApprove(row.id)}
                                                    className="inline-flex items-center gap-1 text-green-700 hover:text-green-900 font-semibold me-3"
                                                >
                                                    <FaCheck /> {t('adminStoreRewardRequestsPage.approve')}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleReject(row.id)}
                                                    className="inline-flex items-center gap-1 text-red-600 hover:text-red-800 font-semibold"
                                                >
                                                    <FaTimes /> {t('adminStoreRewardRequestsPage.reject')}
                                                </button>
                                            </>
                                        )}
                                        {row.status !== 'pending' && (
                                            <div className="text-xs text-gray-500">
                                                {row.processed_at && (
                                                    <div>
                                                        {t('adminStoreRewardRequestsPage.processedAt')}: {row.processed_at}
                                                    </div>
                                                )}
                                                {row.processed_by && (
                                                    <div>
                                                        {t('adminStoreRewardRequestsPage.processedBy')}: {row.processed_by}
                                                    </div>
                                                )}
                                                {row.admin_note && (
                                                    <div className="mt-1 text-gray-600">{row.admin_note}</div>
                                                )}
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {requests?.links && requests.links.length > 3 && (
                    <div className="px-6 py-4 border-t border-gray-200">
                        <div className="flex items-center justify-between flex-wrap gap-4">
                            <div className="text-sm text-gray-700">
                                {t('adminStoreRewardRequestsPage.pagination.showing', {
                                    from: requests.from,
                                    to: requests.to,
                                    total: requests.total,
                                })}
                            </div>
                            <div className="flex gap-2 flex-wrap">
                                {requests.links.map((link, index) => (
                                    <Link
                                        key={index}
                                        href={link.url || '#'}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium ${
                                            link.active ? 'bg-[#A3C042] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        } ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
