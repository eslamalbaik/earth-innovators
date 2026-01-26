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
                                    className={`border-2 border-dashed rounded-2xl p-8 text-center transition ${
                                        dragActive
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
                                        className="mt-4 px-6 py-2 bg-[#A3C042] text-white rounded-xl hover:bg-[#93b03a] transition font-bold"
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
                                    className="bg-[#A3C042] hover:bg-[#93b03a] flex items-center gap-2 rounded-xl"
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

                    {/* Evaluation Tab - Placeholder */}
                    {activeTab === 'evaluation' && (
                        <div className="bg-white rounded-2xl border border-gray-100 p-6 mt-4">
                            <p className="text-gray-500 text-center py-8">
                                صفحة التقييم قريباً...
                            </p>
                        </div>
                    )}

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
                        className={`rounded-xl py-2.5 text-sm font-bold transition ${
                            activeTab === 'upload'
                                ? 'bg-[#A3C042] text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
        >
                        رفع المشروع
                    </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('evaluation')}
                        className={`rounded-xl py-2.5 text-sm font-bold transition ${
                                activeTab === 'evaluation'
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
                                    className={`border-2 border-dashed rounded-2xl p-8 text-center transition ${
                                        dragActive
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
                                        className="mt-4 px-6 py-2 bg-[#A3C042] text-white rounded-xl hover:bg-[#93b03a] transition font-bold"
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
                                    className="bg-[#A3C042] hover:bg-[#93b03a] flex items-center gap-2 rounded-xl"
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

                    {/* Evaluation Tab - Placeholder */}
                    {activeTab === 'evaluation' && (
                <div className="bg-white rounded-2xl border border-gray-100 p-6 mt-4">
                            <p className="text-gray-500 text-center py-8">
                                صفحة التقييم قريباً...
                            </p>
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
                                    className={`rounded-xl py-2.5 text-sm font-bold transition ${
                                        activeTab === 'upload'
                                            ? 'bg-[#A3C042] text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    رفع المشروع
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('evaluation')}
                                    className={`rounded-xl py-2.5 text-sm font-bold transition ${
                                        activeTab === 'evaluation'
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
                                        className={`border-2 border-dashed rounded-2xl p-8 text-center transition ${
                                            dragActive
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
                                            className="mt-4 px-6 py-2 bg-[#A3C042] text-white rounded-xl hover:bg-[#93b03a] transition font-bold"
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
                                        className="bg-[#A3C042] hover:bg-[#93b03a] flex items-center gap-2 rounded-xl"
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

                        {/* Evaluation Tab - Placeholder */}
                        {activeTab === 'evaluation' && (
                            <div className="bg-white rounded-2xl border border-gray-100 p-6 mt-4">
                                <p className="text-gray-500 text-center py-8">
                                    صفحة التقييم قريباً...
                                </p>
                            </div>
                        )}
                </div>
                </main>
                <MobileBottomNav active="profile" role={auth?.user?.role} isAuthed={!!auth?.user} user={auth?.user} />
            </div>
        </div>
    );
}
