import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { FaArrowRight, FaEdit, FaSave, FaEnvelope, FaUser, FaCalendar, FaClock, FaDollarSign, FaCheck, FaTimes, FaSpinner, FaPhone, FaMapMarkerAlt, FaGraduationCap } from 'react-icons/fa';
import { useState } from 'react';

export default function BookingShow({ booking, auth }) {
    const [isEditing, setIsEditing] = useState(false);
    const [showEmailModal, setShowEmailModal] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        status: booking.status || '',
        admin_notes: booking.admin_notes || '',
        payment_status: booking.payment_status || '',
        payment_method: booking.payment_method || '',
        payment_reference: booking.payment_reference || '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        router.put(`/admin/bookings/${booking.id}/status`, data, {
            preserveScroll: true,
            onSuccess: () => {
                setIsEditing(false);
                router.reload({ only: ['booking'] });
            }
        });
    };

    const handleStatusUpdate = (newStatus) => {
        router.put(`/admin/bookings/${booking.id}/status`, {
            status: newStatus
        }, {
            preserveScroll: true,
            onSuccess: () => {
                router.reload({ only: ['booking'] });
            }
        });
    };

    const handleDelete = () => {
        if (confirm('هل أنت متأكد من حذف هذا الحجز؟ هذا الإجراء لا يمكن التراجع عنه.')) {
            router.delete(`/admin/bookings/${booking.id}`, {
                onSuccess: () => {
                    router.visit('/admin/bookings');
                }
            });
        }
    };

    const handleSendEmail = () => {
        setShowEmailModal(true);
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
            <Head title={`تفاصيل الطلب #${booking.id}`} />

            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4 space-x-reverse">
                                <button
                                    onClick={() => router.get('/admin/bookings')}
                                    className="flex items-center text-gray-600 hover:text-gray-900 transition duration-300"
                                >
                                    <FaArrowRight className="ml-2" />
                                    العودة
                                </button>
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900">تفاصيل الطلب #{booking.id}</h1>
                                    <p className="text-gray-600">عرض وإدارة تفاصيل طلب الحجز</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-4 space-x-reverse">
                                <button
                                    onClick={handleSendEmail}
                                    className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300"
                                >
                                    <FaEnvelope className="ml-2" />
                                    إرسال إيميل
                                </button>
                                <button
                                    onClick={() => setIsEditing(!isEditing)}
                                    className="flex items-center px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition duration-300"
                                >
                                    <FaEdit className="ml-2" />
                                    {isEditing ? 'إلغاء التعديل' : 'تعديل'}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-white rounded-lg shadow p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">حالة الطلب</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">حالة الطلب</label>
                                        {isEditing ? (
                                            <select
                                                value={data.status}
                                                onChange={(e) => setData('status', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                                            >
                                                <option value="pending">في الانتظار</option>
                                                <option value="approved">موافق عليه</option>
                                                <option value="rejected">مرفوض</option>
                                                <option value="cancelled">ملغي</option>
                                                <option value="completed">مكتمل</option>
                                            </select>
                                        ) : (
                                            <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                                                {getStatusText(booking.status)}
                                            </span>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">حالة الدفع</label>
                                        {isEditing ? (
                                            <select
                                                value={data.payment_status}
                                                onChange={(e) => setData('payment_status', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                                            >
                                                <option value="pending">في الانتظار</option>
                                                <option value="paid">مدفوع</option>
                                                <option value="refunded">مسترد</option>
                                            </select>
                                        ) : (
                                            <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getPaymentStatusColor(booking.payment_status)}`}>
                                                {getPaymentStatusText(booking.payment_status)}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">معلومات الطالب</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">الاسم</label>
                                        <div className="flex items-center">
                                            <FaUser className="ml-2 text-gray-400" />
                                            <span className="text-gray-900">
                                                {(booking.student && booking.student.name) ? booking.student.name : (booking.student_name || 'غير محدد')}
                                            </span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">البريد الإلكتروني</label>
                                        <div className="flex items-center">
                                            <FaEnvelope className="ml-2 text-gray-400" />
                                            <span className="text-gray-900">
                                                {(booking.student && booking.student.email) ? booking.student.email : (booking.student_email || 'غير محدد')}
                                            </span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">رقم الجوال</label>
                                        <div className="flex items-center">
                                            <FaPhone className="ml-2 text-gray-400" />
                                            <span className="text-gray-900">
                                                {(booking.student && booking.student.phone) ? booking.student.phone : (booking.student_phone || 'غير محدد')}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Teacher Information */}
                            <div className="bg-white rounded-lg shadow p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">معلومات المعلم</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">الاسم</label>
                                        <div className="flex items-center">
                                            <FaUser className="ml-2 text-gray-400" />
                                            <span className="text-gray-900">{booking.teacher?.user?.name || 'غير محدد'}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">البريد الإلكتروني</label>
                                        <div className="flex items-center">
                                            <FaEnvelope className="ml-2 text-gray-400" />
                                            <span className="text-gray-900">{booking.teacher?.user?.email || 'غير محدد'}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">المدينة</label>
                                        <div className="flex items-center">
                                            <FaMapMarkerAlt className="ml-2 text-gray-400" />
                                            <span className="text-gray-900">{booking.teacher?.city || 'غير محدد'}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">المواد</label>
                                        <div className="flex items-center">
                                            <FaGraduationCap className="ml-2 text-gray-400" />
                                            <span className="text-gray-900">
                                                {booking.teacher?.subjects ? booking.teacher.subjects.join(', ') : 'غير محدد'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">تفاصيل الحجز</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">التاريخ</label>
                                        <div className="flex items-center">
                                            <FaCalendar className="ml-2 text-gray-400" />
                                            <span className="text-gray-900">
                                                {booking.availability?.date ? new Date(booking.availability.date).toLocaleDateString('en-US') : 'غير محدد'}
                                            </span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">الوقت</label>
                                        <div className="flex items-center">
                                            <FaClock className="ml-2 text-gray-400" />
                                            <span className="text-gray-900">
                                                {booking.availability?.start_time ? new Date(booking.availability.start_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : 'غير محدد'}
                                            </span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">السعر</label>
                                        <div className="flex items-center">
                                            <FaDollarSign className="ml-2 text-gray-400" />
                                            <span className="text-gray-900">{booking.price ? `${booking.price} ريال` : 'غير محدد'}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">طريقة الدفع</label>
                                        <span className="text-gray-900">{booking.payment_method || 'غير محدد'}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">الملاحظات</h3>
                                <div className="space-y-4">
                                    {booking.student_notes && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">ملاحظات الطالب</label>
                                            <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{booking.student_notes}</p>
                                        </div>
                                    )}
                                    {booking.teacher_notes && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">ملاحظات المعلم</label>
                                            <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{booking.teacher_notes}</p>
                                        </div>
                                    )}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">ملاحظات الإدارة</label>
                                        {isEditing ? (
                                            <textarea
                                                value={data.admin_notes}
                                                onChange={(e) => setData('admin_notes', e.target.value)}
                                                rows="3"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                                                placeholder="أضف ملاحظات الإدارة..."
                                            />
                                        ) : (
                                            <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{booking.admin_notes || 'لا توجد ملاحظات'}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-1 space-y-6">
                            <div className="bg-white rounded-lg shadow p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">الإجراءات السريعة</h3>
                                <div className="space-y-3">
                                    <button
                                        onClick={() => handleStatusUpdate('approved')}
                                        className="w-full flex items-center justify-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition duration-300"
                                    >
                                        <FaCheck className="ml-2" />
                                        موافقة
                                    </button>
                                    <button
                                        onClick={() => handleStatusUpdate('rejected')}
                                        className="w-full flex items-center justify-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-300"
                                    >
                                        <FaTimes className="ml-2" />
                                        رفض
                                    </button>
                                    <button
                                        onClick={() => handleStatusUpdate('completed')}
                                        className="w-full flex items-center justify-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300"
                                    >
                                        <FaCheck className="ml-2" />
                                        إكمال
                                    </button>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">معلومات الدفع</h3>
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">طريقة الدفع</label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={data.payment_method}
                                                onChange={(e) => setData('payment_method', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                                                placeholder="طريقة الدفع..."
                                            />
                                        ) : (
                                            <span className="text-gray-900">{booking.payment_method || 'غير محدد'}</span>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">رقم المرجع</label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={data.payment_reference}
                                                onChange={(e) => setData('payment_reference', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                                                placeholder="رقم المرجع..."
                                            />
                                        ) : (
                                            <span className="text-gray-900">{booking.payment_reference || 'غير محدد'}</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">التواريخ</h3>
                                <div className="space-y-3 text-sm">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ الإنشاء</label>
                                        <span className="text-gray-900">
                                            {booking.created_at ? new Date(booking.created_at).toLocaleString('en-US') : 'غير محدد'}
                                        </span>
                                    </div>
                                    {booking.approved_at && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ الموافقة</label>
                                            <span className="text-gray-900">
                                                {new Date(booking.approved_at).toLocaleString('en-US')}
                                            </span>
                                        </div>
                                    )}
                                    {booking.rejected_at && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ الرفض</label>
                                            <span className="text-gray-900">
                                                {new Date(booking.rejected_at).toLocaleString('en-US')}
                                            </span>
                                        </div>
                                    )}
                                    {booking.completed_at && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ الإكمال</label>
                                            <span className="text-gray-900">
                                                {new Date(booking.completed_at).toLocaleString('en-US')}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {isEditing && (
                        <div className="mt-6 flex items-center justify-end">
                            <button
                                onClick={handleSubmit}
                                disabled={processing}
                                className="flex items-center px-6 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 disabled:opacity-50 transition duration-300"
                            >
                                {processing ? <FaSpinner className="animate-spin ml-2" /> : <FaSave className="ml-2" />}
                                {processing ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
