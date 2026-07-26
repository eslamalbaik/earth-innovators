import { Head, Link } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import {
    Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
    ResponsiveContainer, Legend, Tooltip,
} from 'recharts';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444'];

export default function CompareStudents({ auth, students = [], indexNames = {} }) {
    // بيانات الرادار: صف لكل مؤشر وعمود لكل طالب
    const radarData = Object.entries(indexNames).map(([key, label]) => {
        const row = { subject: label };
        students.forEach((s) => {
            row[s.name] = Number(s.indexes?.[key] ?? 0);
        });
        return row;
    });

    return (
        <DashboardLayout auth={auth}>
            <Head title="مقارنة الطلاب" />

            <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">⚖️ مقارنة الطلاب</h1>
                        <p className="text-gray-500 mt-1">مقارنة المؤشرات الثمانية بين {students.length} طلاب</p>
                    </div>
                    <Link
                        href={route('teacher.innovation.dashboard')}
                        className="text-indigo-600 hover:text-indigo-700 font-medium text-sm"
                    >
                        → العودة لمتابعة الابتكار
                    </Link>
                </div>

                {students.length < 2 ? (
                    <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl shadow-md">
                        <span className="text-6xl block mb-4">⚖️</span>
                        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">اختر طالبين على الأقل</h3>
                        <p className="text-gray-500">حدد الطلاب من صفحة متابعة الابتكار ثم اضغط "مقارنة".</p>
                    </div>
                ) : (
                    <>
                        {/* Score cards */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                            {students.map((s, i) => (
                                <div
                                    key={s.id}
                                    className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-md border-t-4 text-center"
                                    style={{ borderTopColor: COLORS[i % COLORS.length] }}
                                >
                                    <p className="font-bold text-gray-800 dark:text-white truncate">{s.name}</p>
                                    <p className="text-3xl font-black mt-1" style={{ color: COLORS[i % COLORS.length] }}>
                                        {Math.round(s.overall_score)}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-0.5">الدرجة الكلية</p>
                                </div>
                            ))}
                        </div>

                        {/* Combined radar */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-md border border-gray-100 dark:border-gray-700">
                            <h3 className="font-bold text-gray-800 dark:text-white mb-4">📊 المؤشرات جنباً إلى جنب</h3>
                            <ResponsiveContainer width="100%" height={400}>
                                <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
                                    <PolarGrid stroke="#e5e7eb" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: '#6b7280' }} />
                                    <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 9, fill: '#9ca3af' }} />
                                    {students.map((s, i) => (
                                        <Radar
                                            key={s.id}
                                            name={s.name}
                                            dataKey={s.name}
                                            stroke={COLORS[i % COLORS.length]}
                                            fill={COLORS[i % COLORS.length]}
                                            fillOpacity={0.15}
                                        />
                                    ))}
                                    <Legend />
                                    <Tooltip />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Comparison table */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-100 dark:border-gray-700">
                                        <th className="text-start p-4 font-bold text-gray-600 dark:text-gray-300">المؤشر</th>
                                        {students.map((s, i) => (
                                            <th key={s.id} className="p-4 font-bold" style={{ color: COLORS[i % COLORS.length] }}>
                                                {s.name}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                    {Object.entries(indexNames).map(([key, label]) => {
                                        const values = students.map((s) => Number(s.indexes?.[key] ?? 0));
                                        const max = Math.max(...values);
                                        return (
                                            <tr key={key}>
                                                <td className="p-4 font-medium text-gray-700 dark:text-gray-300">{label}</td>
                                                {values.map((v, i) => (
                                                    <td
                                                        key={i}
                                                        className={`p-4 text-center font-bold ${
                                                            v === max && max > 0 ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20' : 'text-gray-600 dark:text-gray-300'
                                                        }`}
                                                    >
                                                        {v.toFixed(0)}
                                                    </td>
                                                ))}
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </div>
        </DashboardLayout>
    );
}
