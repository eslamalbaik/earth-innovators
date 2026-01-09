import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import {
    FaCreditCard,
    FaCheckCircle,
    FaClock,
    FaTimes,
    FaFilter,
    FaDollarSign,
    FaEye,
    FaGraduationCap,
    FaBan,
} from 'react-icons/fa';

export default function StudentPayments({ payments, stats, filters }) {
    const [statusFilter, setStatusFilter] = useState(filters?.status || 'all');
    const [methodFilter, setMethodFilter] = useState(filters?.payment_method || 'all');
    const [cancellingId, setCancellingId] = useState(null);

    const statusLabels = {
        pending: 'قيد الانتظار',
        processing: 'قيد المعالجة',
        completed: 'مكتمل',
        failed: 'فشل',
        cancelled: 'ملغي',
        refunded: 'مسترد',
    };

    const statusColors = {
        pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
        processing: 'bg-blue-100 text-blue-800 border-blue-300',
        completed: 'bg-green-100 text-green-800 border-green-300',
        failed: 'bg-red-100 text-red-800 border-red-300',
        cancelled: 'bg-gray-100 text-gray-800 border-gray-300',
        refunded: 'bg-purple-100 text-purple-800 border-purple-300',
    };

    const methodLabels = {
        stripe: 'Stripe',
        paypal: 'PayPal',
        mada: 'مدى',
    };

    const handleFilter = (newStatus, newMethod) => {
        const params = {};
        if (newStatus && newStatus !== 'all') params.status = newStatus;
        if (newMethod && newMethod !== 'all') params.payment_method = newMethod;

        router.get('/student/payments', params, { preserveState: true });
        setStatusFilter(newStatus);
        setMethodFilter(newMethod);
    };

    const { confirm } = useConfirmDialog();

    const handleCancel = async (paymentId) => {
        const confirmed = await confirm({
            title: 'تأكيد الإلغاء',
            message: 'هل أنت متأكد من إلغاء هذا الدفع؟',
            confirmText: 'إلغاء',
            cancelText: 'تراجع',
            variant: 'warning',
        });

        if (!confirmed) {
            return;
        }

        setCancellingId(paymentId);
        try {
            await router.post(`/payment/${paymentId}/cancel`, {}, {
                preserveScroll: true,
                onSuccess: () => {
                    router.reload({ only: ['payments'] });
                },
                onError: (errors) => {
                    console.error('Cancel error:', errors);
                },
                onFinish: () => {
                    setCancellingId(null);
                },
            });
        } catch (error) {
            console.error('Cancel error:', error);
            setCancellingId(null);
        }
    };

    const canCancelPayment = (payment) => {
        // لا يمكن إلغاء الدفع إذا كان ملغياً أو مسترداً أو مكتملاً
        if (payment.status === 'cancelled' || payment.status === 'refunded') {
            return false;
        }
        // يمكن محاولة الإلغاء للدفعات الأخرى (pending, processing, failed)
        return true;
    };

    const canCapturePayment = (payment) => {
        // يمكن capture الدفع إذا كان في حالة processing أو authorised
        return payment.status === 'processing' || payment.status === 'authorised';
    };

    const canRefundPayment = (payment) => {
        // يمكن refund الدفع إذا كان مكتملاً ولم يتم refundه بعد
        return payment.status === 'completed' && payment.status !== 'refunded';
    };

    const handleRefund = async (paymentId) => {
        const amount = prompt('أدخل المبلغ المراد refundه (اتركه فارغاً للـ refund الكامل):');
        if (amount === null) {
            return; // المستخدم ألغى
        }

        const refundAmount = amount ? parseFloat(amount) : null;
        if (amount && (isNaN(refundAmount) || refundAmount <= 0)) {
            alert('المبلغ غير صحيح');
            return;
        }

        const comment = prompt('أدخل تعليق (اختياري):') || '';

        const confirmed = await confirm({
            title: 'تأكيد الاسترجاع',
            message: 'هل أنت متأكد من refund هذا الدفع؟',
            confirmText: 'استرجاع',
            cancelText: 'إلغاء',
            variant: 'warning',
        });

        if (!confirmed) {
            return;
        }

        setCancellingId(paymentId);
        try {
            await router.post(`/payment/${paymentId}/refund`, {
                amount: refundAmount,
                comment: comment,
            }, {
                preserveScroll: true,
                onSuccess: () => {
                    router.reload({ only: ['payments'] });
                },
                onError: (errors) => {
                    console.error('Refund error:', errors);
                },
                onFinish: () => {
                    setCancellingId(null);
                },
            });
        } catch (error) {
            console.error('Refund error:', error);
            setCancellingId(null);
        }
    };

    const handleCapture = async (paymentId) => {
        const confirmed = await confirm({
            title: 'تأكيد Capture',
            message: 'هل أنت متأكد من capture هذا الدفع؟',
            confirmText: 'Capture',
            cancelText: 'إلغاء',
            variant: 'info',
        });

        if (!confirmed) {
            return;
        }

        setCancellingId(paymentId);
        try {
            await router.post(`/payment/${paymentId}/capture`, {}, {
                preserveScroll: true,
                onSuccess: () => {
                    router.reload({ only: ['payments'] });
                },
                onError: (errors) => {
                    console.error('Capture error:', errors);
                },
                onFinish: () => {
                    setCancellingId(null);
                },
            });
        } catch (error) {
            console.error('Capture error:', error);
            setCancellingId(null);
        }
    };

    return (
        <DashboardLayout header="المدفوعات">
            <Head title="المدفوعات" />

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <div className="bg-white rounded-xl shadow-lg p-6 border-r-4 border-blue-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">إجمالي المدفوعات</p>
                            <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                        </div>
                        <div className="p-3 bg-blue-100 rounded-full">
                            <FaCreditCard className="text-2xl text-blue-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6 border-r-4 border-green-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">المدفوعة</p>
                            <p className="text-3xl font-bold text-green-600">{stats.completed}</p>
                        </div>
                        <div className="p-3 bg-green-100 rounded-full">
                            <FaCheckCircle className="text-2xl text-green-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6 border-r-4 border-yellow-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">قيد الانتظار</p>
                            <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
                        </div>
                        <div className="p-3 bg-yellow-100 rounded-full">
                            <FaClock className="text-2xl text-yellow-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6 border-r-4 border-purple-500">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">إجمالي المصروف</p>
                            <p className="text-3xl font-bold text-purple-600">{stats.totalPaid.toFixed(2)}</p>
                        </div>
                        <div className="p-3 bg-purple-100 rounded-full">
                            <img src="/images/aed-currency(black).svg" alt="currency" className="w-8 h-8" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
                <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex items-center gap-2 text-gray-700">
                        <FaFilter className="text-lg" />
                        <span className="font-medium">فلترة:</span>
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => handleFilter(e.target.value, methodFilter)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400"
                    >
                        <option value="all">كل الحالات</option>
                        {Object.entries(statusLabels).map(([key, label]) => (
                            <option key={key} value={key}>{label}</option>
                        ))}
                    </select>
                    <select
                        value={methodFilter}
                        onChange={(e) => handleFilter(statusFilter, e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400"
                    >
                        <option value="all">كل الطرق</option>
                        {Object.entries(methodLabels).map(([key, label]) => (
                            <option key={key} value={key}>{label}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-yellow-50 to-yellow-100">
                    <h3 className="text-lg font-bold text-gray-900">سجل المدفوعات</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">#</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">المعلم</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">المادة</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">المبلغ</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">طريقة الدفع</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الحالة</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">تاريخ الدفع</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">رقم المعاملة</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">إجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {payments?.data?.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                                        <FaCreditCard className="mx-auto text-4xl mb-4 text-gray-300" />
                                        <p>لا توجد مدفوعات حالياً</p>
                                    </td>
                                </tr>
                            ) : (
                                payments?.data?.map((payment) => (
                                    <tr key={payment.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            #{payment.booking_id}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-xs">
                                                    <FaGraduationCap />
                                                </div>
                                                <span className="text-sm text-gray-900">{payment.teacher_name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {payment.subject}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                                            {payment.amount} {payment.currency}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {methodLabels[payment.payment_method] || payment.payment_method}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusColors[payment.status] || statusColors.pending}`}>
                                                {statusLabels[payment.status] || payment.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {payment.paid_at || payment.created_at}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                                            {payment.transaction_id}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <div className="flex items-center gap-2">
                                                {canCapturePayment(payment) && (
                                                    <button
                                                        onClick={() => handleCapture(payment.id)}
                                                        disabled={cancellingId === payment.id}
                                                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                        title="Capture الدفع"
                                                    >
                                                        <FaCheckCircle />
                                                        {cancellingId === payment.id ? 'جاري...' : 'Capture'}
                                                    </button>
                                                )}
                                                {canRefundPayment(payment) && (
                                                    <button
                                                        onClick={() => handleRefund(payment.id)}
                                                        disabled={cancellingId === payment.id}
                                                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                        title="Refund الدفع"
                                                    >
                                                        <FaDollarSign />
                                                        {cancellingId === payment.id ? 'جاري...' : 'Refund'}
                                                    </button>
                                                )}
                                                {canCancelPayment(payment) && (
                                                    <button
                                                        onClick={() => handleCancel(payment.id)}
                                                        disabled={cancellingId === payment.id}
                                                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                        title="إلغاء الدفع"
                                                    >
                                                        <FaBan />
                                                        {cancellingId === payment.id ? 'جاري الإلغاء...' : 'إلغاء'}
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {payments?.links && payments.links.length > 3 && (
                    <div className="bg-white px-4 py-3 border-t border-gray-200 flex items-center justify-between">
                        <div className="text-sm text-gray-700">
                            عرض {payments.from} إلى {payments.to} من {payments.total} مدفوعة
                        </div>
                        <div className="flex gap-2">
                            {payments.links.map((link, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => link.url && router.get(link.url)}
                                    disabled={!link.url}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${link.active
                                        ? 'bg-yellow-500 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        } ${!link.url ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}

