import DashboardLayout from '@/Layouts/DashboardLayout';
import { useConfirmDialog } from '@/Contexts/ConfirmContext';
import { Head, useForm, router } from '@inertiajs/react';
import { FaArrowRight, FaEdit, FaSave, FaEnvelope, FaUser, FaCalendar, FaClock, FaDollarSign, FaCheck, FaTimes, FaSpinner, FaPhone, FaMapMarkerAlt, FaGraduationCap } from 'react-icons/fa';
import { useState } from 'react';
import { useTranslation } from '@/i18n';

export default function BookingShow({ booking, auth }) {
    const { confirm } = useConfirmDialog();
    const { t, language } = useTranslation();
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

    const handleDelete = async () => {
        const confirmed = await confirm({
            title: t('adminBookingsIndexPage.deleteConfirm.title'),
            message: t('adminBookingsIndexPage.deleteConfirm.message'),
            confirmText: t('common.delete'),
            cancelText: t('common.cancel'),
            variant: 'danger',
        });

        if (confirmed) {
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
                return t('adminBookingsIndexPage.status.pending');
            case 'approved':
                return t('adminBookingsIndexPage.status.approved');
            case 'rejected':
                return t('adminBookingsIndexPage.status.rejected');
            case 'cancelled':
                return t('adminBookingsIndexPage.status.cancelled');
            case 'completed':
                return t('adminBookingsIndexPage.status.completed');
            default:
                return t('adminBookingsIndexPage.status.unknown');
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
                return t('adminBookingsIndexPage.paymentStatus.pending');
            case 'paid':
                return t('adminBookingsIndexPage.paymentStatus.paid');
            case 'refunded':
                return t('adminBookingsIndexPage.paymentStatus.refunded');
            default:
                return t('adminBookingsIndexPage.paymentStatus.unknown');
        }
    };

    return (
        <DashboardLayout auth={auth}>
            <Head title={t('adminBookingsShowPage.pageTitle', { id: booking.id, appName: t('common.appName') })} />

            <div dir={language === 'ar' ? 'rtl' : 'ltr'} className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4 space-x-reverse">
                                <button
                                    onClick={() => router.get('/admin/bookings')}
                                    className="flex items-center text-gray-600 hover:text-gray-900 transition duration-300"
                                >
                                    <FaArrowRight className="me-2" />
                                    {t('common.back')}
                                </button>
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900">{t('adminBookingsShowPage.title', { id: booking.id })}</h1>
                                    <p className="text-gray-600">{t('adminBookingsShowPage.subtitle')}</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-4 space-x-reverse">
                                <button
                                    onClick={handleSendEmail}
                                    className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-[#A3C042] transition duration-300"
                                >
                                    <FaEnvelope className="me-2" />
                                    {t('adminBookingsShowPage.actions.sendEmail')}
                                </button>
                                <button
                                    onClick={() => setIsEditing(!isEditing)}
                                    className="flex items-center px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition duration-300"
                                >
                                    <FaEdit className="me-2" />
                                    {isEditing ? t('adminBookingsShowPage.actions.cancelEdit') : t('common.edit')}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-white rounded-lg shadow p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('adminBookingsShowPage.sections.status')}</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">{t('adminBookingsShowPage.fields.bookingStatus')}</label>
                                        {isEditing ? (
                                            <select
                                                value={data.status}
                                                onChange={(e) => setData('status', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                                            >
                                                <option value="pending">{t('adminBookingsIndexPage.status.pending')}</option>
                                                <option value="approved">{t('adminBookingsIndexPage.status.approved')}</option>
                                                <option value="rejected">{t('adminBookingsIndexPage.status.rejected')}</option>
                                                <option value="cancelled">{t('adminBookingsIndexPage.status.cancelled')}</option>
                                                <option value="completed">{t('adminBookingsIndexPage.status.completed')}</option>
                                            </select>
                                        ) : (
                                            <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                                                {getStatusText(booking.status)}
                                            </span>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">{t('adminBookingsShowPage.fields.paymentStatus')}</label>
                                        {isEditing ? (
                                            <select
                                                value={data.payment_status}
                                                onChange={(e) => setData('payment_status', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                                            >
                                                <option value="pending">{t('adminBookingsIndexPage.paymentStatus.pending')}</option>
                                                <option value="paid">{t('adminBookingsIndexPage.paymentStatus.paid')}</option>
                                                <option value="refunded">{t('adminBookingsIndexPage.paymentStatus.refunded')}</option>
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
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('adminBookingsShowPage.sections.studentInfo')}</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">{t('common.name')}</label>
                                        <div className="flex items-center">
                                            <FaUser className="me-2 text-gray-400" />
                                            <span className="text-gray-900">
                                                {(booking.student && booking.student.name) ? booking.student.name : (booking.student_name || t('common.notAvailable'))}
                                            </span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">{t('common.email')}</label>
                                        <div className="flex items-center">
                                            <FaEnvelope className="me-2 text-gray-400" />
                                            <span className="text-gray-900">
                                                {(booking.student && booking.student.email) ? booking.student.email : (booking.student_email || t('common.notAvailable'))}
                                            </span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">{t('adminBookingsShowPage.fields.phone')}</label>
                                        <div className="flex items-center">
                                            <FaPhone className="me-2 text-gray-400" />
                                            <span className="text-gray-900">
                                                {(booking.student && booking.student.phone) ? booking.student.phone : (booking.student_phone || t('common.notAvailable'))}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Teacher Information */}
                            <div className="bg-white rounded-lg shadow p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('adminBookingsShowPage.sections.teacherInfo')}</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">{t('common.name')}</label>
                                        <div className="flex items-center">
                                            <FaUser className="me-2 text-gray-400" />
                                            <span className="text-gray-900">{booking.teacher?.user?.name || t('common.notAvailable')}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">{t('common.email')}</label>
                                        <div className="flex items-center">
                                            <FaEnvelope className="me-2 text-gray-400" />
                                            <span className="text-gray-900">{booking.teacher?.user?.email || t('common.notAvailable')}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">{t('common.city')}</label>
                                        <div className="flex items-center">
                                            <FaMapMarkerAlt className="me-2 text-gray-400" />
                                            <span className="text-gray-900">{booking.teacher?.city || t('common.notAvailable')}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">{t('common.subjects')}</label>
                                        <div className="flex items-center">
                                            <FaGraduationCap className="me-2 text-gray-400" />
                                            <span className="text-gray-900">
                                                {booking.teacher?.subjects ? booking.teacher.subjects.join(', ') : t('common.notAvailable')}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('adminBookingsShowPage.sections.bookingDetails')}</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">{t('common.date')}</label>
                                        <div className="flex items-center">
                                            <FaCalendar className="me-2 text-gray-400" />
                                            <span className="text-gray-900">
                                                {booking.availability?.date ? new Date(booking.availability.date).toLocaleDateString('en-US') : t('common.notAvailable')}
                                            </span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">{t('common.time')}</label>
                                        <div className="flex items-center">
                                            <FaClock className="me-2 text-gray-400" />
                                            <span className="text-gray-900">
                                                {booking.availability?.start_time ? new Date(booking.availability.start_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : t('common.notAvailable')}
                                            </span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">{t('common.price')}</label>
                                        <div className="flex items-center">
                                            <FaDollarSign className="me-2 text-gray-400" />
                                            <span className="text-gray-900">{booking.price ? t('adminBookingsShowPage.priceSar', { price: booking.price }) : t('common.notAvailable')}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">{t('adminBookingsShowPage.fields.paymentMethod')}</label>
                                        <span className="text-gray-900">{booking.payment_method || t('common.notAvailable')}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('adminBookingsShowPage.sections.notes')}</h3>
                                <div className="space-y-4">
                                    {booking.student_notes && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">{t('adminBookingsShowPage.fields.studentNotes')}</label>
                                            <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{booking.student_notes}</p>
                                        </div>
                                    )}
                                    {booking.teacher_notes && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">{t('adminBookingsShowPage.fields.teacherNotes')}</label>
                                            <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{booking.teacher_notes}</p>
                                        </div>
                                    )}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">{t('adminBookingsShowPage.fields.adminNotes')}</label>
                                        {isEditing ? (
                                            <textarea
                                                value={data.admin_notes}
                                                onChange={(e) => setData('admin_notes', e.target.value)}
                                                rows="3"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                                                placeholder={t('adminBookingsShowPage.placeholders.adminNotes')}
                                            />
                                        ) : (
                                            <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{booking.admin_notes || t('adminBookingsShowPage.noNotes')}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-1 space-y-6">
                            <div className="bg-white rounded-lg shadow p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('adminBookingsShowPage.sections.quickActions')}</h3>
                                <div className="space-y-3">
                                    <button
                                        onClick={() => handleStatusUpdate('approved')}
                                        className="w-full flex items-center justify-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-[#A3C042] transition duration-300"
                                    >
                                        <FaCheck className="me-2" />
                                        {t('adminBookingsShowPage.actions.approve')}
                                    </button>
                                    <button
                                        onClick={() => handleStatusUpdate('rejected')}
                                        className="w-full flex items-center justify-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-300"
                                    >
                                        <FaTimes className="me-2" />
                                        {t('adminBookingsShowPage.actions.reject')}
                                    </button>
                                    <button
                                        onClick={() => handleStatusUpdate('completed')}
                                        className="w-full flex items-center justify-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-[#A3C042] transition duration-300"
                                    >
                                        <FaCheck className="me-2" />
                                        {t('adminBookingsShowPage.actions.complete')}
                                    </button>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('adminBookingsShowPage.sections.paymentInfo')}</h3>
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('adminBookingsShowPage.fields.paymentMethod')}</label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={data.payment_method}
                                                onChange={(e) => setData('payment_method', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                                                placeholder={t('adminBookingsShowPage.placeholders.paymentMethod')}
                                            />
                                        ) : (
                                            <span className="text-gray-900">{booking.payment_method || t('common.notAvailable')}</span>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('adminBookingsShowPage.fields.paymentReference')}</label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={data.payment_reference}
                                                onChange={(e) => setData('payment_reference', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                                                placeholder={t('adminBookingsShowPage.placeholders.paymentReference')}
                                            />
                                        ) : (
                                            <span className="text-gray-900">{booking.payment_reference || t('common.notAvailable')}</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('adminBookingsShowPage.sections.dates')}</h3>
                                <div className="space-y-3 text-sm">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('adminBookingsShowPage.fields.createdAt')}</label>
                                        <span className="text-gray-900">
                                            {booking.created_at ? new Date(booking.created_at).toLocaleString('en-US') : t('common.notAvailable')}
                                        </span>
                                    </div>
                                    {booking.approved_at && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">{t('adminBookingsShowPage.fields.approvedAt')}</label>
                                            <span className="text-gray-900">
                                                {new Date(booking.approved_at).toLocaleString('en-US')}
                                            </span>
                                        </div>
                                    )}
                                    {booking.rejected_at && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">{t('adminBookingsShowPage.fields.rejectedAt')}</label>
                                            <span className="text-gray-900">
                                                {new Date(booking.rejected_at).toLocaleString('en-US')}
                                            </span>
                                        </div>
                                    )}
                                    {booking.completed_at && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">{t('adminBookingsShowPage.fields.completedAt')}</label>
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
                                {processing ? <FaSpinner className="animate-spin me-2" /> : <FaSave className="me-2" />}
                                {processing ? t('profilePage.actions.saving') : t('profilePage.actions.saveChanges')}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
