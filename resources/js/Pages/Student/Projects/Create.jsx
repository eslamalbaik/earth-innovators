import { Head, router } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import {
    FaArrowLeft,
    FaCalendar,
    FaCheckCircle,
    FaChevronRight,
    FaClock,
    FaDownload,
    FaEye,
    FaFile,
    FaFilePdf,
    FaFolderOpen,
    FaImage,
    FaPlus,
    FaStar,
} from 'react-icons/fa';
import MobileTopBar from '@/Components/Mobile/MobileTopBar';
import MobileBottomNav from '@/Components/Mobile/MobileBottomNav';
import { useTranslation } from '@/i18n';

function resolveSubmissionFileName(file) {
    if (!file) return '';
    if (typeof file === 'string') return file.split('/').pop() || file;
    if (typeof file === 'object') {
        if (file.name) return file.name;
        if (file.filename) return file.filename;
        if (file.path) return file.path.split('/').pop() || file.path;
        if (file.url) return file.url.split('/').pop() || file.url;
    }
    return String(file);
}

function normalizeSubmissionFiles(filesValue) {
    if (!filesValue) return [];
    if (Array.isArray(filesValue)) return filesValue;

    if (typeof filesValue === 'string') {
        try {
            const parsed = JSON.parse(filesValue);
            return Array.isArray(parsed) ? parsed : [];
        } catch {
            return filesValue.trim() ? [filesValue] : [];
        }
    }

    if (typeof filesValue === 'object') {
        return [filesValue];
    }

    return [];
}

