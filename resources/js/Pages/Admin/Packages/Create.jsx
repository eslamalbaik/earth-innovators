import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FaArrowRight, FaSave, FaTimes } from 'react-icons/fa';
import { useState } from 'react';
import { useTranslation } from '@/i18n';

export default function AdminPackagesCreate() {
    const { t } = useTranslation();
    const [features, setFeatures] = useState(['']);
    const [featuresAr, setFeaturesAr] = useState(['']);

    const { data, setData, post, processing, errors } = useForm({
        name: '',
        name_ar: '',
        description: '',
        description_ar: '',
        price: 0,
        currency: 'AED',
        duration_type: 'monthly',
        duration_months: 1,
        points_bonus: 0,
        projects_limit: null,
        challenges_limit: null,
        certificate_access: false,
        badge_access: false,
        is_trial: false,
        trial_days: 14,
        features: [],
        features_ar: [],
        is_active: true,
        is_popular: false,
    });

    const isTrial = !!data.is_trial;

    const addFeature = (isArabic = false) => {
        if (isArabic) {
            setFeaturesAr([...featuresAr, '']);
        } else {
            setFeatures([...features, '']);
        }
    };

    const updateFeature = (index, value, isArabic = false) => {
        if (isArabic) {
            const newFeatures = [...featuresAr];
            newFeatures[index] = value;
            setFeaturesAr(newFeatures);
            setData('features_ar', newFeatures.filter(f => f.trim() !== ''));
        } else {
            const newFeatures = [...features];
            newFeatures[index] = value;
            setFeatures(newFeatures);
            setData('features', newFeatures.filter(f => f.trim() !== ''));
        }
    };

    const removeFeature = (index, isArabic = false) => {
        if (isArabic) {
            const newFeatures = featuresAr.filter((_, i) => i !== index);
            setFeaturesAr(newFeatures);
            setData('features_ar', newFeatures.filter(f => f.trim() !== ''));
        } else {
            const newFeatures = features.filter((_, i) => i !== index);
            setFeatures(newFeatures);
            setData('features', newFeatures.filter(f => f.trim() !== ''));
        }
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.packages.store'));
    };

    return (
        <DashboardLayout header={t('adminPackagesCreatePage.title')}>
            <Head title={t('adminPackagesCreatePage.pageTitle', { appName: t('common.appName') })} />

            <div className="mb-6">
                <Link
                    href={route('admin.packages.index')}
                    className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
                >
                    <FaArrowRight className="transform rotate-180" />
                    {t('adminPackagesCreatePage.actions.backToPackages')}
                </Link>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('adminPackagesCreatePage.sections.packageInfo')}</h2>

                <form onSubmit={submit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* الاسم (إنجليزي) */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t('adminPackagesCreatePage.fields.nameEn')} <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.name ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                required
                            />
                            {errors.name && (
                                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                            )}
                        </div>

                        {/* الاسم (عربي) */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t('adminPackagesCreatePage.fields.nameAr')}
                            </label>
                            <input
                                type="text"
                                value={data.name_ar}
                                onChange={(e) => setData('name_ar', e.target.value)}
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.name_ar ? 'border-red-500' : 'border-gray-300'
                                    }`}
                            />
                            {errors.name_ar && (
                                <p className="mt-1 text-sm text-red-600">{errors.name_ar}</p>
                            )}
                        </div>

                        {/* الوصف */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t('adminPackagesCreatePage.fields.description')}
                            </label>
                            <textarea
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                rows={3}
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.description ? 'border-red-500' : 'border-gray-300'
                                    }`}
                            />
                            {errors.description && (
                                <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                            )}
                        </div>

                        {/* الوصف (عربي) */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t('adminPackagesCreatePage.fields.descriptionAr')}
                            </label>
                            <textarea
                                value={data.description_ar}
                                onChange={(e) => setData('description_ar', e.target.value)}
                                rows={3}
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.description_ar ? 'border-red-500' : 'border-gray-300'
                                    }`}
                            />
                            {errors.description_ar && (
                                <p className="mt-1 text-sm text-red-600">{errors.description_ar}</p>
                            )}
                        </div>

                        {/* السعر */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t('adminPackagesCreatePage.fields.price')} <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={data.price}
                                onChange={(e) => setData('price', parseFloat(e.target.value) || 0)}
                                disabled={isTrial}
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.price ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                required
                            />
                            {isTrial && (
                                <p className="mt-1 text-xs text-emerald-700">{t('adminPackagesCreatePage.fields.trialPriceHint')}</p>
                            )}
                            {errors.price && (
                                <p className="mt-1 text-sm text-red-600">{errors.price}</p>
                            )}
                        </div>

                        {/* العملة */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t('adminPackagesCreatePage.fields.currency')} <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={data.currency}
                                onChange={(e) => setData('currency', e.target.value)}
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.currency ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                required
                            >
                                <option value="SAR">{t('adminPackagesCreatePage.currencies.sar')}</option>
                                <option value="USD">{t('adminPackagesCreatePage.currencies.usd')}</option>
                                <option value="AED">{t('adminPackagesCreatePage.currencies.aed')}</option>
                            </select>
                            {errors.currency && (
                                <p className="mt-1 text-sm text-red-600">{errors.currency}</p>
                            )}
                        </div>

                        {/* نوع المدة */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t('adminPackagesCreatePage.fields.durationType')} <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={data.duration_type}
                                onChange={(e) => setData('duration_type', e.target.value)}
                                disabled={isTrial}
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.duration_type ? 'border-red-500' : 'border-gray-300'
                                    } ${isTrial ? 'bg-gray-50 text-gray-400' : ''}`}
                                required
                            >
                                <option value="monthly">{t('packagesIndexPage.duration.monthly')}</option>
                                <option value="quarterly">{t('packagesIndexPage.duration.quarterly')}</option>
                                <option value="yearly">{t('packagesIndexPage.duration.yearly')}</option>
                                <option value="lifetime">{t('packagesIndexPage.duration.lifetime')}</option>
                            </select>
                            {errors.duration_type && (
                                <p className="mt-1 text-sm text-red-600">{errors.duration_type}</p>
                            )}
                        </div>

                        {/* عدد الأشهر */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t('adminPackagesCreatePage.fields.durationMonths')}
                            </label>
                            <input
                                type="number"
                                min="1"
                                value={data.duration_months}
                                onChange={(e) => setData('duration_months', parseInt(e.target.value) || 1)}
                                disabled={isTrial}
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.duration_months ? 'border-red-500' : 'border-gray-300'
                                    } ${isTrial ? 'bg-gray-50 text-gray-400' : ''}`}
                            />
                            {errors.duration_months && (
                                <p className="mt-1 text-sm text-red-600">{errors.duration_months}</p>
                            )}
                        </div>

                        {/* نقاط المكافأة */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t('adminPackagesCreatePage.fields.pointsBonus')}
                            </label>
                            <input
                                type="number"
                                min="0"
                                value={data.points_bonus}
                                onChange={(e) => setData('points_bonus', parseInt(e.target.value) || 0)}
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.points_bonus ? 'border-red-500' : 'border-gray-300'
                                    }`}
                            />
                            {errors.points_bonus && (
                                <p className="mt-1 text-sm text-red-600">{errors.points_bonus}</p>
                            )}
                        </div>

                        {/* حد المشاريع */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t('adminPackagesCreatePage.fields.projectsLimitHint')}
                            </label>
                            <input
                                type="number"
                                min="0"
                                value={data.projects_limit || ''}
                                onChange={(e) => setData('projects_limit', e.target.value ? parseInt(e.target.value) : null)}
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.projects_limit ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                placeholder={t('adminPackagesCreatePage.placeholders.unlimited')}
                            />
                            {errors.projects_limit && (
                                <p className="mt-1 text-sm text-red-600">{errors.projects_limit}</p>
                            )}
                        </div>

                        {/* حد التحديات */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t('adminPackagesCreatePage.fields.challengesLimitHint')}
                            </label>
                            <input
                                type="number"
                                min="0"
                                value={data.challenges_limit || ''}
                                onChange={(e) => setData('challenges_limit', e.target.value ? parseInt(e.target.value) : null)}
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.challenges_limit ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                placeholder={t('adminPackagesCreatePage.placeholders.unlimited')}
                            />
                            {errors.challenges_limit && (
                                <p className="mt-1 text-sm text-red-600">{errors.challenges_limit}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t('adminPackagesCreatePage.fields.trialDays')}
                            </label>
                            <input
                                type="number"
                                min="1"
                                max="90"
                                value={data.trial_days || ''}
                                disabled={!isTrial}
                                onChange={(e) => setData('trial_days', e.target.value ? parseInt(e.target.value, 10) : null)}
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.trial_days ? 'border-red-500' : 'border-gray-300'
                                    } ${!isTrial ? 'bg-gray-50 text-gray-400' : ''}`}
                                placeholder="14"
                            />
                            <p className="mt-1 text-xs text-gray-500">{t('adminPackagesCreatePage.fields.trialDaysHint')}</p>
                            {errors.trial_days && (
                                <p className="mt-1 text-sm text-red-600">{errors.trial_days}</p>
                            )}
                        </div>

                        {/* Checkboxes */}
                        <div className="md:col-span-2 space-y-4">
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={data.certificate_access}
                                    onChange={(e) => setData('certificate_access', e.target.checked)}
                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <label className="ms-2 text-sm font-medium text-gray-700">
                                    {t('adminPackagesCreatePage.fields.certificateAccess')}
                                </label>
                            </div>

                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={data.badge_access}
                                    onChange={(e) => setData('badge_access', e.target.checked)}
                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <label className="ms-2 text-sm font-medium text-gray-700">
                                    {t('adminPackagesCreatePage.fields.badgeAccess')}
                                </label>
                            </div>

                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={data.is_trial}
                                    onChange={(e) => {
                                        const checked = e.target.checked;
                                        setData('is_trial', checked);
                                        setData('price', checked ? 0 : data.price);
                                        setData('trial_days', checked ? (data.trial_days || 14) : null);
                                        setData('duration_type', checked ? 'monthly' : data.duration_type);
                                    }}
                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <label className="ms-2 text-sm font-medium text-gray-700">
                                    {t('adminPackagesCreatePage.fields.isTrial')}
                                </label>
                            </div>

                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={data.is_active}
                                    onChange={(e) => setData('is_active', e.target.checked)}
                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <label className="ms-2 text-sm font-medium text-gray-700">
                                    {t('adminPackagesCreatePage.fields.isActive')}
                                </label>
                            </div>

                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={data.is_popular}
                                    onChange={(e) => setData('is_popular', e.target.checked)}
                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <label className="ms-2 text-sm font-medium text-gray-700">
                                    {t('adminPackagesCreatePage.fields.isPopular')}
                                </label>
                            </div>
                        </div>

                        {/* Features Section */}
                        <div className="md:col-span-2">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('adminPackagesCreatePage.sections.featuresEn')}</h3>
                            <div className="space-y-3">
                                {features.map((feature, index) => (
                                    <div key={index} className="flex gap-2">
                                        <input
                                            type="text"
                                            value={feature}
                                            onChange={(e) => updateFeature(index, e.target.value, false)}
                                            placeholder={t('adminPackagesCreatePage.placeholders.featureNumber', { number: index + 1 })}
                                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeFeature(index, false)}
                                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
                                        >
                                            <FaTimes />
                                        </button>
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={() => addFeature(false)}
                                    className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 transition"
                                >
                                    {t('adminPackagesCreatePage.actions.addFeature')}
                                </button>
                            </div>
                        </div>

                        {/* Features AR Section */}
                        <div className="md:col-span-2">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('adminPackagesCreatePage.sections.featuresAr')}</h3>
                            <div className="space-y-3">
                                {featuresAr.map((feature, index) => (
                                    <div key={index} className="flex gap-2">
                                        <input
                                            type="text"
                                            value={feature}
                                            onChange={(e) => updateFeature(index, e.target.value, true)}
                                            placeholder={t('adminPackagesCreatePage.placeholders.featureNumber', { number: index + 1 })}
                                            dir="rtl"
                                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent "
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeFeature(index, true)}
                                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
                                        >
                                            <FaTimes />
                                        </button>
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={() => addFeature(true)}
                                    className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 transition"
                                >
                                    {t('adminPackagesCreatePage.actions.addFeature')}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-4 pt-6 border-t border-gray-200">
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-6 py-2 bg-[#A3C042] hover:bg-blue-700 text-white font-semibold rounded-lg flex items-center gap-2 disabled:opacity-50"
                        >
                            <FaSave />
                            {processing ? t('common.saving') : t('common.save')}
                        </button>
                        <Link
                            href={route('admin.packages.index')}
                            className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg flex items-center gap-2"
                        >
                            <FaTimes />
                            {t('common.cancel')}
                        </Link>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
}
