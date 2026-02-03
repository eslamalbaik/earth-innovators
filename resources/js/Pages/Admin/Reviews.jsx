import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { FaStar, FaEye, FaTrash, FaCheck, FaTimes, FaReply, FaSearch } from 'react-icons/fa';
import { useState } from 'react';
import { getUserImageUrl, getInitials, getColorFromName } from '@/utils/imageUtils';

export default function Reviews({ reviews, auth }) {
    const [replyingTo, setReplyingTo] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [reviewToDelete, setReviewToDelete] = useState(null);

    const { data: replyData, setData: setReplyData, post: postReply, processing: isReplying, reset: resetReply } = useForm({
        teacher_response: ''
    });

    const handlePublish = (id) => {
        router.patch(`/admin/reviews/${id}/publish`);
    };

    const handleDelete = (review) => {
        setReviewToDelete(review);
        setShowDeleteConfirm(true);
    };

    const handleDeleteConfirm = () => {
        if (reviewToDelete) {
            router.delete(`/admin/reviews/${reviewToDelete.id}`, {
                onSuccess: () => {
                    setShowDeleteConfirm(false);
                    setReviewToDelete(null);
                },
            });
        }
    };

    const handleReply = (reviewId) => {
        setReplyingTo(reviewId);
        resetReply();
    };

    const handleReplySubmit = (e) => {
        e.preventDefault();
        postReply(`/admin/reviews/${replyingTo}/reply`, {
            onSuccess: () => {
                setReplyingTo(null);
                resetReply();
            }
        });
    };

    const filteredReviews = reviews?.data?.filter(review => {
        const matchesSearch = review.reviewer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            review.comment?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            review.teacher?.name_ar?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesFilter = filterStatus === 'all' ||
            (filterStatus === 'published' && review.is_published) ||
            (filterStatus === 'unpublished' && !review.is_published);

        return matchesSearch && matchesFilter;
    }) || [];

    const renderStars = (rating) => {
        return Array.from({ length: 5 }).map((_, index) => (
            <FaStar
                key={index}
                className={`text-sm ${index < rating ? 'text-yellow-400' : 'text-gray-300'}`}
            />
        ));
    };

    return (
        <DashboardLayout header="إدارة التقييمات">
            <Head title="إدارة التقييمات" />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-white rounded-xl shadow-lg p-6 border-r-4 border-blue-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">إجمالي التقييمات</p>
                            <p className="text-3xl font-bold text-gray-900">{reviews?.total || 0}</p>
                        </div>
                        <div className="p-4 bg-blue-100 rounded-full">
                            <FaStar className="text-3xl text-blue-600" />
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-6 border-r-4 border-green-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">منشور</p>
                            <p className="text-3xl font-bold text-green-600">
                                {reviews?.data?.filter(r => r.is_published).length || 0}
                            </p>
                        </div>
                        <div className="p-4 bg-green-100 rounded-full">
                            <FaCheck className="text-3xl text-green-600" />
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-6 border-r-4 border-yellow-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">غير منشور</p>
                            <p className="text-3xl font-bold text-yellow-600">
                                {reviews?.data?.filter(r => !r.is_published).length || 0}
                            </p>
                        </div>
                        <div className="p-4 bg-yellow-100 rounded-full">
                            <FaTimes className="text-3xl text-yellow-600" />
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
                            placeholder="البحث في التقييمات..."
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
                        <option value="all">جميع التقييمات</option>
                        <option value="published">منشور</option>
                        <option value="unpublished">غير منشور</option>
                    </select>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-yellow-50 to-yellow-100">
                    <h3 className="text-lg font-bold text-gray-900">جميع التقييمات</h3>
                </div>
                <div className="divide-y divide-gray-200">
                    {filteredReviews.length === 0 ? (
                        <div className="p-12 text-center text-gray-500">
                            <FaStar className="mx-auto text-4xl mb-4 text-gray-300" />
                            <p>لا توجد تقييمات مطابقة للبحث</p>
                        </div>
                    ) : (
                        filteredReviews.map((review) => (
                            <div key={review.id} className="p-6 hover:bg-gray-50 transition">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-start gap-4 mb-3">
                                            {review.student?.image ? (
                                                <img
                                                    src={review.student.image}
                                                    alt={review.reviewer_name || review.student?.name}
                                                    className="w-16 h-16 rounded-full object-cover border-2 border-yellow-400"
                                                    onError={(e) => {
                                                        e.target.style.display = 'none';
                                                        const fallback = e.target.nextElementSibling;
                                                        if (fallback) fallback.style.display = 'flex';
                                                    }}
                                                />
                                            ) : null}
                                            <div
                                                className={`w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl ${review.student?.image ? 'hidden' : ''}`}
                                                style={{
                                                    background: `linear-gradient(135deg, ${getColorFromName(review.reviewer_name || review.student?.name || 'User')})`
                                                }}
                                            >
                                                {getInitials(review.reviewer_name || review.student?.name || 'User')}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h4 className="text-lg font-semibold text-gray-900">{review.reviewer_name}</h4>
                                                    {review.is_published && (
                                                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 flex items-center gap-1">
                                                            <FaCheck className="text-xs" />
                                                            منشور
                                                        </span>
                                                    )}
                                                    {!review.is_published && (
                                                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 flex items-center gap-1">
                                                            <FaTimes className="text-xs" />
                                                            غير منشور
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-600 mb-2">
                                                    تقييم لـ {review.teacher?.name_ar || 'المعلم'}
                                                    {review.student?.name && ` • من ${review.student.name}`}
                                                    {review.booking?.subject && ` • ${review.booking.subject}`}
                                                    {review.reviewer_location && ` • ${review.reviewer_location}`}
                                                </p>
                                                <div className="flex items-center gap-1 mb-3">
                                                    {renderStars(Math.round(review.rating))}
                                                    <span className="text-sm font-medium text-gray-900 mr-2">{review.rating}/5</span>
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
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <button
                                            onClick={() => handleReply(review.id)}
                                            className="px-4 py-2 bg-blue-500 hover:bg-[#A3C042] text-white font-medium rounded-lg flex items-center gap-2 transition"
                                        >
                                            <FaReply />
                                            {review.teacher_response ? 'تعديل الرد' : 'رد'}
                                        </button>
                                        {!review.is_published && (
                                            <button
                                                onClick={() => handlePublish(review.id)}
                                                className="px-4 py-2 bg-green-500 hover:bg-[#A3C042] text-white font-medium rounded-lg flex items-center gap-2 transition"
                                            >
                                                <FaCheck />
                                                نشر
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleDelete(review)}
                                            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg flex items-center gap-2 transition"
                                        >
                                            <FaTrash />
                                            حذف
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {replyingTo && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl">
                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                            <h2 className="text-xl font-bold text-gray-900">رد على التقييم</h2>
                            <button
                                onClick={() => setReplyingTo(null)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <FaTimes className="text-2xl" />
                            </button>
                        </div>
                        <form onSubmit={handleReplySubmit} className="p-6">
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    رد المعلم
                                </label>
                                <textarea
                                    value={replyData.teacher_response}
                                    onChange={(e) => setReplyData('teacher_response', e.target.value)}
                                    rows="4"
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                                    placeholder="اكتب ردك هنا..."
                                    required
                                />
                            </div>
                            <div className="flex items-center gap-4">
                                <button
                                    type="submit"
                                    disabled={isReplying}
                                    className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-3 rounded-lg transition duration-300"
                                >
                                    {isReplying ? 'جاري الإرسال...' : 'إرسال الرد'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setReplyingTo(null)}
                                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 rounded-lg transition duration-300"
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
        </DashboardLayout>
    );
}
