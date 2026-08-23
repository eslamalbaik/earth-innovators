import { Link } from '@inertiajs/react';
import IndexRadarChart from '@/Components/Innovation/IndexRadarChart';
import ClassificationBadge from '@/Components/Innovation/ClassificationBadge';
import { useTranslation } from '@/i18n';

const TYPE_ICONS = {
    project: '🏗️', research: '🔬', certificate: '📜', skill: '🎯',
    award: '🏅', patent: '💡', article: '📝', product: '📦',
};

/**
 * قسم "ملف الابتكار" داخل لوحة الطالب الأصلية —
 * يعرض الدرجة الكلية والتصنيف والمخطط الراداري للمؤشرات الثمانية
 */
export default function InnovationSummaryCard({ innovation }) {
    const { t } = useTranslation();

    if (!innovation) return null;

    const {
        hasIndex,
        overallScore,
        classification,
        classificationDetails,
        indexes,
        indexNames,
        achievements,
        recentAchievements = [],
    } = innovation;

    const QUICK_LINKS = [
        { href: '/innovation/achievements', icon: '🏆', label: t('innovationSummaryCard.quickLinks.achievements') },
        { href: '/innovation/indexes', icon: '📊', label: t('innovationSummaryCard.quickLinks.indexes') },
        { href: '/innovation/recommendations', icon: '💡', label: t('innovationSummaryCard.quickLinks.recommendations') },
        { href: '/innovation/benchmarking', icon: '⚖️', label: t('innovationSummaryCard.quickLinks.benchmarking') },
    ];

    return (
        <div className="bg-white rounded-2xl p-5 shadow-md border border-gray-100">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div>
                    <h2 className="text-lg font-bold text-gray-900">{t('innovationSummaryCard.heading')}</h2>
                    <p className="text-sm text-gray-500 mt-0.5">{t('innovationSummaryCard.subtitle')}</p>
                </div>
                {hasIndex && <ClassificationBadge details={classificationDetails} classificationKey={classification} size="lg" />}
            </div>

            {hasIndex ? (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                    {/* Overall score + achievements stats */}
                    <div className="lg:col-span-4 space-y-4">
                        <div className="rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 p-5 text-white text-center">
                            <p className="text-sm opacity-90">{t('innovationSummaryCard.totalScore')}</p>
                            <p className="text-5xl font-black mt-1">{Math.round(overallScore)}</p>
                            <p className="text-xs opacity-75 mt-1">{t('innovationSummaryCard.outOf100')}</p>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                            <div className="rounded-xl bg-gray-50 border border-gray-100 p-3 text-center">
                                <p className="text-xl font-black text-indigo-600">{achievements?.total ?? 0}</p>
                                <p className="text-[11px] text-gray-500 mt-0.5">{t('innovationSummaryCard.achievementsTotal')}</p>
                            </div>
                            <div className="rounded-xl bg-gray-50 border border-gray-100 p-3 text-center">
                                <p className="text-xl font-black text-emerald-500">{achievements?.validated ?? 0}</p>
                                <p className="text-[11px] text-gray-500 mt-0.5">{t('innovationSummaryCard.achievementsValidated')}</p>
                            </div>
                            <div className="rounded-xl bg-gray-50 border border-gray-100 p-3 text-center">
                                <p className="text-xl font-black text-amber-500">{achievements?.pending ?? 0}</p>
                                <p className="text-[11px] text-gray-500 mt-0.5">{t('innovationSummaryCard.achievementsPending')}</p>
                            </div>
                        </div>

                        {recentAchievements.length > 0 && (
                            <div className="space-y-2">
                                {recentAchievements.map((a) => (
                                    <Link
                                        key={a.id}
                                        href={`/innovation/achievements/${a.id}`}
                                        className="flex items-center gap-2 rounded-xl border border-gray-100 bg-gray-50 px-3 py-2 hover:bg-gray-100 transition"
                                    >
                                        <span className="text-lg">{TYPE_ICONS[a.type] || '📋'}</span>
                                        <span className="text-sm font-medium text-gray-700 truncate">{a.title}</span>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Radar chart */}
                    <div className="lg:col-span-8">
                        <IndexRadarChart indexes={indexes} indexNames={indexNames} height={300} />
                    </div>
                </div>
            ) : (
                <div className="text-center py-8">
                    <span className="text-5xl block mb-3">🌱</span>
                    <h3 className="text-lg font-bold text-gray-800 mb-1">{t('innovationSummaryCard.emptyTitle')}</h3>
                    <p className="text-sm text-gray-500 mb-4">
                        {t('innovationSummaryCard.emptyDescription')}
                    </p>
                    <Link
                        href="/innovation/achievements/create"
                        className="inline-block px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-medium transition-all shadow-md"
                    >
                        {t('innovationSummaryCard.addFirstAchievement')}
                    </Link>
                </div>
            )}

            {/* Quick links */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-5 pt-4 border-t border-gray-100">
                {QUICK_LINKS.map((link) => (
                    <Link
                        key={link.href}
                        href={link.href}
                        className="flex items-center justify-center gap-2 rounded-xl bg-gray-50 border border-gray-100 px-3 py-2.5 text-sm font-semibold text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition"
                    >
                        <span>{link.icon}</span>
                        <span>{link.label}</span>
                    </Link>
                ))}
            </div>
        </div>
    );
}
