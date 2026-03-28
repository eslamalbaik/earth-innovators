import DashboardLayout from '../../../Layouts/DashboardLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { FaUpload, FaSpinner, FaArrowLeft } from 'react-icons/fa';
import TextInput from '../../../Components/TextInput';
import InputLabel from '../../../Components/InputLabel';
import InputError from '../../../Components/InputError';
import PrimaryButton from '../../../Components/PrimaryButton';
import { getPublicationImageUrl } from '../../../utils/imageUtils';
import { useTranslation } from '@/i18n';

export default function TeacherPublicationEdit({ auth, publication }) {
    const { t } = useTranslation();
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
        return getPublicationImageUrl(imagePath, null);
    };

    const [coverPreview, setCoverPreview] = useState(() => getImageUrl(publication?.cover_image));
    const [fileName, setFileName] = useState(publication?.file ? t('teacherPublicationEditPage.existingFile') : '');

    useEffect(() => {
        if (publication?.cover_image) {
            const imageUrl = getImageUrl(publication.cover_image);
            setCoverPreview((prev) => {
                if (prev && prev.startsWith('blob:')) {
                    return prev;
                }

                return imageUrl;
            });
        } else {
            setCoverPreview((prev) => {
                if (prev && prev.startsWith('blob:')) {
                    return prev;
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
        post(`/teacher/publications/${publication.id}`, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: (page) => {
                if (coverPreview && coverPreview.startsWith('blob:')) {
                    URL.revokeObjectURL(coverPreview);
                }

                if (page?.props?.publication?.cover_image) {
                    setCoverPreview(getImageUrl(page.props.publication.cover_image));
                }
            },
        });
    };

    return (
        <DashboardLayout
            auth={auth}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">{t('teacherPublicationEditPage.title')}</h2>}
        >
            <Head title={t('teacherPublicationEditPage.pageTitle', { appName: t('common.appName') })} />

            <div className="py-6">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <Link
                        href="/teacher/publications"
                        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
                    >
                        <FaArrowLeft />
                        <span>{t('teacherPublicationEditPage.backToPublications')}</span>
                    </Link>

                    <form onSubmit={submit} className="bg-white shadow-sm rounded-lg p-6 space-y-6">
                        <div>
                            <InputLabel htmlFor="type" value={t('teacherPublicationEditPage.form.typeLabel')} />
                            <select
                                id="type"
                                value={data.type}
                                onChange={(e) => setData('type', e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#A3C042] focus:ring-[#A3C042]"
                            >
                                <option value="magazine">{t('common.publicationTypes.magazine')}</option>
                                <option value="booklet">{t('common.publicationTypes.booklet')}</option>
                                <option value="report">{t('common.publicationTypes.report')}</option>
                                <option value="article">{t('common.publicationTypes.article')}</option>
                            </select>
                            <InputError message={errors.type} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="title" value={t('teacherPublicationEditPage.form.titleLabel')} />
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

                        <div>
                            <InputLabel htmlFor="description" value={t('teacherPublicationEditPage.form.descriptionLabel')} />
                            <textarea
                                id="description"
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                rows={4}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#A3C042] focus:ring-[#A3C042]"
                            />
                            <InputError message={errors.description} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="content" value={t('teacherPublicationEditPage.form.contentLabel')} />
                            <textarea
                                id="content"
                                value={data.content}
                                onChange={(e) => setData('content', e.target.value)}
                                rows={15}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#A3C042] focus:ring-[#A3C042] font-mono text-sm"
                                placeholder={t('teacherPublicationEditPage.form.contentPlaceholder')}
                            />
                            <InputError message={errors.content} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="cover_image" value={t('teacherPublicationEditPage.form.coverImageLabel')} />
                            <div className="mt-1">
                                <input
                                    id="cover_image"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleCoverImageChange}
                                    className="block w-full text-sm text-gray-500 file:ms-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[#A3C042]/10 file:text-[#A3C042] hover:file:bg-[#A3C042]/20"
                                />
                                {coverPreview ? (
                                    <div className="mt-4">
                                        <img
                                            src={coverPreview}
                                            alt={t('teacherPublicationEditPage.form.coverPreviewAlt')}
                                            className="w-48 h-48 object-cover rounded-lg border border-gray-300"
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                                const errorDiv = document.createElement('div');
                                                errorDiv.className = 'mt-2 text-sm text-red-600';
                                                errorDiv.textContent = t('teacherPublicationEditPage.form.coverLoadError');
                                                e.target.parentElement.appendChild(errorDiv);
                                            }}
                                        />
                                    </div>
                                ) : publication?.cover_image ? (
                                    <p className="mt-2 text-sm text-gray-500">{t('teacherPublicationEditPage.form.loadingImage')}</p>
                                ) : null}
                            </div>
                            <InputError message={errors.cover_image} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="file" value={t('teacherPublicationEditPage.form.fileLabel')} />
                            <div className="mt-1">
                                <input
                                    id="file"
                                    type="file"
                                    accept=".pdf"
                                    onChange={handleFileChange}
                                    className="block w-full text-sm text-gray-500 file:ms-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-legacy-blue/10 file:text-legacy-blue hover:file:bg-legacy-blue/20"
                                />
                                {fileName && (
                                    <p className="mt-2 text-sm text-gray-600">
                                        {fileName}
                                    </p>
                                )}
                            </div>
                            <InputError message={errors.file} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="issue_number" value={t('teacherPublicationEditPage.form.issueNumberLabel')} />
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

                        <div>
                            <InputLabel htmlFor="publish_date" value={t('teacherPublicationEditPage.form.publishDateLabel')} />
                            <TextInput
                                id="publish_date"
                                type="date"
                                value={data.publish_date}
                                onChange={(e) => setData('publish_date', e.target.value)}
                                className="mt-1 block w-full"
                            />
                            <InputError message={errors.publish_date} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="publisher_name" value={t('teacherPublicationEditPage.form.publisherNameLabel')} />
                            <TextInput
                                id="publisher_name"
                                type="text"
                                value={data.publisher_name}
                                onChange={(e) => setData('publisher_name', e.target.value)}
                                className="mt-1 block w-full"
                                placeholder={t('teacherPublicationEditPage.form.publisherNamePlaceholder')}
                            />
                            <InputError message={errors.publisher_name} className="mt-2" />
                        </div>

                        <div className="flex items-center justify-end gap-4 pt-4">
                            <Link
                                href="/teacher/publications"
                                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                            >
                                {t('common.cancel')}
                            </Link>
                            <PrimaryButton
                                disabled={processing}
                                className="bg-[#A3C042]"
                            >
                                {processing ? (
                                    <>
                                        <FaSpinner className="animate-spin inline-block me-2" />
                                        {t('teacherPublicationEditPage.actions.saving')}
                                    </>
                                ) : (
                                    <>
                                        <FaUpload className="inline-block me-2" />
                                        {t('teacherPublicationEditPage.actions.saveChanges')}
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
