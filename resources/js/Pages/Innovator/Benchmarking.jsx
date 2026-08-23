import StudentPageShell from '@/Components/Innovation/StudentPageShell';
import { useTranslation } from '@/i18n';

export default function Benchmarking({ comparison = {} }) {
    const { t } = useTranslation();
    const { scope, total_users, user_rank, comparisons, percentile, message } = comparison || {};

    const FIELD_LABELS = {
        skills_index: t('innovation.indexes.types.skills') || 'skills_index',
        innovation_index: t('innovation.indexes.types.innovation') || 'innovation_index',
        intelligence_index: t('innovation.indexes.types.intelligence') || 'intelligence_index',
        creativity_index: t('innovation.indexes.types.creativity') || 'creativity_index',
        projects_index: t('innovation.indexes.types.projects') || 'projects_index',
        leadership_index: t('innovation.indexes.types.leadership') || 'leadership_index',
        ip_index: t('innovation.indexes.types.ip') || 'ip_index',
        future_readiness_index: t('innovation.indexes.types.future_readiness') || 'future_readiness_index',
        overall_score: t('innovation.benchmarking.overall_score') || 'overall_score',
    };

    const translateScope = (s) => {
        if (!s) return t('innovation.benchmarking.cohort');
        if (s === 'الدفعة') return t('innovation.benchmarking.cohort');
        if (s === 'المؤسسة') return t('common.institution') || 'Institution';
        if (s === 'الجميع') return t('common.all') || 'Everyone';
        return s;
    };

    const translateMessage = (msg) => {
        if (!msg) return null;
        if (msg === 'لم يتم حساب المؤشرات بعد') return t('innovation.indexes.empty.title');
        return msg;
    };

    const displayScope = translateScope(scope);
    const displayMessage = translateMessage(message);

    return (
        <StudentPageShell title={t('innovation.benchmarking.pageTitle')}>
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{t('innovation.benchmarking.title')}</h1>
                    <p className="text-gray-500 mt-1">
                        {t('innovation.benchmarking.subtitle', { scope: displayScope })}
                    </p>
                </div>

                {displayMessage || !comparisons ? (
                    <div className="text-center py-16 bg-white rounded-2xl shadow-md">
                        <span className="text-6xl block mb-4">⚖️</span>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">
                            {displayMessage || t('innovation.benchmarking.empty.title')}
                        </h3>
                        <p className="text-gray-500">{t('innovation.benchmarking.empty.description')}</p>
                    </div>
                ) : (
                    <>
                        {/* Rank cards */}
                        <div className="grid grid-cols-3 gap-3">
                            <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl p-4 text-white text-center">
                                <p className="text-3xl font-black">#{user_rank}</p>
                                <p className="text-xs opacity-80 mt-1">{t('innovation.benchmarking.rank')}</p>
                            </div>
                            <div className="bg-white rounded-2xl p-4 shadow-md border border-gray-100 text-center">
                                <p className="text-3xl font-black text-indigo-600">{percentile}%</p>
                                <p className="text-xs text-gray-500 mt-1">{t('innovation.benchmarking.percentile')}</p>
                            </div>
                            <div className="bg-white rounded-2xl p-4 shadow-md border border-gray-100 text-center">
                                <p className="text-3xl font-black text-gray-700">{total_users}</p>
                                <p className="text-xs text-gray-500 mt-1">
                                    {t('innovation.benchmarking.totalUsers', { scope: displayScope })}
                                </p>
                            </div>
                        </div>

                        {/* Per-index comparison */}
                        <div className="bg-white rounded-2xl p-5 shadow-md border border-gray-100">
                            <h3 className="font-bold text-gray-800 mb-4">
                                {t('innovation.benchmarking.cohortComparison', { scope: displayScope })}
                            </h3>
                            <div className="space-y-4">
                                {Object.entries(comparisons).map(([field, data]) => (
                                    <div key={field}>
                                        <div className="flex items-center justify-between text-sm mb-1.5">
                                            <span className="font-semibold text-gray-700">{FIELD_LABELS[field] || field}</span>
                                            <span className={`font-bold ${data.above_average ? 'text-emerald-600' : 'text-red-500'}`}>
                                                {data.above_average ? '▲' : '▼'} {Math.abs(data.difference).toFixed(1)}
                                            </span>
                                        </div>
                                        <div className="relative h-4 rounded-full bg-gray-100 overflow-hidden">
                                            {/* Average marker */}
                                            <div
                                                className="absolute top-0 bottom-0 w-0.5 bg-gray-500 z-10"
                                                style={{ insetInlineStart: `${Math.min(100, data.avg_value)}%` }}
                                                title={`${t('innovation.benchmarking.average')}: ${data.avg_value}`}
                                            />
                                            <div
                                                className={`h-full rounded-full ${data.above_average ? 'bg-emerald-400' : 'bg-amber-400'}`}
                                                style={{ width: `${Math.min(100, Math.max(0, data.user_value))}%` }}
                                            />
                                        </div>
                                        <div className="flex justify-between text-xs text-gray-400 mt-1">
                                            <span>{t('innovation.benchmarking.you')}: {data.user_value}</span>
                                            <span>{t('innovation.benchmarking.average')}: {data.avg_value}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </StudentPageShell>
    );
}
