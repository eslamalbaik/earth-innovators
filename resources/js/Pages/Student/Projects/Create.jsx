import { Head, useForm, router } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import {
    FaCalendar,
    FaCheckCircle,
    FaCloudUploadAlt,
    FaDownload,
    FaFile,
    FaFilePdf,
    FaFolderOpen,
    FaImage,
    FaStar,
    FaTrash,
    FaUpload,
} from 'react-icons/fa';
import MobileTopBar from '@/Components/Mobile/MobileTopBar';
import MobileBottomNav from '@/Components/Mobile/MobileBottomNav';
import { useToast } from '@/Contexts/ToastContext';
import { useTranslation } from '@/i18n';

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
const DOCUMENT_EXTENSIONS = ['pdf', 'doc', 'docx'];
const ARCHIVE_EXTENSIONS = ['zip', 'rar'];
const ATTACHMENT_EXTENSIONS = [...IMAGE_EXTENSIONS, 'mp4', 'avi', 'mov', ...DOCUMENT_EXTENSIONS, ...ARCHIVE_EXTENSIONS];
const DOCUMENT_MIME_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];
const ATTACHMENT_MIME_TYPES = [
    ...DOCUMENT_MIME_TYPES,
    'application/zip',
    'application/x-zip-compressed',
    'application/x-rar-compressed',
    'application/vnd.rar',
];
const FILE_RULES = {
    cover: {
        allowedExtensions: IMAGE_EXTENSIONS,
        mimePrefixes: ['image/'],
    },
    document: {
        allowedExtensions: DOCUMENT_EXTENSIONS,
        mimeTypes: DOCUMENT_MIME_TYPES,
    },
    attachments: {
        allowedExtensions: ATTACHMENT_EXTENSIONS,
        mimeTypes: ATTACHMENT_MIME_TYPES,
        mimePrefixes: ['image/', 'video/'],
    },
};

function getFileExtension(fileName = '') {
    return fileName.split('.').pop()?.toLowerCase() || '';
}

function matchesFileRules(file, rules) {
    const extension = getFileExtension(file?.name);
    const mimeType = (file?.type || '').toLowerCase();

    if (rules.allowedExtensions?.includes(extension)) {
        return true;
    }

    if (rules.mimeTypes?.includes(mimeType)) {
        return true;
    }

    return rules.mimePrefixes?.some((prefix) => mimeType.startsWith(prefix)) ?? false;
}

function resolveSubmissionFileName(file) {
    if (!file) return '';
    if (typeof file === 'string') return file.split('/').pop() || file;
    if (typeof file === 'object') {
        if (file.name) return file.name;
        if (file.filename) return file.filename;
        if (file.path) return file.path.split('/').pop() || file.path;
        if (file.url) return file.url.split('/').pop() || file.url;
    }
    return String(file);
}

