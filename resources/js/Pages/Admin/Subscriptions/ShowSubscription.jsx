import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link } from '@inertiajs/react';
import { FaArrowRight, FaCheckCircle, FaClock, FaTimesCircle, FaDollarSign, FaCalendar, FaUser, FaBox } from 'react-icons/fa';

export default function AdminSubscriptionsShowSubscription({ subscription }) {
    const getStatusBadge = (status) => {
        const statusMap = {
            'active': { bg: 'bg-green-100', text: 'text-green-800', label: 'نشط', icon: FaCheckCircle },
            'expired': { bg: 'bg-gray-100', text: 'text-gray-800', label: 'منتهي', icon: FaClock },
            'cancelled': { bg: 'bg-red-100', text: 'text-red-800', label: 'ملغي', icon: FaTimesCircle },
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

    const formatCurrency = (amount, currency = 'SAR') => {
        return new Intl.NumberFormat('ar-SA', {
            style: 'currency',
            currency: currency,
        }).format(amount);
    };

    return (
        <DashboardLayout header="تفاصيل الاشتراك">
            <Head title="تفاصيل الاشتراك" />

            <div className="mb-6">
                <Link
                    href={route('admin.subscriptions.index')}
                    className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
                >
                    <FaArrowRight className="transform rotate-180" />
                    العودة إلى قائمة الاشتراكات
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Subscription Info */}
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <div className="flex justify-between items-start mb-4">
                            <h2 className="text-2xl font-bold text-gray-900">معلومات الاشتراك</h2>
                            {getStatusBadge(subscription.status)}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-2">تاريخ البدء</label>
                                <div className="flex items-center gap-2 text-gray-900">
                                    <FaCalendar className="text-blue-500" />
                                    <span>{subscription.start_date}</span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-2">تاريخ الانتهاء</label>
                                <div className="flex items-center gap-2 text-gray-900">
                                    <FaCalendar className="text-red-500" />
                                    <span>{subscription.end_date}</span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-2">المبلغ المدفوع</label>
                                <div className="flex items-center gap-2 text-gray-900">
                                    <FaDollarSign className="text-green-500" />
                                    <span className="font-bold text-green-600 text-lg">
                                        {formatCurrency(subscription.paid_amount, subscription.package.currency)}
                                    </span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-2">تجديد تلقائي</label>
                                <div className="flex items-center gap-2">
                                    {subscription.auto_renew ? (
                                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                                            مفعل
                                        </span>
                                    ) : (
                                        <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-semibold">
                                            غير مفعل
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Payment Info */}
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">معلومات الدفع</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-2">طريقة الدفع</label>
                                <p className="text-gray-900">{subscription.payment_method || '—'}</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-2">رقم المعاملة</label>
                                <p className="text-gray-900 font-mono">{subscription.transaction_id || '—'}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* User Info */}
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">المستخدم</h2>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <FaUser className="text-blue-500" />
                                <div>
                                    <p className="text-sm text-gray-600">الاسم</p>
                                    <p className="font-semibold text-gray-900">{subscription.user.name}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <FaUser className="text-gray-400" />
                                <div>
                                    <p className="text-sm text-gray-600">البريد الإلكتروني</p>
                                    <p className="font-semibold text-gray-900">{subscription.user.email}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Package Info */}
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">الباقة</h2>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <FaBox className="text-purple-500" />
                                <div>
                                    <p className="text-sm text-gray-600">اسم الباقة</p>
                                    <p className="font-semibold text-gray-900">{subscription.package.name}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <FaDollarSign className="text-green-500" />
                                <div>
                                    <p className="text-sm text-gray-600">السعر الأصلي</p>
                                    <p className="font-semibold text-gray-900">
                                        {formatCurrency(subscription.package.price, subscription.package.currency)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Timestamp */}
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">معلومات إضافية</h2>
                        <div className="space-y-2 text-sm text-gray-600">
                            <p><strong>تاريخ الإنشاء:</strong> {subscription.created_at}</p>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
