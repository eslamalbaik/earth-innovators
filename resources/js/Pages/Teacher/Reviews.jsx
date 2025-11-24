import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import {
    FaStar,
    FaCheckCircle,
    FaClock,
    FaUser,
    FaGraduationCap,
    FaChartLine,
    FaReply,
    FaEdit,
} from 'react-icons/fa';
import { getUserImageUrl, getInitials, getColorFromName } from '@/utils/imageUtils';

export default function TeacherReviews({ reviews, stats, teacher }) {
    const [replyingTo, setReplyingTo] = useState(null);
    const { data: replyData, setData: setReplyData, post: postReply, processing: isReplying, reset: resetReply } = useForm({
        teacher_response: ''
    });

    const renderStars = (rating) => {
        return Array.from({ length: 5 }).map((_, index) => (
            <FaStar
                key={index}
                className={`text-lg ${index < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
            />
        ));
    };

    const handleReply = (review) => {
        setReplyingTo(review);
        setReplyData('teacher_response', review.teacher_response || '');
    };

    const handleReplySubmit = (e, reviewId) => {
        e.preventDefault();
        postReply(`/teacher/reviews/${reviewId}/reply`, {
            preserveState: true,
            onSuccess: () => {
                setReplyingTo(null);
                resetReply();
            }
        });
    };

    return (
        <DashboardLayout header="التقييمات">
            <Head title="التقييمات" />

            <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-lg shadow-lg p-6 mb-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                            مرحباً بك، {teacher.name}
                        </h2>
                        <p className="text-gray-800">إدارة تقييمات الطلاب</p>
                    </div>
                    <div className="bg-white bg-opacity-20 rounded-full p-4">
                        <FaStar className="text-5xl text-white" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <div className="bg-white rounded-xl shadow-lg p-6 border-r-4 border-blue-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">إجمالي التقييمات</p>
                            <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                        </div>
                        <div className="p-3 bg-blue-100 rounded-full">
                            <FaStar className="text-2xl text-blue-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6 border-r-4 border-green-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">متوسط التقييم</p>
                            <p className="text-3xl font-bold text-green-600">
                                {(parseFloat(stats.average_rating) || 0).toFixed(1)}
                            </p>
                        </div>
                        <div className="p-3 bg-green-100 rounded-full">
                            <FaChartLine className="text-2xl text-green-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6 border-r-4 border-yellow-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">تقييمك العام</p>
                            <p className="text-3xl font-bold text-yellow-600">
                                {(parseFloat(stats.teacher_rating) || 0).toFixed(1)}
                            </p>
                        </div>
                        <div className="p-3 bg-yellow-100 rounded-full">
                            <FaStar className="text-2xl text-yellow-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6 border-r-4 border-purple-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">منشور</p>
                            <p className="text-3xl font-bold text-purple-600">{stats.published}</p>
                        </div>
                        <div className="p-3 bg-purple-100 rounded-full">
                            <FaCheckCircle className="text-2xl text-purple-600" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-yellow-50 to-yellow-100">
                    <h3 className="text-lg font-bold text-gray-900">تقييمات الطلاب</h3>
                </div>
                <div className="divide-y divide-gray-200">
                    {reviews?.data?.length === 0 ? (
                        <div className="p-12 text-center text-gray-500">
                            <FaStar className="mx-auto text-4xl mb-4 text-gray-300" />
                            <p>لا توجد تقييمات حالياً</p>
                        </div>
                    ) : (
                        reviews?.data?.map((review) => (
                            <div key={review.id} className="p-6 hover:bg-gray-50 transition">
                                <div className="flex items-start gap-4">
                                    {review.student_image ? (
                                        <img
                                            src={review.student_image}
                                            alt={review.student_name}
                                            className="w-16 h-16 rounded-full object-cover border-2 border-blue-400"
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                                const fallback = e.target.nextElementSibling;
                                                if (fallback) fallback.style.display = 'flex';
                                            }}
                                        />
                                    ) : null}
                                    <div
                                        className={`w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl ${review.student_image ? 'hidden' : ''}`}
                                        style={{
                                            background: `linear-gradient(135deg, ${getColorFromName(review.student_name || 'User')})`
                                        }}
                                    >
                                        {getInitials(review.student_name || 'User')}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h4 className="text-lg font-semibold text-gray-900">
                                                {review.student_name}
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
                                        {review.teacher_response && replyingTo?.id !== review.id && (
                                            <div className="bg-yellow-50 border-r-4 border-yellow-400 p-4 rounded-lg mb-3">
                                                <p className="text-sm font-semibold text-gray-900 mb-1">ردك:</p>
                                                <p className="text-gray-700">{review.teacher_response}</p>
                                            </div>
                                        )}
                                        {replyingTo?.id === review.id && (
                                            <form onSubmit={(e) => handleReplySubmit(e, review.id)} className="bg-blue-50 border-r-4 border-blue-400 p-4 rounded-lg mb-3">
                                                <label className="block text-sm font-semibold text-gray-900 mb-2">
                                                    {review.teacher_response ? 'تعديل الرد:' : 'رد على التقييم:'}
                                                </label>
                                                <textarea
                                                    value={replyData.teacher_response}
                                                    onChange={(e) => setReplyData('teacher_response', e.target.value)}
                                                    rows="3"
                                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-2 focus:ring-2 focus:ring-blue-400"
                                                    placeholder="اكتب ردك هنا..."
                                                    required
                                                />
                                                <div className="flex gap-2">
                                                    <button
                                                        type="submit"
                                                        disabled={isReplying}
                                                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50"
                                                    >
                                                        {isReplying ? 'جاري الإرسال...' : 'إرسال'}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setReplyingTo(null);
                                                            resetReply();
                                                        }}
                                                        className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg text-sm font-medium transition"
                                                    >
                                                        إلغاء
                                                    </button>
                                                </div>
                                            </form>
                                        )}
                                        <p className="text-xs text-gray-500">
                                            {new Date(review.created_at).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                            })}
                                        </p>
                                    </div>
                                    <div>
                                        {replyingTo?.id !== review.id && (
                                            <button
                                                onClick={() => handleReply(review)}
                                                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg flex items-center gap-2 transition"
                                            >
                                                <FaReply />
                                                {review.teacher_response ? 'تعديل الرد' : 'رد'}
                                            </button>
                                        )}
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
        </DashboardLayout>
    );
}

