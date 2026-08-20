import { Link } from '@inertiajs/react';
import { useTranslation } from '@/i18n';

/**
 * قسم "متابعة الابتكار" داخل لوحة المعلم الأصلية —
 * ملخص مؤشرات الطلاب وتوزيع تصنيفاتهم مع رابط لصفحة المتابعة التفصيلية
 */
export default function CoachInnovationSummary({ innovationStats }) {
    const { t } = useTranslation();

    if (!innovationStats) return null;

    const { totalStudents, statistics = {}, classifications = {} } = innovationStats;
    const distribution = statistics.classifications || {};
    const needsAttention = statistics.needs_attention || [];
    const topStudents = statistics.top_students || [];

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">🚀 {t('innovationSummary.title')}</h2>
                    <p className="text-sm text-gray-500 mt-0.5">{t('innovationSummary.subtitle')}</p>
                </div>
                <Link
                    href="/teacher/innovation/dashboard"
                    className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl text-sm font-medium transition-all shadow-md"
                >
                    {t('innovationSummary.viewDetails')} ←
                </Link>
            </div>

            {/* Stats cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                <div className="rounded-xl bg-gray-50 border border-gray-100 p-4 text-center">
                    <p className="text-2xl font-black text-indigo-600">{totalStudents}</p>
                    <p className="text-xs text-gray-500 mt-1">{t('innovationSummary.totalStudents')}</p>
                </div>
                <div className="rounded-xl bg-gray-50 border border-gray-100 p-4 text-center">
                    <p className="text-2xl font-black text-emerald-500">{statistics.avg_score ?? 0}</p>
                    <p className="text-xs text-gray-500 mt-1">{t('innovationSummary.avgScore')}</p>
                </div>
                <div className="rounded-xl bg-gray-50 border border-gray-100 p-4 text-center">
                    <p className="text-2xl font-black text-amber-500">{needsAttention.length}</p>
                    <p className="text-xs text-gray-500 mt-1">{t('innovationSummary.needsAttention')}</p>
                </div>
                <div className="rounded-xl bg-gray-50 border border-gray-100 p-4 text-center">
                    <p className="text-2xl font-black text-purple-500">{topStudents.length}</p>
                    <p className="text-xs text-gray-500 mt-1">{t('innovationSummary.topStudents')}</p>
                </div>
            </div>

            {/* Classification distribution */}
            {Object.keys(distribution).length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {Object.entries(classifications).map(([key, details]) => {
                        const count = distribution[key] || 0;
                        if (count === 0) return null;
                        return (
                            <span
                                key={key}
                                className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-semibold text-gray-700"
                                style={{ backgroundColor: `${details.color}33`, borderColor: details.color }}
                            >
                                <span>{details.icon}</span>
                                <span>{details.label}</span>
                                <span className="font-black">{count}</span>
                            </span>
                        );
                    })}
                </div>
            )}

            {/* Needs attention */}
            {needsAttention.length > 0 && (
                <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                    <p className="text-sm font-bold text-amber-700 mb-2">⚠️ طلاب يحتاجون متابعة:</p>
                    <div className="flex flex-wrap gap-2">
                        {needsAttention.map((s) => (
                            <Link
                                key={s.id}
                                href={`/teacher/innovation/student/${s.id}/report`}
                                className="px-3 py-1 bg-white border border-amber-300 rounded-lg text-xs font-medium text-amber-700 hover:bg-amber-100 transition"
                            >
                                {s.name} ({Math.round(s.overall_score)})
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
