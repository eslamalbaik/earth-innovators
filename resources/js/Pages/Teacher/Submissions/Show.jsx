import { Head, Link, useForm, router } from '@inertiajs/react';
import DashboardLayout from '../../../Layouts/DashboardLayout';
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
    FaImage
} from 'react-icons/fa';
import TextInput from '../../../Components/TextInput';
import InputLabel from '../../../Components/InputLabel';
import InputError from '../../../Components/InputError';
import PrimaryButton from '../../../Components/PrimaryButton';

export default function TeacherSubmissionShow({ auth, submission, availableBadges, allSubmissions = [] }) {
    const [rating, setRating] = useState(submission.rating || 0);
    const [hoveredRating, setHoveredRating] = useState(0);
    const [selectedBadges, setSelectedBadges] = useState(submission.badges || []);
    const [comment, setComment] = useState('');

    const { data, setData, post, processing, errors } = useForm({
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
        post(`/teacher/submissions/${submission.id}/evaluate`, {
            onSuccess: () => {
                router.reload();
            },
        });
    };

    const getFileUrl = (filePath) => {
        if (filePath.startsWith('http')) return filePath;
        return `/storage/${filePath}`;
    };

    const getFileIcon = (fileName) => {
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

    return (
        <DashboardLayout auth={auth}>
            <Head title={`تقييم المشروع: ${submission.project?.title}`} />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Navigation Bar */}
                <div className="flex items-center justify-between mb-6">
                    <Link
                        href="/teacher/submissions"
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
                    >
                        صفحة التقييم
                    </Link>
                    <Link
                        href="/teacher/projects/create"
                        className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
                    >
                        رفع المشروع
                    </Link>
                </div>

                {/* Main Title */}
                <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">تقييم المشاريع</h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Project Details */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">{submission.project?.title}</h2>
                            
                            {submission.project?.description && (
                                <p className="text-gray-700 mb-6 leading-relaxed">
                                    {submission.project.description}
                                </p>
                            )}

                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-2 text-gray-600">
                                    <FaUser className="text-gray-400" />
                                    <span className="font-medium">الطالب: {submission.student?.name || 'غير محدد'}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-600">
                                    <FaCalendar className="text-gray-400" />
                                    <span>{formatDate(submission.submitted_at)}</span>
                                </div>
                            </div>

                            {/* Attached Files */}
                            {submission.files && submission.files.length > 0 && (
                                <div className="mb-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-3">الملفات المرفقة:</h3>
                                    <div className="space-y-2">
                                        {submission.files.map((file, index) => (
                                            <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition">
                                                {getFileIcon(file.split('/').pop())}
                                                <span className="flex-1 text-sm text-gray-900">{file.split('/').pop()}</span>
                                                <a
                                                    href={getFileUrl(file)}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 hover:text-blue-700"
                                                >
                                                    <FaDownload />
                                                </a>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Evaluation Section */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">التقييم</h3>
                            <div className="flex items-center gap-2 mb-6" dir="ltr">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => handleRatingClick(star)}
                                        onMouseEnter={() => setHoveredRating(star)}
                                        onMouseLeave={() => setHoveredRating(0)}
                                        className="focus:outline-none"
                                    >
                                        <FaStar
                                            className={`text-4xl transition ${
                                                star <= (hoveredRating || rating)
                                                    ? 'text-yellow-400 fill-current'
                                                    : 'text-gray-300'
                                            }`}
                                        />
                                    </button>
                                ))}
                            </div>
                            <InputError message={errors.rating} />
                        </div>

                        {/* Comments Section */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">التعليقات</h3>
                            {submission.feedback ? (
                                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                                    <p className="text-gray-700 whitespace-pre-line">{submission.feedback}</p>
                                </div>
                            ) : (
                                <div className="bg-gray-50 rounded-lg p-4 mb-4 text-center text-gray-500">
                                    لا توجد تعليقات بعد
                                </div>
                            )}
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    placeholder="أضف تعليقا..."
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                                <button
                                    type="button"
                                    className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                                >
                                    <FaPaperPlane />
                                </button>
                            </div>
                        </div>

                        {/* Evaluation Form */}
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Evaluation Notes */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <h3 className="text-xl font-bold text-gray-900 mb-4">ملاحظات تقييمية</h3>
                                <textarea
                                    value={data.feedback}
                                    onChange={(e) => setData('feedback', e.target.value)}
                                    rows={6}
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    placeholder="أضف ملاحظات حول المشروع...."
                                />
                                <InputError message={errors.feedback} />
                            </div>

                            {/* Status Selection */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <InputLabel htmlFor="status" value="الحالة" />
                                <select
                                    id="status"
                                    value={data.status}
                                    onChange={(e) => setData('status', e.target.value)}
                                    className="block w-full mt-2 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                >
                                    <option value="submitted">مُسلم</option>
                                    <option value="reviewed">تم المراجعة</option>
                                    <option value="approved">مقبول</option>
                                    <option value="rejected">مرفوض</option>
                                </select>
                                <InputError message={errors.status} />
                            </div>

                            {/* Badges Selection */}
                            {availableBadges && availableBadges.length > 0 && (
                                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                    <InputLabel value="الشارات" />
                                    <div className="mt-2 space-y-2 max-h-48 overflow-y-auto">
                                        {availableBadges.map((badge) => (
                                            <label
                                                key={badge.id}
                                                className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={selectedBadges.includes(badge.id)}
                                                    onChange={() => handleBadgeToggle(badge.id)}
                                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                />
                                                <div className="flex items-center gap-2">
                                                    {badge.icon && <span className="text-xl">{badge.icon}</span>}
                                                    <span className="text-sm text-gray-900">
                                                        {badge.name_ar || badge.name}
                                                    </span>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                    <InputError message={errors.badges} />
                                </div>
                            )}

                            {/* Save Button */}
                            <PrimaryButton
                                type="submit"
                                disabled={processing}
                                className="w-full bg-green-600 hover:bg-green-700 text-lg py-3"
                            >
                                {processing ? (
                                    <>
                                        <FaSpinner className="animate-spin mr-2" />
                                        جاري الحفظ...
                                    </>
                                ) : (
                                    'حفظ التقييم'
                                )}
                            </PrimaryButton>
                        </form>
                    </div>

                    {/* Sidebar - Submitted Projects */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-4">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">المشاريع المقدمة</h3>
                            {allSubmissions && allSubmissions.length > 0 ? (
                                <div className="space-y-3">
                                    {allSubmissions.map((sub) => (
                                        <Link
                                            key={sub.id}
                                            href={`/teacher/submissions/${sub.id}`}
                                            className={`block p-4 rounded-lg border transition ${
                                                sub.id === submission.id
                                                    ? 'bg-blue-50 border-blue-300'
                                                    : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                                            }`}
                                        >
                                            <h4 className="font-semibold text-gray-900 mb-2">{sub.project_title}</h4>
                                            <p className="text-sm text-gray-600 mb-1">{sub.student_name}</p>
                                            <p className="text-xs text-gray-500">{sub.submitted_at}</p>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    <p className="text-sm">لا توجد مشاريع مقدمة</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
