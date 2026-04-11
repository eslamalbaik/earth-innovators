import { router } from '@inertiajs/react';
import {
    FaAward,
    FaBell,
    FaCertificate,
    FaChartLine,
    FaClock,
    FaCreditCard,
    FaGraduationCap,
    FaMedal,
    FaExclamationTriangle,
    FaProjectDiagram,
    FaSchool,
    FaStar,
    FaStore,
    FaTasks,
    FaTrophy,
} from 'react-icons/fa';
import { useTranslation } from '@/i18n';
import StudentCurrentChallengeSection from '@/Pages/Student/Home/StudentCurrentChallengeSection';
import StudentLatestProjectsSection from '@/Pages/Student/Home/StudentLatestProjectsSection';
import StudentSuggestChallengeCard from '@/Pages/Student/Home/StudentSuggestChallengeCard';

function formatRelativeFromIso(isoString, t) {
    if (!isoString) return '';
    try {
        const date = new Date(isoString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays === 0) return t('homePage.relativeDates.today');
        if (diffDays === 1) return t('homePage.relativeDates.oneDayAgo');
        if (diffDays < 7) return t('homePage.relativeDates.daysAgo', { count: diffDays });
        if (diffDays < 30) return t('homePage.relativeDates.weeksAgo', { count: Math.floor(diffDays / 7) });
        return t('homePage.relativeDates.monthsAgo', { count: Math.floor(diffDays / 30) });
    } catch {
        return '';
    }
}

function activityDotClass(color) {
    const map = {
        blue: 'bg-blue-500',
        green: 'bg-green-500',
        red: 'bg-red-500',
        yellow: 'bg-amber-500',
        purple: 'bg-purple-500',
    };
    return map[color] || 'bg-gray-400';
}

function StatTile({ icon: Icon, label, value, accentClass, onClick }) {
    const Wrapper = onClick ? 'button' : 'div';
    return (
        <Wrapper
            type={onClick ? 'button' : undefined}
            onClick={onClick}
            className={`rounded-2xl border border-gray-100 bg-white p-4 text-start shadow-sm transition ${onClick ? 'hover:border-[#A3C042]/40 hover:shadow-md cursor-pointer' : ''}`}
        >
            <div className="flex items-start justify-between gap-2">
                <div>
                    <p className="text-xs font-medium text-gray-500">{label}</p>
                    <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
                </div>
                <div className={`rounded-xl p-2 ${accentClass}`}>
                    <Icon className="text-lg text-white" />
                </div>
            </div>
        </Wrapper>
    );
}

