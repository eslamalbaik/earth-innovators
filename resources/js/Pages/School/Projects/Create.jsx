import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, useForm, router, Link } from '@inertiajs/react';
import { useState, useRef } from 'react';
import { FaArrowLeft, FaUpload, FaCloudUploadAlt, FaFile, FaSpinner, FaTrash } from 'react-icons/fa';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';

export default function CreateSchoolProject({ auth }) {
    const { data, setData, post, processing, errors } = useForm({
        title: '',
        description: '',
        category: 'other',
        files: [],
        images: [],
        report: '',
    });

    const [fileList, setFileList] = useState([]);
    const [imageList, setImageList] = useState([]);
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef(null);
    const imageInputRef = useRef(null);

    const handleFiles = (files) => {
        const fileArray = Array.from(files);
        const validFiles = fileArray.filter(file => {
            const maxSize = 10 * 1024 * 1024; // 10 MB
            const validTypes = [
                'application/pdf', 'application/msword', 
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'video/mp4', 'video/avi', 'video/mov',
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
        }))]);

        setData('files', [...data.files, ...validFiles]);
    };

    const handleImages = (files) => {
        const fileArray = Array.from(files);
        const validFiles = fileArray.filter(file => {
            const maxSize = 5 * 1024 * 1024; // 5 MB
            const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
            
            if (file.size > maxSize) {
                alert(`الصورة ${file.name} أكبر من 5 ميجابايت`);
                return false;
            }
            
            if (!validTypes.includes(file.type)) {
                alert(`نوع الصورة ${file.name} غير مدعوم`);
                return false;
            }
            
            return true;
        });

        setImageList(prev => [...prev, ...validFiles.map(file => ({
            file,
            id: Date.now() + Math.random(),
            name: file.name,
            size: file.size,
            preview: URL.createObjectURL(file),
        }))]);

        setData('images', [...data.images, ...validFiles]);
    };

    const removeFile = (id) => {
        setFileList(prev => {
            const newList = prev.filter(item => item.id !== id);
            setData('files', newList.map(item => item.file));
            return newList;
        });
    };

    const removeImage = (id) => {
        setImageList(prev => {
            const item = prev.find(i => i.id === id);
            if (item && item.preview) {
                URL.revokeObjectURL(item.preview);
            }
            const newList = prev.filter(item => item.id !== id);
            setData('images', newList.map(item => item.file));
            return newList;
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/school/projects', {
            preserveScroll: true,
            onSuccess: () => {
                router.visit('/school/projects');
            },
        });
    };

    const categoryOptions = [
        { value: 'science', label: 'علوم' },
        { value: 'technology', label: 'تقني' },
        { value: 'engineering', label: 'هندسة' },
        { value: 'mathematics', label: 'رياضيات' },
        { value: 'arts', label: 'فنون' },
        { value: 'other', label: 'أخرى' },
    ];

    return (
        <DashboardLayout header="إنشاء مشروع جديد">
            <Head title="إنشاء مشروع جديد - إرث المبتكرين" />

            <div className="max-w-4xl mx-auto">
                <Link
                    href="/school/projects"
                    className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
                >
                    <FaArrowLeft />
                    <span>العودة إلى المشاريع</span>
                </Link>

                <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-6">
                    <div className="space-y-6">
                        {/* العنوان */}
                        <div>
                            <InputLabel htmlFor="title" value="عنوان المشروع *" />
                            <TextInput
                                id="title"
                                type="text"
                                value={data.title}
                                onChange={(e) => setData('title', e.target.value)}
                                className="mt-1 block w-full"
                                required
                            />
                            <InputError message={errors.title} className="mt-2" />
                        </div>

                        {/* الوصف */}
                        <div>
                            <InputLabel htmlFor="description" value="وصف المشروع *" />
                            <textarea
                                id="description"
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-legacy-green focus:ring focus:ring-legacy-green focus:ring-opacity-50"
                                rows="6"
                                required
                            />
                            <InputError message={errors.description} className="mt-2" />
                        </div>

                        {/* الفئة */}
                        <div>
                            <InputLabel htmlFor="category" value="فئة المشروع *" />
                            <select
                                id="category"
                                value={data.category}
                                onChange={(e) => setData('category', e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-legacy-green focus:ring focus:ring-legacy-green focus:ring-opacity-50"
                                required
                            >
                                {categoryOptions.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                            <InputError message={errors.category} className="mt-2" />
                        </div>

                        {/* رفع الصور */}
                        <div>
                            <InputLabel value="صور المشروع" />
                            <div
                                className={`mt-2 border-2 border-dashed rounded-lg p-6 text-center transition ${
                                    dragActive ? 'border-legacy-green bg-green-50' : 'border-gray-300'
                                }`}
                                onDragEnter={(e) => {
                                    e.preventDefault();
                                    setDragActive(true);
                                }}
                                onDragLeave={(e) => {
                                    e.preventDefault();
                                    setDragActive(false);
                                }}
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={(e) => {
                                    e.preventDefault();
                                    setDragActive(false);
                                    handleImages(e.dataTransfer.files);
                                }}
                            >
                                <FaCloudUploadAlt className="mx-auto text-4xl text-gray-400 mb-2" />
                                <p className="text-gray-600 mb-2">اسحب وأفلت الصور هنا أو</p>
                                <button
                                    type="button"
                                    onClick={() => imageInputRef.current?.click()}
                                    className="text-legacy-green hover:text-legacy-blue font-medium"
                                >
                                    اختر الصور
                                </button>
                                <input
                                    ref={imageInputRef}
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={(e) => handleImages(e.target.files)}
                                    className="hidden"
                                />
                            </div>
                            {imageList.length > 0 && (
                                <div className="mt-4 grid grid-cols-4 gap-4">
                                    {imageList.map((item) => (
                                        <div key={item.id} className="relative">
                                            <img
                                                src={item.preview}
                                                alt={item.name}
                                                className="w-full h-32 object-cover rounded-lg"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeImage(item.id)}
                                                className="absolute top-2 left-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                            >
                                                <FaTrash className="text-xs" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* رفع الملفات */}
                        <div>
                            <InputLabel value="ملفات المشروع" />
                            <div
                                className={`mt-2 border-2 border-dashed rounded-lg p-6 text-center transition ${
                                    dragActive ? 'border-legacy-green bg-green-50' : 'border-gray-300'
                                }`}
                                onDragEnter={(e) => {
                                    e.preventDefault();
                                    setDragActive(true);
                                }}
                                onDragLeave={(e) => {
                                    e.preventDefault();
                                    setDragActive(false);
                                }}
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={(e) => {
                                    e.preventDefault();
                                    setDragActive(false);
                                    handleFiles(e.dataTransfer.files);
                                }}
                            >
                                <FaCloudUploadAlt className="mx-auto text-4xl text-gray-400 mb-2" />
                                <p className="text-gray-600 mb-2">اسحب وأفلت الملفات هنا أو</p>
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="text-legacy-green hover:text-legacy-blue font-medium"
                                >
                                    اختر الملفات
                                </button>
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
                                    {fileList.map((item) => (
                                        <div key={item.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                                            <div className="flex items-center gap-2">
                                                <FaFile className="text-gray-400" />
                                                <span className="text-sm text-gray-700">{item.name}</span>
                                                <span className="text-xs text-gray-500">
                                                    ({(item.size / 1024 / 1024).toFixed(2)} MB)
                                                </span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => removeFile(item.id)}
                                                className="text-red-500 hover:text-red-700"
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* التقرير */}
                        <div>
                            <InputLabel htmlFor="report" value="تقرير المشروع (اختياري)" />
                            <textarea
                                id="report"
                                value={data.report}
                                onChange={(e) => setData('report', e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-legacy-green focus:ring focus:ring-legacy-green focus:ring-opacity-50"
                                rows="4"
                            />
                            <InputError message={errors.report} className="mt-2" />
                        </div>

                        {/* أزرار */}
                        <div className="flex items-center justify-end gap-4 pt-4">
                            <Link
                                href="/school/projects"
                                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                            >
                                إلغاء
                            </Link>
                            <PrimaryButton type="submit" disabled={processing}>
                                {processing ? (
                                    <>
                                        <FaSpinner className="animate-spin mr-2" />
                                        جاري الحفظ...
                                    </>
                                ) : (
                                    'إنشاء المشروع'
                                )}
                            </PrimaryButton>
                        </div>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
}

