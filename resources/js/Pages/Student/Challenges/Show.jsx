import { Head, Link, useForm, router } from '@inertiajs/react';
import DashboardLayout from '../../../Layouts/DashboardLayout';
import { useState, useRef } from 'react';
import {
    FaArrowLeft,
    FaUpload,
    FaCloudUploadAlt,
    FaTrash,
    FaFile,
    FaSpinner,
    FaCalendar,
    FaTrophy,
    FaUsers,
    FaCheckCircle,
    FaClock,
    FaTimesCircle,
    FaStar,
    FaAward
} from 'react-icons/fa';
import TextInput from '../../../Components/TextInput';
import InputLabel from '../../../Components/InputLabel';
import InputError from '../../../Components/InputError';
import PrimaryButton from '../../../Components/PrimaryButton';

export default function StudentChallengeShow({ auth, challenge }) {
    const [activeTab, setActiveTab] = useState('details');
    const [fileList, setFileList] = useState([]);
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef(null);

    const existingSubmission = challenge?.student_submission;

    const submissionForm = useForm({
        answer: existingSubmission?.answer || '',
        comment: existingSubmission?.comment || '',
        files: [],
    });

    const formatDate = (date) => {
        if (!date) return '';
        const d = new Date(date);
        const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
        return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
    };

    const getChallengeTypeLabel = (type) => {
        const labels = {
            '60_seconds': 'تحدّي 60 ثانية',
            'mental_math': 'حلها بدون قلم',
            'conversions': 'تحدّي التحويلات',
            'team_fastest': 'تحدّي الفريق الأسرع',
            'build_problem': 'ابنِ مسألة',
            'custom': 'تحدّي مخصص',
        };
        return labels[type] || type;
    };

    const getStatusBadge = () => {
        const now = new Date();
        const startDate = new Date(challenge.start_date);
        const deadline = new Date(challenge.deadline);

        if (challenge.status === 'active' && startDate <= now && deadline >= now) {
            return { bg: 'bg-green-100', text: 'text-green-800', label: 'نشط', icon: FaCheckCircle };
        } else if (challenge.status === 'active' && startDate > now) {
            return { bg: 'bg-blue-100', text: 'text-blue-800', label: 'قادم', icon: FaClock };
        } else {
            return { bg: 'bg-gray-100', text: 'text-gray-800', label: 'منتهي', icon: FaTimesCircle };
        }
    };

    const handleFiles = (files) => {
        const fileArray = Array.from(files);
        const validFiles = fileArray.filter(file => {
            const maxSize = 10 * 1024 * 1024; // 10 MB
            if (file.size > maxSize) {
                alert(`الملف ${file.name} أكبر من 10 ميجابايت`);
                return false;
            }
            return true;
        });

        setFileList(prev => [...prev, ...validFiles.map(file => ({
            file,
            id: Date.now() + Math.random(),
            name: file.name,
            size: file.size,
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

    const submitChallenge = (e) => {
        e.preventDefault();
        
        // Validate that at least answer or files are provided
        if (!submissionForm.data.answer?.trim() && fileList.length === 0) {
            alert('يجب تقديم إجابة أو رفع ملف واحد على الأقل');
            return;
        }
        
        const route = existingSubmission 
            ? `/student/challenges/${challenge.id}/submissions/${existingSubmission.id}`
            : `/student/challenges/${challenge.id}/submit`;
        
        const method = existingSubmission ? 'put' : 'post';
        
        submissionForm[method](route, {
            forceFormData: true,
            onSuccess: () => {
                submissionForm.reset();
                setFileList([]);
                router.reload();
            },
            onError: (errors) => {
                const firstError = Object.values(errors)[0];
                if (firstError) {
                    alert(Array.isArray(firstError) ? firstError[0] : firstError);
                }
            },
        });
    };

    const statusBadge = getStatusBadge();
    const StatusIcon = statusBadge.icon;
    const isActive = challenge.status === 'active' && 
                     new Date(challenge.start_date) <= new Date() && 
                     new Date(challenge.deadline) >= new Date();

    return (
        <DashboardLayout auth={auth}>
            <Head title={challenge.title} />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Link
                    href="/student/challenges"
                    className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
                >
                    <FaArrowLeft />
                    العودة إلى التحديات
                </Link>

                {/* Challenge Header */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <FaTrophy className="text-yellow-600 text-2xl" />
                                <h1 className="text-2xl font-bold text-gray-900">{challenge.title}</h1>
                                <span className={`px-3 py-1 ${statusBadge.bg} ${statusBadge.text} text-sm font-medium rounded flex items-center gap-1`}>
                                    <StatusIcon className="text-xs" />
                                    {statusBadge.label}
                                </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">
                                    {getChallengeTypeLabel(challenge.challenge_type)}
                                </span>
                                {challenge.points_reward > 0 && (
                                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded flex items-center gap-1">
                                        <FaStar />
                                        {challenge.points_reward} نقطة
                                    </span>
                                )}
                                {challenge.max_participants && (
                                    <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded flex items-center gap-1">
                                        <FaUsers />
                                        {challenge.current_participants || 0} / {challenge.max_participants}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                            <FaCalendar />
                            <span><strong>تاريخ البدء:</strong> {formatDate(challenge.start_date)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <FaCalendar />
                            <span><strong>تاريخ الانتهاء:</strong> {formatDate(challenge.deadline)}</span>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
                    <div className="border-b border-gray-200">
                        <div className="flex">
                            <button
                                onClick={() => setActiveTab('details')}
                                className={`px-6 py-3 font-medium text-sm ${
                                    activeTab === 'details'
                                        ? 'border-b-2 border-blue-600 text-blue-600'
                                        : 'text-gray-600 hover:text-gray-900'
                                }`}
                            >
                                التفاصيل
                            </button>
                            {isActive && (
                                <button
                                    onClick={() => setActiveTab('submit')}
                                    className={`px-6 py-3 font-medium text-sm ${
                                        activeTab === 'submit'
                                            ? 'border-b-2 border-blue-600 text-blue-600'
                                            : 'text-gray-600 hover:text-gray-900'
                                    }`}
                                >
                                    {existingSubmission ? 'تحديث التقديم' : 'تقديم الحل'}
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Details Tab */}
                    {activeTab === 'details' && (
                        <div className="p-6">
                            {challenge.objective && (
                                <div className="mb-6">
                                    <h3 className="text-lg font-bold text-gray-900 mb-2">الهدف</h3>
                                    <p className="text-gray-700">{challenge.objective}</p>
                                </div>
                            )}

                            {challenge.description && (
                                <div className="mb-6">
                                    <h3 className="text-lg font-bold text-gray-900 mb-2">الوصف</h3>
                                    <p className="text-gray-700 whitespace-pre-line">{challenge.description}</p>
                                </div>
                            )}

                            {challenge.instructions && (
                                <div className="mb-6">
                                    <h3 className="text-lg font-bold text-gray-900 mb-2">كيفية التنفيذ</h3>
                                    <p className="text-gray-700 whitespace-pre-line">{challenge.instructions}</p>
                                </div>
                            )}

                            {existingSubmission && (
                                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                                    <h3 className="text-lg font-bold text-gray-900 mb-2">حالة التقديم</h3>
                                    <div className="space-y-2">
                                        <p><strong>الحالة:</strong> {
                                            existingSubmission.status === 'submitted' ? 'تم التقديم' :
                                            existingSubmission.status === 'reviewed' ? 'قيد المراجعة' :
                                            existingSubmission.status === 'approved' ? 'مقبول' :
                                            existingSubmission.status === 'rejected' ? 'مرفوض' : existingSubmission.status
                                        }</p>
                                        {existingSubmission.rating && (
                                            <p><strong>التقييم:</strong> {existingSubmission.rating} / 10</p>
                                        )}
                                        {existingSubmission.points_earned > 0 && (
                                            <p className="flex items-center gap-1 text-green-700">
                                                <FaAward />
                                                <strong>النقاط المكتسبة:</strong> {existingSubmission.points_earned}
                                            </p>
                                        )}
                                        {existingSubmission.feedback && (
                                            <div>
                                                <strong>ملاحظات المقيّم:</strong>
                                                <p className="text-gray-700 mt-1">{existingSubmission.feedback}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Submit Tab */}
                    {activeTab === 'submit' && isActive && (
                        <div className="p-6">
                            <form onSubmit={submitChallenge}>
                                <div className="mb-6">
                                    <InputLabel htmlFor="answer" value="الحل / الإجابة *" />
                                    <textarea
                                        id="answer"
                                        value={submissionForm.data.answer}
                                        onChange={(e) => submissionForm.setData('answer', e.target.value)}
                                        rows={8}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        placeholder="اكتب حل التحدي أو إجابتك هنا..."
                                        required
                                    />
                                    <InputError message={submissionForm.errors.answer} className="mt-2" />
                                </div>

                                <div className="mb-6">
                                    <InputLabel htmlFor="comment" value="تعليق (اختياري)" />
                                    <textarea
                                        id="comment"
                                        value={submissionForm.data.comment}
                                        onChange={(e) => submissionForm.setData('comment', e.target.value)}
                                        rows={4}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        placeholder="أضف أي تعليقات إضافية..."
                                    />
                                    <InputError message={submissionForm.errors.comment} className="mt-2" />
                                </div>

                                <div className="mb-6">
                                    <InputLabel value="الملفات (اختياري)" />
                                    <div
                                        className={`mt-2 border-2 border-dashed rounded-lg p-6 text-center transition ${
                                            dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                                        }`}
                                        onDragEnter={handleDrag}
                                        onDragLeave={handleDrag}
                                        onDragOver={handleDrag}
                                        onDrop={handleDrop}
                                    >
                                        <FaCloudUploadAlt className="mx-auto text-4xl text-gray-400 mb-2" />
                                        <p className="text-gray-600 mb-2">
                                            اسحب الملفات هنا أو
                                            <button
                                                type="button"
                                                onClick={() => fileInputRef.current?.click()}
                                                className="text-blue-600 hover:text-blue-700 underline mx-1"
                                            >
                                                اختر ملفات
                                            </button>
                                        </p>
                                        <p className="text-xs text-gray-500">حجم الملف الأقصى: 10 ميجابايت</p>
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            multiple
                                            onChange={(e) => handleFiles(e.target.files)}
                                            className="hidden"
                                        />
                                    </div>
                                    {fileList.length > 0 && (
                                        <div className="mt-4 space-y-2">
                                            {fileList.map((file) => (
                                                <div key={file.id} className="flex items-center justify-between bg-gray-50 p-3 rounded">
                                                    <div className="flex items-center gap-2">
                                                        <FaFile className="text-gray-400" />
                                                        <span className="text-sm text-gray-700">{file.name}</span>
                                                        <span className="text-xs text-gray-500">({formatFileSize(file.size)})</span>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeFile(file.id)}
                                                        className="text-red-600 hover:text-red-700"
                                                    >
                                                        <FaTrash />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    <InputError message={submissionForm.errors.files} className="mt-2" />
                                </div>

                                <PrimaryButton disabled={submissionForm.processing}>
                                    {submissionForm.processing ? (
                                        <>
                                            <FaSpinner className="animate-spin mr-2" />
                                            جاري الإرسال...
                                        </>
                                    ) : (
                                        <>
                                            <FaUpload className="mr-2" />
                                            {existingSubmission ? 'تحديث التقديم' : 'تقديم الحل'}
                                        </>
                                    )}
                                </PrimaryButton>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}

