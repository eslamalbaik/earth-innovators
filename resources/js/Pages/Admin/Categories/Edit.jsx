import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { FaSave, FaArrowRight } from 'react-icons/fa';
import { useTranslation } from '@/i18n';

export default function AdminCategoriesEdit({ category }) {
    const { t, language } = useTranslation();
    
    const { data, setData, put, processing, errors } = useForm({
        name: category.name || '',
        description: category.description || '',
        type: category.type || 'project',
        is_active: category.is_active ?? true,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('admin.categories.update', category.id), {
            preserveScroll: true,
        });
    };

    return (
        <DashboardLayout>
            <Head title={t('adminCategoriesPage.editPageTitle', { appName: t('common.appName') })} />

            <div className="py-6">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-6">
                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                            <a href={route('admin.categories.index')} className="hover:text-indigo-600">
                                {t('adminCategoriesPage.listTitle')}
                            </a>
                            <FaArrowRight className="h-3 w-3" />
                            <span className="text-gray-900">{t('adminCategoriesPage.editTitle')}</span>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            {t('adminCategoriesPage.editTitle')}
                        </h1>
                        <p className="mt-1 text-sm text-gray-600">
                            {t('adminCategoriesPage.editSubtitle')}
                        </p>
                    </div>

                    <div className="bg-white shadow-sm rounded-lg border border-gray-200">
                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {t('adminCategoriesPage.form.name')} <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
                                    placeholder={t('adminCategoriesPage.form.namePlaceholder')}
                                />
                                {errors.name && (
                                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {t('adminCategoriesPage.form.description')}
                                </label>
                                <textarea
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    rows={4}
                                    className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${errors.description ? 'border-red-500' : 'border-gray-300'}`}
                                    placeholder={t('adminCategoriesPage.form.descriptionPlaceholder')}
                                />
                                {errors.description && (
                                    <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {t('adminCategoriesPage.form.type')} <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={data.type}
                                    onChange={(e) => setData('type', e.target.value)}
                                    className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${errors.type ? 'border-red-500' : 'border-gray-300'}`}
                                >
                                    <option value="project">{t('adminCategoriesPage.types.project')}</option>
                                    <option value="challenge">{t('adminCategoriesPage.types.challenge')}</option>
                                    <option value="publication">{t('adminCategoriesPage.types.publication')}</option>
                                    <option value="other">{t('adminCategoriesPage.types.other')}</option>
                                </select>
                                {errors.type && (
                                    <p className="mt-1 text-sm text-red-600">{errors.type}</p>
                                )}
                            </div>

                            <div>
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={data.is_active}
                                        onChange={(e) => setData('is_active', e.target.checked)}
                                        className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                    />
                                    <span className="mr-2 text-sm text-gray-700">
                                        {t('adminCategoriesPage.form.isActive')}
                                    </span>
                                </label>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                                <a
                                    href={route('admin.categories.index')}
                                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    {t('common.cancel')}
                                </a>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                                >
                                    <FaSave className="ml-2 -mr-1 h-4 w-4" />
                                    {processing ? t('common.saving') : t('common.save')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}