import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link } from '@inertiajs/react';
import { FaArrowRight, FaUsers, FaCalendar, FaCheckCircle, FaClock, FaTimesCircle } from 'react-icons/fa';

export default function AdminPackagesSubscribers({ package: pkg, subscribers }) {
    const getStatusBadge = (status) => {
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

    return (
        <DashboardLayout header={`مشتركي الباقة: ${pkg.name_ar || pkg.name}`}>
            <Head title={`مشتركي الباقة: ${pkg.name_ar || pkg.name}`} />

            <div className="mb-6">
                <Link
                    href={route('admin.packages.index')}
                    className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
                >
                    <FaArrowRight className="transform rotate-180" />
                    العودة إلى قائمة الباقات
                </Link>
            </div>

            {/* Package Info */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{pkg.name_ar || pkg.name}</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <p className="text-sm text-gray-600">السعر</p>
                        <p className="text-lg font-semibold text-gray-900">{pkg.price} {pkg.currency}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">المدة</p>
                        <p className="text-lg font-semibold text-gray-900">
                            {pkg.duration_type === 'monthly' && 'شهري'}
                            {pkg.duration_type === 'quarterly' && 'ربع سنوي'}
                            {pkg.duration_type === 'yearly' && 'سنوي'}
                            {pkg.duration_type === 'lifetime' && 'مدى الحياة'}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">إجمالي المشتركين</p>
                        <p className="text-lg font-semibold text-gray-900">{subscribers.total || 0}</p>
                    </div>
                </div>
            </div>

            {/* Subscribers Table */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="text-right py-4 px-6 text-sm font-semibold text-gray-700">المستخدم</th>
                                <th className="text-right py-4 px-6 text-sm font-semibold text-gray-700">تاريخ البدء</th>
                                <th className="text-right py-4 px-6 text-sm font-semibold text-gray-700">تاريخ الانتهاء</th>
                                <th className="text-right py-4 px-6 text-sm font-semibold text-gray-700">الحالة</th>
                                <th className="text-right py-4 px-6 text-sm font-semibold text-gray-700">تاريخ الاشتراك</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {subscribers.data && subscribers.data.length > 0 ? (
                                subscribers.data.map((subscriber) => (
                                    <tr key={subscriber.id} className="hover:bg-gray-50">
                                        <td className="py-4 px-6">
                                            <div>
                                                <p className="font-medium text-gray-900">{subscriber.user?.name || 'غير معروف'}</p>
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
                                        <td className="py-4 px-6 text-sm text-gray-700">{subscriber.created_at}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="py-12 text-center text-gray-500">
                                        <FaUsers className="mx-auto text-4xl text-gray-300 mb-2" />
                                        لا يوجد مشتركين لهذه الباقة
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
                                عرض {subscribers.from} إلى {subscribers.to} من {subscribers.total} مشترك
                            </div>
                            <div className="flex gap-2">
                                {subscribers.links.map((link, index) => (
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
