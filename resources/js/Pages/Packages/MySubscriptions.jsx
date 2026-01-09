import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function MySubscriptions({ subscriptions }) {
    const [cancellingId, setCancellingId] = useState(null);

    const handleCancelSubscription = (subscriptionId) => {
        if (confirm('هل أنت متأكد من إلغاء هذا الاشتراك؟')) {
            router.post(
                route('packages.subscription.cancel', subscriptionId),
                {},
                {
                    onStart: () => setCancellingId(subscriptionId),
                    onFinish: () => setCancellingId(null),
                }
            );
        }
    };

    const getStatusBadge = (status) => {
        const badges = {
            active: {
                color: 'bg-green-100 text-green-800',
                label: 'نشط',
            },
            expired: {
                color: 'bg-red-100 text-red-800',
                label: 'منتهي',
            },
            cancelled: {
                color: 'bg-gray-100 text-gray-800',
                label: 'ملغي',
            },
            pending: {
                color: 'bg-yellow-100 text-yellow-800',
                label: 'قيد الانتظار',
            },
            failed: {
                color: 'bg-red-100 text-red-800',
                label: 'فشل',
            },
        };

        const badge = badges[status] || badges.pending;

        return (
            <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${badge.color}`}
            >
                {badge.label}
            </span>
        );
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-800">اشتراكاتي</h2>
                    <Link
                        href={route('packages.index')}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                    >
                        تصفح الباقات
                    </Link>
                </div>
            }
        >
            <Head title="اشتراكاتي" />

            <div className="py-12 bg-gray-50 min-h-screen">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {subscriptions.length === 0 ? (
                        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                            <div className="text-6xl mb-4">📦</div>
                            <h3 className="text-2xl font-bold text-gray-800 mb-2">
                                لا توجد اشتراكات
                            </h3>
                            <p className="text-gray-600 mb-6">
                                لم تقم بالاشتراك في أي باقة بعد
                            </p>
                            <Link
                                href={route('packages.index')}
                                className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold"
                            >
                                تصفح الباقات المتاحة
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {subscriptions.map((subscription) => (
                                <div
                                    key={subscription.id}
                                    className="bg-white rounded-xl shadow-lg overflow-hidden"
                                >
                                    <div className="p-6">
                                        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                                            <div className="mb-4 md:mb-0">
                                                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                                                    {subscription.package.name_ar}
                                                </h3>
                                                <p className="text-gray-600 text-sm">
                                                    معرف الاشتراك: #{subscription.id}
                                                </p>
                                            </div>
                                            <div>
                                                {getStatusBadge(subscription.status)}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                                            <div className="bg-gray-50 rounded-lg p-4">
                                                <p className="text-gray-600 text-sm mb-1">
                                                    تاريخ البدء
                                                </p>
                                                <p className="text-gray-800 font-semibold">
                                                    {subscription.start_date}
                                                </p>
                                            </div>
                                            <div className="bg-gray-50 rounded-lg p-4">
                                                <p className="text-gray-600 text-sm mb-1">
                                                    تاريخ الانتهاء
                                                </p>
                                                <p className="text-gray-800 font-semibold">
                                                    {subscription.end_date}
                                                </p>
                                            </div>
                                            <div className="bg-gray-50 rounded-lg p-4">
                                                <p className="text-gray-600 text-sm mb-1">
                                                    المبلغ المدفوع
                                                </p>
                                                <p className="text-gray-800 font-semibold">
                                                    {subscription.paid_amount}{' '}
                                                    {subscription.package.currency}
                                                </p>
                                            </div>
                                            <div className="bg-gray-50 rounded-lg p-4">
                                                <p className="text-gray-600 text-sm mb-1">
                                                    طريقة الدفع
                                                </p>
                                                <p className="text-gray-800 font-semibold capitalize">
                                                    {subscription.payment_method || 'N/A'}
                                                </p>
                                            </div>
                                        </div>

                                        {subscription.transaction_id && (
                                            <div className="bg-blue-50 rounded-lg p-4 mb-4">
                                                <p className="text-blue-800 text-sm">
                                                    <span className="font-semibold">
                                                        رقم المعاملة:
                                                    </span>{' '}
                                                    {subscription.transaction_id}
                                                </p>
                                            </div>
                                        )}

                                        {subscription.status === 'active' && (
                                            <div className="flex justify-end">
                                                <button
                                                    onClick={() =>
                                                        handleCancelSubscription(subscription.id)
                                                    }
                                                    disabled={cancellingId === subscription.id}
                                                    className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold"
                                                >
                                                    {cancellingId === subscription.id
                                                        ? 'جاري الإلغاء...'
                                                        : 'إلغاء الاشتراك'}
                                                </button>
                                            </div>
                                        )}

                                        {subscription.status === 'expired' && (
                                            <div className="text-center">
                                                <Link
                                                    href={route('packages.index')}
                                                    className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-semibold"
                                                >
                                                    تجديد الاشتراك
                                                </Link>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

