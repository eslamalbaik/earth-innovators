import { Head, Link, useForm, router } from '@inertiajs/react';
import MobileAppLayout from '../../Layouts/MobileAppLayout';
import MobileTopBar from '@/Components/Mobile/MobileTopBar';
import MobileBottomNav from '@/Components/Mobile/MobileBottomNav';
import { useToast } from '@/Contexts/ToastContext';
import { useState, useRef } from 'react';
import { toHijriDate } from '@/utils/dateUtils';
import { useTranslation } from '@/i18n';
import {
    FaArrowLeft,
    FaUpload,
    FaCloudUploadAlt,
    FaTrash,
    FaFile,
    FaSpinner,
    FaComment,
    FaReply,
    FaTimes,
    FaUser,
    FaCalendar,
    FaEye,
    FaGraduationCap,
    FaSchool,
    FaPlus,
    FaEdit
} from 'react-icons/fa';
import TextInput from '../../Components/TextInput';
import InputLabel from '../../Components/InputLabel';
import InputError from '../../Components/InputError';
import PrimaryButton from '../../Components/PrimaryButton';

export default function ProjectShow({ auth, project, existingSubmission, userRole, canSubmit }) {
    const { showError } = useToast();
    const { t, language } = useTranslation();
    const [activeTab, setActiveTab] = useState('details'); // 'details', 'submit', 'comments'
    const [fileList, setFileList] = useState([]);
    const [dragActive, setDragActive] = useState(false);
    const [replyingTo, setReplyingTo] = useState(null);
    const fileInputRef = useRef(null);

    const submissionForm = useForm({
        files: [],
        comment: '',
    });

    const commentForm = useForm({
        comment: '',
        parent_id: null,
        files: [],
    });

    const handleFiles = (files) => {
        const fileArray = Array.from(files);
        const validFiles = fileArray.filter(file => {
            const maxSize = 10 * 1024 * 1024; // 10 MB
            const validTypes = [
                'image/jpeg', 'image/jpg', 'image/png', 'image/gif',
                'video/mp4', 'video/avi', 'video/mov',
                'application/pdf', 'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'application/zip', 'application/x-rar-compressed'
            ];

            if (file.size > maxSize) {
                showError(t('studentProjectShowPage.errors.fileTooLarge', { name: file.name, maxMb: 10 }));
                return false;
            }

            if (!validTypes.includes(file.type)) {
                showError(t('studentProjectShowPage.errors.fileTypeNotSupported', { name: file.name }));
                return false;
            }

            return true;
        });

        setFileList(prev => [...prev, ...validFiles.map(file => ({
            file,
            id: Date.now() + Math.random(),
            name: file.name,
            size: file.size,
            type: file.type,
        }))]);

        const currentFiles = submissionForm.data.files || [];
        submissionForm.setData('files', [...currentFiles, ...validFiles]);
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFiles(e.dataTransfer.files);
        }
    };

    const removeFile = (fileId) => {
        setFileList(prev => {
            const filtered = prev.filter(f => f.id !== fileId);
            const filesToKeep = filtered.map(f => f.file);
            submissionForm.setData('files', filesToKeep);
            return filtered;
        });
    };

    const formatFileSize = (bytes) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    };

    const submitProject = (e) => {
        e.preventDefault();
        submissionForm.post(`/projects/${project.id}/submissions`, {
            forceFormData: true,
            onSuccess: () => {
                submissionForm.reset();
                setFileList([]);
                router.reload();
            },
        });
    };

    const submitComment = (e) => {
        e.preventDefault();
        commentForm.post(`/projects/${project.id}/comments`, {
            forceFormData: true,
            onSuccess: () => {
                commentForm.reset();
                setReplyingTo(null);
                router.reload();
            },
        });
    };

    const startReply = (commentId) => {
        setReplyingTo(commentId);
        commentForm.setData('parent_id', commentId);
        setActiveTab('comments');
    };

    const ProjectContent = () => (
        <div className="space-y-4">
            {/* Tabs */}
            <div className="bg-white rounded-2xl border border-gray-100 p-3">
                <div className="grid grid-cols-3 gap-3">
                    <button
                        type="button"
                        onClick={() => setActiveTab('details')}
                        className={`rounded-xl py-2.5 text-sm font-bold transition ${activeTab === 'details'
                            ? 'bg-[#A3C042] text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        {t('studentProjectShowPage.tabs.details')}
                    </button>
                    {canSubmit && (
                        <button
                            type="button"
                            onClick={() => setActiveTab('submit')}
                            className={`rounded-xl py-2.5 text-sm font-bold transition ${activeTab === 'submit'
                                ? 'bg-[#A3C042] text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            {existingSubmission ? t('studentProjectShowPage.tabs.updateSubmission') : t('studentProjectShowPage.tabs.submit')}
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={() => setActiveTab('comments')}
                        className={`rounded-xl py-2.5 text-sm font-bold transition ${activeTab === 'comments'
                            ? 'bg-[#A3C042] text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        {t('studentProjectShowPage.tabs.comments', { count: project.comments?.length || 0 })}
                    </button>
                </div>
            </div>

            {/* Details Tab */}
            {activeTab === 'details' && (
                <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-4">
                    <div>
                        <h1 className="text-xl font-extrabold text-gray-900 mb-3">{project.title}</h1>
                        <div className="flex items-center gap-2 flex-wrap mb-3">
                            <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold border border-green-300">
                                {t('common.approved')}
                            </span>
                            <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-bold border border-gray-200">
                                {t(`common.categories.${project.category || 'other'}`)}
                            </span>
                            <div className="flex items-center gap-1 text-gray-600 text-xs">
                                <FaEye />
                                <span>{project.views || 0}</span>
                            </div>
                        </div>

                        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                            {project.description}
                        </p>
                    </div>

                    {/* Project Info */}
                    <div className="space-y-3 pt-4 border-t border-gray-100">
                        {/* عرض المعلم فقط إذا لم يكن المشروع من الإدارة */}
                        {project.teacher && project.user?.role !== 'admin' && (
                            <div className="flex items-center gap-2 text-sm">
                                <FaGraduationCap className="text-blue-600" />
                                <span className="text-gray-600">{t('studentProjectShowPage.labels.teacher')}:</span>
                                <span className="font-semibold text-gray-900">{project.teacher.name_ar || project.teacher.user?.name || t('common.notAvailable')}</span>
                            </div>
                        )}
                        {/* عرض المدرسة أو الإدارة */}
                        {project.school ? (
                            <div className="flex items-center gap-2 text-sm">
                                <FaSchool className="text-green-600" />
                                <span className="text-gray-600">{t('studentProjectShowPage.labels.school')}:</span>
                                <span className="font-semibold text-gray-900">{project.school.name}</span>
                            </div>
                        ) : project.user?.role === 'admin' ? (
                            <div className="flex items-center gap-2 text-sm">
                                <FaSchool className="text-purple-600" />
                                <span className="font-semibold text-gray-900">{t('studentProjectShowPage.fromAdmin')}</span>
                            </div>
                        ) : null}
                        {project.approved_at && (
                            <div className="flex items-center gap-2 text-sm">
                                <FaCalendar className="text-gray-400" />
                                <span className="text-gray-600">{t('studentProjectShowPage.labels.approvedAt')}:</span>
                                <span className="font-semibold text-gray-900">{toHijriDate(project.approved_at)}</span>
                            </div>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-4 border-t border-gray-100 space-y-2">
                        {userRole === 'student' && canSubmit && (
                            <button
                                type="button"
                                onClick={() => setActiveTab('submit')}
                                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-[#A3C042] text-white rounded-xl hover:bg-[#8CA635] transition font-bold text-sm"
                            >
                                <FaPlus />
                                {existingSubmission ? t('projectShowPage.actions.editSubmission') : t('projectShowPage.actions.addSubmission')}
                            </button>
                        )}
                        {userRole === 'teacher' && auth?.user && (
                            <Link
                                href="/teacher/submissions"
                                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-[#A3C042] text-white rounded-xl hover:bg-[#8CA635] transition font-bold text-sm"
                            >
                                <FaEdit />
                                {t('projectShowPage.actions.viewSubmissions')}
                            </Link>
                        )}
                    </div>

                    {/* Existing Submission */}
                    {existingSubmission && (
                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                            <h3 className="text-sm font-bold text-blue-900 mb-2">{t('projectShowPage.currentSubmission.title')}</h3>
                            <p className="text-xs text-blue-800 mb-2">
                                {t('common.status')}: <span className="font-medium">{existingSubmission.status}</span>
                            </p>
                            {existingSubmission.comment && (
                                <p className="text-xs text-blue-700 mb-2">{existingSubmission.comment}</p>
                            )}
                            {existingSubmission.feedback && (
                                <div className="mt-2 p-3 bg-white rounded-xl border border-blue-200">
                                    <p className="text-xs font-medium text-blue-900 mb-1">{t('projectShowPage.currentSubmission.reply')}:</p>
                                    <p className="text-xs text-blue-800">{existingSubmission.feedback}</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Submit Tab - للطلاب فقط */}
            {activeTab === 'submit' && canSubmit && (
                <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-4">
                    <form onSubmit={submitProject} className="space-y-4">
                        <div>
                            <InputLabel htmlFor="comment" value={t('studentProjectShowPage.form.commentLabel')} className="text-sm font-medium text-gray-700 mb-2" />
                            <textarea
                                id="comment"
                                value={submissionForm.data.comment}
                                onChange={(e) => submissionForm.setData('comment', e.target.value)}
                                rows={4}
                                className="block w-full rounded-xl border-gray-200 bg-gray-50 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#A3C042]/30 focus:border-[#A3C042]"
                                placeholder={t('studentProjectShowPage.form.commentPlaceholder')}
                            />
                            <InputError message={submissionForm.errors.comment} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel value={t('studentProjectShowPage.form.filesLabel')} className="text-sm font-medium text-gray-700 mb-2" />
                            <div
                                onDragEnter={handleDrag}
                                onDragLeave={handleDrag}
                                onDragOver={handleDrag}
                                onDrop={handleDrop}
                                className={`border-2 border-dashed rounded-2xl p-6 text-center transition ${dragActive
                                    ? 'border-[#A3C042] bg-[#A3C042]/10'
                                    : 'border-gray-300 hover:border-[#A3C042]/50'
                                    }`}
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    multiple
                                    onChange={(e) => e.target.files && handleFiles(e.target.files)}
                                    accept="image/*,video/*,.pdf,.doc,.docx,.zip,.rar"
                                    className="hidden"
                                />
                                <FaCloudUploadAlt className="mx-auto text-4xl text-gray-400 mb-3" />
                                <p className="text-sm text-gray-700 mb-2">
                                    {t('studentProjectShowPage.dropzone.title')}
                                </p>
                                <p className="text-xs text-gray-500 mb-3">
                                    {t('studentProjectShowPage.dropzone.hint', { maxMb: 10 })}
                                </p>
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="px-4 py-2 bg-[#A3C042] text-white rounded-xl hover:bg-[#8CA635] transition font-bold text-sm"
                                >
                                    {t('studentProjectShowPage.actions.chooseFiles')}
                                </button>
                            </div>
                            <InputError message={submissionForm.errors.files} className="mt-2" />

                            {fileList.length > 0 && (
                                <div className="mt-3 space-y-2">
                                    {fileList.map((fileItem) => (
                                        <div
                                            key={fileItem.id}
                                            className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-200"
                                        >
                                            <div className="flex items-center gap-3">
                                                <FaFile className="text-gray-400" />
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">{fileItem.name}</p>
                                                    <p className="text-xs text-gray-500">{formatFileSize(fileItem.size)}</p>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => removeFile(fileItem.id)}
                                                className="text-red-500 hover:text-red-700"
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end">
                            <PrimaryButton
                                type="submit"
                                disabled={submissionForm.processing}
                                className="bg-[#A3C042] hover:bg-[#8CA635] rounded-xl"
                            >
                                {submissionForm.processing ? (
                                    <>
                                        <FaSpinner className="animate-spin ms-2" />
                                        {t('studentProjectShowPage.actions.submitting')}
                                    </>
                                ) : (
                                    <>
                                        <FaUpload className="ms-2" />
                                        {existingSubmission ? t('studentProjectShowPage.actions.updateSubmission') : t('studentProjectShowPage.actions.submitProject')}
                                    </>
                                )}
                            </PrimaryButton>
                        </div>
                    </form>
                </div>
            )}

            {/* Comments Tab */}
            {activeTab === 'comments' && (
                <div className="space-y-4">
                    {/* Add Comment Form - للمستخدمين المسجلين */}
                    {auth.user && (
                        <div className="bg-white rounded-2xl border border-gray-100 p-4">
                            <h3 className="text-sm font-bold text-gray-900 mb-3">
                                {replyingTo ? t('studentProjectShowPage.comments.replyTitle') : t('studentProjectShowPage.comments.addTitle')}
                            </h3>
                            <form onSubmit={submitComment} className="space-y-3">
                                <div>
                                    <textarea
                                        value={commentForm.data.comment}
                                        onChange={(e) => commentForm.setData('comment', e.target.value)}
                                        rows={4}
                                        className="block w-full rounded-xl border-gray-200 bg-gray-50 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#A3C042]/30 focus:border-[#A3C042]"
                                    placeholder={t('studentProjectShowPage.comments.placeholder')}
                                        required
                                    />
                                    <InputError message={commentForm.errors.comment} className="mt-2" />
                                </div>
                                <div className="flex items-center justify-between">
                                    {replyingTo && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setReplyingTo(null);
                                                commentForm.setData('parent_id', null);
                                            }}
                                            className="text-sm text-gray-600 hover:text-gray-900"
                                        >
                                            {t('common.cancel')}
                                        </button>
                                    )}
                                    <PrimaryButton
                                        type="submit"
                                        disabled={commentForm.processing}
                                        className="bg-[#A3C042] hover:bg-[#8CA635] rounded-xl"
                                    >
                                        {commentForm.processing ? (
                                            <>
                                                <FaSpinner className="animate-spin ms-2" />
                                                {t('studentProjectShowPage.comments.sending')}
                                            </>
                                        ) : (
                                            <>
                                                <FaComment className="ms-2" />
                                                {replyingTo ? t('studentProjectShowPage.comments.sendReply') : t('studentProjectShowPage.comments.sendComment')}
                                            </>
                                        )}
                                    </PrimaryButton>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Comments List */}
                    <div className="space-y-3">
                        {project.comments && project.comments.length > 0 ? (
                            project.comments.map((comment) => (
                                <div key={comment.id} className="bg-white rounded-2xl border border-gray-100 p-4">
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                                <FaUser className="text-blue-600 text-xs" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-gray-900">
                                                    {comment.user?.name || t('common.user')}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {toHijriDate(comment.created_at)}
                                                </p>
                                            </div>
                                        </div>
                                        {auth.user && comment.user_id === auth.user.id && (
                                            <button
                                                type="button"
                                                onClick={() => router.delete(`/project-comments/${comment.id}`)}
                                                className="text-red-500 hover:text-red-700"
                                            >
                                                <FaTimes className="text-xs" />
                                            </button>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-700 mb-2">{comment.comment}</p>
                                    {auth.user && (
                                        <div className="flex items-center gap-3">
                                            <button
                                                type="button"
                                                onClick={() => startReply(comment.id)}
                                                className="text-[#A3C042] hover:text-[#8CA635] text-xs flex items-center gap-1"
                                            >
                                                <FaReply />
                                                {t('studentProjectShowPage.comments.replyAction')}
                                            </button>
                                        </div>
                                    )}

                                    {/* Replies */}
                                    {comment.replies && comment.replies.length > 0 && (
                                        <div className="mt-3 ps-4 border-r-2 border-gray-200 space-y-3">
                                            {comment.replies.map((reply) => (
                                                <div key={reply.id} className="flex items-start gap-2">
                                                    <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                                                        <FaUser className="text-gray-600 text-[10px]" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center justify-between mb-1">
                                                            <p className="text-xs font-semibold text-gray-900">
                                                                {reply.user?.name || t('common.user')}
                                                            </p>
                                                            {auth.user && reply.user_id === auth.user.id && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => router.delete(`/project-comments/${reply.id}`)}
                                                                    className="text-red-500 hover:text-red-700"
                                                                >
                                                                    <FaTimes className="text-[10px]" />
                                                                </button>
                                                            )}
                                                        </div>
                                                        <p className="text-xs text-gray-700">{reply.comment}</p>
                                                        <p className="text-[10px] text-gray-500 mt-1">
                                                            {toHijriDate(reply.created_at)}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
                                <FaComment className="mx-auto text-3xl text-gray-300 mb-3" />
                                <p className="text-sm text-gray-500">{t('studentProjectShowPage.comments.empty')}</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );

    return (
        <div dir={language === 'ar' ? 'rtl' : 'ltr'} className="min-h-screen bg-gray-50">
            <Head title={project.title} />

            {/* Mobile View */}
            <div className="block md:hidden">
                <MobileAppLayout
                    auth={auth}
                    title={t('common.appName')}
                    activeNav="explore"
                    unreadCount={auth?.unreadCount || 0}
                    onNotifications={() => router.visit('/notifications')}
                    onBack={() => router.visit('/projects')}
                >
                    {ProjectContent()}
                </MobileAppLayout>
            </div>

            {/* Desktop View */}
            <div className="hidden md:block">
                <MobileTopBar
                    title={t('common.appName')}
                    unreadCount={auth?.unreadCount || 0}
                    onNotifications={() => router.visit('/notifications')}
                    onBack={() => router.visit('/projects')}
                    reverseOrder={false}
                    auth={auth}
                />
                <main className="mx-auto w-full max-w-6xl px-4 pb-24 pt-4">
                    <div className="mx-auto w-full max-w-3xl">
                        {ProjectContent()}
                    </div>
                </main>
                <MobileBottomNav active="explore" role={auth?.user?.role} isAuthed={!!auth?.user} user={auth?.user} />
            </div>
        </div>
    );
}

