import DashboardLayout from '../../../Layouts/DashboardLayout';
import { Head, useForm, router, Link } from '@inertiajs/react';
import { useState, useRef, useEffect } from 'react';
import { FaArrowLeft, FaUpload, FaCloudUploadAlt, FaFile, FaSpinner, FaTrash } from 'react-icons/fa';
import TextInput from '../../../Components/TextInput';
import InputLabel from '../../../Components/InputLabel';
import InputError from '../../../Components/InputError';
import PrimaryButton from '../../../Components/PrimaryButton';

export default function EditProject({ auth, project, school, schools = [] }) {
    const { data, setData, put, processing, errors } = useForm({
        title: project?.title || '',
        description: project?.description || '',
        category: project?.category || 'other',
        school_id: project?.school_id || school?.id || null,
        files: [],
        remove_files: [],
    });

    const [fileList, setFileList] = useState([]);
    const [existingFiles, setExistingFiles] = useState(project?.files || []);
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef(null);

    useEffect(() => {
        // تحميل بيانات المشروع عند تحميل الصفحة
        if (project) {
            setData({
                title: project.title || '',
                description: project.description || '',
                category: project.category || 'other',
                school_id: project.school_id || school?.id || null,
                files: [],
                remove_files: [],
            });
        }
    }, [project]);

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

    const removeExistingFile = (filePath) => {
        setExistingFiles(prev => prev.filter(f => f !== filePath));
        setData('remove_files', [...(data.remove_files || []), filePath]);
    };

    const formatFileSize = (bytes) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    };

    const getFileIcon = (type) => {
        if (type?.startsWith('image/')) return '🖼️';
        if (type?.startsWith('video/')) return '🎥';
        if (type === 'application/pdf') return '📄';
        return '📎';
    };

    const getFileName = (filePath) => {
        return filePath.split('/').pop();
    };

    const submit = (e) => {
        e.preventDefault();

        // التحقق من البيانات الأساسية
        if (!data.title || !data.description) {
            alert('يرجى ملء جميع الحقول المطلوبة');
            return;
        }

        // التحقق من حالة المشروع
        if (project?.status !== 'pending') {
            alert('لا يمكن تعديل المشروع بعد الموافقة عليه أو رفضه');
            return;
        }

        // إنشاء FormData لضمان إرسال الملفات بشكل صحيح
        const formData = new FormData();

        // إضافة الحقول الأساسية
        formData.append('title', data.title);
        formData.append('description', data.description);
        formData.append('category', data.category || 'other');
        formData.append('_method', 'PUT');

        if (data.school_id) {
            formData.append('school_id', data.school_id);
        }

        // إضافة الملفات الجديدة
        if (data.files && data.files.length > 0) {
            data.files.forEach((file) => {
                if (file instanceof File) {
                    formData.append('files[]', file);
                }
            });
        }

        // إضافة الملفات المراد حذفها
        if (data.remove_files && data.remove_files.length > 0) {
            data.remove_files.forEach((filePath) => {
                formData.append('remove_files[]', filePath);
            });
        }

        // إرسال البيانات باستخدام router.post مع _method: PUT
        router.post(`/teacher/projects/${project.id}`, formData, {
            forceFormData: true,
            preserveScroll: false,
            onSuccess: () => {
                router.visit('/teacher/projects');
            },
            onError: (errors) => {
                let errorMessage = 'حدث خطأ أثناء حفظ التعديلات';
                if (errors.message) {
                    errorMessage = errors.message;
                } else if (typeof errors === 'object' && Object.keys(errors).length > 0) {
                    const firstError = Object.values(errors)[0];
                    if (Array.isArray(firstError)) {
                        errorMessage = firstError[0];
                    } else if (typeof firstError === 'string') {
                        errorMessage = firstError;
                    }
                }
                alert('خطأ: ' + errorMessage);
            },
        });
    };

    return (
        <DashboardLayout
            auth={auth}
            header={
                <div className="flex items-center gap-3">
                    <Link href="/teacher/projects" className="text-gray-600 hover:text-[#A3C042]">
                        <FaArrowLeft className="text-xl" />
                    </Link>
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">تعديل المشروع</h2>
                </div>
            }
        >
            <Head title="تعديل المشروع - لوحة المعلم" />

            <div className="py-6">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <form onSubmit={submit} className="bg-white rounded-xl shadow-lg p-6 space-y-6">
                        {/* Title */}
                        <div>
                            <InputLabel htmlFor="title" value="عنوان المشروع" className="text-sm font-medium text-gray-700 mb-2" />
                            <TextInput
                                id="title"
                                type="text"
                                value={data.title}
                                onChange={(e) => setData('title', e.target.value)}
                                className="block w-full"
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

                        {/* School Selection */}
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

                        {/* Existing Files */}
                        {existingFiles.length > 0 && (
                            <div>
                                <InputLabel value="الملفات الحالية" className="text-sm font-medium text-gray-700 mb-2" />
                                <div className="space-y-2">
                                    {existingFiles.map((filePath, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className="text-2xl">{getFileIcon(filePath)}</span>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">{getFileName(filePath)}</p>
                                                    <a
                                                        href={`/storage/${filePath}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-xs text-blue-600 hover:text-blue-800"
                                                    >
                                                        عرض الملف
                                                    </a>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => removeExistingFile(filePath)}
                                                className="text-red-500 hover:text-red-700 transition"
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* File Upload */}
                        <div>
                            <InputLabel value="إضافة ملفات جديدة" className="text-sm font-medium text-gray-700 mb-2" />
                            <div
                                onDragEnter={handleDrag}
                                onDragLeave={handleDrag}
                                onDragOver={handleDrag}
                                onDrop={handleDrop}
                                className={`border-2 border-dashed rounded-lg p-8 text-center transition ${dragActive
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
                                    className="mt-4 px-6 py-2 bg-[#A3C042] text-white rounded-lg hover:bg-[#A3C042] transition"
                                >
                                    اختر ملفات
                                </button>
                            </div>
                            <InputError message={errors.files} className="mt-2" />

                            {/* New File List */}
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

                        {/* Status Warning */}
                        {project?.status !== 'pending' && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                <p className="text-sm text-yellow-800">
                                    ⚠️ لا يمكن تعديل المشروع بعد الموافقة عليه أو رفضه
                                </p>
                            </div>
                        )}

                        {/* Submit Button */}
                        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                            <Link
                                href="/teacher/projects"
                                className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                            >
                                إلغاء
                            </Link>
                            <PrimaryButton
                                type="submit"
                                disabled={processing || !data.title || !data.description || project?.status !== 'pending'}
                                className="bg-[#A3C042] hover:bg-[#A3C042] flex items-center gap-2"
                            >
                                {processing ? (
                                    <>
                                        <FaSpinner className="animate-spin" />
                                        جاري التحديث...
                                    </>
                                ) : (
                                    <>
                                        <FaUpload />
                                        حفظ التعديلات
                                    </>
                                )}
                            </PrimaryButton>
                        </div>
                    </form>
                </div>
            </div>
        </DashboardLayout>
    );
}

