import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { FaArrowRight, FaCheckCircle, FaTimesCircle, FaTrash, FaUser, FaSchool, FaChalkboardTeacher, FaEye, FaHeart, FaStar, FaFileAlt, FaCalendar, FaStar as FaStarIcon, FaRobot, FaSpinner, FaThumbsUp, FaExclamationTriangle } from 'react-icons/fa';
import { useConfirmDialog } from '@/Contexts/ConfirmContext';
import { useTranslation } from '@/i18n';

export default function AdminProjectShow({ project }) {
    const { confirm } = useConfirmDialog();
    const { t, language } = useTranslation();
    const displayTitle = language === 'ar' ? (project.title_ar || project.title) : (project.title || project.title_ar);
    const displayDescription = language === 'ar' ? (project.description_ar || project.description) : (project.description || project.description_ar);

    const [isEvaluating, setIsEvaluating] = useState(false);
    const [evaluation, setEvaluation] = useState(null);

    const handleEvaluate = async () => {
        setIsEvaluating(true);
        try {
            const axios = (await import('axios')).default;
            const response = await axios.post(route('admin.projects.evaluate', project.id));
            setEvaluation(response.data);
        } catch (error) {
            alert(error.response?.data?.error || t('adminProjectShowPage.aiEvaluation.error'));
        } finally {
            setIsEvaluating(false);
        }
    };

    const recommendationMeta = {
        approve: { label: t('adminProjectShowPage.recommendation.approve'), className: 'bg-green-100 text-green-800' },
        reject: { label: t('adminProjectShowPage.recommendation.reject'), className: 'bg-red-100 text-red-800' },
        needs_revision: { label: t('adminProjectShowPage.recommendation.needsRevision'), className: 'bg-yellow-100 text-yellow-800' },
    };

    const handleApprove = async () => {
        const confirmed = await confirm({
            title: t('adminProjectShowPage.confirm.approve.title'),
            message: t('adminProjectShowPage.confirm.approve.message', { title: displayTitle }),
            confirmText: t('adminProjectShowPage.confirm.approve.confirmText'),
            cancelText: t('common.cancel'),
            variant: 'info',
        });

        if (confirmed) {
            router.post(route('admin.projects.approve', project.id), {}, {
                preserveScroll: true,
            });
        }
    };

    const handleReject = async () => {
        const confirmed = await confirm({
            title: t('adminProjectShowPage.confirm.reject.title'),
            message: t('adminProjectShowPage.confirm.reject.message', { title: displayTitle }),
            confirmText: t('adminProjectShowPage.confirm.reject.confirmText'),
            cancelText: t('common.cancel'),
            variant: 'warning',
        });

        if (confirmed) {
            const reason = prompt(t('adminProjectShowPage.confirm.reject.reasonPrompt'));
            if (reason !== null) {
                router.post(route('admin.projects.reject', project.id), {
                    reason: reason || '',
                }, {
                    preserveScroll: true,
                });
            }
        }
    };

    const handleDelete = async () => {
        const confirmed = await confirm({
            title: t('adminProjectShowPage.confirm.delete.title'),
            message: t('adminProjectShowPage.confirm.delete.message', { title: displayTitle }),
            confirmText: t('adminProjectShowPage.confirm.delete.confirmText'),
            cancelText: t('common.cancel'),
            variant: 'danger',
        });

        if (confirmed) {
            router.delete(route('admin.projects.destroy', project.id));
        }
    };

    const submissionStatusLabel = (status) => {
        if (status === 'approved') return t('adminProjectShowPage.submissions.status.approved');
        if (status === 'rejected') return t('adminProjectShowPage.submissions.status.rejected');
        if (status === 'reviewed') return t('adminProjectShowPage.submissions.status.reviewed');
        return t('adminProjectShowPage.submissions.status.submitted');
    };

    return (
        <DashboardLayout header={t('adminProjectShowPage.headerTitle')}>
            <Head title={`${displayTitle} - ${t('adminProjectShowPage.pageTitleSuffix')}`} />

            <div className="mb-6">
                <Link
                    href={route('admin.projects.index')}
                    className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
                >
                    <FaArrowRight className="transform rotate-180" />
                    {t('adminProjectShowPage.backToList')}
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Project Info */}
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 mb-2">{displayTitle}</h1>
                                {project.category && (
                                    <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                                        {project.category}
                                    </span>
                                )}
                            </div>
                            <span className={`px-4 py-2 rounded-full text-sm font-semibold ${project.status === 'approved' ? 'bg-green-100 text-green-800' :
                                project.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-red-100 text-red-800'
                                }`}>
                                {project.status === 'approved' ? t('adminProjectShowPage.status.approved') :
                                    project.status === 'pending' ? t('adminProjectShowPage.status.pending') : t('adminProjectShowPage.status.rejected')}
                            </span>
                        </div>

                        <div className="prose max-w-none mb-6">
                            <p className="text-gray-700 whitespace-pre-wrap">{displayDescription}</p>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-200">
                            <div className="text-center">
                                <div className="flex items-center justify-center gap-2 text-gray-600 mb-1">
                                    <FaEye />
                                    <span className="text-sm">{t('adminProjectShowPage.stats.views')}</span>
                                </div>
                                <p className="text-2xl font-bold text-gray-900">{project.views || 0}</p>
                            </div>
                            <div className="text-center">
                                <div className="flex items-center justify-center gap-2 text-gray-600 mb-1">
                                    <FaHeart className="text-red-500" />
                                    <span className="text-sm">{t('adminProjectShowPage.stats.likes')}</span>
                                </div>
                                <p className="text-2xl font-bold text-gray-900">{project.likes || 0}</p>
                            </div>
                            <div className="text-center">
                                <div className="flex items-center justify-center gap-2 text-gray-600 mb-1">
                                    <FaStar className="text-yellow-500" />
                                    <span className="text-sm">{t('adminProjectShowPage.stats.rating')}</span>
                                </div>
                                <p className="text-2xl font-bold text-gray-900">{project.rating || '—'}</p>
                            </div>
                        </div>
                    </div>

                    {/* AI Evaluation */}
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <FaRobot className="text-blue-600" />
                                {t('adminProjectShowPage.aiEvaluation.title')}
                            </h2>
                            <button
                                onClick={handleEvaluate}
                                disabled={isEvaluating}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition flex items-center gap-2"
                            >
                                {isEvaluating ? (
                                    <><FaSpinner className="animate-spin" /> {t('adminProjectShowPage.aiEvaluation.evaluating')}</>
                                ) : (
                                    <><FaRobot /> {evaluation ? t('adminProjectShowPage.aiEvaluation.regenerateButton') : t('adminProjectShowPage.aiEvaluation.generateButton')}</>
                                )}
                            </button>
                        </div>

                        {!evaluation && !isEvaluating && (
                            <p className="text-sm text-gray-500">
                                {t('adminProjectShowPage.aiEvaluation.hint')}
                            </p>
                        )}

                        {evaluation && (
                            <div className="space-y-5">
                                <div className="flex items-center gap-4 flex-wrap">
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-4xl font-bold text-blue-700">{evaluation.score}</span>
                                        <span className="text-lg text-gray-500">/100</span>
                                    </div>
                                    {evaluation.recommendation && recommendationMeta[evaluation.recommendation] && (
                                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${recommendationMeta[evaluation.recommendation].className}`}>
                                            {recommendationMeta[evaluation.recommendation].label}
                                        </span>
                                    )}
                                </div>

                                {evaluation.summary && (
                                    <p className="text-gray-700 whitespace-pre-wrap">{evaluation.summary}</p>
                                )}

                                {evaluation.strengths && evaluation.strengths.length > 0 && (
                                    <div>
                                        <h3 className="text-sm font-bold text-green-700 flex items-center gap-2 mb-2">
                                            <FaThumbsUp /> {t('adminProjectShowPage.aiEvaluation.strengthsTitle')}
                                        </h3>
                                        <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                                            {evaluation.strengths.map((item, index) => (
                                                <li key={index}>{item}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {evaluation.weaknesses && evaluation.weaknesses.length > 0 && (
                                    <div>
                                        <h3 className="text-sm font-bold text-amber-700 flex items-center gap-2 mb-2">
                                            <FaExclamationTriangle /> {t('adminProjectShowPage.aiEvaluation.weaknessesTitle')}
                                        </h3>
                                        <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                                            {evaluation.weaknesses.map((item, index) => (
                                                <li key={index}>{item}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {evaluation.recommendation_text && (
                                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-sm text-blue-800">
                                        {evaluation.recommendation_text}
                                    </div>
                                )}

                                <p className="text-xs text-gray-400">
                                    {t('adminProjectShowPage.aiEvaluation.disclaimer')}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Files and Images */}
                    {(project.files && project.files.length > 0) || (project.images && project.images.length > 0) ? (
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">{t('adminProjectShowPage.filesImages.title')}</h2>

                            {project.images && project.images.length > 0 && (
                                <div className="mb-6">
                                    <h3 className="text-lg font-semibold text-gray-700 mb-3">{t('adminProjectShowPage.filesImages.imagesTitle')}</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        {project.images.map((image, index) => (
                                            <img
                                                key={index}
                                                src={image}
                                                alt={t('adminProjectShowPage.filesImages.imageAlt', { n: index + 1 })}
                                                className="w-full h-48 object-cover rounded-lg"
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {project.files && project.files.length > 0 && (
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-700 mb-3">{t('adminProjectShowPage.filesImages.filesTitle')}</h3>
                                    <div className="space-y-2">
                                        {project.files.map((file, index) => (
                                            <a
                                                key={index}
                                                href={file}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
                                            >
                                                <span className="text-blue-600 font-medium">{file}</span>
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : null}

                    {/* Submissions Section */}
                    {project.submissions && project.submissions.length > 0 && (
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">{t('adminProjectShowPage.submissions.title', { count: project.submissions.length })}</h2>
                            <div className="space-y-4">
                                {project.submissions.map((submission) => (
                                    <div key={submission.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <FaUser className="text-blue-500" />
                                                    <div>
                                                        <p className="font-semibold text-gray-900">{submission.student.name}</p>
                                                        <p className="text-sm text-gray-600">{submission.student.email}</p>
                                                    </div>
                                                </div>
                                                {submission.comment && (
                                                    <p className="text-sm text-gray-700 mb-2 mt-2">{submission.comment}</p>
                                                )}
                                                <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
                                                    <div className="flex items-center gap-1">
                                                        <FaCalendar />
                                                        <span>{submission.submitted_at || t('adminProjectShowPage.submissions.notSet')}</span>
                                                    </div>
                                                    {submission.rating && (
                                                        <div className="flex items-center gap-1">
                                                            <FaStarIcon className="text-yellow-500" />
                                                            <span>{submission.rating}/5</span>
                                                        </div>
                                                    )}
                                                    <span className={`px-2 py-1 rounded text-xs font-medium ${submission.status === 'approved' ? 'bg-green-100 text-green-800' :
                                                        submission.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                                            submission.status === 'reviewed' ? 'bg-blue-100 text-blue-800' :
                                                                'bg-gray-100 text-gray-800'
                                                        }`}>
                                                        {submissionStatusLabel(submission.status)}
                                                    </span>
                                                </div>
                                            </div>
                                            <Link
                                                href={route('admin.submissions.show', submission.id)}
                                                className="me-4 px-4 py-2 bg-[#A3C042] text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                                            >
                                                <FaEye />
                                                {submission.status === 'submitted' ? t('adminProjectShowPage.submissions.actionEvaluate') : t('adminProjectShowPage.submissions.actionView')}
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Project Details */}
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">{t('adminProjectShowPage.sidebar.projectInfoTitle')}</h2>

                        <div className="space-y-4">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">{t('adminProjectShowPage.sidebar.createdAt')}</p>
                                <p className="font-semibold text-gray-900">{project.created_at}</p>
                            </div>
                            {project.approved_at && (
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">{t('adminProjectShowPage.sidebar.approvedAt')}</p>
                                    <p className="font-semibold text-gray-900">{project.approved_at}</p>
                                </div>
                            )}
                            {project.points_earned > 0 && (
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">{t('adminProjectShowPage.sidebar.pointsEarned')}</p>
                                    <p className="font-semibold text-green-600">{project.points_earned}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Student/Publisher Info */}
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <FaUser className="text-blue-500" />
                            {project.user?.role === 'admin' ? t('adminProjectShowPage.sidebar.publisherTitle') : t('adminProjectShowPage.sidebar.studentInfoTitle')}
                        </h2>
                        <div className="space-y-2">
                            <p className="font-semibold text-gray-900">{project.student?.name || project.user?.name}</p>
                            <p className="text-sm text-gray-600">{project.student?.email || project.user?.email}</p>
                        </div>
                    </div>

                    {/* School Info */}
                    {project.school ? (
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <FaSchool className="text-green-500" />
                                {t('adminProjectShowPage.sidebar.belongsToSchoolTitle')}
                            </h2>
                            <p className="font-semibold text-gray-900">{project.school.name}</p>
                        </div>
                    ) : project.user?.role === 'admin' ? (
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <FaSchool className="text-purple-500" />
                                {t('adminProjectShowPage.sidebar.sourceTitle')}
                            </h2>
                            <p className="font-semibold text-gray-900">{t('adminProjectShowPage.sidebar.fromAdminCommunity')}</p>
                        </div>
                    ) : null}

                    {/* Teacher Info - لا يعرض إذا كان المشروع من الإدارة */}
                    {project.teacher && project.user?.role !== 'admin' && (
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <FaChalkboardTeacher className="text-purple-500" />
                                {t('adminProjectShowPage.sidebar.teacherTitle')}
                            </h2>
                            <p className="font-semibold text-gray-900">{project.teacher.name}</p>
                        </div>
                    )}

                    {/* Actions */}
                    {project.status !== 'approved' && (
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">{t('adminProjectShowPage.actions.title')}</h2>
                            <div className="space-y-3">
                                {project.status === 'pending' && (
                                    <button
                                        onClick={handleApprove}
                                        className="w-full bg-[#A3C042] hover:bg-[#8CA635] text-white font-semibold py-2 px-4 rounded-lg flex items-center justify-center gap-2"
                                    >
                                        <FaCheckCircle />
                                        {t('adminProjectShowPage.actions.approve')}
                                    </button>
                                )}
                                {project.status === 'pending' && (
                                    <button
                                        onClick={handleReject}
                                        className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center justify-center gap-2"
                                    >
                                        <FaTimesCircle />
                                        {t('adminProjectShowPage.actions.reject')}
                                    </button>
                                )}
                                <button
                                    onClick={handleDelete}
                                    className="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center justify-center gap-2"
                                >
                                    <FaTrash />
                                    {t('adminProjectShowPage.actions.delete')}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
