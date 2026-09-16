import { Head } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { FaDownload, FaExclamationTriangle, FaChartLine, FaUsers } from 'react-icons/fa';

export default function SchoolAnalyticsIndex({
    auth, distribution = [], trend = [], teacherComparison = [], lowPerformers = [],
    totalStudents = 0, evaluatedStudents = 0, generatedAt,
}) {
    const maxDist = Math.max(1, ...distribution.map((d) => d.count));
    const maxTrend = Math.max(1, ...trend.map((t) => t.avgScore));

    return (
        <DashboardLayout auth={auth}>
            <Head title="تحليلات الابتكار" />
            <div className="p-6 max-w-6xl mx-auto space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-black text-gray-900">تحليلات الابتكار على مستوى المدرسة</h1>
                        <p className="text-sm text-gray-500 mt-1">
                            {evaluatedStudents} من {totalStudents} طالب لديهم تقييم محسوب · آخر تحديث {generatedAt}
                        </p>
                    </div>
                    <a
                        href={route('school.analytics.export')}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700"
                    >
                        <FaDownload /> تصدير Excel
                    </a>
                </div>

                {/* L1-L5 distribution */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                    <h2 className="font-bold text-gray-800 mb-4">توزيع الطلاب على المستويات الوطنية (L1–L5)</h2>
                    <div className="space-y-2">
                        {distribution.map((d) => (
                            <div key={d.code} className="flex items-center gap-3">
                                <span className="w-16 text-xs font-bold text-gray-600">{d.code}</span>
                                <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full rounded-full flex items-center justify-end px-2 text-[11px] text-white font-semibold"
                                        style={{ width: `${(d.count / maxDist) * 100}%`, backgroundColor: d.color, minWidth: d.count ? '24px' : 0 }}
                                    >
                                        {d.count > 0 && d.count}
                                    </div>
                                </div>
                                <span className="w-32 text-xs text-gray-500">{d.label_ar}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Trend */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                        <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><FaChartLine className="text-indigo-500" /> اتجاه الأداء (آخر 6 أشهر)</h2>
                        {trend.length === 0 ? (
                            <p className="text-sm text-gray-400 text-center py-6">لا توجد بيانات كافية بعد</p>
                        ) : (
                            <div className="flex items-end gap-2 h-40">
                                {trend.map((t) => (
                                    <div key={t.month} className="flex-1 flex flex-col items-center gap-1">
                                        <div className="w-full bg-indigo-500 rounded-t-md" style={{ height: `${(t.avgScore / maxTrend) * 100}%`, minHeight: '4px' }} />
                                        <span className="text-[10px] text-gray-500">{t.month}</span>
                                        <span className="text-[10px] font-bold text-gray-700">{t.avgScore}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Teacher comparison */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                        <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><FaUsers className="text-indigo-500" /> مقارنة أداء المعلمين</h2>
                        {teacherComparison.length === 0 ? (
                            <p className="text-sm text-gray-400 text-center py-6">لا توجد بيانات كافية بعد</p>
                        ) : (
                            <div className="space-y-2">
                                {teacherComparison.map((t) => (
                                    <div key={t.teacherId} className="flex items-center justify-between text-sm border-b border-gray-50 pb-2">
                                        <span className="font-medium text-gray-700">{t.teacherName}</span>
                                        <span className="text-gray-500">{t.studentCount} طالب</span>
                                        <span className="font-black text-indigo-600">{t.avgScore}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Low performers */}
                <div className="bg-white rounded-2xl shadow-sm border border-amber-100 p-5">
                    <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <FaExclamationTriangle className="text-amber-500" /> قائمة المتابعة ذات الأولوية (الأقل أداءً)
                    </h2>
                    {lowPerformers.length === 0 ? (
                        <p className="text-sm text-gray-400 text-center py-6">لا توجد بيانات كافية بعد</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-gray-500 text-xs">
                                        <th className="p-2 text-start">الاسم</th>
                                        <th className="p-2 text-start">الدور</th>
                                        <th className="p-2 text-start">النتيجة</th>
                                        <th className="p-2 text-start">المستوى الوطني</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {lowPerformers.map((p) => (
                                        <tr key={p.userId} className="border-t border-gray-50">
                                            <td className="p-2 font-medium text-gray-800">{p.name}</td>
                                            <td className="p-2 text-gray-500">{p.role}</td>
                                            <td className="p-2 font-black text-amber-600">{p.score}</td>
                                            <td className="p-2 text-gray-500">{p.nationalLevel ? `${p.nationalLevel.code} - ${p.nationalLevel.label_ar}` : '—'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
