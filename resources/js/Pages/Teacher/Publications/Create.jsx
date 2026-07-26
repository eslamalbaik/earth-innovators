import DashboardLayout from '../../../Layouts/DashboardLayout';
import { Head, useForm, router, Link } from '@inertiajs/react';
import { useState, useRef } from 'react';
import { FaUpload, FaImage, FaSpinner, FaTrash, FaYoutube, FaRobot } from 'react-icons/fa';
import InputLabel from '../../../Components/InputLabel';
import InputError from '../../../Components/InputError';
import PrimaryButton from '../../../Components/PrimaryButton';
import TextInput from '../../../Components/TextInput';
import PublicationBilingualFields, { publicationBilingualFormIsValid } from '@/Components/Publications/PublicationBilingualFields';
import { useBackIcon, useTranslation } from '@/i18n';
import axios from 'axios';

export default function CreatePublication({ auth, school }) {
    const { t } = useTranslation();
    const BackIcon = useBackIcon();
    const { data, setData, post, processing, errors } = useForm({
        title: '',
        title_ar: '',
        content: '',
        content_ar: '',
        description: '',
        description_ar: '',
        cover_image: null,
        youtube_url: '',
        type: 'magazine',
        file: null,
    });

    const [imagePreview, setImagePreview] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [fileName, setFileName] = useState('');
    const imageInputRef = useRef(null);

    const handleFileChange = (e) => {
        const selected = e.target.files?.[0];
        if (!selected) {
            return;
        }
        if (selected.type !== 'application/pdf') {
            alert('الملف المرفق يجب أن يكون بصيغة PDF.');
            return;
        }
        if (selected.size > 10 * 1024 * 1024) {
            alert('حجم الملف يجب ألا يتجاوز 10 ميجابايت.');
            return;
        }
        setData('file', selected);
        setFileName(selected.name);
    };

    const handleAIGenerate = async () => {
        const titleToUse = data.title || data.title_ar;
        if (!titleToUse) {
            alert("يرجى إدخال عنوان المقال (بالعربية أو الإنجليزية) أولاً لتوليد المحتوى.");
            return;
        }

        setIsGenerating(true);
        try {
            const response = await axios.post('/teacher/publications/generate', { title: titleToUse });
            const result = response.data;
            
            setData(prev => ({
                ...prev,
                title: result.title || prev.title,
                title_ar: result.title_ar || prev.title_ar,
                content: result.content || prev.content,
                content_ar: result.content_ar || prev.content_ar,
                description: result.description || prev.description,
                description_ar: result.description_ar || prev.description_ar,
            }));

            if (result.image_url) {
                // Fetch the image and convert to File object
                try {
                    const imgRes = await fetch(result.image_url);
                    const blob = await imgRes.blob();
                    const file = new File([blob], 'ai_generated_image.jpg', { type: blob.type });
                    setData('cover_image', file);
                    setImagePreview(URL.createObjectURL(file));
                } catch (imgError) {
                    console.error("Error fetching AI image", imgError);
                }
            }
        } catch (error) {
            alert(error.response?.data?.error || 'حدث خطأ أثناء توليد المحتوى');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                alert(t('teacherPublicationCreatePage.alerts.invalidImageType'));
                return;
            }

            if (file.size > 5 * 1024 * 1024) {
                alert(t('teacherPublicationCreatePage.alerts.imageTooLarge', { defaultValue: 'حجم الصورة يجب ألا يتجاوز 5 ميجابايت.' }));
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
            <DashboardLayout auth={auth} header={t('teacherPublicationCreatePage.title')}>
                <Head title={t('teacherPublicationCreatePage.pageTitle', { appName: t('common.appName') })} />
                <div className="py-6">
                    <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                            <p className="text-yellow-800">
                                {t('teacherPublicationCreatePage.noSchoolMessage')}
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
            header={(
                <div className="flex items-center gap-3">
                    <Link href="/teacher/publications" className="text-gray-600 hover:text-[#A3C042]">
                        <BackIcon className="text-xl" />
                    </Link>
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">{t('teacherPublicationCreatePage.title')}</h2>
                </div>
            )}
        >
            <Head title={t('teacherPublicationCreatePage.pageTitle', { appName: t('common.appName') })} />

            <div className="py-6">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <form onSubmit={submit} className="bg-white rounded-xl shadow-lg p-6 space-y-6">
                        
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 mb-4 border border-blue-100 flex items-center justify-between">
                            <div>
                                <h3 className="font-semibold text-blue-800 text-sm flex items-center gap-2">
                                    <FaRobot className="text-blue-600" />
                                    توليد المحتوى بالذكاء الاصطناعي
                                </h3>
                                <p className="text-xs text-blue-600 mt-1">
                                    اكتب العنوان فقط (بالعربية أو الإنجليزية) وسيقوم الذكاء الاصطناعي بكتابة المقال واختيار صورة مناسبة.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={handleAIGenerate}
                                disabled={isGenerating || (!data.title && !data.title_ar)}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition flex items-center gap-2"
                            >
                                {isGenerating ? (
                                    <><FaSpinner className="animate-spin" /> جاري التوليد...</>
                                ) : (
                                    <><FaRobot /> توليد الآن</>
                                )}
                            </button>
                        </div>

                        <PublicationBilingualFields data={data} setData={setData} errors={errors} />

                        <div>
                            <InputLabel value={t('teacherPublicationCreatePage.coverImageLabel')} className="text-sm font-medium text-gray-700 mb-2" />

                            {imagePreview ? (
                                <div className="relative">
                                    <img
                                        src={imagePreview}
                                        alt={t('teacherPublicationCreatePage.coverImagePreviewAlt')}
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
                                    className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-[#A3C042] transition"
                                >
                                    <FaImage className="mx-auto text-4xl text-gray-400 mb-4" />
                                    <p className="text-gray-700 mb-2">
                                        {t('teacherPublicationCreatePage.coverImageSelect')}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        {t('teacherPublicationCreatePage.coverImageHint')}
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

                        <div>
                            <InputLabel htmlFor="youtube_url" value={t('teacherPublicationCreatePage.youtubeUrlLabel', { defaultValue: 'رابط YouTube (اختياري)' })} className="text-sm font-medium text-gray-700 mb-2" />
                            <div className="relative">
                                <div className="absolute inset-y-0 start-0 ps-3 flex items-center pointer-events-none">
                                    <FaYoutube className="text-red-500 text-lg" />
                                </div>
                                <TextInput
                                    id="youtube_url"
                                    type="url"
                                    value={data.youtube_url}
                                    onChange={(e) => setData('youtube_url', e.target.value)}
                                    className="block w-full ps-10"
                                    placeholder="https://www.youtube.com/watch?v=..."
                                />
                            </div>
                            <p className="mt-1 text-xs text-gray-500">{t('teacherPublicationCreatePage.youtubeUrlHint', { defaultValue: 'أضف رابط فيديو YouTube ليظهر مُضمّناً في صفحة المنشور' })}</p>
                            <InputError message={errors.youtube_url} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="type" value={t('teacherPublicationCreatePage.typeLabel')} className="text-sm font-medium text-gray-700 mb-2" />
                            <select
                                id="type"
                                value={data.type}
                                onChange={(e) => setData('type', e.target.value)}
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#A3C042] focus:ring-[#A3C042]"
                                required
                            >
                                <option value="magazine">{t('teacherPublicationsPage.types.magazine')}</option>
                                <option value="booklet">{t('teacherPublicationsPage.types.booklet')}</option>
                                <option value="report">{t('teacherPublicationsPage.types.report')}</option>
                                <option value="article">{t('teacherPublicationsPage.types.article')}</option>
                            </select>
                            <InputError message={errors.type} className="mt-2" />
                        </div>

                        {/* مرفق PDF (كتيب/مجلة) */}
                        <div>
                            <InputLabel htmlFor="file" value="مرفق PDF (اختياري)" className="text-sm font-medium text-gray-700 mb-2" />
                            <input
                                id="file"
                                type="file"
                                accept=".pdf,application/pdf"
                                onChange={handleFileChange}
                                className="block w-full text-sm text-gray-500 file:ms-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[#A3C042]/15 file:text-[#5a7a00] hover:file:bg-[#A3C042]/25"
                            />
                            {fileName ? (
                                <p className="mt-2 text-sm text-gray-600">{fileName}</p>
                            ) : null}
                            <p className="mt-1 text-xs text-gray-500">
                                {data.type === 'booklet'
                                    ? 'أرفق ملف الكتيب بصيغة PDF (بحد أقصى 10 ميجابايت).'
                                    : 'يمكنك إرفاق ملف PDF للإصدار (كتيب/مجلة) بحد أقصى 10 ميجابايت.'}
                            </p>
                            <InputError message={errors.file} className="mt-2" />
                        </div>

                        {school && (
                            <div className="bg-[#A3C042]/10 border border-[#A3C042]/20 rounded-lg p-4">
                                <p className="text-sm text-gray-700">
                                    <span className="font-semibold">{t('teacherPublicationCreatePage.schoolLabel')}:</span> {school.name}
                                </p>
                                <p className="text-xs text-gray-600 mt-1">
                                    {t('teacherPublicationCreatePage.schoolReviewHint')}
                                </p>
                            </div>
                        )}

                        <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-200">
                            <button
                                type="button"
                                onClick={() => router.visit('/teacher/publications')}
                                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition"
                            >
                                {t('teacherPublicationCreatePage.cancel')}
                            </button>
                            <PrimaryButton
                                type="submit"
                                disabled={processing || !publicationBilingualFormIsValid(data)}
                                className="bg-[#A3C042] hover:bg-[#A3C042] flex items-center gap-2"
                            >
                                {processing ? (
                                    <>
                                        <FaSpinner className="animate-spin" />
                                        {t('teacherPublicationCreatePage.publishing')}
                                    </>
                                ) : (
                                    <>
                                        <FaUpload />
                                        {t('teacherPublicationCreatePage.submit')}
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
