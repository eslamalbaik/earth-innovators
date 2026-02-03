import { Head, useForm, router, Link } from '@inertiajs/react';
import { useState, useRef } from 'react';
import { FaArrowLeft, FaUpload, FaCloudUploadAlt, FaFile, FaSpinner, FaTrash } from 'react-icons/fa';
import TextInput from '../../../Components/TextInput';
import InputLabel from '../../../Components/InputLabel';
import InputError from '../../../Components/InputError';
import PrimaryButton from '../../../Components/PrimaryButton';
import MobileAppLayout from '@/Layouts/MobileAppLayout';
import MobileTopBar from '@/Components/Mobile/MobileTopBar';
import MobileBottomNav from '@/Components/Mobile/MobileBottomNav';
import { useToast } from '@/Contexts/ToastContext';

export default function CreateProject({ auth, school, schools = [] }) {
    const { showError } = useToast();
    const { data, setData, post, processing, errors } = useForm({
        title: '',
        description: '',
        category: 'other',
        school_id: school?.id || null,
        files: [],
        evaluation: {
            innovation: 0,
            technical: 0,
            impact: 0,
            feasibility: 0,
            presentation: 0
        },
    });

    const [fileList, setFileList] = useState([]);
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef(null);
    const [activeTab, setActiveTab] = useState('upload'); // 'evaluation' or 'upload'

    const handleFiles = (files) => {
        const fileArray = Array.from(files);
        const validFiles = fileArray.filter(file => {
            const maxSize = 10 * 1024 * 1024; // 10 MB
            const validTypes = [
                'image/jpeg', 'image/jpg', 'image/png', 'image/gif',
                'video/mp4', 'video/avi', 'video/mov',
                'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            ];

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

    const getFileIcon = (type) => {
        if (type.startsWith('image/')) return '🖼️';
        if (type.startsWith('video/')) return '🎥';
        if (type === 'application/pdf') return '📄';
        return '📎';
    };

    const evaluationCriteria = [
        { id: 'innovation', name: 'الابتكار والأصالة', description: 'مدى جدة الفكرة واختلافها عن الحلول الموجودة', icon: '💡' },
        { id: 'technical', name: 'التميز التقني', description: 'جودة التنفيذ التقني واستخدام الأدوات المناسبة', icon: '⚙️' },
        { id: 'impact', name: 'الأثر البيئي/الاجتماعي', description: 'مدى مساهمة المشروع في حل مشكلة حقيقية', icon: '🌍' },
        { id: 'feasibility', name: 'القابلية للتنفيذ', description: 'مدى إمكانية تطبيق المشروع على أرض الواقع', icon: '📈' },
        { id: 'presentation', name: 'العرض والتواصل', description: 'جودة عرض المشروع وشرحه وتوثيقه', icon: '📢' },
    ];

    const calculateTotalScore = () => {
        const values = Object.values(data.evaluation);
        const sum = values.reduce((a, b) => a + b, 0);
        return Math.round(sum / values.length);
    };

    const handleEvaluationChange = (criterion, value) => {
        setData('evaluation', {
            ...data.evaluation,
            [criterion]: parseInt(value)
        });
    };

    const submit = (e) => {
        e.preventDefault();
        post('/teacher/projects', {
            forceFormData: true,
            onSuccess: () => {
                router.visit('/teacher/projects');
            },
        });
    };

    // إزالة الشرط الذي يمنع الوصول للصفحة - يمكن للمعلم إنشاء مشروع حتى لو لم يكن مرتبطاً بمدرسة

    {/* Form */ }
    {
        activeTab === 'upload' && (
            <form onSubmit={submit} className="bg-white rounded-2xl border border-gray-100 p-6 space-y-6 mt-4">
                {/* Title */}
                <div>
                    <InputLabel htmlFor="title" value="عنوان المشروع" className="text-sm font-medium text-gray-700 mb-2" />
                    <input
                        id="title"
                        type="text"
                        value={data.title}
                        onChange={(e) => setData('title', e.target.value)}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#A3C042] focus:ring-[#A3C042]"
                        placeholder="أدخل عنوان المشروع"
                        required
                    />
                    <InputError message={errors.title} className="mt-2" />
                </div>

                {/* Description */}
                <div>
                    <InputLabel htmlFor="description" value="وصف المشروع" className="text-sm font-medium text-gray-700 mb-2" />
                    <textarea
                        id="description"
                        value={data.description}
                        onChange={(e) => setData('description', e.target.value)}
                        rows={6}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#A3C042] focus:ring-[#A3C042]"
                        placeholder="أدخل وصفاً للمشروع"
                        required
                    />
                    <InputError message={errors.description} className="mt-2" />
                </div>

                {/* Category */}
                <div>
                    <InputLabel htmlFor="category" value="فئة المشروع" className="text-sm font-medium text-gray-700 mb-2" />
                    <select
                        id="category"
                        value={data.category}
                        onChange={(e) => setData('category', e.target.value)}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#A3C042] focus:ring-[#A3C042]"
                    >
                        <option value="science">علوم</option>
                        <option value="technology">تقنية</option>
                        <option value="engineering">هندسة</option>
                        <option value="mathematics">رياضيات</option>
                        <option value="arts">فنون</option>
                        <option value="other">أخرى</option>
                    </select>
                    <InputError message={errors.category} className="mt-2" />
                </div>

                {/* School Selection (if multiple schools available) */}
                {schools && schools.length > 0 && (
                    <div>
                        <InputLabel htmlFor="school_id" value="المدرسة" className="text-sm font-medium text-gray-700 mb-2" />
                        <select
                            id="school_id"
                            value={data.school_id || ''}
                            onChange={(e) => setData('school_id', e.target.value || null)}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#A3C042] focus:ring-[#A3C042]"
                        >
                            <option value="">اختر مدرسة (اختياري)</option>
                            {schools.map((sch) => (
                                <option key={sch.id} value={sch.id}>
                                    {sch.name}
                                </option>
                            ))}
                        </select>
                        <InputError message={errors.school_id} className="mt-2" />
                    </div>
                )}

                {/* File Upload */}
                <div>
                    <InputLabel value="الملفات" className="text-sm font-medium text-gray-700 mb-2" />
                    <div
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                        className={`border-2 border-dashed rounded-2xl p-8 text-center transition ${dragActive
                            ? 'border-[#A3C042] bg-[#A3C042]/10'
                            : 'border-gray-300 hover:border-[#A3C042]/50'
                            }`}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            onChange={handleFileInputChange}
                            accept="image/*,video/*,.pdf,.doc,.docx"
                            className="hidden"
                        />
                        <FaCloudUploadAlt className="mx-auto text-6xl text-gray-400 mb-4" />
                        <p className="text-gray-700 mb-2">
                            اسحب وأفلت الملفات هنا أو انقر للاختيار
                        </p>
                        <p className="text-sm text-gray-500">
                            صور، فيديو، PDF (الحد الأقصى: 10 ميجابايت لكل ملف)
                        </p>
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="mt-4 px-6 py-2 bg-[#A3C042] text-white rounded-xl hover:bg-[#8CA635] transition font-bold"
                        >
                            اختر ملفات
                        </button>
                    </div>
                    <InputError message={errors.files} className="mt-2" />

                    {/* File List */}
                    {fileList.length > 0 && (
                        <div className="mt-4 space-y-2">
                            {fileList.map((fileItem) => (
                                <div
                                    key={fileItem.id}
                                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">{getFileIcon(fileItem.type)}</span>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{fileItem.name}</p>
                                            <p className="text-xs text-gray-500">{formatFileSize(fileItem.size)}</p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => removeFile(fileItem.id)}
                                        className="text-red-500 hover:text-red-700 transition"
                                    >
                                        <FaTrash />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* School Info */}
                {school && (
                    <div className="bg-[#A3C042]/10 border border-[#A3C042]/20 rounded-lg p-4">
                        <p className="text-sm text-gray-700">
                            <span className="font-semibold">المدرسة المرتبطة:</span> {school.name}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                            {data.school_id
                                ? 'سيتم إرسال المشروع للمدرسة للمراجعة والموافقة عليه'
                                : 'يمكنك اختيار مدرسة أخرى من القائمة أعلاه'}
                        </p>
                    </div>
                )}

                {/* Submit Button */}
                <div className="flex items-center justify-end pt-4 border-t border-gray-200">
                    <PrimaryButton
                        type="submit"
                        disabled={processing || !data.title || !data.description}
                        className="bg-[#A3C042] hover:bg-[#8CA635] flex items-center gap-2 rounded-xl"
                    >
                        {processing ? (
                            <>
                                <FaSpinner className="animate-spin" />
                                جاري الرفع...
                            </>
                        ) : (
                            <>
                                <FaUpload />
                                رفع المشروع
                            </>
                        )}
                    </PrimaryButton>
                </div>
            </form>
        )
    }

    {/* Evaluation Tab Content */ }
    {
        activeTab === 'evaluation' && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 mt-4 space-y-8 animate-in fade-in slide-in-from-bottom-4">
                <div className="flex items-center justify-between border-b pb-4">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900">التقييم الذاتي للمشروع</h3>
                        <p className="text-sm text-gray-500 mt-1">قيم مشروعك بناءً على معايير الابتكار العالمية</p>
                    </div>
                    <div className="text-center bg-[#A3C042]/10 px-4 py-2 rounded-2xl border border-[#A3C042]/20">
                        <p className="text-xs text-[#A3C042] font-bold mb-1">الدرجة الإجمالية</p>
                        <p className="text-3xl font-black text-[#A3C042]">{calculateTotalScore()}%</p>
                    </div>
                </div>

                <div className="space-y-8">
                    {evaluationCriteria.map((criterion) => (
                        <div key={criterion.id} className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl bg-gray-50 w-10 h-10 flex items-center justify-center rounded-xl">{criterion.icon}</span>
                                    <div>
                                        <h4 className="font-bold text-gray-900">{criterion.name}</h4>
                                        <p className="text-xs text-gray-500">{criterion.description}</p>
                                    </div>
                                </div>
                                <span className="font-bold text-[#A3C042] bg-[#A3C042]/5 px-3 py-1 rounded-lg border border-[#A3C042]/10">
                                    {data.evaluation[criterion.id]}%
                                </span>
                            </div>
                            <div className="relative pt-1">
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={data.evaluation[criterion.id]}
                                    onChange={(e) => handleEvaluationChange(criterion.id, e.target.value)}
                                    className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-[#A3C042] hover:accent-[#8CA635] transition-all"
                                />
                                <div className="flex justify-between text-[10px] text-gray-400 mt-2 font-medium px-1">
                                    <span>مبتديء</span>
                                    <span>متوسط</span>
                                    <span>متقدم</span>
                                    <span>خبير</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-5 flex gap-4 items-start">
                    <div className="bg-blue-100 p-2 rounded-xl text-blue-600">
                        <FaInfoCircle className="text-xl" />
                    </div>
                    <div>
                        <h5 className="font-bold text-blue-900 text-sm mb-1">تلميح للتقييم</h5>
                        <p className="text-xs text-blue-800 leading-relaxed">
                            يساعدنا هذا التقييم في فهم رؤيتك لمشروعك، تأكد من إرفاق الملفات اللازمة في تبويب "رفع المشروع" لتدعيم درجتك.
                        </p>
                    </div>
                </div>

                <div className="flex justify-center pt-4">
                    <button
                        type="button"
                        onClick={() => setActiveTab('upload')}
                        className="text-[#A3C042] font-bold text-sm hover:underline"
                    >
                        العودة لرفع الملفات
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div dir="rtl" className="min-h-screen bg-gray-50">
            <Head title="رفع المشروع - إرث المبتكرين" />

            {/* Mobile View */}
            <div className="block md:hidden">
                <MobileAppLayout
                    auth={auth}
                    title="إرث المبتكرين"
                    activeNav="profile"
                    unreadCount={0}
                    onNotifications={() => router.visit('/notifications')}
                    onBack={() => router.visit('/teacher/projects')}
                >
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

                    {/* Form */}
                    {activeTab === 'upload' && (
                        <form onSubmit={submit} className="bg-white rounded-2xl border border-gray-100 p-6 space-y-6 mt-4">
                            {/* Title */}
                            <div>
                                <InputLabel htmlFor="title" value="عنوان المشروع" className="text-sm font-medium text-gray-700 mb-2" />
                                <input
                                    id="title"
                                    type="text"
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#A3C042] focus:ring-[#A3C042]"
                                    placeholder="أدخل عنوان المشروع"
                                    required
                                />
                                <InputError message={errors.title} className="mt-2" />
                            </div>

                            {/* Description */}
                            <div>
                                <InputLabel htmlFor="description" value="وصف المشروع" className="text-sm font-medium text-gray-700 mb-2" />
                                <textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    rows={6}
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#A3C042] focus:ring-[#A3C042]"
                                    placeholder="أدخل وصفاً للمشروع"
                                    required
                                />
                                <InputError message={errors.description} className="mt-2" />
                            </div>

                            {/* Category */}
                            <div>
                                <InputLabel htmlFor="category" value="فئة المشروع" className="text-sm font-medium text-gray-700 mb-2" />
                                <select
                                    id="category"
                                    value={data.category}
                                    onChange={(e) => setData('category', e.target.value)}
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#A3C042] focus:ring-[#A3C042]"
                                >
                                    <option value="science">علوم</option>
                                    <option value="technology">تقنية</option>
                                    <option value="engineering">هندسة</option>
                                    <option value="mathematics">رياضيات</option>
                                    <option value="arts">فنون</option>
                                    <option value="other">أخرى</option>
                                </select>
                                <InputError message={errors.category} className="mt-2" />
                            </div>

                            {/* School Selection (if multiple schools available) */}
                            {schools && schools.length > 0 && (
                                <div>
                                    <InputLabel htmlFor="school_id" value="المدرسة" className="text-sm font-medium text-gray-700 mb-2" />
                                    <select
                                        id="school_id"
                                        value={data.school_id || ''}
                                        onChange={(e) => setData('school_id', e.target.value || null)}
                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#A3C042] focus:ring-[#A3C042]"
                                    >
                                        <option value="">اختر مدرسة (اختياري)</option>
                                        {schools.map((sch) => (
                                            <option key={sch.id} value={sch.id}>
                                                {sch.name}
                                            </option>
                                        ))}
                                    </select>
                                    <InputError message={errors.school_id} className="mt-2" />
                                </div>
                            )}

                            {/* File Upload */}
                            <div>
                                <InputLabel value="الملفات" className="text-sm font-medium text-gray-700 mb-2" />
                                <div
                                    onDragEnter={handleDrag}
                                    onDragLeave={handleDrag}
                                    onDragOver={handleDrag}
                                    onDrop={handleDrop}
                                    className={`border-2 border-dashed rounded-2xl p-8 text-center transition ${dragActive
                                        ? 'border-[#A3C042] bg-[#A3C042]/10'
                                        : 'border-gray-300 hover:border-[#A3C042]/50'
                                        }`}
                                >
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        multiple
                                        onChange={handleFileInputChange}
                                        accept="image/*,video/*,.pdf,.doc,.docx"
                                        className="hidden"
                                    />
                                    <FaCloudUploadAlt className="mx-auto text-6xl text-gray-400 mb-4" />
                                    <p className="text-gray-700 mb-2">
                                        اسحب وأفلت الملفات هنا أو انقر للاختيار
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        صور، فيديو، PDF (الحد الأقصى: 10 ميجابايت لكل ملف)
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="mt-4 px-6 py-2 bg-[#A3C042] text-white rounded-xl hover:bg-[#8CA635] transition font-bold"
                                    >
                                        اختر ملفات
                                    </button>
                                </div>
                                <InputError message={errors.files} className="mt-2" />

                                {/* File List */}
                                {fileList.length > 0 && (
                                    <div className="mt-4 space-y-2">
                                        {fileList.map((fileItem) => (
                                            <div
                                                key={fileItem.id}
                                                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <span className="text-2xl">{getFileIcon(fileItem.type)}</span>
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">{fileItem.name}</p>
                                                        <p className="text-xs text-gray-500">{formatFileSize(fileItem.size)}</p>
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => removeFile(fileItem.id)}
                                                    className="text-red-500 hover:text-red-700 transition"
                                                >
                                                    <FaTrash />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* School Info */}
                            {school && (
                                <div className="bg-[#A3C042]/10 border border-[#A3C042]/20 rounded-lg p-4">
                                    <p className="text-sm text-gray-700">
                                        <span className="font-semibold">المدرسة المرتبطة:</span> {school.name}
                                    </p>
                                    <p className="text-xs text-gray-600 mt-1">
                                        {data.school_id
                                            ? 'سيتم إرسال المشروع للمدرسة للمراجعة والموافقة عليه'
                                            : 'يمكنك اختيار مدرسة أخرى من القائمة أعلاه'}
                                    </p>
                                </div>
                            )}

                            {/* Submit Button */}
                            <div className="flex items-center justify-end pt-4 border-t border-gray-200">
                                <PrimaryButton
                                    type="submit"
                                    disabled={processing || !data.title || !data.description}
                                    className="bg-[#A3C042] hover:bg-[#8CA635] flex items-center gap-2 rounded-xl"
                                >
                                    {processing ? (
                                        <>
                                            <FaSpinner className="animate-spin" />
                                            جاري الرفع...
                                        </>
                                    ) : (
                                        <>
                                            <FaUpload />
                                            رفع المشروع
                                        </>
                                    )}
                                </PrimaryButton>
                            </div>
                        </form>
                    )}

                    {/* Evaluation Tab Content */}
                    {activeTab === 'evaluation' && (
                        <div className="bg-white rounded-2xl border border-gray-100 p-5 mt-4 space-y-6">
                            <div className="flex items-center justify-between bg-[#A3C042]/5 p-4 rounded-2xl border border-[#A3C042]/10">
                                <div>
                                    <h3 className="font-bold text-gray-900">التقييم الذاتي</h3>
                                    <p className="text-[10px] text-gray-500">قيم مستوى الابتكار في مشروعك</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-2xl font-black text-[#A3C042]">{calculateTotalScore()}%</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                {evaluationCriteria.map((criterion) => (
                                    <div key={criterion.id} className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="text-lg">{criterion.icon}</span>
                                                <h4 className="text-sm font-bold text-gray-900">{criterion.name}</h4>
                                            </div>
                                            <span className="text-xs font-bold text-[#A3C042]">{data.evaluation[criterion.id]}%</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="0"
                                            max="100"
                                            value={data.evaluation[criterion.id]}
                                            onChange={(e) => handleEvaluationChange(criterion.id, e.target.value)}
                                            className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-[#A3C042]"
                                        />
                                    </div>
                                ))}
                            </div>

                            <button
                                type="button"
                                onClick={() => setActiveTab('upload')}
                                className="w-full py-3 text-sm font-bold text-[#A3C042] border-2 border-[#A3C042] rounded-xl hover:bg-[#A3C042] hover:text-white transition"
                            >
                                إكمال بيانات المشروع
                            </button>
                        </div>
                    )}
                </MobileAppLayout>
            </div>

            {/* Desktop View */}
            <div className="hidden md:block">
                <MobileTopBar
                    title="إرث المبتكرين"
                    unreadCount={auth?.unreadCount || 0}
                    onNotifications={() => router.visit('/notifications')}
                    onBack={() => router.visit('/teacher/projects')}
                    reverseOrder={false}
                />
                <main className="mx-auto w-full max-w-6xl px-4 pb-24 pt-4">
                    <div className="space-y-4 max-w-3xl mx-auto">
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

                        {/* Form */}
                        {activeTab === 'upload' && (
                            <form onSubmit={submit} className="bg-white rounded-2xl border border-gray-100 p-6 space-y-6 mt-4">
                                {/* Title */}
                                <div>
                                    <InputLabel htmlFor="title" value="عنوان المشروع" className="text-sm font-medium text-gray-700 mb-2" />
                                    <input
                                        id="title"
                                        type="text"
                                        value={data.title}
                                        onChange={(e) => setData('title', e.target.value)}
                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#A3C042] focus:ring-[#A3C042]"
                                        placeholder="أدخل عنوان المشروع"
                                        required
                                    />
                                    <InputError message={errors.title} className="mt-2" />
                                </div>

                                {/* Description */}
                                <div>
                                    <InputLabel htmlFor="description" value="وصف المشروع" className="text-sm font-medium text-gray-700 mb-2" />
                                    <textarea
                                        id="description"
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        rows={6}
                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#A3C042] focus:ring-[#A3C042]"
                                        placeholder="أدخل وصفاً للمشروع"
                                        required
                                    />
                                    <InputError message={errors.description} className="mt-2" />
                                </div>

                                {/* Category */}
                                <div>
                                    <InputLabel htmlFor="category" value="فئة المشروع" className="text-sm font-medium text-gray-700 mb-2" />
                                    <select
                                        id="category"
                                        value={data.category}
                                        onChange={(e) => setData('category', e.target.value)}
                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#A3C042] focus:ring-[#A3C042]"
                                    >
                                        <option value="science">علوم</option>
                                        <option value="technology">تقنية</option>
                                        <option value="engineering">هندسة</option>
                                        <option value="mathematics">رياضيات</option>
                                        <option value="arts">فنون</option>
                                        <option value="other">أخرى</option>
                                    </select>
                                    <InputError message={errors.category} className="mt-2" />
                                </div>

                                {/* School Selection (if multiple schools available) */}
                                {schools && schools.length > 0 && (
                                    <div>
                                        <InputLabel htmlFor="school_id" value="المدرسة" className="text-sm font-medium text-gray-700 mb-2" />
                                        <select
                                            id="school_id"
                                            value={data.school_id || ''}
                                            onChange={(e) => setData('school_id', e.target.value || null)}
                                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#A3C042] focus:ring-[#A3C042]"
                                        >
                                            <option value="">اختر مدرسة (اختياري)</option>
                                            {schools.map((sch) => (
                                                <option key={sch.id} value={sch.id}>
                                                    {sch.name}
                                                </option>
                                            ))}
                                        </select>
                                        <InputError message={errors.school_id} className="mt-2" />
                                    </div>
                                )}

                                {/* File Upload */}
                                <div>
                                    <InputLabel value="الملفات" className="text-sm font-medium text-gray-700 mb-2" />
                                    <div
                                        onDragEnter={handleDrag}
                                        onDragLeave={handleDrag}
                                        onDragOver={handleDrag}
                                        onDrop={handleDrop}
                                        className={`border-2 border-dashed rounded-2xl p-8 text-center transition ${dragActive
                                            ? 'border-[#A3C042] bg-[#A3C042]/10'
                                            : 'border-gray-300 hover:border-[#A3C042]/50'
                                            }`}
                                    >
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            multiple
                                            onChange={handleFileInputChange}
                                            accept="image/*,video/*,.pdf,.doc,.docx"
                                            className="hidden"
                                        />
                                        <FaCloudUploadAlt className="mx-auto text-6xl text-gray-400 mb-4" />
                                        <p className="text-gray-700 mb-2">
                                            اسحب وأفلت الملفات هنا أو انقر للاختيار
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            صور، فيديو، PDF (الحد الأقصى: 10 ميجابايت لكل ملف)
                                        </p>
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="mt-4 px-6 py-2 bg-[#A3C042] text-white rounded-xl hover:bg-[#8CA635] transition font-bold"
                                        >
                                            اختر ملفات
                                        </button>
                                    </div>
                                    <InputError message={errors.files} className="mt-2" />

                                    {/* File List */}
                                    {fileList.length > 0 && (
                                        <div className="mt-4 space-y-2">
                                            {fileList.map((fileItem) => (
                                                <div
                                                    key={fileItem.id}
                                                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-2xl">{getFileIcon(fileItem.type)}</span>
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-900">{fileItem.name}</p>
                                                            <p className="text-xs text-gray-500">{formatFileSize(fileItem.size)}</p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeFile(fileItem.id)}
                                                        className="text-red-500 hover:text-red-700 transition"
                                                    >
                                                        <FaTrash />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* School Info */}
                                {school && (
                                    <div className="bg-[#A3C042]/10 border border-[#A3C042]/20 rounded-lg p-4">
                                        <p className="text-sm text-gray-700">
                                            <span className="font-semibold">المدرسة المرتبطة:</span> {school.name}
                                        </p>
                                        <p className="text-xs text-gray-600 mt-1">
                                            {data.school_id
                                                ? 'سيتم إرسال المشروع للمدرسة للمراجعة والموافقة عليه'
                                                : 'يمكنك اختيار مدرسة أخرى من القائمة أعلاه'}
                                        </p>
                                    </div>
                                )}

                                {/* Submit Button */}
                                <div className="flex items-center justify-end pt-4 border-t border-gray-200">
                                    <PrimaryButton
                                        type="submit"
                                        disabled={processing || !data.title || !data.description}
                                        className="bg-[#A3C042] hover:bg-[#8CA635] flex items-center gap-2 rounded-xl"
                                    >
                                        {processing ? (
                                            <>
                                                <FaSpinner className="animate-spin" />
                                                جاري الرفع...
                                            </>
                                        ) : (
                                            <>
                                                <FaUpload />
                                                رفع المشروع
                                            </>
                                        )}
                                    </PrimaryButton>
                                </div>
                            </form>
                        )}

                        {/* Evaluation Tab Content */}
                        {activeTab === 'evaluation' && (
                            <div className="bg-white rounded-2xl border border-gray-100 p-8 mt-4 space-y-8 max-w-3xl mx-auto">
                                <div className="flex items-center justify-between border-b border-gray-50 pb-6">
                                    <div>
                                        <h3 className="text-2xl font-bold text-gray-900 mb-1">معايير التقييم الذاتي</h3>
                                        <p className="text-gray-500">ساعدنا في فهم قوة مشروعك من خلال هذه المعايير</p>
                                    </div>
                                    <div className="bg-[#A3C042]/10 px-6 py-4 rounded-3xl border border-[#A3C042]/20 text-center min-w-[140px]">
                                        <p className="text-xs text-[#A3C042] font-black tracking-wider uppercase mb-1">النتيجة المتوقعة</p>
                                        <p className="text-4xl font-black text-[#A3C042]">{calculateTotalScore()}%</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-10">
                                    {evaluationCriteria.map((criterion) => (
                                        <div key={criterion.id} className="group">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-2xl group-hover:bg-[#A3C042]/10 transition-colors">
                                                        {criterion.icon}
                                                    </div>
                                                    <div>
                                                        <h4 className="text-lg font-bold text-gray-900 group-hover:text-[#A3C042] transition-colors">{criterion.name}</h4>
                                                        <p className="text-sm text-gray-500">{criterion.description}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-2xl font-black text-gray-900">{data.evaluation[criterion.id]}</span>
                                                    <span className="text-sm text-gray-400 font-bold ml-1">%</span>
                                                </div>
                                            </div>
                                            <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
                                                <div
                                                    className="absolute top-0 right-0 h-full bg-[#A3C042] transition-all duration-300"
                                                    style={{ width: `${data.evaluation[criterion.id]}%` }}
                                                />
                                                <input
                                                    type="range"
                                                    min="0"
                                                    max="100"
                                                    value={data.evaluation[criterion.id]}
                                                    onChange={(e) => handleEvaluationChange(criterion.id, e.target.value)}
                                                    className="absolute top-0 right-0 w-full h-full opacity-0 cursor-pointer z-10"
                                                />
                                            </div>
                                            <div className="flex justify-between text-[11px] text-gray-400 mt-2 font-bold px-1 uppercase tracking-tighter">
                                                <span>قيد التطوير</span>
                                                <span>واعد</span>
                                                <span>متميز</span>
                                                <span>رائد</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="bg-[#A3C042]/10 rounded-2xl p-6 flex items-center gap-6">
                                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-[#A3C042] shadow-sm flex-shrink-0">
                                        <FaCheckCircle className="text-2xl" />
                                    </div>
                                    <div className="flex-1">
                                        <h5 className="font-bold text-gray-900 mb-1">هل أنت جاهز للرفع؟</h5>
                                        <p className="text-sm text-gray-600">بمجرد الانتهاء من التقييم الذاتي، يمكنك العودة لرفع الملفات وإرسال المشروع.</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab('upload')}
                                        className="px-6 py-3 bg-[#A3C042] text-white font-bold rounded-xl hover:bg-[#8CA635] shadow-lg shadow-[#A3C042]/20 transition"
                                    >
                                        العودة للملفات
                                    </button>
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
