import DashboardLayout from '../../../Layouts/DashboardLayout';
import { Head, useForm, router, Link } from '@inertiajs/react';
import { useState, useRef } from 'react';
import { FaArrowLeft, FaUpload, FaImage, FaFileAlt, FaSpinner, FaTrash } from 'react-icons/fa';
import TextInput from '../../../Components/TextInput';
import InputLabel from '../../../Components/InputLabel';
import InputError from '../../../Components/InputError';
import PrimaryButton from '../../../Components/PrimaryButton';
import TiptapEditor from '../../../Components/TiptapEditor';

export default function CreatePublication({ auth, school }) {
    const { data, setData, post, processing, errors } = useForm({
        title: '',
        content: '',
        description: '',
        cover_image: null,
        type: 'magazine',
    });

    const [imagePreview, setImagePreview] = useState(null);
    const imageInputRef = useRef(null);

    const handleImageChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            // التحقق من نوع الملف
            if (!file.type.startsWith('image/')) {
                alert('يرجى اختيار ملف صورة صحيح');
                return;
            }
            
            // التحقق من حجم الملف (2 ميجا)
            if (file.size > 2 * 1024 * 1024) {
                alert('حجم الصورة يجب ألا يتجاوز 2 ميجابايت');
                return;
            }

            setData('cover_image', file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const removeImage = () => {
        setData('cover_image', null);
        setImagePreview(null);
        if (imageInputRef.current) {
            imageInputRef.current.value = '';
        }
    };

    const submit = (e) => {
        e.preventDefault();
        post('/teacher/publications', {
            forceFormData: true,
            onSuccess: () => {
                router.visit('/teacher/publications');
            },
        });
    };

    if (!school) {
        return (
            <DashboardLayout auth={auth} header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">إنشاء مقال</h2>}>
                <Head title="إنشاء مقال - لوحة المعلم" />
                <div className="py-6">
                    <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                            <p className="text-yellow-800">
                                يجب أن تكون مرتبطاً بمدرسة لنشر المقالات. يرجى التواصل مع الإدارة.
                            </p>
                        </div>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout 
            auth={auth} 
            header={
                <div className="flex items-center gap-3">
                    <Link href="/teacher/publications" className="text-gray-600 hover:text-legacy-green">
                        <FaArrowLeft className="text-xl" />
                    </Link>
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">إنشاء مقال جديد</h2>
                </div>
            }
        >
            <Head title="إنشاء مقال جديد - لوحة المعلم" />

            <div className="py-6">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <form onSubmit={submit} className="bg-white rounded-xl shadow-lg p-6 space-y-6">
                        {/* Title */}
                        <div>
                            <InputLabel htmlFor="title" value="اسم المقال" className="text-sm font-medium text-gray-700 mb-2" />
                            <TextInput
                                id="title"
                                type="text"
                                value={data.title}
                                onChange={(e) => setData('title', e.target.value)}
                                className="block w-full"
                                placeholder="أدخل اسم المقال"
                                required
                            />
                            <InputError message={errors.title} className="mt-2" />
                        </div>

                        {/* Description */}
                        <div>
                            <InputLabel htmlFor="description" value="وصف مختصر" className="text-sm font-medium text-gray-700 mb-2" />
                            <textarea
                                id="description"
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                rows={3}
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-legacy-green focus:ring-legacy-green"
                                placeholder="أدخل وصفاً مختصراً للمقال"
                            />
                            <InputError message={errors.description} className="mt-2" />
                        </div>

                        {/* Content */}
                        <div>
                            <InputLabel htmlFor="content" value="محتوى المقال" className="text-sm font-medium text-gray-700 mb-2" />
                            <TiptapEditor
                                content={data.content}
                                onChange={(html) => setData('content', html)}
                                placeholder="أدخل محتوى المقال..."
                            />
                            <InputError message={errors.content} className="mt-2" />
                        </div>

                        {/* Cover Image */}
                        <div>
                            <InputLabel value="صورة المقال" className="text-sm font-medium text-gray-700 mb-2" />
                            
                            {imagePreview ? (
                                <div className="relative">
                                    <img
                                        src={imagePreview}
                                        alt="Preview"
                                        className="w-full h-64 object-cover rounded-lg border border-gray-300"
                                    />
                                    <button
                                        type="button"
                                        onClick={removeImage}
                                        className="absolute top-2 left-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition"
                                    >
                                        <FaTrash />
                                    </button>
                                </div>
                            ) : (
                                <div
                                    onClick={() => imageInputRef.current?.click()}
                                    className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-legacy-green transition"
                                >
                                    <FaImage className="mx-auto text-4xl text-gray-400 mb-4" />
                                    <p className="text-gray-700 mb-2">
                                        انقر لاختيار صورة المقال
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        PNG, JPG, GIF (الحد الأقصى: 2 ميجابايت)
                                    </p>
                                </div>
                            )}
                            
                            <input
                                ref={imageInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="hidden"
                            />
                            <InputError message={errors.cover_image} className="mt-2" />
                        </div>

                        {/* Type */}
                        <div>
                            <InputLabel htmlFor="type" value="نوع المقال" className="text-sm font-medium text-gray-700 mb-2" />
                            <select
                                id="type"
                                value={data.type}
                                onChange={(e) => setData('type', e.target.value)}
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-legacy-green focus:ring-legacy-green"
                                required
                            >
                                <option value="magazine">مجلة</option>
                                <option value="booklet">كتيب</option>
                                <option value="report">تقرير</option>
                            </select>
                            <InputError message={errors.type} className="mt-2" />
                        </div>

                        {/* School Info */}
                        {school && (
                            <div className="bg-legacy-green/10 border border-legacy-green/20 rounded-lg p-4">
                                <p className="text-sm text-gray-700">
                                    <span className="font-semibold">المدرسة:</span> {school.name}
                                </p>
                                <p className="text-xs text-gray-600 mt-1">
                                    سيتم إرسال المقال للمدرسة للمراجعة والموافقة عليه قبل النشر
                                </p>
                            </div>
                        )}

                        {/* Submit Button */}
                        <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-200">
                            <button
                                type="button"
                                onClick={() => router.visit('/teacher/publications')}
                                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition"
                            >
                                إلغاء
                            </button>
                            <PrimaryButton
                                type="submit"
                                disabled={processing || !data.title || !data.content}
                                className="bg-legacy-green hover:bg-green-600 flex items-center gap-2"
                            >
                                {processing ? (
                                    <>
                                        <FaSpinner className="animate-spin" />
                                        جاري النشر...
                                    </>
                                ) : (
                                    <>
                                        <FaUpload />
                                        نشر المقال
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

