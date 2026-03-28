import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link } from '@inertiajs/react';
import { FaArrowRight, FaCheckCircle, FaClock, FaTimesCircle, FaDollarSign, FaCalendar, FaUser, FaBox } from 'react-icons/fa';
import { useTranslation } from '@/i18n';

export default function AdminSubscriptionsShowSubscription({ subscription }) {
    const { t, language } = useTranslation();

    const getStatusBadge = (status) => {
        const statusMap = {
            active: { bg: 'bg-green-100', text: 'text-green-800', label: t('adminSubscriptionShowPage.statuses.active'), icon: FaCheckCircle },
            expired: { bg: 'bg-gray-100', text: 'text-gray-800', label: t('adminSubscriptionShowPage.statuses.expired'), icon: FaClock },
            cancelled: { bg: 'bg-red-100', text: 'text-red-800', label: t('adminSubscriptionShowPage.statuses.cancelled'), icon: FaTimesCircle },
        };
        const statusConfig = statusMap[status] || { bg: 'bg-gray-100', text: 'text-gray-800', label: status, icon: FaCheckCircle };
        const Icon = statusConfig.icon;

        return (
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statusConfig.bg} ${statusConfig.text} flex items-center gap-2 w-fit`}>
                <Icon />
                {statusConfig.label}
            </span>
        );
    };

    const formatCurrency = (amount, currency = 'AED') => new Intl.NumberFormat(language === 'ar' ? 'ar-AE' : 'en-US', {
        style: 'currency',
        currency,
    }).format(amount);

    return (
        <DashboardLayout header={t('adminSubscriptionShowPage.title')}>
            <Head title={t('adminSubscriptionShowPage.pageTitle', { appName: t('common.appName') })} />

            <div className="mb-6">
                <Link
                    href={route('admin.subscriptions.index')}
                    className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
                >
                    <FaArrowRight className="transform rotate-180" />
                    {t('adminSubscriptionShowPage.backToSubscriptions')}
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <div className="flex justify-between items-start mb-4">
                            <h2 className="text-2xl font-bold text-gray-900">{t('adminSubscriptionShowPage.subscriptionInfoTitle')}</h2>
                            {getStatusBadge(subscription.status)}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-2">{t('adminSubscriptionShowPage.fields.startDate')}</label>
                                <div className="flex items-center gap-2 text-gray-900">
                                    <FaCalendar className="text-blue-500" />
                                    <span>{subscription.start_date}</span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-2">{t('adminSubscriptionShowPage.fields.endDate')}</label>
                                <div className="flex items-center gap-2 text-gray-900">
                                    <FaCalendar className="text-red-500" />
                                    <span>{subscription.end_date}</span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-2">{t('adminSubscriptionShowPage.fields.paidAmount')}</label>
                                <div className="flex items-center gap-2 text-gray-900">
                                    <FaDollarSign className="text-green-500" />
                                    <span className="font-bold text-green-600 text-lg">
                                        {formatCurrency(subscription.paid_amount, subscription.package.currency)}
                                    </span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-2">{t('adminSubscriptionShowPage.fields.autoRenew')}</label>
                                <div className="flex items-center gap-2">
                                    {subscription.auto_renew ? (
                                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                                            {t('adminSubscriptionShowPage.autoRenew.enabled')}
                                        </span>
                                    ) : (
                                        <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-semibold">
                                            {t('adminSubscriptionShowPage.autoRenew.disabled')}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">{t('adminSubscriptionShowPage.paymentInfoTitle')}</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-2">{t('adminSubscriptionShowPage.fields.paymentMethod')}</label>
                                <p className="text-gray-900">{subscription.payment_method || '—'}</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-2">{t('adminSubscriptionShowPage.fields.transactionId')}</label>
                                <p className="text-gray-900 font-mono">{subscription.transaction_id || '—'}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">{t('adminSubscriptionShowPage.userInfoTitle')}</h2>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <FaUser className="text-blue-500" />
                                <div>
                                    <p className="text-sm text-gray-600">{t('common.name')}</p>
                                    <p className="font-semibold text-gray-900">{subscription.user.name}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <FaUser className="text-gray-400" />
                                <div>
                                    <p className="text-sm text-gray-600">{t('common.email')}</p>
                                    <p className="font-semibold text-gray-900">{subscription.user.email}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">{t('adminSubscriptionShowPage.packageInfoTitle')}</h2>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <FaBox className="text-purple-500" />
                                <div>
                                    <p className="text-sm text-gray-600">{t('adminSubscriptionShowPage.fields.packageName')}</p>
                                    <p className="font-semibold text-gray-900">{subscription.package.name}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <FaDollarSign className="text-green-500" />
                                <div>
                                    <p className="text-sm text-gray-600">{t('adminSubscriptionShowPage.fields.originalPrice')}</p>
                                    <p className="font-semibold text-gray-900">
                                        {formatCurrency(subscription.package.price, subscription.package.currency)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">{t('adminSubscriptionShowPage.additionalInfoTitle')}</h2>
                        <div className="space-y-2 text-sm text-gray-600">
                            <p><strong>{t('adminSubscriptionShowPage.fields.createdAt')}:</strong> {subscription.created_at}</p>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
