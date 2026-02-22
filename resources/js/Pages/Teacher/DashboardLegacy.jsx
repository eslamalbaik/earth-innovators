import { Head, Link } from '@inertiajs/react';
import DashboardLayout from '../../Layouts/DashboardLayout';
import { useTranslation } from '@/i18n';
import { FaProjectDiagram, FaTrophy, FaUsers, FaClipboardCheck, FaBook, FaChartLine, FaMedal, FaCheckCircle, FaClock } from 'react-icons/fa';

export default function TeacherDashboardLegacy({ auth, stats = {} }) {
    const { t } = useTranslation();
    const user = auth.user;

    const displayStats = {
        pendingProjects: stats.pendingProjects || 0,
        evaluatedProjects: stats.evaluatedProjects || 0,
        totalChallenges: stats.totalChallenges || 0,
        activeChallenges: stats.activeChallenges || 0,
        followedStudents: stats.followedStudents || 0,
        articlesPublished: stats.articlesPublished || 0,
        totalEvaluations: stats.totalEvaluations || 0,
    };

    return (
        <DashboardLayout auth={auth} header="لوحة تحكم المعلم">
            <Head title="لوحة تحكم المعلم - إرث المبتكرين" />

            <div className="bg-[#A3C042] rounded-lg shadow-lg p-6 md:p-8 mb-8 text-white">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold mb-2">{t('common.welcomeBack')} {user.name}</h1>
                        <p className="text-white/90 text-base md:text-lg">{t('dashboard.trackProjects') || 'تابع مشاريع الطلاب والتحديات التعليمية'}</p>
                    </div>
                    <div className="bg-white/20 rounded-full p-4 md:p-6 backdrop-blur-sm self-center md:self-auto">
                        <FaClipboardCheck className="text-4xl md:text-6xl text-white" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-lg p-6 border-r-4 border-yellow-500 hover:shadow-xl transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">مشاريع قيد المراجعة</p>
                            <p className="text-3xl font-bold text-gray-900">{displayStats.pendingProjects}</p>
                        </div>
                        <div className="p-4 bg-yellow-100 rounded-2xl">
                            <FaClock className="text-3xl text-yellow-600" />
                        </div>
                    </div>
                    <Link href="/teacher/projects/pending" className="text-sm text-gray-500 hover:text-[#A3C042]">
                        مراجعة الآن
                    </Link>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6 border-r-4 border-[#A3C042] hover:shadow-xl transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">المشاريع المقيمة</p>
                            <p className="text-3xl font-bold text-gray-900">{displayStats.evaluatedProjects}</p>
                        </div>
                        <div className="p-4 bg-[#A3C042]/10 rounded-2xl">
                            <FaCheckCircle className="text-3xl text-[#A3C042]" />
                        </div>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                        <span>{displayStats.totalEvaluations} تقييم</span>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6 border-r-4 border-legacy-blue hover:shadow-xl transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">التحديات</p>
                            <p className="text-3xl font-bold text-gray-900">{displayStats.totalChallenges}</p>
                        </div>
                        <div className="p-4 bg-legacy-blue/10 rounded-2xl">
                            <FaTrophy className="text-3xl text-legacy-blue" />
                        </div>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                        <span>{displayStats.activeChallenges} نشطة</span>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6 border-r-4 border-purple-500 hover:shadow-xl transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">الطلاب المتابعون</p>
                            <p className="text-3xl font-bold text-gray-900">{displayStats.followedStudents}</p>
                        </div>
                        <div className="p-4 bg-purple-100 rounded-2xl">
                            <FaUsers className="text-3xl text-purple-600" />
                        </div>
                    </div>
                    <Link href="/teacher/students" className="text-sm text-gray-500 hover:text-[#A3C042]">
                        إدارة الطلاب
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-yellow-50 to-yellow-100">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <FaProjectDiagram className="text-yellow-600" />
                                مشاريع تحتاج المراجعة
                            </h3>
                            <Link href="/teacher/projects/pending" className="text-[#A3C042] hover:text-legacy-blue text-sm font-medium">
                                عرض الكل
                            </Link>
                        </div>
                    </div>
                    <div className="p-6">
                        {stats.pendingProjectsList && stats.pendingProjectsList.length > 0 ? (
                            <div className="space-y-4">
                                {stats.pendingProjectsList.slice(0, 5).map((project) => (
                                    <div key={project.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <p className="font-semibold text-gray-900">{project.title}</p>
                                                <span className="text-xs text-gray-500">بواسطة {project.user?.name}</span>
                                            </div>
                                            <p className="text-sm text-gray-600 line-clamp-2">{project.description?.substring(0, 80)}...</p>
                                            <p className="text-xs text-gray-500 mt-2">{new Date(project.created_at).toLocaleDateString('en-US')}</p>
                                        </div>
                                        <Link href={`/teacher/projects/${project.id}/evaluate`} className="me-4 bg-[#A3C042] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary-600 transition">
                                            تقييم
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <FaCheckCircle className="mx-auto text-4xl text-gray-300 mb-4" />
                                <p className="text-gray-500">لا توجد مشاريع تحتاج المراجعة</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-legacy-blue/10 to-[#A3C042]/10">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <FaTrophy className="text-legacy-blue" />
                                تحدياتي
                            </h3>
                            <Link href="/teacher/challenges" className="text-[#A3C042] hover:text-legacy-blue text-sm font-medium">
                                عرض الكل
                            </Link>
                        </div>
                    </div>
                    <div className="p-6">
                        {stats.myChallenges && stats.myChallenges.length > 0 ? (
                            <div className="space-y-4">
                                {stats.myChallenges.slice(0, 5).map((challenge) => (
                                    <div key={challenge.id} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                                        <div className="flex items-center justify-between mb-2">
                                            <p className="font-semibold text-gray-900">{challenge.title}</p>
                                            <span className={`px-2 py-1 rounded text-xs font-semibold ${challenge.status === 'active' ? 'bg-green-100 text-green-700' :
                                                    challenge.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                                                        'bg-gray-100 text-gray-700'
                                                }`}>
                                                {challenge.status === 'active' ? 'نشط' : challenge.status === 'completed' ? 'مكتمل' : 'مسودة'}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600 mb-2">{challenge.description?.substring(0, 80)}...</p>
                                        <div className="flex items-center justify-between text-xs text-gray-500">
                                            <span>{challenge.current_participants} مشارك</span>
                                            <span>الموعد النهائي: {new Date(challenge.deadline).toLocaleDateString('en-US')}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <FaTrophy className="mx-auto text-4xl text-gray-300 mb-4" />
                                <p className="text-gray-500 mb-4">لا توجد تحديات حالياً</p>
                                <Link href="/teacher/challenges/create" className="inline-block bg-legacy-blue text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition">
                                    إنشاء تحدٍ جديد
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Link href="/teacher/projects/pending" className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-6 border-2 border-yellow-200 hover:shadow-lg transition">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="bg-yellow-500 rounded-full p-4">
                            <FaClipboardCheck className="text-3xl text-white" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">مراجعة المشاريع</h3>
                            <p className="text-sm text-gray-600">{displayStats.pendingProjects} تحتاج المراجعة</p>
                        </div>
                    </div>
                    <p className="text-gray-700">قم بتقييم مشاريع الطلاب ومنح التقييمات والشارات</p>
                </Link>

                <Link href="/teacher/challenges/create" className="bg-gradient-to-br from-legacy-blue/10 to-[#A3C042]/10 rounded-xl p-6 border-2 border-legacy-blue/20 hover:shadow-lg transition">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="bg-legacy-blue rounded-full p-4">
                            <FaTrophy className="text-3xl text-white" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">إنشاء تحدٍ</h3>
                            <p className="text-sm text-gray-600">ابدأ تحدي تعليمي جديد</p>
                        </div>
                    </div>
                    <p className="text-gray-700">أنشئ تحديات تعليمية محفزة للطلاب</p>
                </Link>

                <Link href="/teacher/articles" className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border-2 border-purple-200 hover:shadow-lg transition">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="bg-purple-500 rounded-full p-4">
                            <FaBook className="text-3xl text-white" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">نشر مقالات</h3>
                            <p className="text-sm text-gray-600">{displayStats.articlesPublished} منشورة</p>
                        </div>
                    </div>
                    <p className="text-gray-700">شارك معرفتك عبر المقالات التعليمية</p>
                </Link>
            </div>
        </DashboardLayout>
    );
}

