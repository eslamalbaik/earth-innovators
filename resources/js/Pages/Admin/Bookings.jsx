import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { FaCalendar, FaCheckCircle, FaClock, FaEye, FaEdit, FaFilter, FaTimes, FaSearch } from 'react-icons/fa';
import { useState } from 'react';

export default function Bookings({ bookings, auth }) {
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('');

    const { data: updateData, setData: setUpdateData, patch: updateBooking, processing: isUpdating, reset: resetUpdate } = useForm({
        status: '',
        notes: ''
    });

    const statusColors = {
        pending: 'bg-yellow-100 text-yellow-800',
        confirmed: 'bg-green-100 text-green-800',
        cancelled: 'bg-red-100 text-red-800',
        completed: 'bg-blue-100 text-blue-800',
    };

    const statusIcons = {
        pending: FaClock,
        confirmed: FaCheckCircle,
        cancelled: FaEdit,
        completed: FaCheckCircle,
    };

    const statusLabels = {
        pending: 'قيد الانتظار',
        confirmed: 'مؤكد',
        cancelled: 'ملغي',
        completed: 'مكتمل',
    };

    const handleStatusChange = (bookingId, newStatus) => {
        router.patch(`/admin/bookings/${bookingId}`, { status: newStatus });
    };

    const handleViewBooking = (booking) => {
        setSelectedBooking(booking);
        setUpdateData({
            status: booking.status,
            notes: booking.notes || ''
        });
        setIsModalOpen(true);
    };

    const handleUpdateBooking = (e) => {
        e.preventDefault();
        updateBooking(`/admin/bookings/${selectedBooking.id}`, {
            onSuccess: () => {
                setIsModalOpen(false);
                setSelectedBooking(null);
                resetUpdate();
            }
        });
    };

    const filteredBookings = bookings?.data?.filter(booking => {
        const matchesSearch = booking.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            booking.teacher?.name_ar?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            booking.subject?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesFilter = !filterStatus || booking.status === filterStatus;

        return matchesSearch && matchesFilter;
    }) || [];

    return (
        <DashboardLayout header="إدارة الحجوزات">
            <Head title="إدارة الحجوزات" />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <div className="bg-white rounded-xl shadow-lg p-6 border-r-4 border-blue-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">إجمالي الحجوزات</p>
                            <p className="text-3xl font-bold text-gray-900">{bookings?.total || 0}</p>
                        </div>
                        <div className="p-4 bg-blue-100 rounded-full">
                            <FaCalendar className="text-3xl text-blue-600" />
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-6 border-r-4 border-yellow-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">قيد الانتظار</p>
                            <p className="text-3xl font-bold text-yellow-600">
                                {bookings?.data?.filter(b => b.status === 'pending').length || 0}
                            </p>
                        </div>
                        <div className="p-4 bg-yellow-100 rounded-full">
                            <FaClock className="text-3xl text-yellow-600" />
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-6 border-r-4 border-green-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">مؤكد</p>
                            <p className="text-3xl font-bold text-green-600">
                                {bookings?.data?.filter(b => b.status === 'confirmed').length || 0}
                            </p>
                        </div>
                        <div className="p-4 bg-green-100 rounded-full">
                            <FaCheckCircle className="text-3xl text-green-600" />
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-6 border-r-4 border-purple-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">مكتمل</p>
                            <p className="text-3xl font-bold text-purple-600">
                                {bookings?.data?.filter(b => b.status === 'completed').length || 0}
                            </p>
                        </div>
                        <div className="p-4 bg-purple-100 rounded-full">
                            <FaCheckCircle className="text-3xl text-purple-600" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <FaSearch className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="البحث في الطلبات..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pr-12 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                        />
                    </div>
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400"
                    >
                        <option value="">جميع الحالات</option>
                        <option value="pending">قيد الانتظار</option>
                        <option value="confirmed">مؤكد</option>
                        <option value="cancelled">ملغي</option>
                        <option value="completed">مكتمل</option>
                    </select>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gradient-to-r from-yellow-50 to-yellow-100">
                            <tr>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase">رقم الحجز</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase">الطالب</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase">المعلم</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase">المادة</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase">عدد الحصص</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase">الإجمالي</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase">الحالة</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase">التاريخ</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredBookings.length === 0 ? (
                                <tr>
                                    <td colSpan="9" className="px-6 py-12 text-center text-gray-500">
                                        <FaCalendar className="mx-auto text-4xl mb-4 text-gray-300" />
                                        <p>لا توجد طلبات مطابقة للبحث</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredBookings.map((booking) => {
                                    const sessionsCount = Array.isArray(booking.selected_sessions)
                                        ? booking.selected_sessions.length
                                        : 0;
                                    const StatusIcon = statusIcons[booking.status];

                                    return (
                                        <tr key={booking.id} className="hover:bg-gray-50 transition">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">#{booking.id}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{booking.student_name}</div>
                                                <div className="text-xs text-gray-500">{booking.student_phone}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{booking.teacher?.name_ar}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{booking.subject}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{sessionsCount} حصة</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <p className="text-xl mt-1">{stats.total_price}</p>
                                                    <img src="/images/aed-currency(black).svg" alt="currency" className="w-6 h-6" />
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-3 py-1 inline-flex items-center text-xs font-semibold rounded-full ${statusColors[booking.status]}`}>
                                                    <StatusIcon className="ml-1" />
                                                    {statusLabels[booking.status]}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-500">{new Date(booking.created_at).toLocaleDateString('en-US')}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-left">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => handleViewBooking(booking)}
                                                        className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded transition"
                                                        title="عرض التفاصيل"
                                                    >
                                                        <FaEye />
                                                    </button>
                                                    <select
                                                        value={booking.status}
                                                        onChange={(e) => handleStatusChange(booking.id, e.target.value)}
                                                        className="text-sm px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-yellow-400"
                                                    >
                                                        <option value="pending">قيد الانتظار</option>
                                                        <option value="confirmed">مؤكد</option>
                                                        <option value="cancelled">ملغي</option>
                                                        <option value="completed">مكتمل</option>
                                                    </select>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                }))}
                        </tbody>
                    </table>
                </div>
            </div>

            {isModalOpen && selectedBooking && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
                            <h2 className="text-xl font-bold text-gray-900">تفاصيل الطلب #{selectedBooking.id}</h2>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <FaTimes className="text-2xl" />
                            </button>
                        </div>

                        <div className="p-6">
                            <form onSubmit={handleUpdateBooking} className="space-y-6">
                                {/* Student Information */}
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">معلومات الطالب</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">الاسم</label>
                                            <p className="text-gray-900">{selectedBooking.student_name}</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">الهاتف</label>
                                            <p className="text-gray-900">{selectedBooking.student_phone}</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">البريد الإلكتروني</label>
                                            <p className="text-gray-900">{selectedBooking.student_email}</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">المدينة</label>
                                            <p className="text-gray-900">{selectedBooking.city}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">معلومات الحجز</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">المعلم</label>
                                            <p className="text-gray-900">{selectedBooking.teacher?.name_ar}</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">المادة</label>
                                            <p className="text-gray-900">{selectedBooking.subject}</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">عدد الحصص</label>
                                            <p className="text-gray-900">{Array.isArray(selectedBooking.selected_sessions) ? selectedBooking.selected_sessions.length : 0} حصة</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">السعر الإجمالي</label>
                                            <div className="flex items-center">
                                                <p className="font-bold">{selectedBooking.total_price}</p>
                                                <img src="/images/aed-currency(black).svg" alt="currency" className="w-5 h-5" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {selectedBooking.selected_sessions && Array.isArray(selectedBooking.selected_sessions) && (
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">تفاصيل الحصص</h3>
                                        <div className="space-y-2">
                                            {selectedBooking.selected_sessions.map((session, index) => (
                                                <div key={index} className="flex justify-between items-center bg-white p-3 rounded border">
                                                    <span className="text-sm text-gray-600">الحصة {index + 1}</span>
                                                    <span className="text-sm font-medium text-gray-900">
                                                        {new Date(session.date).toLocaleDateString('en-US')} - {session.time}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">تحديث الحالة والملاحظات</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">الحالة</label>
                                            <select
                                                value={updateData.status}
                                                onChange={(e) => setUpdateData('status', e.target.value)}
                                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                                            >
                                                <option value="pending">قيد الانتظار</option>
                                                <option value="confirmed">مؤكد</option>
                                                <option value="cancelled">ملغي</option>
                                                <option value="completed">مكتمل</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">ملاحظات</label>
                                            <textarea
                                                value={updateData.notes}
                                                onChange={(e) => setUpdateData('notes', e.target.value)}
                                                rows="4"
                                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                                                placeholder="أضف ملاحظات حول هذا الطلب..."
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 pt-4">
                                    <button
                                        type="submit"
                                        disabled={isUpdating}
                                        className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-3 rounded-lg transition duration-300"
                                    >
                                        {isUpdating ? 'جاري التحديث...' : 'حفظ التغييرات'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 rounded-lg transition duration-300"
                                    >
                                        إلغاء
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
