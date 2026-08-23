import { router } from '@inertiajs/react';
import StudentPageShell from '@/Components/Innovation/StudentPageShell';
import IndexRadarChart from '@/Components/Innovation/IndexRadarChart';
import ClassificationBadge from '@/Components/Innovation/ClassificationBadge';
import { useTranslation } from '@/i18n';

const INDEX_ICONS = {
    skills: '🎯', innovation: '💡', intelligence: '🧠', creativity: '🎨',
    projects: '🏗️', leadership: '👑', ip: '📜', future_readiness: '🚀',
};

const barColor = (value) => {
    if (value >= 85) return 'bg-emerald-500';
    if (value >= 70) return 'bg-indigo-500';
    if (value >= 55) return 'bg-blue-500';
    if (value >= 40) return 'bg-amber-500';
    return 'bg-red-400';
};

export default function Indexes({ index, indexNames, metadata = {} }) {
    const { t, language } = useTranslation();
    const indexes = index
        ? {
            skills: index.skills_index, innovation: index.innovation_index,
            intelligence: index.intelligence_index, creativity: index.creativity_index,
            projects: index.projects_index, leadership: index.leadership_index,
            ip: index.ip_index, future_readiness: index.future_readiness_index,
        }
        : {};

    const handleRecalculate = () => {
        router.post(route('innovation.recalculate'), {}, { preserveScroll: true });
    };

    const localizedIndexNames = Object.keys(indexNames).reduce((acc, key) => {
        acc[key] = t(`innovation.indexes.types.${key}`) || indexNames[key];
        return acc;
    }, {});

    return (
        <StudentPageShell title={t('innovation.indexes.pageTitle')}>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{t('innovation.indexes.title')}</h1>
                        <p className="text-gray-500 mt-1">{t('innovation.indexes.subtitle')}</p>
                    </div>
                    <button
                        onClick={handleRecalculate}
                        className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-medium transition-all shadow-md"
                    >
                        {t('innovation.indexes.recalculate')}
                    </button>
                </div>

                {index ? (
                    <>
                        {/* Overall + Radar */}
                        <div className="bg-white rounded-2xl p-5 shadow-md border border-gray-100">
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
                                <div className="lg:col-span-4 text-center space-y-3">
                                    <div className="rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 p-6 text-white">
                                        <p className="text-sm opacity-90">{t('innovation.indexes.overallScore')}</p>
                                        <p className="text-5xl font-black mt-1">{Math.round(index.overall_score)}</p>
                                        <p className="text-xs opacity-75 mt-1">{t('innovation.indexes.outOf100')}</p>
                                    </div>
                                    <ClassificationBadge
                                        details={
                                            index.classification_details
                                            || undefined
                                        }
                                        size="lg"
                                    />
                                    {index.calculated_at && (
                                        <p className="text-xs text-gray-400">
                                            {t('innovation.indexes.lastCalculated', { date: new Date(index.calculated_at).toLocaleDateString(language === 'ar' ? 'ar' : 'en') })}
                                        </p>
                                    )}
                                </div>
                                <div className="lg:col-span-8">
                                    <IndexRadarChart indexes={indexes} indexNames={localizedIndexNames} height={320} />
                                </div>
                            </div>
                        </div>

                        {/* Per-index bars */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {Object.entries(indexNames).map(([key, label]) => {
                                const value = Number(indexes[key] ?? 0);
                                return (
                                    <div key={key} className="bg-white rounded-2xl p-5 shadow-md border border-gray-100">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-2">
                                                <span className="text-2xl">{INDEX_ICONS[key] || '📈'}</span>
                                                <h3 className="font-bold text-gray-800">{localizedIndexNames[key] || label}</h3>
                                            </div>
                                            <span className="text-2xl font-black text-gray-700">{Math.round(value)}</span>
                                        </div>
                                        <div className="h-3 w-full rounded-full bg-gray-100 overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all ${barColor(value)}`}
                                                style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </>
                ) : (
                    <div className="text-center py-16 bg-white rounded-2xl shadow-md">
                        <span className="text-6xl block mb-4">📊</span>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">{t('innovation.indexes.empty.title')}</h3>
                        <p className="text-gray-500 mb-6">{t('innovation.indexes.empty.description')}</p>
                        <button
                            onClick={handleRecalculate}
                            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors"
                        >
                            {t('innovation.indexes.empty.action')}
                        </button>
                    </div>
                )}
            </div>
        </StudentPageShell>
    );
}
