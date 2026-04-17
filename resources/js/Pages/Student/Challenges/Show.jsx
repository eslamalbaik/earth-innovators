import { Head, Link, useForm, router } from '@inertiajs/react';
import MobileAppLayout from '@/Layouts/MobileAppLayout';
import { useState, useRef } from 'react';
import {
    FaArrowLeft,
    FaUpload,
    FaCloudUploadAlt,
    FaTrash,
    FaFile,
    FaSpinner,
    FaCalendar,
    FaTrophy,
    FaUsers,
    FaCheckCircle,
    FaClock,
    FaTimesCircle,
    FaStar,
    FaAward
} from 'react-icons/fa';
import TextInput from '../../../Components/TextInput';
import InputLabel from '../../../Components/InputLabel';
import InputError from '../../../Components/InputError';
import PrimaryButton from '../../../Components/PrimaryButton';
import { useTranslation } from '@/i18n';
import { usePremiumGate } from '@/Hooks/usePremiumGate';

export default function StudentChallengeShow({ auth, challenge, membershipSummary = null }) {
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

    const getChallengeTypeLabel = (type) => {
        const labels = {
            cognitive: t('challenges.cognitive'),
            applied: t('challenges.applied'),
            creative: t('challenges.creative'),
            artistic_creative: t('challenges.artisticCreative'),
            collaborative: t('challenges.collaborative'),
            analytical: t('challenges.analytical'),
            technological: t('challenges.technological'),
            behavioral: t('challenges.behavioral'),
            '60_seconds': t('challenges.minseconds'),
            mental_math: t('challenges.mentalMath'),
            conversions: t('challenges.conversions'),
            team_fastest: t('challenges.teamFastest'),
            build_problem: t('challenges.buildProblem'),
            custom: t('studentChallengesShowPage.types.custom'),
        };
        return labels[type] || type;
    };

    const getStatusBadge = () => {
        const now = new Date();
        const startDate = new Date(challenge.start_date);
        const deadline = new Date(challenge.deadline);

        if (challenge.status === 'active' && startDate <= now && deadline >= now) {
            return { bg: 'bg-green-100', text: 'text-green-800', label: t('common.active'), icon: FaCheckCircle };
        } else if (challenge.status === 'active' && startDate > now) {
            return { bg: 'bg-blue-100', text: 'text-blue-800', label: t('common.upcoming'), icon: FaClock };
        } else {
            return { bg: 'bg-gray-100', text: 'text-gray-800', label: t('studentChallengesIndexPage.status.finished'), icon: FaTimesCircle };
        }
    };

    const getSubmissionStatusLabel = (status) => {
        const map = {
            submitted: t('studentChallengesIndexPage.submissionStatuses.submitted'),
            reviewed: t('studentChallengesIndexPage.submissionStatuses.reviewed'),
            approved: t('studentChallengesIndexPage.submissionStatuses.approved'),
            rejected: t('studentChallengesIndexPage.submissionStatuses.rejected'),
        };
        return map[status] || status;
    };

    const handleFiles = (files) => {
        const fileArray = Array.from(files);
        const validFiles = fileArray.filter(file => {
            const maxSize = 10 * 1024 * 1024; // 10 MB
            if (file.size > maxSize) {
                alert(t('studentChallengesShowPage.errors.fileTooLarge', { name: file.name }));
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
        setFileList(prev => {
            const filtered = prev.filter(f => f.id !== fileId);
            const filesToKeep = filtered.map(f => f.file);
            submissionForm.setData('files', filesToKeep);
            return filtered;
        });
    };

    const formatFileSize = (bytes) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    };

    const submitChallenge = (e) => {
        e.preventDefault();
        gate(() => {
        // Validate that at least answer or files are provided
        if (!submissionForm.data.answer?.trim() && fileList.length === 0) {
            alert(t('studentChallengesShowPage.errors.answerOrFileRequired'));
            return;
        }

        const route = existingSubmission
            ? `/student/challenges/${challenge.id}/submissions/${existingSubmission.id}`
            : `/student/challenges/${challenge.id}/submit`;

        const method = existingSubmission ? 'put' : 'post';

        submissionForm[method](route, {
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
        }); // end gate
    };

    const statusBadge = getStatusBadge();
    const StatusIcon = statusBadge.icon;
    const isActive = challenge.status === 'active' &&
        new Date(challenge.start_date) <= new Date() &&
        new Date(challenge.deadline) >= new Date();

    const renderChallengeContent = (
        <div className="space-y-4">
            {/* Challenge Header */}
            <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-4">
                <div className="mb-3">
                    <div className="flex items-center gap-2 mb-2">
                        <FaTrophy className="text-yellow-600 text-xl" />
                        <h1 className="text-lg font-extrabold text-gray-900 flex-1">{challenge.title}</h1>
                        <span className={`px-2 py-1 ${statusBadge.bg} ${statusBadge.text} text-xs font-semibold rounded-full flex items-center gap-1`}>
                            <StatusIcon className="text-[10px]" />
                            {statusBadge.label}
                        </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                            {getChallengeTypeLabel(challenge.challenge_type)}
                        </span>
                        {challenge.points_reward > 0 && (
                            <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full flex items-center gap-1">
                                <FaStar className="text-[10px]" />
                                {challenge.points_reward} {t('common.point')}
                            </span>
                        )}
                        {challenge.max_participants && (
                            <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full flex items-center gap-1">
                                <FaUsers className="text-[10px]" />
                                {challenge.current_participants || 0} / {challenge.max_participants}
                            </span>
                        )}
                    </div>
                </div>

                <div className="space-y-2 text-xs text-gray-600 pt-3 border-t border-gray-200">
                    <div className="flex items-center gap-2">
                        <FaCalendar className="text-gray-400" />
                        <span><strong>{t('adminChallengesIndexPage.table.startDate')}:</strong> {formatDate(challenge.start_date)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <FaCalendar className="text-gray-400" />
                        <span><strong>{t('adminChallengesIndexPage.table.endDate')}:</strong> {formatDate(challenge.deadline)}</span>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide border-b border-gray-200">
                <button
                    onClick={() => setActiveTab('details')}
                    className={`whitespace-nowrap px-4 py-2 text-sm font-bold border-b-2 transition ${activeTab === 'details'
                        ? 'border-[#A3C042] text-[#A3C042]'
                        : 'border-transparent text-gray-600'
                        }`}
                >
                    {t('studentChallengesShowPage.tabs.details')}
                </button>
                {isActive && (
                    <button
                        onClick={() => setActiveTab('submit')}
                        className={`whitespace-nowrap px-4 py-2 text-sm font-bold border-b-2 transition ${activeTab === 'submit'
                            ? 'border-[#A3C042] text-[#A3C042]'
                            : 'border-transparent text-gray-600'
                            }`}
                    >
                        {existingSubmission ? t('studentChallengesShowPage.tabs.updateSubmission') : t('studentChallengesShowPage.tabs.submitSolution')}
                    </button>
                )}
            </div>

            {/* Details Tab */}
            {activeTab === 'details' && (
                <div className="space-y-4">
                    {challenge.objective && (
                        <div className="bg-white rounded-2xl border border-gray-100 p-4">
                            <h3 className="text-sm font-bold text-gray-900 mb-2">{t('studentChallengesShowPage.sections.objective')}</h3>
                            <p className="text-sm text-gray-700">{challenge.objective}</p>
                        </div>
                    )}

                    {challenge.description && (
                        <div className="bg-white rounded-2xl border border-gray-100 p-4">
                            <h3 className="text-sm font-bold text-gray-900 mb-2">{t('studentChallengesShowPage.sections.description')}</h3>
                            <p className="text-sm text-gray-700 whitespace-pre-line">{challenge.description}</p>
                        </div>
                    )}

                    {challenge.instructions && (
                        <div className="bg-white rounded-2xl border border-gray-100 p-4">
                            <h3 className="text-sm font-bold text-gray-900 mb-2">{t('studentChallengesShowPage.sections.howTo')}</h3>
                            <p className="text-sm text-gray-700 whitespace-pre-line">{challenge.instructions}</p>
                        </div>
                    )}

                    {existingSubmission && (
                        <div className="bg-blue-50 rounded-2xl border-2 border-blue-200 p-4">
                            <h3 className="text-sm font-bold text-gray-900 mb-3">{t('studentChallengesShowPage.submissionStatus.title')}</h3>
                            <div className="space-y-2 text-sm">
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
                                        <p className="text-gray-700 mt-1">{existingSubmission.feedback}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Submit Tab */}
            {activeTab === 'submit' && isActive && (
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
                                <p className="text-sm text-gray-700 mb-2">
                                    {t('studentChallengesShowPage.form.dropzoneTitle')}
                                </p>
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
                                            <button
                                                type="button"
                                                onClick={() => removeFile(file.id)}
                                                className="text-red-500 hover:text-red-700"
                                            >
                                                <FaTrash className="text-xs" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <InputError message={submissionForm.errors.files} className="mt-2" />
                        </div>

                        <div className="flex justify-end">
                            <PrimaryButton
                                disabled={submissionForm.processing}
                                className="bg-[#A3C042] hover:bg-[#8CA635] text-sm"
                            >
                                {submissionForm.processing ? (
                                    <>
                                        <FaSpinner className="animate-spin me-2" />
                                        {t('studentChallengesShowPage.actions.sending')}
                                    </>
                                ) : (
                                    <>
                                        <FaUpload className="me-2" />
                                        {existingSubmission ? t('studentChallengesShowPage.tabs.updateSubmission') : t('studentChallengesShowPage.tabs.submitSolution')}
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
            <Head title={t('studentChallengesShowPage.pageTitle', { title: challenge.title, appName: t('common.appName') })} />

            {/* Mobile View */}
            <div className="block md:hidden">
                <MobileAppLayout
                    auth={auth}
                    title={challenge.title}
                    activeNav="challenges"
                    unreadCount={auth?.unreadCount || 0}
                    onNotifications={() => router.visit('/notifications')}
                    onBack={() => router.visit('/student/challenges')}
                >
                    {renderChallengeContent}
                </MobileAppLayout>
            </div>

            {/* Desktop View */}
            <div className="hidden md:block">
                <MobileAppLayout
                    auth={auth}
                    title={challenge.title}
                    activeNav="challenges"
                    unreadCount={auth?.unreadCount || 0}
                    onNotifications={() => router.visit('/notifications')}
                    onBack={() => router.visit('/student/challenges')}
                >
                    <div className="mx-auto w-full max-w-3xl">
                        {renderChallengeContent}
                    </div>
                </MobileAppLayout>
            </div>
        </div>
    );
}

