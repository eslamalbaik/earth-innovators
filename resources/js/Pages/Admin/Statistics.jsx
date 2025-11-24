import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head } from '@inertiajs/react';
import { FaUsers, FaBookOpen, FaDollarSign, FaStar, FaChartLine, FaCalendar } from 'react-icons/fa';

export default function Statistics({ auth, stats, monthly, filters, subjectsDistribution = [], topTeachers = [] }) {

    return (
        <DashboardLayout header="الإحصائيات">
            <Head title="الإحصائيات" />

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-6">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="text-blue-100 text-sm">المعلمون</p>
                            <p className="text-3xl font-bold">{stats.totalTeachers}</p>
                        </div>
                        <div className="p-3 bg-white/20 rounded-xl">
                            <FaUsers className="text-2xl" />
                        </div>
                    </div>
                    <div className="flex items-center text-sm">
                        <FaChartLine className="ml-1" />
                        <span>+12% من الشهر الماضي</span>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl shadow-lg p-6 text-white">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="text-yellow-100 text-sm">الحجوزات</p>
                            <p className="text-3xl font-bold">{stats.totalBookings}</p>
                        </div>
                        <div className="p-3 bg-white/20 rounded-xl">
                            <FaBookOpen className="text-2xl" />
                        </div>
                    </div>
                    <div className="flex items-center text-sm">
                        <FaChartLine className="ml-1" />
                        <span>+8% من الشهر الماضي</span>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="text-green-100 text-sm">الإيرادات</p>
                            <p className="text-3xl font-bold">{Number(stats.totalRevenue || 0).toLocaleString()}</p>
                        </div>
                        <div className="p-3 bg-white/20 rounded-xl">
                            <img src="/images/sar-currency(white).svg" alt="currency" className="w-7 h-7" />
                        </div>
                    </div>
                    <div className="flex items-center text-sm">
                        <FaChartLine className="ml-1" />
                        <span>+15% من الشهر الماضي</span>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="text-purple-100 text-sm">التقييم</p>
                            <p className="text-3xl font-bold">5/{Number(stats.avgRating || 0).toFixed(1)}</p>
                        </div>
                        <div className="p-3 bg-white/20 rounded-xl">
                            <FaStar className="text-2xl" />
                        </div>
                    </div>
                    <div className="flex items-center text-sm">
                        <FaChartLine className="ml-1" />
                        <span>ممتاز</span>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl shadow-lg p-6 text-white">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="text-pink-100 text-sm">الطلاب</p>
                            <p className="text-3xl font-bold">{stats.activeStudents}</p>
                        </div>
                        <div className="p-3 bg-white/20 rounded-xl">
                            <FaUsers className="text-2xl" />
                        </div>
                    </div>
                    <div className="flex items-center text-sm">
                        <FaChartLine className="ml-1" />
                        <span>+5% من الشهر الماضي</span>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="text-orange-100 text-sm">قيد الانتظار</p>
                            <p className="text-3xl font-bold">{stats.pendingBookings}</p>
                        </div>
                        <div className="p-3 bg-white/20 rounded-xl">
                            <FaCalendar className="text-2xl" />
                        </div>
                    </div>
                    <div className="flex items-center text-sm">
                        <FaChartLine className="ml-1" />
                        <span>يحتاج مراجعة</span>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-6">توزيع المواد الدراسية</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {subjectsDistribution.length > 0 ? (
                        subjectsDistribution.map((subject, index) => {
                            const colors = [
                                { bg: 'from-blue-50 to-blue-100', border: 'border-blue-500', text: 'text-blue-600' },
                                { bg: 'from-green-50 to-green-100', border: 'border-green-500', text: 'text-green-600' },
                                { bg: 'from-purple-50 to-purple-100', border: 'border-purple-500', text: 'text-purple-600' },
                            ];
                            const color = colors[index] || colors[0];

                            return (
                                <div key={index} className={`bg-gradient-to-br ${color.bg} rounded-lg p-4 border-r-4 ${color.border}`}>
                                    <h4 className="font-bold text-gray-900 mb-2">{subject.name}</h4>
                                    <p className={`text-3xl font-bold ${color.text}`}>{subject.teacher_count} معلم</p>
                                    <p className="text-sm text-gray-600 mt-1">{subject.percentage}% من المجموع</p>
                                </div>
                            );
                        })
                    ) : (
                        <div className="col-span-3 text-center text-gray-500 py-8">
                            لا توجد بيانات متاحة
                        </div>
                    )}
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-6">أفضل المعلمين</h3>
                <div className="space-y-4">
                    {topTeachers.length > 0 ? (
                        topTeachers.map((teacher, index) => (
                            <div key={teacher.id || index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center text-white font-bold">
                                        {index + 1}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900">{teacher.name}</p>
                                        <p className="text-sm text-gray-600">{teacher.subject}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="text-center">
                                        <p className="text-2xl font-bold text-yellow-600">{(teacher.rating || 0).toFixed(1)}</p>
                                        <p className="text-xs text-gray-600">التقييم</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-2xl font-bold text-blue-600">{teacher.bookings}</p>
                                        <p className="text-xs text-gray-600">حجز</p>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center text-gray-500 py-8">
                            لا توجد بيانات متاحة
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
