import { router } from '@inertiajs/react';
import StudentPageShell from '@/Components/Innovation/StudentPageShell';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

const TRIGGER_LABELS = {
    achievement_added: 'إضافة إنجاز',
    achievement_updated: 'تعديل إنجاز',
    achievement_deleted: 'حذف إنجاز',
    skill_added: 'إضافة مهارة',
    manual_recalc: 'إعادة احتساب يدوية',
    system_recalc: 'إعادة احتساب تلقائية',
};

export default function History({ history = [], indexNames = {}, filter = null }) {
    const activeFilter = filter || 'overall';

    // chronological order for the chart
    const chartData = [...history]
        .filter((h) => h.index_name === activeFilter)
        .reverse()
        .map((h) => ({
            date: new Date(h.created_at).toLocaleDateString('ar', { month: 'short', day: 'numeric' }),
            value: Number(h.new_value),
        }));

    const handleFilter = (indexKey) => {
        router.get(route('innovation.history'), { index: indexKey }, { preserveState: true });
    };

    const allNames = { overall: 'الدرجة الكلية', ...indexNames };

    return (
        <StudentPageShell title="تطور المؤشرات">
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">📈 تطور المؤشرات عبر الزمن</h1>
                    <p className="text-gray-500 mt-1">تتبع رحلة تقدمك في كل مؤشر</p>
                </div>

                {/* Filter chips */}
                <div className="flex flex-wrap gap-2">
                    {Object.entries(allNames).map(([key, label]) => (
                        <button
                            key={key}
                            onClick={() => handleFilter(key)}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                                activeFilter === key
                                    ? 'bg-indigo-600 text-white shadow-md'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>

                {/* Chart */}
                {chartData.length > 0 ? (
                    <div className="bg-white rounded-2xl p-5 shadow-md border border-gray-100">
                        <h3 className="font-bold text-gray-800 mb-4">{allNames[activeFilter]}</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9ca3af' }} />
                                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#9ca3af' }} />
                                <Tooltip formatter={(value) => [Number(value).toFixed(1), allNames[activeFilter]]} />
                                <Line type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={2.5} dot={{ r: 4 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <div className="text-center py-16 bg-white rounded-2xl shadow-md">
                        <span className="text-6xl block mb-4">📈</span>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">لا يوجد سجل بعد</h3>
                        <p className="text-gray-500">سيظهر هنا تطور مؤشراتك كلما أضفت إنجازات جديدة.</p>
                    </div>
                )}

                {/* Change log */}
                {history.length > 0 && (
                    <div className="bg-white rounded-2xl p-5 shadow-md border border-gray-100">
                        <h3 className="font-bold text-gray-800 mb-4">🗓️ سجل التغييرات</h3>
                        <div className="space-y-2">
                            {history.slice(0, 20).map((h, i) => {
                                const diff = Number(h.new_value) - Number(h.old_value);
                                const up = diff >= 0;
                                return (
                                    <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                        <div className="flex items-center gap-3">
                                            <span className={`text-lg ${up ? 'text-emerald-500' : 'text-red-400'}`}>
                                                {up ? '▲' : '▼'}
                                            </span>
                                            <div>
                                                <p className="text-sm font-semibold text-gray-700">
                                                    {allNames[h.index_name] || h.index_name}
                                                </p>
                                                <p className="text-xs text-gray-400">
                                                    {TRIGGER_LABELS[h.trigger_type] || h.trigger_type}
                                                    {' • '}
                                                    {new Date(h.created_at).toLocaleDateString('ar')}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-sm font-bold">
                                            <span className="text-gray-400">{Number(h.old_value).toFixed(0)}</span>
                                            <span className="mx-1 text-gray-300">←</span>
                                            <span className={up ? 'text-emerald-600' : 'text-red-500'}>
                                                {Number(h.new_value).toFixed(0)}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </StudentPageShell>
    );
}
