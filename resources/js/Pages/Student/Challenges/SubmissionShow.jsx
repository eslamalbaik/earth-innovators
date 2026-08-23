import { Head, Link } from '@inertiajs/react';
import StudentLayout from '@/Layouts/StudentLayout';
import {
    FaArrowLeft,
    FaFile,
    FaCalendar,
    FaCheckCircle,
    FaClock,
    FaTimesCircle,
    FaStar,
    FaAward,
    FaUser,
    FaDownload
} from 'react-icons/fa';
import { getProjectFileUrl } from '@/utils/imageUtils';
import { useTranslation } from '@/i18n';

const MONTH_KEYS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];

export default function StudentChallengeSubmissionShow({ auth, challenge, submission }) {
    const { t } = useTranslation();

    const formatDate = (date) => {
        if (!date) return '';
        const d = new Date(date);
        return `${d.getDate()} ${t(`common.${MONTH_KEYS[d.getMonth()]}`)} ${d.getFullYear()} - ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
    };

    const getStatusBadge = (status) => {
        const badges = {
            submitted: {
                bg: 'bg-yellow-100',
                text: 'text-yellow-800',
                label: t('studentChallengeSubmissionShowPage.status.submitted.label'),
                icon: FaClock,
                description: t('studentChallengeSubmissionShowPage.status.submitted.description')
            },
            reviewed: {
                bg: 'bg-blue-100',
                text: 'text-blue-800',
                label: t('studentChallengeSubmissionShowPage.status.reviewed.label'),
                icon: FaClock,
                description: t('studentChallengeSubmissionShowPage.status.reviewed.description')
            },
            approved: {
                bg: 'bg-green-100',
                text: 'text-green-800',
                label: t('studentChallengeSubmissionShowPage.status.approved.label'),
                icon: FaCheckCircle,
                description: t('studentChallengeSubmissionShowPage.status.approved.description')
            },
            rejected: {
                bg: 'bg-red-100',
                text: 'text-red-800',
                label: t('studentChallengeSubmissionShowPage.status.rejected.label'),
                icon: FaTimesCircle,
                description: t('studentChallengeSubmissionShowPage.status.rejected.description')
            },
        };
        const badge = badges[status] || badges.submitted;
        const Icon = badge.icon;
        return (
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg ${badge.bg} ${badge.text}`}>
                <Icon className="text-lg" />
                <div>
                    <div className="font-bold text-lg">{badge.label}</div>
                    <div className="text-sm opacity-80">{badge.description}</div>
                </div>
            </div>
        );
    };

    const getFileUrl = (filePath) => {
        if (!filePath) return null;
        return getProjectFileUrl(filePath);
    };

    return (
        <StudentLayout
            auth={auth}
            title={challenge?.title || t('studentChallengeSubmissionShowPage.pageTitleFallback')}
            activeNav="challenges"
            onBack={() => window.history.back()}
            desktopMainClassName="mx-auto w-full max-w-4xl px-4 pb-24 pt-4"
        >
            <Head title={t('studentChallengeSubmissionShowPage.pageTitle', { title: challenge?.title || t('studentChallengeSubmissionShowPage.challengeFallback') })} />

            <div className="py-4 sm:px-2 lg:px-0">
                {/* Back Button */}
                <div className="mb-6">
                    <Link
                        href={`/student/challenges/${challenge?.id}`}
                        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
                    >
                        <FaArrowLeft />
                        {t('studentChallengeSubmissionShowPage.backToChallenge')}
                    </Link>
                </div>

                {/* Challenge Info */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        {challenge?.title}
                    </h1>
                    <p className="text-gray-600">{challenge?.objective}</p>
                </div>

                {/* Submission Status Card */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">{t('studentChallengeSubmissionShowPage.sections.submissionStatus')}</h2>
                    <div className="mb-6">
                        {getStatusBadge(submission?.status)}
                    </div>

                    {/* Submission Details */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-gray-600">
                            <FaCalendar className="text-sm" />
                            <span className="font-semibold">{t('studentChallengeSubmissionShowPage.meta.submittedAt')}:</span>
                            <span>{formatDate(submission?.submitted_at)}</span>
                        </div>

                        {submission?.reviewed_at && (
                            <div className="flex items-center gap-2 text-gray-600">
                                <FaCalendar className="text-sm" />
                                <span className="font-semibold">{t('studentChallengeSubmissionShowPage.meta.reviewedAt')}:</span>
                                <span>{formatDate(submission?.reviewed_at)}</span>
                            </div>
                        )}

                        {submission?.reviewer && (
                            <div className="flex items-center gap-2 text-gray-600">
                                <FaUser className="text-sm" />
                                <span className="font-semibold">{t('studentChallengeSubmissionShowPage.meta.reviewer')}:</span>
                                <span>{submission.reviewer.name}</span>
                            </div>
                        )}

                        {submission?.rating !== null && (
                            <div className="flex items-center gap-2 text-gray-600">
                                <FaStar className="text-yellow-500" />
                                <span className="font-semibold">{t('studentChallengeSubmissionShowPage.meta.rating')}:</span>
                                <div className="flex items-center gap-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <FaStar
                                            key={star}
                                            className={star <= submission.rating ? 'text-yellow-500' : 'text-gray-300'}
                                        />
                                    ))}
                                    <span className="ms-2">({submission.rating}/5)</span>
                                </div>
                            </div>
                        )}

                        {submission?.points_earned > 0 && (
                            <div className="flex items-center gap-2 text-gray-600">
                                <FaAward className="text-green-500" />
                                <span className="font-semibold">{t('studentChallengeSubmissionShowPage.meta.pointsEarned')}:</span>
                                <span className="text-green-600 font-bold">{submission.points_earned}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Submission Content */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">{t('studentChallengeSubmissionShowPage.sections.submissionContent')}</h2>

                    {submission?.answer && (
                        <div className="mb-6">
                            <h3 className="font-semibold text-gray-900 mb-2">{t('studentChallengeSubmissionShowPage.content.answer')}</h3>
                            <div className="bg-gray-50 rounded-lg p-4 text-gray-700 whitespace-pre-line">
                                {submission.answer}
                            </div>
                        </div>
                    )}

                    {submission?.comment && (
                        <div className="mb-6">
                            <h3 className="font-semibold text-gray-900 mb-2">{t('studentChallengeSubmissionShowPage.content.yourComment')}</h3>
                            <div className="bg-gray-50 rounded-lg p-4 text-gray-700 whitespace-pre-line">
                                {submission.comment}
                            </div>
                        </div>
                    )}

                    {submission?.files && Array.isArray(submission.files) && submission.files.length > 0 && (
                        <div>
                            <h3 className="font-semibold text-gray-900 mb-2">{t('studentChallengeSubmissionShowPage.content.attachedFiles')}</h3>
                            <div className="space-y-2">
                                {submission.files.map((file, index) => {
                                    const fileUrl = getFileUrl(file);
                                    const fileName = typeof file === 'string' ? file.split('/').pop() : t('studentChallengeSubmissionShowPage.content.fileFallback', { n: index + 1 });
                                    return (
                                        <div key={index} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                                            <div className="flex items-center gap-2">
                                                <FaFile className="text-gray-400" />
                                                <span className="text-gray-700">{fileName}</span>
                                            </div>
                                            {fileUrl && (
                                                <a
                                                    href={fileUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition text-sm"
                                                >
                                                    <FaDownload />
                                                    {t('studentChallengeSubmissionShowPage.content.download')}
                                                </a>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* Feedback */}
                {submission?.feedback && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">{t('studentChallengeSubmissionShowPage.sections.reviewerFeedback')}</h2>
                        <div className="bg-blue-50 rounded-lg p-4 text-gray-700 whitespace-pre-line border-r-4 border-blue-500">
                            {submission.feedback}
                        </div>
                    </div>
                )}
            </div>
        </StudentLayout>
    );
}
