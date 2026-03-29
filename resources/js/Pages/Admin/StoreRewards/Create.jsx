import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FaArrowRight, FaSave } from 'react-icons/fa';
import { useTranslation } from '@/i18n';

export default function AdminStoreRewardsCreate() {
    const { t } = useTranslation();
    const { data, setData, post, processing, errors } = useForm({
        slug: '',
        name_en: '',
        name_ar: '',
        icon: '🎁',
        points_cost: 100,
        sort_order: 0,
        is_active: true,
        requires_manual_approval: false,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.store-rewards.store'));
    };

    return (
        <DashboardLayout header={t('adminStoreRewardsPage.createTitle')}>
            <Head title={t('adminStoreRewardsPage.createPageTitle', { appName: t('common.appName') })} />

            <div className="mb-6">
                <Link href={route('admin.store-rewards.index')} className="text-blue-600 hover:text-blue-800 flex items-center gap-2">
                    <FaArrowRight className="transform rotate-180" />
                    {t('adminStoreRewardsPage.backToList')}
                </Link>
            </div>

            <form onSubmit={submit} className="bg-white rounded-xl shadow-lg p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">{t('adminStoreRewardsPage.fields.slug')} *</label>
                        <input
                            type="text"
                            value={data.slug}
                            onChange={(e) => setData('slug', e.target.value)}
                            className={`w-full px-4 py-2 border rounded-lg ${errors.slug ? 'border-red-500' : 'border-gray-300'}`}
                            placeholder="digital_card"
                            required
                        />
                        {errors.slug && <p className="mt-1 text-sm text-red-600">{errors.slug}</p>}
                        <p className="mt-1 text-xs text-gray-500">{t('adminStoreRewardsPage.hints.slug')}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">{t('adminStoreRewardsPage.fields.icon')}</label>
                        <input
                            type="text"
                            value={data.icon}
                            onChange={(e) => setData('icon', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                            maxLength={32}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">{t('adminStoreRewardsPage.fields.nameEn')} *</label>
                        <input
                            type="text"
                            value={data.name_en}
                            onChange={(e) => setData('name_en', e.target.value)}
                            className={`w-full px-4 py-2 border rounded-lg ${errors.name_en ? 'border-red-500' : 'border-gray-300'}`}
                            required
                        />
                        {errors.name_en && <p className="mt-1 text-sm text-red-600">{errors.name_en}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">{t('adminStoreRewardsPage.fields.nameAr')} *</label>
                        <input
                            type="text"
                            value={data.name_ar}
                            onChange={(e) => setData('name_ar', e.target.value)}
                            className={`w-full px-4 py-2 border rounded-lg ${errors.name_ar ? 'border-red-500' : 'border-gray-300'}`}
                            required
                        />
                        {errors.name_ar && <p className="mt-1 text-sm text-red-600">{errors.name_ar}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">{t('adminStoreRewardsPage.fields.pointsCost')} *</label>
                        <input
                            type="number"
                            min={1}
                            value={data.points_cost}
                            onChange={(e) => setData('points_cost', parseInt(e.target.value, 10) || 0)}
                            className={`w-full px-4 py-2 border rounded-lg ${errors.points_cost ? 'border-red-500' : 'border-gray-300'}`}
                            required
                        />
                        {errors.points_cost && <p className="mt-1 text-sm text-red-600">{errors.points_cost}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">{t('adminStoreRewardsPage.fields.sortOrder')}</label>
                        <input
                            type="number"
                            min={0}
                            value={data.sort_order}
                            onChange={(e) => setData('sort_order', parseInt(e.target.value, 10) || 0)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        />
                    </div>
                </div>

                <div className="flex flex-wrap gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={data.is_active}
                            onChange={(e) => setData('is_active', e.target.checked)}
                            className="rounded border-gray-300"
                        />
                        <span className="text-sm text-gray-800">{t('adminStoreRewardsPage.fields.isActive')}</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={data.requires_manual_approval}
                            onChange={(e) => setData('requires_manual_approval', e.target.checked)}
                            className="rounded border-gray-300"
                        />
                        <span className="text-sm text-gray-800">{t('adminStoreRewardsPage.fields.requiresManualApproval')}</span>
                    </label>
                </div>

                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={processing}
                        className="inline-flex items-center gap-2 bg-[#A3C042] hover:bg-[#8CA635] text-white font-semibold py-2 px-6 rounded-lg disabled:opacity-50"
                    >
                        <FaSave />
                        {processing ? t('common.saving') : t('common.save')}
                    </button>
                </div>
            </form>
        </DashboardLayout>
    );
}
