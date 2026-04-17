import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { useState } from 'react';
import { FaUpload, FaSpinner, FaYoutube, FaArrowRight } from 'react-icons/fa';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import TiptapEditor from '@/Components/TiptapEditor';
import { getPublicationImageUrl, getPublicationFileUrl } from '@/utils/imageUtils';
import { useTranslation } from '@/i18n';

export default function AdminPublicationEdit({ publication, schools }) {
    const { t } = useTranslation();

    const { data, setData, post, processing, errors } = useForm({
        _method: 'PUT',
        type:           publication?.type || 'magazine',
        title:          publication?.title || '',
        description:    publication?.description || '',
        content:        publication?.content || '',
        cover_image:    null,
        file:           null,
        youtube_url:    publication?.youtube_url || '',
        issue_number:   publication?.issue_number || '',
        publish_date:   publication?.publish_date || '',
        publisher_name: publication?.publisher_name || '',
        school_id:      publication?.school_id || '',
    });

    const [coverPreview, setCoverPreview]       = useState(() => getPublicationImageUrl(publication?.cover_image, null));
    const [fileName, setFileName]               = useState('');
    const [imageLoadError, setImageLoadError]   = useState(false);

    const handleCoverImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (coverPreview?.startsWith('blob:')) URL.revokeObjectURL(coverPreview);
        setData('cover_image', file);
        setCoverPreview(URL.createObjectURL(file));
        setImageLoadError(false);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setData('file', file);
        setFileName(file.name);
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.publications.update', publication.id), { forceFormData: true });
    };

    return (
        <DashboardLayout header={t('adminPublicationCreatePage.title') + ' — تعديل'}>
            <Head title={`تعديل: ${publication?.title || ''} — ${t('common.appName')}`} />

            <div className="py-6">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                    <Link
                        href={route('admin.publications.show', publication.id)}
                        className="mb-6 inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
                    >
                        <FaArrowRight className="rotate-180" />
                        <span>العودة إلى تفاصيل المنشور</span>
                    </Link>

                    <form onSubmit={submit} className="mt-4 space-y-6 rounded-lg bg-white p-6 shadow-sm">

                        {/* Type */}
                        <div>
                            <InputLabel htmlFor="type" value={t('adminPublicationCreatePage.form.typeLabel')} />
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

                        {/* Title */}
                        <div>
                            <InputLabel htmlFor="title" value={t('adminPublicationCreatePage.form.titleLabel')} />
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
                            <InputLabel htmlFor="description" value={t('adminPublicationCreatePage.form.descriptionLabel')} />
                            <textarea
                                id="description"
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                rows={4}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#A3C042] focus:ring-[#A3C042]"
                            />
                            <InputError message={errors.description} className="mt-2" />
                        </div>

                        {/* Content */}
                        <div>
                            <InputLabel htmlFor="content" value={t('adminPublicationCreatePage.form.contentLabel')} />
                            <div className="mt-1">
                                <TiptapEditor
                                    key={publication?.id}
                                    content={data.content}
                                    onChange={(html) => setData('content', html)}
                                    placeholder={t('adminPublicationCreatePage.form.contentPlaceholder')}
                                />
                            </div>
                            <InputError message={errors.content} className="mt-2" />
                        </div>

                        {/* School */}
                        {schools && schools.length > 0 && (
                            <div>
                                <InputLabel htmlFor="school_id" value={t('adminPublicationCreatePage.form.schoolLabel')} />
                                <select
                                    id="school_id"
                                    value={data.school_id}
                                    onChange={(e) => setData('school_id', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#A3C042] focus:ring-[#A3C042]"
                                >
                                    <option value="">{t('adminPublicationCreatePage.form.schoolPlaceholder')}</option>
                                    {schools.map((school) => (
                                        <option key={school.id} value={school.id}>
                                            {school.name}
                                        </option>
                                    ))}
                                </select>
                                <InputError message={errors.school_id} className="mt-2" />
                            </div>
                        )}

                        {/* Cover Image */}
                        <div>
                            <InputLabel htmlFor="cover_image" value={t('adminPublicationCreatePage.form.coverImageLabel')} />
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
                                            alt={t('adminPublicationCreatePage.form.coverPreviewAlt')}
                                            className="h-48 w-48 rounded-lg border border-gray-300 object-cover"
                                            onError={() => setImageLoadError(true)}
                                        />
                                    </div>
                                )}
                            </div>
                            <InputError message={errors.cover_image} className="mt-2" />
                        </div>

                        {/* PDF File */}
                        <div>
                            <InputLabel htmlFor="file" value={t('adminPublicationCreatePage.form.fileLabel')} />
                            <div className="mt-1">
                                <input
                                    id="file"
                                    type="file"
                                    accept=".pdf"
                                    onChange={handleFileChange}
                                    className="block w-full text-sm text-gray-500 file:ms-4 file:rounded-md file:border-0 file:bg-blue-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-200"
                                />
                                {publication?.file && !fileName && (
                                    <div className="mt-2 rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-600">
                                        <p>الملف الحالي متاح —{' '}
                                            <a
                                                href={getPublicationFileUrl(publication.file) || '#'}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="font-medium text-[#A3C042] hover:underline"
                                            >
                                                تحميل
                                            </a>
                                        </p>
                                    </div>
                                )}
                                {fileName && (
                                    <p className="mt-2 text-sm text-gray-600">
                                        {t('adminPublicationCreatePage.form.selectedFile', { name: fileName })}
                                    </p>
                                )}
                            </div>
                            <InputError message={errors.file} className="mt-2" />
                        </div>

                        {/* YouTube URL */}
                        <div>
                            <InputLabel htmlFor="youtube_url" value={t('adminPublicationCreatePage.form.youtubeUrlLabel')} />
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
                            <p className="mt-1 text-xs text-gray-500">{t('adminPublicationCreatePage.form.youtubeUrlHint')}</p>
                            <InputError message={errors.youtube_url} className="mt-2" />
                        </div>

                        {/* Issue Number */}
                        <div>
                            <InputLabel htmlFor="issue_number" value={t('adminPublicationCreatePage.form.issueNumberLabel')} />
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
                            />
                            <InputError message={errors.publisher_name} className="mt-2" />
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-end gap-4 border-t border-gray-200 pt-4">
                            <Link
                                href={route('admin.publications.show', publication.id)}
                                className="rounded-lg border border-gray-300 px-6 py-2 text-gray-700 transition hover:bg-gray-50"
                            >
                                {t('common.cancel')}
                            </Link>
                            <PrimaryButton disabled={processing} className="bg-[#A3C042]">
                                {processing ? (
                                    <>
                                        <FaSpinner className="me-2 inline-block animate-spin" />
                                        {t('adminPublicationCreatePage.actions.saving')}
                                    </>
                                ) : (
                                    <>
                                        <FaUpload className="me-2 inline-block" />
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
