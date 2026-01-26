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
    FaTrash
} from 'react-icons/fa';
import { useToast } from '@/Contexts/ToastContext';
import { useConfirmDialog } from '@/Contexts/ConfirmContext';
import { toHijriDate } from '@/utils/dateUtils';

export default function MySubscriptions({ auth, subscriptions = [] }) {
    const { showSuccess, showError } = useToast();
    const { confirm } = useConfirmDialog();
    const [cancellingId, setCancellingId] = useState(null);

    const getStatusBadge = (status) => {
        const badges = {
            active: { bg: 'bg-green-100', text: 'text-green-700', label: 'نشط', icon: FaCheckCircle },
            pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'قيد المعالجة', icon: FaClock },
            expired: { bg: 'bg-red-100', text: 'text-red-700', label: 'منتهي', icon: FaTimesCircle },
            cancelled: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'ملغى', icon: FaTimesCircle },
        };
        return badges[status] || badges.cancelled;
    };

    const handleCancelSubscription = async (subscriptionId) => {
        const confirmed = await confirm({
            title: 'تأكيد الإلغاء',
            message: 'هل أنت متأكد من إلغاء هذا الاشتراك؟ لن تتمكن من استخدام ميزات الباقة بعد الإلغاء.',
            confirmText: 'إلغاء الاشتراك',
            cancelText: 'تراجع',
            variant: 'danger',
        });

        if (!confirmed) return;

        setCancellingId(subscriptionId);
        try {
            router.post(`/packages/subscriptions/${subscriptionId}/cancel`, {}, {
                preserveScroll: true,
                onSuccess: () => {
                    showSuccess('تم إلغاء الاشتراك بنجاح');
                    setCancellingId(null);
                },
                onError: (errors) => {
                    setCancellingId(null);
                    const errorMessage = errors.error || Object.values(errors)[0] || 'حدث خطأ أثناء إلغاء الاشتراك';
                    showError(Array.isArray(errorMessage) ? errorMessage[0] : errorMessage);
                },
            });
        } catch (error) {
            setCancellingId(null);
            showError('حدث خطأ أثناء إلغاء الاشتراك');
        }
    };

    const SubscriptionsContent = () => (
        <div className="space-y-4">
            {/* Header */}
            <div className="mb-4">
                <h1 className="text-lg font-extrabold text-gray-900 mb-2">اشتراكاتي</h1>
                <p className="text-sm text-gray-600">
                    عرض وإدارة جميع اشتراكاتك في الباقات
                </p>
            </div>

            {/* Subscriptions List */}
            {subscriptions.length > 0 ? (
                <div className="space-y-4">
                    {subscriptions.map((subscription) => {
                        const statusBadge = getStatusBadge(subscription.status);
                        const StatusIcon = statusBadge.icon;
                        const isActive = subscription.status === 'active';
                        const isCancelling = cancellingId === subscription.id;

                        return (
                            <div
                                key={subscription.id}
                                className={`bg-white rounded-2xl border-2 p-4 ${
                                    isActive ? 'border-green-300 bg-green-50' : 'border-gray-200'
                                }`}
                            >
                                {/* Package Info */}
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <FaBox className="text-gray-400 text-sm" />
                                            <h3 className="text-sm font-bold text-gray-900">
                                                {subscription.package?.name_ar || subscription.package?.name}
                                            </h3>
                                        </div>
                                        <div className="flex items-center gap-4 text-xs text-gray-600 mb-2">
                                            <div className="flex items-center gap-1">
                                                <FaCalendar className="text-gray-400" />
                                                <span>من: {toHijriDate(subscription.start_date)}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <FaCalendar className="text-gray-400" />
                                                <span>إلى: {toHijriDate(subscription.end_date)}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 text-xs text-gray-600">
                                            <div className="flex items-center gap-1">
                                                <FaCreditCard className="text-gray-400" />
                                                <span>{subscription.paid_amount} {subscription.package?.currency}</span>
                                            </div>
                                            {subscription.transaction_id && (
                                                <span className="text-gray-500">
                                                    رقم المعاملة: {subscription.transaction_id}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${statusBadge.bg} ${statusBadge.text}`}>
                                        <StatusIcon className="text-[10px]" />
                                        {statusBadge.label}
                                    </span>
                                </div>

                                {/* Actions */}
                                {isActive && (
                                    <div className="pt-3 border-t border-gray-200">
                                        <button
                                            onClick={() => handleCancelSubscription(subscription.id)}
                                            disabled={isCancelling}
                                            className="w-full px-4 py-2 bg-red-50 text-red-700 rounded-xl hover:bg-red-100 transition text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                        >
                                            {isCancelling ? (
                                                <>
                                                    <FaSpinner className="animate-spin" />
                                                    جاري الإلغاء...
                                                </>
                                            ) : (
                                                <>
                                                    <FaTrash />
                                                    إلغاء الاشتراك
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
                    <p className="text-sm text-gray-500 mb-4">لا توجد اشتراكات حالياً</p>
                    <button
                        onClick={() => router.visit('/packages')}
                        className="px-4 py-2 bg-[#A3C042] text-white rounded-xl hover:bg-[#93b03a] transition text-sm font-semibold"
                    >
                        تصفح الباقات
                    </button>
                </div>
            )}

            {/* Back to Packages */}
            <div className="pt-4">
                <button
                    onClick={() => router.visit('/packages')}
                    className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition text-sm font-semibold"
                >
                    ← العودة إلى الباقات
                </button>
            </div>
        </div>
    );

    return (
        <div dir="rtl" className="min-h-screen bg-gray-50">
            <Head title="اشتراكاتي - إرث المبتكرين" />

            {/* Mobile View */}
            <div className="block md:hidden">
                <MobileAppLayout
                    auth={auth}
                    title="اشتراكاتي"
                    activeNav="packages"
                    unreadCount={auth?.unreadCount || 0}
                    onNotifications={() => router.visit('/notifications')}
                    onBack={() => router.visit('/packages')}
                >
                    <SubscriptionsContent />
                </MobileAppLayout>
            </div>

            {/* Desktop View */}
            <div className="hidden md:block">
                <MobileTopBar
                    title="اشتراكاتي"
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
