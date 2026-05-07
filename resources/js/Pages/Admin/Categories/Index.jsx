import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { FaSearch, FaPlus, FaEdit, FaTrash, FaTags } from 'react-icons/fa';
import { useConfirmDialog } from '@/Contexts/ConfirmContext';
import { useTranslation } from '@/i18n';

export default function AdminCategoriesIndex({ categories, filters = {} }) {
    const { confirm } = useConfirmDialog();
    const { t, language } = useTranslation();
    const [search, setSearch] = useState(filters?.search || '');
    const [status, setStatus] = useState(filters?.status || '');
    const [type, setType] = useState(filters?.type || '');

    const handleFilter = () => {
        router.get(route('admin.categories.index'), {
            search: search || undefined,
            status: status || undefined,
            type: type || undefined,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleDelete = async (categoryId, categoryName) => {
        const confirmed = await confirm({
            title: t('adminCategoriesPage.deleteConfirm.title'),
            message: t('adminCategoriesPage.deleteConfirm.message', { name: categoryName }),
            confirmText: t('common.delete'),
            cancelText: t('common.cancel'),
            variant: 'danger',
        });

        if (confirmed) {
            router.delete(route('admin.categories.destroy', categoryId), {
                preserveScroll: true,
            });
        }
    };

    const getStatusBadge = (isActive) => {
        if (isActive) {
            return (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {t('common.active')}
                </span>
            );
        }
        return (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                {t('common.inactive')}
            </span>
        );
    };

    const getTypeBadge = (type) => {
        const types = {
            project: { label: t('adminCategoriesPage.types.project'), class: 'bg-blue-100 text-blue-800' },
            challenge: { label: t('adminCategoriesPage.types.challenge'), class: 'bg-purple-100 text-purple-800' },
            publication: { label: t('adminCategoriesPage.types.publication'), class: 'bg-amber-100 text-amber-800' },
            other: { label: t('adminCategoriesPage.types.other'), class: 'bg-gray-100 text-gray-800' },
        };
        const typeConfig = types[type] || types.other;
        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${typeConfig.class}`}>
                {typeConfig.label}
            </span>
        );
    };

    return (
        <DashboardLayout>
            <Head title={t('adminCategoriesPage.pageTitle', { appName: t('common.appName') })} />

            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                {t('adminCategoriesPage.title')}
                            </h1>
                            <p className="mt-1 text-sm text-gray-600">
                                {t('adminCategoriesPage.subtitle')}
                            </p>
                        </div>
                        <Link
                            href={route('admin.categories.create')}
                            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            <FaPlus className="ml-2 -mr-1 h-4 w-4" />
                            {t('adminCategoriesPage.addNew')}
                        </Link>
                    </div>

                    <div className="bg-white shadow-sm rounded-lg border border-gray-200 mb-6">
                        <div className="p-4">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="md:col-span-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        {t('common.search')}
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleFilter()}
                                            placeholder={t('adminCategoriesPage.searchPlaceholder')}
                                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                                        />
                                        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        {t('adminCategoriesPage.filters.type')}
                                    </label>
                                    <select
                                        value={type}
                                        onChange={(e) => setType(e.target.value)}
                                        className="w-full py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                                    >
                                        <option value="">{t('common.all')}</option>
                                        <option value="project">{t('adminCategoriesPage.types.project')}</option>
                                        <option value="challenge">{t('adminCategoriesPage.types.challenge')}</option>
                                        <option value="publication">{t('adminCategoriesPage.types.publication')}</option>
                                        <option value="other">{t('adminCategoriesPage.types.other')}</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        {t('adminCategoriesPage.filters.status')}
                                    </label>
                                    <select
                                        value={status}
                                        onChange={(e) => setStatus(e.target.value)}
                                        className="w-full py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                                    >
                                        <option value="">{t('common.all')}</option>
                                        <option value="active">{t('common.active')}</option>
                                        <option value="inactive">{t('common.inactive')}</option>
                                    </select>
                                </div>

                                <div className="flex items-end">
                                    <button
                                        onClick={handleFilter}
                                        className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                    >
                                        {t('common.filter')}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
                        {categories.data.length === 0 ? (
                            <div className="p-12 text-center">
                                <FaTags className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                    {t('adminCategoriesPage.empty.title')}
                                </h3>
                                <p className="text-gray-500">
                                    {t('adminCategoriesPage.empty.message')}
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                {t('adminCategoriesPage.table.name')}
                                            </th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                {t('adminCategoriesPage.table.type')}
                                            </th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                {t('adminCategoriesPage.table.status')}
                                            </th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                {t('adminCategoriesPage.table.description')}
                                            </th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                {t('common.actions')}
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {categories.data.map((category) => (
                                            <tr key={category.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                                                            <FaTags className="h-5 w-5 text-indigo-600" />
                                                        </div>
                                                        <div className="mr-4">
                                                            <div className="text-sm font-medium text-gray-900">
                                                                {language === 'ar' ? category.name : category.name}
                                                            </div>
                                                            <div className="text-xs text-gray-500">
                                                                {category.slug}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {getTypeBadge(category.type)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {getStatusBadge(category.is_active)}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm text-gray-500 max-w-xs truncate">
                                                        {category.description || '-'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    <div className="flex items-center gap-2">
                                                        <Link
                                                            href={route('admin.categories.edit', category.id)}
                                                            className="text-indigo-600 hover:text-indigo-900 p-1"
                                                            title={t('common.edit')}
                                                        >
                                                            <FaEdit className="h-4 w-4" />
                                                        </Link>
                                                        <button
                                                            onClick={() => handleDelete(category.id, category.name)}
                                                            className="text-red-600 hover:text-red-900 p-1"
                                                            title={t('common.delete')}
                                                        >
                                                            <FaTrash className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {categories.data.length > 0 && categories.last_page > 1 && (
                            <div className="px-6 py-4 border-t border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div className="text-sm text-gray-700">
                                        {t('common.showing', { from: categories.from, to: categories.total, total: categories.total })}
                                    </div>
                                    <div className="flex gap-1">
                                        {categories.links.map((link, index) => (
                                            <Link
                                                key={index}
                                                href={link.url || '#'}
                                                className={`px-3 py-1 rounded text-sm ${
                                                    link.active
                                                        ? 'bg-indigo-600 text-white'
                                                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                                                } ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}