import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState, useCallback } from 'react';
import {
    FaSearch,
    FaFilter,
    FaEdit,
    FaTrash,
    FaPlus,
    FaUserTag,
    FaCheckCircle,
    FaTimesCircle,
} from 'react-icons/fa';
import { useTranslation } from '@/i18n';

export default function CustomRolesIndex({ customRoles, baseRoles, filters, auth }) {
    const { t } = useTranslation();
    const [search, setSearch] = useState(filters?.search || '');
    const [baseRoleFilter, setBaseRoleFilter] = useState(filters?.base_role || 'all');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [roleToDelete, setRoleToDelete] = useState(null);

    const handleSearch = useCallback(() => {
        router.get(route('admin.custom-roles.index'), {
            search: search || undefined,
            base_role: baseRoleFilter !== 'all' ? baseRoleFilter : undefined,
        }, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
            only: ['customRoles', 'filters'],
        });
    }, [search, baseRoleFilter]);

    const handleDelete = useCallback((role) => {
        setRoleToDelete(role);
        setShowDeleteModal(true);
    }, []);

    const confirmDelete = useCallback(() => {
        if (roleToDelete) {
            router.delete(route('admin.custom-roles.destroy', roleToDelete.id), {
                preserveScroll: true,
                onSuccess: () => {
                    setShowDeleteModal(false);
                    setRoleToDelete(null);
                },
            });
        }
    }, [roleToDelete]);

    return (
        <DashboardLayout header={t('adminCustomRolesPage.index.header')} auth={auth}>
            <Head title={t('adminCustomRolesPage.index.pageTitle', { appName: t('common.appName') })} />

            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                <p className="text-sm text-gray-600">
                    {t('adminCustomRolesPage.index.description')}
                </p>
            </div>

            {/* Filters and Actions */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex flex-col md:flex-row gap-4 flex-1">
                        <div className="flex-1">
                            <div className="relative">
                                <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                    placeholder={t('adminCustomRolesPage.index.searchPlaceholder')}
                                    className="w-full ps-10 pe-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                        <div className="md:w-56">
                            <select
                                value={baseRoleFilter}
                                onChange={(e) => setBaseRoleFilter(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="all">{t('adminCustomRolesPage.index.allBaseRoles')}</option>
                                {baseRoles.map((role) => (
                                    <option key={role.value} value={role.value}>{role.label}</option>
                                ))}
                            </select>
                        </div>
                        <button
                            onClick={handleSearch}
                            className="px-6 py-2 bg-[#A3C042] hover:bg-blue-700 text-white font-semibold rounded-lg flex items-center justify-center gap-2"
                        >
                            <FaFilter />
                            {t('common.search')}
                        </button>
                    </div>
                    <Link
                        href={route('admin.custom-roles.create')}
                        className="px-6 py-2 bg-[#A3C042] hover:bg-blue-700 text-white font-semibold rounded-lg flex items-center justify-center gap-2"
                    >
                        <FaPlus />
                        {t('adminCustomRolesPage.index.addNew')}
                    </Link>
                </div>
            </div>

            {/* Roles Table */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">{t('adminCustomRolesPage.index.table.name')}</th>
                                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">{t('adminCustomRolesPage.index.table.identifier')}</th>
                                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">{t('adminCustomRolesPage.index.table.basedOn')}</th>
                                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">{t('adminCustomRolesPage.index.table.usersCount')}</th>
                                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">{t('common.status')}</th>
                                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">{t('common.actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {customRoles?.data?.length > 0 ? (
                                customRoles.data.map((role) => (
                                    <tr key={role.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <FaUserTag className="text-[#A3C042]" />
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">{role.name_ar}</div>
                                                    {role.name_en && <div className="text-xs text-gray-500">{role.name_en}</div>}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <code className="text-xs text-gray-500">{role.slug}</code>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                                                {role.base_role_label}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                            {role.users_count}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {role.is_active ? (
                                                <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700">
                                                    <FaCheckCircle /> {t('adminCustomRolesPage.index.activeStatus')}
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500">
                                                    <FaTimesCircle /> {t('adminCustomRolesPage.index.inactiveStatus')}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex items-center gap-3">
                                                <Link
                                                    href={route('admin.custom-roles.edit', role.id)}
                                                    className="text-blue-600 hover:text-blue-900"
                                                >
                                                    <FaEdit className="text-lg" />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(role)}
                                                    className="text-red-600 hover:text-red-900"
                                                >
                                                    <FaTrash className="text-lg" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                                        {t('adminCustomRolesPage.index.emptyState')}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {customRoles?.links && customRoles.links.length > 3 && (
                    <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm text-gray-700">
                                    {t('adminCustomRolesPage.index.pagination.showing')} <span className="font-medium">{customRoles.from}</span> {t('adminCustomRolesPage.index.pagination.to')}{' '}
                                    <span className="font-medium">{customRoles.to}</span> {t('adminCustomRolesPage.index.pagination.ofTotal')}{' '}
                                    <span className="font-medium">{customRoles.total}</span> {t('adminCustomRolesPage.index.pagination.results')}
                                </p>
                            </div>
                            <div>
                                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                    {customRoles.links.map((link, index) => (
                                        <Link
                                            key={index}
                                            href={link.url || '#'}
                                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${link.active
                                                ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                                } ${index === 0 ? 'rounded-r-md' : index === customRoles.links.length - 1 ? 'rounded-l-md' : ''}`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ))}
                                </nav>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Delete Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                        <div className="mt-3 text-center">
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                                <FaTrash className="h-6 w-6 text-red-600" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mt-5">{t('adminCustomRolesPage.index.deleteModal.title')}</h3>
                            <div className="mt-2 px-7 py-3">
                                <p className="text-sm text-gray-500">
                                    {t('adminCustomRolesPage.index.deleteModal.message', { name: roleToDelete?.name_ar })}
                                </p>
                            </div>
                            <div className="items-center px-4 py-3 flex gap-3 justify-center">
                                <button
                                    onClick={confirmDelete}
                                    className="px-4 py-2 bg-red-600 text-white text-base font-medium rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                                >
                                    {t('common.delete')}
                                </button>
                                <button
                                    onClick={() => {
                                        setShowDeleteModal(false);
                                        setRoleToDelete(null);
                                    }}
                                    className="px-4 py-2 bg-gray-200 text-gray-800 text-base font-medium rounded-md shadow-sm hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
                                >
                                    {t('common.cancel')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
