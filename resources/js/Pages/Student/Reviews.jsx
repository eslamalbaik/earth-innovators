import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import {
    FaStar,
    FaCheckCircle,
    FaClock,
    FaTimes,
    FaPlus,
    FaGraduationCap,
    FaChartLine,
    FaEdit,
    FaTrash,
} from 'react-icons/fa';
import { getUserImageUrl, getInitials, getColorFromName } from '@/utils/imageUtils';

export default function StudentReviews({ reviews, reviewableBookings, stats }) {
    const { flash } = usePage().props;
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [selectedReview, setSelectedReview] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [reviewToDelete, setReviewToDelete] = useState(null);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState('success');

    const safeStats = {
        total: stats?.total ?? 0,
        published: stats?.published ?? 0,
        pending: stats?.pending ?? 0,
        average_rating: stats?.average_rating ? Number(stats.average_rating) : 0,
    };

    const { data, setData, post, processing, errors, reset } = useForm({
        teacher_id: '',
        booking_id: '',
        rating: 5,
        comment: '',
    });

    const { data: editData, setData: setEditData, put: updateReview, processing: updating, errors: editErrors, reset: resetEdit } = useForm({
        rating: 5,
        comment: '',
    });

    const renderStars = (rating, interactive = false, onRatingChange = null) => {
        return Array.from({ length: 5 }).map((_, index) => {
            const value = index + 1;
            return (
                <button
                    key={index}
                    type={interactive ? 'button' : 'span'}
                    onClick={() => interactive && onRatingChange && onRatingChange(value)}
                    className={`transition ${interactive ? 'hover:scale-110 cursor-pointer' : ''}`}
                    disabled={!interactive}
                >
                    <FaStar
                        className={`text-2xl ${value <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                    />
                </button>
            );
        });
    };

    const handleAddReview = (booking = null) => {
        if (booking) {
            setData({
                teacher_id: booking.teacher_id,
                booking_id: booking.id,
                rating: 5,
                comment: '',
            });
            setSelectedBooking(booking);
        }
        setShowAddModal(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/student/reviews', {
            preserveState: true,
            onSuccess: () => {
                setShowAddModal(false);
                reset();
                setSelectedBooking(null);
                router.reload({ only: ['reviews', 'stats', 'reviewableBookings'] });
            },
        });
    };

    const handleEdit = (review) => {
        setSelectedReview(review);
        setEditData({
            rating: review.rating,
            comment: review.comment,
        });
        setShowEditModal(true);
    };

    const handleUpdate = (e) => {
        e.preventDefault();
        updateReview(`/student/reviews/${selectedReview.id}`, {
            preserveState: true,
            onSuccess: () => {
                setShowEditModal(false);
                resetEdit();
                setSelectedReview(null);
                router.reload({ only: ['reviews', 'stats'] });
            },
        });
    };

    const handleDeleteClick = (review) => {
        setReviewToDelete(review);
        setShowDeleteConfirm(true);
    };

    const handleDeleteConfirm = () => {
        if (reviewToDelete) {
            router.delete(`/student/reviews/${reviewToDelete.id}`, {
                preserveState: true,
                onSuccess: () => {
                    setShowDeleteConfirm(false);
                    setReviewToDelete(null);
                    router.reload({ only: ['reviews', 'stats', 'reviewableBookings'] });
                },
                onError: () => {
                    if (flash?.error) {
                        setToastMessage(flash.error);
                        setToastType('error');
                        setShowToast(true);
                        setTimeout(() => setShowToast(false), 3000);
                    }
                },
            });
        }
    };

    useEffect(() => {
        if (flash?.success) {
            setToastMessage(flash.success);
            setToastType('success');
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);
        }
        if (flash?.error) {
            setToastMessage(flash.error);
            setToastType('error');
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);
        }
    }, [flash]);

    return (
        <DashboardLayout header="تقييماتي">
            <Head title="تقييماتي" />

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <div className="bg-white rounded-xl shadow-lg p-6 border-r-4 border-blue-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">إجمالي التقييمات</p>
                            <p className="text-3xl font-bold text-gray-900">{safeStats.total}</p>
                        </div>
                        <div className="p-3 bg-blue-100 rounded-full">
                            <FaStar className="text-2xl text-blue-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6 border-r-4 border-green-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">منشور</p>
                            <p className="text-3xl font-bold text-green-600">{safeStats.published}</p>
                        </div>
                        <div className="p-3 bg-green-100 rounded-full">
                            <FaCheckCircle className="text-2xl text-green-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6 border-r-4 border-yellow-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">قيد الانتظار</p>
                            <p className="text-3xl font-bold text-yellow-600">{safeStats.pending}</p>
                        </div>
                        <div className="p-3 bg-yellow-100 rounded-full">
                            <FaClock className="text-2xl text-yellow-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6 border-r-4 border-purple-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">متوسط التقييم</p>
                            <p className="text-3xl font-bold text-purple-600">
                                {safeStats.average_rating.toFixed(1)}
                            </p>
                        </div>
                        <div className="p-3 bg-purple-100 rounded-full">
                            <FaChartLine className="text-2xl text-purple-600" />
                        </div>
                    </div>
                </div>
            </div>

            {reviewableBookings && reviewableBookings.length > 0 && (
                <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-gray-900">حجوزات قابلة للتقييم</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {reviewableBookings.map((booking) => (
                            <div
                                key={booking.id}
                                className="border border-gray-200 rounded-lg p-4 hover:border-yellow-400 hover:shadow-md transition"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <p className="font-semibold text-gray-900">{booking.teacher_name}</p>
                                        <p className="text-sm text-gray-600">{booking.subject}</p>
                                        <p className="text-xs text-gray-500 mt-1">#{booking.id}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleAddReview(booking)}
                                    className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition"
                                >
                                    <FaPlus />
                                    إضافة تقييم
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-yellow-50 to-yellow-100 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-gray-900">تقييماتي</h3>
                    {reviewableBookings && reviewableBookings.length > 0 && (
                        <button
                            onClick={() => handleAddReview()}
                            className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition"
                        >
                            <FaPlus />
                            إضافة تقييم جديد
                        </button>
                    )}
                </div>
                <div className="divide-y divide-gray-200">
                    {reviews?.data?.length === 0 ? (
                        <div className="p-12 text-center text-gray-500">
                            <FaStar className="mx-auto text-4xl mb-4 text-gray-300" />
                            <p className="mb-4">لا توجد تقييمات حالياً</p>
                            {reviewableBookings && reviewableBookings.length > 0 && (
                                <button
                                    onClick={() => handleAddReview()}
                                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-lg font-medium inline-flex items-center gap-2 transition"
                                >
                                    <FaPlus />
                                    إضافة أول تقييم
                                </button>
                            )}
                        </div>
                    ) : (
                        reviews?.data?.map((review) => (
                            <div key={review.id} className="p-6 hover:bg-gray-50 transition">
                                <div className="flex items-start gap-4">
                                    {review.teacher_image ? (
                                        <img
                                            src={review.teacher_image}
                                            alt={review.teacher_name}
                                            className="w-16 h-16 rounded-full object-cover border-2 border-blue-400"
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                                const fallback = e.target.nextElementSibling;
                                                if (fallback) fallback.style.display = 'flex';
                                            }}
                                        />
                                    ) : null}
                                    <div
                                        className={`w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl ${review.teacher_image ? 'hidden' : ''}`}
                                        style={{
                                            background: `linear-gradient(135deg, ${getColorFromName(review.teacher_name || 'Teacher')})`
                                        }}
                                    >
                                        {getInitials(review.teacher_name || 'Teacher')}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h4 className="text-lg font-semibold text-gray-900">
                                                {review.teacher_name}
                                            </h4>
                                            {review.is_published ? (
                                                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 flex items-center gap-1">
                                                    <FaCheckCircle className="text-xs" />
                                                    منشور
                                                </span>
                                            ) : (
                                                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 flex items-center gap-1">
                                                    <FaClock className="text-xs" />
                                                    قيد المراجعة
                                                </span>
                                            )}
                                        </div>
                                        {review.subject && (
                                            <p className="text-sm text-gray-600 mb-2">
                                                المادة: {review.subject} {review.booking_id && ` • #${review.booking_id}`}
                                            </p>
                                        )}
                                        <div className="flex items-center gap-1 mb-3">
                                            {renderStars(Math.round(review.rating))}
                                            <span className="text-sm font-medium text-gray-900 mr-2">
                                                {review.rating}/5
                                            </span>
                                        </div>
                                        <p className="text-gray-700 leading-relaxed mb-3">{review.comment}</p>
                                        {review.teacher_response && (
                                            <div className="bg-yellow-50 border-r-4 border-yellow-400 p-4 rounded-lg mb-3">
                                                <p className="text-sm font-semibold text-gray-900 mb-1">رد المعلم:</p>
                                                <p className="text-gray-700">{review.teacher_response}</p>
                                            </div>
                                        )}
                                        <p className="text-xs text-gray-500">
                                            {new Date(review.created_at).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                            })}
                                        </p>
                                        <div className="flex items-center gap-2 mt-3">
                                            <button
                                                onClick={() => handleEdit(review)}
                                                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-lg transition flex items-center gap-2"
                                            >
                                                <FaEdit />
                                                تعديل
                                            </button>
                                            <button
                                                onClick={() => handleDeleteClick(review)}
                                                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm rounded-lg transition flex items-center gap-2"
                                            >
                                                <FaTrash />
                                                حذف
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {reviews?.links && reviews.links.length > 3 && (
                    <div className="bg-white px-4 py-3 border-t border-gray-200 flex items-center justify-between">
                        <div className="text-sm text-gray-700">
                            عرض {reviews.from} إلى {reviews.to} من {reviews.total} تقييم
                        </div>
                        <div className="flex gap-2">
                            {reviews.links.map((link, idx) => (
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

            {showAddModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
                            <h2 className="text-xl font-bold text-gray-900">إضافة تقييم جديد</h2>
                            <button
                                onClick={() => {
                                    setShowAddModal(false);
                                    reset();
                                    setSelectedBooking(null);
                                }}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <FaTimes className="text-2xl" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6">
                            {selectedBooking && (
                                <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                                    <p className="text-sm text-gray-600 mb-1">الحجز المحدد:</p>
                                    <p className="font-semibold text-gray-900">
                                        {selectedBooking.teacher_name} - {selectedBooking.subject}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">#{selectedBooking.id}</p>
                                </div>
                            )}

                            {!selectedBooking && reviewableBookings && reviewableBookings.length > 0 && (
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        اختر حجز
                                    </label>
                                    <select
                                        value={data.booking_id}
                                        onChange={(e) => {
                                            const booking = reviewableBookings.find(b => b.id == e.target.value);
                                            setData({
                                                ...data,
                                                booking_id: e.target.value,
                                                teacher_id: booking?.teacher_id || '',
                                            });
                                        }}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-yellow-400"
                                        required
                                    >
                                        <option value="">اختر حجز...</option>
                                        {reviewableBookings.map((booking) => (
                                            <option key={booking.id} value={booking.id}>
                                                {booking.teacher_name} - {booking.subject} (#{booking.id})
                                            </option>
                                        ))}
                                    </select>
                                    {errors.booking_id && (
                                        <p className="text-red-500 text-sm mt-1">{errors.booking_id}</p>
                                    )}
                                </div>
                            )}

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    التقييم
                                </label>
                                <div className="flex items-center gap-2">
                                    {renderStars(data.rating, true, (rating) => setData('rating', rating))}
                                    <span className="text-sm font-medium text-gray-900 mr-2">
                                        {data.rating}/5
                                    </span>
                                </div>
                                {errors.rating && (
                                    <p className="text-red-500 text-sm mt-1">{errors.rating}</p>
                                )}
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    التعليق
                                </label>
                                <textarea
                                    value={data.comment}
                                    onChange={(e) => setData('comment', e.target.value)}
                                    rows="5"
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                                    placeholder="اكتب تعليقك هنا..."
                                    required
                                />
                                {errors.comment && (
                                    <p className="text-red-500 text-sm mt-1">{errors.comment}</p>
                                )}
                            </div>

                            <div className="flex items-center gap-4">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 rounded-lg transition disabled:opacity-50"
                                >
                                    {processing ? 'جاري الإرسال...' : 'إرسال التقييم'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowAddModal(false);
                                        reset();
                                        setSelectedBooking(null);
                                    }}
                                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 rounded-lg transition"
                                >
                                    إلغاء
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showEditModal && selectedReview && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
                            <h2 className="text-xl font-bold text-gray-900">تعديل التقييم</h2>
                            <button
                                onClick={() => {
                                    setShowEditModal(false);
                                    resetEdit();
                                    setSelectedReview(null);
                                }}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <FaTimes className="text-2xl" />
                            </button>
                        </div>
                        <form onSubmit={handleUpdate} className="p-6">
                            <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                                <p className="text-sm text-gray-600 mb-1">المعلم:</p>
                                <p className="font-semibold text-gray-900">{selectedReview.teacher_name}</p>
                                {selectedReview.subject && (
                                    <p className="text-sm text-gray-600 mt-1">المادة: {selectedReview.subject}</p>
                                )}
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    التقييم
                                </label>
                                <div className="flex items-center gap-2">
                                    {renderStars(editData.rating, true, (rating) => setEditData('rating', rating))}
                                    <span className="text-sm font-medium text-gray-900 mr-2">
                                        {editData.rating}/5
                                    </span>
                                </div>
                                {editErrors.rating && (
                                    <p className="text-red-500 text-sm mt-1">{editErrors.rating}</p>
                                )}
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    التعليق
                                </label>
                                <textarea
                                    value={editData.comment}
                                    onChange={(e) => setEditData('comment', e.target.value)}
                                    rows="5"
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                                    placeholder="اكتب تعليقك هنا..."
                                    required
                                />
                                {editErrors.comment && (
                                    <p className="text-red-500 text-sm mt-1">{editErrors.comment}</p>
                                )}
                            </div>

                            <div className="flex items-center gap-4">
                                <button
                                    type="submit"
                                    disabled={updating}
                                    className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 rounded-lg transition disabled:opacity-50"
                                >
                                    {updating ? 'جاري التحديث...' : 'حفظ التغييرات'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowEditModal(false);
                                        resetEdit();
                                        setSelectedReview(null);
                                    }}
                                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 rounded-lg transition"
                                >
                                    إلغاء
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showDeleteConfirm && reviewToDelete && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
                        <div className="p-6">
                            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
                                <FaTrash className="text-2xl text-red-600" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900 text-center mb-2">تأكيد الحذف</h2>
                            <p className="text-gray-600 text-center mb-6">
                                هل أنت متأكد من حذف هذا التقييم؟ لا يمكن التراجع عن هذه العملية.
                            </p>
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={handleDeleteConfirm}
                                    className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-lg transition"
                                >
                                    حذف
                                </button>
                                <button
                                    onClick={() => {
                                        setShowDeleteConfirm(false);
                                        setReviewToDelete(null);
                                    }}
                                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 rounded-lg transition"
                                >
                                    إلغاء
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showToast && (
                <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50">
                    <div className={`rounded-lg shadow-lg p-4 flex items-center justify-between ${toastType === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                        }`}>
                        <p>{toastMessage}</p>
                        <button
                            onClick={() => setShowToast(false)}
                            className="ml-4 text-white hover:text-gray-200"
                        >
                            <FaTimes />
                        </button>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}

