import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, useForm, router, Link } from '@inertiajs/react';
import { useState, useRef } from 'react';
import { FaArrowLeft, FaUpload, FaCloudUploadAlt, FaFile, FaSpinner, FaTrash } from 'react-icons/fa';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import { useTranslation } from '@/i18n';

export default function CreateSchoolProject({ auth }) {
    const { t, language } = useTranslation();
    const { data, setData, post, processing, errors } = useForm({
        title: '',
        description: '',
        category: 'other',
        instructional_approach: '',
        grade: '',
        subject: '',
        thumbnail: null,
        project_document: null,
        files: [],
        images: [],
        report: '',
    });

    const [thumbnailFile, setThumbnailFile] = useState(null);
    const [projectDocumentFile, setProjectDocumentFile] = useState(null);
    const [fileList, setFileList] = useState([]);
    const [imageList, setImageList] = useState([]);
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef(null);
    const imageInputRef = useRef(null);
    const thumbnailInputRef = useRef(null);
    const projectDocumentInputRef = useRef(null);

    const handleFiles = (files) => {
        const fileArray = Array.from(files);
        const validFiles = fileArray.filter(file => {
            const maxSize = 10 * 1024 * 1024; // 10 MB
            const validTypes = [
                'application/pdf', 'application/msword', 
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'video/mp4', 'video/avi', 'video/mov',
                'application/zip', 'application/x-rar-compressed'
            ];
            
            if (file.size > maxSize) {
                alert(t('schoolProjectsCreatePage.errors.fileTooLarge', { name: file.name, maxMb: 10 }));
                return false;
            }
            
            if (!validTypes.includes(file.type)) {
                alert(t('schoolProjectsCreatePage.errors.fileTypeNotSupported', { name: file.name }));
                return false;
            }
            
            return true;
        });

        setFileList(prev => [...prev, ...validFiles.map(file => ({
            file,
            id: Date.now() + Math.random(),
            name: file.name,
            size: file.size,
        }))]);

        setData('files', [...data.files, ...validFiles]);
    };

    const handleImages = (files) => {
        const fileArray = Array.from(files);
        const validFiles = fileArray.filter(file => {
            const maxSize = 5 * 1024 * 1024; // 5 MB
            const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
            
            if (file.size > maxSize) {
                alert(t('schoolProjectsCreatePage.errors.imageTooLarge', { name: file.name, maxMb: 5 }));
                return false;
            }
            
            if (!validTypes.includes(file.type)) {
                alert(t('schoolProjectsCreatePage.errors.imageTypeNotSupported', { name: file.name }));
                return false;
            }
            
            return true;
        });

        setImageList(prev => [...prev, ...validFiles.map(file => ({
            file,
            id: Date.now() + Math.random(),
            name: file.name,
            size: file.size,
            preview: URL.createObjectURL(file),
        }))]);

        setData('images', [...data.images, ...validFiles]);
    };

    const handleThumbnail = (file) => {
        if (!file) return;

        const maxSize = 5 * 1024 * 1024;
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

        if (file.size > maxSize) {
            alert(t('schoolProjectsCreatePage.errors.imageTooLarge', { name: file.name, maxMb: 5 }));
            return;
        }

        if (!validTypes.includes(file.type)) {
            alert(t('schoolProjectsCreatePage.errors.imageTypeNotSupported', { name: file.name }));
            return;
        }

        setThumbnailFile(file);
        setData('thumbnail', file);
    };

    const handleProjectDocument = (file) => {
        if (!file) return;

        const maxSize = 10 * 1024 * 1024;
        const validTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ];

        if (file.size > maxSize) {
            alert(t('schoolProjectsCreatePage.errors.fileTooLarge', { name: file.name, maxMb: 10 }));
            return;
        }

        if (!validTypes.includes(file.type)) {
            alert(t('schoolProjectsCreatePage.errors.fileTypeNotSupported', { name: file.name }));
            return;
        }

        setProjectDocumentFile(file);
        setData('project_document', file);
    };

    const removeFile = (id) => {
        setFileList(prev => {
            const newList = prev.filter(item => item.id !== id);
            setData('files', newList.map(item => item.file));
            return newList;
        });
    };

    const removeImage = (id) => {
        setImageList(prev => {
            const item = prev.find(i => i.id === id);
            if (item && item.preview) {
                URL.revokeObjectURL(item.preview);
            }
            const newList = prev.filter(item => item.id !== id);
            setData('images', newList.map(item => item.file));
            return newList;
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/school/projects', {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                router.visit('/school/projects');
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

    // فئات النهج التعليمي
    const instructionalApproachOptions = [
        { value: 'play_based', label: t('schoolProjectsCreatePage.instructionalApproach.playBased') },
        { value: 'problem_based', label: t('schoolProjectsCreatePage.instructionalApproach.problemBased') },
        { value: 'pbl', label: t('schoolProjectsCreatePage.instructionalApproach.pbl') },
        { value: 'transformative', label: t('schoolProjectsCreatePage.instructionalApproach.transformative') },
        { value: 'accelerated', label: t('schoolProjectsCreatePage.instructionalApproach.accelerated') },
        { value: 'improvement', label: t('schoolProjectsCreatePage.instructionalApproach.improvement') },
    ];

    // المواد
    const subjectOptions = [
        { value: 'math', label: t('schoolProjectsCreatePage.subjects.math') },
        { value: 'arabic', label: t('schoolProjectsCreatePage.subjects.arabic') },
        { value: 'english', label: t('schoolProjectsCreatePage.subjects.english') },
        { value: 'social_studies', label: t('schoolProjectsCreatePage.subjects.socialStudies') },
        { value: 'arts_subject', label: t('schoolProjectsCreatePage.subjects.arts') },
        { value: 'sports', label: t('schoolProjectsCreatePage.subjects.sports') },
        { value: 'engineering_subject', label: t('schoolProjectsCreatePage.subjects.engineering') },
        { value: 'science_subject', label: t('schoolProjectsCreatePage.subjects.science') },
        { value: 'technology_subject', label: t('schoolProjectsCreatePage.subjects.technology') },
        { value: 'physics_chem_bio', label: t('schoolProjectsCreatePage.subjects.physicsChemBio') },
    ];

    // الصفوف
    const gradeOptions = [
        { value: 'grade_1', label: t('schoolProjectsCreatePage.grades.grade1') },
        { value: 'grade_2', label: t('schoolProjectsCreatePage.grades.grade2') },
        { value: 'grade_3', label: t('schoolProjectsCreatePage.grades.grade3') },
        { value: 'grade_4', label: t('schoolProjectsCreatePage.grades.grade4') },
        { value: 'grade_5', label: t('schoolProjectsCreatePage.grades.grade5') },
        { value: 'grade_6', label: t('schoolProjectsCreatePage.grades.grade6') },
        { value: 'grade_7', label: t('schoolProjectsCreatePage.grades.grade7') },
        { value: 'grade_8', label: t('schoolProjectsCreatePage.grades.grade8') },
        { value: 'grade_9', label: t('schoolProjectsCreatePage.grades.grade9') },
        { value: 'grade_10', label: t('schoolProjectsCreatePage.grades.grade10') },
        { value: 'grade_11', label: t('schoolProjectsCreatePage.grades.grade11') },
        { value: 'grade_12', label: t('schoolProjectsCreatePage.grades.grade12') },
    ];

    return (
        <DashboardLayout header={t('schoolProjectsCreatePage.title')}>
            <Head title={t('schoolProjectsCreatePage.pageTitle', { appName: t('common.appName') })} />

            <div dir={language === 'ar' ? 'rtl' : 'ltr'} className="max-w-4xl mx-auto">
                <Link
                    href="/school/projects"
                    className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
                >
                    <FaArrowLeft />
                    <span>{t('schoolProjectsCreatePage.actions.backToProjects')}</span>
                </Link>

                <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-6">
                    <div className="space-y-6">
                        {/* العنوان */}
                        <div>
                            <InputLabel htmlFor="title" value={t('schoolProjectsCreatePage.form.titleLabel')} />
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

                        {/* الوصف */}
                        <div>
                            <InputLabel htmlFor="description" value={t('schoolProjectsCreatePage.form.descriptionLabel')} />
                            <textarea
                                id="description"
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#A3C042] focus:ring focus:ring-[#A3C042] focus:ring-opacity-50"
                                rows="6"
                                required
                            />
                            <InputError message={errors.description} className="mt-2" />
                        </div>

                        {/* الفئة */}
                        <div>
                            <InputLabel htmlFor="category" value={t('schoolProjectsCreatePage.form.categoryLabel')} />
                            <select
                                id="category"
                                value={data.category}
                                onChange={(e) => setData('category', e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#A3C042] focus:ring focus:ring-[#A3C042] focus:ring-opacity-50"
                                required
                            >
                                {categoryOptions.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                            <InputError message={errors.category} className="mt-2" />
                        </div>

                        {/* الصف (بديل الفئة العمرية) */}
                        <div>
                            <InputLabel htmlFor="grade" value={t('schoolProjectsCreatePage.form.gradeLabel')} />
                            <select
                                id="grade"
                                value={data.grade}
                                onChange={(e) => setData('grade', e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#A3C042] focus:ring focus:ring-[#A3C042] focus:ring-opacity-50"
                                required
                            >
                                <option value="">{t('schoolProjectsCreatePage.placeholders.selectGrade')}</option>
                                {gradeOptions.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                            <InputError message={errors.grade} className="mt-2" />
                        </div>

                        {/* المادة */}
                        <div>
                            <InputLabel htmlFor="subject" value={t('schoolProjectsCreatePage.form.subjectLabel')} />
                            <select
                                id="subject"
                                value={data.subject}
                                onChange={(e) => setData('subject', e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#A3C042] focus:ring focus:ring-[#A3C042] focus:ring-opacity-50"
                            >
                                <option value="">{t('schoolProjectsCreatePage.placeholders.selectSubject')}</option>
                                {subjectOptions.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                            <InputError message={errors.subject} className="mt-2" />
                        </div>

                        {/* النهج التعليمي */}
                        <div>
                            <InputLabel htmlFor="instructional_approach" value={t('schoolProjectsCreatePage.form.instructionalApproachLabel')} />
                            <select
                                id="instructional_approach"
                                value={data.instructional_approach}
                                onChange={(e) => setData('instructional_approach', e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#A3C042] focus:ring focus:ring-[#A3C042] focus:ring-opacity-50"
                            >
                                <option value="">{t('schoolProjectsCreatePage.placeholders.selectInstructionalApproach')}</option>
                                {instructionalApproachOptions.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                            <InputError message={errors.instructional_approach} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel value={t('schoolProjectsCreatePage.form.imagesLabel')} />
                            <div className="mt-2 flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => thumbnailInputRef.current?.click()}
                                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                >
                                    {t('schoolProjectsCreatePage.actions.chooseImages')}
                                </button>
                                {thumbnailFile && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setThumbnailFile(null);
                                            setData('thumbnail', null);
                                            if (thumbnailInputRef.current) thumbnailInputRef.current.value = '';
                                        }}
                                        className="text-red-500 hover:text-red-700"
                                        aria-label={t('common.remove')}
                                    >
                                        <FaTrash />
                                    </button>
                                )}
                            </div>
                            <input
                                ref={thumbnailInputRef}
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleThumbnail(e.target.files?.[0])}
                                className="hidden"
                            />
                            <p className="mt-1 text-xs text-gray-500">{t('schoolProjectsCreatePage.dropzone.imagesTitle')}</p>
                            {thumbnailFile && <p className="mt-1 text-sm text-gray-700">{thumbnailFile.name}</p>}
                            <InputError message={errors.thumbnail} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel value={t('schoolProjectsCreatePage.form.filesLabel')} />
                            <div className="mt-2 flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => projectDocumentInputRef.current?.click()}
                                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                >
                                    {t('schoolProjectsCreatePage.actions.chooseFiles')}
                                </button>
                                {projectDocumentFile && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setProjectDocumentFile(null);
                                            setData('project_document', null);
                                            if (projectDocumentInputRef.current) projectDocumentInputRef.current.value = '';
                                        }}
                                        className="text-red-500 hover:text-red-700"
                                        aria-label={t('common.remove')}
                                    >
                                        <FaTrash />
                                    </button>
                                )}
                            </div>
                            <input
                                ref={projectDocumentInputRef}
                                type="file"
                                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                onChange={(e) => handleProjectDocument(e.target.files?.[0])}
                                className="hidden"
                            />
                            <p className="mt-1 text-xs text-gray-500">{t('schoolProjectsCreatePage.dropzone.filesTitle')}</p>
                            {projectDocumentFile && <p className="mt-1 text-sm text-gray-700">{projectDocumentFile.name}</p>}
                            <InputError message={errors.project_document} className="mt-2" />
                        </div>

                        {/* رفع الصور */}
                        <div>
                            <InputLabel value={t('schoolProjectsCreatePage.form.imagesLabel')} />
                            <div
                                className={`mt-2 border-2 border-dashed rounded-lg p-6 text-center transition ${
                                    dragActive ? 'border-[#A3C042] bg-green-50' : 'border-gray-300'
                                }`}
                                onDragEnter={(e) => {
                                    e.preventDefault();
                                    setDragActive(true);
                                }}
                                onDragLeave={(e) => {
                                    e.preventDefault();
                                    setDragActive(false);
                                }}
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={(e) => {
                                    e.preventDefault();
                                    setDragActive(false);
                                    handleImages(e.dataTransfer.files);
                                }}
                            >
                                <FaCloudUploadAlt className="mx-auto text-4xl text-gray-400 mb-2" />
                                <p className="text-gray-600 mb-2">{t('schoolProjectsCreatePage.dropzone.imagesTitle')}</p>
                                <button
                                    type="button"
                                    onClick={() => imageInputRef.current?.click()}
                                    className="text-[#A3C042] hover:text-legacy-blue font-medium"
                                >
                                    {t('schoolProjectsCreatePage.actions.chooseImages')}
                                </button>
                                <input
                                    ref={imageInputRef}
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={(e) => handleImages(e.target.files)}
                                    className="hidden"
                                />
                            </div>
                            {imageList.length > 0 && (
                                <div className="mt-4 grid grid-cols-4 gap-4">
                                    {imageList.map((item) => (
                                        <div key={item.id} className="relative">
                                            <img
                                                src={item.preview}
                                                alt={item.name}
                                                className="w-full h-32 object-cover rounded-lg"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeImage(item.id)}
                                                className="absolute top-2 left-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                            >
                                                <FaTrash className="text-xs" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* رفع الملفات */}
                        <div>
                            <InputLabel value={t('schoolProjectsCreatePage.form.filesLabel')} />
                            <div
                                className={`mt-2 border-2 border-dashed rounded-lg p-6 text-center transition ${
                                    dragActive ? 'border-[#A3C042] bg-green-50' : 'border-gray-300'
                                }`}
                                onDragEnter={(e) => {
                                    e.preventDefault();
                                    setDragActive(true);
                                }}
                                onDragLeave={(e) => {
                                    e.preventDefault();
                                    setDragActive(false);
                                }}
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={(e) => {
                                    e.preventDefault();
                                    setDragActive(false);
                                    handleFiles(e.dataTransfer.files);
                                }}
                            >
                                <FaCloudUploadAlt className="mx-auto text-4xl text-gray-400 mb-2" />
                                <p className="text-gray-600 mb-2">{t('schoolProjectsCreatePage.dropzone.filesTitle')}</p>
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="text-[#A3C042] hover:text-legacy-blue font-medium"
                                >
                                    {t('schoolProjectsCreatePage.actions.chooseFiles')}
                                </button>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    multiple
                                    onChange={(e) => handleFiles(e.target.files)}
                                    className="hidden"
                                />
                            </div>
                            {fileList.length > 0 && (
                                <div className="mt-4 space-y-2">
                                    {fileList.map((item) => (
                                        <div key={item.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
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

                        {/* التقرير */}
                        <div>
                            <InputLabel htmlFor="report" value={t('schoolProjectsCreatePage.form.reportLabel')} />
                            <textarea
                                id="report"
                                value={data.report}
                                onChange={(e) => setData('report', e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#A3C042] focus:ring focus:ring-[#A3C042] focus:ring-opacity-50"
                                rows="4"
                            />
                            <InputError message={errors.report} className="mt-2" />
                        </div>

                        {/* أزرار */}
                        <div className="flex items-center justify-end gap-4 pt-4">
                            <Link
                                href="/school/projects"
                                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                            >
                                {t('common.cancel')}
                            </Link>
                            <PrimaryButton type="submit" disabled={processing}>
                                {processing ? (
                                    <>
                                        <FaSpinner className="animate-spin ms-2" />
                                        {t('schoolProjectsCreatePage.actions.saving')}
                                    </>
                                ) : (
                                    t('schoolProjectsCreatePage.actions.createProject')
                                )}
                            </PrimaryButton>
                        </div>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
}
