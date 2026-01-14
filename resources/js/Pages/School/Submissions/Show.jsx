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
    FaImage
} from 'react-icons/fa';
import InputLabel from '../../../Components/InputLabel';
import InputError from '../../../Components/InputError';
import MobileAppLayout from '@/Layouts/MobileAppLayout';
import MobileTopBar from '@/Components/Mobile/MobileTopBar';
import MobileBottomNav from '@/Components/Mobile/MobileBottomNav';

export default function SchoolSubmissionShow({ auth, submission, availableBadges, allSubmissions = [] }) {
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
        post(`/school/submissions/${submission.id}/evaluate`, {
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

    const SubmissionContent = () => (
        <>

            <div className="bg-white rounded-2xl border border-gray-100 p-3">
                <div className="grid grid-cols-2 gap-3">
                    <Link href="/school/projects/create" className="rounded-xl py-2.5 text-sm font-bold text-center bg-gray-100 text-gray-700">
                        رفع المشروع
                    </Link>
                    <Link href="/school/submissions" className="rounded-xl py-2.5 text-sm font-bold text-center bg-[#A3C042] text-white">
                        صفحة التقييم
                    </Link>
                </div>
            </div>

            <div className="mt-4 rounded-2xl bg-[#eef8d6] px-4 py-3">
                <h1 className="text-xl font-extrabold text-gray-900 text-center">تقييم المشاريع</h1>
            </div>

            <div className="mt-4 bg-white rounded-2xl border border-gray-100 p-4">
                <div className="text-lg font-extrabold text-gray-900">{submission.project?.title}</div>
                {submission.project?.description && (
                    <div className="mt-1 text-sm text-gray-600">{submission.project.description}</div>
                )}

                <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-2">
                        <FaUser className="text-gray-400" />
                        <span>{submission.student?.name || 'غير محدد'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <FaCalendar className="text-gray-400" />
                        <span>{formatDate(submission.submitted_at)}</span>
                    </div>
                </div>

                {submission.files && submission.files.length > 0 && (
                    <div className="mt-4">
                        <div className="text-sm font-bold text-gray-900 mb-2">الملفات المرفقة:</div>
                        <div className="space-y-2">
                            {submission.files.map((file, index) => (
                                <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
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

            <div className="mt-4 bg-white rounded-2xl border border-gray-100 p-4">
                <div className="text-sm font-bold text-gray-900 mb-2">التقييم</div>
                <div className="flex items-center gap-2" dir="ltr">
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
                                className={`text-2xl transition ${
                                    star <= (hoveredRating || rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                }`}
                            />
                        </button>
                    ))}
                </div>
                <InputError message={errors.rating} className="mt-2" />
            </div>

            <div className="mt-4 bg-white rounded-2xl border border-gray-100 p-4">
                <div className="text-sm font-bold text-gray-900 mb-2">التعليقات</div>
                <div className="bg-gray-50 rounded-xl p-4 mb-3 text-center text-gray-500 text-sm">
                    {submission.feedback ? submission.feedback : 'لا توجد تعليقات بعد'}
                </div>
                <div className="flex items-center gap-2">
                    <button type="button" className="h-10 w-10 rounded-lg bg-blue-600 text-white flex items-center justify-center" aria-label="إرسال">
                        <FaPaperPlane />
                    </button>
                    <input
                        type="text"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="أضف تعليق..."
                        className="flex-1 h-10 px-4 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-200"
                    />
                </div>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                <div className="bg-white rounded-2xl border border-gray-100 p-4">
                    <div className="text-sm font-bold text-gray-900 mb-2">ملاحظات تقييمية</div>
                    <textarea
                        value={data.feedback}
                        onChange={(e) => setData('feedback', e.target.value)}
                        rows={5}
                        className="w-full rounded-xl border border-gray-200 bg-white p-3 focus:outline-none focus:ring-2 focus:ring-[#A3C042]/30"
                        placeholder="أضف ملاحظات حول المشروع..."
                    />
                    <InputError message={errors.feedback} className="mt-2" />
                </div>

                <input type="hidden" value={data.status} readOnly />

                <button
                    type="submit"
                    disabled={processing}
                    className="w-full rounded-xl bg-[#A3C042] py-3 text-sm font-extrabold text-white hover:bg-[#93b03a] transition disabled:opacity-60"
                >
                    {processing ? 'جاري الحفظ...' : 'حفظ التقييم'}
                </button>
            </form>

            {/* Submissions List - Mobile Only */}
            {allSubmissions && allSubmissions.length > 0 && (
                <div className="mt-6 bg-white rounded-2xl border border-gray-100 p-4 md:hidden">
                    <div className="text-sm font-bold text-gray-900 mb-3">المشاريع المقدمة</div>
                    <div className="space-y-2">
                        {allSubmissions.map((sub) => (
                            <Link
                                key={sub.id}
                                href={`/school/submissions/${sub.id}`}
                                className={`block p-3 rounded-xl border transition ${
                                    sub.id === submission.id
                                        ? 'border-blue-500 bg-blue-50'
                                        : 'border-gray-100 bg-white hover:bg-gray-50'
                                }`}
                            >
                                <div className="text-sm font-semibold text-gray-900 line-clamp-1">
                                    {sub.project_title || sub.project?.title || 'مشروع غير محدد'}
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                    {sub.student_name || sub.student?.name || 'طالب غير محدد'} • {sub.submitted_at || formatDate(sub.submitted_at)}
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </>
    );

    return (
        <div dir="rtl" className="min-h-screen bg-gray-50">
            <Head title="تقييم المشاريع - إرث المبتكرين" />

            {/* Mobile View */}
            <div className="block md:hidden">
                <MobileAppLayout
                    auth={auth}
                    title="إرث المبتكرين"
                    activeNav="profile"
                    unreadCount={0}
                    onNotifications={() => router.visit('/notifications')}
                    onBack={() => router.visit('/school/submissions')}
                >
                    <SubmissionContent />
                </MobileAppLayout>
            </div>

            {/* Desktop View */}
            <div className="hidden md:block">
                <MobileTopBar
                    title="إرث المبتكرين"
                    unreadCount={auth?.unreadCount || 0}
                    onNotifications={() => router.visit('/notifications')}
                    onBack={() => router.visit('/school/submissions')}
                    reverseOrder={false}
                />
                <main className="mx-auto w-full max-w-6xl px-4 pb-24 pt-4">
                    <div className="space-y-4 lg:grid lg:grid-cols-12 lg:gap-6 lg:space-y-0">
                        {/* Left Column - Main Content */}
                        <div className="lg:col-span-8 space-y-4">
                            <SubmissionContent />
                        </div>

                        {/* Right Column - Submissions List */}
                        {allSubmissions && allSubmissions.length > 0 && (
                            <div className="lg:col-span-4">
                                <div className="bg-white rounded-2xl border border-gray-100 p-4 sticky top-24">
                                    <div className="text-sm font-bold text-gray-900 mb-3">المشاريع المقدمة</div>
                                    <div className="space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto">
                                        {allSubmissions.map((sub) => (
                                            <Link
                                                key={sub.id}
                                                href={`/school/submissions/${sub.id}`}
                                                className={`block p-3 rounded-xl border transition ${
                                                    sub.id === submission.id
                                                        ? 'border-blue-500 bg-blue-50'
                                                        : 'border-gray-100 bg-white hover:bg-gray-50'
                                                }`}
                                            >
                                                <div className="text-sm font-semibold text-gray-900 line-clamp-1">
                                                    {sub.project_title || sub.project?.title || 'مشروع غير محدد'}
                                                </div>
                                                <div className="text-xs text-gray-500 mt-1">
                                                    {sub.student_name || sub.student?.name || 'طالب غير محدد'} • {sub.submitted_at || formatDate(sub.submitted_at)}
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </main>
                <MobileBottomNav active="profile" role={auth?.user?.role} isAuthed={!!auth?.user} user={auth?.user} />
            </div>
        </div>
    );
}
