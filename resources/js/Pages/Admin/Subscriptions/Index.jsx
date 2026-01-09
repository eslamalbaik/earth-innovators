import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { FaSearch, FaFilter, FaEye, FaCreditCard, FaCalendar, FaDollarSign, FaUsers, FaCheckCircle, FaTimesCircle, FaClock, FaExclamationCircle } from 'react-icons/fa';

export default function AdminSubscriptionsIndex({
    subscriptions,
    payments,
    subscriptionStats,
    paymentStats,
    totalStats,
    filters
}) {
    const [type, setType] = useState(filters?.type || 'subscriptions');
    const [search, setSearch] = useState(filters?.search || '');
    const [status, setStatus] = useState(filters?.status || 'all');
    const [paymentStatus, setPaymentStatus] = useState(filters?.payment_status || 'all');
    const [paymentMethod, setPaymentMethod] = useState(filters?.payment_method_filter || 'all');
    const [dateFrom, setDateFrom] = useState(filters?.date_from || '');
    const [dateTo, setDateTo] = useState(filters?.date_to || '');

    const handleFilter = () => {
        router.get(route('admin.subscriptions.index'), {
            type,
            search: search || undefined,
            status: status !== 'all' ? status : undefined,
            payment_status: paymentStatus !== 'all' ? paymentStatus : undefined,
            payment_method_filter: paymentMethod !== 'all' ? paymentMethod : undefined,
            date_from: dateFrom || undefined,
            date_to: dateTo || undefined,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const getSubscriptionStatusBadge = (status) => {
        const statusMap = {
            'active': { bg: 'bg-green-100', text: 'text-green-800', label: 'نشط', icon: FaCheckCircle },
            'expired': { bg: 'bg-gray-100', text: 'text-gray-800', label: 'منتهي', icon: FaClock },
            'cancelled': { bg: 'bg-red-100', text: 'text-red-800', label: 'ملغي', icon: FaTimesCircle },
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

    const getPaymentStatusBadge = (status) => {
        const statusMap = {
            'completed': { bg: 'bg-green-100', text: 'text-green-800', label: 'مكتمل', icon: FaCheckCircle },
            'pending': { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'قيد الانتظار', icon: FaClock },
            'failed': { bg: 'bg-red-100', text: 'text-red-800', label: 'فاشل', icon: FaTimesCircle },
            'refunded': { bg: 'bg-blue-100', text: 'text-blue-800', label: 'مسترد', icon: FaExclamationCircle },
            'processing': { bg: 'bg-blue-100', text: 'text-blue-800', label: 'قيد المعالجة', icon: FaClock },
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

    const formatCurrency = (amount, currency = 'AED') => {
        return new Intl.NumberFormat('ar-AE', {
            style: 'currency',
            currency: currency,
        }).format(amount);
    };

    return (
        <DashboardLayout header="الاشتراكات والمدفوعات">
            <Head title="الاشتراكات والمدفوعات" />

            {/* Tabs */}
            <div className="mb-6 bg-white rounded-xl shadow-lg p-4">
                <div className="flex gap-4 border-b border-gray-200">
                    <button
                        onClick={() => {
                            setType('subscriptions');
                            router.get(route('admin.subscriptions.index'), { type: 'subscriptions', ...filters }, { preserveState: true });
                        }}
                        className={`px-6 py-3 font-semibold transition-colors border-b-2 ${
                            type === 'subscriptions'
                                ? 'text-blue-600 border-blue-600'
                                : 'text-gray-600 border-transparent hover:text-blue-600'
                        }`}
                    >
                        <FaUsers className="inline ml-2" />
                        الاشتراكات ({subscriptionStats.total})
                    </button>
                    <button
                        onClick={() => {
                            setType('payments');
                            router.get(route('admin.subscriptions.index'), { type: 'payments', ...filters }, { preserveState: true });
                        }}
                        className={`px-6 py-3 font-semibold transition-colors border-b-2 ${
                            type === 'payments'
                                ? 'text-blue-600 border-blue-600'
                                : 'text-gray-600 border-transparent hover:text-blue-600'
                        }`}
                    >
                        <FaCreditCard className="inline ml-2" />
                        المدفوعات ({paymentStats.total})
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            {type === 'subscriptions' ? (
                <div className="grid grid-cols-1 md:grid-cols-6 gap-6 mb-8">
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <p className="text-sm text-gray-600 mb-2">إجمالي الاشتراكات</p>
                        <p className="text-3xl font-bold text-gray-900">{subscriptionStats.total || 0}</p>
                    </div>
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <p className="text-sm text-gray-600 mb-2">نشطة</p>
                        <p className="text-3xl font-bold text-green-600">{subscriptionStats.active || 0}</p>
                    </div>
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <p className="text-sm text-gray-600 mb-2">منتهية</p>
                        <p className="text-3xl font-bold text-gray-600">{subscriptionStats.expired || 0}</p>
                    </div>
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <p className="text-sm text-gray-600 mb-2">ملغاة</p>
                        <p className="text-3xl font-bold text-red-600">{subscriptionStats.cancelled || 0}</p>
                    </div>
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <p className="text-sm text-gray-600 mb-2">تجديد تلقائي</p>
                        <p className="text-3xl font-bold text-blue-600">{subscriptionStats.auto_renew_count || 0}</p>
                    </div>
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <p className="text-sm text-gray-600 mb-2">إجمالي الإيرادات</p>
                        <p className="text-3xl font-bold text-green-600">{formatCurrency(subscriptionStats.total_revenue || 0)}</p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-6 gap-6 mb-8">
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <p className="text-sm text-gray-600 mb-2">إجمالي المدفوعات</p>
                        <p className="text-3xl font-bold text-gray-900">{paymentStats.total || 0}</p>
                    </div>
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <p className="text-sm text-gray-600 mb-2">مكتملة</p>
                        <p className="text-3xl font-bold text-green-600">{paymentStats.completed || 0}</p>
                    </div>
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <p className="text-sm text-gray-600 mb-2">قيد الانتظار</p>
                        <p className="text-3xl font-bold text-yellow-600">{paymentStats.pending || 0}</p>
                    </div>
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <p className="text-sm text-gray-600 mb-2">فاشلة</p>
                        <p className="text-3xl font-bold text-red-600">{paymentStats.failed || 0}</p>
                    </div>
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <p className="text-sm text-gray-600 mb-2">مستردة</p>
                        <p className="text-3xl font-bold text-blue-600">{paymentStats.refunded || 0}</p>
                    </div>
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <p className="text-sm text-gray-600 mb-2">إجمالي الإيرادات</p>
                        <p className="text-3xl font-bold text-green-600">{formatCurrency(paymentStats.total_revenue || 0)}</p>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">البحث</label>
                        <div className="relative">
                            <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="ابحث..."
                                className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    {type === 'subscriptions' ? (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">حالة الاشتراك</label>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="all">الكل</option>
                                <option value="active">نشط</option>
                                <option value="expired">منتهي</option>
                                <option value="cancelled">ملغي</option>
                            </select>
                        </div>
                    ) : (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">حالة الدفع</label>
                                <select
                                    value={paymentStatus}
                                    onChange={(e) => setPaymentStatus(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="all">الكل</option>
                                    <option value="completed">مكتمل</option>
                                    <option value="pending">قيد الانتظار</option>
                                    <option value="failed">فاشل</option>
                                    <option value="refunded">مسترد</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">طريقة الدفع</label>
                                <select
                                    value={paymentMethod}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="all">الكل</option>
                                    <option value="credit_card">بطاقة ائتمانية</option>
                                    <option value="debit_card">بطاقة خصم</option>
                                    <option value="bank_transfer">تحويل بنكي</option>
                                    <option value="cash">نقدي</option>
                                </select>
                            </div>
                        </>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">من تاريخ</label>
                        <input
                            type="date"
                            value={dateFrom}
                            onChange={(e) => setDateFrom(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">إلى تاريخ</label>
                        <input
                            type="date"
                            value={dateTo}
                            onChange={(e) => setDateTo(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <div className="flex items-end">
                        <button
                            onClick={handleFilter}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center justify-center gap-2"
                        >
                            <FaFilter />
                            تصفية
                        </button>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                {type === 'subscriptions' ? (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="text-right py-4 px-6 text-sm font-semibold text-gray-700">المستخدم</th>
                                    <th className="text-right py-4 px-6 text-sm font-semibold text-gray-700">الباقة</th>
                                    <th className="text-right py-4 px-6 text-sm font-semibold text-gray-700">تاريخ البدء</th>
                                    <th className="text-right py-4 px-6 text-sm font-semibold text-gray-700">تاريخ الانتهاء</th>
                                    <th className="text-right py-4 px-6 text-sm font-semibold text-gray-700">المبلغ</th>
                                    <th className="text-right py-4 px-6 text-sm font-semibold text-gray-700">الحالة</th>
                                    <th className="text-right py-4 px-6 text-sm font-semibold text-gray-700">رقم المعاملة</th>
                                    <th className="text-right py-4 px-6 text-sm font-semibold text-gray-700">الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {subscriptions.data && subscriptions.data.length > 0 ? (
                                    subscriptions.data.map((subscription) => (
                                        <tr key={subscription.id} className="hover:bg-gray-50">
                                            <td className="py-4 px-6">
                                                <div>
                                                    <p className="font-medium text-gray-900">{subscription.user_name}</p>
                                                    <p className="text-sm text-gray-500">{subscription.user_email}</p>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6 text-sm text-gray-700">{subscription.package_name}</td>
                                            <td className="py-4 px-6 text-sm text-gray-700">{subscription.start_date}</td>
                                            <td className="py-4 px-6 text-sm text-gray-700">{subscription.end_date}</td>
                                            <td className="py-4 px-6">
                                                <span className="font-semibold text-green-600">
                                                    {formatCurrency(subscription.paid_amount, subscription.currency)}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6">{getSubscriptionStatusBadge(subscription.status)}</td>
                                            <td className="py-4 px-6 text-sm text-gray-700">{subscription.transaction_id}</td>
                                            <td className="py-4 px-6">
                                                <Link
                                                    href={route('admin.subscriptions.show-subscription', subscription.id)}
                                                    className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50"
                                                    title="عرض التفاصيل"
                                                >
                                                    <FaEye />
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="8" className="py-12 text-center text-gray-500">
                                            لا توجد اشتراكات
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="text-right py-4 px-6 text-sm font-semibold text-gray-700">الطالب</th>
                                    <th className="text-right py-4 px-6 text-sm font-semibold text-gray-700">المعلم</th>
                                    <th className="text-right py-4 px-6 text-sm font-semibold text-gray-700">المادة</th>
                                    <th className="text-right py-4 px-6 text-sm font-semibold text-gray-700">المبلغ</th>
                                    <th className="text-right py-4 px-6 text-sm font-semibold text-gray-700">الحالة</th>
                                    <th className="text-right py-4 px-6 text-sm font-semibold text-gray-700">طريقة الدفع</th>
                                    <th className="text-right py-4 px-6 text-sm font-semibold text-gray-700">رقم المعاملة</th>
                                    <th className="text-right py-4 px-6 text-sm font-semibold text-gray-700">التاريخ</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {payments.data && payments.data.length > 0 ? (
                                    payments.data.map((payment) => (
                                        <tr key={payment.id} className="hover:bg-gray-50">
                                            <td className="py-4 px-6">
                                                <div>
                                                    <p className="font-medium text-gray-900">{payment.student_name}</p>
                                                    <p className="text-sm text-gray-500">{payment.student_email}</p>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6 text-sm text-gray-700">{payment.teacher_name}</td>
                                            <td className="py-4 px-6 text-sm text-gray-700">{payment.subject}</td>
                                            <td className="py-4 px-6">
                                                <span className="font-semibold text-green-600">
                                                    {formatCurrency(payment.amount, payment.currency)}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6">{getPaymentStatusBadge(payment.status)}</td>
                                            <td className="py-4 px-6 text-sm text-gray-700">{payment.payment_method}</td>
                                            <td className="py-4 px-6 text-sm text-gray-700">{payment.transaction_id}</td>
                                            <td className="py-4 px-6 text-sm text-gray-700">
                                                {payment.paid_at || payment.created_at}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="8" className="py-12 text-center text-gray-500">
                                            لا توجد مدفوعات
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {((type === 'subscriptions' && subscriptions.links && subscriptions.links.length > 3) ||
                  (type === 'payments' && payments.links && payments.links.length > 3)) && (
                    <div className="px-6 py-4 border-t border-gray-200">
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-700">
                                {type === 'subscriptions' ? (
                                    <>عرض {subscriptions.from} إلى {subscriptions.to} من {subscriptions.total} اشتراك</>
                                ) : (
                                    <>عرض {payments.from} إلى {payments.to} من {payments.total} دفعة</>
                                )}
                            </div>
                            <div className="flex gap-2">
                                {(type === 'subscriptions' ? subscriptions.links : payments.links).map((link, index) => (
                                    <Link
                                        key={index}
                                        href={link.url || '#'}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium ${
                                            link.active
                                                ? 'bg-blue-600 text-white'
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
