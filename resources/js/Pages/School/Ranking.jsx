import DashboardLayout from '@/Layouts/DashboardLayout';
import { useTranslation } from '@/i18n';
import { Head } from '@inertiajs/react';
import { FaAward, FaCrown, FaMedal, FaProjectDiagram, FaStar, FaTrophy, FaUsers } from 'react-icons/fa';

const getRankIcon = (rank) => {
    if (rank === 1) {
        return <FaCrown className="text-3xl text-yellow-500" />;
    }

    if (rank === 2) {
        return <FaMedal className="text-3xl text-gray-400" />;
    }

    if (rank === 3) {
        return <FaMedal className="text-3xl text-orange-400" />;
    }

    return <span className="text-2xl font-bold text-gray-600">#{rank}</span>;
};

export default function SchoolRanking({
    schoolsRanking = [],
    currentSchoolRank,
    badges = [],
    earnedBadges = [],
    auth,
}) {
    const { t, language } = useTranslation();
    const formatter = new Intl.NumberFormat(language === 'ar' ? 'ar' : 'en');

    const pageTitle = t('schoolRankingPage.pageTitle', {
        appName: t('common.appName'),
    });

    const formatNumber = (value) => formatter.format(Number(value || 0));

    const getBadgeName = (badge) => (
        language === 'ar'
            ? (badge?.name_ar || badge?.name)
            : (badge?.name || badge?.name_ar)
    );

    const getBadgeDescription = (badge) => (
        language === 'ar'
            ? (badge?.description_ar || badge?.description)
            : (badge?.description || badge?.description_ar)
    );

    return (
        <DashboardLayout auth={auth} header={t('schoolRankingPage.title')}>
            <Head title={pageTitle} />

            <div className="space-y-8">
                {currentSchoolRank && (
                    <div className="rounded-xl bg-[#A3C042] p-8 text-white shadow-lg">
                        <div className="mb-6">
                            <h2 className="text-2xl font-bold">{t('schoolRankingPage.currentSection.title')}</h2>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                            <div className="rounded-lg bg-white/20 px-6 py-4 backdrop-blur-sm">
                                <div className="flex items-center gap-3">
                                    <FaTrophy className="text-2xl text-yellow-300" />
                                    <div>
                                        <p className="text-sm opacity-90">{t('schoolRankingPage.currentSection.rank')}</p>
                                        <p className="text-3xl font-bold">{formatNumber(currentSchoolRank.rank)}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-lg bg-white/20 px-6 py-4 backdrop-blur-sm">
                                <div className="flex items-center gap-3">
                                    <FaStar className="text-2xl text-yellow-300" />
                                    <div>
                                        <p className="text-sm opacity-90">{t('schoolRankingPage.currentSection.totalPoints')}</p>
                                        <p className="text-3xl font-bold">{formatNumber(currentSchoolRank.total_points)}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-lg bg-white/20 px-6 py-4 backdrop-blur-sm">
                                <div className="flex items-center gap-3">
                                    <FaUsers className="text-2xl text-white" />
                                    <div>
                                        <p className="text-sm opacity-90">{t('schoolRankingPage.currentSection.students')}</p>
                                        <p className="text-3xl font-bold">{formatNumber(currentSchoolRank.total_students)}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-lg bg-white/20 px-6 py-4 backdrop-blur-sm">
                                <div className="flex items-center gap-3">
                                    <FaProjectDiagram className="text-2xl text-white" />
                                    <div>
                                        <p className="text-sm opacity-90">{t('schoolRankingPage.currentSection.projects')}</p>
                                        <p className="text-3xl font-bold">{formatNumber(currentSchoolRank.projects_count)}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-lg bg-white/20 px-6 py-4 backdrop-blur-sm">
                                <div className="flex items-center gap-3">
                                    <FaAward className="text-2xl text-white" />
                                    <div>
                                        <p className="text-sm opacity-90">{t('schoolRankingPage.currentSection.badges')}</p>
                                        <p className="text-3xl font-bold">{formatNumber(currentSchoolRank.total_badges)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.2fr_0.8fr]">
                    <div className="overflow-hidden rounded-xl bg-white shadow-lg">
                        <div className="border-b border-gray-200 bg-gradient-to-r from-[#A3C042]/10 to-legacy-blue/10 px-6 py-4">
                            <h3 className="flex items-center gap-2 text-xl font-bold text-gray-900">
                                <FaTrophy className="text-[#A3C042]" />
                                {t('schoolRankingPage.sections.rankings')}
                            </h3>
                        </div>

                        <div className="p-6">
                            {schoolsRanking.length > 0 ? (
                                <div className="space-y-4">
                                    {schoolsRanking.map((school) => (
                                        <div
                                            key={school.id}
                                            className={`rounded-lg border p-4 transition ${
                                                school.is_current_school
                                                    ? 'border-[#A3C042] bg-gradient-to-r from-[#A3C042]/10 to-legacy-blue/10 shadow-md'
                                                    : 'border-gray-200 hover:shadow-md'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between gap-4">
                                                <div className="flex flex-1 items-center gap-4">
                                                    <div className="flex h-12 w-12 items-center justify-center">
                                                        {getRankIcon(school.rank)}
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className="text-lg font-bold text-gray-900">{school.name}</h4>
                                                        <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-gray-600">
                                                            <span className="flex items-center gap-1">
                                                                <FaStar className="text-yellow-500" />
                                                                {t('schoolRankingPage.labels.points', {
                                                                    count: formatNumber(school.total_points),
                                                                })}
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                <FaUsers />
                                                                {t('schoolRankingPage.labels.students', {
                                                                    count: formatNumber(school.total_students),
                                                                })}
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                <FaProjectDiagram />
                                                                {t('schoolRankingPage.labels.projects', {
                                                                    count: formatNumber(school.projects_count),
                                                                })}
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                <FaAward />
                                                                {t('schoolRankingPage.labels.badges', {
                                                                    count: formatNumber(school.total_badges),
                                                                })}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {school.is_current_school && (
                                                    <span className="rounded-full bg-[#A3C042] px-3 py-1 text-xs font-semibold text-white">
                                                        {t('schoolRankingPage.labels.mySchool')}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-12 text-center text-gray-500">
                                    {t('schoolRankingPage.empty.rankings')}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-8">
                        <div className="overflow-hidden rounded-xl bg-white shadow-lg">
                            <div className="border-b border-gray-200 bg-gradient-to-r from-[#A3C042]/10 to-legacy-blue/10 px-6 py-4">
                                <h3 className="flex items-center gap-2 text-xl font-bold text-gray-900">
                                    <FaMedal className="text-[#A3C042]" />
                                    {t('schoolRankingPage.sections.earnedBadges')}
                                </h3>
                            </div>

                            <div className="p-6">
                                {earnedBadges.length > 0 ? (
                                    <div className="space-y-4">
                                        {earnedBadges.map((badgeData) => (
                                            <div key={badgeData.badge?.id} className="rounded-lg border border-gray-200 p-4 transition hover:shadow-md">
                                                <div className="flex items-center gap-4">
                                                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#A3C042] to-legacy-blue text-white">
                                                        <FaMedal className="text-2xl" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className="font-bold text-gray-900">{getBadgeName(badgeData.badge)}</h4>
                                                        {getBadgeDescription(badgeData.badge) && (
                                                            <p className="mt-1 text-sm text-gray-600">
                                                                {getBadgeDescription(badgeData.badge)}
                                                            </p>
                                                        )}
                                                        <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-gray-500">
                                                            <span>
                                                                {t('schoolRankingPage.labels.earnedCount', {
                                                                    count: formatNumber(badgeData.count),
                                                                })}
                                                            </span>
                                                            <span>
                                                                {t('schoolRankingPage.labels.studentsEarned', {
                                                                    count: formatNumber(badgeData.students),
                                                                })}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-12 text-center text-gray-500">
                                        {t('schoolRankingPage.empty.earnedBadges')}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="overflow-hidden rounded-xl bg-white shadow-lg">
                            <div className="border-b border-gray-200 bg-gradient-to-r from-[#A3C042]/10 to-legacy-blue/10 px-6 py-4">
                                <h3 className="flex items-center gap-2 text-xl font-bold text-gray-900">
                                    <FaAward className="text-[#A3C042]" />
                                    {t('schoolRankingPage.sections.availableBadges')}
                                </h3>
                            </div>

                            <div className="p-6">
                                {badges.length > 0 ? (
                                    <div className="space-y-3">
                                        {badges.map((badge) => (
                                            <div key={badge.id} className="rounded-lg border border-gray-200 p-4">
                                                <div className="flex items-start gap-3">
                                                    {badge.image ? (
                                                        <img
                                                            src={badge.image.startsWith('http') ? badge.image : `/storage/${badge.image}`}
                                                            alt={getBadgeName(badge)}
                                                            className="h-14 w-14 rounded-lg object-cover"
                                                        />
                                                    ) : (
                                                        <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-[#A3C042]/10 text-[#A3C042]">
                                                            <FaAward />
                                                        </div>
                                                    )}

                                                    <div className="flex-1">
                                                        <h4 className="font-bold text-gray-900">{getBadgeName(badge)}</h4>
                                                        {getBadgeDescription(badge) && (
                                                            <p className="mt-1 text-sm text-gray-600">
                                                                {getBadgeDescription(badge)}
                                                            </p>
                                                        )}
                                                        <div className="mt-2 text-xs font-medium text-[#7E9B25]">
                                                            {t('schoolRankingPage.labels.pointsRequired', {
                                                                count: formatNumber(badge.points_required),
                                                            })}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-12 text-center text-gray-500">
                                        {t('schoolRankingPage.empty.availableBadges')}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
