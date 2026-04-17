import { Head, Link, useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import {
    FaStar,
    FaUser,
    FaCalendar,
    FaFile,
    FaDownload,
    FaPaperPlane,
    FaFilePdf,
    FaImage
} from 'react-icons/fa';
import InputError from '../../../Components/InputError';
import MobileAppLayout from '@/Layouts/MobileAppLayout';
import MobileTopBar from '@/Components/Mobile/MobileTopBar';
import MobileBottomNav from '@/Components/Mobile/MobileBottomNav';
import { useTranslation } from '@/i18n';

export default function TeacherSubmissionShow({ auth, submission, availableBadges, allSubmissions = [] }) {
    const { t, language } = useTranslation();
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
        return new Intl.DateTimeFormat(language === 'ar' ? 'ar-EG' : 'en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        }).format(new Date(dateString));
    };

    const renderSubmissionContent = (
        <>
            <div className="bg-white rounded-2xl border border-gray-100 p-3">
                <div className="grid grid-cols-2 gap-3">
                    <Link
                        href="/teacher/projects/create"
                        className="rounded-xl py-2.5 text-sm font-bold text-center bg-gray-100 text-gray-700"
                    >
                        {t('teacherSubmissionsPage.uploadProjectTab')}
                    </Link>
                    <Link
                        href="/teacher/submissions"
                        className="rounded-xl py-2.5 text-sm font-bold text-center bg-[#A3C042] text-white"
                    >
                        {t('teacherSubmissionsPage.evaluationPageTab')}
                    </Link>
                </div>
            </div>

            <div className="mt-4 rounded-2xl bg-[#eef8d6] px-4 py-3">
                <h1 className="text-xl font-extrabold text-gray-900 text-center">{t('teacherSubmissionsPage.evaluationTitle')}</h1>
            </div>

            <div className="mt-4 bg-white rounded-2xl border border-gray-100 p-4">
                <div className="text-lg font-extrabold text-gray-900">
                    {submission.project?.title || t('teacherSubmissionsPage.unknownSubmissionProject')}
                </div>
                {submission.project?.description && (
                    <div className="mt-1 text-sm text-gray-600">{submission.project.description}</div>
                )}

                <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-2">
                        <FaUser className="text-gray-400" />
                        <span>{submission.student?.name || t('teacherSubmissionsPage.unknownStudent')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <FaCalendar className="text-gray-400" />
                        <span>{formatDate(submission.submitted_at)}</span>
                    </div>
                </div>

                {submission.files && (
                    <div className="mt-4">
                        <div className="text-sm font-bold text-gray-900 mb-2">{t('teacherSubmissionsPage.attachmentsTitle')}</div>
                        <div className="space-y-2">
                            {(() => {
                                let filesToMap = [];
                                try {
                                    if (Array.isArray(submission.files)) filesToMap = submission.files;
                                    else if (typeof submission.files === 'string') {
                                        const parsed = JSON.parse(submission.files);
                                        filesToMap = Array.isArray(parsed) ? parsed : (parsed ? Object.values(parsed) : []);
                                    }
                                } catch(e) { filesToMap = []; }
                                
                                return filesToMap.map((file, index) => (
                                    <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
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
                                ));
                            })()}
                        </div>
                    </div>
                )}
            </div>

            <div className="mt-4 bg-white rounded-2xl border border-gray-100 p-4">
                <div className="text-sm font-bold text-gray-900 mb-2">{t('teacherSubmissionsPage.ratingTitle')}</div>
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
                                className={`text-2xl transition ${star <= (hoveredRating || rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                    }`}
                            />
                        </button>
                    ))}
                </div>
                <InputError message={errors.rating} className="mt-2" />
            </div>

            <div className="mt-4 bg-white rounded-2xl border border-gray-100 p-4">
                <div className="text-sm font-bold text-gray-900 mb-2">{t('teacherSubmissionsPage.commentsTitle')}</div>
                <div className="bg-gray-50 rounded-xl p-4 mb-3 text-center text-gray-500 text-sm">
                    {submission.feedback ? submission.feedback : t('teacherSubmissionsPage.noComments')}
                </div>
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        className="h-10 w-10 rounded-lg bg-[#A3C042] text-white flex items-center justify-center"
                        aria-label={t('teacherSubmissionsPage.sendAriaLabel')}
                    >
                        <FaPaperPlane />
                    </button>
                    <input
                        type="text"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder={t('teacherSubmissionsPage.addCommentPlaceholder')}
                        className="flex-1 h-10 px-4 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-200"
                    />
                </div>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                <div className="bg-white rounded-2xl border border-gray-100 p-4">
                    <div className="text-sm font-bold text-gray-900 mb-2">{t('teacherSubmissionsPage.evaluationNotesTitle')}</div>
                    <textarea
                        value={data.feedback}
                        onChange={(e) => setData('feedback', e.target.value)}
                        rows={5}
                        className="w-full rounded-xl border border-gray-200 bg-white p-3 focus:outline-none focus:ring-2 focus:ring-[#A3C042]/30"
                        placeholder={t('teacherSubmissionsPage.evaluationNotesPlaceholder')}
                    />
                    <InputError message={errors.feedback} className="mt-2" />
                </div>

                <input type="hidden" value={data.status} readOnly />

                <button
                    type="submit"
                    disabled={processing}
                    className="w-full rounded-xl bg-[#A3C042] py-3 text-sm font-extrabold text-white hover:bg-[#8CA635] transition disabled:opacity-60"
                >
                    {processing ? t('teacherSubmissionsPage.saving') : t('teacherSubmissionsPage.saveEvaluation')}
                </button>
            </form>

            {allSubmissions && allSubmissions.length > 0 && (
                <div className="mt-6 bg-white rounded-2xl border border-gray-100 p-4 md:hidden">
                    <div className="text-sm font-bold text-gray-900 mb-3">{t('teacherSubmissionsPage.submittedProjectsTitle')}</div>
                    <div className="space-y-2">
                        {allSubmissions.map((sub) => (
                            <Link
                                key={sub.id}
                                href={`/teacher/submissions/${sub.id}`}
                                className={`block p-3 rounded-xl border transition ${sub.id === submission.id
                                    ? 'border-blue-500 bg-blue-50'
                                    : 'border-gray-100 bg-white hover:bg-gray-50'
                                    }`}
                            >
                                <div className="text-sm font-semibold text-gray-900 line-clamp-1">
                                    {sub.project_title || sub.project?.title || t('teacherSubmissionsPage.unknownSubmissionProject')}
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                    {sub.student_name || sub.student?.name || t('teacherSubmissionsPage.unknownSubmissionStudent')} • {formatDate(sub.submitted_at)}
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </>
    );

    return (
        <div dir={language === 'ar' ? 'rtl' : 'ltr'} className="min-h-screen bg-gray-50">
            <Head title={t('teacherSubmissionsPage.pageTitle', { appName: t('common.appName') })} />

            <div className="block md:hidden">
                <MobileAppLayout
                    auth={auth}
                    title={t('common.appName')}
                    activeNav="profile"
                    unreadCount={0}
                    onNotifications={() => router.visit('/notifications')}
                    onBack={() => router.visit('/teacher/submissions')}
                >
                    {renderSubmissionContent}
                </MobileAppLayout>
            </div>

            <div className="hidden md:block">
                <MobileTopBar
                    title={t('common.appName')}
                    unreadCount={auth?.unreadCount || 0}
                    onNotifications={() => router.visit('/notifications')}
                    onBack={() => router.visit('/teacher/submissions')}
                    reverseOrder={false}
                />
                <main className="mx-auto w-full max-w-6xl px-4 pb-24 pt-4">
                    <div className="space-y-4 lg:grid lg:grid-cols-12 lg:gap-6 lg:space-y-0">
                        <div className="lg:col-span-8 space-y-4">
                            {renderSubmissionContent}
                        </div>

                        {allSubmissions && allSubmissions.length > 0 && (
                            <div className="lg:col-span-4">
                                <div className="bg-white rounded-2xl border border-gray-100 p-4 sticky top-24">
                                    <div className="text-sm font-bold text-gray-900 mb-3">{t('teacherSubmissionsPage.submittedProjectsTitle')}</div>
                                    <div className="space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto">
                                        {allSubmissions.map((sub) => (
                                            <Link
                                                key={sub.id}
                                                href={`/teacher/submissions/${sub.id}`}
                                                className={`block p-3 rounded-xl border transition ${sub.id === submission.id
                                                    ? 'border-blue-500 bg-blue-50'
                                                    : 'border-gray-100 bg-white hover:bg-gray-50'
                                                    }`}
                                            >
                                                <div className="text-sm font-semibold text-gray-900 line-clamp-1">
                                                    {sub.project_title || sub.project?.title || t('teacherSubmissionsPage.unknownSubmissionProject')}
                                                </div>
                                                <div className="text-xs text-gray-500 mt-1">
                                                    {sub.student_name || sub.student?.name || t('teacherSubmissionsPage.unknownSubmissionStudent')} • {formatDate(sub.submitted_at)}
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
