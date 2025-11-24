import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import {
    FaCalendar,
    FaCheckCircle,
    FaClock,
    FaBook,
    FaUser,
    FaDollarSign,
    FaGraduationCap,
    FaFilter,
    FaTimes,
    FaCreditCard,
    FaLock,
    FaExclamationTriangle,
} from 'react-icons/fa';

export default function StudentBookings({ bookings, auth }) {
    const { flash } = usePage().props;
    const [statusFilter, setStatusFilter] = useState(null);
    const [showError, setShowError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        if (flash?.error) {
            setErrorMessage(flash.error);
            setShowError(true);
            // إخفاء الرسالة بعد 5 ثوان
            const timer = setTimeout(() => {
                setShowError(false);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [flash]);

    const statusLabels = {
        pending: 'قيد الانتظار',
        approved: 'مؤكد',
        confirmed: 'مؤكد',
        rejected: 'مرفوض',
        cancelled: 'ملغي',
        completed: 'مكتمل',
    };

    const statusColors = {
        pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
        approved: 'bg-green-100 text-green-800 border-green-300',
        confirmed: 'bg-green-100 text-green-800 border-green-300',
        rejected: 'bg-red-100 text-red-800 border-red-300',
        cancelled: 'bg-gray-100 text-gray-800 border-gray-300',
        completed: 'bg-blue-100 text-blue-800 border-blue-300',
    };

    const statusIcons = {
        pending: FaClock,
        approved: FaCheckCircle,
        confirmed: FaCheckCircle,
        rejected: FaTimes,
        cancelled: FaTimes,
        completed: FaCheckCircle,
    };

    const all = bookings?.data || [];

    const getSessionsCount = (booking) => {
        if (Array.isArray(booking.selected_sessions)) return booking.selected_sessions.length;
        try {
            const parsed = JSON.parse(booking.selected_sessions || '[]');
            return Array.isArray(parsed) ? parsed.length : 0;
        } catch {
            return 0;
        }
    };

    // Filter bookings by status
    const filteredBookings = statusFilter
        ? all.filter(booking => booking.status === statusFilter)
        : all;

    // Calculate statistics
    const stats = {
        total: all.length,
        pending: all.filter(b => b.status === 'pending').length,
        confirmed: all.filter(b => ['confirmed', 'approved'].includes(b.status)).length,
        completed: all.filter(b => b.status === 'completed').length,
        totalSpent: all
            .filter(b => ['confirmed', 'approved', 'completed'].includes(b.status))
            .reduce((sum, b) => sum + (parseFloat(b.total_price) || 0), 0)
    };

    const handleStatusFilter = (status) => {
        if (statusFilter === status) {
            setStatusFilter(null);
            router.get('/my-bookings');
        } else {
            setStatusFilter(status);
            router.get('/my-bookings', { status }, { preserveState: true });
        }
    };

    return (
        <DashboardLayout header="حجوزاتي">
            <Head title="حجوزاتي" />
            
            {/* عرض رسالة الخطأ */}
            {showError && errorMessage && (
                <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-start">
                        <FaExclamationTriangle className="text-red-500 text-xl mt-0.5 ml-3 flex-shrink-0" />
                        <div className="flex-1">
                            <h3 className="text-sm font-semibold text-red-800 mb-1">
                                تنبيه
                            </h3>
                            <p className="text-sm text-red-700">{errorMessage}</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setShowError(false)}
                            className="text-red-400 hover:text-red-600 flex-shrink-0"
                        >
                            <FaTimes className="text-sm" />
                        </button>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <div className="bg-white rounded-xl shadow-lg p-6 border-r-4 border-blue-500 hover:shadow-xl transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">إجمالي الحجوزات</p>
                            <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                        </div>
                        <div className="p-3 bg-blue-100 rounded-full">
                            <FaCalendar className="text-2xl text-blue-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6 border-r-4 border-yellow-500 hover:shadow-xl transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">قيد الانتظار</p>
                            <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
                        </div>
                        <div className="p-3 bg-yellow-100 rounded-full">
                            <FaClock className="text-2xl text-yellow-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6 border-r-4 border-green-500 hover:shadow-xl transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">المؤكدة</p>
                            <p className="text-3xl font-bold text-green-600">{stats.confirmed}</p>
                        </div>
                        <div className="p-3 bg-green-100 rounded-full">
                            <FaCheckCircle className="text-2xl text-green-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6 border-r-4 border-purple-500 hover:shadow-xl transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">إجمالي المصروف</p>
                            <p className="text-3xl font-bold text-purple-600">{stats.totalSpent.toFixed(0)}</p>
                        </div>
                        <div className="p-3 bg-purple-100 rounded-full">
                            <img src="/images/sar-currency(black).svg" alt="currency" className="w-8 h-8" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
                <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex items-center gap-2 text-gray-700">
                        <FaFilter className="text-lg" />
                        <span className="font-medium">فلترة حسب الحالة:</span>
                    </div>
                    <button
                        onClick={() => handleStatusFilter(null)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition ${!statusFilter
                            ? 'bg-yellow-500 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        الكل ({stats.total})
                    </button>
                    {Object.entries(statusLabels).map(([status, label]) => {
                        const count = all.filter(b => b.status === status).length;
                        if (count === 0) return null;
                        return (
                            <button
                                key={status}
                                onClick={() => handleStatusFilter(status)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition border-2 ${statusFilter === status
                                    ? statusColors[status] + ' border-current'
                                    : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                                    }`}
                            >
                                {label} ({count})
                            </button>
                        );
                    })}
                </div>
            </div>

            {filteredBookings.length === 0 ? (
                <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                    <FaCalendar className="mx-auto text-6xl mb-4 text-gray-300" />
                    <p className="text-xl text-gray-500 mb-2">لا توجد حجوزات حالياً</p>
                    <p className="text-sm text-gray-400">
                        {statusFilter ? `لا توجد حجوزات بحالة "${statusLabels[statusFilter]}"` : 'ابدأ بحجز أول حصة لك'}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredBookings.map((booking) => {
                        const StatusIcon = statusIcons[booking.status] || FaClock;
                        return (
                            <div
                                key={booking.id}
                                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100"
                            >
                                <div className={`bg-gradient-to-r ${booking.status === 'pending' ? 'from-yellow-400 to-yellow-600' :
                                    ['approved', 'confirmed'].includes(booking.status) ? 'from-green-400 to-green-600' :
                                        booking.status === 'completed' ? 'from-blue-400 to-blue-600' :
                                            booking.status === 'rejected' ? 'from-red-400 to-red-600' :
                                                'from-gray-400 to-gray-600'
                                    } text-white p-4`}>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <StatusIcon className="text-xl" />
                                            <span className="font-bold text-lg">#{booking.id}</span>
                                        </div>
                                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/20 text-white">
                                            {statusLabels[booking.status] || booking.status}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-6">
                                    <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
                                        <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                            <FaGraduationCap />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm text-gray-600">المعلم</p>
                                            <p className="font-bold text-gray-900">
                                                {booking?.teacher?.name_ar || booking?.teacher?.user?.name || '—'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-3 mb-4">
                                        <div className="flex items-center gap-2">
                                            <FaBook className="text-gray-400" />
                                            <span className="text-sm text-gray-600">المادة:</span>
                                            <span className="font-semibold text-gray-900">{booking.subject || '—'}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <FaCalendar className="text-gray-400" />
                                            <span className="text-sm text-gray-600">عدد الحصص:</span>
                                            <span className="font-semibold text-gray-900">{getSessionsCount(booking)} حصة</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <FaDollarSign className="text-gray-400" />
                                            <span className="text-sm text-gray-600">السعر الإجمالي:</span>
                                            <div className="flex items-center">
                                                <p className="font-bold">{booking.total_price}</p>
                                                <img src="/images/sar-currency(black).svg" alt="currency" className="w-5 h-5" />
                                            </div>
                                        </div>
                                    </div>

                                    {(booking.payment_status || booking.payment) && (
                                        <div className="pt-4 border-t border-gray-100 mb-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs text-gray-500">حالة الدفع:</span>
                                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${booking.payment?.status === 'completed' || booking.payment_status === 'paid'
                                                    ? 'bg-green-100 text-green-800'
                                                    : booking.payment?.status === 'failed' || booking.payment_status === 'failed'
                                                        ? 'bg-red-100 text-red-800'
                                                        : 'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                    {booking.payment?.status === 'completed' || booking.payment_status === 'paid'
                                                        ? 'مدفوع'
                                                        : booking.payment?.status === 'failed' || booking.payment_status === 'failed'
                                                            ? 'فشل الدفع'
                                                            : 'لم يتم الدفع'}
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    <div className="pt-4 border-t border-gray-100">
                                        <p className="text-xs text-gray-500">
                                            تاريخ الحجز: {new Date(booking.created_at).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </p>
                                    </div>

                                    {(booking.status === 'approved' || booking.status === 'confirmed') &&
                                        (booking.payment?.status !== 'completed' && booking.payment_status !== 'paid') && (
                                            <div className="mt-4 pt-4 border-t border-gray-100">
                                                <Link
                                                    href={`/payment/${booking.id}`}
                                                    className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition"
                                                >
                                                    <FaCreditCard />
                                                    الدفع الآن
                                                </Link>
                                            </div>
                                        )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {bookings?.links && bookings.links.length > 3 && (
                <div className="mt-6 bg-white rounded-xl shadow-lg p-4">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="text-sm text-gray-700">
                            عرض {bookings.from} إلى {bookings.to} من {bookings.total} حجز
                        </div>
                        <div className="flex gap-2">
                            {bookings.links.map((link, idx) => (
                                <Link
                                    key={idx}
                                    href={link.url || '#'}
                                    preserveState
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${link.active
                                        ? 'bg-yellow-500 text-white shadow-md'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        } ${!link.url ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}


