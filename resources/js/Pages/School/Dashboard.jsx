import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, router } from '@inertiajs/react';
import {
    FaProjectDiagram, FaTrophy, FaMedal, FaChartLine, FaUsers,
    FaCheckCircle, FaTimesCircle, FaClock, FaFlask, FaRocket,
    FaAward, FaLightbulb, FaCrown, FaStar, FaArrowLeft
} from 'react-icons/fa';
import { toHijriDate } from '@/utils/dateUtils';

export default function SchoolDashboard({ auth, stats = {}, pendingProjects = [], recentApprovedProjects = [] }) {
    const user = auth.user;

    const categoryColors = {
        science: 'bg-blue-100 text-blue-700 border-blue-300',
        technology: 'bg-purple-100 text-purple-700 border-purple-300',
        engineering: 'bg-orange-100 text-orange-700 border-orange-300',
        mathematics: 'bg-green-100 text-green-700 border-green-300',
        arts: 'bg-pink-100 text-pink-700 border-pink-300',
        other: 'bg-gray-100 text-gray-700 border-gray-300',
    };

    const categoryLabels = {
        science: 'علوم',
        technology: 'تقني',
        engineering: 'هندسة',
        mathematics: 'رياضيات',
        arts: 'فنون',
        other: 'أخرى',
    };

    const handleApprove = (projectId) => {
        if (confirm('هل أنت متأكد من قبول هذا المشروع؟')) {
            router.post(`/school/projects/${projectId}/approve`, {}, {
                preserveScroll: true,
            });
        }
    };

    const handleReject = (projectId) => {
        if (confirm('هل أنت متأكد من رفض هذا المشروع؟')) {
            router.post(`/school/projects/${projectId}/reject`, {}, {
                preserveScroll: true,
            });
        }
    };

    return (
        <DashboardLayout header="لوحة تحكم المدرسة">
            <Head title="لوحة تحكم المدرسة - إرث المبتكرين" />

            <div className="bg-gradient-to-r from-legacy-green to-legacy-blue rounded-lg shadow-lg p-8 mb-8 text-white">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">مرحباً بك، {user.name} 👋</h1>
                        <p className="text-white/90 text-lg">إدارة مشاريع طلابك ومتابعة إنجازاتهم</p>
                        {stats.rank && (
                            <div className="mt-4 flex items-center gap-4">
                                <div className="bg-white/20 rounded-lg px-4 py-2 backdrop-blur-sm">
                                    <div className="flex items-center gap-2">
                                        <FaTrophy className="text-yellow-300" />
                                        <span className="font-semibold">الترتيب: {stats.rank} من {stats.totalSchools}</span>
                                    </div>
                                </div>
                                <div className="bg-white/20 rounded-lg px-4 py-2 backdrop-blur-sm">
                                    <div className="flex items-center gap-2">
                                        <FaStar className="text-yellow-300" />
                                        <span className="font-semibold">إجمالي النقاط: {stats.totalPoints || 0}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="bg-white/20 rounded-full p-6 backdrop-blur-sm">
                        <FaUsers className="text-6xl text-white" />
                    </div>
                </div>
            </div>

            {/* الإحصائيات */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-lg p-6 border-r-4 border-legacy-green hover:shadow-xl transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">إجمالي المشاريع</p>
                            <p className="text-3xl font-bold text-gray-900">{stats.totalProjects || 0}</p>
                        </div>
                        <div className="p-4 bg-gradient-to-br from-legacy-green/20 to-legacy-blue/20 rounded-2xl">
                            <FaProjectDiagram className="text-3xl text-legacy-green" />
                        </div>
                    </div>
                    <div className="flex items-center text-sm text-gray-500 gap-4">
                        <span className="text-green-600 font-semibold">{stats.approvedProjects || 0} موافق</span>
                        <span className="text-yellow-600 font-semibold">{stats.pendingProjects || 0} قيد المراجعة</span>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6 border-r-4 border-legacy-blue hover:shadow-xl transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">عدد الطلاب</p>
                            <p className="text-3xl font-bold text-gray-900">{stats.totalStudents || 0}</p>
                        </div>
                        <div className="p-4 bg-gradient-to-br from-legacy-green/20 to-legacy-blue/20 rounded-2xl">
                            <FaUsers className="text-3xl text-legacy-blue" />
                        </div>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                        <span className="text-legacy-green font-semibold">{stats.studentsWithProjects || 0} لديهم مشاريع</span>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6 border-r-4 border-yellow-500 hover:shadow-xl transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">إجمالي النقاط</p>
                            <p className="text-3xl font-bold text-gray-900">{stats.totalPoints || 0}</p>
                        </div>
                        <div className="p-4 bg-gradient-to-br from-legacy-green/20 to-legacy-blue/20 rounded-2xl">
                            <FaStar className="text-3xl text-yellow-500" />
                        </div>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                        <span className="text-gray-700">متوسط: {stats.avgPointsPerStudent || 0} نقطة/طالب</span>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6 border-r-4 border-purple-500 hover:shadow-xl transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">الشارات المكتسبة</p>
                            <p className="text-3xl font-bold text-gray-900">{stats.totalBadges || 0}</p>
                        </div>
                        <div className="p-4 bg-gradient-to-br from-legacy-green/20 to-legacy-blue/20 rounded-2xl">
                            <FaMedal className="text-3xl text-purple-500" />
                        </div>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                        <span className="text-purple-600 font-semibold">{stats.uniqueBadges || 0} نوع مختلف</span>
                    </div>
                </div>

                {/* إحصائيات التسليمات */}
                {stats.submissions && (
                    <div className="bg-white rounded-xl shadow-lg p-6 border-r-4 border-indigo-500 hover:shadow-xl transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">تسليمات المشاريع</p>
                                <p className="text-3xl font-bold text-gray-900">{stats.submissions.total || 0}</p>
                            </div>
                            <div className="p-4 bg-gradient-to-br from-legacy-green/20 to-legacy-blue/20 rounded-2xl">
                                <FaProjectDiagram className="text-3xl text-indigo-500" />
                            </div>
                        </div>
                        <div className="flex items-center text-sm text-gray-500 gap-4">
                            <span className="text-yellow-600 font-semibold">{stats.submissions.submitted || 0} مُسلمة</span>
                            <span className="text-green-600 font-semibold">{stats.submissions.approved || 0} مقبولة</span>
                        </div>
                        <Link
                            href="/school/submissions"
                            className="block mt-4 text-center text-indigo-600 hover:text-indigo-700 font-medium text-sm"
                        >
                            عرض جميع التسليمات →
                        </Link>
                    </div>
                )}
            </div>

            {/* المشاريع المعلقة للمراجعة */}
            {pendingProjects && pendingProjects.length > 0 && (
                <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
                    <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-legacy-green/10 to-legacy-blue/10">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <FaClock className="text-legacy-green" />
                                المشاريع المعلقة للمراجعة ({pendingProjects.length})
                            </h3>
                            <Link href="/school/projects/pending" className="text-legacy-green hover:text-legacy-blue text-sm font-medium">
                                عرض الكل →
                            </Link>
                        </div>
                    </div>
                    <div className="p-6">
                        <div className="space-y-4">
                            {pendingProjects.slice(0, 5).map((project) => (
                                <div key={project.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h4 className="text-lg font-semibold text-gray-900">{project.title}</h4>
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${categoryColors[project.category] || categoryColors.other}`}>
                                                    {categoryLabels[project.category] || 'أخرى'}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-600 mb-2">الطالب: {project.student_name}</p>
                                            <p className="text-xs text-gray-500">تاريخ الإرسال: {toHijriDate(project.created_at)}</p>
                                        </div>
                                        <div className="flex items-center gap-2 mr-4">
                                            <button
                                                onClick={() => handleApprove(project.id)}
                                                className="bg-legacy-green hover:bg-primary-600 text-white px-4 py-2 rounded-lg font-medium transition duration-300 flex items-center gap-2 shadow-md"
                                            >
                                                <FaCheckCircle />
                                                قبول
                                            </button>
                                            <button
                                                onClick={() => handleReject(project.id)}
                                                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition duration-300 flex items-center gap-2 shadow-md"
                                            >
                                                <FaTimesCircle />
                                                رفض
                                            </button>
                                            <Link
                                                href={`/school/projects/${project.id}`}
                                                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition duration-300 flex items-center gap-2"
                                            >
                                                عرض
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* المشاريع المقبولة حديثاً */}
            {recentApprovedProjects && recentApprovedProjects.length > 0 && (
                <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
                    <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-legacy-green/10 to-legacy-blue/10">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <FaCheckCircle className="text-legacy-green" />
                                المشاريع المقبولة حديثاً
                            </h3>
                            <Link href="/school/projects" className="text-legacy-green hover:text-legacy-blue text-sm font-medium">
                                عرض الكل →
                            </Link>
                        </div>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {recentApprovedProjects.map((project) => (
                                <div key={project.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                                    <div className="flex items-center gap-2 mb-2">
                                        <h4 className="text-lg font-semibold text-gray-900">{project.title}</h4>
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${categoryColors[project.category] || categoryColors.other}`}>
                                            {categoryLabels[project.category] || 'أخرى'}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-2">الطالب: {project.student_name}</p>
                                    <div className="flex items-center justify-between mt-3">
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <FaStar className="text-yellow-500" />
                                            <span>{project.points_earned || 0} نقطة</span>
                                        </div>
                                        <p className="text-xs text-gray-500">{toHijriDate(project.approved_at)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* إجراءات سريعة */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Link
                    href="/school/projects/pending"
                    className="bg-gradient-to-r from-legacy-green to-legacy-blue rounded-xl p-6 text-white hover:shadow-xl transition transform hover:scale-105"
                >
                    <div className="flex items-center gap-4">
                        <div className="bg-white/20 rounded-lg p-4">
                            <FaClock className="text-3xl" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold mb-1">مراجعة المشاريع</h3>
                            <p className="text-white/90">قبول أو رفض المشاريع المعلقة</p>
                        </div>
                    </div>
                </Link>

                <Link
                    href="/school/projects/create"
                    className="bg-gradient-to-r from-legacy-blue to-purple-600 rounded-xl p-6 text-white hover:shadow-xl transition transform hover:scale-105"
                >
                    <div className="flex items-center gap-4">
                        <div className="bg-white/20 rounded-lg p-4">
                            <FaProjectDiagram className="text-3xl" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold mb-1">إنشاء مشروع</h3>
                            <p className="text-white/90">نشر مشروع جديد للمدرسة</p>
                        </div>
                    </div>
                </Link>

                <Link
                    href="/school/ranking"
                    className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl p-6 text-white hover:shadow-xl transition transform hover:scale-105"
                >
                    <div className="flex items-center gap-4">
                        <div className="bg-white/20 rounded-lg p-4">
                            <FaTrophy className="text-3xl" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold mb-1">الترتيب والشارات</h3>
                            <p className="text-white/90">متابعة ترتيب المدرسة والمنافسة</p>
                        </div>
                    </div>
                </Link>

                <Link
                    href="/school/students"
                    className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 text-white hover:shadow-xl transition transform hover:scale-105"
                >
                    <div className="flex items-center gap-4">
                        <div className="bg-white/20 rounded-lg p-4">
                            <FaUsers className="text-3xl" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold mb-1">إدارة الطلاب</h3>
                            <p className="text-white/90">عرض وإدارة طلاب المدرسة</p>
                        </div>
                    </div>
                </Link>
            </div>
        </DashboardLayout>
    );
}