export default function StudentProjectCreate({
    auth,
    projects = [],
    noticeKey,
    uploadBlockedKey,
    submissions = [],
}) {
    const { t, language } = useTranslation();
    const [selectedSubmissionId, setSelectedSubmissionId] = useState(submissions[0]?.id ?? null);

    const selectedSubmission = useMemo(
        () => submissions.find((submission) => submission.id === selectedSubmissionId) || submissions[0] || null,
        [selectedSubmissionId, submissions]
    );

    const uploadDisabled = !!uploadBlockedKey || projects.length === 0;

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}/${month}/${day}`;
    };

    const getFileUrl = (filePath) => {
        if (!filePath) return '#';
        if (typeof filePath === 'string' && filePath.startsWith('http')) return filePath;
        if (typeof filePath === 'object') {
            if (filePath.url) return filePath.url;
            if (filePath.path) return filePath.path.startsWith('http') ? filePath.path : `/storage/${filePath.path}`;
            return '#';
        }
        return `/storage/${filePath}`;
    };

    const getFileIcon = (fileName) => {
        const extension = fileName.split('.').pop()?.toLowerCase() || '';
        if (extension === 'pdf') return <FaFilePdf className="text-red-500 text-lg" />;
        if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)) return <FaImage className="text-blue-500 text-lg" />;
        return <FaFile className="text-gray-500 text-lg" />;
    };

    const openProjectForSubmission = (projectId) => {
        router.visit(`/student/projects/${projectId}?tab=submit&from=create`);
    };

    const openSubmissionDetails = (submission) => {
        if (!submission?.project?.id) return;
        router.visit(`/student/projects/${submission.project.id}?from=create`);
    };

    const statusPill = (submission) => {
        if (!submission) return null;

        if (submission.rating >= 4.5) {
            return {
                label: t('studentProjects.statusWinner'),
                className: 'bg-green-100 text-green-700 border-green-200',
                icon: <FaStar className="text-yellow-500" />,
            };
        }

        if (submission.feedback || submission.reviewed_at || submission.status === 'approved') {
            return {
                label: t('studentProjects.statusEvaluated'),
                className: 'bg-blue-100 text-blue-700 border-blue-200',
                icon: <FaCheckCircle className="text-blue-500" />,
            };
        }

        return {
            label: t('studentProjects.statusUnderReview'),
            className: 'bg-amber-100 text-amber-800 border-amber-200',
            icon: <FaClock className="text-amber-500" />,
        };
    };

    const ProjectPicker = () => (
        <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
                <div>
                    <h2 className="text-lg font-extrabold text-gray-900">{t('studentProjects.create.topBarTitle')}</h2>
                    <p className="mt-1 text-sm text-gray-500">
                        استخدم هذه الصفحة لاختيار المشروع، ثم أكمل التسليم من صفحة المشروع نفسها.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => router.visit('/student/projects')}
                    className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                    <FaArrowLeft />
                    العودة للقائمة
                </button>
            </div>

            {noticeKey && (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                    {t(noticeKey)}
                </div>
            )}

            {uploadBlockedKey && (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                    {t(uploadBlockedKey)}
                </div>
            )}

            <div className="grid gap-4 lg:grid-cols-2">
                {projects.map((project) => (
                    <button
                        key={project.id}
                        type="button"
                        onClick={() => openProjectForSubmission(project.id)}
                        disabled={uploadDisabled}
                        className="rounded-2xl border border-gray-100 bg-white p-4 text-start shadow-sm transition hover:-translate-y-0.5 hover:border-[#A3C042]/40 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        <div className="flex items-start gap-4">
                            {project.thumbnail ? (
                                <img
                                    src={project.thumbnail}
                                    alt={project.title}
                                    className="h-20 w-20 rounded-2xl object-cover"
                                />
                            ) : (
                                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
                                    <FaFolderOpen className="text-2xl" />
                                </div>
                            )}
                            <div className="min-w-0 flex-1">
                                <div className="flex items-start justify-between gap-3">
                                    <h3 className="line-clamp-1 text-sm font-bold text-gray-900">{project.title}</h3>
                                    <FaChevronRight className="mt-1 text-xs text-gray-400" />
                                </div>
                                <p className="mt-2 line-clamp-3 text-sm text-gray-600">
                                    {project.description || t('studentProjects.create.preview.noProjectDescription')}
                                </p>
                                <div className="mt-3 flex items-center gap-3 text-xs text-gray-500">
                                    <span className="inline-flex items-center gap-1">
                                        <FaEye />
                                        {project.views || 0}
                                    </span>
                                    {project.approved_at && (
                                        <span className="inline-flex items-center gap-1">
                                            <FaCalendar />
                                            {formatDate(project.approved_at)}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#A3C042] px-3 py-2 text-sm font-bold text-white">
                            <FaPlus className="text-xs" />
                            ابدأ التسليم من صفحة المشروع
                        </div>
                    </button>
                ))}
            </div>

            {!projects.length && (
                <div className="rounded-2xl border border-gray-100 bg-white p-10 text-center text-sm text-gray-500">
                    لا توجد مشاريع متاحة لبدء تسليم جديد الآن.
                </div>
            )}
        </div>
    );

    const SubmissionHistory = () => {
        const currentFiles = normalizeSubmissionFiles(selectedSubmission?.files);
        const currentStatus = statusPill(selectedSubmission);

        return (
            <div className="space-y-4">
                <div className="rounded-2xl border border-gray-100 bg-white p-4">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <h2 className="text-lg font-extrabold text-gray-900">متابعة التسليمات</h2>
                            <p className="mt-1 text-sm text-gray-500">كل تسليم يفتح مشروعه الأصلي لمراجعته أو تعديله من نفس المكان.</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => router.visit('/student/projects')}
                            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                        >
                            <FaArrowLeft />
                            صفحة المشاريع
                        </button>
                    </div>
                </div>

                {submissions.length === 0 ? (
                    <div className="rounded-2xl border border-gray-100 bg-white p-10 text-center text-sm text-gray-500">
                        {t('studentProjects.evaluation.empty')}
                    </div>
                ) : (
                    <div className="grid gap-4 lg:grid-cols-12">
                        <div className="lg:col-span-4">
                            <div className="rounded-2xl border border-gray-100 bg-white p-4">
                                <div className="mb-3 text-sm font-bold text-gray-900">التسليمات السابقة</div>
                                <div className="space-y-2">
                                    {submissions.map((submission) => {
                                        const pill = statusPill(submission);
                                        return (
                                            <button
                                                key={submission.id}
                                                type="button"
                                                onClick={() => setSelectedSubmissionId(submission.id)}
                                                className={`w-full rounded-xl border p-3 text-start transition ${
                                                    selectedSubmission?.id === submission.id
                                                        ? 'border-[#A3C042] bg-[#A3C042]/10'
                                                        : 'border-gray-200 bg-white hover:bg-gray-50'
                                                }`}
                                            >
                                                <div className="line-clamp-1 text-sm font-semibold text-gray-900">
                                                    {submission.project?.title || t('studentProjects.evaluation.unnamedProject')}
                                                </div>
                                                <div className="mt-1 text-xs text-gray-500">{formatDate(submission.submitted_at)}</div>
                                                {pill && (
                                                    <div className={`mt-2 inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[11px] font-semibold ${pill.className}`}>
                                                        {pill.icon}
                                                        {pill.label}
                                                    </div>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-8">
                            {selectedSubmission && (
                                <div className="rounded-2xl border border-gray-100 bg-white p-5">
                                    <div className="flex flex-wrap items-start justify-between gap-3">
                                        <div>
                                            <h3 className="text-xl font-extrabold text-gray-900">
                                                {selectedSubmission.project?.title || t('studentProjects.evaluation.unnamedProject')}
                                            </h3>
                                            <p className="mt-1 text-sm text-gray-600">
                                                {selectedSubmission.project?.description || t('studentProjects.create.preview.noProjectDescription')}
                                            </p>
                                        </div>
                                        {currentStatus && (
                                            <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-semibold ${currentStatus.className}`}>
                                                {currentStatus.icon}
                                                {currentStatus.label}
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-gray-500">
                                        <span className="inline-flex items-center gap-1">
                                            <FaCalendar />
                                            {formatDate(selectedSubmission.submitted_at)}
                                        </span>
                                        {selectedSubmission.rating !== null && selectedSubmission.rating !== undefined && (
                                            <span className="inline-flex items-center gap-1 text-yellow-600">
                                                <FaStar className="text-yellow-500" />
                                                {Number(selectedSubmission.rating).toFixed(1)}
                                            </span>
                                        )}
                                    </div>

                                    {currentFiles.length > 0 && (
                                        <div className="mt-5">
                                            <div className="mb-2 text-sm font-bold text-gray-900">الملفات المرفقة</div>
                                            <div className="space-y-2">
                                                {currentFiles.map((file, index) => {
                                                    const fileName = resolveSubmissionFileName(file) || 'ملف';
                                                    return (
                                                        <div
                                                            key={`${fileName}-${index}`}
                                                            className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 p-3"
                                                        >
                                                            {getFileIcon(fileName)}
                                                            <span className="flex-1 text-sm text-gray-900">{fileName}</span>
                                                            <a
                                                                href={getFileUrl(file)}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"
                                                            >
                                                                <FaDownload />
                                                            </a>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    <div className="mt-5 grid gap-4 md:grid-cols-2">
                                        <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                                            <div className="mb-2 text-sm font-bold text-gray-900">ملاحظتك</div>
                                            <p className="whitespace-pre-line text-sm text-gray-700">
                                                {selectedSubmission.comment || t('studentProjects.create.preview.noComment')}
                                            </p>
                                        </div>
                                        <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                                            <div className="mb-2 text-sm font-bold text-gray-900">التقييم أو الملاحظات</div>
                                            <p className="whitespace-pre-line text-sm text-gray-700">
                                                {selectedSubmission.feedback || t('studentProjects.evaluation.noCommentsYet')}
                                            </p>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => openSubmissionDetails(selectedSubmission)}
                                        className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#A3C042] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#8CA635]"
                                    >
                                        افتح صفحة المشروع
                                        <FaChevronRight className="text-xs" />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div dir={language === 'ar' ? 'rtl' : 'ltr'} className="min-h-screen bg-gray-50">
            <Head title={t('studentProjects.create.pageTitle')} />

            <div className="block md:hidden">
                <MobileTopBar
                    title={t('studentProjects.create.topBarTitle')}
                    unreadCount={auth?.unreadCount || 0}
                    onNotifications={() => router.visit('/notifications')}
                    onBack={() => router.visit('/student/projects')}
                    reverseOrder={false}
                />
                <main className="space-y-4 px-4 pb-24 pt-4">
                    <ProjectPicker />
                    <SubmissionHistory />
                </main>
                <MobileBottomNav active="projects" role={auth?.user?.role} isAuthed={!!auth?.user} user={auth?.user} />
            </div>

            <div className="hidden md:block">
                <MobileTopBar
                    title={t('studentProjects.create.topBarTitle')}
                    unreadCount={auth?.unreadCount || 0}
                    onNotifications={() => router.visit('/notifications')}
                    onBack={() => router.visit('/student/projects')}
                    reverseOrder={false}
                />
                <main className="mx-auto w-full max-w-6xl space-y-6 px-4 pb-24 pt-4">
                    <ProjectPicker />
                    <SubmissionHistory />
                </main>
                <MobileBottomNav active="projects" role={auth?.user?.role} isAuthed={!!auth?.user} user={auth?.user} />
            </div>
        </div>
    );
}
