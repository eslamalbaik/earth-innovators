import DashboardLayout from '@/Layouts/DashboardLayout';
import { useTranslation } from '@/i18n';
import { Head, Link, useForm } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { FaArrowLeft, FaArrowRight, FaSpinner, FaUpload } from 'react-icons/fa';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import TiptapEditor from '@/Components/TiptapEditor';

const publicationTypeOptions = ['magazine', 'booklet', 'report', 'article'];

export default function SchoolPublicationCreate({ auth }) {
    const { t, language } = useTranslation();
    const BackIcon = language === 'ar' ? FaArrowRight : FaArrowLeft;

    const { data, setData, post, processing, errors } = useForm({
        type: 'magazine',
        title: '',
        description: '',
        content: '',
        cover_image: null,
        file: null,
        issue_number: '',
    });

    const [coverPreview, setCoverPreview] = useState(null);
    const [fileName, setFileName] = useState('');

    useEffect(() => () => {
        if (coverPreview) {
            URL.revokeObjectURL(coverPreview);
        }
    }, [coverPreview]);

    const handleCoverImageChange = (event) => {
        const file = event.target.files[0];
        if (!file) {
            return;
        }

        if (coverPreview) {
            URL.revokeObjectURL(coverPreview);
        }

        setData('cover_image', file);
        setCoverPreview(URL.createObjectURL(file));
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

        post('/school/publications', {
            forceFormData: true,
            preserveScroll: true,
        });
    };

    const pageTitle = t('schoolPublicationsPage.createPageTitle', {
        appName: t('common.appName'),
    });

    return (
        <DashboardLayout auth={auth} header={t('schoolPublicationsPage.createTitle')}>
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

                    <div className="rounded-lg border border-[#A3C042]/20 bg-[#A3C042]/10 p-4 text-sm text-gray-700">
                        {t('schoolPublicationsPage.form.autoMetadataNotice')}
                    </div>

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
                                {coverPreview && (
                                    <img
                                        src={coverPreview}
                                        alt={t('schoolPublicationsPage.form.imagePreviewAlt')}
                                        className="mt-4 h-48 w-48 rounded-lg border border-gray-300 object-cover"
                                    />
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
                                {fileName && (
                                    <p className="mt-2 text-sm text-gray-600">
                                        {t('schoolPublicationsPage.selectedFile', { name: fileName })}
                                    </p>
                                )}
                            </div>
                            <InputError message={errors.file} className="mt-2" />
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
                                        {t('schoolPublicationsPage.buttons.creating')}
                                    </>
                                ) : (
                                    <>
                                        <FaUpload className="me-2 inline-block" />
                                        {t('schoolPublicationsPage.buttons.create')}
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
