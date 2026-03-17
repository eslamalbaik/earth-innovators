import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { FaCalendar, FaCheckCircle, FaClock, FaEye, FaEdit, FaTimes, FaSearch } from 'react-icons/fa';
import { useState } from 'react';
import { useTranslation } from '@/i18n';

export default function Bookings({ bookings, auth }) {
    const { t, language } = useTranslation();
    const locale = language === 'ar' ? 'ar' : 'en-US';
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
        pending: t('bookings.pending'),
        confirmed: t('bookings.confirmed'),
        cancelled: t('bookings.cancelled'),
        completed: t('bookings.completed'),
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
        <DashboardLayout header={t('adminBookingsPage.title')} auth={auth}>
            <Head title={t('adminBookingsPage.pageTitle', { appName: t('common.appName') })} />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <div className="bg-white rounded-xl shadow-lg p-6 border-r-4 border-blue-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">{t('adminBookingsPage.stats.totalBookings')}</p>
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
                            <p className="text-sm text-gray-600 mb-1">{t('adminBookingsPage.stats.pending')}</p>
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
                            <p className="text-sm text-gray-600 mb-1">{t('adminBookingsPage.stats.confirmed')}</p>
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
                            <p className="text-sm text-gray-600 mb-1">{t('adminBookingsPage.stats.completed')}</p>
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
                            placeholder={t('adminBookingsPage.searchPlaceholder')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full ps-12 pe-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                        />
                    </div>
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400"
                    >
                        <option value="">{t('adminBookingsPage.filters.allStatuses')}</option>
                        <option value="pending">{statusLabels.pending}</option>
                        <option value="confirmed">{statusLabels.confirmed}</option>
                        <option value="cancelled">{statusLabels.cancelled}</option>
                        <option value="completed">{statusLabels.completed}</option>
                    </select>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gradient-to-r from-yellow-50 to-yellow-100">
                            <tr>
                                <th className="px-6 py-3  text-xs font-medium text-gray-700 uppercase">{t('adminBookingsPage.table.bookingNumber')}</th>
                                <th className="px-6 py-3  text-xs font-medium text-gray-700 uppercase">{t('adminBookingsPage.table.student')}</th>
                                <th className="px-6 py-3  text-xs font-medium text-gray-700 uppercase">{t('adminBookingsPage.table.teacher')}</th>
                                <th className="px-6 py-3  text-xs font-medium text-gray-700 uppercase">{t('adminBookingsPage.table.subject')}</th>
                                <th className="px-6 py-3  text-xs font-medium text-gray-700 uppercase">{t('adminBookingsPage.table.sessions')}</th>
                                <th className="px-6 py-3  text-xs font-medium text-gray-700 uppercase">{t('adminBookingsPage.table.total')}</th>
                                <th className="px-6 py-3  text-xs font-medium text-gray-700 uppercase">{t('adminBookingsPage.table.status')}</th>
                                <th className="px-6 py-3  text-xs font-medium text-gray-700 uppercase">{t('adminBookingsPage.table.date')}</th>
                                <th className="px-6 py-3  text-xs font-medium text-gray-700 uppercase">{t('adminBookingsPage.table.actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredBookings.length === 0 ? (
                                <tr>
                                    <td colSpan="9" className="px-6 py-12 text-center text-gray-500">
                                        <FaCalendar className="mx-auto text-4xl mb-4 text-gray-300" />
                                        <p>{t('adminBookingsPage.table.noResults')}</p>
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
                                                <div className="text-sm text-gray-900">
                                                    {t('adminBookingsPage.table.sessionsCount', { count: sessionsCount })}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <p className="text-xl mt-1">{stats.total_price}</p>
                                                    <img src="/images/aed-currency(black).svg" alt="currency" className="w-6 h-6" />
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-3 py-1 inline-flex items-center text-xs font-semibold rounded-full ${statusColors[booking.status]}`}>
                                                    <StatusIcon className="me-1" />
                                                    {statusLabels[booking.status]}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-500">{new Date(booking.created_at).toLocaleDateString(locale)}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-left">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => handleViewBooking(booking)}
                                                        className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded transition"
                                                        title={t('adminBookingsPage.table.viewDetails')}
                                                    >
                                                        <FaEye />
                                                    </button>
                                                    <select
                                                        value={booking.status}
                                                        onChange={(e) => handleStatusChange(booking.id, e.target.value)}
                                                        className="text-sm px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-yellow-400"
                                                    >
                                                        <option value="pending">{statusLabels.pending}</option>
                                                        <option value="confirmed">{statusLabels.confirmed}</option>
                                                        <option value="cancelled">{statusLabels.cancelled}</option>
                                                        <option value="completed">{statusLabels.completed}</option>
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
                            <h2 className="text-xl font-bold text-gray-900">
                                {t('adminBookingsPage.modal.title', { id: selectedBooking.id })}
                            </h2>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <FaTimes className="text-2xl" />
                            </button>
                        </div>

                        <div className="p-6">
                            <form onSubmit={handleUpdateBooking} className="space-y-6">
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('adminBookingsPage.modal.studentInfoTitle')}</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">{t('adminBookingsPage.modal.studentName')}</label>
                                            <p className="text-gray-900">{selectedBooking.student_name}</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">{t('adminBookingsPage.modal.studentPhone')}</label>
                                            <p className="text-gray-900">{selectedBooking.student_phone}</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">{t('adminBookingsPage.modal.studentEmail')}</label>
                                            <p className="text-gray-900">{selectedBooking.student_email}</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">{t('adminBookingsPage.modal.studentCity')}</label>
                                            <p className="text-gray-900">{selectedBooking.city}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('adminBookingsPage.modal.bookingInfoTitle')}</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">{t('adminBookingsPage.modal.teacher')}</label>
                                            <p className="text-gray-900">{selectedBooking.teacher?.name_ar}</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">{t('adminBookingsPage.modal.subject')}</label>
                                            <p className="text-gray-900">{selectedBooking.subject}</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">{t('adminBookingsPage.modal.sessionsCount')}</label>
                                            <p className="text-gray-900">
                                                {t('adminBookingsPage.modal.sessionsValue', {
                                                    count: Array.isArray(selectedBooking.selected_sessions) ? selectedBooking.selected_sessions.length : 0,
                                                })}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">{t('adminBookingsPage.modal.totalPrice')}</label>
                                            <div className="flex items-center">
                                                <p className="font-bold">{selectedBooking.total_price}</p>
                                                <img src="/images/aed-currency(black).svg" alt="currency" className="w-5 h-5" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {selectedBooking.selected_sessions && Array.isArray(selectedBooking.selected_sessions) && (
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('adminBookingsPage.modal.sessionsDetailsTitle')}</h3>
                                        <div className="space-y-2">
                                            {selectedBooking.selected_sessions.map((session, index) => (
                                                <div key={index} className="flex justify-between items-center bg-white p-3 rounded border">
                                                    <span className="text-sm text-gray-600">
                                                        {t('adminBookingsPage.modal.sessionLabel', { index: index + 1 })}
                                                    </span>
                                                    <span className="text-sm font-medium text-gray-900">
                                                        {new Date(session.date).toLocaleDateString(locale)} - {session.time}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('adminBookingsPage.modal.updateTitle')}</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">{t('adminBookingsPage.modal.statusLabel')}</label>
                                            <select
                                                value={updateData.status}
                                                onChange={(e) => setUpdateData('status', e.target.value)}
                                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                                            >
                                                <option value="pending">{statusLabels.pending}</option>
                                                <option value="confirmed">{statusLabels.confirmed}</option>
                                                <option value="cancelled">{statusLabels.cancelled}</option>
                                                <option value="completed">{statusLabels.completed}</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">{t('adminBookingsPage.modal.notesLabel')}</label>
                                            <textarea
                                                value={updateData.notes}
                                                onChange={(e) => setUpdateData('notes', e.target.value)}
                                                rows="4"
                                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                                                placeholder={t('adminBookingsPage.modal.notesPlaceholder')}
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
                                        {isUpdating ? t('adminBookingsPage.modal.updating') : t('adminBookingsPage.modal.saveChanges')}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 rounded-lg transition duration-300"
                                    >
                                        {t('common.cancel')}
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
