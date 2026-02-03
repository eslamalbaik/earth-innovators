import { Head, useForm, router } from '@inertiajs/react';
import { useState, useRef } from 'react';
import { FaCloudUploadAlt, FaTrash, FaUpload, FaArrowRight, FaStar, FaUser, FaCalendar, FaFilePdf, FaImage, FaFile, FaDownload, FaPaperPlane } from 'react-icons/fa';
import MobileTopBar from '@/Components/Mobile/MobileTopBar';
import MobileBottomNav from '@/Components/Mobile/MobileBottomNav';
import { useToast } from '@/Contexts/ToastContext';

export default function StudentProjectCreate({ auth, projects = [], message, submissions = [] }) {
    const { showError, showSuccess } = useToast();
    const { data, setData, post, processing, errors } = useForm({
        project_id: '',
        files: [],
        comment: '',
    });

    const [fileList, setFileList] = useState([]);
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef(null);
    const [activeTab, setActiveTab] = useState('upload'); // 'upload' or 'evaluation'
    const [selectedSubmission, setSelectedSubmission] = useState(null);

    const handleFiles = (files) => {
        const fileArray = Array.from(files);
        const maxSize = 10 * 1024 * 1024; // 10 MB
        const validTypes = [
            'image/jpeg', 'image/jpg', 'image/png', 'image/gif',
            'video/mp4', 'video/avi', 'video/mov',
            'application/pdf',
        ];

        const validFiles = fileArray.filter(file => {
            if (file.size > maxSize) {
                showError(`الملف ${file.name} أكبر من 10 ميجابايت`);
                return false;
            }
            if (!validTypes.includes(file.type)) {
                showError(`نوع الملف ${file.name} غير مدعوم`);
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

        const currentFiles = data.files || [];
        setData('files', [...currentFiles, ...validFiles]);
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

    const handleFileInputChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            handleFiles(e.target.files);
        }
    };

    const removeFile = (fileId) => {
        setFileList(prev => {
            const filtered = prev.filter(f => f.id !== fileId);
            const filesToKeep = filtered.map(f => f.file);
            setData('files', filesToKeep);
            return filtered;
        });
    };

    const formatFileSize = (bytes) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    };

    const submit = (e) => {
        e.preventDefault();

        if (!data.project_id) {
            showError('يرجى اختيار المشروع');
            return;
        }

        if (data.files.length === 0) {
            showError('يرجى إرفاق ملف واحد على الأقل');
            return;
        }

        post(`/projects/${data.project_id}/submissions`, {
            forceFormData: true,
            onSuccess: () => {
                showSuccess('تم رفع المشروع بنجاح');
                router.visit('/student/projects');
            },
            onError: (errors) => {
                if (errors.error) {
                    showError(errors.error);
                } else {
                    showError('حدث خطأ أثناء رفع المشروع');
                }
            },
        });
    };

    const ProjectUploadContent = () => (
        <form onSubmit={submit} className="space-y-4">
            {message && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 text-sm text-yellow-800">
                    {message}
                </div>
            )}

            {/* Project Selection */}
            {projects.length > 0 && (
                <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">اختر المشروع</label>
                    <select
                        value={data.project_id}
                        onChange={(e) => setData('project_id', e.target.value)}
                        className="w-full h-12 px-4 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#A3C042]/30 focus:border-[#A3C042] text-sm"
                        required
                    >
                        <option value="">-- اختر المشروع --</option>
                        {projects.map((project) => (
                            <option key={project.id} value={project.id}>
                                {project.title || `مشروع #${project.id}`}
                            </option>
                        ))}
                    </select>
                    {errors.project_id && (
                        <p className="mt-1 text-xs text-red-500">{errors.project_id}</p>
                    )}
                </div>
            )}

            {/* Comment */}
            <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">ملاحظات / تعليق</label>
                <textarea
                    value={data.comment}
                    onChange={(e) => setData('comment', e.target.value)}
                    placeholder="أضف أي ملاحظات حول تسليمك..."
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#A3C042]/30 focus:border-[#A3C042] text-sm resize-none"
                />
                {errors.comment && (
                    <p className="mt-1 text-xs text-red-500">{errors.comment}</p>
                )}
            </div>

            {/* File Upload */}
            <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">الملفات</label>
                <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition ${dragActive
                        ? 'border-[#A3C042] bg-[#A3C042]/5'
                        : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                        }`}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        onChange={handleFileInputChange}
                        className="hidden"
                        accept="image/*,video/*,.pdf"
                    />
                    <FaCloudUploadAlt className="mx-auto text-4xl text-gray-400 mb-3" />
                    <p className="text-sm text-gray-700 mb-1">
                        اسحب وأفلت الملفات هنا أو انقر للاختيار
                    </p>
                    <p className="text-xs text-gray-500">
                        صور، فيديو، PDF (الحد الأقصى: 10 ميجابايت لكل ملف)
                    </p>
                </div>

                {/* File List */}
                {fileList.length > 0 && (
                    <div className="mt-3 space-y-2">
                        {fileList.map((fileItem) => (
                            <div
                                key={fileItem.id}
                                className="flex items-center justify-between bg-gray-50 rounded-xl p-3"
                            >
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                    <span className="text-lg">
                                        {fileItem.type.startsWith('image/') ? '🖼️' :
                                            fileItem.type.startsWith('video/') ? '🎥' : '📄'}
                                    </span>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-semibold text-gray-900 truncate">
                                            {fileItem.name}
                                        </p>
                                        <p className="text-[10px] text-gray-500">
                                            {formatFileSize(fileItem.size)}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => removeFile(fileItem.id)}
                                    className="text-red-500 hover:text-red-700 p-1"
                                >
                                    <FaTrash className="text-sm" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
                {errors.files && (
                    <p className="mt-1 text-xs text-red-500">{errors.files}</p>
                )}
            </div>

            {/* Submit Button */}
            <button
                type="submit"
                disabled={processing}
                className="w-full h-12 rounded-xl bg-[#A3C042] text-white font-bold text-sm hover:bg-[#8CA635] transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {processing ? (
                    <>
                        <span className="animate-spin">⏳</span>
                        جاري الرفع...
                    </>
                ) : (
                    <>
                        <FaUpload />
                        رفع المشروع
                    </>
                )}
            </button>
        </form>
    );

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}/${month}/${day}`;
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

    const EvaluationContent = () => {
        const currentSubmission = selectedSubmission || (submissions.length > 0 ? submissions[0] : null);

        if (submissions.length === 0) {
            return (
                <div className="text-center py-12">
                    <p className="text-gray-600 text-sm">لا توجد مشاريع مقدمة بعد</p>
                </div>
            );
        }

        return (
            <div className="space-y-4">
                {/* Header */}
                <div className="rounded-2xl bg-[#eef8d6] px-4 py-3">
                    <h1 className="text-xl font-extrabold text-gray-900 text-center">تقييم المشاريع</h1>
                </div>

                {/* Selected Submission Details */}
                {currentSubmission && (
                    <div className="bg-white rounded-2xl border border-gray-100 p-4">
                        <div className="text-lg font-extrabold text-gray-900">
                            {currentSubmission.project?.title || 'مشروع غير محدد'}
                        </div>
                        {currentSubmission.project?.description && (
                            <div className="mt-1 text-sm text-gray-600">
                                {currentSubmission.project.description}
                            </div>
                        )}

                        <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                            <div className="flex items-center gap-2">
                                <FaCalendar className="text-gray-400" />
                                <span>{formatDate(currentSubmission.submitted_at)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span>الطالب: {auth?.user?.name || 'غير محدد'}</span>
                            </div>
                        </div>

                        {/* Attached Files */}
                        {currentSubmission.files && currentSubmission.files.length > 0 && (
                            <div className="mt-4">
                                <div className="text-sm font-bold text-gray-900 mb-2">الملفات المرفقة:</div>
                                <div className="space-y-2">
                                    {currentSubmission.files.map((file, index) => {
                                        const fileName = typeof file === 'string' ? file.split('/').pop() : file;
                                        return (
                                            <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                                                {getFileIcon(fileName)}
                                                <span className="flex-1 text-sm text-gray-900">{fileName}</span>
                                                <a
                                                    href={getFileUrl(file)}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 hover:text-blue-700"
                                                >
                                                    <FaDownload />
                                                </a>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Rating */}
                        {currentSubmission.rating !== null && currentSubmission.rating !== undefined && (
                            <div className="mt-4">
                                <div className="text-sm font-bold text-gray-900 mb-2">التقييم</div>
                                <div className="flex items-center gap-2" dir="ltr">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <FaStar
                                            key={star}
                                            className={`text-2xl ${star <= Math.round(currentSubmission.rating)
                                                ? 'text-yellow-400 fill-current'
                                                : 'text-gray-300'
                                                }`}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Comments */}
                        <div className="mt-4">
                            <div className="text-sm font-bold text-gray-900 mb-2">التعليقات</div>
                            <div className="bg-gray-50 rounded-xl p-4 mb-3 text-center text-gray-500 text-sm">
                                {currentSubmission.feedback ? currentSubmission.feedback : 'لا توجد تعليقات بعد'}
                            </div>
                        </div>

                        {/* Evaluation Notes */}
                        {currentSubmission.feedback && (
                            <div className="mt-4">
                                <div className="text-sm font-bold text-gray-900 mb-2">ملاحظات تقييمية</div>
                                <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700">
                                    {currentSubmission.feedback}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Submitted Projects List - Mobile Only */}
                {submissions.length > 0 && (
                    <div className="bg-white rounded-2xl border border-gray-100 p-4 md:hidden">
                        <div className="text-sm font-bold text-gray-900 mb-3">المشاريع المقدمة</div>
                        <div className="space-y-2">
                            {submissions.map((sub) => (
                                <button
                                    key={sub.id}
                                    type="button"
                                    onClick={() => setSelectedSubmission(sub)}
                                    className={`w-full  p-3 rounded-xl border transition ${currentSubmission?.id === sub.id
                                        ? 'border-blue-500 bg-blue-50'
                                        : 'border-gray-100 bg-white hover:bg-gray-50'
                                        }`}
                                >
                                    <div className="text-sm font-semibold text-gray-900 line-clamp-1">
                                        {sub.project?.title || 'مشروع غير محدد'}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">
                                        {formatDate(sub.submitted_at)}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div dir="rtl" className="min-h-screen bg-gray-50">
            <Head title="رفع مشروع - إرث المبتكرين" />

            {/* Mobile View */}
            <div className="block md:hidden">
                <MobileTopBar
                    title="إرث المبتكرين"
                    unreadCount={auth?.unreadCount || 0}
                    onNotifications={() => router.visit('/notifications')}
                    onBack={() => router.visit('/')}
                    reverseOrder={false}
                />
                <main className="px-4 pb-24 pt-4 space-y-4">
                    {/* Tabs */}
                    <div className="bg-white rounded-2xl border border-gray-100 p-3">
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setActiveTab('evaluation')}
                                className={`rounded-xl py-2.5 text-sm font-bold transition ${activeTab === 'evaluation'
                                    ? 'bg-[#A3C042] text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                صفحة التقييم
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveTab('upload')}
                                className={`rounded-xl py-2.5 text-sm font-bold transition ${activeTab === 'upload'
                                    ? 'bg-[#A3C042] text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                رفع المشروع
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="bg-white rounded-2xl border border-gray-100 p-4">
                        {activeTab === 'upload' ? (
                            ProjectUploadContent()
                        ) : (
                            EvaluationContent()
                        )}
                    </div>
                </main>
                <MobileBottomNav active="explore" role={auth?.user?.role} isAuthed={!!auth?.user} user={auth?.user} />
            </div>

            {/* Desktop View */}
            <div className="hidden md:block">
                <MobileTopBar
                    title="إرث المبتكرين"
                    unreadCount={auth?.unreadCount || 0}
                    onNotifications={() => router.visit('/notifications')}
                    onBack={() => router.visit('/')}
                    reverseOrder={false}
                />
                <main className="mx-auto w-full max-w-6xl px-4 pb-24 pt-4">
                    <div className="space-y-4 lg:grid lg:grid-cols-12 lg:gap-6 lg:space-y-0">
                        {/* Left Column - Tabs and Main Content */}
                        <div className="lg:col-span-8 space-y-4">
                            {/* Tabs */}
                            <div className="bg-white rounded-2xl border border-gray-100 p-3">
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab('upload')}
                                        className={`rounded-xl py-2.5 text-sm font-bold transition ${activeTab === 'upload'
                                            ? 'bg-[#A3C042] text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                    >
                                        رفع المشروع
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab('evaluation')}
                                        className={`rounded-xl py-2.5 text-sm font-bold transition ${activeTab === 'evaluation'
                                            ? 'bg-[#A3C042] text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                    >
                                        صفحة التقييم
                                    </button>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="bg-white rounded-2xl border border-gray-100 p-6">
                                {activeTab === 'upload' ? (
                                    ProjectUploadContent()
                                ) : (
                                    EvaluationContent()
                                )}
                            </div>
                        </div>

                        {/* Right Column - Submitted Projects List (for evaluation tab) */}
                        {activeTab === 'evaluation' && submissions.length > 0 && (
                            <div className="lg:col-span-4">
                                <div className="bg-white rounded-2xl border border-gray-100 p-4 sticky top-24">
                                    <div className="text-sm font-bold text-gray-900 mb-3">المشاريع المقدمة</div>
                                    <div className="space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto">
                                        {submissions.map((sub) => {
                                            const currentSubmission = selectedSubmission || (submissions.length > 0 ? submissions[0] : null);
                                            return (
                                                <button
                                                    key={sub.id}
                                                    type="button"
                                                    onClick={() => setSelectedSubmission(sub)}
                                                    className={`w-full  p-3 rounded-xl border transition ${currentSubmission?.id === sub.id
                                                        ? 'border-blue-500 bg-blue-50'
                                                        : 'border-gray-100 bg-white hover:bg-gray-50'
                                                        }`}
                                                >
                                                    <div className="text-sm font-semibold text-gray-900 line-clamp-1">
                                                        {sub.project?.title || 'مشروع غير محدد'}
                                                    </div>
                                                    <div className="text-xs text-gray-500 mt-1">
                                                        {formatDate(sub.submitted_at)}
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </main>
                <MobileBottomNav active="explore" role={auth?.user?.role} isAuthed={!!auth?.user} user={auth?.user} />
            </div>
        </div>
    );
}

