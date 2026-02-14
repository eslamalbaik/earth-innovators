import { Head, Link, useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import {
    FaArrowLeft,
    FaStar,
    FaUser,
    FaCalendar,
    FaFile,
    FaDownload,
    FaSpinner,
    FaPaperPlane,
    FaFilePdf,
    FaImage,
    FaCheck,
    FaTimes
} from 'react-icons/fa';
import InputLabel from '../../../Components/InputLabel';
import InputError from '../../../Components/InputError';
import DashboardLayout from '../../../Layouts/DashboardLayout';

export default function SchoolSubmissionShow({ auth, submission, availableBadges, allSubmissions = [] }) {
    const [rating, setRating] = useState(submission.rating || 0);
    const [hoveredRating, setHoveredRating] = useState(0);
    const [selectedBadges, setSelectedBadges] = useState(submission.badges || []);

    const { data, setData, post, processing, errors, reset } = useForm({
        rating: submission.rating || 0,
        feedback: submission.feedback || '',
        status: submission.status || 'submitted',
        badges: submission.badges || [],
    });

    const handleRatingClick = (value) => {
        setRating(value);
        setData('rating', value);
    };

    const handleBadgeToggle = (badgeId) => {
        const newBadges = selectedBadges.includes(badgeId)
            ? selectedBadges.filter(id => id !== badgeId)
            : [...selectedBadges, badgeId];
        setSelectedBadges(newBadges);
        setData('badges', newBadges);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(`/school/submissions/${submission.id}/evaluate`, {
            onSuccess: () => {
                // Optionally reload or show success message
            },
            onError: () => {
                // Handle errors
            }
        });
    };

    const getFileUrl = (filePath) => {
        if (!filePath) return '#';
        if (filePath.startsWith('http')) return filePath;
        return `/storage/${filePath}`;
    };

    const getFileIcon = (fileName) => {
        if (!fileName) return <FaFile className="text-gray-500 text-xl" />;
        const ext = fileName.split('.').pop()?.toLowerCase();
        if (ext === 'pdf') return <FaFilePdf className="text-red-500 text-xl" />;
        if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return <FaImage className="text-blue-500 text-xl" />;
        return <FaFile className="text-gray-500 text-xl" />;
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}/${month}/${day}`;
    };

    const getStatusBadge = (status) => {
        const statusMap = {
            'submitted': { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'مقدم' },
            'reviewed': { bg: 'bg-blue-100', text: 'text-blue-800', label: 'مراجع' },
            'approved': { bg: 'bg-green-100', text: 'text-green-800', label: 'معتمد' },
            'rejected': { bg: 'bg-red-100', text: 'text-red-800', label: 'مرفوض' },
        };
        return statusMap[status] || statusMap['submitted'];
    };

    return (
        <DashboardLayout
            auth={auth}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">تقييم المشاريع</h2>}
        >
            <Head title={`تقييم: ${submission.project?.title || 'مشروع'}`} />

            <div className="py-6">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        {/* Main Content */}
                        <div className="lg:col-span-3 space-y-6">
                            {/* Back Button */}
                            <div>
                                <Link
                                    href="/school/submissions"
                                    className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
                                >
                                    <FaArrowLeft />
                                    العودة إلى قائمة التسليمات
                                </Link>
                            </div>

                            {/* Project Info Card */}
                            <div className="bg-white rounded-xl shadow-lg p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <h1 className="text-2xl font-bold text-gray-900">{submission.project?.title}</h1>
                                        <div className="flex items-center gap-4 mt-2">
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <FaUser className="text-gray-400" />
                                                <span>{submission.student?.name || 'غير محدد'}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <FaCalendar className="text-gray-400" />
                                                <span>{formatDate(submission.submitted_at)}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusBadge(submission.status).bg} ${getStatusBadge(submission.status).text}`}>
                                        {getStatusBadge(submission.status).label}
                                    </span>
                                </div>

                                {submission.project?.description && (
                                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                                        <p className="text-gray-700">{submission.project.description}</p>
                                    </div>
                                )}

                                {/* Files */}
                                {submission.files && Array.isArray(submission.files) && submission.files.length > 0 && (
                                    <div className="mt-6">
                                        <h3 className="text-lg font-bold text-gray-900 mb-3">الملفات المرفقة</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {submission.files.map((file, index) => (
                                                <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                                                    {getFileIcon(file)}
                                                    <span className="flex-1 text-sm text-gray-900 truncate">{file?.split('/').pop() || 'ملف'}</span>
                                                    <a
                                                        href={getFileUrl(file)}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-blue-600 hover:text-blue-700 p-2"
                                                    >
                                                        <FaDownload />
                                                    </a>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Evaluation Form */}
                            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-6 space-y-6">
                                <h2 className="text-xl font-bold text-gray-900">تقييم المشروع</h2>

                                {/* Rating */}
                                <div>
                                    <InputLabel value="التقييم" className="mb-2" />
                                    <div className="flex items-center gap-2" dir="ltr">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                type="button"
                                                onClick={() => handleRatingClick(star)}
                                                onMouseEnter={() => setHoveredRating(star)}
                                                onMouseLeave={() => setHoveredRating(0)}
                                                className="focus:outline-none p-1"
                                            >
                                                <FaStar
                                                    className={`text-3xl transition ${star <= (hoveredRating || rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                                        }`}
                                                />
                                            </button>
                                        ))}
                                        <span className="mr-3 text-gray-600">
                                            {rating > 0 ? `${rating}/5` : 'اختر التقييم'}
                                        </span>
                                    </div>
                                    <InputError message={errors.rating} className="mt-2" />
                                </div>

                                {/* Status */}
                                <div>
                                    <InputLabel value="حالة التقييم" className="mb-2" />
                                    <div className="flex gap-3">
                                        {[
                                            { value: 'reviewed', label: 'مراجع', icon: FaCheck, color: 'blue' },
                                            { value: 'approved', label: 'معتمد', icon: FaCheck, color: 'green' },
                                            { value: 'rejected', label: 'مرفوض', icon: FaTimes, color: 'red' }
                                        ].map((option) => {
                                            const Icon = option.icon;
                                            const isSelected = data.status === option.value;
                                            return (
                                                <button
                                                    key={option.value}
                                                    type="button"
                                                    onClick={() => setData('status', option.value)}
                                                    className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg border-2 font-semibold transition ${
                                                        isSelected
                                                            ? `border-${option.color}-500 bg-${option.color}-50 text-${option.color}-700`
                                                            : 'border-gray-200 text-gray-600 hover:border-gray-300'
                                                    }`}
                                                >
                                                    <Icon className={isSelected ? `text-${option.color}-500` : 'text-gray-400'} />
                                                    {option.label}
                                                </button>
                                            );
                                        })}
                                    </div>
                                    <InputError message={errors.status} className="mt-2" />
                                </div>

                                {/* Badges */}
                                {availableBadges && availableBadges.length > 0 && (
                                    <div>
                                        <InputLabel value="الشارات" className="mb-2" />
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                            {availableBadges.map((badge) => {
                                                const isSelected = selectedBadges.includes(badge.id);
                                                return (
                                                    <button
                                                        key={badge.id}
                                                        type="button"
                                                        onClick={() => handleBadgeToggle(badge.id)}
                                                        className={`p-3 rounded-lg border-2 text-center transition ${
                                                            isSelected
                                                                ? 'border-[#A3C042] bg-[#A3C042]/10'
                                                                : 'border-gray-200 hover:border-gray-300'
                                                        }`}
                                                    >
                                                        <div className="font-medium text-sm text-gray-900">{badge.name_ar || badge.name}</div>
                                                        {badge.description && (
                                                            <div className="text-xs text-gray-500 mt-1 line-clamp-2">{badge.description}</div>
                                                        )}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Feedback / Comments */}
                                <div>
                                    <InputLabel value="التعليقات والملاحظات" className="mb-2" />
                                    <textarea
                                        value={data.feedback}
                                        onChange={(e) => setData('feedback', e.target.value)}
                                        rows={6}
                                        className="w-full rounded-lg border border-gray-300 p-4 focus:outline-none focus:ring-2 focus:ring-[#A3C042] focus:border-transparent"
                                        placeholder="أضف ملاحظاتك حول المشروع..."
                                        dir="rtl"
                                    />
                                    <InputError message={errors.feedback} className="mt-2" />
                                </div>

                                {/* Submit Button */}
                                <div className="flex items-center gap-4">
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="flex-1 bg-[#A3C042] hover:bg-[#8CA635] text-white font-bold py-3 px-6 rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {processing ? (
                                            <>
                                                <FaSpinner className="animate-spin" />
                                                جاري الحفظ...
                                            </>
                                        ) : (
                                            <>
                                                <FaPaperPlane />
                                                حفظ التقييم
                                            </>
                                        )}
                                    </button>
                                    <Link
                                        href="/school/submissions"
                                        className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg transition"
                                    >
                                        إلغاء
                                    </Link>
                                </div>
                            </form>
                        </div>

                        {/* Sidebar - Submissions List */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-xl shadow-lg p-4 sticky top-24">
                                <h3 className="text-lg font-bold text-gray-900 mb-4">التسليمات</h3>
                                <div className="space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto">
                                    {allSubmissions && allSubmissions.length > 0 ? (
                                        allSubmissions.map((sub) => (
                                            <Link
                                                key={sub.id}
                                                href={`/school/submissions/${sub.id}`}
                                                className={`block p-3 rounded-lg border transition ${
                                                    sub.id === submission.id
                                                        ? 'border-[#A3C042] bg-[#A3C042]/10'
                                                        : 'border-gray-100 hover:bg-gray-50'
                                                }`}
                                            >
                                                <div className="text-sm font-semibold text-gray-900 line-clamp-2">
                                                    {sub.project_title || 'مشروع غير محدد'}
                                                </div>
                                                <div className="text-xs text-gray-500 mt-1">
                                                    {sub.student_name || 'طالب غير محدد'}
                                                </div>
                                                <div className="text-xs text-gray-400 mt-1">
                                                    {sub.submitted_at || ''}
                                                </div>
                                            </Link>
                                        ))
                                    ) : (
                                        <p className="text-gray-500 text-sm text-center py-4">لا توجد تسليمات</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
