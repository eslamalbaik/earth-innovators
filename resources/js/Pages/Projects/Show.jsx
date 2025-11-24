import { Head, Link, useForm, router } from '@inertiajs/react';
import MainLayout from '../../Layouts/MainLayout';
import { useState, useRef } from 'react';
import { toHijriDate } from '@/utils/dateUtils';
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
    FaSchool
} from 'react-icons/fa';
import TextInput from '../../Components/TextInput';
import InputLabel from '../../Components/InputLabel';
import InputError from '../../Components/InputError';
import PrimaryButton from '../../Components/PrimaryButton';

export default function ProjectShow({ auth, project, existingSubmission, userRole, canSubmit }) {
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
                alert(`الملف ${file.name} أكبر من 10 ميجابايت`);
                return false;
            }

            if (!validTypes.includes(file.type)) {
                alert(`نوع الملف ${file.name} غير مدعوم`);
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

    return (
        <MainLayout auth={auth}>
            <Head title={project.title} />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-6">
                    <Link
                        href="/projects"
                        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
                    >
                        <FaArrowLeft />
                        <span>العودة إلى المشاريع</span>
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900">{project.title}</h1>
                </div>

                {/* Tabs */}
                <div className="flex gap-4 mb-6 border-b border-gray-200">
                    <button
                        onClick={() => setActiveTab('details')}
                        className={`px-6 py-3 font-medium border-b-2 transition ${
                            activeTab === 'details'
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        تفاصيل المشروع
                    </button>
                    {canSubmit && (
                        <button
                            onClick={() => setActiveTab('submit')}
                            className={`px-6 py-3 font-medium border-b-2 transition ${
                                activeTab === 'submit'
                                    ? 'border-blue-600 text-blue-600'
                                    : 'border-transparent text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            {existingSubmission ? 'تحديث التسليم' : 'تسليم المشروع'}
                        </button>
                    )}
                    <button
                        onClick={() => setActiveTab('comments')}
                        className={`px-6 py-3 font-medium border-b-2 transition ${
                            activeTab === 'comments'
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        التعليقات ({project.comments?.length || 0})
                    </button>
                </div>

                {/* Details Tab */}
                {activeTab === 'details' && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="mb-6">
                            <div className="flex items-center gap-4 mb-4">
                                <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded">
                                    معتمد
                                </span>
                                <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm font-medium rounded">
                                    {project.category === 'science' ? 'علوم' :
                                     project.category === 'technology' ? 'تقنية' :
                                     project.category === 'engineering' ? 'هندسة' :
                                     project.category === 'mathematics' ? 'رياضيات' :
                                     project.category === 'arts' ? 'فنون' : 'أخرى'}
                                </span>
                                <div className="flex items-center gap-2 text-gray-600 text-sm">
                                    <FaEye />
                                    <span>{project.views || 0} مشاهدة</span>
                                </div>
                            </div>

                            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                                {project.description}
                            </p>
                        </div>

                        {/* Project Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 border-t border-gray-200">
                            {project.teacher && (
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">المعلم</p>
                                    <p className="font-medium text-gray-900 flex items-center gap-2">
                                        <FaGraduationCap className="text-blue-600" />
                                        {project.teacher.name || 'غير محدد'}
                                    </p>
                                </div>
                            )}
                            {project.school && (
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">المدرسة</p>
                                    <p className="font-medium text-gray-900 flex items-center gap-2">
                                        <FaSchool className="text-green-600" />
                                        {project.school.name}
                                    </p>
                                </div>
                            )}
                            {project.approved_at && (
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">تاريخ الموافقة</p>
                                    <p className="font-medium text-gray-900 flex items-center gap-2">
                                        <FaCalendar />
                                        {toHijriDate(project.approved_at)}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Existing Submission */}
                        {existingSubmission && (
                            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                <h3 className="font-bold text-blue-900 mb-2">تسليمك الحالي</h3>
                                <p className="text-sm text-blue-800 mb-2">
                                    الحالة: <span className="font-medium">{existingSubmission.status}</span>
                                </p>
                                {existingSubmission.comment && (
                                    <p className="text-sm text-blue-700 mb-2">{existingSubmission.comment}</p>
                                )}
                                {existingSubmission.feedback && (
                                    <div className="mt-2 p-3 bg-white rounded border border-blue-200">
                                        <p className="text-sm font-medium text-blue-900 mb-1">الرد:</p>
                                        <p className="text-sm text-blue-800">{existingSubmission.feedback}</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Submit Tab - للطلاب فقط */}
                {activeTab === 'submit' && canSubmit && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <form onSubmit={submitProject}>
                            <div className="mb-6">
                                <InputLabel htmlFor="comment" value="تعليق (اختياري)" />
                                <textarea
                                    id="comment"
                                    value={submissionForm.data.comment}
                                    onChange={(e) => submissionForm.setData('comment', e.target.value)}
                                    rows={4}
                                    className="block w-full mt-2 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    placeholder="اكتب تعليقاً على تسليمك..."
                                />
                                <InputError message={submissionForm.errors.comment} />
                            </div>

                            <div className="mb-6">
                                <InputLabel value="الملفات" />
                                <div
                                    onDragEnter={handleDrag}
                                    onDragLeave={handleDrag}
                                    onDragOver={handleDrag}
                                    onDrop={handleDrop}
                                    className={`border-2 border-dashed rounded-lg p-8 text-center transition ${
                                        dragActive
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-gray-300 hover:border-blue-400'
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
                                    <FaCloudUploadAlt className="mx-auto text-4xl text-gray-400 mb-4" />
                                    <p className="text-gray-700 mb-2">
                                        اسحب وأفلت الملفات هنا أو انقر للاختيار
                                    </p>
                                    <p className="text-sm text-gray-500 mb-4">
                                        صور، فيديو، PDF، ZIP (الحد الأقصى: 10 ميجابايت لكل ملف)
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                                    >
                                        اختر ملفات
                                    </button>
                                </div>
                                <InputError message={submissionForm.errors.files} />

                                {fileList.length > 0 && (
                                    <div className="mt-4 space-y-2">
                                        {fileList.map((fileItem) => (
                                            <div
                                                key={fileItem.id}
                                                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
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
                                    className="bg-blue-600 hover:bg-blue-700"
                                >
                                    {submissionForm.processing ? (
                                        <>
                                            <FaSpinner className="animate-spin mr-2" />
                                            جاري التسليم...
                                        </>
                                    ) : (
                                        <>
                                            <FaUpload className="mr-2" />
                                            {existingSubmission ? 'تحديث التسليم' : 'تسليم المشروع'}
                                        </>
                                    )}
                                </PrimaryButton>
                            </div>
                        </form>
                    </div>
                )}

                {/* Comments Tab */}
                {activeTab === 'comments' && (
                    <div className="space-y-6">
                        {/* Add Comment Form - للمستخدمين المسجلين */}
                        {auth.user && (
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <h3 className="font-bold text-gray-900 mb-4">
                                    {replyingTo ? 'رد على التعليق' : 'إضافة تعليق'}
                                </h3>
                                <form onSubmit={submitComment}>
                                    <div className="mb-4">
                                        <textarea
                                            value={commentForm.data.comment}
                                            onChange={(e) => commentForm.setData('comment', e.target.value)}
                                            rows={4}
                                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                            placeholder="اكتب تعليقك..."
                                            required
                                        />
                                        <InputError message={commentForm.errors.comment} />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        {replyingTo && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setReplyingTo(null);
                                                    commentForm.setData('parent_id', null);
                                                }}
                                                className="text-gray-600 hover:text-gray-900"
                                            >
                                                إلغاء
                                            </button>
                                        )}
                                        <PrimaryButton
                                            type="submit"
                                            disabled={commentForm.processing}
                                            className="bg-blue-600 hover:bg-blue-700"
                                        >
                                            {commentForm.processing ? (
                                                <>
                                                    <FaSpinner className="animate-spin mr-2" />
                                                    جاري الإرسال...
                                                </>
                                            ) : (
                                                <>
                                                    <FaComment className="mr-2" />
                                                    {replyingTo ? 'إرسال الرد' : 'إرسال التعليق'}
                                                </>
                                            )}
                                        </PrimaryButton>
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* Comments List */}
                        <div className="space-y-4">
                            {project.comments && project.comments.length > 0 ? (
                                project.comments.map((comment) => (
                                    <div key={comment.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                                    <FaUser className="text-blue-600" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">
                                                        {comment.user?.name || 'مستخدم'}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {toHijriDate(comment.created_at)}
                                                    </p>
                                                </div>
                                            </div>
                                            {auth.user && comment.user_id === auth.user.id && (
                                                <button
                                                    onClick={() => router.delete(`/project-comments/${comment.id}`)}
                                                    className="text-red-500 hover:text-red-700"
                                                >
                                                    <FaTimes />
                                                </button>
                                            )}
                                        </div>
                                        <p className="text-gray-700 mb-3">{comment.comment}</p>
                                        {auth.user && (
                                            <div className="flex items-center gap-4">
                                                <button
                                                    onClick={() => startReply(comment.id)}
                                                    className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1"
                                                >
                                                    <FaReply />
                                                    رد
                                                </button>
                                            </div>
                                        )}

                                        {/* Replies */}
                                        {comment.replies && comment.replies.length > 0 && (
                                            <div className="mt-4 pr-6 border-r-2 border-gray-200 space-y-4">
                                                {comment.replies.map((reply) => (
                                                    <div key={reply.id} className="flex items-start gap-3">
                                                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                                                            <FaUser className="text-gray-600 text-xs" />
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="flex items-center justify-between mb-1">
                                                                <p className="font-medium text-gray-900 text-sm">
                                                                    {reply.user?.name || 'مستخدم'}
                                                                </p>
                                                                {auth.user && reply.user_id === auth.user.id && (
                                                                    <button
                                                                        onClick={() => router.delete(`/project-comments/${reply.id}`)}
                                                                        className="text-red-500 hover:text-red-700 text-xs"
                                                                    >
                                                                        <FaTimes />
                                                                    </button>
                                                                )}
                                                            </div>
                                                            <p className="text-gray-700 text-sm">{reply.comment}</p>
                                                            <p className="text-xs text-gray-500 mt-1">
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
                                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                                    <FaComment className="mx-auto text-4xl text-gray-300 mb-4" />
                                    <p className="text-gray-500">لا توجد تعليقات بعد</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </MainLayout>
    );
}

