import DashboardLayout from '../../../Layouts/DashboardLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import { FaFileAlt, FaProjectDiagram, FaTrophy, FaGraduationCap, FaFile, FaCalendar, FaFilter, FaDownload, FaPlus, FaChartLine } from 'react-icons/fa';

export default function SchoolReportsIndex({ auth, stats, filters, availableYears }) {
    const [selectedYear, setSelectedYear] = useState(filters?.year || new Date().getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(filters?.month || '');

    const months = [
        { value: '', label: 'كل الأشهر' },
        { value: '1', label: 'يناير' },
        { value: '2', label: 'فبراير' },
        { value: '3', label: 'مارس' },
        { value: '4', label: 'أبريل' },
        { value: '5', label: 'مايو' },
        { value: '6', label: 'يونيو' },
        { value: '7', label: 'يوليو' },
        { value: '8', label: 'أغسطس' },
        { value: '9', label: 'سبتمبر' },
        { value: '10', label: 'أكتوبر' },
        { value: '11', label: 'نوفمبر' },
        { value: '12', label: 'ديسمبر' },
    ];

    const handleFilterChange = (year, month) => {
        router.get('/school/reports', {
            year: year,
            month: month,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const reportTypes = [
        {
            id: 'projects',
            title: 'تقرير المشاريع',
            description: 'عرض إحصائيات المشاريع المقدمة والمرفوضة والمعلقة',
            icon: FaProjectDiagram,
            color: 'from-blue-500 to-blue-700',
            stats: [
                { label: 'إجمالي المشاريع', value: stats?.projects || 0, color: 'text-blue-600' },
                { label: 'المعتمدة', value: stats?.approvedProjects || 0, color: 'text-green-600' },
                { label: 'المعلقة', value: stats?.pendingProjects || 0, color: 'text-yellow-600' },
            ],
            href: '/school/projects',
        },
        {
            id: 'challenges',
            title: 'تقرير التحديات',
            description: 'عرض إحصائيات التحديات النشطة والمكتملة',
            icon: FaTrophy,
            color: 'from-purple-500 to-purple-700',
            stats: [
                { label: 'إجمالي التحديات', value: stats?.challenges || 0, color: 'text-purple-600' },
                { label: 'التحديات النشطة', value: stats?.activeChallenges || 0, color: 'text-green-600' },
            ],
            href: '/school/challenges',
        },
        {
            id: 'students',
            title: 'تقرير الطلاب',
            description: 'عرض إحصائيات الطلاب الجدد والإجمالي',
            icon: FaGraduationCap,
            color: 'from-green-500 to-green-700',
            stats: [
                { label: 'إجمالي الطلاب', value: stats?.totalStudents || 0, color: 'text-green-600' },
                { label: 'طلاب جدد', value: stats?.newStudents || 0, color: 'text-blue-600' },
            ],
            href: '/school/students',
        },
        {
            id: 'certificates',
            title: 'تقرير الشهادات',
            description: 'عرض إحصائيات الشهادات الممنوحة',
            icon: FaFile,
            color: 'from-yellow-500 to-yellow-700',
            stats: [
                { label: 'الشهادات الممنوحة', value: stats?.certificates || 0, color: 'text-yellow-600' },
            ],
            href: '/school/certificates',
        },
    ];

    return (
        <DashboardLayout
            auth={auth}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">التقارير</h2>}
        >
            <Head title="التقارير - لوحة المدرسة" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Filters */}
                    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                        <div className="flex items-center gap-2 mb-4">
                            <FaFilter className="text-gray-600" />
                            <h3 className="text-lg font-bold text-gray-900">تصفية التقارير</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">السنة</label>
                                <select
                                    value={selectedYear}
                                    onChange={(e) => {
                                        setSelectedYear(e.target.value);
                                        handleFilterChange(e.target.value, selectedMonth);
                                    }}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#A3C042] focus:border-transparent"
                                >
                                    {availableYears?.map((year) => (
                                        <option key={year} value={year}>{year}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">الشهر</label>
                                <select
                                    value={selectedMonth}
                                    onChange={(e) => {
                                        setSelectedMonth(e.target.value);
                                        handleFilterChange(selectedYear, e.target.value);
                                    }}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#A3C042] focus:border-transparent"
                                >
                                    {months.map((month) => (
                                        <option key={month.value} value={month.value}>{month.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex items-end">
                                <button
                                    onClick={() => handleFilterChange(selectedYear, selectedMonth)}
                                    className="w-full bg-[#A3C042] hover:bg-[#8CA635] text-white font-bold py-2 px-4 rounded-lg transition"
                                >
                                    تطبيق
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Summary Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                    <FaProjectDiagram className="text-blue-600 text-xl" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-gray-900">{stats?.projects || 0}</div>
                                    <div className="text-sm text-gray-600">المشاريع</div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                                    <FaTrophy className="text-purple-600 text-xl" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-gray-900">{stats?.challenges || 0}</div>
                                    <div className="text-sm text-gray-600">التحديات</div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                    <FaGraduationCap className="text-green-600 text-xl" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-gray-900">{stats?.totalStudents || 0}</div>
                                    <div className="text-sm text-gray-600">الطلاب</div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                                    <FaFileAlt className="text-yellow-600 text-xl" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-gray-900">{stats?.certificates || 0}</div>
                                    <div className="text-sm text-gray-600">الشهادات</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Report Types */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {reportTypes.map((report) => {
                            const Icon = report.icon;
                            return (
                                <div
                                    key={report.id}
                                    className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${report.color} flex items-center justify-center shadow-lg`}>
                                            <Icon className="text-white text-2xl" />
                                        </div>
                                        <Link
                                            href={report.href}
                                            className="text-[#A3C042] hover:text-[#8CA635] font-medium text-sm"
                                        >
                                            عرض التفاصيل
                                        </Link>
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">{report.title}</h3>
                                    <p className="text-gray-600 text-sm mb-4">{report.description}</p>
                                    <div className="grid grid-cols-2 gap-3">
                                        {report.stats.map((stat, index) => (
                                            <div key={index} className="bg-gray-50 rounded-lg p-3">
                                                <div className={`text-xl font-bold ${stat.color}`}>{stat.value}</div>
                                                <div className="text-xs text-gray-600">{stat.label}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Publications Summary */}
                    <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                                <FaFileAlt className="text-indigo-600 text-xl" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">المقالات والإصدارات</h3>
                                <p className="text-gray-600 text-sm">إحصائيات المقالات المنشورة</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-indigo-50 rounded-lg p-4">
                                <div className="text-2xl font-bold text-indigo-600">{stats?.publications || 0}</div>
                                <div className="text-sm text-gray-600">إجمالي المقالات</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
