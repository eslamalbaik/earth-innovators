import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { useRef, useState } from 'react';
import {
    FaCloudUploadAlt,
    FaFile,
    FaSpinner,
    FaTrash,
} from 'react-icons/fa';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { useToast } from '@/Contexts/ToastContext';
import { useBackIcon, useTranslation } from '@/i18n';

const FILE_MAX_SIZE = 10 * 1024 * 1024;
const IMAGE_MAX_SIZE = 5 * 1024 * 1024;

const FILE_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'video/mp4',
    'video/avi',
    'video/mov',
    'application/zip',
    'application/x-rar-compressed',
];

const IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];

export default function EditSchoolProject({ auth, project }) {
    const { t, language } = useTranslation();
    const BackIcon = useBackIcon();
    const { showError, showSuccess } = useToast();
    const [fileList, setFileList] = useState([]);
    const [imageList, setImageList] = useState([]);
    const [existingFiles, setExistingFiles] = useState(project?.files || []);
    const [existingImages, setExistingImages] = useState(project?.images || []);
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef(null);
    const imageInputRef = useRef(null);

    const { data, setData, processing, errors } = useForm({
        title: project?.title || '',
        description: project?.description || '',
        category: project?.category || 'other',
        files: [],
        images: [],
        report: project?.report || '',
        existing_files: project?.files || [],
        existing_images: project?.images || [],
    });

    const validateFiles = (files) => Array.from(files).filter((file) => {
        if (file.size > FILE_MAX_SIZE) {
            showError(t('schoolProjectEditPage.errors.fileTooLarge', { name: file.name, maxMb: 10 }));
            return false;
        }

        if (!FILE_TYPES.includes(file.type)) {
            showError(t('schoolProjectEditPage.errors.fileTypeNotSupported', { name: file.name }));
            return false;
        }

        return true;
    });

    const validateImages = (files) => Array.from(files).filter((file) => {
        if (file.size > IMAGE_MAX_SIZE) {
            showError(t('schoolProjectEditPage.errors.imageTooLarge', { name: file.name, maxMb: 5 }));
            return false;
        }

        if (!IMAGE_TYPES.includes(file.type)) {
            showError(t('schoolProjectEditPage.errors.imageTypeNotSupported', { name: file.name }));
            return false;
        }

        return true;
    });

    const handleFiles = (files) => {
        const validFiles = validateFiles(files);

        if (validFiles.length === 0) {
            return;
        }

        setFileList((previous) => [
            ...previous,
            ...validFiles.map((file) => ({
                file,
                id: Date.now() + Math.random(),
                name: file.name,
                size: file.size,
            })),
        ]);

        setData('files', [...data.files, ...validFiles]);
    };

    const handleImages = (files) => {
        const validImages = validateImages(files);

        if (validImages.length === 0) {
            return;
        }

        setImageList((previous) => [
            ...previous,
            ...validImages.map((file) => ({
                file,
                id: Date.now() + Math.random(),
                name: file.name,
                size: file.size,
                preview: URL.createObjectURL(file),
            })),
        ]);

        setData('images', [...data.images, ...validImages]);
    };

    const removeFile = (id) => {
        setFileList((previous) => {
            const nextList = previous.filter((item) => item.id !== id);
            setData('files', nextList.map((item) => item.file));
            return nextList;
        });
    };

    const removeImage = (id) => {
        setImageList((previous) => {
            const imageItem = previous.find((item) => item.id === id);

            if (imageItem?.preview) {
                URL.revokeObjectURL(imageItem.preview);
            }

            const nextList = previous.filter((item) => item.id !== id);
            setData('images', nextList.map((item) => item.file));
            return nextList;
        });
    };

    const removeExistingFile = (index) => {
        setExistingFiles((previous) => {
            const nextFiles = previous.filter((_, itemIndex) => itemIndex !== index);
            setData('existing_files', nextFiles);
            return nextFiles;
        });
    };

    const removeExistingImage = (index) => {
        setExistingImages((previous) => {
            const nextImages = previous.filter((_, itemIndex) => itemIndex !== index);
            setData('existing_images', nextImages);
            return nextImages;
        });
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        if (!data.title || !data.description || !data.category) {
            showError(t('schoolProjectEditPage.alerts.requiredFields'));
            return;
        }

        const formData = new FormData();
        formData.append('title', data.title || '');
        formData.append('description', data.description || '');
        formData.append('category', data.category || 'other');

        if (data.report) {
            formData.append('report', data.report);
        }

        existingFiles.forEach((file, index) => {
            formData.append(`existing_files[${index}]`, file);
        });

        existingImages.forEach((image, index) => {
            formData.append(`existing_images[${index}]`, image);
        });

        data.files.forEach((file) => {
            if (file instanceof File) {
                formData.append('files[]', file);
            }
        });

        data.images.forEach((image) => {
            if (image instanceof File) {
                formData.append('images[]', image);
            }
        });

        formData.append('_method', 'PUT');

        router.post(`/school/projects/${project.id}`, formData, {
            forceFormData: true,
            preserveScroll: false,
            onSuccess: () => {
                showSuccess(t('toastMessages.schoolProjectUpdatedSuccess'));
                router.visit('/school/projects');
            },
            onError: (formErrors) => {
                const errorMessage = formErrors.message || Object.values(formErrors)[0] || t('toastMessages.schoolProjectUpdateError');
                showError(Array.isArray(errorMessage) ? errorMessage[0] : errorMessage);
            },
        });
    };

    const categoryOptions = [
        { value: 'science', label: t('common.categories.science') },
        { value: 'technology', label: t('common.categories.technology') },
        { value: 'engineering', label: t('common.categories.engineering') },
        { value: 'mathematics', label: t('common.categories.mathematics') },
        { value: 'arts', label: t('common.categories.arts') },
        { value: 'other', label: t('common.categories.other') },
    ];

    return (
        <DashboardLayout auth={auth} header={t('schoolProjectEditPage.title')}>
            <Head title={t('schoolProjectEditPage.pageTitle', { appName: t('common.appName') })} />

            <div dir={language === 'ar' ? 'rtl' : 'ltr'} className="mx-auto max-w-4xl">
                <Link
                    href="/school/projects"
                    className="mb-6 inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
                >
                    <BackIcon />
                    <span>{t('schoolProjectEditPage.actions.backToProjects')}</span>
                </Link>

                <form onSubmit={handleSubmit} className="rounded-xl bg-white p-6 shadow-lg">
                    <div className="space-y-6">
                        <div>
                            <InputLabel htmlFor="title" value={t('schoolProjectsCreatePage.form.titleLabel')} />
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
                            <InputLabel htmlFor="description" value={t('schoolProjectsCreatePage.form.descriptionLabel')} />
                            <textarea
                                id="description"
                                value={data.description}
                                onChange={(event) => setData('description', event.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#A3C042] focus:ring focus:ring-[#A3C042] focus:ring-opacity-50"
                                rows="6"
                                required
                            />
                            <InputError message={errors.description} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="category" value={t('schoolProjectsCreatePage.form.categoryLabel')} />
                            <select
                                id="category"
                                value={data.category}
                                onChange={(event) => setData('category', event.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#A3C042] focus:ring focus:ring-[#A3C042] focus:ring-opacity-50"
                                required
                            >
                                {categoryOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                            <InputError message={errors.category} className="mt-2" />
                        </div>

                        {existingImages.length > 0 && (
                            <div>
                                <InputLabel value={t('schoolProjectEditPage.form.existingImagesLabel')} />
                                <div className="mt-2 grid grid-cols-2 gap-4 md:grid-cols-4">
                                    {existingImages.map((image, index) => (
                                        <div key={`${image}-${index}`} className="relative">
                                            <img
                                                src={image.startsWith('http') ? image : `/storage/${image}`}
                                                alt={t('schoolProjectEditPage.imageAlt', { number: index + 1 })}
                                                className="h-32 w-full rounded-lg object-cover"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeExistingImage(index)}
                                                className="absolute left-2 top-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
                                            >
                                                <FaTrash className="text-xs" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div>
                            <InputLabel value={t('schoolProjectEditPage.form.newImagesLabel')} />
                            <div
                                className={`mt-2 rounded-lg border-2 border-dashed p-6 text-center transition ${
                                    dragActive ? 'border-[#A3C042] bg-green-50' : 'border-gray-300'
                                }`}
                                onDragEnter={(event) => {
                                    event.preventDefault();
                                    setDragActive(true);
                                }}
                                onDragLeave={(event) => {
                                    event.preventDefault();
                                    setDragActive(false);
                                }}
                                onDragOver={(event) => event.preventDefault()}
                                onDrop={(event) => {
                                    event.preventDefault();
                                    setDragActive(false);
                                    handleImages(event.dataTransfer.files);
                                }}
                            >
                                <FaCloudUploadAlt className="mx-auto mb-2 text-4xl text-gray-400" />
                                <p className="mb-2 text-gray-600">{t('schoolProjectEditPage.placeholders.imageDropzone')}</p>
                                <button
                                    type="button"
                                    onClick={() => imageInputRef.current?.click()}
                                    className="font-medium text-[#A3C042] hover:text-legacy-blue"
                                >
                                    {t('schoolProjectEditPage.actions.chooseImages')}
                                </button>
                                <input
                                    ref={imageInputRef}
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={(event) => {
                                        if (event.target.files) {
                                            handleImages(event.target.files);
                                        }
                                    }}
                                    className="hidden"
                                />
                            </div>

                            {imageList.length > 0 && (
                                <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
                                    {imageList.map((item) => (
                                        <div key={item.id} className="relative">
                                            <img
                                                src={item.preview}
                                                alt={item.name}
                                                className="h-32 w-full rounded-lg object-cover"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeImage(item.id)}
                                                className="absolute left-2 top-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
                                            >
                                                <FaTrash className="text-xs" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {existingFiles.length > 0 && (
                            <div>
                                <InputLabel value={t('schoolProjectEditPage.form.existingFilesLabel')} />
                                <div className="mt-2 space-y-2">
                                    {existingFiles.map((file, index) => (
                                        <div key={`${file}-${index}`} className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
                                            <div className="flex items-center gap-2">
                                                <FaFile className="text-gray-400" />
                                                <span className="text-sm text-gray-700">
                                                    {typeof file === 'string' ? file.split('/').pop() : file}
                                                </span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => removeExistingFile(index)}
                                                className="text-red-500 hover:text-red-700"
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div>
                            <InputLabel value={t('schoolProjectEditPage.form.newFilesLabel')} />
                            <div
                                className={`mt-2 rounded-lg border-2 border-dashed p-6 text-center transition ${
                                    dragActive ? 'border-[#A3C042] bg-green-50' : 'border-gray-300'
                                }`}
                                onDragEnter={(event) => {
                                    event.preventDefault();
                                    setDragActive(true);
                                }}
                                onDragLeave={(event) => {
                                    event.preventDefault();
                                    setDragActive(false);
                                }}
                                onDragOver={(event) => event.preventDefault()}
                                onDrop={(event) => {
                                    event.preventDefault();
                                    setDragActive(false);
                                    handleFiles(event.dataTransfer.files);
                                }}
                            >
                                <FaCloudUploadAlt className="mx-auto mb-2 text-4xl text-gray-400" />
                                <p className="mb-2 text-gray-600">{t('schoolProjectEditPage.placeholders.fileDropzone')}</p>
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="font-medium text-[#A3C042] hover:text-legacy-blue"
                                >
                                    {t('schoolProjectEditPage.actions.chooseFiles')}
                                </button>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    multiple
                                    onChange={(event) => {
                                        if (event.target.files) {
                                            handleFiles(event.target.files);
                                        }
                                    }}
                                    className="hidden"
                                />
                            </div>

                            {fileList.length > 0 && (
                                <div className="mt-4 space-y-2">
                                    {fileList.map((item) => (
                                        <div key={item.id} className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
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

                        <div>
                            <InputLabel htmlFor="report" value={t('schoolProjectsCreatePage.form.reportLabel')} />
                            <textarea
                                id="report"
                                value={data.report}
                                onChange={(event) => setData('report', event.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#A3C042] focus:ring focus:ring-[#A3C042] focus:ring-opacity-50"
                                rows="4"
                            />
                            <InputError message={errors.report} className="mt-2" />
                        </div>

                        <div className="flex items-center justify-end gap-4 pt-4">
                            <Link
                                href="/school/projects"
                                className="rounded-lg border border-gray-300 px-6 py-2 text-gray-700 hover:bg-gray-50"
                            >
                                {t('common.cancel')}
                            </Link>
                            <PrimaryButton type="submit" disabled={processing}>
                                {processing ? (
                                    <>
                                        <FaSpinner className="ms-2 animate-spin" />
                                        {t('schoolProjectEditPage.actions.saving')}
                                    </>
                                ) : (
                                    t('schoolProjectEditPage.actions.saveChanges')
                                )}
                            </PrimaryButton>
                        </div>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
}
