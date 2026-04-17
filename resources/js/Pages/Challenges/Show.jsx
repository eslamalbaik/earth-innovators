import { Head, Link, router, useForm } from '@inertiajs/react';
import MobileAppLayout from '@/Layouts/MobileAppLayout';
import { useRef, useState } from 'react';
import {
    FaAward,
    FaCalendar,
    FaCloudUploadAlt,
    FaEdit,
    FaFile,
    FaSpinner,
    FaStar,
    FaTimesCircle,
    FaTrash,
    FaTrophy,
    FaUpload,
    FaUsers,
    FaCheckCircle,
    FaClock,
} from 'react-icons/fa';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import { useTranslation } from '@/i18n';
import { usePremiumGate } from '@/Hooks/usePremiumGate';
import { getChallengeImageUrl } from '@/utils/imageUtils';

export default function ChallengeShow({ auth, challenge, canManage = false, canSubmit = false, editUrl = null, membershipSummary = null }) {
    const { t, language } = useTranslation();
    const { gate } = usePremiumGate(membershipSummary);
    const [activeTab, setActiveTab] = useState('details');
    const [fileList, setFileList] = useState([]);
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef(null);
    const existingSubmission = challenge?.student_submission;

    const submissionForm = useForm({
        answer: existingSubmission?.answer || '',
        comment: existingSubmission?.comment || '',
        files: [],
    });

    const formatDate = (date) => {
        if (!date) return '';
        const d = new Date(date);
        const months = [
            t('common.january'),
            t('common.february'),
            t('common.march'),
            t('common.april'),
            t('common.may'),
            t('common.june'),
            t('common.july'),
            t('common.august'),
            t('common.september'),
            t('common.october'),
            t('common.november'),
            t('common.december'),
        ];
        return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
    };

    const challengeImage = getChallengeImageUrl(challenge.image_url || challenge.image || challenge.thumbnail);
    const now = new Date();
    const startDate = challenge?.start_date ? new Date(challenge.start_date) : null;
    const deadline = challenge?.deadline ? new Date(challenge.deadline) : null;
    const isActive = challenge?.status === 'active' && startDate && deadline && startDate <= now && deadline >= now;

    const getSubmissionStatusLabel = (status) => {
        const map = {
            submitted: t('studentChallengesIndexPage.submissionStatuses.submitted'),
            reviewed: t('studentChallengesIndexPage.submissionStatuses.reviewed'),
            approved: t('studentChallengesIndexPage.submissionStatuses.approved'),
            rejected: t('studentChallengesIndexPage.submissionStatuses.rejected'),
        };

        return map[status] || status;
    };

    const getStatusBadge = () => {
        if (isActive) {
            return { bg: 'bg-green-100', text: 'text-green-800', label: t('common.active'), icon: FaCheckCircle };
        }
        if (startDate && startDate > now) {
            return { bg: 'bg-blue-100', text: 'text-blue-800', label: t('common.upcoming'), icon: FaClock };
        }

        return { bg: 'bg-gray-100', text: 'text-gray-800', label: t('studentChallengesIndexPage.status.finished'), icon: FaTimesCircle };
    };

    const handleFiles = (files) => {
        const fileArray = Array.from(files);
        const validFiles = fileArray.filter((file) => {
            const maxSize = 10 * 1024 * 1024;
            if (file.size > maxSize) {
                alert(t('studentChallengesShowPage.errors.fileTooLarge', { name: file.name }));
                return false;
            }

            return true;
        });

        setFileList((prev) => [
            ...prev,
            ...validFiles.map((file) => ({
                file,
                id: Date.now() + Math.random(),
                name: file.name,
                size: file.size,
            })),
        ]);

        const currentFiles = submissionForm.data.files || [];
        submissionForm.setData('files', [...currentFiles, ...validFiles]);
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

    const removeFile = (fileId) => {
        setFileList((prev) => {
            const filtered = prev.filter((f) => f.id !== fileId);
            submissionForm.setData('files', filtered.map((f) => f.file));
            return filtered;
        });
    };

    const formatFileSize = (bytes) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    };

    const submitChallenge = (e) => {
        e.preventDefault();
        gate(() => {
            if (!submissionForm.data.answer?.trim() && fileList.length === 0) {
                alert(t('studentChallengesShowPage.errors.answerOrFileRequired'));
                return;
            }

            const url = existingSubmission
                ? `/student/challenges/${challenge.id}/submissions/${existingSubmission.id}`
                : `/student/challenges/${challenge.id}/submit`;
            const method = existingSubmission ? 'put' : 'post';

            submissionForm[method](url, {
                forceFormData: true,
                onSuccess: () => {
                    submissionForm.reset();
                    setFileList([]);
                    router.reload();
                },
                onError: (errors) => {
                    const firstError = Object.values(errors)[0];
                    if (firstError) {
                        alert(Array.isArray(firstError) ? firstError[0] : firstError);
                    }
                },
            });
        });
    };

    const statusBadge = getStatusBadge();
    const StatusIcon = statusBadge.icon;

    const content = (
        <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <img src={challengeImage} alt={challenge.title} className="w-full h-56 object-cover" />
                <div className="p-4">
                    <div className="flex items-start justify-between gap-3">
                        <h1 className="text-xl font-extrabold text-gray-900">{challenge.title}</h1>
                        {canManage && editUrl && (
                            <Link
                                href={editUrl}
                                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-[#A3C042] text-white text-sm font-semibold hover:bg-[#8CA635] transition"
                            >
                                <FaEdit />
                                {t('common.edit')}
                            </Link>
                        )}
                    </div>
                    <div className="mt-2">
                        <span className={`px-2 py-1 ${statusBadge.bg} ${statusBadge.text} text-xs font-semibold rounded-full inline-flex items-center gap-1`}>
                            <StatusIcon className="text-[10px]" />
                            {statusBadge.label}
                        </span>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2 text-xs">
                        {challenge.challenge_type && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                                {challenge.challenge_type}
                            </span>
                        )}
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full inline-flex items-center gap-1">
                            <FaUsers className="text-[10px]" />
                            {challenge.current_participants || challenge.participants_count || 0}
                        </span>
                        {challenge.points_reward > 0 && (
                            <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full inline-flex items-center gap-1">
                                <FaTrophy className="text-[10px]" />
                                {challenge.points_reward} {t('challenges.points')}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {canSubmit && (
                <div className="bg-white rounded-2xl border border-gray-100 p-2">
                    <div className="flex gap-2 overflow-x-auto">
                        <button
                            type="button"
                            onClick={() => setActiveTab('details')}
                            className={`whitespace-nowrap px-4 py-2 text-sm font-bold rounded-xl transition ${activeTab === 'details'
                                ? 'bg-[#eef8d6] text-[#6b7f2c]'
                                : 'text-gray-600'
                                }`}
                        >
                            {t('studentChallengesShowPage.tabs.details')}
                        </button>
                        {isActive && (
                            <button
                                type="button"
                                onClick={() => setActiveTab('submit')}
                                className={`whitespace-nowrap px-4 py-2 text-sm font-bold rounded-xl transition ${activeTab === 'submit'
                                    ? 'bg-[#eef8d6] text-[#6b7f2c]'
                                    : 'text-gray-600'
                                    }`}
                            >
                                {existingSubmission
                                    ? t('studentChallengesShowPage.tabs.updateSubmission')
                                    : t('studentChallengesShowPage.tabs.submitSolution')}
                            </button>
                        )}
                    </div>
                </div>
            )}

            <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3 text-sm text-gray-700">
                <div className="flex items-center gap-2">
                    <FaCalendar className="text-gray-400" />
                    <span>{t('adminChallengesIndexPage.table.startDate')}: {formatDate(challenge.start_date)}</span>
                </div>
                <div className="flex items-center gap-2">
                    <FaCalendar className="text-gray-400" />
                    <span>{t('adminChallengesIndexPage.table.endDate')}: {formatDate(challenge.deadline)}</span>
                </div>
                {challenge.objective && (
                    <div>
                        <h2 className="font-bold text-gray-900 mb-1">{t('studentChallengesShowPage.sections.objective')}</h2>
                        <p>{challenge.objective}</p>
                    </div>
                )}
                {challenge.description && (
                    <div>
                        <h2 className="font-bold text-gray-900 mb-1">{t('studentChallengesShowPage.sections.description')}</h2>
                        <p className="whitespace-pre-line">{challenge.description}</p>
                    </div>
                )}
                {challenge.instructions && (
                    <div>
                        <h2 className="font-bold text-gray-900 mb-1">{t('studentChallengesShowPage.sections.howTo')}</h2>
                        <p className="whitespace-pre-line">{challenge.instructions}</p>
                    </div>
                )}
                {existingSubmission && (
                    <div className="bg-blue-50 rounded-2xl border-2 border-blue-200 p-4">
                        <h3 className="text-sm font-bold text-gray-900 mb-2">{t('studentChallengesShowPage.submissionStatus.title')}</h3>
                        <div className="space-y-2">
                            <p><strong>{t('common.status')}:</strong> {getSubmissionStatusLabel(existingSubmission.status)}</p>
                            {existingSubmission.rating && (
                                <p><strong>{t('studentChallengesShowPage.submissionStatus.rating')}:</strong> {existingSubmission.rating} / 10</p>
                            )}
                            {existingSubmission.points_earned > 0 && (
                                <p className="flex items-center gap-1 text-green-700">
                                    <FaAward />
                                    <strong>{t('studentChallengesShowPage.submissionStatus.pointsEarned')}:</strong> {existingSubmission.points_earned}
                                </p>
                            )}
                            {existingSubmission.feedback && (
                                <div>
                                    <strong>{t('studentChallengesShowPage.submissionStatus.reviewerNotes')}:</strong>
                                    <p className="mt-1">{existingSubmission.feedback}</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {canSubmit && activeTab === 'submit' && isActive && (
                <div className="bg-white rounded-2xl border border-gray-100 p-4">
                    <form onSubmit={submitChallenge}>
                        <div className="mb-4">
                            <InputLabel htmlFor="answer" value={t('studentChallengesShowPage.form.answerLabel')} className="text-sm" />
                            <textarea
                                id="answer"
                                value={submissionForm.data.answer}
                                onChange={(e) => submissionForm.setData('answer', e.target.value)}
                                rows={8}
                                className="mt-2 block w-full rounded-xl border-gray-300 shadow-sm focus:border-[#A3C042] focus:ring-[#A3C042] text-sm"
                                placeholder={t('studentChallengesShowPage.form.answerPlaceholder')}
                                required
                            />
                            <InputError message={submissionForm.errors.answer} className="mt-2" />
                        </div>

                        <div className="mb-4">
                            <InputLabel htmlFor="comment" value={t('studentChallengesShowPage.form.commentLabel')} className="text-sm" />
                            <textarea
                                id="comment"
                                value={submissionForm.data.comment}
                                onChange={(e) => submissionForm.setData('comment', e.target.value)}
                                rows={4}
                                className="mt-2 block w-full rounded-xl border-gray-300 shadow-sm focus:border-[#A3C042] focus:ring-[#A3C042] text-sm"
                                placeholder={t('studentChallengesShowPage.form.commentPlaceholder')}
                            />
                            <InputError message={submissionForm.errors.comment} className="mt-2" />
                        </div>

                        <div className="mb-4">
                            <InputLabel value={t('studentChallengesShowPage.form.filesLabel')} className="text-sm" />
                            <div
                                className={`mt-2 border-2 border-dashed rounded-2xl p-6 text-center transition ${dragActive ? 'border-[#A3C042] bg-green-50' : 'border-gray-300'
                                    }`}
                                onDragEnter={handleDrag}
                                onDragLeave={handleDrag}
                                onDragOver={handleDrag}
                                onDrop={handleDrop}
                            >
                                <FaCloudUploadAlt className="mx-auto text-3xl text-gray-400 mb-3" />
                                <p className="text-sm text-gray-700 mb-2">{t('studentChallengesShowPage.form.dropzoneTitle')}</p>
                                <p className="text-xs text-gray-500 mb-3">{t('studentChallengesShowPage.form.maxFileSize')}</p>
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="px-4 py-2 bg-[#A3C042] text-white rounded-xl hover:bg-[#8CA635] transition text-sm font-semibold"
                                >
                                    {t('studentChallengesShowPage.actions.chooseFiles')}
                                </button>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    multiple
                                    onChange={(e) => e.target.files && handleFiles(e.target.files)}
                                    className="hidden"
                                />
                            </div>
                            {fileList.length > 0 && (
                                <div className="mt-3 space-y-2">
                                    {fileList.map((file) => (
                                        <div key={file.id} className="flex items-center justify-between bg-gray-50 p-2 rounded-xl border border-gray-200">
                                            <div className="flex items-center gap-2">
                                                <FaFile className="text-gray-400 text-sm" />
                                                <div>
                                                    <p className="text-xs font-medium text-gray-900">{file.name}</p>
                                                    <p className="text-[10px] text-gray-500">{formatFileSize(file.size)}</p>
                                                </div>
                                            </div>
                                            <button type="button" onClick={() => removeFile(file.id)} className="text-red-500 hover:text-red-700">
                                                <FaTrash className="text-xs" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <InputError message={submissionForm.errors.files} className="mt-2" />
                        </div>

                        <div className="flex justify-end">
                            <PrimaryButton disabled={submissionForm.processing} className="bg-[#A3C042] hover:bg-[#8CA635] text-sm">
                                {submissionForm.processing ? (
                                    <>
                                        <FaSpinner className="animate-spin me-2" />
                                        {t('studentChallengesShowPage.actions.sending')}
                                    </>
                                ) : (
                                    <>
                                        <FaUpload className="me-2" />
                                        {existingSubmission
                                            ? t('studentChallengesShowPage.tabs.updateSubmission')
                                            : t('studentChallengesShowPage.tabs.submitSolution')}
                                    </>
                                )}
                            </PrimaryButton>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );

    return (
        <div dir={language === 'ar' ? 'rtl' : 'ltr'} className="min-h-screen bg-gray-50">
            <Head title={`${challenge.title} - ${t('common.appName')}`} />

            <div className="block md:hidden">
                <MobileAppLayout
                    auth={auth}
                    title={challenge.title}
                    activeNav="challenges"
                    unreadCount={auth?.unreadCount || 0}
                    onNotifications={() => router.visit('/notifications')}
                    onBack={() => router.visit('/challenges')}
                >
                    {content}
                </MobileAppLayout>
            </div>

            <div className="hidden md:block">
                <MobileAppLayout
                    auth={auth}
                    title={challenge.title}
                    activeNav="challenges"
                    unreadCount={auth?.unreadCount || 0}
                    onNotifications={() => router.visit('/notifications')}
                    onBack={() => router.visit('/challenges')}
                >
                    <div className="mx-auto w-full max-w-3xl">
                        {content}
                    </div>
                </MobileAppLayout>
            </div>
        </div>
    );
}
