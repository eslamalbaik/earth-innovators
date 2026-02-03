import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { FaSearch, FaFilter, FaEye, FaEdit, FaTrash, FaDownload, FaEnvelope, FaCheck, FaTimes, FaClock, FaUser, FaCalendar, FaDollarSign, FaSpinner } from 'react-icons/fa';
import { useState } from 'react';

export default function BookingsIndex({ bookings, filters, auth, teachers }) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');
    const [teacherFilter, setTeacherFilter] = useState(filters.teacher_id || '');
    const [dateFrom, setDateFrom] = useState(filters.date_from || '');
    const [dateTo, setDateTo] = useState(filters.date_to || '');
    const [showFilters, setShowFilters] = useState(false);
    const [selectedBookings, setSelectedBookings] = useState([]);

    const { data, setData, post, processing, errors } = useForm({
        status: '',
        admin_notes: '',
        payment_status: '',
        payment_method: '',
        payment_reference: '',
    });

    // البيانات مفلترة بالفعل من الـ server
    const filteredBookings = bookings.data || [];

    const handleSearch = () => {
        const params = {};
        if (searchTerm) params.search = searchTerm;
        if (statusFilter && statusFilter !== 'all') params.status = statusFilter;
        if (teacherFilter) params.teacher_id = teacherFilter;
        if (dateFrom) params.date_from = dateFrom;
        if (dateTo) params.date_to = dateTo;

        router.get('/admin/bookings', params, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleStatusUpdate = (bookingId, newStatus) => {
        router.put(`/admin/bookings/${bookingId}/status`, {
            status: newStatus
        }, {
            preserveScroll: true,
            onSuccess: () => {
                router.reload({ only: ['bookings'] });
            }
        });
    };

    const handleDelete = async (bookingId) => {
        const confirmed = await confirm({
            title: 'تأكيد الحذف',
            message: 'هل أنت متأكد من حذف هذا الحجز؟ هذا الإجراء لا يمكن التراجع عنه.',
            confirmText: 'حذف',
            cancelText: 'إلغاء',
            variant: 'danger',
        });

        if (confirmed) {
            router.delete(`/admin/bookings/${bookingId}`, {
                preserveScroll: true,
                onSuccess: () => {
                    router.reload({ only: ['bookings'] });
                }
            });
        }
    };

    const handleBulkAction = (action) => {
        if (selectedBookings.length === 0) return;
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'approved':
                return 'bg-green-100 text-green-800';
            case 'rejected':
                return 'bg-red-100 text-red-800';
            case 'cancelled':
                return 'bg-gray-100 text-gray-800';
            case 'completed':
                return 'bg-blue-100 text-blue-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'pending':
                return 'في الانتظار';
            case 'approved':
                return 'موافق عليه';
            case 'rejected':
                return 'مرفوض';
            case 'cancelled':
                return 'ملغي';
            case 'completed':
                return 'مكتمل';
            default:
                return 'غير معروف';
        }
    };

    const getPaymentStatusColor = (status) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'paid':
                return 'bg-green-100 text-green-800';
            case 'refunded':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getPaymentStatusText = (status) => {
        switch (status) {
            case 'pending':
                return 'في الانتظار';
            case 'paid':
                return 'مدفوع';
            case 'refunded':
                return 'مسترد';
            default:
                return 'غير معروف';
        }
    };

    return (
        <DashboardLayout auth={auth}>
            <Head title="إدارة الطلبات" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">إدارة الطلبات</h1>
                                <p className="text-gray-600">عرض وإدارة جميع طلبات الحجز</p>
                            </div>
                            <div className="flex items-center space-x-4 space-x-reverse">
                                <button
                                    onClick={() => {
                                        const params = new URLSearchParams();
                                        if (searchTerm) params.append('search', searchTerm);
                                        if (statusFilter && statusFilter !== 'all') params.append('status', statusFilter);
                                        if (teacherFilter) params.append('teacher_id', teacherFilter);
                                        if (dateFrom) params.append('date_from', dateFrom);
                                        if (dateTo) params.append('date_to', dateTo);

                                        window.location.href = `/admin/bookings-export?${params.toString()}`;
                                    }}
                                    className="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-[#A3C042] transition duration-300"
                                >
                                    <FaDownload className="ml-2" />
                                    تصدير CSV
                                </button>
                                <button
                                    onClick={() => setShowFilters(!showFilters)}
                                    className="flex items-center px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition duration-300"
                                >
                                    <FaFilter className="ml-2" />
                                    فلترة
                                </button>
                            </div>
                        </div>
                    </div>

                    {showFilters && (
                        <div className="mb-6 bg-white rounded-lg shadow p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">فلترة الطلبات</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">البحث</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            placeholder="رقم الطلب، اسم الطالب، اسم المعلم..."
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                                        />
                                        <FaSearch className="absolute left-3 top-3 text-gray-400" />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">الحالة</label>
                                    <select
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                                    >
                                        <option value="all">جميع الحالات</option>
                                        <option value="pending">في الانتظار</option>
                                        <option value="approved">موافق عليه</option>
                                        <option value="rejected">مرفوض</option>
                                        <option value="cancelled">ملغي</option>
                                        <option value="completed">مكتمل</option>
                                    </select>
                                </div>

                                {teachers && teachers.length > 0 && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">المعلم</label>
                                        <select
                                            value={teacherFilter}
                                            onChange={(e) => setTeacherFilter(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                                        >
                                            <option value="">جميع المعلمين</option>
                                            {teachers.map((teacher) => (
                                                <option key={teacher.id} value={teacher.teacher.id}>
                                                    {teacher.teacher.name_ar || teacher.teacher.name_en || teacher.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">من تاريخ</label>
                                    <input
                                        type="date"
                                        value={dateFrom}
                                        onChange={(e) => setDateFrom(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">إلى تاريخ</label>
                                    <input
                                        type="date"
                                        value={dateTo}
                                        onChange={(e) => setDateTo(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-end space-x-4 space-x-reverse mt-4">
                                <button
                                    onClick={() => {
                                        setSearchTerm('');
                                        setStatusFilter('all');
                                        setTeacherFilter('');
                                        setDateFrom('');
                                        setDateTo('');
                                        router.get('/admin/bookings', {}, {
                                            preserveState: false,
                                        });
                                    }}
                                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition duration-300"
                                >
                                    مسح الفلاتر
                                </button>
                                <button
                                    onClick={handleSearch}
                                    className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition duration-300"
                                >
                                    تطبيق الفلاتر
                                </button>
                            </div>
                        </div>
                    )}

                    {selectedBookings.length > 0 && (
                        <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-blue-800">
                                    تم اختيار {selectedBookings.length} طلب
                                </span>
                                <div className="flex items-center space-x-2 space-x-reverse">
                                    <button
                                        onClick={() => handleBulkAction('approve')}
                                        className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-[#A3C042] transition duration-300"
                                    >
                                        موافقة
                                    </button>
                                    <button
                                        onClick={() => handleBulkAction('reject')}
                                        className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition duration-300"
                                    >
                                        رفض
                                    </button>
                                    <button
                                        onClick={() => setSelectedBookings([])}
                                        className="px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600 transition duration-300"
                                    >
                                        إلغاء
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3  text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            <input
                                                type="checkbox"
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setSelectedBookings(filteredBookings.map(b => b.id));
                                                    } else {
                                                        setSelectedBookings([]);
                                                    }
                                                }}
                                                className="rounded border-gray-300 text-yellow-600 shadow-sm focus:border-yellow-300 focus:ring focus:ring-yellow-200 focus:ring-opacity-50"
                                            />
                                        </th>
                                        <th className="px-6 py-3  text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            رقم الطلب
                                        </th>
                                        <th className="px-6 py-3  text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            الطالب
                                        </th>
                                        <th className="px-6 py-3  text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            المعلم
                                        </th>
                                        <th className="px-6 py-3  text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            التاريخ
                                        </th>
                                        <th className="px-6 py-3  text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            الوقت
                                        </th>
                                        <th className="px-6 py-3  text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            السعر
                                        </th>
                                        <th className="px-6 py-3  text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            الحالة
                                        </th>
                                        <th className="px-6 py-3  text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            حالة الدفع
                                        </th>
                                        <th className="px-6 py-3  text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            الإجراءات
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredBookings.map((booking) => (
                                        <tr key={booking.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedBookings.includes(booking.id)}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setSelectedBookings([...selectedBookings, booking.id]);
                                                        } else {
                                                            setSelectedBookings(selectedBookings.filter(id => id !== booking.id));
                                                        }
                                                    }}
                                                    className="rounded border-gray-300 text-yellow-600 shadow-sm focus:border-yellow-300 focus:ring focus:ring-yellow-200 focus:ring-opacity-50"
                                                />
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                #{booking.id}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10">
                                                        <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                                            <FaUser className="h-5 w-5 text-gray-600" />
                                                        </div>
                                                    </div>
                                                    <div className="mr-4">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {booking.student?.name || booking.student_name || 'غير محدد'}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {booking.student?.email || booking.student_email || 'غير محدد'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10">
                                                        <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                                            <FaUser className="h-5 w-5 text-gray-600" />
                                                        </div>
                                                    </div>
                                                    <div className="mr-4">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {booking.teacher?.user?.name || booking.teacher?.name_ar || 'غير محدد'}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {booking.teacher?.user?.email || 'غير محدد'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                <div className="flex items-center">
                                                    <FaCalendar className="ml-2 text-gray-400" />
                                                    {(() => {
                                                        const d = booking?.availability?.date
                                                            ? new Date(booking.availability.date)
                                                            : (booking?.date ? new Date(booking.date) : new Date(booking.created_at));
                                                        return d ? d.toLocaleDateString('en-US') : 'غير محدد';
                                                    })()}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                <div className="flex items-center">
                                                    <FaClock className="ml-2 text-gray-400" />
                                                    {(() => {
                                                        const t = booking?.availability?.start_time
                                                            ? new Date(booking.availability.start_time)
                                                            : (booking?.start_time ? new Date(`1970-01-01T${booking.start_time}`) : new Date(booking.created_at));
                                                        return t ? t.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : 'غير محدد';
                                                    })()}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                <div className="flex items-center">
                                                    <p className="text-md mt-1">{(booking.total_price || booking.price) ? `${booking.total_price || booking.price}` : 'غير محدد'}</p>
                                                    <img src="/images/aed-currency(black).svg" alt="currency" className="w-4 h-4" />
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                                                    {getStatusText(booking.status)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(booking.payment_status || (booking.payment_received ? 'paid' : 'pending'))}`}>
                                                    {getPaymentStatusText(booking.payment_status || (booking.payment_received ? 'paid' : 'pending'))}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex items-center space-x-2 space-x-reverse">
                                                    <button
                                                        onClick={() => router.get(`/admin/bookings/${booking.id}`)}
                                                        className="text-blue-600 hover:text-blue-900"
                                                        title="عرض التفاصيل"
                                                    >
                                                        <FaEye />
                                                    </button>
                                                    <button
                                                        onClick={() => router.get(`/admin/bookings/${booking.id}`)}
                                                        className="text-yellow-600 hover:text-yellow-900"
                                                        title="تعديل"
                                                    >
                                                        <FaEdit />
                                                    </button>
                                                    <button
                                                        onClick={() => handleStatusUpdate(booking.id, 'approved')}
                                                        className="text-green-600 hover:text-green-900"
                                                        title="موافقة"
                                                    >
                                                        <FaCheck />
                                                    </button>
                                                    <button
                                                        onClick={() => handleStatusUpdate(booking.id, 'rejected')}
                                                        className="text-red-600 hover:text-red-900"
                                                        title="رفض"
                                                    >
                                                        <FaTimes />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(booking.id)}
                                                        className="text-red-600 hover:text-red-900"
                                                        title="حذف"
                                                    >
                                                        <FaTrash />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {bookings.links && (
                            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                                <div className="flex-1 flex justify-between sm:hidden">
                                    {bookings.prev_page_url && (
                                        <button
                                            onClick={() => router.get(bookings.prev_page_url)}
                                            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                        >
                                            السابق
                                        </button>
                                    )}
                                    {bookings.next_page_url && (
                                        <button
                                            onClick={() => router.get(bookings.next_page_url)}
                                            className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                        >
                                            التالي
                                        </button>
                                    )}
                                </div>
                                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                    <div>
                                        <p className="text-sm text-gray-700">
                                            عرض <span className="font-medium">{bookings.from}</span> إلى <span className="font-medium">{bookings.to}</span> من <span className="font-medium">{bookings.total}</span> نتيجة
                                        </p>
                                    </div>
                                    <div>
                                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                                            {bookings.links.map((link, index) => (
                                                <button
                                                    key={index}
                                                    onClick={() => link.url && router.get(link.url)}
                                                    disabled={!link.url}
                                                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${link.active
                                                        ? 'z-10 bg-yellow-50 border-yellow-500 text-yellow-600'
                                                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                                        } ${!link.url ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                                />
                                            ))}
                                        </nav>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
