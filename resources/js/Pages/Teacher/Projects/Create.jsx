import { Head, useForm, router, Link } from '@inertiajs/react';
import { useState, useRef } from 'react';
import { FaArrowLeft, FaUpload, FaCloudUploadAlt, FaFile, FaSpinner, FaTrash, FaCheckCircle } from 'react-icons/fa';
import TextInput from '../../../Components/TextInput';
import InputLabel from '../../../Components/InputLabel';
import InputError from '../../../Components/InputError';
import PrimaryButton from '../../../Components/PrimaryButton';
import MobileAppLayout from '@/Layouts/MobileAppLayout';
import MobileTopBar from '@/Components/Mobile/MobileTopBar';
import MobileBottomNav from '@/Components/Mobile/MobileBottomNav';
import { useToast } from '@/Contexts/ToastContext';
import { useTranslation } from '@/i18n';

export default function CreateProject({ auth, school, schools = [] }) {
    const { showError } = useToast();
    const { t, language } = useTranslation();
    const { data, setData, post, processing, errors } = useForm({
        title: '',
        description: '',
        category: 'other',
        school_id: school?.id || null,
        files: [],
        evaluation: {
            innovation: 0,
            technical: 0,
            impact: 0,
            feasibility: 0,
            presentation: 0
        },
    });

    const [fileList, setFileList] = useState([]);
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef(null);
    const [activeTab, setActiveTab] = useState('upload'); // 'evaluation' or 'upload'

    const handleFiles = (files) => {
        const fileArray = Array.from(files);
        const validFiles = fileArray.filter(file => {
            const maxSize = 10 * 1024 * 1024; // 10 MB
            const validTypes = [
                'image/jpeg', 'image/jpg', 'image/png', 'image/gif',
                'video/mp4', 'video/avi', 'video/mov',
                'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            ];

            if (file.size > maxSize) {
                showError(t('teacherProjectsCreatePage.errors.fileTooLarge', { name: file.name }));
                return false;
            }

            if (!validTypes.includes(file.type)) {
                showError(t('teacherProjectsCreatePage.errors.fileTypeNotSupported', { name: file.name }));
                return false;
            }

            return true;
        });

        setFileList(prev => [...prev, ...validFiles.map(file => ({
            file,
            id: Date.now() + Math.random(),
            name: file.name,
            size: file.size,
            type: file.type,
        }))]);

        const currentFiles = data.files || [];
        setData('files', [...currentFiles, ...validFiles]);
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFiles(e.dataTransfer.files);
        }
    };

    const handleFileInputChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            handleFiles(e.target.files);
        }
    };

    const removeFile = (fileId) => {
        setFileList(prev => {
            const filtered = prev.filter(f => f.id !== fileId);
            const filesToKeep = filtered.map(f => f.file);
            setData('files', filesToKeep);
            return filtered;
        });
    };

    const formatFileSize = (bytes) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    };

    const getFileIcon = (type) => {
        if (type.startsWith('image/')) return '🖼️';
        if (type.startsWith('video/')) return '🎥';
        if (type === 'application/pdf') return '📄';
        return '📎';
    };

    const evaluationCriteria = [
        { id: 'innovation', name: t('teacherProjectsCreatePage.evaluation.criteria.innovation.name'), description: t('teacherProjectsCreatePage.evaluation.criteria.innovation.description'), icon: '💡' },
        { id: 'technical', name: t('teacherProjectsCreatePage.evaluation.criteria.technical.name'), description: t('teacherProjectsCreatePage.evaluation.criteria.technical.description'), icon: '⚙️' },
        { id: 'impact', name: t('teacherProjectsCreatePage.evaluation.criteria.impact.name'), description: t('teacherProjectsCreatePage.evaluation.criteria.impact.description'), icon: '🌍' },
        { id: 'feasibility', name: t('teacherProjectsCreatePage.evaluation.criteria.feasibility.name'), description: t('teacherProjectsCreatePage.evaluation.criteria.feasibility.description'), icon: '📈' },
        { id: 'presentation', name: t('teacherProjectsCreatePage.evaluation.criteria.presentation.name'), description: t('teacherProjectsCreatePage.evaluation.criteria.presentation.description'), icon: '📢' },
    ];

    const calculateTotalScore = () => {
        const values = Object.values(data.evaluation);
        const sum = values.reduce((a, b) => a + b, 0);
        return Math.round(sum / values.length);
    };

    const handleEvaluationChange = (criterion, value) => {
        setData('evaluation', {
            ...data.evaluation,
            [criterion]: parseInt(value)
        });
    };

    const submit = (e) => {
        e.preventDefault();
        post('/teacher/projects', {
            forceFormData: true,
            onSuccess: () => {
                router.visit('/teacher/projects');
            },
        });
    };

    return (
        <div dir={language === 'ar' ? 'rtl' : 'ltr'} className="min-h-screen bg-gray-50">
            <Head title={t('teacherProjectsCreatePage.pageTitle', { appName: t('common.appName') })} />

            {/* Mobile View */}
            <div className="block md:hidden">
                <MobileAppLayout
                    auth={auth}
                    title={t('common.appName')}
                    activeNav="profile"
                    unreadCount={0}
                    onNotifications={() => router.visit('/notifications')}
                    onBack={() => router.visit('/teacher/projects')}
                >
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
                                {t('teacherProjectsCreatePage.tabs.upload')}
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveTab('evaluation')}
                                className={`rounded-xl py-2.5 text-sm font-bold transition ${activeTab === 'evaluation'
                                    ? 'bg-[#A3C042] text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                {t('teacherProjectsCreatePage.tabs.evaluation')}
                            </button>
                        </div>
                    </div>

                    {/* Form */}
                    {activeTab === 'upload' && (
                        <form onSubmit={submit} className="bg-white rounded-2xl border border-gray-100 p-6 space-y-6 mt-4">
                            {/* Title */}
                            <div>
                                <InputLabel htmlFor="title" value={t('teacherProjectsCreatePage.form.titleLabel')} className="text-sm font-medium text-gray-700 mb-2" />
                                <input
                                    id="title"
                                    type="text"
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#A3C042] focus:ring-[#A3C042]"
                                    placeholder={t('teacherProjectsCreatePage.form.titlePlaceholder')}
                                    required
                                />
                                <InputError message={errors.title} className="mt-2" />
                            </div>

                            {/* Description */}
                            <div>
                                <InputLabel htmlFor="description" value={t('teacherProjectsCreatePage.form.descriptionLabel')} className="text-sm font-medium text-gray-700 mb-2" />
                                <textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    rows={6}
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#A3C042] focus:ring-[#A3C042]"
                                    placeholder={t('teacherProjectsCreatePage.form.descriptionPlaceholder')}
                                    required
                                />
                                <InputError message={errors.description} className="mt-2" />
                            </div>

                            {/* Category */}
                            <div>
                                <InputLabel htmlFor="category" value={t('teacherProjectsCreatePage.form.categoryLabel')} className="text-sm font-medium text-gray-700 mb-2" />
                                <select
                                    id="category"
                                    value={data.category}
                                    onChange={(e) => setData('category', e.target.value)}
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#A3C042] focus:ring-[#A3C042]"
                                >
                                    <option value="science">{t('common.categories.science')}</option>
                                    <option value="technology">{t('common.categories.technology')}</option>
                                    <option value="engineering">{t('common.categories.engineering')}</option>
                                    <option value="mathematics">{t('common.categories.mathematics')}</option>
                                    <option value="arts">{t('common.categories.arts')}</option>
                                    <option value="other">{t('common.categories.other')}</option>
                                </select>
                                <InputError message={errors.category} className="mt-2" />
                            </div>

                            {/* School Selection (if multiple schools available) */}
                            {schools && schools.length > 0 && (
                                <div>
                                    <InputLabel htmlFor="school_id" value={t('teacherProjectsCreatePage.form.schoolLabel')} className="text-sm font-medium text-gray-700 mb-2" />
                                    <select
                                        id="school_id"
                                        value={data.school_id || ''}
                                        onChange={(e) => setData('school_id', e.target.value || null)}
                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#A3C042] focus:ring-[#A3C042]"
                                    >
                                        <option value="">{t('teacherProjectsCreatePage.form.schoolPlaceholder')}</option>
                                        {schools.map((sch) => (
                                            <option key={sch.id} value={sch.id}>
                                                {sch.name}
                                            </option>
                                        ))}
                                    </select>
                                    <InputError message={errors.school_id} className="mt-2" />
                                </div>
                            )}

                            {/* File Upload */}
                            <div>
                                <InputLabel value={t('teacherProjectsCreatePage.form.filesLabel')} className="text-sm font-medium text-gray-700 mb-2" />
                                <div
                                    onDragEnter={handleDrag}
                                    onDragLeave={handleDrag}
                                    onDragOver={handleDrag}
                                    onDrop={handleDrop}
                                    className={`border-2 border-dashed rounded-2xl p-8 text-center transition ${dragActive
                                        ? 'border-[#A3C042] bg-[#A3C042]/10'
                                        : 'border-gray-300 hover:border-[#A3C042]/50'
                                        }`}
                                >
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        multiple
                                        onChange={handleFileInputChange}
                                        accept="image/*,video/*,.pdf,.doc,.docx"
                                        className="hidden"
                                    />
                                    <FaCloudUploadAlt className="mx-auto text-6xl text-gray-400 mb-4" />
                                    <p className="text-gray-700 mb-2">
                                        {t('teacherProjectsCreatePage.form.dropzoneTitle')}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        {t('teacherProjectsCreatePage.form.dropzoneSubtitle')}
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="mt-4 px-6 py-2 bg-[#A3C042] text-white rounded-xl hover:bg-[#8CA635] transition font-bold"
                                    >
                                        {t('teacherProjectsCreatePage.actions.chooseFiles')}
                                    </button>
                                </div>
                                <InputError message={errors.files} className="mt-2" />

                                {/* File List */}
                                {fileList.length > 0 && (
                                    <div className="mt-4 space-y-2">
                                        {fileList.map((fileItem) => (
                                            <div
                                                key={fileItem.id}
                                                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <span className="text-2xl">{getFileIcon(fileItem.type)}</span>
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">{fileItem.name}</p>
                                                        <p className="text-xs text-gray-500">{formatFileSize(fileItem.size)}</p>
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => removeFile(fileItem.id)}
                                                    className="text-red-500 hover:text-red-700 transition"
                                                >
                                                    <FaTrash />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* School Info */}
                            {school && (
                                <div className="bg-[#A3C042]/10 border border-[#A3C042]/20 rounded-lg p-4">
                                    <p className="text-sm text-gray-700">
                                        <span className="font-semibold">{t('teacherProjectsCreatePage.schoolInfo.linkedSchool')}:</span> {school.name}
                                    </p>
                                    <p className="text-xs text-gray-600 mt-1">
                                        {data.school_id
                                            ? t('teacherProjectsCreatePage.schoolInfo.willBeSentForReview')
                                            : t('teacherProjectsCreatePage.schoolInfo.chooseAnotherSchool')}
                                    </p>
                                </div>
                            )}

                            {/* Submit Button */}
                            <div className="flex items-center justify-end pt-4 border-t border-gray-200">
                                <PrimaryButton
                                    type="submit"
                                    disabled={processing || !data.title || !data.description}
                                    className="bg-[#A3C042] hover:bg-[#8CA635] flex items-center gap-2 rounded-xl"
                                >
                                    {processing ? (
                                        <>
                                            <FaSpinner className="animate-spin" />
                                            {t('teacherProjectsCreatePage.actions.uploading')}
                                        </>
                                    ) : (
                                        <>
                                            <FaUpload />
                                            {t('teacherProjectsCreatePage.actions.uploadProject')}
                                        </>
                                    )}
                                </PrimaryButton>
                            </div>
                        </form>
                    )}

                    {/* Evaluation Tab Content */}
                    {activeTab === 'evaluation' && (
                        <div className="bg-white rounded-2xl border border-gray-100 p-5 mt-4 space-y-6">
                            <div className="flex items-center justify-between bg-[#A3C042]/5 p-4 rounded-2xl border border-[#A3C042]/10">
                                <div>
                                    <h3 className="font-bold text-gray-900">{t('teacherProjectsCreatePage.evaluation.mobileTitle')}</h3>
                                    <p className="text-[10px] text-gray-500">{t('teacherProjectsCreatePage.evaluation.mobileSubtitle')}</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-2xl font-black text-[#A3C042]">{calculateTotalScore()}%</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                {evaluationCriteria.map((criterion) => (
                                    <div key={criterion.id} className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="text-lg">{criterion.icon}</span>
                                                <h4 className="text-sm font-bold text-gray-900">{criterion.name}</h4>
                                            </div>
                                            <span className="text-xs font-bold text-[#A3C042]">{data.evaluation[criterion.id]}%</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="0"
                                            max="100"
                                            value={data.evaluation[criterion.id]}
                                            onChange={(e) => handleEvaluationChange(criterion.id, e.target.value)}
                                            className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-[#A3C042]"
                                        />
                                    </div>
                                ))}
                            </div>

                            <button
                                type="button"
                                onClick={() => setActiveTab('upload')}
                                className="w-full py-3 text-sm font-bold text-[#A3C042] border-2 border-[#A3C042] rounded-xl hover:bg-[#A3C042] hover:text-white transition"
                            >
                                {t('teacherProjectsCreatePage.actions.completeProjectInfo')}
                            </button>
                        </div>
                    )}
                </MobileAppLayout>
            </div>

            {/* Desktop View */}
            <div className="hidden md:block">
                <MobileTopBar
                    title={t('common.appName')}
                    unreadCount={auth?.unreadCount || 0}
                    onNotifications={() => router.visit('/notifications')}
                    onBack={() => router.visit('/teacher/projects')}
                    reverseOrder={false}
                />
                <main className="mx-auto w-full max-w-6xl px-4 pb-24 pt-4">
                    <div className="space-y-4 max-w-3xl mx-auto">
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
                                    {t('teacherProjectsCreatePage.tabs.upload')}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('evaluation')}
                                    className={`rounded-xl py-2.5 text-sm font-bold transition ${activeTab === 'evaluation'
                                        ? 'bg-[#A3C042] text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    {t('teacherProjectsCreatePage.tabs.evaluation')}
                                </button>
                            </div>
                        </div>

                        {/* Form */}
                        {activeTab === 'upload' && (
                            <form onSubmit={submit} className="bg-white rounded-2xl border border-gray-100 p-6 space-y-6 mt-4">
                                {/* Title */}
                                <div>
                                        <InputLabel htmlFor="title" value={t('teacherProjectsCreatePage.form.titleLabel')} className="text-sm font-medium text-gray-700 mb-2" />
                                    <input
                                        id="title"
                                        type="text"
                                        value={data.title}
                                        onChange={(e) => setData('title', e.target.value)}
                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#A3C042] focus:ring-[#A3C042]"
                                            placeholder={t('teacherProjectsCreatePage.form.titlePlaceholder')}
                                        required
                                    />
                                    <InputError message={errors.title} className="mt-2" />
                                </div>

                                {/* Description */}
                                <div>
                                        <InputLabel htmlFor="description" value={t('teacherProjectsCreatePage.form.descriptionLabel')} className="text-sm font-medium text-gray-700 mb-2" />
                                    <textarea
                                        id="description"
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        rows={6}
                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#A3C042] focus:ring-[#A3C042]"
                                            placeholder={t('teacherProjectsCreatePage.form.descriptionPlaceholder')}
                                        required
                                    />
                                    <InputError message={errors.description} className="mt-2" />
                                </div>

                                {/* Category */}
                                <div>
                                        <InputLabel htmlFor="category" value={t('teacherProjectsCreatePage.form.categoryLabel')} className="text-sm font-medium text-gray-700 mb-2" />
                                    <select
                                        id="category"
                                        value={data.category}
                                        onChange={(e) => setData('category', e.target.value)}
                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#A3C042] focus:ring-[#A3C042]"
                                    >
                                            <option value="science">{t('common.categories.science')}</option>
                                            <option value="technology">{t('common.categories.technology')}</option>
                                            <option value="engineering">{t('common.categories.engineering')}</option>
                                            <option value="mathematics">{t('common.categories.mathematics')}</option>
                                            <option value="arts">{t('common.categories.arts')}</option>
                                            <option value="other">{t('common.categories.other')}</option>
                                    </select>
                                    <InputError message={errors.category} className="mt-2" />
                                </div>

                                {/* School Selection (if multiple schools available) */}
                                {schools && schools.length > 0 && (
                                    <div>
                                            <InputLabel htmlFor="school_id" value={t('teacherProjectsCreatePage.form.schoolLabel')} className="text-sm font-medium text-gray-700 mb-2" />
                                        <select
                                            id="school_id"
                                            value={data.school_id || ''}
                                            onChange={(e) => setData('school_id', e.target.value || null)}
                                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#A3C042] focus:ring-[#A3C042]"
                                        >
                                                <option value="">{t('teacherProjectsCreatePage.form.schoolPlaceholder')}</option>
                                            {schools.map((sch) => (
                                                <option key={sch.id} value={sch.id}>
                                                    {sch.name}
                                                </option>
                                            ))}
                                        </select>
                                        <InputError message={errors.school_id} className="mt-2" />
                                    </div>
                                )}

                                {/* File Upload */}
                                <div>
                                        <InputLabel value={t('teacherProjectsCreatePage.form.filesLabel')} className="text-sm font-medium text-gray-700 mb-2" />
                                    <div
                                        onDragEnter={handleDrag}
                                        onDragLeave={handleDrag}
                                        onDragOver={handleDrag}
                                        onDrop={handleDrop}
                                        className={`border-2 border-dashed rounded-2xl p-8 text-center transition ${dragActive
                                            ? 'border-[#A3C042] bg-[#A3C042]/10'
                                            : 'border-gray-300 hover:border-[#A3C042]/50'
                                            }`}
                                    >
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            multiple
                                            onChange={handleFileInputChange}
                                            accept="image/*,video/*,.pdf,.doc,.docx"
                                            className="hidden"
                                        />
                                        <FaCloudUploadAlt className="mx-auto text-6xl text-gray-400 mb-4" />
                                        <p className="text-gray-700 mb-2">
                                                {t('teacherProjectsCreatePage.form.dropzoneTitle')}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                                {t('teacherProjectsCreatePage.form.dropzoneSubtitle')}
                                        </p>
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="mt-4 px-6 py-2 bg-[#A3C042] text-white rounded-xl hover:bg-[#8CA635] transition font-bold"
                                        >
                                                {t('teacherProjectsCreatePage.actions.chooseFiles')}
                                        </button>
                                    </div>
                                    <InputError message={errors.files} className="mt-2" />

                                    {/* File List */}
                                    {fileList.length > 0 && (
                                        <div className="mt-4 space-y-2">
                                            {fileList.map((fileItem) => (
                                                <div
                                                    key={fileItem.id}
                                                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-2xl">{getFileIcon(fileItem.type)}</span>
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-900">{fileItem.name}</p>
                                                            <p className="text-xs text-gray-500">{formatFileSize(fileItem.size)}</p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeFile(fileItem.id)}
                                                        className="text-red-500 hover:text-red-700 transition"
                                                    >
                                                        <FaTrash />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* School Info */}
                                {school && (
                                    <div className="bg-[#A3C042]/10 border border-[#A3C042]/20 rounded-lg p-4">
                                        <p className="text-sm text-gray-700">
                                                <span className="font-semibold">{t('teacherProjectsCreatePage.schoolInfo.linkedSchool')}:</span> {school.name}
                                        </p>
                                        <p className="text-xs text-gray-600 mt-1">
                                            {data.school_id
                                                    ? t('teacherProjectsCreatePage.schoolInfo.willBeSentForReview')
                                                    : t('teacherProjectsCreatePage.schoolInfo.chooseAnotherSchool')}
                                        </p>
                                    </div>
                                )}

                                {/* Submit Button */}
                                <div className="flex items-center justify-end pt-4 border-t border-gray-200">
                                    <PrimaryButton
                                        type="submit"
                                        disabled={processing || !data.title || !data.description}
                                        className="bg-[#A3C042] hover:bg-[#8CA635] flex items-center gap-2 rounded-xl"
                                    >
                                        {processing ? (
                                            <>
                                                <FaSpinner className="animate-spin" />
                                                {t('teacherProjectsCreatePage.actions.uploading')}
                                            </>
                                        ) : (
                                            <>
                                                <FaUpload />
                                                {t('teacherProjectsCreatePage.actions.uploadProject')}
                                            </>
                                        )}
                                    </PrimaryButton>
                                </div>
                            </form>
                        )}

                        {/* Evaluation Tab Content */}
                        {activeTab === 'evaluation' && (
                            <div className="bg-white rounded-2xl border border-gray-100 p-8 mt-4 space-y-8 max-w-3xl mx-auto">
                                <div className="flex items-center justify-between border-b border-gray-50 pb-6">
                                    <div>
                                        <h3 className="text-2xl font-bold text-gray-900 mb-1">{t('teacherProjectsCreatePage.evaluation.desktopTitle')}</h3>
                                        <p className="text-gray-500">{t('teacherProjectsCreatePage.evaluation.desktopSubtitle')}</p>
                                    </div>
                                    <div className="bg-[#A3C042]/10 px-6 py-4 rounded-3xl border border-[#A3C042]/20 text-center min-w-[140px]">
                                        <p className="text-xs text-[#A3C042] font-black tracking-wider uppercase mb-1">{t('teacherProjectsCreatePage.evaluation.expectedScore')}</p>
                                        <p className="text-4xl font-black text-[#A3C042]">{calculateTotalScore()}%</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-10">
                                    {evaluationCriteria.map((criterion) => (
                                        <div key={criterion.id} className="group">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-2xl group-hover:bg-[#A3C042]/10 transition-colors">
                                                        {criterion.icon}
                                                    </div>
                                                    <div>
                                                        <h4 className="text-lg font-bold text-gray-900 group-hover:text-[#A3C042] transition-colors">{criterion.name}</h4>
                                                        <p className="text-sm text-gray-500">{criterion.description}</p>
                                                    </div>
                                                </div>
                                                <div className="">
                                                    <span className="text-2xl font-black text-gray-900">{data.evaluation[criterion.id]}</span>
                                                    <span className="text-sm text-gray-400 font-bold me-1">%</span>
                                                </div>
                                            </div>
                                            <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
                                                <div
                                                    className="absolute top-0 start-0 h-full bg-[#A3C042] transition-all duration-300"
                                                    style={{ width: `${data.evaluation[criterion.id]}%` }}
                                                />
                                                <input
                                                    type="range"
                                                    min="0"
                                                    max="100"
                                                    value={data.evaluation[criterion.id]}
                                                    onChange={(e) => handleEvaluationChange(criterion.id, e.target.value)}
                                                    className="absolute top-0 start-0 w-full h-full opacity-0 cursor-pointer z-10"
                                                />
                                            </div>
                                            <div className="flex justify-between text-[11px] text-gray-400 mt-2 font-bold px-1 uppercase tracking-tighter">
                                                <span>{t('teacherProjectsCreatePage.evaluation.levels.developing')}</span>
                                                <span>{t('teacherProjectsCreatePage.evaluation.levels.promising')}</span>
                                                <span>{t('teacherProjectsCreatePage.evaluation.levels.excellent')}</span>
                                                <span>{t('teacherProjectsCreatePage.evaluation.levels.pioneer')}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="bg-[#A3C042]/10 rounded-2xl p-6 flex items-center gap-6">
                                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-[#A3C042] shadow-sm flex-shrink-0">
                                        <FaCheckCircle className="text-2xl" />
                                    </div>
                                    <div className="flex-1">
                                        <h5 className="font-bold text-gray-900 mb-1">{t('teacherProjectsCreatePage.evaluation.readyTitle')}</h5>
                                        <p className="text-sm text-gray-600">{t('teacherProjectsCreatePage.evaluation.readySubtitle')}</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab('upload')}
                                        className="px-6 py-3 bg-[#A3C042] text-white font-bold rounded-xl hover:bg-[#8CA635] shadow-lg shadow-[#A3C042]/20 transition"
                                    >
                                        {t('teacherProjectsCreatePage.actions.backToFiles')}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </main>
                <MobileBottomNav active="profile" role={auth?.user?.role} isAuthed={!!auth?.user} user={auth?.user} />
            </div>
        </div>
    );
}
