import DashboardLayout from '@/Layouts/DashboardLayout';
import { useTranslation } from '@/i18n';
import { Head, Link, useForm } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { FaArrowLeft, FaArrowRight, FaSpinner, FaUpload, FaYoutube } from 'react-icons/fa';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import TiptapEditor from '@/Components/TiptapEditor';
import { getPublicationFileUrl, getPublicationImageUrl } from '@/utils/imageUtils';

const publicationTypeOptions = ['magazine', 'booklet', 'report', 'article'];

export default function SchoolPublicationEdit({ auth, publication }) {
    const { t, language } = useTranslation();
    const BackIcon = language === 'ar' ? FaArrowRight : FaArrowLeft;

    const { data, setData, post, processing, errors } = useForm({
        type: publication?.type || 'magazine',
        title: publication?.title || '',
        description: publication?.description || '',
        content: publication?.content || '',
        cover_image: null,
        file: null,
        youtube_url: publication?.youtube_url || '',
        issue_number: publication?.issue_number || '',
        publish_date: publication?.publish_date || '',
        publisher_name: publication?.publisher_name || '',
        _method: 'PUT',
    });

    const [coverPreview, setCoverPreview] = useState(() => getPublicationImageUrl(publication?.cover_image, null));
    const [fileName, setFileName] = useState('');
    const [imageLoadError, setImageLoadError] = useState(false);

    useEffect(() => () => {
        if (coverPreview?.startsWith('blob:')) {
            URL.revokeObjectURL(coverPreview);
        }
    }, [coverPreview]);

    const handleCoverImageChange = (event) => {
        const file = event.target.files[0];
        if (!file) {
            return;
        }

        if (coverPreview?.startsWith('blob:')) {
            URL.revokeObjectURL(coverPreview);
        }

        setData('cover_image', file);
        setCoverPreview(URL.createObjectURL(file));
        setImageLoadError(false);
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (!file) {
            return;
        }

        setData('file', file);
        setFileName(file.name);
    };

    const submit = (event) => {
        event.preventDefault();

        post(`/school/publications/${publication.id}`, {
            forceFormData: true,
            preserveScroll: true,
        });
    };

    const pageTitle = t('schoolPublicationsPage.editPageTitle', {
        appName: t('common.appName'),
    });

    return (
        <DashboardLayout auth={auth} header={t('schoolPublicationsPage.editTitle')}>
            <Head title={pageTitle} />

            <div className="py-6">
                <div className="mx-auto max-w-4xl space-y-6 sm:px-6 lg:px-8">
                    <Link
                        href="/school/publications"
                        className="inline-flex items-center gap-2 text-gray-600 transition hover:text-gray-900"
                    >
                        <BackIcon />
                        <span>{t('schoolPublicationsPage.backToList')}</span>
                    </Link>

                    <form onSubmit={submit} className="space-y-6 rounded-lg bg-white p-6 shadow-sm">
                        <div>
                            <InputLabel htmlFor="type" value={t('schoolPublicationsPage.form.typeLabel')} />
                            <select
                                id="type"
                                value={data.type}
                                onChange={(event) => setData('type', event.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#A3C042] focus:ring-[#A3C042]"
                            >
                                {publicationTypeOptions.map((type) => (
                                    <option key={type} value={type}>
                                        {t(`schoolPublicationsPage.types.${type}`)}
                                    </option>
                                ))}
                            </select>
                            <InputError message={errors.type} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="title" value={t('schoolPublicationsPage.form.titleLabel')} />
                            <TextInput
                                id="title"
                                type="text"
                                value={data.title}
                                onChange={(event) => setData('title', event.target.value)}
                                className="mt-1 block w-full"
                                required
                            />
                            <InputError message={errors.title} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="description" value={t('schoolPublicationsPage.form.descriptionLabel')} />
                            <textarea
                                id="description"
                                value={data.description}
                                onChange={(event) => setData('description', event.target.value)}
                                rows={4}
                                placeholder={t('schoolPublicationsPage.placeholders.description')}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#A3C042] focus:ring-[#A3C042]"
                            />
                            <InputError message={errors.description} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="content" value={t('schoolPublicationsPage.form.contentLabel')} />
                            <div className="mt-1">
                                <TiptapEditor
                                    key={publication?.id}
                                    content={data.content}
                                    onChange={(html) => setData('content', html)}
                                    placeholder={t('schoolPublicationsPage.placeholders.content')}
                                />
                            </div>
                            <InputError message={errors.content} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="cover_image" value={t('schoolPublicationsPage.form.coverImageLabel')} />
                            <div className="mt-1">
                                <input
                                    id="cover_image"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleCoverImageChange}
                                    className="block w-full text-sm text-gray-500 file:ms-4 file:rounded-md file:border-0 file:bg-[#A3C042]/10 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-[#A3C042] hover:file:bg-[#A3C042]/20"
                                />

                                {coverPreview && !imageLoadError && (
                                    <div className="mt-4">
                                        <img
                                            src={coverPreview}
                                            alt={t('schoolPublicationsPage.form.imagePreviewAlt')}
                                            className="h-48 w-48 rounded-lg border border-gray-300 object-cover"
                                            onError={() => setImageLoadError(true)}
                                        />
                                    </div>
                                )}

                                {imageLoadError && (
                                    <p className="mt-2 text-sm text-red-600">
                                        {t('schoolPublicationsPage.form.imageLoadError')}
                                    </p>
                                )}
                            </div>
                            <InputError message={errors.cover_image} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="file" value={t('schoolPublicationsPage.form.pdfLabel')} />
                            <div className="mt-1">
                                <input
                                    id="file"
                                    type="file"
                                    accept=".pdf"
                                    onChange={handleFileChange}
                                    className="block w-full text-sm text-gray-500 file:ms-4 file:rounded-md file:border-0 file:bg-legacy-blue/10 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-legacy-blue hover:file:bg-legacy-blue/20"
                                />

                                {publication?.file && !fileName && (
                                    <div className="mt-2 rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-600">
                                        <p>{t('schoolPublicationsPage.currentFileAvailable')}</p>
                                        <a
                                            href={getPublicationFileUrl(publication.file) || '#'}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="mt-1 inline-flex font-medium text-legacy-blue hover:underline"
                                        >
                                            {t('schoolPublicationsPage.form.currentFileLabel')}: {t('common.download')}
                                        </a>
                                    </div>
                                )}

                                {fileName && (
                                    <p className="mt-2 text-sm text-gray-600">
                                        {t('schoolPublicationsPage.selectedFile', { name: fileName })}
                                    </p>
                                )}
                            </div>
                            <InputError message={errors.file} className="mt-2" />
                        </div>

                        {/* YouTube URL */}
                        <div>
                            <InputLabel htmlFor="youtube_url" value={t('schoolPublicationsPage.form.youtubeUrlLabel', { defaultValue: 'رابط YouTube (اختياري)' })} />
                            <div className="mt-1 relative">
                                <div className="absolute inset-y-0 start-0 ps-3 flex items-center pointer-events-none">
                                    <FaYoutube className="text-red-500 text-lg" />
                                </div>
                                <TextInput
                                    id="youtube_url"
                                    type="url"
                                    value={data.youtube_url}
                                    onChange={(e) => setData('youtube_url', e.target.value)}
                                    className="mt-1 block w-full ps-10"
                                    placeholder="https://www.youtube.com/watch?v=..."
                                />
                            </div>
                            <InputError message={errors.youtube_url} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="issue_number" value={t('schoolPublicationsPage.form.issueNumberLabel')} />
                            <TextInput
                                id="issue_number"
                                type="number"
                                min="1"
                                value={data.issue_number}
                                onChange={(event) => setData('issue_number', event.target.value)}
                                className="mt-1 block w-full"
                            />
                            <InputError message={errors.issue_number} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="publish_date" value={t('schoolPublicationsPage.form.publishDateLabel')} />
                            <TextInput
                                id="publish_date"
                                type="date"
                                value={data.publish_date}
                                onChange={(event) => setData('publish_date', event.target.value)}
                                className="mt-1 block w-full"
                            />
                            <InputError message={errors.publish_date} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="publisher_name" value={t('schoolPublicationsPage.form.publisherNameLabel')} />
                            <TextInput
                                id="publisher_name"
                                type="text"
                                value={data.publisher_name}
                                onChange={(event) => setData('publisher_name', event.target.value)}
                                placeholder={t('schoolPublicationsPage.placeholders.publisherName')}
                                className="mt-1 block w-full"
                            />
                            <InputError message={errors.publisher_name} className="mt-2" />
                        </div>

                        <div className="flex items-center justify-end gap-4 border-t border-gray-200 pt-4">
                            <Link
                                href="/school/publications"
                                className="rounded-lg border border-gray-300 px-6 py-2 text-gray-700 transition hover:bg-gray-50"
                            >
                                {t('common.cancel')}
                            </Link>
                            <PrimaryButton disabled={processing} className="bg-[#A3C042]">
                                {processing ? (
                                    <>
                                        <FaSpinner className="me-2 inline-block animate-spin" />
                                        {t('schoolPublicationsPage.buttons.saving')}
                                    </>
                                ) : (
                                    <>
                                        <FaUpload className="me-2 inline-block" />
                                        {t('schoolPublicationsPage.buttons.save')}
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
