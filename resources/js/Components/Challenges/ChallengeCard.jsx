import { Link, router } from '@inertiajs/react';
import { FaTrophy, FaUsers, FaClock, FaGraduationCap, FaCheckCircle } from 'react-icons/fa';
import PrimaryButton from '../PrimaryButton';
import { useState } from 'react';

export default function ChallengeCard({ challenge, user, participation = null, onJoin = null }) {
    const isParticipating = participation !== null;
    const isCompleted = participation?.status === 'completed';
    const canJoin = user?.role === 'student' && !isParticipating && challenge.status === 'active';
    const [imageError, setImageError] = useState(false);

    const getImageUrl = () => {
        const imagePath = challenge.image_url || challenge.image;

        if (!imagePath) return null;

        if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
            return imagePath;
        }
        if (imagePath.startsWith('/storage/')) {
            return imagePath;
        }
        return `/storage/${imagePath}`;
    };

    const getRemainingTime = () => {
        if (!challenge.deadline) return null;

        const deadline = new Date(challenge.deadline);
        const now = new Date();
        const diff = deadline - now;

        if (diff <= 0) return 'انتهى';

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

        if (days > 0) {
            return `${days} يوم${days > 1 ? '' : ''}`;
        } else if (hours > 0) {
            return `${hours} ساعة`;
        } else {
            return 'أقل من ساعة';
        }
    };

    const getProgressPercentage = () => {
        if (!challenge.max_participants) return 0;
        return Math.min(100, (challenge.current_participants / challenge.max_participants) * 100);
    };

    const remainingTime = getRemainingTime();
    const progressPercentage = getProgressPercentage();

    const handleJoin = (e) => {
        e.preventDefault();
        e.stopPropagation();
        fetch('http://127.0.0.1:7242/ingest/cb079044-789c-411c-8e05-52ec32393947', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'ChallengeCard.jsx:59', message: 'handleJoin called', data: { challengeId: challenge.id, userId: user?.id, userRole: user?.role }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'A' }) }).catch(() => { });
        if (onJoin) {
            onJoin(challenge.id);
        } else {
            if (user?.role === 'student') {
                fetch('http://127.0.0.1:7242/ingest/cb079044-789c-411c-8e05-52ec32393947', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'ChallengeCard.jsx:69', message: 'Posting to student join route', data: { url: `/student/challenges/${challenge.id}/join` }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'B' }) }).catch(() => { });

                router.post(`/student/challenges/${challenge.id}/join`, {}, {
                    preserveScroll: false,
                    preserveState: false,
                    onSuccess: (page) => {
                        fetch('http://127.0.0.1:7242/ingest/cb079044-789c-411c-8e05-52ec32393947', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'ChallengeCard.jsx:78', message: 'Join success callback', data: { pageUrl: page?.url, challengeId: challenge.id }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run2', hypothesisId: 'C' }) }).catch(() => { });
                        const targetUrl = `/student/challenges/${challenge.id}`;
                        const currentUrl = window.location.pathname;
                        fetch('http://127.0.0.1:7242/ingest/cb079044-789c-411c-8e05-52ec32393947', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'ChallengeCard.jsx:85', message: 'Before redirect', data: { targetUrl, currentUrl, willRedirect: currentUrl !== targetUrl }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run2', hypothesisId: 'E' }) }).catch(() => { });

                        if (currentUrl !== targetUrl) {
                            fetch('http://127.0.0.1:7242/ingest/cb079044-789c-411c-8e05-52ec32393947', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'ChallengeCard.jsx:91', message: 'Calling router.visit', data: { targetUrl }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run2', hypothesisId: 'F' }) }).catch(() => { });
                            router.visit(targetUrl);
                        }
                    },
                    onError: (errors) => {
                        fetch('http://127.0.0.1:7242/ingest/cb079044-789c-411c-8e05-52ec32393947', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'ChallengeCard.jsx:95', message: 'Join error callback', data: { errors: JSON.stringify(errors) }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run2', hypothesisId: 'D' }) }).catch(() => { });
                    },
                    onFinish: () => {
                        fetch('http://127.0.0.1:7242/ingest/cb079044-789c-411c-8e05-52ec32393947', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'ChallengeCard.jsx:101', message: 'Join request finished', data: {}, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run2', hypothesisId: 'G' }) }).catch(() => { });
                    },
                });
            } else {
                router.post(`/api/challenges/${challenge.id}/join`, {}, {
                    preserveScroll: true,
                    onSuccess: () => {
                        router.visit(`/challenges/${challenge.id}`);
                    },
                    onError: (errors) => {
                    },
                });
            }
        }
    };

    const getStatusBadge = () => {
        if (isCompleted) {
            return (
                <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded flex items-center gap-1">
                    <FaCheckCircle className="text-xs" />
                    مكتمل
                </span>
            );
        }

        if (isParticipating) {
            return (
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                    مشارك
                </span>
            );
        }

        if (challenge.status === 'active') {
            return (
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                    نشط
                </span>
            );
        }

        return (
            <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded">
                {challenge.status === 'upcoming' ? 'قادم' : 'منتهي'}
            </span>
        );
    };

    const imageUrl = getImageUrl();

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition duration-300 overflow-hidden group">
            <Link
                href={`/challenges/${challenge.id}`}
                className="block"
            >
                {imageUrl && !imageError && (
                    <div className="w-full h-48 overflow-hidden bg-gray-100">
                        <img
                            src={imageUrl}
                            alt={challenge.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={() => setImageError(true)}
                        />
                    </div>
                )}

                <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <FaTrophy className="text-yellow-600 text-xl" />
                            {getStatusBadge()}
                        </div>
                        {challenge.challenge_type && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                                {challenge.challenge_type_label || challenge.challenge_type}
                            </span>
                        )}
                    </div>

                    <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition">
                        {challenge.title}
                    </h3>

                    {challenge.objective && (
                        <p className="text-gray-600 text-sm mb-2">
                            <span className="font-semibold">الهدف:</span> {challenge.objective}
                        </p>
                    )}

                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {challenge.description}
                    </p>

                    {challenge.max_participants && (
                        <div className="mb-4">
                            <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                                <span>المشاركون</span>
                                <span>{challenge.current_participants || 0} / {challenge.max_participants}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-[#A3C042] h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${progressPercentage}%` }}
                                />
                            </div>
                        </div>
                    )}

                    <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-200 mb-4">
                        <div className="flex items-center gap-2">
                            <FaGraduationCap className="text-gray-400" />
                            <span>{challenge.creator?.name || challenge.school?.name || 'مستخدم'}</span>
                        </div>
                        {remainingTime && (
                            <div className="flex items-center gap-2">
                                <FaClock className="text-gray-400" />
                                <span>{remainingTime}</span>
                            </div>
                        )}
                    </div>

                    {challenge.points_reward > 0 && (
                        <div className="mb-4">
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-50 border border-yellow-200 rounded-full">
                                <FaTrophy className="text-yellow-600 text-sm" />
                                <span className="text-sm font-semibold text-yellow-800">
                                    {challenge.points_reward} نقطة
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </Link>

            {canJoin && (
                <div className="px-6 pb-6">
                    <PrimaryButton
                        onClick={handleJoin}
                        className="w-full"
                    >
                        انضم الآن
                    </PrimaryButton>
                </div>
            )}

            {isParticipating && !isCompleted && (
                <div className="px-6 pb-6">
                    <Link
                        href={`/challenges/${challenge.id}`}
                        className="block w-full text-center px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition"
                    >
                        استمر في التحدي
                    </Link>
                </div>
            )}

            {isCompleted && (
                <div className="px-6 pb-6">
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                            {participation.points_earned > 0 && (
                                <span className="font-semibold text-green-600">
                                    +{participation.points_earned} نقطة
                                </span>
                            )}
                            {participation.rank && (
                                <span className="ml-2">
                                    الترتيب: #{participation.rank}
                                </span>
                            )}
                        </div>
                        <Link
                            href={`/challenges/${challenge.id}`}
                            className="text-sm text-blue-600 hover:text-blue-800"
                        >
                            عرض التفاصيل
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}
