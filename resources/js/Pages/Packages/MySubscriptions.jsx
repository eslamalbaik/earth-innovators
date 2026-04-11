import { Head, router } from '@inertiajs/react';
import MobileAppLayout from '@/Layouts/MobileAppLayout';
import MobileTopBar from '@/Components/Mobile/MobileTopBar';
import MobileBottomNav from '@/Components/Mobile/MobileBottomNav';
import { useState } from 'react';
import {
    FaCheckCircle,
    FaTimesCircle,
    FaClock,
    FaCalendar,
    FaCreditCard,
    FaBox,
    FaSpinner,
    FaTrash,
} from 'react-icons/fa';
import { useToast } from '@/Contexts/ToastContext';
import { useConfirmDialog } from '@/Contexts/ConfirmContext';
import { toHijriDate } from '@/utils/dateUtils';
import { useTranslation } from '@/i18n';

export default function MySubscriptions({ auth, subscriptions = [], membershipSummary = null }) {
    const { t, language } = useTranslation();
    const { showSuccess, showError } = useToast();
    const { confirm } = useConfirmDialog();
    const [cancellingId, setCancellingId] = useState(null);

    const getStatusBadge = (status) => {
        const badges = {
            active: { bg: 'bg-green-100', text: 'text-green-700', label: t('mySubscriptionsPage.status.active'), icon: FaCheckCircle },
            pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: t('mySubscriptionsPage.status.pending'), icon: FaClock },
            expired: { bg: 'bg-red-100', text: 'text-red-700', label: t('mySubscriptionsPage.status.expired'), icon: FaTimesCircle },
            cancelled: { bg: 'bg-gray-100', text: 'text-gray-700', label: t('mySubscriptionsPage.status.cancelled'), icon: FaTimesCircle },
        };
        return badges[status] || badges.cancelled;
    };

    const handleCancelSubscription = async (subscriptionId) => {
        const confirmed = await confirm({
            title: t('mySubscriptionsPage.confirm.cancelTitle'),
            message: t('mySubscriptionsPage.confirm.cancelMessage'),
            confirmText: t('mySubscriptionsPage.actions.cancelSubscription'),
            cancelText: t('common.cancel'),
            variant: 'danger',
        });

        if (!confirmed) return;

        setCancellingId(subscriptionId);
        try {
            router.post(`/packages/subscriptions/${subscriptionId}/cancel`, {}, {
                preserveScroll: true,
                onSuccess: () => {
                    showSuccess(t('mySubscriptionsPage.toasts.cancelSuccess'));
                    setCancellingId(null);
                },
                onError: (errors) => {
                    setCancellingId(null);
                    const errorMessage = errors.error || Object.values(errors)[0] || t('mySubscriptionsPage.toasts.cancelError');
                    showError(Array.isArray(errorMessage) ? errorMessage[0] : errorMessage);
                },
            });
        } catch (error) {
            setCancellingId(null);
            showError(t('mySubscriptionsPage.toasts.cancelError'));
        }
    };

    const SubscriptionsContent = () => (
        <div className="space-y-4">
            <div className="mb-4">
                <h1 className="text-lg font-extrabold text-gray-900 mb-2">{t('mySubscriptionsPage.title')}</h1>
                <p className="text-sm text-gray-600">{t('mySubscriptionsPage.subtitle')}</p>
            </div>

            {membershipSummary?.is_school_owned && membershipSummary?.subscription && (
                <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
                    <h3 className="text-sm font-bold text-blue-900">{t('mySubscriptionsPage.managedBySchool.title')}</h3>
                    <p className="mt-2 text-xs text-blue-800">
                        {t('mySubscriptionsPage.managedBySchool.description', {
                            school: membershipSummary.owner_name,
                            package: membershipSummary.subscription.package_name,
                        })}
                    </p>
                </div>
            )}

            {subscriptions.length > 0 ? (
                <div className="space-y-4">
                    {subscriptions.map((subscription) => {
                        const isActive = subscription.status === 'active';
                        const statusBadge = getStatusBadge(subscription.status);
                        const StatusIcon = statusBadge.icon;
                        const canCancel = subscription.status === 'active' || subscription.status === 'pending';
                        const isCancelling = cancellingId === subscription.id;

                        return (
                            <div
                                key={subscription.id}
                                className={`bg-white rounded-2xl border-2 p-4 ${isActive ? 'border-green-300 bg-green-50' : 'border-gray-200'}`}
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <FaBox className="text-gray-400 text-sm" />
                                            <h3 className="text-sm font-bold text-gray-900">
                                                {language === 'ar'
                                                    ? (subscription.package?.name_ar || subscription.package?.name || t('common.notAvailable'))
                                                    : (subscription.package?.name || subscription.package?.name_ar || t('common.notAvailable'))}
                                            </h3>
                                            {subscription.is_trial && (
                                                <span className="rounded-full bg-emerald-100 px-2 py-1 text-[11px] font-bold text-emerald-700">
                                                    {t('mySubscriptionsPage.labels.trial')}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-4 text-xs text-gray-600 mb-2">
                                            <div className="flex items-center gap-1">
                                                <FaCalendar className="text-gray-400" />
                                                <span>{t('mySubscriptionsPage.labels.from')}: {toHijriDate(subscription.start_date)}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <FaCalendar className="text-gray-400" />
                                                <span>{t('mySubscriptionsPage.labels.to')}: {toHijriDate(subscription.end_date)}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 text-xs text-gray-600">
                                            <div className="flex items-center gap-1">
                                                <FaCreditCard className="text-gray-400" />
                                                <span>
                                                    {subscription.is_trial
                                                        ? t('mySubscriptionsPage.labels.free')
                                                        : `${subscription.paid_amount} ${subscription.package?.currency}`}
                                                </span>
                                            </div>
                                            {subscription.transaction_id && (
                                                <span className="text-gray-500">
                                                    {t('mySubscriptionsPage.labels.transactionId')}: {subscription.transaction_id}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${statusBadge.bg} ${statusBadge.text}`}>
                                        <StatusIcon className="text-[10px]" />
                                        {statusBadge.label}
                                    </span>
                                </div>

                                {canCancel && (
                                    <div className="pt-3 border-t border-gray-200">
                                        <button
                                            onClick={() => handleCancelSubscription(subscription.id)}
                                            disabled={isCancelling}
                                            className={`w-full px-4 py-2 rounded-xl transition text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${subscription.status === 'pending'
                                                ? 'bg-yellow-50 text-yellow-800 hover:bg-yellow-100'
                                                : 'bg-red-50 text-red-700 hover:bg-red-100'
                                                }`}
                                        >
                                            {isCancelling ? (
                                                <>
                                                    <FaSpinner className="animate-spin" />
                                                    {t('mySubscriptionsPage.actions.cancelling')}
                                                </>
                                            ) : (
                                                <>
                                                    <FaTrash />
                                                    {t('mySubscriptionsPage.actions.cancelSubscription')}
                                                </>
                                            )}
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                    <FaBox className="mx-auto text-4xl text-gray-300 mb-3" />
                    <p className="text-sm text-gray-500 mb-4">{t('mySubscriptionsPage.empty')}</p>
                    <button
                        onClick={() => router.visit('/packages')}
                        className="px-4 py-2 bg-[#A3C042] text-white rounded-xl hover:bg-[#8CA635] transition text-sm font-semibold"
                    >
                        {t('mySubscriptionsPage.actions.browsePackages')}
                    </button>
                </div>
            )}

            <div className="pt-4">
                <button
                    onClick={() => router.visit('/packages')}
                    className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition text-sm font-semibold"
                >
                    {t('mySubscriptionsPage.actions.backToPackages')}
                </button>
            </div>
        </div>
    );

    return (
        <div dir={language === 'ar' ? 'rtl' : 'ltr'} className="min-h-screen bg-gray-50">
            <Head title={t('mySubscriptionsPage.pageTitle', { appName: t('common.appName') })} />

            <div className="block md:hidden">
                <MobileAppLayout
                    auth={auth}
                    title={t('mySubscriptionsPage.title')}
                    activeNav="packages"
                    unreadCount={auth?.unreadCount || 0}
                    onNotifications={() => router.visit('/notifications')}
                    onBack={() => router.visit('/packages')}
                >
                    <SubscriptionsContent />
                </MobileAppLayout>
            </div>

            <div className="hidden md:block">
                <MobileTopBar
                    title={t('mySubscriptionsPage.title')}
                    unreadCount={auth?.unreadCount || 0}
                    onNotifications={() => router.visit('/notifications')}
                    onBack={() => router.visit('/packages')}
                    auth={auth}
                />
                <main className="mx-auto w-full max-w-6xl px-4 pb-24 pt-4">
                    <div className="mx-auto w-full max-w-3xl">
                        <SubscriptionsContent />
                    </div>
                </main>
                <MobileBottomNav active="packages" role={auth?.user?.role} isAuthed={!!auth?.user} user={auth?.user} />
            </div>
        </div>
    );
}
