import { Head, Link } from '@inertiajs/react';
import DashboardLayout from '../../Layouts/DashboardLayout';
import { useTranslation } from '@/i18n';
import { FaUsers, FaProjectDiagram, FaTrophy, FaMedal, FaCertificate, FaBox, FaChartLine, FaCheckCircle, FaClock, FaSchool, FaGraduationCap } from 'react-icons/fa';

export default function AdminDashboardLegacy({ auth, stats = {} }) {
    const { t } = useTranslation();
    const user = auth.user;

    const displayStats = {
        totalUsers: stats.totalUsers || 0,
        totalStudents: stats.totalStudents || 0,
        totalTeachers: stats.totalTeachers || 0,
        totalSchools: stats.totalSchools || 0,
        totalProjects: stats.totalProjects || 0,
        pendingProjects: stats.pendingProjects || 0,
        approvedProjects: stats.approvedProjects || 0,
        totalChallenges: stats.totalChallenges || 0,
        activeChallenges: stats.activeChallenges || 0,
        totalBadges: stats.totalBadges || 0,
        totalCertificates: stats.totalCertificates || 0,
        totalPackages: stats.totalPackages || 0,
        activePackages: stats.activePackages || 0,
    };

    return (
        <DashboardLayout auth={auth} header="لوحة تحكم الإدارة">
            <Head title="لوحة تحكم الإدارة - إرث المبتكرين" />

            <div className="bg-[#A3C042] rounded-lg shadow-lg p-6 md:p-8 mb-8 text-white">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold mb-2">{t('common.welcomeBack')} {user.name}</h1>
                        <p className="text-white/90 text-base md:text-lg">{t('common.appName')} - {t('dashboard.platformManagement') || 'إدارة شاملة للمنصة'}</p>
                    </div>
                    <div className="bg-white/20 rounded-full p-4 md:p-6 backdrop-blur-sm self-center md:self-auto">
                        <FaChartLine className="text-4xl md:text-6xl text-white" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-lg p-6 border-r-4 border-[#A3C042] hover:shadow-xl transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">إجمالي المستخدمين</p>
                            <p className="text-3xl font-bold text-gray-900">{displayStats.totalUsers}</p>
                        </div>
                        <div className="p-4 bg-[#A3C042]/10 rounded-2xl">
                            <FaUsers className="text-3xl text-[#A3C042]" />
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs text-gray-500 mt-2">
                        <span>{displayStats.totalStudents} طالب</span>
                        <span>{displayStats.totalTeachers} معلم</span>
                        <span>{displayStats.totalSchools} مدرسة</span>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6 border-r-4 border-legacy-blue hover:shadow-xl transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">المشاريع</p>
                            <p className="text-3xl font-bold text-gray-900">{displayStats.totalProjects}</p>
                        </div>
                        <div className="p-4 bg-legacy-blue/10 rounded-2xl">
                            <FaProjectDiagram className="text-3xl text-legacy-blue" />
                        </div>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                        <span className="text-yellow-600">{displayStats.pendingProjects} قيد المراجعة</span>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6 border-r-4 border-purple-500 hover:shadow-xl transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">التحديات</p>
                            <p className="text-3xl font-bold text-gray-900">{displayStats.totalChallenges}</p>
                        </div>
                        <div className="p-4 bg-purple-100 rounded-2xl">
                            <FaTrophy className="text-3xl text-purple-600" />
                        </div>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                        <span className="text-green-600">{displayStats.activeChallenges} نشطة</span>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6 border-r-4 border-yellow-500 hover:shadow-xl transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">الشارات</p>
                            <p className="text-3xl font-bold text-gray-900">{displayStats.totalBadges}</p>
                        </div>
                        <div className="p-4 bg-yellow-100 rounded-2xl">
                            <FaMedal className="text-3xl text-yellow-600" />
                        </div>
                    </div>
                    <Link href="/admin/badges" className="text-sm text-gray-500 hover:text-[#A3C042]">
                        إدارة الشارات
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-lg p-6 border-r-4 border-green-500">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">الشهادات</p>
                            <p className="text-2xl font-bold text-gray-900">{displayStats.totalCertificates}</p>
                        </div>
                        <div className="p-3 bg-green-100 rounded-xl">
                            <FaCertificate className="text-2xl text-green-600" />
                        </div>
                    </div>
                    <Link href="/admin/certificates" className="text-sm text-gray-500 hover:text-[#A3C042]">
                        إدارة الشهادات
                    </Link>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6 border-r-4 border-blue-500">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">الباقات</p>
                            <p className="text-2xl font-bold text-gray-900">{displayStats.totalPackages}</p>
                        </div>
                        <div className="p-3 bg-blue-100 rounded-xl">
                            <FaBox className="text-2xl text-blue-600" />
                        </div>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                        <span>{displayStats.activePackages} نشطة</span>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6 border-r-4 border-orange-500">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">المؤسسات تعليمية</p>
                            <p className="text-2xl font-bold text-gray-900">{displayStats.totalSchools}</p>
                        </div>
                        <div className="p-3 bg-orange-100 rounded-xl">
                            <FaSchool className="text-2xl text-orange-600" />
                        </div>
                    </div>
                    <Link href="/admin/schools" className="text-sm text-gray-500 hover:text-[#A3C042]">
                        إدارة المؤسسات تعليمية
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-yellow-50 to-yellow-100">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <FaClock className="text-yellow-600" />
                                مشاريع قيد المراجعة
                            </h3>
                            <Link href="/admin/projects/pending" className="text-[#A3C042] hover:text-legacy-blue text-sm font-medium">
                                عرض الكل
                            </Link>
                        </div>
                    </div>
                    <div className="p-6">
                        {stats.pendingProjectsList && stats.pendingProjectsList.length > 0 ? (
                            <div className="space-y-4">
                                {stats.pendingProjectsList.slice(0, 5).map((project) => (
                                    <div key={project.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                        <div className="flex-1">
                                            <p className="font-semibold text-gray-900">{project.title}</p>
                                            <p className="text-sm text-gray-600">بواسطة {project.user?.name}</p>
                                            <p className="text-xs text-gray-500">{new Date(project.created_at).toLocaleDateString('en-US')}</p>
                                        </div>
                                        <Link href={`/admin/projects/${project.id}`} className="me-4 bg-[#A3C042] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary-600 transition">
                                            مراجعة
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <FaCheckCircle className="mx-auto text-4xl text-gray-300 mb-4" />
                                <p className="text-gray-500">لا توجد مشاريع قيد المراجعة</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-legacy-blue/10 to-[#A3C042]/10">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <FaTrophy className="text-legacy-blue" />
                                التحديات النشطة
                            </h3>
                            <Link href="/admin/challenges" className="text-[#A3C042] hover:text-legacy-blue text-sm font-medium">
                                عرض الكل
                            </Link>
                        </div>
                    </div>
                    <div className="p-6">
                        {stats.activeChallengesList && stats.activeChallengesList.length > 0 ? (
                            <div className="space-y-4">
                                {stats.activeChallengesList.slice(0, 5).map((challenge) => (
                                    <div key={challenge.id} className="p-4 bg-gray-50 rounded-lg">
                                        <div className="flex items-center justify-between mb-2">
                                            <p className="font-semibold text-gray-900">{challenge.title}</p>
                                            <span className="text-xs text-green-600 font-semibold">{challenge.current_participants} مشارك</span>
                                        </div>
                                        <p className="text-sm text-gray-600 mb-2">{challenge.description?.substring(0, 80)}...</p>
                                        <p className="text-xs text-gray-500">الموعد النهائي: {new Date(challenge.deadline).toLocaleDateString('en-US')}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <FaTrophy className="mx-auto text-4xl text-gray-300 mb-4" />
                                <p className="text-gray-500">لا توجد تحديات نشطة</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Link href="/admin/users" className="bg-gradient-to-br from-[#A3C042]/10 to-[#A3C042]/5 rounded-xl p-6 border-2 border-[#A3C042]/20 hover:shadow-lg transition">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="bg-[#A3C042] rounded-full p-4">
                            <FaUsers className="text-2xl text-white" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900">إدارة المستخدمين</h3>
                        </div>
                    </div>
                    <p className="text-sm text-gray-600">إدارة حسابات الطلاب والمعلمين والمؤسسات تعليمية</p>
                </Link>

                <Link href="/admin/projects" className="bg-gradient-to-br from-legacy-blue/10 to-legacy-blue/5 rounded-xl p-6 border-2 border-legacy-blue/20 hover:shadow-lg transition">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="bg-legacy-blue rounded-full p-4">
                            <FaProjectDiagram className="text-2xl text-white" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900">إدارة المشاريع</h3>
                        </div>
                    </div>
                    <p className="text-sm text-gray-600">مراجعة والموافقة على المشاريع</p>
                </Link>

                <Link href="/admin/challenges" className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border-2 border-purple-200 hover:shadow-lg transition">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="bg-purple-500 rounded-full p-4">
                            <FaTrophy className="text-2xl text-white" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900">إدارة التحديات</h3>
                        </div>
                    </div>
                    <p className="text-sm text-gray-600">إنشاء وإدارة التحديات التعليمية</p>
                </Link>

                <Link href="/admin/packages" className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border-2 border-orange-200 hover:shadow-lg transition">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="bg-orange-500 rounded-full p-4">
                            <FaBox className="text-2xl text-white" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900">إدارة الباقات</h3>
                        </div>
                    </div>
                    <p className="text-sm text-gray-600">إدارة باقات الاشتراك</p>
                </Link>
            </div>
        </DashboardLayout>
    );
}

