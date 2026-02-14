import { Head, Link } from '@inertiajs/react';
import DashboardLayout from '../../Layouts/DashboardLayout';
import {
    FaProjectDiagram,
    FaBook,
    FaTrophy,
    FaStar,
    FaEye,
    FaHeart,
    FaAward,
    FaExclamationTriangle,
    FaPlus,
    FaGraduationCap,
    FaFile
} from 'react-icons/fa';

export default function TeacherDashboard({ auth, teacher, stats, activationBanner }) {
    const {
        projects = {},
        publications = {},
        challenges = {},
        points = {},
        badges = {},
        recentProjects = [],
        recentPublications = []
    } = stats || {};

    return (
        <DashboardLayout auth={auth}>
            <Head title="لوحة تحكم المعلم" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* ترحيب */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                مرحباً بك، {teacher?.name || 'المعلم'}
                            </h1>
                            <p className="text-gray-600 text-lg">نظام ارث - إدارة مشاريعك ومقالاتك وإنجازاتك</p>
                        </div>
                        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                            <FaGraduationCap className="text-6xl text-gray-400" />
                        </div>
                    </div>
                </div>

                {/* تنبيه التفعيل */}
                {(activationBanner || teacher?.is_active === false) && (
                    <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-xl p-5 shadow-sm">
                        <div className="flex items-start gap-4">
                            <div className="mt-1">
                                <FaExclamationTriangle className="text-yellow-600 text-2xl" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-yellow-700 mb-1">
                                    {activationBanner?.title || 'حسابك قيد التفعيل'}
                                </h2>
                                <p className="text-sm text-yellow-700 leading-6">
                                    {activationBanner?.message || 'حسابك غير نشط حالياً ولن يظهر للطلاب حتى يتم تفعيله من قبل فريق الإدارة. سنقوم بإشعارك فور تفعيل الحساب.'}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* بطاقات الإحصائيات الرئيسية */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {/* إجمالي النقاط */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <p className="text-gray-500 text-sm font-medium mb-2">إجمالي النقاط</p>
                                <p className="text-3xl font-bold text-gray-900">{points.total || 0}</p>
                            </div>
                            <div className="p-3 bg-purple-50 rounded-2xl">
                                <FaStar className="text-2xl text-purple-600" />
                            </div>
                        </div>
                        <div className="pt-3 border-t border-gray-100">
                            <p className="text-sm text-gray-600">{points.count || 0} عملية</p>
                        </div>
                    </div>

                    {/* المشاريع */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <p className="text-gray-500 text-sm font-medium mb-2">المشاريع</p>
                                <p className="text-3xl font-bold text-gray-900">{projects.total || 0}</p>
                            </div>
                            <div className="p-3 bg-blue-50 rounded-2xl">
                                <FaProjectDiagram className="text-2xl text-blue-600" />
                            </div>
                        </div>
                        <div className="pt-3 border-t border-gray-100">
                            <p className="text-sm text-gray-600">{projects.approved || 0} معتمد</p>
                        </div>
                    </div>

                    {/* المقالات */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <p className="text-gray-500 text-sm font-medium mb-2">المقالات</p>
                                <p className="text-3xl font-bold text-gray-900">{publications.total || 0}</p>
                            </div>
                            <div className="p-3 bg-green-50 rounded-2xl">
                                <FaBook className="text-2xl text-green-600" />
                            </div>
                        </div>
                        <div className="pt-3 border-t border-gray-100">
                            <p className="text-sm text-gray-600">{publications.approved || 0} منشور</p>
                        </div>
                    </div>

                    {/* الشارات */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <p className="text-gray-500 text-sm font-medium mb-2">الشارات</p>
                                <p className="text-3xl font-bold text-gray-900">{badges.total || 0}</p>
                            </div>
                            <div className="p-3 bg-orange-50 rounded-2xl">
                                <FaAward className="text-2xl text-orange-600" />
                            </div>
                        </div>
                        <div className="pt-3 border-t border-gray-100">
                            <p className="text-sm text-gray-600">إنجازاتك</p>
                        </div>
                    </div>
                </div>

                {/* إحصائيات تفصيلية */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {/* إحصائيات المشاريع */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="bg-blue-50 p-3 rounded-xl border border-blue-100">
                                <FaProjectDiagram className="text-blue-600 text-2xl" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">إحصائيات المشاريع</h3>
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-gray-600">المعتمدة</span>
                                <span className="font-bold text-green-600">{projects.approved || 0}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-gray-600">قيد المراجعة</span>
                                <span className="font-bold text-yellow-600">{projects.pending || 0}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-gray-600">المرفوضة</span>
                                <span className="font-bold text-red-600">{projects.rejected || 0}</span>
                            </div>
                            <div className="flex items-center justify-between pt-2 border-t">
                                <span className="text-gray-600">إجمالي المشاهدات</span>
                                <span className="font-bold text-gray-900">{projects.totalViews || 0}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-gray-600">إجمالي الإعجابات</span>
                                <span className="font-bold text-gray-900">{projects.totalLikes || 0}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-gray-600">النقاط المكتسبة</span>
                                <span className="font-bold text-purple-600">{projects.totalPoints || 0}</span>
                            </div>
                        </div>
                        <Link
                            href="/teacher/projects"
                            className="block mt-4 text-center text-blue-600 hover:text-blue-700 font-medium"
                        >
                            عرض جميع المشاريع
                        </Link>
                    </div>

                    {/* إحصائيات المقالات */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="bg-green-50 p-3 rounded-xl border border-green-100">
                                <FaBook className="text-green-600 text-2xl" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">إحصائيات المقالات</h3>
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-gray-600">المنشورة</span>
                                <span className="font-bold text-green-600">{publications.approved || 0}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-gray-600">قيد المراجعة</span>
                                <span className="font-bold text-yellow-600">{publications.pending || 0}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-gray-600">المرفوضة</span>
                                <span className="font-bold text-red-600">{publications.rejected || 0}</span>
                            </div>
                            <div className="flex items-center justify-between pt-2 border-t">
                                <span className="text-gray-600">إجمالي المشاهدات</span>
                                <span className="font-bold text-gray-900">{publications.totalViews || 0}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-gray-600">إجمالي الإعجابات</span>
                                <span className="font-bold text-gray-900">{publications.totalLikes || 0}</span>
                            </div>
                        </div>
                        <Link
                            href="/teacher/publications"
                            className="block mt-4 text-center text-green-600 hover:text-green-700 font-medium"
                        >
                            عرض جميع المقالات
                        </Link>
                    </div>

                    {/* إحصائيات التحديات */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="bg-orange-50 p-3 rounded-xl border border-orange-100">
                                <FaTrophy className="text-orange-600 text-2xl" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">إحصائيات التحديات</h3>
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-gray-600">المُنشأة</span>
                                <span className="font-bold text-gray-900">{challenges.created || 0}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-gray-600">نشطة</span>
                                <span className="font-bold text-green-600">{challenges.active || 0}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-gray-600">مكتملة</span>
                                <span className="font-bold text-blue-600">{challenges.completed || 0}</span>
                            </div>
                        </div>
                        <Link
                            href="/teacher/challenges"
                            className="block mt-4 text-center text-orange-600 hover:text-orange-700 font-medium"
                        >
                            عرض جميع التحديات
                        </Link>
                    </div>

                    {/* إحصائيات التسليمات */}
                    {stats.submissions && (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="bg-indigo-50 p-3 rounded-xl border border-indigo-100">
                                    <FaProjectDiagram className="text-indigo-600 text-2xl" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900">تسليمات المشاريع</h3>
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600">إجمالي التسليمات</span>
                                    <span className="font-bold text-gray-900">{stats.submissions.total || 0}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600">مُسلمة</span>
                                    <span className="font-bold text-yellow-600">{stats.submissions.submitted || 0}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600">مقبولة</span>
                                    <span className="font-bold text-green-600">{stats.submissions.approved || 0}</span>
                                </div>
                            </div>
                            <Link
                                href="/teacher/submissions"
                                className="block mt-4 text-center text-indigo-600 hover:text-indigo-700 font-medium"
                            >
                                عرض جميع التسليمات
                            </Link>
                        </div>
                    )}
                </div>

                {/* روابط سريعة */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <Link
                        href="/teacher/projects/create"
                        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition group"
                    >
                        <div className="flex items-center gap-4">
                            <div className="bg-blue-50 p-3 rounded-xl border border-blue-100 group-hover:bg-blue-100 transition">
                                <FaPlus className="text-blue-600 text-2xl" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900">إنشاء مشروع جديد</h3>
                                <p className="text-sm text-gray-600 mt-1">ابدأ مشروعك الإبداعي</p>
                            </div>
                        </div>
                    </Link>

                    <Link
                        href="/teacher/publications/create"
                        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition group"
                    >
                        <div className="flex items-center gap-4">
                            <div className="bg-green-50 p-3 rounded-xl border border-green-100 group-hover:bg-green-100 transition">
                                <FaPlus className="text-green-600 text-2xl" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900">نشر مقال جديد</h3>
                                <p className="text-sm text-gray-600 mt-1">شارك معرفتك مع المجتمع</p>
                            </div>
                        </div>
                    </Link>

                    <Link
                        href="/teacher/challenges/create"
                        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition group"
                    >
                        <div className="flex items-center gap-4">
                            <div className="bg-orange-50 p-3 rounded-xl border border-orange-100 group-hover:bg-orange-100 transition">
                                <FaPlus className="text-orange-600 text-2xl" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900">إنشاء تحدٍ</h3>
                                <p className="text-sm text-gray-600 mt-1">ابدأ تحدي تعليمي جديد</p>
                            </div>
                        </div>
                    </Link>
                </div>

                {/* المشاريع والمقالات الأخيرة */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* المشاريع الأخيرة */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                            <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                <FaProjectDiagram className="text-blue-600" />
                                المشاريع الأخيرة
                            </h3>
                        </div>
                        <div className="p-6">
                            {recentProjects.length === 0 ? (
                                <div className="text-center py-8">
                                    <FaProjectDiagram className="mx-auto text-4xl text-gray-300 mb-4" />
                                    <p className="text-gray-500 mb-4">لا توجد مشاريع حالياً</p>
                                    <Link
                                        href="/teacher/projects/create"
                                        className="inline-block text-blue-600 hover:text-blue-700 font-medium"
                                    >
                                        إنشاء مشروع جديد
                                    </Link>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {recentProjects.map((project) => (
                                        <div key={project.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                                            <div className="flex-1">
                                                <p className="font-medium text-gray-900">{project.title}</p>
                                                <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                                                    <span className="flex items-center gap-1">
                                                        <FaEye className="text-gray-400" />
                                                        {project.views}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <FaHeart className="text-gray-400" />
                                                        {project.likes}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <FaStar className="text-purple-400" />
                                                        {project.points}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-gray-500 mt-1">{project.created_at}</p>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                project.status === 'approved' ? 'bg-green-100 text-green-800' :
                                                project.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-red-100 text-red-800'
                                            }`}>
                                                {project.status === 'approved' ? 'معتمد' :
                                                 project.status === 'pending' ? 'قيد المراجعة' :
                                                 'مرفوض'}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <Link
                                href="/teacher/projects"
                                className="block mt-4 text-center text-blue-600 hover:text-blue-700 font-medium"
                            >
                                عرض جميع المشاريع 
                            </Link>
                        </div>
                    </div>

                    {/* المقالات الأخيرة */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                            <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                <FaBook className="text-green-600" />
                                المقالات الأخيرة
                            </h3>
                        </div>
                        <div className="p-6">
                            {recentPublications.length === 0 ? (
                                <div className="text-center py-8">
                                    <FaBook className="mx-auto text-4xl text-gray-300 mb-4" />
                                    <p className="text-gray-500 mb-4">لا توجد مقالات حالياً</p>
                                    <Link
                                        href="/teacher/publications/create"
                                        className="inline-block text-green-600 hover:text-green-700 font-medium"
                                    >
                                        نشر مقال جديد
                                    </Link>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {recentPublications.map((publication) => (
                                        <div key={publication.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                                            <div className="flex-1">
                                                <p className="font-medium text-gray-900">{publication.title}</p>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    {publication.type === 'magazine' ? 'مجلة' :
                                                     publication.type === 'booklet' ? 'كتيب' :
                                                     publication.type === 'article' ? 'مقال' :
                                                     publication.type === 'study' ? 'دراسة' :
                                                     publication.type === 'news' ? 'اخبار' :
                                                     'تقرير'}
                                                </p>
                                                <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                                                    <span className="flex items-center gap-1">
                                                        <FaEye className="text-gray-400" />
                                                        {publication.views}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <FaHeart className="text-gray-400" />
                                                        {publication.likes}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-gray-500 mt-1">{publication.created_at}</p>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                publication.status === 'approved' ? 'bg-green-100 text-green-800' :
                                                publication.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-red-100 text-red-800'
                                            }`}>
                                                {publication.status === 'approved' ? 'منشور' :
                                                 publication.status === 'pending' ? 'قيد المراجعة' :
                                                 'مرفوض'}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <Link
                                href="/teacher/publications"
                                className="block mt-4 text-center text-green-600 hover:text-green-700 font-medium"
                            >
                                عرض جميع المقالات
                            </Link>
                        </div>
                    </div>
                </div>

                {/* الشارات الأخيرة */}
                {badges.recent && badges.recent.length > 0 && (
                    <div className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                            <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                <FaAward className="text-orange-600" />
                                الشارات المكتسبة
                            </h3>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                {badges.recent.map((badge, index) => (
                                    <div key={index} className="text-center p-4 bg-gray-50 rounded-xl border border-gray-100">
                                        {badge.icon && (
                                            <div className="text-4xl mb-2">{badge.icon}</div>
                                        )}
                                        <p className="font-medium text-gray-900 text-sm">{badge.name}</p>
                                        {badge.earned_at && (
                                            <p className="text-xs text-gray-500 mt-1">{badge.earned_at}</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
