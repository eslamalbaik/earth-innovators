import { Head, Link, useForm, router, usePage } from '@inertiajs/react';
import DashboardLayout from '../../../Layouts/DashboardLayout';
import { useState, useEffect } from 'react';
import {
    FaArrowLeft,
    FaStar,
    FaUser,
    FaCalendar,
    FaFile,
    FaDownload,
    FaSpinner,
    FaTrophy,
    FaFilePdf,
    FaImage,
    FaAward,
    FaTimes,
    FaCheckCircle
} from 'react-icons/fa';
import TextInput from '../../../Components/TextInput';
import InputLabel from '../../../Components/InputLabel';
import InputError from '../../../Components/InputError';
import PrimaryButton from '../../../Components/PrimaryButton';

export default function TeacherChallengeSubmissionShow({ auth, submission, availableBadges }) {
    const { flash } = usePage().props;
    const [rating, setRating] = useState(submission.rating || 0);
    const [hoveredRating, setHoveredRating] = useState(0);
    const [selectedBadges, setSelectedBadges] = useState(submission.badges || []);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');

    const { data, setData, post, processing, errors } = useForm({
        rating: submission.rating || 0,
        feedback: submission.feedback || '',
        status: submission.status || 'submitted',
        points_earned: submission.points_earned || submission.challenge?.points_reward || 0,
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
        post(`/teacher/challenge-submissions/${submission.id}/evaluate`, {
            onSuccess: () => {
                // Toast will be shown on redirect page
            },
        });
    };

    useEffect(() => {
        if (flash?.success) {
            setToastMessage(flash.success);
            setShowToast(true);
            setTimeout(() => setShowToast(false), 5000);
        }
        if (flash?.error) {
            setToastMessage(flash.error);
            setShowToast(true);
            setTimeout(() => setShowToast(false), 5000);
        }
    }, [flash]);

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
        const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
        return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
    };

    return (
        <DashboardLayout auth={auth}>
            <Head title={`تقييم التحدي: ${submission.challenge?.title}`} />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Link
                    href={`/teacher/challenge-submissions?challenge_id=${submission.challenge_id}`}
                    className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
                >
                    <FaArrowLeft />
                    العودة إلى التسليمات
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Challenge Details */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <FaTrophy className="text-yellow-600 text-2xl" />
                                <h2 className="text-2xl font-bold text-gray-900">{submission.challenge?.title}</h2>
                            </div>
                            
                            {submission.challenge?.objective && (
                                <p className="text-gray-700 mb-4">
                                    <strong>الهدف:</strong> {submission.challenge.objective}
                                </p>
                            )}

                            {submission.challenge?.description && (
                                <p className="text-gray-700 mb-6 leading-relaxed">
                                    {submission.challenge.description}
                                </p>
                            )}

                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-2 text-gray-600">
                                    <FaUser className="text-gray-400" />
                                    <span className="font-medium">الطالب: {submission.student?.name || 'غير محدد'}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-600">
                                    <FaCalendar className="text-gray-400" />
                                    <span>تاريخ التقديم: {formatDate(submission.submitted_at)}</span>
                                </div>
                            </div>

                            {/* Student Answer */}
                            {submission.answer && (
                                <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">الحل / الإجابة:</h3>
                                    <p className="text-gray-700 whitespace-pre-line">{submission.answer}</p>
                                </div>
                            )}

                            {/* Student Comment */}
                            {submission.comment && (
                                <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">تعليق الطالب:</h3>
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
                            <h3 className="text-xl font-bold text-gray-900 mb-6">تقييم التقديم</h3>
                            
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Status */}
                                <div>
                                    <InputLabel value="الحالة *" />
                                    <select
                                        value={data.status}
                                        onChange={(e) => setData('status', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        required
                                    >
                                        <option value="submitted">مُسلم</option>
                                        <option value="reviewed">تم المراجعة</option>
                                        <option value="approved">مقبول</option>
                                        <option value="rejected">مرفوض</option>
                                    </select>
                                    <InputError message={errors.status} className="mt-2" />
                                </div>

                                {/* Rating */}
                                <div>
                                    <InputLabel value="التقييم (0-10)" />
                                    <div className="flex items-center gap-2 mt-2">
                                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
                                            <button
                                                key={value}
                                                type="button"
                                                onClick={() => handleRatingClick(value)}
                                                onMouseEnter={() => setHoveredRating(value)}
                                                onMouseLeave={() => setHoveredRating(0)}
                                                className={`text-2xl transition ${
                                                    value <= (hoveredRating || rating)
                                                        ? 'text-yellow-500'
                                                        : 'text-gray-300'
                                                }`}
                                            >
                                                <FaStar />
                                            </button>
                                        ))}
                                        <span className="mr-2 text-gray-600">({rating} / 10)</span>
                                    </div>
                                    <InputError message={errors.rating} className="mt-2" />
                                </div>

                                {/* Points */}
                                {submission.challenge?.points_reward > 0 && (
                                    <div>
                                        <InputLabel htmlFor="points_earned" value="النقاط المكتسبة" />
                                        <TextInput
                                            id="points_earned"
                                            type="number"
                                            value={data.points_earned}
                                            onChange={(e) => setData('points_earned', parseInt(e.target.value) || 0)}
                                            className="mt-1 block w-full"
                                            min="0"
                                            max={submission.challenge.points_reward}
                                        />
                                        <p className="mt-1 text-sm text-gray-500">
                                            الحد الأقصى: {submission.challenge.points_reward} نقطة
                                        </p>
                                        <InputError message={errors.points_earned} className="mt-2" />
                                    </div>
                                )}

                                {/* Feedback */}
                                <div>
                                    <InputLabel htmlFor="feedback" value="ملاحظات المقيّم" />
                                    <textarea
                                        id="feedback"
                                        value={data.feedback}
                                        onChange={(e) => setData('feedback', e.target.value)}
                                        rows={6}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        placeholder="اكتب ملاحظاتك على التقديم..."
                                    />
                                    <InputError message={errors.feedback} className="mt-2" />
                                </div>

                                {/* Badges */}
                                {availableBadges && availableBadges.length > 0 && (
                                    <div>
                                        <InputLabel value="الشارات (اختياري)" />
                                        <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-3">
                                            {availableBadges.map((badge) => (
                                                <label
                                                    key={badge.id}
                                                    className={`flex items-center gap-2 p-3 border-2 rounded-lg cursor-pointer transition ${
                                                        selectedBadges.includes(badge.id)
                                                            ? 'border-blue-500 bg-blue-50'
                                                            : 'border-gray-200 hover:border-gray-300'
                                                    }`}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedBadges.includes(badge.id)}
                                                        onChange={() => handleBadgeToggle(badge.id)}
                                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                    />
                                                    <FaAward className={`text-xl ${selectedBadges.includes(badge.id) ? 'text-blue-600' : 'text-gray-400'}`} />
                                                    <span className="text-sm font-medium text-gray-700">{badge.name}</span>
                                                </label>
                                            ))}
                                        </div>
                                        <InputError message={errors.badges} className="mt-2" />
                                    </div>
                                )}

                                <PrimaryButton disabled={processing}>
                                    {processing ? (
                                        <>
                                            <FaSpinner className="animate-spin mr-2" />
                                            جاري الحفظ...
                                        </>
                                    ) : (
                                        <>
                                            حفظ التقييم
                                        </>
                                    )}
                                </PrimaryButton>
                            </form>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Current Status */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">الحالة الحالية</h3>
                            <div className="space-y-3">
                                <div>
                                    <span className="text-sm text-gray-600">الحالة:</span>
                                    <p className="font-medium text-gray-900 capitalize">
                                        {submission.status === 'submitted' ? 'مُسلم' :
                                         submission.status === 'reviewed' ? 'تم المراجعة' :
                                         submission.status === 'approved' ? 'مقبول' :
                                         submission.status === 'rejected' ? 'مرفوض' : submission.status}
                                    </p>
                                </div>
                                {submission.rating && (
                                    <div>
                                        <span className="text-sm text-gray-600">التقييم:</span>
                                        <div className="flex items-center gap-1">
                                            <FaStar className="text-yellow-500" />
                                            <p className="font-medium text-gray-900">{submission.rating} / 10</p>
                                        </div>
                                    </div>
                                )}
                                {submission.points_earned > 0 && (
                                    <div>
                                        <span className="text-sm text-gray-600">النقاط:</span>
                                        <p className="font-medium text-green-600">{submission.points_earned} نقطة</p>
                                    </div>
                                )}
                                {submission.reviewed_at && (
                                    <div>
                                        <span className="text-sm text-gray-600">تاريخ المراجعة:</span>
                                        <p className="font-medium text-gray-900">{formatDate(submission.reviewed_at)}</p>
                                    </div>
                                )}
                                {submission.reviewer && (
                                    <div>
                                        <span className="text-sm text-gray-600">المقيّم:</span>
                                        <p className="font-medium text-gray-900">{submission.reviewer.name}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Toast Notification */}
            {showToast && (
                <div className="fixed top-4 left-4 right-4 md:left-4 md:right-auto md:w-96 z-50 animate-slide-up">
                    <div className="bg-green-500 text-white rounded-lg shadow-lg p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <FaCheckCircle className="text-xl" />
                            <p className="font-medium">{toastMessage}</p>
                        </div>
                        <button
                            onClick={() => setShowToast(false)}
                            className="ml-4 text-white hover:text-gray-200 transition"
                        >
                            <FaTimes />
                        </button>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}

