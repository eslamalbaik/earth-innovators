import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, router } from '@inertiajs/react';

export default function TeacherReport({ teacher, month, summary, byDay, bookings, auth }) {
    const changeMonth = (m) => router.get(route('admin.teachers.report', teacher.id), { month: m }, { preserveState: true });
    return (
        <DashboardLayout auth={auth}>
            <Head title={`Teacher Report - ${teacher.name_ar}`} />
            <div className="max-w-6xl mx-auto p-6 bg-white rounded shadow">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-xl font-bold">تقرير المعلم: {teacher.name_ar}</h1>
                    <input type="month" value={month} onChange={(e)=>changeMonth(e.target.value)} className="border rounded px-3 py-2" />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
                    {Object.entries({ إجمالي: summary.total, قيد_الانتظار: summary.pending, موافقات: summary.approved, مرفوض: summary.rejected, ملغي: summary.cancelled, مكتمل: summary.completed }).map(([k,v])=> (
                        <div key={k} className="bg-gray-50 rounded p-3 text-center">
                            <div className="text-sm text-gray-600">{k}</div>
                            <div className="text-2xl font-bold">{v}</div>
                        </div>
                    ))}
                    <div className="bg-green-50 rounded p-3 text-center col-span-2">
                        <div className="text-sm text-gray-600">الإيرادات</div>
                        <div className="text-2xl font-bold text-green-700">{Number(summary.revenue||0).toLocaleString()} ﷼</div>
                    </div>
                </div>
                <div className="mb-6">
                    <h2 className="font-semibold mb-2">حسب اليوم</h2>
                    <div className="space-y-2">
                        {Object.entries(byDay).map(([day,vals]) => (
                            <div key={day} className="flex items-center justify-between border rounded px-3 py-2">
                                <div>{day}</div>
                                <div className="text-sm">حجوزات: {vals.count}</div>
                                <div className="text-sm">إيراد: {Number(vals.revenue||0).toLocaleString()} ﷼</div>
                            </div>
                        ))}
                    </div>
                </div>
                <div>
                    <h2 className="font-semibold mb-2">الحجوزات</h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50"><tr>
                                <th className="px-4 py-2  text-xs text-gray-500">ID</th>
                                <th className="px-4 py-2  text-xs text-gray-500">Student</th>
                                <th className="px-4 py-2  text-xs text-gray-500">Date</th>
                                <th className="px-4 py-2  text-xs text-gray-500">Time</th>
                                <th className="px-4 py-2  text-xs text-gray-500">Price</th>
                                <th className="px-4 py-2  text-xs text-gray-500">Status</th>
                            </tr></thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {bookings.map(b => (
                                    <tr key={b.id}>
                                        <td className="px-4 py-2 text-sm">#{b.id}</td>
                                        <td className="px-4 py-2 text-sm">{b.student?.name}</td>
                                        <td className="px-4 py-2 text-sm">{b.availability?.date}</td>
                                        <td className="px-4 py-2 text-sm">{b.availability?.start_time}</td>
                                        <td className="px-4 py-2 text-sm">{Number(b.price||0).toLocaleString()} ﷼</td>
                                        <td className="px-4 py-2 text-sm">{b.status}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}


