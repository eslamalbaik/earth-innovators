import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { FaEdit, FaGift, FaPlus, FaTrash } from 'react-icons/fa';
import { useConfirmDialog } from '@/Contexts/ConfirmContext';
import { useTranslation } from '@/i18n';
import { resolveLocalizedMessage } from '@/utils/resolveLocalizedMessage';

export default function AdminStoreRewardsIndex({ rewards = [] }) {
    const { t, language } = useTranslation();
    const { confirm } = useConfirmDialog();
    const { flash } = usePage().props;

    const handleDelete = async (id, name) => {
        const confirmed = await confirm({
            title: t('adminStoreRewardsPage.deleteConfirm.title'),
            message: t('adminStoreRewardsPage.deleteConfirm.message', { name }),
            confirmText: t('common.delete'),
            cancelText: t('common.cancel'),
            variant: 'danger',
        });
        if (confirmed) {
            router.delete(route('admin.store-rewards.destroy', id), { preserveScroll: true });
        }
    };

    return (
        <DashboardLayout header={t('adminStoreRewardsPage.title')}>
            <Head title={t('adminStoreRewardsPage.pageTitle', { appName: t('common.appName') })} />

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

            <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
                <h2 className="text-2xl font-bold text-gray-900">{t('adminStoreRewardsPage.listTitle')}</h2>
                <div className="flex flex-wrap gap-2">
                    <Link
                        href={route('admin.store-reward-requests.index')}
                        className="border border-[#A3C042] text-[#5a6b2a] font-semibold py-2 px-4 rounded-lg flex items-center gap-2 hover:bg-green-50"
                    >
                        <FaGift />
                        {t('adminStoreRewardsPage.linkRequests')}
                    </Link>
                    <Link
                        href={route('admin.store-rewards.create')}
                        className="bg-[#A3C042] hover:bg-[#8CA635] text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2"
                    >
                        <FaPlus />
                        {t('adminStoreRewardsPage.addNew')}
                    </Link>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-start text-xs font-medium text-gray-500 uppercase">{t('adminStoreRewardsPage.table.icon')}</th>
                                <th className="px-4 py-3 text-start text-xs font-medium text-gray-500 uppercase">{t('adminStoreRewardsPage.table.slug')}</th>
                                <th className="px-4 py-3 text-start text-xs font-medium text-gray-500 uppercase">{t('adminStoreRewardsPage.table.nameEn')}</th>
                                <th className="px-4 py-3 text-start text-xs font-medium text-gray-500 uppercase">{t('adminStoreRewardsPage.table.nameAr')}</th>
                                <th className="px-4 py-3 text-start text-xs font-medium text-gray-500 uppercase">{t('adminStoreRewardsPage.table.points')}</th>
                                <th className="px-4 py-3 text-start text-xs font-medium text-gray-500 uppercase">{t('adminStoreRewardsPage.table.approval')}</th>
                                <th className="px-4 py-3 text-start text-xs font-medium text-gray-500 uppercase">{t('common.status')}</th>
                                <th className="px-4 py-3 text-end text-xs font-medium text-gray-500 uppercase">{t('common.actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {rewards.length === 0 && (
                                <tr>
                                    <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                                        {t('adminStoreRewardsPage.empty')}
                                    </td>
                                </tr>
                            )}
                            {rewards.map((r) => (
                                <tr key={r.id}>
                                    <td className="px-4 py-3 text-2xl">{r.icon || '🎁'}</td>
                                    <td className="px-4 py-3 text-sm font-mono text-gray-800">{r.slug}</td>
                                    <td className="px-4 py-3 text-sm">{r.name_en}</td>
                                    <td className="px-4 py-3 text-sm">{r.name_ar}</td>
                                    <td className="px-4 py-3 text-sm font-bold">{r.points_cost}</td>
                                    <td className="px-4 py-3 text-sm">
                                        {r.requires_manual_approval ? (
                                            <span className="text-amber-700 font-semibold">{t('common.yes')}</span>
                                        ) : (
                                            <span className="text-gray-500">{t('common.no')}</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-sm">
                                        {r.is_active ? (
                                            <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">{t('common.active')}</span>
                                        ) : (
                                            <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">{t('common.inactive')}</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-end whitespace-nowrap">
                                        <Link
                                            href={route('admin.store-rewards.edit', r.id)}
                                            className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 me-3"
                                        >
                                            <FaEdit /> {t('common.edit')}
                                        </Link>
                                        <button
                                            type="button"
                                            onClick={() => handleDelete(r.id, r.name_en)}
                                            className="inline-flex items-center gap-1 text-red-600 hover:text-red-800"
                                        >
                                            <FaTrash /> {t('common.delete')}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </DashboardLayout>
    );
}
