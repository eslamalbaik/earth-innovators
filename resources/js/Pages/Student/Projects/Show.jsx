import { Head, Link, useForm, router } from '@inertiajs/react';
import MobileAppLayout from '@/Layouts/MobileAppLayout';
import MobileTopBar from '@/Components/Mobile/MobileTopBar';
import MobileBottomNav from '@/Components/Mobile/MobileBottomNav';
import { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import { toHijriDate, toGregorianDate } from '@/utils/dateUtils';
import { useToast } from '@/Contexts/ToastContext';
import {
    FaArrowLeft,
    FaUpload,
    FaCloudUploadAlt,
    FaTrash,
    FaFile,
    FaSpinner,
    FaComment,
    FaReply,
    FaEdit,
    FaTimes,
    FaUser,
    FaCalendar,
    FaEye,
    FaStar,
    FaAward,
    FaSchool,
    FaCheckCircle
} from 'react-icons/fa';
import TextInput from '../../../Components/TextInput';
import InputLabel from '../../../Components/InputLabel';
import InputError from '../../../Components/InputError';
import PrimaryButton from '../../../Components/PrimaryButton';

export default function StudentProjectShow({ auth, project, existingSubmission }) {
    const [activeTab, setActiveTab] = useState('details'); // 'details', 'submit', 'comments'
    const [fileList, setFileList] = useState([]);
    const [dragActive, setDragActive] = useState(false);
    const [replyingTo, setReplyingTo] = useState(null);
    const [commentText, setCommentText] = useState('');
    const [commentParentId, setCommentParentId] = useState(null);
    const [isSubmittingComment, setIsSubmittingComment] = useState(false);
    const fileInputRef = useRef(null);
    const commentTextareaRef = useRef(null);
    const { showSuccess } = useToast();


    const submissionForm = useForm({
        files: [],
        comment: '',
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
                // Show success notification on the left
                showSuccess('تم تسليم المشروع بنجاح!', {
                    title: 'نجاح التسليم',
                    autoDismiss: 5000,
                });
                // Switch to details tab
                setActiveTab('details');
                // Reload to get updated submission data
                router.reload({
                    preserveScroll: true,
                    onFinish: () => {
                        // Scroll to top to see the submission status
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                });
            },
        });
    };

    const submitComment = (e) => {
        e.preventDefault();
        if (!commentText.trim() || isSubmittingComment) return;

        setIsSubmittingComment(true);
        router.post(`/projects/${project.id}/comments`, {
            comment: commentText,
            parent_id: commentParentId,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setCommentText('');
                setCommentParentId(null);
                setReplyingTo(null);
                setIsSubmittingComment(false);
                router.reload({ only: ['project'] });
            },
            onError: () => {
                setIsSubmittingComment(false);
            },
        });
    };

    const handleCommentChange = (e) => {
        setCommentText(e.target.value);
    };

    const startReply = (commentId) => {
        setReplyingTo(commentId);
        setCommentParentId(commentId);
        setCommentText('');
        setActiveTab('comments');
        // Focus the textarea after a short delay to ensure it's rendered
        setTimeout(() => {
            commentTextareaRef.current?.focus();
        }, 100);
    };

    const ProjectContent = () => (
        <div className="space-y-4">
            {/* Header */}
            <div className="mb-4">
                <h1 className="text-lg font-extrabold text-gray-900 mb-2">{project.title}</h1>
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                        معتمد
                    </span>
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full">
                        {project.category === 'science' ? 'علوم' :
                            project.category === 'technology' ? 'تقنية' :
                                project.category === 'engineering' ? 'هندسة' :
                                    project.category === 'mathematics' ? 'رياضيات' :
                                        project.category === 'arts' ? 'فنون' : 'أخرى'}
                    </span>
                    <div className="flex items-center gap-1 text-gray-600 text-xs">
                        <FaEye />
                        <span>{project.views || 0}</span>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide border-b border-gray-200">
                <button
                    onClick={() => setActiveTab('details')}
                    className={`whitespace-nowrap px-4 py-2 text-sm font-bold border-b-2 transition ${activeTab === 'details'
                        ? 'border-[#A3C042] text-[#A3C042]'
                        : 'border-transparent text-gray-600'
                        }`}
                >
                    التفاصيل
                </button>
                <button
                    onClick={() => setActiveTab('submit')}
                    className={`whitespace-nowrap px-4 py-2 text-sm font-bold border-b-2 transition ${activeTab === 'submit'
                        ? 'border-[#A3C042] text-[#A3C042]'
                        : 'border-transparent text-gray-600'
                        }`}
                >
                    {existingSubmission ? 'تحديث' : 'تسليم'}
                </button>
                <button
                    onClick={() => setActiveTab('comments')}
                    className={`whitespace-nowrap px-4 py-2 text-sm font-bold border-b-2 transition ${activeTab === 'comments'
                        ? 'border-[#A3C042] text-[#A3C042]'
                        : 'border-transparent text-gray-600'
                        }`}
                >
                    التعليقات ({project.comments?.length || 0})
                </button>
            </div>

            {/* Details Tab */}
            {activeTab === 'details' && (
                <div className="space-y-4">
                    <div className="bg-white rounded-2xl border border-gray-100 p-4">
                        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line mb-4">
                            {project.description}
                        </p>

                        {/* Project Info */}
                        <div className="space-y-3 pt-4 border-t border-gray-200">
                            {/* عرض المعلم فقط إذا لم يكن المشروع من الإدارة */}
                            {project.teacher && project.user?.role !== 'admin' && (
                                <div className="flex items-center gap-2">
                                    <p className="text-xs text-gray-600">المعلم:</p>
                                    <p className="text-sm font-semibold text-gray-900">
                                        {project.teacher.name || project.user?.name || 'غير محدد'}
                                    </p>
                                </div>
                            )}
                            {/* عرض المدرسة أو الإدارة */}
                            {project.school ? (
                                <div className="flex items-center gap-2">
                                    <FaSchool className="text-green-600 text-sm" />
                                    <p className="text-xs text-gray-600">المدرسة:</p>
                                    <p className="text-sm font-semibold text-gray-900">
                                        {project.school.name}
                                    </p>
                                </div>
                            ) : project.user?.role === 'admin' ? (
                                <div className="flex items-center gap-2">
                                    <FaSchool className="text-purple-600 text-sm" />
                                    <p className="text-sm font-semibold text-gray-900">
                                        من إدارة مجتمع إرث المبتكرين
                                    </p>
                                </div>
                            ) : null}
                            {project.approved_at && (
                                <div className="flex items-center gap-2">
                                    <FaCalendar className="text-gray-400 text-sm" />
                                    <p className="text-xs text-gray-600">تاريخ الموافقة:</p>
                                    <p className="text-sm font-semibold text-gray-900">
                                        {toHijriDate(project.approved_at)}
                                    </p>
                                </div>
                            )}
                        </div>

                    </div>

                    {/* Existing Submission */}
                    {existingSubmission && (
                        <div className="space-y-4">
                            <div className="bg-green-50 border-2 border-green-300 rounded-2xl p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-sm font-bold text-green-900 flex items-center gap-2">
                                        <FaCheckCircle className="text-green-600" />
                                        تم تسليم المشروع
                                    </h3>
                                    {/* إخفاء زر التعديل إذا تم تقييم المشروع */}
                                    {!existingSubmission.reviewed_at && existingSubmission.status === 'submitted' && (
                                        <button
                                            onClick={() => setActiveTab('submit')}
                                            className="px-3 py-1.5 bg-[#A3C042] text-white rounded-xl hover:bg-[#8CA635] transition text-xs font-semibold"
                                        >
                                            تعديل
                                        </button>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm text-green-800">
                                        الحالة: <span className="font-bold text-green-900">
                                            {existingSubmission.status === 'submitted' ? 'مُسلم' :
                                                existingSubmission.status === 'reviewed' ? 'تم المراجعة' :
                                                    existingSubmission.status === 'approved' ? 'مقبول' :
                                                        existingSubmission.status === 'rejected' ? 'مرفوض' : existingSubmission.status}
                                        </span>
                                    </p>
                                    {(existingSubmission.submitted_at || existingSubmission.created_at) && (
                                        <p className="text-xs text-green-700">
                                            تاريخ التسليم: {toGregorianDate(existingSubmission.submitted_at || existingSubmission.created_at)}
                                        </p>
                                    )}
                                    {existingSubmission.comment && (
                                        <div className="mt-2">
                                            <p className="text-sm font-medium text-green-900 mb-1">تعليقك:</p>
                                            <p className="text-sm text-green-800 bg-white p-2 rounded border border-green-200">{existingSubmission.comment}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Evaluation Display */}
                            {(existingSubmission.rating || existingSubmission.feedback || (existingSubmission.badges && existingSubmission.badges.length > 0)) && (
                                <div className="bg-green-50 border-2 border-green-300 rounded-2xl p-4">
                                    <h3 className="text-base font-bold text-green-900 mb-4 flex items-center gap-2">
                                        <span>✨</span>
                                        <span>تقييم مشروعك</span>
                                    </h3>

                                    {/* Rating */}
                                    {existingSubmission.rating && (
                                        <div className="mb-4">
                                            <p className="text-sm font-medium text-green-800 mb-2">التقييم:</p>
                                            <div className="flex items-center gap-2" dir="ltr">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <span
                                                        key={star}
                                                        className={`text-2xl ${star <= existingSubmission.rating
                                                            ? 'text-yellow-400'
                                                            : 'text-gray-300'
                                                            }`}
                                                    >
                                                        ★
                                                    </span>
                                                ))}
                                                <span className="mr-2 text-lg font-bold text-green-900">
                                                    ({existingSubmission.rating}/5)
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Feedback */}
                                    {existingSubmission.feedback && (
                                        <div className="mb-4">
                                            <p className="text-sm font-medium text-green-800 mb-2">ملاحظات المعلم:</p>
                                            <div className="p-3 bg-white rounded border border-green-200">
                                                <p className="text-sm text-green-900 whitespace-pre-line">{existingSubmission.feedback}</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Badges */}
                                    {existingSubmission.badges && existingSubmission.badges.length > 0 && (
                                        <div>
                                            <p className="text-sm font-medium text-green-800 mb-2">الشارات الممنوحة:</p>
                                            <div className="flex flex-wrap gap-2">
                                                {existingSubmission.badges.map((badgeId, index) => {
                                                    const badge = existingSubmission.badges_data?.find(b => b.id === badgeId);
                                                    return (
                                                        <span
                                                            key={index}
                                                            className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-medium rounded-full border border-yellow-300"
                                                        >
                                                            {badge?.icon ? <span>{badge.icon}</span> : <FaAward />}
                                                            <span>{badge?.name_ar || badge?.name || `شارة #${badgeId}`}</span>
                                                        </span>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {existingSubmission.reviewed_at && (
                                        <p className="text-xs text-green-700 mt-4">
                                            تم التقييم في: {toGregorianDate(existingSubmission.reviewed_at)}
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Submit Tab */}
            {activeTab === 'submit' && (
                <div className="bg-white rounded-2xl border border-gray-100 p-4">
                    <form onSubmit={submitProject}>
                        <div className="mb-4">
                            <InputLabel htmlFor="comment" value="تعليق (اختياري)" className="text-sm" />
                            <textarea
                                id="comment"
                                value={submissionForm.data.comment}
                                onChange={(e) => submissionForm.setData('comment', e.target.value)}
                                rows={4}
                                className="block w-full mt-2 rounded-xl border-gray-300 shadow-sm focus:border-[#A3C042] focus:ring-[#A3C042] text-sm"
                                placeholder="اكتب تعليقاً على تسليمك..."
                            />
                            <InputError message={submissionForm.errors.comment} />
                        </div>

                        <div className="mb-4">
                            <InputLabel value="الملفات" className="text-sm" />
                            <div
                                onDragEnter={handleDrag}
                                onDragLeave={handleDrag}
                                onDragOver={handleDrag}
                                onDrop={handleDrop}
                                className={`border-2 border-dashed rounded-2xl p-6 text-center transition ${dragActive
                                    ? 'border-[#A3C042] bg-green-50'
                                    : 'border-gray-300'
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
                                <FaCloudUploadAlt className="mx-auto text-3xl text-gray-400 mb-3" />
                                <p className="text-sm text-gray-700 mb-2">
                                    اسحب وأفلت الملفات هنا أو انقر للاختيار
                                </p>
                                <p className="text-xs text-gray-500 mb-3">
                                    صور، فيديو، PDF، ZIP (الحد الأقصى: 10 ميجابايت لكل ملف)
                                </p>
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="px-4 py-2 bg-[#A3C042] text-white rounded-xl hover:bg-[#8CA635] transition text-sm font-semibold"
                                >
                                    اختر ملفات
                                </button>
                            </div>
                            <InputError message={submissionForm.errors.files} />

                            {fileList.length > 0 && (
                                <div className="mt-3 space-y-2">
                                    {fileList.map((fileItem) => (
                                        <div
                                            key={fileItem.id}
                                            className="flex items-center justify-between p-2 bg-gray-50 rounded-xl border border-gray-200"
                                        >
                                            <div className="flex items-center gap-2">
                                                <FaFile className="text-gray-400 text-sm" />
                                                <div>
                                                    <p className="text-xs font-medium text-gray-900">{fileItem.name}</p>
                                                    <p className="text-[10px] text-gray-500">{formatFileSize(fileItem.size)}</p>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => removeFile(fileItem.id)}
                                                className="text-red-500 hover:text-red-700"
                                            >
                                                <FaTrash className="text-xs" />
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
                                className="bg-[#A3C042] hover:bg-[#8CA635] text-sm"
                            >
                                {submissionForm.processing ? (
                                    <>
                                        <FaSpinner className="animate-spin ml-2" />
                                        جاري التسليم...
                                    </>
                                ) : (
                                    <>
                                        <FaUpload className="ml-2" />
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
                <div className="space-y-4">
                    {/* Add Comment Form */}
                    <div className="bg-white rounded-2xl border border-gray-100 p-4">
                        <h3 className="text-sm font-bold text-gray-900 mb-3">
                            {replyingTo ? 'رد على التعليق' : 'إضافة تعليق'}
                        </h3>
                        <form onSubmit={submitComment}>
                            <div className="mb-3">
                                <textarea
                                    id="comment-textarea"
                                    ref={commentTextareaRef}
                                    value={commentText}
                                    onChange={handleCommentChange}
                                    rows={4}
                                    className="block w-full rounded-xl border-gray-300 shadow-sm focus:border-[#A3C042] focus:ring-[#A3C042] text-sm"
                                    placeholder="اكتب تعليقك..."
                                    required
                                    autoComplete="off"
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setReplyingTo(null);
                                        setCommentText('');
                                        setCommentParentId(null);
                                    }}
                                    className="text-sm text-gray-600 hover:text-gray-900"
                                >
                                    إلغاء
                                </button>
                                <PrimaryButton
                                    type="submit"
                                    disabled={isSubmittingComment || !commentText.trim()}
                                    className="bg-[#A3C042] hover:bg-[#8CA635] text-sm"
                                >
                                    {isSubmittingComment ? (
                                        <>
                                            <FaSpinner className="animate-spin ml-2" />
                                            جاري الإرسال...
                                        </>
                                    ) : (
                                        <>
                                            <FaComment className="ml-2" />
                                            {replyingTo ? 'إرسال الرد' : 'إرسال التعليق'}
                                        </>
                                    )}
                                </PrimaryButton>
                            </div>
                        </form>
                    </div>

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
                                                <p className="text-xs font-semibold text-gray-900">
                                                    {comment.user?.name || 'مستخدم'}
                                                </p>
                                                <p className="text-[10px] text-gray-500">
                                                    {toHijriDate(comment.created_at)}
                                                </p>
                                            </div>
                                        </div>
                                        {comment.user_id === auth.user.id && (
                                            <button
                                                onClick={() => router.delete(`/project-comments/${comment.id}`)}
                                                className="text-red-500 hover:text-red-700"
                                            >
                                                <FaTimes className="text-xs" />
                                            </button>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-700 mb-2">{comment.comment}</p>
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => startReply(comment.id)}
                                            className="text-[#A3C042] hover:text-[#8CA635] text-xs flex items-center gap-1"
                                        >
                                            <FaReply />
                                            رد
                                        </button>
                                    </div>

                                    {/* Replies */}
                                    {comment.replies && comment.replies.length > 0 && (
                                        <div className="mt-3 pr-4 border-r-2 border-gray-200 space-y-3">
                                            {comment.replies.map((reply) => (
                                                <div key={reply.id} className="flex items-start gap-2">
                                                    <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                                                        <FaUser className="text-gray-600 text-[10px]" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center justify-between mb-1">
                                                            <p className="text-xs font-semibold text-gray-900">
                                                                {reply.user?.name || 'مستخدم'}
                                                            </p>
                                                            {reply.user_id === auth.user.id && (
                                                                <button
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
                                <p className="text-sm text-gray-500">لا توجد تعليقات بعد</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );

    return (
        <div dir="rtl" className="min-h-screen bg-gray-50">
            <Head title={project.title} />

            {/* Mobile View */}
            <div className="block md:hidden">
                <MobileAppLayout
                    auth={auth}
                    title={project.title}
                    activeNav="projects"
                    unreadCount={auth?.unreadCount || 0}
                    onNotifications={() => router.visit('/notifications')}
                    onBack={() => router.visit('/student/projects')}
                >
                    {ProjectContent()}
                </MobileAppLayout>
            </div>

            {/* Desktop View */}
            <div className="hidden md:block">
                <MobileTopBar
                    title={project.title}
                    unreadCount={auth?.unreadCount || 0}
                    onNotifications={() => router.visit('/notifications')}
                    onBack={() => router.visit('/student/projects')}
                    auth={auth}
                />
                <main className="mx-auto w-full max-w-6xl px-4 pb-24 pt-4">
                    <div className="mx-auto w-full max-w-3xl">
                        {ProjectContent()}
                    </div>
                </main>
                <MobileBottomNav active="projects" role={auth?.user?.role} isAuthed={!!auth?.user} user={auth?.user} />
            </div>
        </div>
    );
}

