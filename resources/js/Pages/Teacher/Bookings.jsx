import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, router } from '@inertiajs/react';
import { FaCalendar, FaTrash } from 'react-icons/fa';
import { useState } from 'react';
import axios from 'axios';

export default function TeacherBookings({ bookings }) {
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [bookingToDelete, setBookingToDelete] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [updating, setUpdating] = useState(null);
    const statusColors = {
        pending: 'bg-yellow-100 text-yellow-800',
        confirmed: 'bg-green-100 text-green-800',
        cancelled: 'bg-red-100 text-red-800',
        completed: 'bg-blue-100 text-blue-800',
        approved: 'bg-green-100 text-green-800',
        rejected: 'bg-red-100 text-red-800',
    };

    const statusLabels = {
        pending: 'قيد الانتظار',
        confirmed: 'مؤكد',
        cancelled: 'ملغي',
        completed: 'مكتمل',
        approved: 'مؤكد',
        rejected: 'مرفوض',
    };

    const all = bookings?.data || [];
    const countBy = (s) => all.filter(b => b.status === s).length;

    const getSessionsCount = (booking) => {
        if (Array.isArray(booking.selected_sessions)) return booking.selected_sessions.length;
        try {
            const parsed = JSON.parse(booking.selected_sessions || '[]');
            return Array.isArray(parsed) ? parsed.length : 0;
        } catch {
            return 0;
        }
    };

    const handleStatusChange = async (bookingId, newStatus) => {
        if (!bookingId || !newStatus) return;

        setUpdating(bookingId);
        const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
        if (token) {
            axios.defaults.headers.common['X-CSRF-TOKEN'] = token;
        }

        try {
            const response = await axios.put(`/bookings/${bookingId}/status`, {
                status: newStatus
            });

            if (response.data.success) {
                router.reload({ only: ['bookings'] });
            } else {
                alert(response.data.message || 'حدث خطأ أثناء تحديث الحالة');
            }
        } catch (error) {
            console.error('Status update error:', error);
            const errorMessage = error.response?.data?.message || error.response?.data?.error || 'حدث خطأ أثناء تحديث الحالة';
            alert(errorMessage);
            // إعادة تحميل الصفحة لإعادة الحالة الأصلية
            router.reload({ only: ['bookings'] });
        } finally {
            setUpdating(null);
        }
    };

    const handleDeleteClick = (booking) => {
        setBookingToDelete(booking);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!bookingToDelete) return;

        setDeleting(true);
        const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
        if (token) {
            axios.defaults.headers.common['X-CSRF-TOKEN'] = token;
        }

        try {
            await axios.delete(`/bookings/${bookingToDelete.id}`);
            setShowDeleteModal(false);
            setBookingToDelete(null);
            router.reload({ only: ['bookings'] });
        } catch (error) {
            alert(error.response?.data?.message || 'حدث خطأ أثناء حذف الحجز');
        } finally {
            setDeleting(false);
        }
    };

    const closeDeleteModal = () => {
        setShowDeleteModal(false);
        setBookingToDelete(null);
    };

    return (
        <DashboardLayout header="حجوزاتي">
            <Head title="حجوزاتي" />

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <div className="bg-white rounded-xl shadow-lg p-6 border-r-4 border-blue-500">
                    <p className="text-sm text-gray-600 mb-1">إجمالي الحجوزات</p>
                    <p className="text-3xl font-bold text-gray-900">{bookings?.total || 0}</p>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-6 border-r-4 border-yellow-500">
                    <p className="text-sm text-gray-600 mb-1">قيد الانتظار</p>
                    <p className="text-3xl font-bold text-yellow-600">{countBy('pending')}</p>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-6 border-r-4 border-green-500">
                    <p className="text-sm text-gray-600 mb-1">مؤكد</p>
                    <p className="text-3xl font-bold text-green-600">{countBy('confirmed') + countBy('approved')}</p>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-6 border-r-4 border-purple-500">
                    <p className="text-sm text-gray-600 mb-1">مكتمل</p>
                    <p className="text-3xl font-bold text-purple-600">{countBy('completed')}</p>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gradient-to-r from-yellow-50 to-yellow-100">
                            <tr>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase">رقم الحجز</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase">الطالب</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase">المادة</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase">عدد الحصص</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase">الإجمالي</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase">الحالة</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase">التاريخ</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {all.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                                        <FaCalendar className="mx-auto text-4xl mb-4 text-gray-300" />
                                        <p>لا توجد حجوزات</p>
                                    </td>
                                </tr>
                            ) : (
                                all.map((booking) => (
                                    <tr key={booking.id} className="hover:bg-gray-50 transition">
                                        <td className="px-6 py-4 whitespace-nowrap">#{booking.id}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{booking.student_name || booking.student?.name || '—'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{booking.subject || '—'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{getSessionsCount(booking)} حصة</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <p className="text-lg mt-1">{booking.total_price}</p>
                                                <img src="/images/sar-currency(black).svg" alt="currency" className="w-5 h-5" />
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <select
                                                value={booking.status}
                                                onChange={(e) => handleStatusChange(booking.id, e.target.value)}
                                                disabled={updating === booking.id}
                                                className={`px-3 py-1.5 text-xs font-semibold rounded-lg border ${statusColors[booking.status] || 'bg-gray-100 text-gray-700'} ${updating === booking.id ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:opacity-80'} transition duration-200`}
                                            >
                                                <option value="pending">قيد الانتظار</option>
                                                <option value="approved">مؤكد</option>
                                                <option value="rejected">مرفوض</option>
                                                <option value="completed">مكتمل</option>
                                            </select>
                                            {updating === booking.id && (
                                                <span className="mr-2 text-xs text-gray-500">جاري التحديث...</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">{new Date(booking.created_at).toLocaleDateString('en-US')}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleDeleteClick(booking)}
                                                    className="text-red-500 hover:text-red-700 transition duration-300 p-2 hover:bg-red-50 rounded-lg"
                                                    title="حذف الحجز"
                                                >
                                                    <FaTrash className="text-sm" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {showDeleteModal && bookingToDelete && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={closeDeleteModal}>
                    <div className="bg-white rounded-lg p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">تأكيد الحذف</h3>
                        <p className="text-gray-600 mb-6">
                            هل أنت متأكد من حذف الحجز رقم <strong>#{bookingToDelete.id}</strong>؟
                            <br />
                            هذا الإجراء لا يمكن التراجع عنه.
                        </p>
                        <div className="flex items-center justify-end space-x-4 space-x-reverse">
                            <button
                                onClick={closeDeleteModal}
                                disabled={deleting}
                                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition duration-300 disabled:opacity-50"
                            >
                                إلغاء
                            </button>
                            <button
                                onClick={confirmDelete}
                                disabled={deleting}
                                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-300 disabled:opacity-50"
                            >
                                {deleting ? 'جاري الحذف...' : 'حذف'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
