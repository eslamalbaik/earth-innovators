import DashboardLayout from '@/Layouts/DashboardLayout';
import { useConfirmDialog } from '@/Contexts/ConfirmContext';
import { Head, Link, router } from '@inertiajs/react';
import { useTranslation } from '@/i18n';
import {
    FaProjectDiagram, FaTrophy, FaMedal, FaChartLine, FaUsers,
    FaCheckCircle, FaTimesCircle, FaClock, FaFlask, FaRocket,
    FaAward, FaLightbulb, FaCrown, FaStar, FaArrowLeft
} from 'react-icons/fa';
import { toHijriDate } from '@/utils/dateUtils';

export default function SchoolDashboard({ auth, stats = {}, pendingProjects = [], recentApprovedProjects = [] }) {
    const { t } = useTranslation();
    const user = auth.user;
    const { confirm } = useConfirmDialog();

    const categoryColors = {
        science: 'bg-blue-100 text-blue-700 border-blue-300',
        technology: 'bg-purple-100 text-purple-700 border-purple-300',
        engineering: 'bg-orange-100 text-orange-700 border-orange-300',
        mathematics: 'bg-green-100 text-green-700 border-green-300',
        arts: 'bg-pink-100 text-pink-700 border-pink-300',
        other: 'bg-gray-100 text-gray-700 border-gray-300',
    };

    const categoryLabels = {
        science: t('common.categories.science'),
        technology: t('common.categories.technology'),
        engineering: t('common.categories.engineering'),
        mathematics: t('common.categories.mathematics'),
        arts: t('common.categories.arts'),
        other: t('common.categories.other'),
    };

    const handleApprove = async (projectId, projectTitle) => {
        const confirmed = await confirm({
            title: t('schoolDashboardPage.confirmApproveTitle'),
            message: t('schoolDashboardPage.confirmApproveMessage', { title: projectTitle }),
            confirmText: t('schoolDashboardPage.approveAction'),
            cancelText: t('common.cancel'),
            variant: 'info',
        });

        if (confirmed) {
            router.post(`/school/projects/${projectId}/approve`, {}, {
                preserveScroll: true,
            });
        }
    };

    const handleReject = async (projectId, projectTitle) => {
        const confirmed = await confirm({
            title: t('schoolDashboardPage.confirmRejectTitle'),
            message: t('schoolDashboardPage.confirmRejectMessage', { title: projectTitle }),
            confirmText: t('schoolDashboardPage.rejectAction'),
            cancelText: t('common.cancel'),
            variant: 'warning',
        });

        if (confirmed) {
            router.post(`/school/projects/${projectId}/reject`, {}, {
                preserveScroll: true,
            });
        }
    };

    return (
        <DashboardLayout header={t('dashboard.schoolDashboard')}>
            <Head title={t('schoolDashboardPage.pageTitle', { appName: t('common.appName') })} />

            {/* Welcome Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 mb-8">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-900">{t('common.welcomeBack')} {user.name}</h1>
                        <p className="text-gray-600 text-base md:text-lg">{t('dashboard.manageStudentProjects')}</p>
                        {stats.rank && (
                            <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                                <div className="bg-blue-50 rounded-xl px-4 py-2 border border-blue-100">
                                    <div className="flex items-center gap-2">
                                        <FaTrophy className="text-yellow-500" />
                                        <span className="font-semibold text-gray-900">{t('dashboard.rank')}: {stats.rank} {t('dashboard.from')} {stats.totalSchools}</span>
                                    </div>
                                </div>
                                <div className="bg-green-50 rounded-xl px-4 py-2 border border-green-100">
                                    <div className="flex items-center gap-2">
                                        <FaStar className="text-yellow-500" />
                                        <span className="font-semibold text-gray-900">{t('dashboard.totalPoints')}: {stats.totalPoints || 0}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="bg-gray-50 rounded-2xl p-4 md:p-6 border border-gray-100 self-center md:self-auto">
                        <FaUsers className="text-4xl md:text-6xl text-gray-400" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="text-sm text-gray-500 font-medium mb-2">{t('schoolDashboardPage.totalProjects')}</p>
                            <p className="text-3xl font-bold text-gray-900">{stats.totalProjects || 0}</p>
                        </div>
                        <div className="p-4 bg-green-50 rounded-2xl">
                            <FaProjectDiagram className="text-3xl text-green-600" />
                        </div>
                    </div>
                    <div className="flex items-center text-sm text-gray-600 gap-4 pt-3 border-t border-gray-100">
                        <span className="font-semibold text-gray-900">{stats.approvedProjects || 0} {t('schoolDashboardPage.approvedShort')}</span>
                        <span className="font-semibold text-gray-900">{stats.pendingProjects || 0} {t('schoolDashboardPage.pendingReviewShort')}</span>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="text-sm text-gray-500 font-medium mb-2">{t('schoolDashboardPage.totalStudents')}</p>
                            <p className="text-3xl font-bold text-gray-900">{stats.totalStudents || 0}</p>
                        </div>
                        <div className="p-4 bg-blue-50 rounded-2xl">
                            <FaUsers className="text-3xl text-blue-600" />
                        </div>
                    </div>
                    <div className="flex items-center text-sm text-gray-600 pt-3 border-t border-gray-100">
                        <span className="font-semibold text-gray-900">{t('schoolDashboardPage.studentsWithProjects', { count: stats.studentsWithProjects || 0 })}</span>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="text-sm text-gray-500 font-medium mb-2">{t('schoolDashboardPage.totalPoints')}</p>
                            <p className="text-3xl font-bold text-gray-900">{stats.totalPoints || 0}</p>
                        </div>
                        <div className="p-4 bg-yellow-50 rounded-2xl">
                            <FaStar className="text-3xl text-yellow-600" />
                        </div>
                    </div>
                    <div className="flex items-center text-sm text-gray-600 pt-3 border-t border-gray-100">
                        <span className="font-semibold text-gray-900">{t('schoolDashboardPage.avgPointsPerStudent', { points: stats.avgPointsPerStudent || 0 })}</span>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="text-sm text-gray-500 font-medium mb-2">{t('schoolDashboardPage.totalBadges')}</p>
                            <p className="text-3xl font-bold text-gray-900">{stats.totalBadges || 0}</p>
                        </div>
                        <div className="p-4 bg-purple-50 rounded-2xl">
                            <FaMedal className="text-3xl text-purple-600" />
                        </div>
                    </div>
                    <div className="flex items-center text-sm text-gray-600 pt-3 border-t border-gray-100">
                        <span className="font-semibold text-gray-900">{t('schoolDashboardPage.uniqueBadges', { count: stats.uniqueBadges || 0 })}</span>
                    </div>
                </div>

                {stats.submissions && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <p className="text-sm text-gray-500 font-medium mb-2">{t('schoolDashboardPage.submissionsTitle')}</p>
                                <p className="text-3xl font-bold text-gray-900">{stats.submissions.total || 0}</p>
                            </div>
                            <div className="p-4 bg-indigo-50 rounded-2xl">
                                <FaProjectDiagram className="text-3xl text-indigo-600" />
                            </div>
                        </div>
                        <div className="flex items-center text-sm text-gray-600 gap-4 pt-3 border-t border-gray-100">
                            <span className="font-semibold text-gray-900">{t('schoolDashboardPage.submittedCount', { count: stats.submissions.submitted || 0 })}</span>
                            <span className="font-semibold text-gray-900">{t('schoolDashboardPage.acceptedCount', { count: stats.submissions.approved || 0 })}</span>
                        </div>
                        <Link
                            href="/school/submissions"
                            className="block mt-4 text-center text-indigo-600 hover:text-indigo-700 font-medium text-sm"
                        >
                            {t('schoolDashboardPage.viewAllSubmissions')}
                        </Link>
                    </div>
                )}
            </div>

            {pendingProjects && pendingProjects.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
                    <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <FaClock className="text-yellow-600" />
                                {t('schoolDashboardPage.pendingProjectsTitle', { count: pendingProjects.length })}
                            </h3>
                            <Link href="/school/projects/pending" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                                {t('common.viewAll')}
                            </Link>
                        </div>
                    </div>
                    <div className="p-6">
                        <div className="space-y-3">
                            {pendingProjects.slice(0, 5).map((project) => (
                                <div key={project.id} className="border border-gray-100 rounded-xl p-4 hover:shadow-sm transition bg-gray-50/50">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h4 className="text-lg font-semibold text-gray-900">{project.title}</h4>
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${categoryColors[project.category] || categoryColors.other}`}>
                                                    {categoryLabels[project.category] || t('common.categories.other')}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-600 mb-2">{t('schoolDashboardPage.studentLabel', { name: project.student_name })}</p>
                                            <p className="text-xs text-gray-500">{t('schoolDashboardPage.submissionDateLabel', { date: toHijriDate(project.created_at) })}</p>
                                        </div>
                                        <div className="flex items-center gap-2 ms-4">
                                            <button
                                                onClick={() => handleApprove(project.id, project.title)}
                                                className="bg-[#A3C042] hover:bg-primary-600 text-white px-4 py-2 rounded-lg font-medium transition duration-300 flex items-center gap-2 shadow-md"
                                            >
                                                <FaCheckCircle />
                                                {t('schoolDashboardPage.approveAction')}
                                            </button>
                                            <button
                                                onClick={() => handleReject(project.id, project.title)}
                                                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition duration-300 flex items-center gap-2 shadow-md"
                                            >
                                                <FaTimesCircle />
                                                {t('schoolDashboardPage.rejectAction')}
                                            </button>
                                            <Link
                                                href={`/school/projects/${project.id}`}
                                                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition duration-300 flex items-center gap-2"
                                            >
                                                {t('schoolDashboardPage.viewAction')}
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {recentApprovedProjects && recentApprovedProjects.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
                    <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <FaCheckCircle className="text-green-600" />
                                {t('schoolDashboardPage.recentApprovedProjectsTitle')}
                            </h3>
                            <Link href="/school/projects" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                                {t('common.viewAll')}
                            </Link>
                        </div>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {recentApprovedProjects.map((project) => (
                                <div key={project.id} className="border border-gray-100 rounded-xl p-4 hover:shadow-sm transition bg-gray-50/50">
                                    <div className="flex items-center gap-2 mb-2">
                                        <h4 className="text-lg font-semibold text-gray-900">{project.title}</h4>
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${categoryColors[project.category] || categoryColors.other}`}>
                                            {categoryLabels[project.category] || t('common.categories.other')}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-2">{t('schoolDashboardPage.studentLabel', { name: project.student_name })}</p>
                                    <div className="flex items-center justify-between mt-3">
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <FaStar className="text-yellow-500" />
                                            <span>{t('schoolDashboardPage.pointsLabel', { points: project.points_earned || 0 })}</span>
                                        </div>
                                        <p className="text-xs text-gray-500">{toHijriDate(project.approved_at)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Link
                    href="/school/projects/pending"
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition"
                >
                    <div className="flex items-center gap-4">
                        <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-100">
                            <FaClock className="text-3xl text-yellow-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 mb-1">{t('schoolDashboardPage.reviewProjectsTitle')}</h3>
                            <p className="text-sm text-gray-600">{t('schoolDashboardPage.reviewProjectsSubtitle')}</p>
                        </div>
                    </div>
                </Link>

                <Link
                    href="/school/projects/create"
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition"
                >
                    <div className="flex items-center gap-4">
                        <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                            <FaProjectDiagram className="text-3xl text-blue-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 mb-1">{t('schoolDashboardPage.createProjectTitle')}</h3>
                            <p className="text-sm text-gray-600">{t('schoolDashboardPage.createProjectSubtitle')}</p>
                        </div>
                    </div>
                </Link>

                <Link
                    href="/school/ranking"
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition"
                >
                    <div className="flex items-center gap-4">
                        <div className="bg-orange-50 rounded-xl p-4 border border-orange-100">
                            <FaTrophy className="text-3xl text-orange-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 mb-1">{t('schoolDashboardPage.rankingTitle')}</h3>
                            <p className="text-sm text-gray-600">{t('schoolDashboardPage.rankingSubtitle')}</p>
                        </div>
                    </div>
                </Link>

                <Link
                    href="/school/students"
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition"
                >
                    <div className="flex items-center gap-4">
                        <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
                            <FaUsers className="text-3xl text-purple-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 mb-1">{t('schoolDashboardPage.manageStudentsTitle')}</h3>
                            <p className="text-sm text-gray-600">{t('schoolDashboardPage.manageStudentsSubtitle')}</p>
                        </div>
                    </div>
                </Link>
            </div>
        </DashboardLayout>
    );
}
