import DashboardLayout from '@/Layouts/DashboardLayout';
import { useTranslation } from '@/i18n';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import {
    FaSearch,
    FaFilter,
    FaEdit,
    FaTrash,
    FaPlus,
    FaCertificate,
    FaDownload,
    FaToggleOn,
    FaToggleOff,
    FaUser,
} from 'react-icons/fa';
import { useConfirmDialog } from '@/Contexts/ConfirmContext';

const certificateTypeKeyMap = {
    student: 'student',
    teacher: 'teacher',
    school: 'school',
    achievement: 'achievement',
    membership: 'membership',
};

export default function AdminCertificatesIndex({ certificates, stats, users, filters = {}, certificateSystemHealth = null }) {
    const { t, language } = useTranslation();
    const { confirm } = useConfirmDialog();
    const [search, setSearch] = useState(filters?.search || '');
    const [type, setType] = useState(filters?.type || 'all');
    const [status, setStatus] = useState(filters?.status || 'all');
    const [userId, setUserId] = useState(filters?.user_id || '');

    const handleFilter = () => {
        router.get(route('admin.certificates.index'), {
            search: search || undefined,
            type: type !== 'all' ? type : undefined,
            status: status !== 'all' ? status : undefined,
            user_id: userId || undefined,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleDelete = async (certificateId, certificateNumber) => {
        const confirmed = await confirm({
            title: t('adminCertificatesPage.deleteConfirm.title'),
            message: t('adminCertificatesPage.deleteConfirm.message', { certificateNumber }),
            confirmText: t('adminCertificatesPage.deleteConfirm.confirmText'),
            cancelText: t('common.cancel'),
            variant: 'danger',
        });

        if (confirmed) {
            router.delete(route('admin.certificates.destroy', certificateId), {
                preserveScroll: true,
            });
        }
    };

    const handleToggleStatus = (certificateId) => {
        router.post(route('admin.certificates.toggle-status', certificateId), {}, {
            preserveScroll: true,
        });
    };

    const getTypeLabel = (certificateType) => {
        const typeKey = certificateTypeKeyMap[certificateType];
        return typeKey ? t(`adminCertificatesPage.types.${typeKey}`) : certificateType;
    };

    const getCertificateTitle = (certificate) => (
        language === 'ar'
            ? (certificate.title_ar || certificate.title)
            : (certificate.title || certificate.title_ar)
    );

    const formatDate = (date) => new Date(date).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US');

    const getStatusBadge = (isActive) => {
        if (isActive) {
            return (
                <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                    {t('adminCertificatesPage.statuses.active')}
                </span>
            );
        }

        return (
            <span className="px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">
                {t('adminCertificatesPage.statuses.inactive')}
            </span>
        );
    };

    const summaryText = t('adminCertificatesPage.summary', {
        from: certificates.from || 0,
        to: certificates.to || 0,
        total: certificates.total || 0,
    });

    const pageTitle = t('adminCertificatesPage.pageTitle', {
        appName: t('common.appName'),
    });

    return (
        <DashboardLayout header={t('adminCertificatesPage.title')}>
            <Head title={pageTitle} />

            <div className="space-y-6">
                {certificateSystemHealth && !certificateSystemHealth.ready && (
                    <div className="rounded-xl border border-amber-300 bg-amber-50 p-4">
                        <div className="text-sm font-bold text-amber-900">
                            {t('adminCertificatesPage.systemHealth.title')}
                        </div>
                        <div className="mt-1 text-sm text-amber-800">
                            {t('adminCertificatesPage.systemHealth.description')}
                        </div>
                        <ul className="mt-3 list-disc space-y-1 ps-5 text-sm text-amber-900">
                            {certificateSystemHealth.issues?.map((issue) => (
                                <li key={issue}>{t(`adminCertificatesPage.systemHealth.issues.${issue}`)}</li>
                            ))}
                        </ul>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm">{t('adminCertificatesPage.stats.total')}</p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total || 0}</p>
                            </div>
                            <FaCertificate className="text-4xl text-blue-500" />
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm">{t('adminCertificatesPage.stats.active')}</p>
                                <p className="text-3xl font-bold text-green-600 mt-2">{stats.active || 0}</p>
                            </div>
                            <FaToggleOn className="text-4xl text-green-500" />
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm">{t('adminCertificatesPage.stats.inactive')}</p>
                                <p className="text-3xl font-bold text-gray-600 mt-2">{stats.inactive || 0}</p>
                            </div>
                            <FaToggleOff className="text-4xl text-gray-500" />
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm">{t('adminCertificatesPage.stats.types')}</p>
                                <p className="text-3xl font-bold text-purple-600 mt-2">{Object.keys(stats.by_type || {}).length}</p>
                            </div>
                            <FaCertificate className="text-4xl text-purple-500" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex flex-col md:flex-row gap-4 mb-4">
                        <div className="flex-1">
                            <div className="relative">
                                <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder={t('adminCertificatesPage.filters.searchPlaceholder')}
                                    className="w-full ps-10 pe-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        <select
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="all">{t('adminCertificatesPage.filters.allTypes')}</option>
                            {Object.entries(certificateTypeKeyMap).map(([value, key]) => (
                                <option key={value} value={value}>
                                    {t(`adminCertificatesPage.types.${key}`)}
                                </option>
                            ))}
                        </select>

                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="all">{t('adminCertificatesPage.filters.allStatuses')}</option>
                            <option value="active">{t('adminCertificatesPage.statuses.active')}</option>
                            <option value="inactive">{t('adminCertificatesPage.statuses.inactive')}</option>
                        </select>

                        <select
                            value={userId}
                            onChange={(e) => setUserId(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="">{t('adminCertificatesPage.filters.allUsers')}</option>
                            {users.map((user) => (
                                <option key={user.id} value={user.id}>
                                    {user.name} ({user.email})
                                </option>
                            ))}
                        </select>

                        <button
                            onClick={handleFilter}
                            className="px-6 py-2 bg-[#A3C042] text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                        >
                            <FaFilter />
                            {t('adminCertificatesPage.filters.apply')}
                        </button>
                    </div>

                    <div className="flex justify-between items-center">
                        <div className="text-sm text-gray-600">{summaryText}</div>
                        <Link
                            href={route('admin.certificates.create')}
                            className="px-4 py-2 bg-[#A3C042] text-white rounded-lg hover:bg-[#8CA635] flex items-center gap-2"
                        >
                            <FaPlus />
                            {t('adminCertificatesPage.actions.addNew')}
                        </Link>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        {t('adminCertificatesPage.table.certificateNumber')}
                                    </th>
                                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        {t('adminCertificatesPage.table.user')}
                                    </th>
                                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        {t('adminCertificatesPage.table.title')}
                                    </th>
                                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        {t('adminCertificatesPage.table.type')}
                                    </th>
                                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        {t('adminCertificatesPage.table.issueDate')}
                                    </th>
                                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        {t('adminCertificatesPage.table.status')}
                                    </th>
                                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        {t('adminCertificatesPage.table.actions')}
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {certificates.data && certificates.data.length > 0 ? (
                                    certificates.data.map((certificate) => (
                                        <tr key={certificate.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {certificate.certificate_number}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <FaUser className="text-gray-400 ms-2" />
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {certificate.user?.name || t('adminCertificatesPage.table.unknownUser')}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {certificate.user?.email || ''}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-900">
                                                    {getCertificateTitle(certificate)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                                    {getTypeLabel(certificate.type)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {formatDate(certificate.issue_date)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {getStatusBadge(certificate.is_active)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex items-center gap-2">
                                                    {certificate.file_path && (
                                                        <Link
                                                            href={route('admin.certificates.download', certificate.id)}
                                                            className="text-blue-600 hover:text-blue-900"
                                                            title={t('common.download')}
                                                        >
                                                            <FaDownload />
                                                        </Link>
                                                    )}
                                                    <Link
                                                        href={route('admin.certificates.edit', certificate.id)}
                                                        className="text-green-600 hover:text-green-900"
                                                        title={t('common.edit')}
                                                    >
                                                        <FaEdit />
                                                    </Link>
                                                    <button
                                                        onClick={() => handleToggleStatus(certificate.id)}
                                                        className={`${certificate.is_active ? 'text-yellow-600 hover:text-yellow-900' : 'text-gray-600 hover:text-gray-900'}`}
                                                        title={certificate.is_active
                                                            ? t('adminCertificatesPage.actions.deactivate')
                                                            : t('adminCertificatesPage.actions.activate')}
                                                    >
                                                        {certificate.is_active ? <FaToggleOn /> : <FaToggleOff />}
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(certificate.id, certificate.certificate_number)}
                                                        className="text-red-600 hover:text-red-900"
                                                        title={t('common.delete')}
                                                    >
                                                        <FaTrash />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                                            {t('adminCertificatesPage.table.empty')}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {certificates.links && certificates.links.length > 3 && (
                        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                            <div className="text-sm text-gray-700">{summaryText}</div>
                            <div className="flex gap-2">
                                {certificates.links.map((link, index) => (
                                    <Link
                                        key={index}
                                        href={link.url || '#'}
                                        className={`px-3 py-2 rounded-lg ${link.active
                                            ? 'bg-[#A3C042] text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            } ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
