import DashboardLayout from '../../../Layouts/DashboardLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { FaBook, FaUpload, FaSpinner, FaArrowLeft } from 'react-icons/fa';
import TextInput from '../../../Components/TextInput';
import InputLabel from '../../../Components/InputLabel';
import InputError from '../../../Components/InputError';
import PrimaryButton from '../../../Components/PrimaryButton';
import { getPublicationImageUrl } from '../../../utils/imageUtils';

export default function SchoolPublicationEdit({ auth, publication }) {
    const { data, setData, post, processing, errors } = useForm({
        type: publication?.type || 'magazine',
        title: publication?.title || '',
        description: publication?.description || '',
        content: publication?.content || '',
        cover_image: null,
        file: null,
        issue_number: publication?.issue_number || '',
        publish_date: publication?.publish_date || '',
        publisher_name: publication?.publisher_name || '',
        _method: 'PUT',
    });

    const getImageUrl = (imagePath) => {
        if (!imagePath) return null;
        // Use utility function for consistency, but allow null for preview state
        return getPublicationImageUrl(imagePath, null);
    };

    const [coverPreview, setCoverPreview] = useState(() => {
        return getImageUrl(publication?.cover_image);
    });
    const [fileName, setFileName] = useState(publication?.file ? 'ملف موجود' : '');

    // Update preview when publication changes (but not if user selected a new file)
    useEffect(() => {
        if (publication?.cover_image) {
            const imageUrl = getImageUrl(publication.cover_image);
            // Only update if current preview is not a blob URL (user-selected file)
            setCoverPreview(prev => {
                if (prev && prev.startsWith('blob:')) {
                    return prev; // Keep user-selected file preview
                }
                return imageUrl;
            });
        } else {
            // If no image in publication and no user-selected file, clear preview
            setCoverPreview(prev => {
                if (prev && prev.startsWith('blob:')) {
                    return prev; // Keep user-selected file preview
                }
                return null;
            });
        }
    }, [publication?.cover_image]);

    const handleCoverImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData('cover_image', file);
            setCoverPreview(URL.createObjectURL(file));
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData('file', file);
            setFileName(file.name);
        }
    };

    const submit = (e) => {
        e.preventDefault();
        post(`/school/publications/${publication.id}`, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: (page) => {
                // Clean up blob URL if exists
                if (coverPreview && coverPreview.startsWith('blob:')) {
                    URL.revokeObjectURL(coverPreview);
                }
                // Update preview with the new image path if available
                if (page?.props?.publication?.cover_image) {
                    setCoverPreview(getImageUrl(page.props.publication.cover_image));
                }
            },
            onError: (errors) => {
                console.error('Update errors:', errors);
            },
        });
    };

    return (
        <DashboardLayout
            auth={auth}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">تعديل المقال</h2>}
        >
            <Head title="تعديل المقال - لوحة المدرسة" />

            <div className="py-6">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <Link
                        href="/school/publications"
                        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
                    >
                        <FaArrowLeft />
                        <span>العودة إلى المقالات</span>
                    </Link>

                    <form onSubmit={submit} className="bg-white shadow-sm rounded-lg p-6 space-y-6">
                        {/* Type */}
                        <div>
                            <InputLabel htmlFor="type" value="نوع الإصدار" />
                            <select
                                id="type"
                                value={data.type}
                                onChange={(e) => setData('type', e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-legacy-green focus:ring-legacy-green"
                            >
                                <option value="magazine">مجلة</option>
                                <option value="booklet">كتيب</option>
                                <option value="report">تقرير</option>
                            </select>
                            <InputError message={errors.type} className="mt-2" />
                        </div>

                        {/* Title */}
                        <div>
                            <InputLabel htmlFor="title" value="العنوان" />
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

                        {/* Description */}
                        <div>
                            <InputLabel htmlFor="description" value="الوصف" />
                            <textarea
                                id="description"
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                rows={4}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-legacy-green focus:ring-legacy-green"
                            />
                            <InputError message={errors.description} className="mt-2" />
                        </div>

                        {/* Content */}
                        <div>
                            <InputLabel htmlFor="content" value="المحتوى (HTML)" />
                            <textarea
                                id="content"
                                value={data.content}
                                onChange={(e) => setData('content', e.target.value)}
                                rows={15}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-legacy-green focus:ring-legacy-green font-mono text-sm"
                                placeholder="يمكنك استخدام HTML هنا"
                            />
                            <InputError message={errors.content} className="mt-2" />
                        </div>

                        {/* Cover Image */}
                        <div>
                            <InputLabel htmlFor="cover_image" value="صورة الغلاف" />
                            <div className="mt-1">
                                <input
                                    id="cover_image"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleCoverImageChange}
                                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-legacy-green/10 file:text-legacy-green hover:file:bg-legacy-green/20"
                                />
                                {coverPreview ? (
                                    <div className="mt-4">
                                        <img
                                            src={coverPreview}
                                            alt="Preview"
                                            className="w-48 h-48 object-cover rounded-lg border border-gray-300"
                                            onError={(e) => {
                                                console.error('Failed to load image:', coverPreview);
                                                e.target.style.display = 'none';
                                                // Show error message
                                                const errorDiv = document.createElement('div');
                                                errorDiv.className = 'mt-2 text-sm text-red-600';
                                                errorDiv.textContent = 'فشل تحميل الصورة';
                                                e.target.parentElement.appendChild(errorDiv);
                                            }}
                                        />
                                    </div>
                                ) : publication?.cover_image ? (
                                    <p className="mt-2 text-sm text-gray-500">جاري تحميل الصورة...</p>
                                ) : null}
                            </div>
                            <InputError message={errors.cover_image} className="mt-2" />
                        </div>

                        {/* File PDF */}
                        <div>
                            <InputLabel htmlFor="file" value="ملف PDF (اختياري)" />
                            <div className="mt-1">
                                <input
                                    id="file"
                                    type="file"
                                    accept=".pdf"
                                    onChange={handleFileChange}
                                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-legacy-blue/10 file:text-legacy-blue hover:file:bg-legacy-blue/20"
                                />
                                {fileName && (
                                    <p className="mt-2 text-sm text-gray-600">
                                        {fileName}
                                    </p>
                                )}
                            </div>
                            <InputError message={errors.file} className="mt-2" />
                        </div>

                        {/* Issue Number */}
                        <div>
                            <InputLabel htmlFor="issue_number" value="رقم العدد (للمجلات)" />
                            <TextInput
                                id="issue_number"
                                type="number"
                                min="1"
                                value={data.issue_number}
                                onChange={(e) => setData('issue_number', e.target.value)}
                                className="mt-1 block w-full"
                            />
                            <InputError message={errors.issue_number} className="mt-2" />
                        </div>

                        {/* Publish Date */}
                        <div>
                            <InputLabel htmlFor="publish_date" value="تاريخ النشر" />
                            <TextInput
                                id="publish_date"
                                type="date"
                                value={data.publish_date}
                                onChange={(e) => setData('publish_date', e.target.value)}
                                className="mt-1 block w-full"
                            />
                            <InputError message={errors.publish_date} className="mt-2" />
                        </div>

                        {/* Publisher Name */}
                        <div>
                            <InputLabel htmlFor="publisher_name" value="اسم الناشر" />
                            <TextInput
                                id="publisher_name"
                                type="text"
                                value={data.publisher_name}
                                onChange={(e) => setData('publisher_name', e.target.value)}
                                className="mt-1 block w-full"
                                placeholder="مثال: مجلس المدارس المبتكرة"
                            />
                            <InputError message={errors.publisher_name} className="mt-2" />
                        </div>

                        {/* Submit Button */}
                        <div className="flex items-center justify-end gap-4 pt-4">
                            <Link
                                href="/school/publications"
                                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                            >
                                إلغاء
                            </Link>
                            <PrimaryButton
                                disabled={processing}
                                className="bg-gradient-to-r from-legacy-green to-legacy-blue"
                            >
                                {processing ? (
                                    <>
                                        <FaSpinner className="animate-spin inline-block ml-2" />
                                        جاري الحفظ...
                                    </>
                                ) : (
                                    <>
                                        <FaUpload className="inline-block ml-2" />
                                        حفظ التغييرات
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

