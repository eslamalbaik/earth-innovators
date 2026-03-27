import DashboardLayout from '../../../Layouts/DashboardLayout';
import { Head, useForm, router, Link } from '@inertiajs/react';
import { useState, useRef } from 'react';
import { FaUpload, FaImage, FaSpinner, FaTrash } from 'react-icons/fa';
import TextInput from '../../../Components/TextInput';
import InputLabel from '../../../Components/InputLabel';
import InputError from '../../../Components/InputError';
import PrimaryButton from '../../../Components/PrimaryButton';
import TiptapEditor from '../../../Components/TiptapEditor';
import { useBackIcon, useTranslation } from '@/i18n';

export default function CreatePublication({ auth, school }) {
    const { t } = useTranslation();
    const BackIcon = useBackIcon();
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
            if (!file.type.startsWith('image/')) {
                alert(t('teacherPublicationCreatePage.alerts.invalidImageType'));
                return;
            }

            if (file.size > 2 * 1024 * 1024) {
                alert(t('teacherPublicationCreatePage.alerts.imageTooLarge'));
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
                        <div>
                            <InputLabel htmlFor="title" value={t('teacherPublicationCreatePage.titleLabel')} className="text-sm font-medium text-gray-700 mb-2" />
                            <TextInput
                                id="title"
                                type="text"
                                value={data.title}
                                onChange={(e) => setData('title', e.target.value)}
                                className="block w-full"
                                placeholder={t('teacherPublicationCreatePage.titlePlaceholder')}
                                required
                            />
                            <InputError message={errors.title} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="description" value={t('teacherPublicationCreatePage.descriptionLabel')} className="text-sm font-medium text-gray-700 mb-2" />
                            <textarea
                                id="description"
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                rows={3}
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#A3C042] focus:ring-[#A3C042]"
                                placeholder={t('teacherPublicationCreatePage.descriptionPlaceholder')}
                            />
                            <InputError message={errors.description} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="content" value={t('teacherPublicationCreatePage.contentLabel')} className="text-sm font-medium text-gray-700 mb-2" />
                            <TiptapEditor
                                content={data.content}
                                onChange={(html) => setData('content', html)}
                                placeholder={t('teacherPublicationCreatePage.contentPlaceholder')}
                            />
                            <InputError message={errors.content} className="mt-2" />
                        </div>

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
                                disabled={processing || !data.title || !data.content}
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