export default function StudentDashboardOverview({ stats = {}, engagement = null }) {
    const { t } = useTranslation();
    const submissions = stats.submissions || {};
    const certificates = stats.certificates || {};
    const activities = Array.isArray(stats.activities) ? stats.activities : [];
    const recentBadges = Array.isArray(stats.recentBadges) ? stats.recentBadges : [];
    const notifications = Array.isArray(stats.notifications) ? stats.notifications : [];
    const school = stats.school;
    const rewardStats = engagement?.rewards || {};
    const activeSubscription = engagement?.subscription;
    const pendingSubscription = engagement?.pending_subscription;

    const showSubmissionRow = (submissions.total || 0) > 0;

    return (
        <div className="space-y-4">
            <div>
                <h2 className="text-base font-bold text-gray-900">{t('studentDashboardPage.overviewTitle')}</h2>
                <p className="mt-1 text-xs text-gray-500">{t('studentDashboardPage.overviewSubtitle')}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                <StatTile
                    icon={FaProjectDiagram}
                    label={t('studentDashboardPage.statProjects')}
                    value={stats.totalProjects ?? 0}
                    accentClass="bg-gradient-to-br from-emerald-500 to-emerald-700"
                    onClick={() => router.visit('/student/projects')}
                />
                <StatTile
                    icon={FaChartLine}
                    label={t('studentDashboardPage.statApproved')}
                    value={stats.approvedProjects ?? 0}
                    accentClass="bg-gradient-to-br from-green-500 to-green-700"
                />
                <StatTile
                    icon={FaClock}
                    label={t('studentDashboardPage.statPending')}
                    value={stats.pendingProjects ?? 0}
                    accentClass="bg-gradient-to-br from-amber-500 to-amber-700"
                />
                <StatTile
                    icon={FaTrophy}
                    label={t('studentDashboardPage.statWinning')}
                    value={stats.winningProjects ?? 0}
                    accentClass="bg-gradient-to-br from-violet-500 to-violet-700"
                />
                <StatTile
                    icon={FaMedal}
                    label={t('studentDashboardPage.statBadges')}
                    value={stats.totalBadges ?? 0}
                    accentClass="bg-gradient-to-br from-fuchsia-500 to-fuchsia-700"
                    onClick={() => router.visit('/student/profile')}
                />
                <StatTile
                    icon={FaStar}
                    label={t('studentDashboardPage.statPoints')}
                    value={stats.totalPoints ?? 0}
                    accentClass="bg-gradient-to-br from-yellow-500 to-orange-600"
                    onClick={() => router.visit('/student/points')}
                />
            </div>

            {engagement && (
                <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-4 shadow-sm">
                    <h3 className="text-sm font-bold text-gray-900">{t('studentDashboardPage.engagementTitle')}</h3>
                    <p className="mt-1 text-xs text-gray-600">
                        {activeSubscription
                            ? activeSubscription.is_trial
                                ? t('studentDashboardPage.engagementTrialActive', {
                                    name: activeSubscription.package_name,
                                    until: activeSubscription.end_date,
                                })
                                : t('studentDashboardPage.engagementSubscriptionActive', {
                                    name: activeSubscription.package_name,
                                    until: activeSubscription.end_date,
                                })
                            : pendingSubscription
                                ? t('studentDashboardPage.engagementSubscriptionPending', {
                                    name: pendingSubscription.package_name,
                                })
                                : t('studentDashboardPage.engagementNoSubscription')}
                    </p>
                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
                        <div className="rounded-xl border border-gray-200 bg-white px-3 py-2">
                            <div className="text-gray-500">{t('studentDashboardPage.engagementSummary.points')}</div>
                            <div className="font-bold text-gray-900">{engagement.points ?? 0}</div>
                        </div>
                        <div className="rounded-xl border border-gray-200 bg-white px-3 py-2">
                            <div className="text-gray-500">{t('studentDashboardPage.engagementSummary.redeemableRewards')}</div>
                            <div className="font-bold text-gray-900">{rewardStats.redeemable_count ?? 0}</div>
                        </div>
                        <div className="rounded-xl border border-gray-200 bg-white px-3 py-2">
                            <div className="text-gray-500">{t('studentDashboardPage.engagementSummary.pendingRewards')}</div>
                            <div className="font-bold text-gray-900">{rewardStats.pending_requests ?? 0}</div>
                        </div>
                        <div className="rounded-xl border border-gray-200 bg-white px-3 py-2">
                            <div className="text-gray-500">{t('studentDashboardPage.engagementSummary.engagementScore')}</div>
                            <div className="font-bold text-gray-900">{engagement.engagement_score ?? 0}%</div>
                        </div>
                    </div>
                    {rewardStats.min_cost != null && (engagement.points ?? 0) < rewardStats.min_cost && (
                        <p className="mt-3 text-xs text-amber-700">
                            {t('studentDashboardPage.engagementRewardsHint', { points: rewardStats.min_cost })}
                        </p>
                    )}
                    <div className="mt-3 flex flex-wrap gap-2">
                        {engagement.can_subscribe && (
                            <button
                                type="button"
                                onClick={() => router.visit('/packages')}
                                className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-800 shadow-sm hover:border-[#A3C042]/50"
                            >
                                <FaCreditCard className="text-[#A3C042]" />
                                {t('studentDashboardPage.engagementPackages')}
                            </button>
                        )}
                        {!engagement.can_subscribe && (
                            <button
                                type="button"
                                onClick={() => router.visit('/my-subscriptions')}
                                className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-800 shadow-sm hover:border-[#A3C042]/50"
                            >
                                <FaCreditCard className="text-[#A3C042]" />
                                {t('studentDashboardPage.engagementSubscriptionsCta')}
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={() => router.visit('/achievements')}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-800 shadow-sm hover:border-[#A3C042]/50"
                        >
                            <FaTrophy className="text-amber-500" />
                            {t('studentDashboardPage.engagementAchievements')}
                        </button>
                        <button
                            type="button"
                            onClick={() => router.visit('/store-membership')}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-800 shadow-sm hover:border-[#A3C042]/50"
                        >
                            <FaStore className="text-emerald-600" />
                            {t('studentDashboardPage.engagementStore')}
                        </button>
                        <button
                            type="button"
                            onClick={() => router.visit('/student/points')}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-800 shadow-sm hover:border-[#A3C042]/50"
                        >
                            <FaStar className="text-yellow-500" />
                            {t('studentDashboardPage.engagementPointsDetail')}
                        </button>
                    </div>

                    {engagement.is_expiring_soon && activeSubscription && (
                        <div className="mt-3 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                            <FaExclamationTriangle className="mt-0.5 flex-shrink-0" />
                            <span>
                                {t('studentDashboardPage.engagementExpiringSoon', {
                                    days: activeSubscription.days_remaining ?? 0,
                                    until: activeSubscription.end_date,
                                })}
                            </span>
                        </div>
                    )}

                    {engagement.needs_renewal && (
                        <div className="mt-3 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800">
                            <FaExclamationTriangle className="mt-0.5 flex-shrink-0" />
                            <span>{t('studentDashboardPage.engagementRenewalRequired')}</span>
                        </div>
                    )}

                    {engagement.trial_available && engagement.can_subscribe && (
                        <div className="mt-3 flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
                            <FaExclamationTriangle className="mt-0.5 flex-shrink-0" />
                            <span>{t('studentDashboardPage.engagementTrialAvailable')}</span>
                        </div>
                    )}
                </div>
            )}


            {showSubmissionRow && (
                <div className="rounded-2xl border border-indigo-100 bg-indigo-50/80 p-4">
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-indigo-800">
                        <div className="flex items-center gap-2">
                            <FaTasks className="text-lg" />
                            <span className="text-sm font-bold">{t('studentDashboardPage.submissionsTitle')}</span>
                        </div>
                        <button
                            type="button"
                            onClick={() => router.visit('/student/submissions')}
                            className="text-xs font-semibold text-indigo-900 underline hover:text-indigo-950"
                        >
                            {t('studentDashboardPage.submissionsListCta')}
                        </button>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                        <div>
                            <span className="text-gray-600">{t('studentDashboardPage.submissionsTotal')}</span>
                            <span className="ms-2 font-bold text-gray-900">{submissions.total ?? 0}</span>
                        </div>
                        <div>
                            <span className="text-gray-600">{t('studentDashboardPage.submissionsAwaiting')}</span>
                            <span className="ms-2 font-bold text-gray-900">{submissions.awaitingReview ?? 0}</span>
                        </div>
                        <div>
                            <span className="text-gray-600">{t('studentDashboardPage.submissionsApproved')}</span>
                            <span className="ms-2 font-bold text-gray-900">{submissions.approved ?? 0}</span>
                        </div>
                        <div>
                            <span className="text-gray-600">{t('studentDashboardPage.submissionsRejected')}</span>
                            <span className="ms-2 font-bold text-gray-900">{submissions.rejected ?? 0}</span>
                        </div>
                    </div>
                </div>
            )}

            <section className="space-y-5" aria-label={t('studentDashboardPage.sections.activity')}>
                <StudentLatestProjectsSection
                    projects={stats.recentProjects || []}
                    onViewAll={() => router.visit('/student/projects')}
                    onOpenProject={(projectId) => router.visit(`/student/projects/${projectId}`)}
                />

                <div className="grid grid-cols-1 gap-5 lg:grid-cols-12 lg:items-start lg:gap-6">
                    <div className="space-y-5 lg:col-span-7">
                        <StudentCurrentChallengeSection
                            challenges={stats.activeChallenges || []}
                            onViewAll={() => router.visit('/student/challenges')}
                            onJoin={(challengeId) => router.visit(`/student/challenges/${challengeId}`)}
                        />
                    </div>
                    <div className="lg:col-span-5">
                        <StudentSuggestChallengeCard
                            onSuggest={() => router.visit('/student/challenge-suggestions/create')}
                        />
                    </div>
                </div>
            </section>

            <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4">
                    <div className="mb-2 flex items-center gap-2 text-blue-800">
                        <FaSchool className="text-lg" />
                        <span className="text-sm font-bold">{t('studentDashboardPage.schoolTitle')}</span>
                    </div>
                    {school?.name ? (
                        <p className="text-base font-semibold text-gray-900">{school.name}</p>
                    ) : (
                        <p className="text-sm text-gray-600">{t('studentDashboardPage.schoolNone')}</p>
                    )}
                    <button
                        type="button"
                        onClick={() => router.visit('/student/profile?editSchool=1')}
                        className="mt-3 text-xs font-semibold text-blue-700 hover:text-blue-900"
                    >
                        {t('studentDashboardPage.schoolCta')}
                    </button>
                </div>

                <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4">
                    <div className="mb-2 flex items-center gap-2 text-emerald-800">
                        <FaCertificate className="text-lg" />
                        <span className="text-sm font-bold">{t('studentDashboardPage.certificatesTitle')}</span>
                    </div>
                    <div className="space-y-1 text-sm text-gray-700">
                        <p>{t('studentDashboardPage.certificatesApproved', { count: certificates.approved ?? 0 })}</p>
                        {(certificates.pendingSchoolApproval ?? 0) > 0 && (
                            <p className="text-amber-800">
                                {t('studentDashboardPage.certificatesPending', { count: certificates.pendingSchoolApproval })}
                            </p>
                        )}
                    </div>
                    <button
                        type="button"
                        onClick={() => router.visit('/student/certificate')}
                        className="mt-3 text-xs font-semibold text-emerald-800 hover:text-emerald-950"
                    >
                        {t('studentDashboardPage.certificatesCta')}
                    </button>
                </div>
            </div>

            {notifications.length > 0 && (
                <div className="rounded-2xl border border-amber-100 bg-amber-50/70 p-4">
                    <div className="mb-3 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 text-amber-900">
                            <FaBell className="text-lg" />
                            <span className="text-sm font-bold">{t('studentDashboardPage.gradingTitle')}</span>
                        </div>
                        <button
                            type="button"
                            onClick={() => router.visit('/notifications')}
                            className="text-xs font-semibold text-amber-900 underline"
                        >
                            {t('studentDashboardPage.gradingViewAll')}
                        </button>
                    </div>
                    <ul className="space-y-2">
                        {notifications.slice(0, 3).map((n) => (
                            <li key={n.id} className="rounded-xl bg-white/80 px-3 py-2 text-sm text-gray-800">
                                <div className="font-semibold line-clamp-1">{n.project_title || t('studentDashboardPage.gradingProject')}</div>
                                {n.rating != null && (
                                    <div className="mt-1 flex items-center gap-1 text-xs text-amber-800">
                                        <FaStar className="text-amber-500" />
                                        {t('studentDashboardPage.gradingRating', { rating: Number(n.rating).toFixed(1) })}
                                    </div>
                                )}
                                {n.created_at && (
                                    <div className="mt-1 text-[11px] text-gray-500">{n.created_at}</div>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {recentBadges.length > 0 && (
                <div>
                    <div className="mb-2 flex items-center justify-between px-1">
                        <div className="flex items-center gap-2 text-sm font-bold text-gray-900">
                            <FaAward className="text-[#A3C042]" />
                            {t('studentDashboardPage.badgesTitle')}
                        </div>
                        <button
                            type="button"
                            onClick={() => router.visit('/student/profile')}
                            className="text-xs font-semibold text-[#A3C042] hover:text-[#8CA635]"
                        >
                            {t('studentDashboardPage.badgesViewProfile')}
                        </button>
                    </div>
                    <div className="flex gap-3 overflow-x-auto pb-1">
                        {recentBadges.map((b) => (
                            <div
                                key={b.id}
                                className="min-w-[120px] flex-shrink-0 rounded-2xl border border-gray-100 bg-white p-3 text-center shadow-sm"
                            >
                                <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#A3C042] to-[#8CA635] text-white">
                                    <FaMedal className="text-xl" />
                                </div>
                                <div className="line-clamp-2 text-xs font-semibold text-gray-900">{b.name}</div>
                                {b.earned_at && (
                                    <div className="mt-1 text-[10px] text-gray-500">{b.earned_at}</div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                <div className="mb-3 flex items-center gap-2 text-gray-900">
                    <FaGraduationCap className="text-lg text-gray-600" />
                    <span className="text-sm font-bold">{t('studentDashboardPage.activityTitle')}</span>
                </div>
                {activities.length === 0 ? (
                    <p className="text-center text-sm text-gray-500">{t('studentDashboardPage.activityEmpty')}</p>
                ) : (
                    <ul className="space-y-3">
                        {activities.slice(0, 5).map((a, idx) => (
                            <li key={`${idx}-${a.kind}-${a.occurred_at || ''}`} className="flex items-start gap-3">
                                <span className={`mt-1.5 h-2.5 w-2.5 flex-shrink-0 rounded-full ${activityDotClass(a.color)}`} />
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-semibold text-gray-900">
                                        {t(`activityFeed.${a.kind}`, { title: a.title })}
                                    </p>
                                    <p className="mt-0.5 text-xs text-gray-500">
                                        {formatRelativeFromIso(a.occurred_at, t)}
                                    </p>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
