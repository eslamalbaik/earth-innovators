import DashboardLayout from '@/Layouts/DashboardLayout';
import { useConfirmDialog } from '@/Contexts/ConfirmContext';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { FaArrowRight, FaUsers, FaCalendar, FaCheckCircle, FaClock, FaTimesCircle, FaSearch, FaSync, FaBan, FaEdit } from 'react-icons/fa';
import { useTranslation } from '@/i18n';

export default function AdminPackagesSubscribers({ package: pkg, subscribers, filters = {} }) {
    const { confirm } = useConfirmDialog();
    const { t } = useTranslation();
    const [search, setSearch] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || '');

    const handleSearch = () => {
        router.get(route('admin.packages.subscribers', pkg.id), {
            search: search,
            status: statusFilter,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleStatusChange = async (subscriberId, newStatus) => {
        const confirmed = await confirm({
            title: t('adminPackagesSubscribersPage.confirm.changeStatusTitle'),
            message: t('adminPackagesSubscribersPage.confirm.changeStatusMessage', { status: t(`adminPackagesSubscribersPage.status.${newStatus}`) }),
            confirmText: t('adminPackagesSubscribersPage.actions.change'),
            cancelText: t('common.cancel'),
            variant: 'info',
        });

        if (confirmed) {
            router.post(route('admin.packages.subscribers.update-status', subscriberId), {
                status: newStatus,
            }, {
                preserveScroll: true,
                onSuccess: () => {
                    // Success handled by Inertia
                },
                onError: (errors) => {
                    alert(t('adminPackagesSubscribersPage.errors.updateStatusFailed'));
                },
            });
        }
    };

    const handleCancelSubscription = async (subscriberId) => {
        const confirmed = await confirm({
            title: t('adminPackagesSubscribersPage.confirm.cancelTitle'),
            message: t('adminPackagesSubscribersPage.confirm.cancelMessage'),
            confirmText: t('adminPackagesSubscribersPage.actions.cancel'),
            cancelText: t('common.cancel'),
            variant: 'warning',
        });

        if (confirmed) {
            router.post(route('admin.packages.subscribers.cancel', subscriberId), {}, {
                preserveScroll: true,
                onSuccess: () => {
                    // Success handled by Inertia
                },
                onError: (errors) => {
                    alert(t('adminPackagesSubscribersPage.errors.cancelFailed'));
                },
            });
        }
    };

    const handleRenewSubscription = (subscriberId) => {
        const months = prompt(t('adminPackagesSubscribersPage.prompts.renewMonths'), '1');
        if (months && parseInt(months) > 0) {
            router.post(route('admin.packages.subscribers.renew', subscriberId), {
                months: parseInt(months),
            }, {
                preserveScroll: true,
                onSuccess: () => {
                    // Success handled by Inertia
                },
                onError: (errors) => {
                    alert(t('adminPackagesSubscribersPage.errors.renewFailed'));
                },
            });
        }
    };

    const getStatusBadge = (status) => {
        const statusMap = {
            active: { bg: 'bg-green-100', text: 'text-green-800', label: t('adminPackagesSubscribersPage.status.active'), icon: FaCheckCircle },
            expired: { bg: 'bg-gray-100', text: 'text-gray-800', label: t('adminPackagesSubscribersPage.status.expired'), icon: FaClock },
            cancelled: { bg: 'bg-red-100', text: 'text-red-800', label: t('adminPackagesSubscribersPage.status.cancelled'), icon: FaTimesCircle },
        };
        const statusConfig = statusMap[status] || { bg: 'bg-gray-100', text: 'text-gray-800', label: status, icon: FaCheckCircle };
        const Icon = statusConfig.icon;
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusConfig.bg} ${statusConfig.text} flex items-center gap-1`}>
                <Icon className="text-xs" />
                {statusConfig.label}
            </span>
        );
    };

    return (
        <DashboardLayout header={t('adminPackagesSubscribersPage.title', { name: pkg.name_ar || pkg.name })}>
            <Head title={t('adminPackagesSubscribersPage.pageTitle', { name: pkg.name_ar || pkg.name, appName: t('common.appName') })} />

            <div className="mb-6">
                <Link
                    href={route('admin.packages.index')}
                    className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
                >
                    <FaArrowRight className="transform rotate-180" />
                    {t('adminPackagesSubscribersPage.actions.backToPackages')}
                </Link>
            </div>

            {/* Package Info */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{pkg.name_ar || pkg.name}</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <p className="text-sm text-gray-600">{t('adminPackagesSubscribersPage.packageInfo.price')}</p>
                        <p className="text-lg font-semibold text-gray-900">{pkg.price} {pkg.currency}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">{t('adminPackagesSubscribersPage.packageInfo.duration')}</p>
                        <p className="text-lg font-semibold text-gray-900">
                            {t(`packagesIndexPage.duration.${pkg.duration_type || 'monthly'}`)}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">{t('adminPackagesSubscribersPage.packageInfo.totalSubscribers')}</p>
                        <p className="text-lg font-semibold text-gray-900">{subscribers.total || 0}</p>
                    </div>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                        <div className="relative">
                            <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                placeholder={t('adminPackagesSubscribersPage.placeholders.search')}
                                className="w-full ps-10 pe-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>
                    <div>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="">{t('adminPackagesSubscribersPage.filters.allStatuses')}</option>
                            <option value="active">{t('adminPackagesSubscribersPage.status.active')}</option>
                            <option value="expired">{t('adminPackagesSubscribersPage.status.expired')}</option>
                            <option value="cancelled">{t('adminPackagesSubscribersPage.status.cancelled')}</option>
                        </select>
                    </div>
                    <div className="md:col-span-3 flex justify-end">
                        <button
                            onClick={handleSearch}
                            className="px-6 py-2 bg-[#A3C042] hover:bg-blue-700 text-white font-semibold rounded-lg flex items-center gap-2"
                        >
                            <FaSearch />
                            {t('common.search')}
                        </button>
                    </div>
                </div>
            </div>

            {/* Subscribers Table */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className=" py-4 px-6 text-sm font-semibold text-gray-700">{t('adminPackagesSubscribersPage.table.user')}</th>
                                <th className=" py-4 px-6 text-sm font-semibold text-gray-700">{t('adminPackagesSubscribersPage.table.startDate')}</th>
                                <th className=" py-4 px-6 text-sm font-semibold text-gray-700">{t('adminPackagesSubscribersPage.table.endDate')}</th>
                                <th className=" py-4 px-6 text-sm font-semibold text-gray-700">{t('adminPackagesSubscribersPage.table.status')}</th>
                                <th className=" py-4 px-6 text-sm font-semibold text-gray-700">{t('adminPackagesSubscribersPage.table.paidAmount')}</th>
                                <th className=" py-4 px-6 text-sm font-semibold text-gray-700">{t('adminPackagesSubscribersPage.table.subscribedAt')}</th>
                                <th className=" py-4 px-6 text-sm font-semibold text-gray-700">{t('common.actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {subscribers.data && subscribers.data.length > 0 ? (
                                subscribers.data.map((subscriber) => (
                                    <tr key={subscriber.id} className="hover:bg-gray-50">
                                        <td className="py-4 px-6">
                                            <div>
                                                <p className="font-medium text-gray-900">{subscriber.user?.name || t('common.notAvailable')}</p>
                                                <p className="text-sm text-gray-500">{subscriber.user?.email || '—'}</p>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-sm text-gray-700">
                                            <div className="flex items-center gap-2">
                                                <FaCalendar className="text-blue-500" />
                                                {subscriber.start_date}
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-sm text-gray-700">
                                            <div className="flex items-center gap-2">
                                                <FaCalendar className="text-red-500" />
                                                {subscriber.end_date}
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">{getStatusBadge(subscriber.status)}</td>
                                        <td className="py-4 px-6 text-sm text-gray-700">
                                            {subscriber.paid_amount ? `${subscriber.paid_amount} ${pkg.currency}` : '—'}
                                        </td>
                                        <td className="py-4 px-6 text-sm text-gray-700">{subscriber.created_at}</td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-2">
                                                {subscriber.status === 'active' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleRenewSubscription(subscriber.id)}
                                                            className="px-3 py-1 bg-[#A3C042] hover:bg-[#8CA635] text-white rounded text-xs font-semibold flex items-center gap-1"
                                                            title={t('adminPackagesSubscribersPage.actions.renew')}
                                                        >
                                                            <FaSync />
                                                            {t('adminPackagesSubscribersPage.actions.renew')}
                                                        </button>
                                                        <button
                                                            onClick={() => handleCancelSubscription(subscriber.id)}
                                                            className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-semibold flex items-center gap-1"
                                                            title={t('adminPackagesSubscribersPage.actions.cancel')}
                                                        >
                                                            <FaBan />
                                                            {t('adminPackagesSubscribersPage.actions.cancel')}
                                                        </button>
                                                    </>
                                                )}
                                                <select
                                                    value={subscriber.status}
                                                    onChange={(e) => handleStatusChange(subscriber.id, e.target.value)}
                                                    className="px-2 py-1 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-blue-500"
                                                >
                                                    <option value="active">{t('adminPackagesSubscribersPage.status.active')}</option>
                                                    <option value="expired">{t('adminPackagesSubscribersPage.status.expired')}</option>
                                                    <option value="cancelled">{t('adminPackagesSubscribersPage.status.cancelled')}</option>
                                                </select>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="py-12 text-center text-gray-500">
                                        <FaUsers className="mx-auto text-4xl text-gray-300 mb-2" />
                                        {t('adminPackagesSubscribersPage.empty')}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {subscribers.links && subscribers.links.length > 3 && (
                    <div className="px-6 py-4 border-t border-gray-200">
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-700">
                                {t('adminPackagesSubscribersPage.pagination.showing', { from: subscribers.from, to: subscribers.to, total: subscribers.total })}
                            </div>
                            <div className="flex gap-2">
                                {subscribers.links.map((link, index) => (
                                    <Link
                                        key={index}
                                        href={link.url || '#'}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium ${link.active
                                            ? 'bg-[#A3C042] text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
