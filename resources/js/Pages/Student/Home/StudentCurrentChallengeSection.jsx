import { FaCalendarAlt, FaUsers, FaTrophy, FaClock } from 'react-icons/fa';
import { Link } from '@inertiajs/react';
import { useTranslation } from '@/i18n';

function ChallengeCard({ challenge, onJoin, t }) {
    if (!challenge) return null;

    const deadline = challenge.deadline ? new Date(challenge.deadline) : null;
    const daysRemaining = deadline ? Math.ceil((deadline - new Date()) / (1000 * 60 * 60 * 24)) : null;
    const participantsCount = challenge.participants_count || challenge.submissions_count || 0;
    const pointsReward = challenge.points_reward || challenge.reward_points || 0;
    const minParticipants = challenge.min_participants || 0;
    const progressPercent = minParticipants > 0 ? Math.min(100, (participantsCount / minParticipants) * 100) : 0;

    const getChallengeImage = () => {
        if (challenge.image_url) return challenge.image_url;
        if (challenge.image) return `/storage/${challenge.image}`;
        return '/images/subjects/image1.png';
    };

    const formatDate = (date) => {
        if (!date) return '';
        try {
            const dateObj = new Date(date);
            const now = new Date();
            const diffTime = Math.abs(now - dateObj);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays === 0) return t('homePage.relativeDates.today');
            if (diffDays === 1) return t('homePage.relativeDates.oneDayAgo');
            if (diffDays < 7) return t('homePage.relativeDates.daysAgo', { count: diffDays });
            if (diffDays < 30) return t('homePage.relativeDates.weeksAgo', { count: Math.floor(diffDays / 7) });
            return t('homePage.relativeDates.monthsAgo', { count: Math.floor(diffDays / 30) });
        } catch {
            return '';
        }
    };

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition overflow-hidden">
            <div className="relative">
                <img
                    src={getChallengeImage()}
                    alt={challenge.title || t('homePage.challengeAlt')}
                    className="h-40 w-full object-cover"
                    loading="lazy"
                    onError={(e) => {
                        e.target.src = '/images/subjects/image1.png';
                    }}
                />
                {pointsReward > 0 && (
                    <div className="absolute top-3 right-3 rounded-lg bg-[#A3C042]/20 border border-[#A3C042]/30 px-2 py-1 text-[11px] font-bold text-[#6b7f2c]">
                        {t('homePage.challengePointsLabel', { points: pointsReward })}
                    </div>
                )}
            </div>

            <div className="p-4">
                <h3 className="text-sm font-extrabold text-gray-900 line-clamp-2 mb-1">
                    {challenge.title}
                </h3>
                <p className="text-xs text-gray-500 line-clamp-2 mb-3">
                    {challenge.description || challenge.objective || ''}
                </p>

                <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                    {deadline && (
                        <div className="flex items-center gap-2">
                            <FaCalendarAlt className="text-gray-400" />
                            <span>
                                {daysRemaining !== null && daysRemaining > 0
                                    ? t('homePage.challengeEndsIn', { days: daysRemaining })
                                    : deadline < new Date()
                                        ? t('homePage.challengeEnded')
                                        : formatDate(deadline)}
                            </span>
                        </div>
                    )}
                    <div className="flex items-center gap-2">
                        <FaUsers className="text-gray-400" />
                        <span>{t('homePage.challengeParticipants', { count: participantsCount })}</span>
                    </div>
                </div>

                {minParticipants > 0 && (
                    <div className="mt-3">
                        <div className="flex items-center justify-between text-[11px] text-gray-400 mb-1">
                            <span>{t('homePage.challengeMinParticipants', { count: minParticipants })}</span>
                            <span>{Math.round(progressPercent)}%</span>
                        </div>
                        <div className="mt-2 h-2 w-full rounded-full bg-gray-100 overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-l from-[#A3C042] to-[#8CA635] rounded-full transition-all"
                                style={{ width: `${progressPercent}%` }}
                            />
                        </div>
                    </div>
                )}

                <Link
                    href={`/student/challenges/${challenge.id}`}
                    onClick={(e) => {
                        if (onJoin) {
                            e.preventDefault();
                            onJoin(challenge.id);
                        }
                    }}
                    className="mt-4 w-full block text-center rounded-xl bg-[#A3C042] py-2 text-sm font-bold text-white hover:bg-[#8CA635] transition"
                >
                    {challenge.has_submission ? t('homePage.viewSubmissionButton') : t('homePage.challengeJoinNow')}
                </Link>
            </div>
        </div>
    );
}

export default function StudentCurrentChallengeSection({ challenges = [], onViewAll, onJoin }) {
    const { t } = useTranslation();
    const activeChallenges = Array.isArray(challenges) ? challenges.slice(0, 2) : [];

    if (activeChallenges.length === 0) {
        return (
            <section>
                <div className="flex items-center justify-between px-1 mb-3">
                    <div className="text-sm font-bold text-gray-900">{t('homePage.activeChallengesTitle')}</div>
                    <button
                        type="button"
                        onClick={onViewAll}
                        className="text-xs font-semibold text-[#A3C042] hover:text-[#8CA635]"
                    >
                        {t('common.viewAll')}
                    </button>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <FaTrophy className="text-gray-400 text-2xl" />
                    </div>
                    <h3 className="text-sm font-bold text-gray-900 mb-2">{t('homePage.noActiveChallengesTitle')}</h3>
                    <p className="text-xs text-gray-600 mb-4">
                        {t('homePage.noActiveChallengesDescription')}
                    </p>
                    <button
                        type="button"
                        onClick={onViewAll}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-[#A3C042] text-white rounded-xl text-xs font-bold hover:bg-[#8CA635] transition"
                    >
                        <FaTrophy className="text-xs" />
                        {t('homePage.viewAllChallengesButton')}
                    </button>
                </div>
            </section>
        );
    }

    return (
        <section>
            <div className="flex items-center justify-between px-1 mb-3">
                <div className="text-sm font-bold text-gray-900">{t('homePage.activeChallengesTitle')}</div>
                <button
                    type="button"
                    onClick={onViewAll}
                    className="text-xs font-semibold text-[#A3C042] hover:text-[#8CA635]"
                >
                    {t('common.viewAll')}
                </button>
            </div>

            <div className="mt-3 space-y-4 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0">
                {activeChallenges.map((challenge) => (
                    <ChallengeCard
                        key={challenge.id}
                        challenge={challenge}
                        onJoin={onJoin}
                        t={t}
                    />
                ))}
            </div>
        </section>
    );
}