export default function StudentProjectCreate({ auth, projects = [], message, noticeKey, uploadBlockedKey, submissions = [] }) {
    const { t, language } = useTranslation();
    const { showError, showSuccess } = useToast();
    const { data, setData, post, processing, errors } = useForm({
        project_id: '',
        files: [],
        comment: '',
    });

    const [coverFile, setCoverFile] = useState(null);
    const [documentFile, setDocumentFile] = useState(null);
    const [attachmentFiles, setAttachmentFiles] = useState([]);
    const [dragActive, setDragActive] = useState(false);
    const coverInputRef = useRef(null);
    const documentInputRef = useRef(null);
    const attachmentsInputRef = useRef(null);
    const objectUrlsRef = useRef(new Set());
    const [activeTab, setActiveTab] = useState('upload'); // 'upload' or 'evaluation'
    const [selectedSubmission, setSelectedSubmission] = useState(null);

    const uploadDisabled = !!uploadBlockedKey || projects.length === 0;
    const selectedProject = projects.find((project) => String(project.id) === String(data.project_id)) || null;
    const selectedFilesCount = (coverFile ? 1 : 0) + (documentFile ? 1 : 0) + attachmentFiles.length;
    const canSubmit = !!selectedProject && selectedFilesCount > 0;

    useEffect(() => {
        setData(
            'files',
            [coverFile?.file, documentFile?.file, ...attachmentFiles.map((fileItem) => fileItem.file)].filter(Boolean)
        );
    }, [coverFile, documentFile, attachmentFiles, setData]);

    useEffect(() => () => {
        objectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
        objectUrlsRef.current.clear();
    }, []);

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const revokePreviewUrl = (fileItem) => {
        if (!fileItem?.previewUrl) {
            return;
        }

        URL.revokeObjectURL(fileItem.previewUrl);
        objectUrlsRef.current.delete(fileItem.previewUrl);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (uploadDisabled) {
            return;
        }

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFiles(e.dataTransfer.files, 'attachments');
        }
    };

    const createManagedFile = (file, role) => {
        const previewUrl = role === 'cover' ? URL.createObjectURL(file) : null;
        if (previewUrl) {
            objectUrlsRef.current.add(previewUrl);
        }

        return {
            id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
            file,
            name: file.name,
            size: file.size,
            sizeLabel: formatFileSize(file.size),
            type: file.type,
            role,
            previewUrl,
        };
    };

    const handleFiles = (files, role = 'attachments') => {
        if (uploadDisabled) {
            return;
        }

        const rules = FILE_RULES[role];
        const validFiles = Array.from(files || []).filter((file) => {
            if (file.size > MAX_FILE_SIZE) {
                showError(t('studentProjects.create.errors.fileTooLarge', { name: file.name }));
                return false;
            }

            if (!matchesFileRules(file, rules)) {
                showError(t('studentProjects.create.errors.fileTypeUnsupported', { name: file.name }));
                return false;
            }

            return true;
        });

        if (validFiles.length === 0) {
            return;
        }

        if (role === 'cover') {
            revokePreviewUrl(coverFile);
            setCoverFile(createManagedFile(validFiles[0], 'cover'));
            return;
        }

        if (role === 'document') {
            revokePreviewUrl(documentFile);
            setDocumentFile(createManagedFile(validFiles[0], 'document'));
            return;
        }

        setAttachmentFiles((prev) => [...prev, ...validFiles.map((file) => createManagedFile(file, 'attachment'))]);
    };

    const handleInputChange = (e, role = 'attachments') => {
        if (e.target.files && e.target.files.length > 0) {
            handleFiles(e.target.files, role);
        }
        e.target.value = '';
    };

    const removeFile = (role, fileId = null) => {
        if (role === 'cover') {
            revokePreviewUrl(coverFile);
            setCoverFile(null);
            return;
        }

        if (role === 'document') {
            revokePreviewUrl(documentFile);
            setDocumentFile(null);
            return;
        }

        setAttachmentFiles((prev) => {
            const target = prev.find((fileItem) => fileItem.id === fileId);
            revokePreviewUrl(target);
            return prev.filter((fileItem) => fileItem.id !== fileId);
        });
    };

    const formatFileSize = (bytes) => {
        if (bytes < 1024) return t('studentProjects.create.fileSize.bytes', { n: bytes });
        if (bytes < 1024 * 1024) {
            return t('studentProjects.create.fileSize.kb', { n: (bytes / 1024).toFixed(2) });
        }
        return t('studentProjects.create.fileSize.mb', { n: (bytes / (1024 * 1024)).toFixed(2) });
    };

    const submit = (e) => {
        e.preventDefault();

        if (uploadDisabled) {
            showError(t('studentProjects.create.blockedToast'));
            return;
        }

        if (!data.project_id) {
            showError(t('studentProjects.create.errors.selectProject'));
            return;
        }

        if (selectedFilesCount === 0) {
            showError(t('studentProjects.create.errors.filesRequired'));
            return;
        }

        post(`/projects/${data.project_id}/submissions`, {
            forceFormData: true,
            onSuccess: () => {
                showSuccess(t('studentProjects.create.success'));
                router.visit('/student/projects');
            },
            onError: (errs) => {
                if (errs.error) {
                    showError(errs.error);
                } else {
                    showError(t('studentProjects.create.errors.generic'));
                }
            },
        });
    };

    const ProjectSelectionList = () => (
        <div>
            <label className="mb-2 block text-sm font-bold text-gray-900">{t('studentProjects.create.fields.selectProject')}</label>
            <div className="max-h-64 space-y-2 overflow-y-auto rounded-xl border border-gray-100 bg-gray-50/60 p-2">
                {projects.map((project) => {
                    const isSelected = String(data.project_id) === String(project.id);
                    const projectTitle = project.title || t('studentProjects.create.fields.projectOption', { id: project.id });
                    return (
                        <button
                            key={project.id}
                            type="button"
                            disabled={uploadDisabled}
                            onClick={() => setData('project_id', String(project.id))}
                            className={`w-full rounded-xl border p-3 text-start transition ${
                                isSelected
                                    ? 'border-[#A3C042] bg-[#A3C042]/10'
                                    : 'border-gray-200 bg-white hover:bg-gray-50'
                            } disabled:cursor-not-allowed disabled:opacity-50`}
                        >
                            <div className="flex items-start gap-3">
                                {project.thumbnail ? (
                                    <img src={project.thumbnail} alt={projectTitle} className="h-14 w-14 rounded-xl object-cover" />
                                ) : (
                                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gray-100 text-gray-400">
                                        <FaFolderOpen />
                                    </div>
                                )}
                                <div className="min-w-0 flex-1">
                                    <div className="line-clamp-1 text-sm font-semibold text-gray-900">{projectTitle}</div>
                                    {project.description && (
                                        <div className="mt-1 line-clamp-2 text-xs text-gray-500">
                                            {project.description}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>
            {errors.project_id && <p className="mt-1 text-xs text-red-500">{errors.project_id}</p>}
        </div>
    );

    const SelectedProjectCard = () => (
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center gap-2 text-sm font-bold text-gray-900">
                <FaFolderOpen className="text-[#A3C042]" />
                {t('studentProjects.create.sections.selectedProject')}
            </div>
            {selectedProject ? (
                <div className="flex items-start gap-4">
                    {selectedProject.thumbnail ? (
                        <img
                            src={selectedProject.thumbnail}
                            alt={selectedProject.title || t('studentProjects.create.fields.projectOption', { id: selectedProject.id })}
                            className="h-20 w-20 rounded-2xl object-cover"
                        />
                    ) : (
                        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
                            <FaFolderOpen className="text-2xl" />
                        </div>
                    )}
                    <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-bold text-gray-900">
                            {selectedProject.title || t('studentProjects.create.fields.projectOption', { id: selectedProject.id })}
                        </h3>
                        <p className="mt-1 line-clamp-3 text-sm text-gray-600">
                            {selectedProject.description || t('studentProjects.create.preview.noProjectDescription')}
                        </p>
                    </div>
                </div>
            ) : (
                <p className="text-sm text-gray-500">{t('studentProjects.create.preview.noProject')}</p>
            )}
        </div>
    );

    const AssetUploadCard = ({ title, hint, buttonLabel, accept, inputRef, currentFile, role }) => (
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-bold text-gray-900">{title}</h4>
                    <p className="mt-1 text-xs text-gray-500">{hint}</p>
                </div>
                <button
                    type="button"
                    onClick={() => !uploadDisabled && inputRef.current?.click()}
                    disabled={uploadDisabled}
                    className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-700 transition hover:border-[#A3C042]/40 hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <FaUpload className="text-[#A3C042]" />
                    {buttonLabel}
                </button>
                <input
                    ref={inputRef}
                    type="file"
                    accept={accept}
                    onChange={(e) => handleInputChange(e, role)}
                    className="hidden"
                    disabled={uploadDisabled}
                />
            </div>

            {currentFile && (
                <div className="mt-4 flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-3 py-3">
                    <div className="flex min-w-0 items-center gap-3">
                        {getFileIcon(currentFile.name)}
                        <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-gray-900">{currentFile.name}</p>
                            <p className="text-[11px] text-gray-500">{currentFile.sizeLabel}</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={() => removeFile(role)}
                        className="rounded-lg p-2 text-red-500 transition hover:bg-red-50 hover:text-red-700"
                        aria-label={t('studentProjects.create.removeFileAria')}
                    >
                        <FaTrash className="text-sm" />
                    </button>
                </div>
            )}
        </div>
    );

    const SubmissionPreview = () => (
        <div className="rounded-2xl border border-gray-100 bg-gray-50/80 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <h3 className="text-sm font-bold text-gray-900">{t('studentProjects.create.preview.title')}</h3>
                    <p className="mt-1 text-xs text-gray-500">{t('studentProjects.create.preview.subtitle')}</p>
                </div>
                <span
                    className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${
                        canSubmit ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-800'
                    }`}
                >
                    <FaCheckCircle />
                    {canSubmit ? t('studentProjects.create.preview.ready') : t('studentProjects.create.preview.incomplete')}
                </span>
            </div>

            <div className="mt-4 grid gap-4 lg:grid-cols-2">
                <div className="rounded-xl border border-gray-100 bg-white p-4">
                    <div className="text-xs font-semibold text-gray-500">{t('studentProjects.create.preview.project')}</div>
                    <p className="mt-2 text-sm font-semibold text-gray-900">
                        {selectedProject
                            ? selectedProject.title || t('studentProjects.create.fields.projectOption', { id: selectedProject.id })
                            : t('studentProjects.create.preview.noProject')}
                    </p>
                </div>
                <div className="rounded-xl border border-gray-100 bg-white p-4">
                    <div className="text-xs font-semibold text-gray-500">{t('studentProjects.create.preview.comment')}</div>
                    <p className="mt-2 whitespace-pre-line text-sm text-gray-700">
                        {data.comment.trim() || t('studentProjects.create.preview.noComment')}
                    </p>
                </div>
            </div>

            <div className="mt-4 grid gap-4 lg:grid-cols-3">
                <div className="rounded-xl border border-gray-100 bg-white p-4">
                    <div className="mb-2 text-xs font-semibold text-gray-500">{t('studentProjects.create.preview.coverLabel')}</div>
                    {coverFile ? (
                        <>
                            {coverFile.previewUrl && (
                                <img src={coverFile.previewUrl} alt={coverFile.name} className="h-32 w-full rounded-xl object-cover" />
                            )}
                            <p className="mt-3 truncate text-sm font-semibold text-gray-900">{coverFile.name}</p>
                            <p className="text-[11px] text-gray-500">{coverFile.sizeLabel}</p>
                        </>
                    ) : (
                        <p className="text-sm text-gray-500">{t('studentProjects.create.preview.noCover')}</p>
                    )}
                </div>

                <div className="rounded-xl border border-gray-100 bg-white p-4">
                    <div className="mb-2 text-xs font-semibold text-gray-500">{t('studentProjects.create.preview.documentLabel')}</div>
                    {documentFile ? (
                        <div className="flex items-center gap-3 rounded-xl bg-gray-50 px-3 py-3">
                            {getFileIcon(documentFile.name)}
                            <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-gray-900">{documentFile.name}</p>
                                <p className="text-[11px] text-gray-500">{documentFile.sizeLabel}</p>
                            </div>
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500">{t('studentProjects.create.preview.noDocument')}</p>
                    )}
                </div>

                <div className="rounded-xl border border-gray-100 bg-white p-4">
                    <div className="mb-2 text-xs font-semibold text-gray-500">{t('studentProjects.create.preview.supportingFilesLabel')}</div>
                    {attachmentFiles.length > 0 ? (
                        <div className="space-y-2">
                            {attachmentFiles.map((fileItem) => (
                                <div key={fileItem.id} className="flex items-center gap-3 rounded-xl bg-gray-50 px-3 py-3">
                                    {getFileIcon(fileItem.name)}
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-semibold text-gray-900">{fileItem.name}</p>
                                        <p className="text-[11px] text-gray-500">{fileItem.sizeLabel}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500">{t('studentProjects.create.preview.noSupportingFiles')}</p>
                    )}
                </div>
            </div>
        </div>
    );

    const ProjectUploadContent = ({ showProjectSelection = true } = {}) => (
        <form onSubmit={submit} className="space-y-4">
            {(noticeKey || message) && (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                    {noticeKey ? t(noticeKey) : message}
                </div>
            )}

            {uploadBlockedKey && (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900">
                    {t(uploadBlockedKey)}
                </div>
            )}

            {showProjectSelection && projects.length > 0 && <ProjectSelectionList />}
            <SelectedProjectCard />

            <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                <label className="mb-2 block text-sm font-bold text-gray-900">{t('studentProjects.create.fields.comment')}</label>
                <textarea
                    value={data.comment}
                    onChange={(e) => setData('comment', e.target.value)}
                    placeholder={t('studentProjects.create.fields.commentPlaceholder')}
                    rows={4}
                    disabled={uploadDisabled}
                    className="w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm focus:border-[#A3C042] focus:outline-none focus:ring-2 focus:ring-[#A3C042]/30 disabled:cursor-not-allowed disabled:opacity-50"
                />
                {errors.comment && <p className="mt-1 text-xs text-red-500">{errors.comment}</p>}
            </div>

            {/* File Upload */}
            <div className="space-y-4 rounded-2xl border border-gray-100 bg-gray-50/70 p-4">
                <div>
                    <h3 className="text-sm font-bold text-gray-900">{t('studentProjects.create.sections.submissionAssets')}</h3>
                    <p className="mt-1 text-xs text-gray-500">{t('studentProjects.create.preview.assetsSubtitle')}</p>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                    <AssetUploadCard
                        title={t('studentProjects.create.sections.coverImage')}
                        hint={t('studentProjects.create.hints.coverImage')}
                        buttonLabel={t('studentProjects.create.actions.chooseCover')}
                        accept="image/*"
                        inputRef={coverInputRef}
                        currentFile={coverFile}
                        role="cover"
                    />

                    <AssetUploadCard
                        title={t('studentProjects.create.sections.projectDocument')}
                        hint={t('studentProjects.create.hints.projectDocument')}
                        buttonLabel={t('studentProjects.create.actions.chooseDocument')}
                        accept=".pdf,.doc,.docx"
                        inputRef={documentInputRef}
                        currentFile={documentFile}
                        role="document"
                    />
                </div>

                <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                    <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                        <div>
                            <h4 className="text-sm font-bold text-gray-900">{t('studentProjects.create.sections.supportingFiles')}</h4>
                            <p className="mt-1 text-xs text-gray-500">{t('studentProjects.create.hints.supportingFiles')}</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => !uploadDisabled && attachmentsInputRef.current?.click()}
                            disabled={uploadDisabled}
                            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-700 transition hover:border-[#A3C042]/40 hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <FaUpload className="text-[#A3C042]" />
                            {t('studentProjects.create.actions.addSupportingFiles')}
                        </button>
                    </div>
                    <div
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={uploadDisabled ? undefined : handleDrop}
                        onClick={() => !uploadDisabled && attachmentsInputRef.current?.click()}
                        className={`rounded-2xl border-2 border-dashed p-8 text-center transition ${uploadDisabled
                            ? 'cursor-not-allowed border-gray-100 bg-gray-100 opacity-70'
                            : `cursor-pointer ${dragActive
                                ? 'border-[#A3C042] bg-[#A3C042]/5'
                                : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                            }`}`}
                    >
                        <input
                            ref={attachmentsInputRef}
                            type="file"
                            multiple
                            onChange={(e) => handleInputChange(e, 'attachments')}
                            className="hidden"
                            accept="image/*,video/*,.pdf,.doc,.docx,.zip,.rar"
                            disabled={uploadDisabled}
                        />
                        <FaCloudUploadAlt className="mx-auto mb-3 text-4xl text-gray-400" />
                        <p className="mb-1 text-sm text-gray-700">{t('studentProjects.create.dropzoneHint')}</p>
                        <p className="text-xs text-gray-500">{t('studentProjects.create.dropzoneTypes')}</p>
                    </div>

                {/* File List */}
                    {attachmentFiles.length > 0 && (
                    <div className="mt-3 space-y-2">
                            {attachmentFiles.map((fileItem) => (
                            <div
                                key={fileItem.id}
                                className="flex items-center justify-between rounded-xl bg-gray-50 p-3"
                            >
                                <div className="flex min-w-0 flex-1 items-center gap-3">
                                    <span className="text-lg">
                                        {fileItem.type.startsWith('image/') ? '🖼️' :
                                            fileItem.type.startsWith('video/') ? '🎥' : '📄'}
                                    </span>
                                    <div className="min-w-0">
                                        <p className="text-xs font-semibold text-gray-900 truncate">
                                            {fileItem.name}
                                        </p>
                                        <p className="text-[10px] text-gray-500">
                                            {fileItem.sizeLabel}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => removeFile('attachments', fileItem.id)}
                                    className="rounded-lg p-1 text-red-500 transition hover:bg-red-50 hover:text-red-700"
                                    aria-label={t('studentProjects.create.removeFileAria')}
                                >
                                    <FaTrash className="text-sm" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
                    {errors.files && <p className="mt-1 text-xs text-red-500">{errors.files}</p>}
                </div>
            </div>

            <SubmissionPreview />

            {/* Submit Button */}
            <button
                type="submit"
                disabled={processing || uploadDisabled}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#A3C042] text-sm font-bold text-white transition hover:bg-[#8CA635] disabled:cursor-not-allowed disabled:opacity-50"
            >
                {processing ? (
                    <>
                        <FaUpload className="animate-pulse" />
                        {t('studentProjects.create.uploading')}
                    </>
                ) : (
                    <>
                        <FaUpload />
                        {t('studentProjects.create.submit')}
                    </>
                )}
            </button>
        </form>
    );

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}/${month}/${day}`;
    };

    const getFileUrl = (filePath) => {
        if (!filePath) return '#';
        if (typeof filePath === 'string' && filePath.startsWith('http')) return filePath;
        if (typeof filePath === 'object') {
            if (filePath.url) return filePath.url;
            if (filePath.path) return filePath.path.startsWith('http') ? filePath.path : `/storage/${filePath.path}`;
            return '#';
        }
        return `/storage/${filePath}`;
    };

    const getFileIcon = (fileName) => {
        const ext = getFileExtension(fileName);
        if (ext === 'pdf') return <FaFilePdf className="text-red-500 text-xl" />;
        if (IMAGE_EXTENSIONS.includes(ext)) return <FaImage className="text-blue-500 text-xl" />;
        return <FaFile className="text-gray-500 text-xl" />;
    };

    const normalizeSubmissionFiles = (filesValue) => {
        if (!filesValue) return [];
        if (Array.isArray(filesValue)) return filesValue;

        if (typeof filesValue === 'string') {
            try {
                const parsed = JSON.parse(filesValue);
                return Array.isArray(parsed) ? parsed : [];
            } catch {
                return filesValue.trim() ? [filesValue] : [];
            }
        }

        if (typeof filesValue === 'object') {
            return [filesValue];
        }

        return [];
    };

    const getSubmissionFileName = (file) => {
        return resolveSubmissionFileName(file) || t('studentProjects.evaluation.unnamedProject');
    };

    const EvaluationContent = () => {
        const currentSubmission = selectedSubmission || (submissions.length > 0 ? submissions[0] : null);
        const submissionFiles = normalizeSubmissionFiles(currentSubmission?.files);

        if (submissions.length === 0) {
            return (
                <div className="text-center py-12">
                    <p className="text-gray-600 text-sm">{t('studentProjects.evaluation.empty')}</p>
                </div>
            );
        }

        return (
            <div className="space-y-4">
                {/* Header */}
                <div className="rounded-2xl bg-[#eef8d6] px-4 py-3">
                    <h1 className="text-xl font-extrabold text-gray-900 text-center">{t('studentProjects.evaluation.title')}</h1>
                </div>

                {/* Selected Submission Details */}
                {currentSubmission && (
                    <div className="bg-white rounded-2xl border border-gray-100 p-4">
                        <div className="text-lg font-extrabold text-gray-900">
                            {currentSubmission.project?.title || t('studentProjects.evaluation.unnamedProject')}
                        </div>
                        {currentSubmission.project?.description && (
                            <div className="mt-1 text-sm text-gray-600">
                                {currentSubmission.project.description}
                            </div>
                        )}

                        <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                            <div className="flex items-center gap-2">
                                <FaCalendar className="text-gray-400" />
                                <span>{formatDate(currentSubmission.submitted_at)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span>
                                    {t('studentProjects.evaluation.studentLabel', {
                                        name: auth?.user?.name || t('studentProjects.evaluation.unknownUser'),
                                    })}
                                </span>
                            </div>
                        </div>

                        {/* Attached Files */}
                        {submissionFiles.length > 0 && (
                            <div className="mt-4">
                                <div className="text-sm font-bold text-gray-900 mb-2">{t('studentProjects.evaluation.attachedFiles')}</div>
                                <div className="space-y-2">
                                    {submissionFiles.map((file, index) => {
                                        const fileName = getSubmissionFileName(file);
                                        return (
                                            <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                                                {getFileIcon(fileName)}
                                                <span className="flex-1 text-sm text-gray-900">{fileName}</span>
                                                <a
                                                    href={getFileUrl(file)}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 hover:text-blue-700"
                                                >
                                                    <FaDownload />
                                                </a>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Rating */}
                        {currentSubmission.rating !== null && currentSubmission.rating !== undefined && (
                            <div className="mt-4">
                                <div className="text-sm font-bold text-gray-900 mb-2">{t('studentProjects.evaluation.rating')}</div>
                                <div className="flex items-center gap-2" dir="ltr">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <FaStar
                                            key={star}
                                            className={`text-2xl ${star <= Math.round(currentSubmission.rating)
                                                ? 'text-yellow-400 fill-current'
                                                : 'text-gray-300'
                                                }`}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Comments */}
                        <div className="mt-4">
                            <div className="text-sm font-bold text-gray-900 mb-2">{t('studentProjects.evaluation.comments')}</div>
                            <div className="bg-gray-50 rounded-xl p-4 mb-3 text-center text-gray-500 text-sm">
                                {currentSubmission.feedback ? currentSubmission.feedback : t('studentProjects.evaluation.noCommentsYet')}
                            </div>
                        </div>

                        {/* Evaluation Notes */}
                        {currentSubmission.feedback && (
                            <div className="mt-4">
                                <div className="text-sm font-bold text-gray-900 mb-2">{t('studentProjects.evaluation.evaluationNotes')}</div>
                                <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700">
                                    {currentSubmission.feedback}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Submitted Projects List - Mobile Only */}
                {submissions.length > 0 && (
                    <div className="bg-white rounded-2xl border border-gray-100 p-4 md:hidden">
                        <div className="text-sm font-bold text-gray-900 mb-3">{t('studentProjects.evaluation.submittedList')}</div>
                        <div className="space-y-2">
                            {submissions.map((sub) => (
                                <button
                                    key={sub.id}
                                    type="button"
                                    onClick={() => setSelectedSubmission(sub)}
                                    className={`w-full  p-3 rounded-xl border transition ${currentSubmission?.id === sub.id
                                        ? 'border-blue-500 bg-blue-50'
                                        : 'border-gray-100 bg-white hover:bg-gray-50'
                                        }`}
                                >
                                    <div className="text-sm font-semibold text-gray-900 line-clamp-1">
                                        {sub.project?.title || t('studentProjects.evaluation.unnamedProject')}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">
                                        {formatDate(sub.submitted_at)}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div dir={language === 'ar' ? 'rtl' : 'ltr'} className="min-h-screen bg-gray-50">
            <Head title={t('studentProjects.create.pageTitle')} />

            {/* Mobile View */}
            <div className="block md:hidden">
                <MobileTopBar
                    title={t('studentProjects.create.topBarTitle')}
                    unreadCount={auth?.unreadCount || 0}
                    onNotifications={() => router.visit('/notifications')}
                    onBack={() => router.visit('/student/projects')}
                    reverseOrder={false}
                />
                <main className="px-4 pb-24 pt-4 space-y-4">
                    {/* Tabs */}
                    <div className="bg-white rounded-2xl border border-gray-100 p-3">
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setActiveTab('evaluation')}
                                className={`rounded-xl py-2.5 text-sm font-bold transition ${activeTab === 'evaluation'
                                    ? 'bg-[#A3C042] text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                {t('studentProjects.create.tabs.evaluation')}
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveTab('upload')}
                                className={`rounded-xl py-2.5 text-sm font-bold transition ${activeTab === 'upload'
                                    ? 'bg-[#A3C042] text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                {t('studentProjects.create.tabs.upload')}
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="bg-white rounded-2xl border border-gray-100 p-4">
                        {activeTab === 'upload' ? (
                            ProjectUploadContent({ showProjectSelection: true })
                        ) : (
                            EvaluationContent()
                        )}
                    </div>
                </main>
                <MobileBottomNav active="projects" role={auth?.user?.role} isAuthed={!!auth?.user} user={auth?.user} />
            </div>

            {/* Desktop View */}
            <div className="hidden md:block">
                <MobileTopBar
                    title={t('studentProjects.create.topBarTitle')}
                    unreadCount={auth?.unreadCount || 0}
                    onNotifications={() => router.visit('/notifications')}
                    onBack={() => router.visit('/student/projects')}
                    reverseOrder={false}
                />
                <main className="mx-auto w-full max-w-6xl px-4 pb-24 pt-4">
                    <div className="space-y-4 lg:grid lg:grid-cols-12 lg:gap-6 lg:space-y-0">
                        {/* Left Column - Tabs and Main Content */}
                        <div className="lg:col-span-8 space-y-4">
                            {/* Tabs */}
                            <div className="bg-white rounded-2xl border border-gray-100 p-3">
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab('upload')}
                                        className={`rounded-xl py-2.5 text-sm font-bold transition ${activeTab === 'upload'
                                            ? 'bg-[#A3C042] text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                    >
                                        {t('studentProjects.create.tabs.upload')}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab('evaluation')}
                                        className={`rounded-xl py-2.5 text-sm font-bold transition ${activeTab === 'evaluation'
                                            ? 'bg-[#A3C042] text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                    >
                                        {t('studentProjects.create.tabs.evaluation')}
                                    </button>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="bg-white rounded-2xl border border-gray-100 p-6">
                                {activeTab === 'upload' ? (
                                    ProjectUploadContent({ showProjectSelection: false })
                                ) : (
                                    EvaluationContent()
                                )}
                            </div>
                        </div>

                        {/* Right Column - Context Lists (evaluation/upload) */}
                        {((activeTab === 'evaluation' && submissions.length > 0) || (activeTab === 'upload' && projects.length > 0)) && (
                            <div className="lg:col-span-4">
                                <div className="bg-white rounded-2xl border border-gray-100 p-4 sticky top-24">
                                    {activeTab === 'upload' ? (
                                        <ProjectSelectionList />
                                    ) : (
                                        <>
                                            <div className="text-sm font-bold text-gray-900 mb-3">{t('studentProjects.evaluation.submittedList')}</div>
                                            <div className="space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto">
                                                {submissions.map((sub) => {
                                                    const currentSubmission = selectedSubmission || (submissions.length > 0 ? submissions[0] : null);
                                                    return (
                                                        <button
                                                            key={sub.id}
                                                            type="button"
                                                            onClick={() => setSelectedSubmission(sub)}
                                                            className={`w-full  p-3 rounded-xl border transition ${currentSubmission?.id === sub.id
                                                                ? 'border-blue-500 bg-blue-50'
                                                                : 'border-gray-100 bg-white hover:bg-gray-50'
                                                                }`}
                                                        >
                                                            <div className="text-sm font-semibold text-gray-900 line-clamp-1">
                                                                {sub.project?.title || t('studentProjects.evaluation.unnamedProject')}
                                                            </div>
                                                            <div className="text-xs text-gray-500 mt-1">
                                                                {formatDate(sub.submitted_at)}
                                                            </div>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </main>
                <MobileBottomNav active="projects" role={auth?.user?.role} isAuthed={!!auth?.user} user={auth?.user} />
            </div>
        </div>
    );
}

