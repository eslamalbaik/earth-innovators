import StudentPageShell from '@/Components/Innovation/StudentPageShell';

const FIELD_LABELS = {
    skills_index: 'المهارات',
    innovation_index: 'الابتكار',
    intelligence_index: 'الذكاء',
    creativity_index: 'الإبداع',
    projects_index: 'المشاريع',
    leadership_index: 'القيادة',
    ip_index: 'الملكية الفكرية',
    future_readiness_index: 'الجاهزية المستقبلية',
    overall_score: 'الدرجة الكلية',
};

export default function Benchmarking({ comparison = {} }) {
    const { scope, total_users, user_rank, comparisons, percentile, message } = comparison || {};

    return (
        <StudentPageShell title="المقارنات المرجعية">
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">⚖️ المقارنات المرجعية</h1>
                    <p className="text-gray-500 mt-1">موقعك مقارنة بزملائك في {scope || 'الدفعة'}</p>
                </div>

                {message || !comparisons ? (
                    <div className="text-center py-16 bg-white rounded-2xl shadow-md">
                        <span className="text-6xl block mb-4">⚖️</span>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">{message || 'لا توجد بيانات للمقارنة'}</h3>
                        <p className="text-gray-500">أضف إنجازاتك واحسب مؤشراتك أولاً.</p>
                    </div>
                ) : (
                    <>
                        {/* Rank cards */}
                        <div className="grid grid-cols-3 gap-3">
                            <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl p-4 text-white text-center">
                                <p className="text-3xl font-black">#{user_rank}</p>
                                <p className="text-xs opacity-80 mt-1">ترتيبك</p>
                            </div>
                            <div className="bg-white rounded-2xl p-4 shadow-md border border-gray-100 text-center">
                                <p className="text-3xl font-black text-indigo-600">{percentile}%</p>
                                <p className="text-xs text-gray-500 mt-1">الرتبة المئينية</p>
                            </div>
                            <div className="bg-white rounded-2xl p-4 shadow-md border border-gray-100 text-center">
                                <p className="text-3xl font-black text-gray-700">{total_users}</p>
                                <p className="text-xs text-gray-500 mt-1">إجمالي {scope || 'الدفعة'}</p>
                            </div>
                        </div>

                        {/* Per-index comparison */}
                        <div className="bg-white rounded-2xl p-5 shadow-md border border-gray-100">
                            <h3 className="font-bold text-gray-800 mb-4">مقارنة المؤشرات مع متوسط {scope}</h3>
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
                                                title={`المتوسط: ${data.avg_value}`}
                                            />
                                            <div
                                                className={`h-full rounded-full ${data.above_average ? 'bg-emerald-400' : 'bg-amber-400'}`}
                                                style={{ width: `${Math.min(100, Math.max(0, data.user_value))}%` }}
                                            />
                                        </div>
                                        <div className="flex justify-between text-xs text-gray-400 mt-1">
                                            <span>أنت: {data.user_value}</span>
                                            <span>المتوسط: {data.avg_value}</span>
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
