import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import {
    FaCreditCard,
    FaCheckCircle,
    FaClock,
    FaTimes,
    FaFilter,
    FaDollarSign,
    FaUser,
    FaGraduationCap,
    FaEye,
    FaDownload,
    FaBan,
} from 'react-icons/fa';

export default function AdminPayments({ payments, stats, teachers, filters }) {
    const [statusFilter, setStatusFilter] = useState(filters?.status || 'all');
    const [methodFilter, setMethodFilter] = useState(filters?.payment_method || 'all');
    const [teacherFilter, setTeacherFilter] = useState(filters?.teacher_id || 'all');

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

    const handleFilter = () => {
        const params = { ...filters };
        if (statusFilter && statusFilter !== 'all') params.status = statusFilter;
        else delete params.status;
        if (methodFilter && methodFilter !== 'all') params.payment_method = methodFilter;
        else delete params.payment_method;
        if (teacherFilter && teacherFilter !== 'all') params.teacher_id = teacherFilter;
        else delete params.teacher_id;

        router.get('/admin/payments', params, { preserveState: true });
    };

    return (
        <DashboardLayout header="إدارة المدفوعات">
            <Head title="إدارة المدفوعات" />

            <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
                <div className="bg-white rounded-xl shadow-lg p-4 border-r-4 border-blue-500">
                    <p className="text-xs text-gray-600 mb-1">إجمالي</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-4 border-r-4 border-green-500">
                    <p className="text-xs text-gray-600 mb-1">مكتملة</p>
                    <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-4 border-r-4 border-yellow-500">
                    <p className="text-xs text-gray-600 mb-1">قيد الانتظار</p>
                    <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-4 border-r-4 border-red-500">
                    <p className="text-xs text-gray-600 mb-1">فشل</p>
                    <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-4 border-r-4 border-purple-500">
                    <p className="text-xs text-gray-600 mb-1">مسترد</p>
                    <p className="text-2xl font-bold text-purple-600">{stats.refunded}</p>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-4 border-r-4 border-indigo-500">
                    <p className="text-xs text-gray-600 mb-1">إجمالي الإيرادات</p>
                    <div className="font-bold text-indigo-600 flex items-center ">
                        <p className="text-xl mt-1">{(stats.totalRevenue || 0).toFixed(2)}</p>
                        <img src="/images/aed-currency(black).svg" alt="currency" className="w-6 h-6" />
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-4 border-r-4 border-orange-500">
                    <p className="text-xs text-gray-600 mb-1">معلق</p>
                    <div className="font-bold text-orange-600 flex items-center ">
                        <p className="text-xl mt-1">{(stats.pendingAmount || 0).toFixed(2)}</p>
                        <img src="/images/aed-currency(black).svg" alt="currency" className="w-6 h-6" />
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
                        onChange={(e) => {
                            setStatusFilter(e.target.value);
                            handleFilter();
                        }}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400"
                    >
                        <option value="all">كل الحالات</option>
                        {Object.entries(statusLabels).map(([key, label]) => (
                            <option key={key} value={key}>{label}</option>
                        ))}
                    </select>
                    <select
                        value={methodFilter}
                        onChange={(e) => {
                            setMethodFilter(e.target.value);
                            handleFilter();
                        }}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400"
                    >
                        <option value="all">كل الطرق</option>
                        {Object.entries(methodLabels).map(([key, label]) => (
                            <option key={key} value={key}>{label}</option>
                        ))}
                    </select>
                    <select
                        value={teacherFilter}
                        onChange={(e) => {
                            setTeacherFilter(e.target.value);
                            handleFilter();
                        }}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400"
                    >
                        <option value="all">كل المعلمين</option>
                        {teachers?.map((teacher) => (
                            <option key={teacher.id} value={teacher.id}>{teacher.name}</option>
                        ))}
                    </select>
                    <button
                        onClick={handleFilter}
                        className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-medium"
                    >
                        تطبيق
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-yellow-50 to-yellow-100 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-gray-900">سجل جميع المدفوعات</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">#</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الطالب</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">المعلم</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">المبلغ</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">طريقة الدفع</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الحالة</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">تاريخ الدفع</th>
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
                                                <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white text-xs">
                                                    <FaUser />
                                                </div>
                                                <span className="text-sm text-gray-900">{payment.student_name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-xs">
                                                    <FaGraduationCap />
                                                </div>
                                                <span className="text-sm text-gray-900">{payment.teacher_name}</span>
                                            </div>
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
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <Link
                                                href={`/admin/payments/${payment.id}`}
                                                className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                                            >
                                                <FaEye />
                                                عرض
                                            </Link>
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

