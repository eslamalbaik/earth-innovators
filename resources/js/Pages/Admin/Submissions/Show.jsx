import { Head, Link, useForm, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
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
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';

export default function AdminSubmissionShow({ submission, availableBadges }) {
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
        post(route('admin.submissions.evaluate', submission.id), {
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
        <DashboardLayout header="تقييم التسليم">
            <Head title={`تقييم المشروع: ${submission.project?.title}`} />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Navigation Bar */}
                <div className="mb-6">
                    <Link
                        href={route('admin.projects.show', submission.project?.id)}
                        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800"
                    >
                        <FaArrowLeft />
                        <span>العودة إلى المشروع</span>
                    </Link>
                </div>

                {/* Main Title */}
                <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">تقييم المشروع</h1>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Main Content */}
                    <div className="space-y-6">
                        {/* Project Details */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">{submission.project?.title}</h2>
                            
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

                            {submission.comment && (
                                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                                    <h3 className="font-semibold text-gray-900 mb-2">تعليق الطالب:</h3>
                                    <p className="text-gray-700 whitespace-pre-line">{submission.comment}</p>
                                </div>
                            )}

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

                    {/* Sidebar - Submission Info */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-4">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">معلومات التسليم</h3>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">الطالب</p>
                                    <p className="font-semibold text-gray-900">{submission.student?.name}</p>
                                    <p className="text-sm text-gray-600">{submission.student?.email}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">تاريخ التسليم</p>
                                    <p className="font-semibold text-gray-900">{formatDate(submission.submitted_at)}</p>
                                </div>
                                {submission.reviewed_at && (
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">تاريخ المراجعة</p>
                                        <p className="font-semibold text-gray-900">{formatDate(submission.reviewed_at)}</p>
                                    </div>
                                )}
                                {submission.reviewer && (
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">المراجع</p>
                                        <p className="font-semibold text-gray-900">{submission.reviewer?.name}</p>
                                    </div>
                                )}
                                {submission.rating && (
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">التقييم</p>
                                        <div className="flex items-center gap-1">
                                            <FaStar className="text-yellow-500" />
                                            <span className="font-semibold text-gray-900">{submission.rating}/5</span>
                                        </div>
                                    </div>
                                )}
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">الحالة</p>
                                    <span className={`inline-block px-3 py-1 rounded text-sm font-medium ${
                                        submission.status === 'approved' ? 'bg-green-100 text-green-800' :
                                        submission.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                        submission.status === 'reviewed' ? 'bg-blue-100 text-blue-800' :
                                        'bg-gray-100 text-gray-800'
                                    }`}>
                                        {submission.status === 'approved' ? 'معتمد' :
                                         submission.status === 'rejected' ? 'مرفوض' :
                                         submission.status === 'reviewed' ? 'تم المراجعة' : 'مقدم'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

