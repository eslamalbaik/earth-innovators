import { Head, Link } from '@inertiajs/react';
import DashboardLayout from '../../Layouts/DashboardLayout';
import { useTranslation } from '@/i18n';
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
    const { t } = useTranslation();
    const {
        projects = {},
        publications = {},
        challenges = {},
        points = {},
        badges = {},
        recentProjects = [],
        recentPublications = []
    } = stats || {};

    const statusBadgeClasses = {
        approved: 'bg-green-100 text-green-800',
        pending: 'bg-yellow-100 text-yellow-800',
        rejected: 'bg-red-100 text-red-800',
    };

    const getStatusKeys = (status, type = 'project') => {
        const projectStatus = {
            approved: 'teacherDashboardPage.projectStatusApproved',
            pending: 'teacherDashboardPage.projectStatusPendingReview',
            rejected: 'teacherDashboardPage.projectStatusRejected',
        };

        const publicationStatus = {
            approved: 'teacherDashboardPage.publicationStatusPublished',
            pending: 'teacherDashboardPage.publicationStatusPendingReview',
            rejected: 'teacherDashboardPage.publicationStatusRejected',
        };

        if (type === 'publication') {
            return publicationStatus[status] || 'common.status';
        }

        return projectStatus[status] || 'common.status';
    };

    const publicationTypeLabels = {
        magazine: t('teacherDashboardPage.publicationTypes.magazine'),
        booklet: t('teacherDashboardPage.publicationTypes.booklet'),
        article: t('teacherDashboardPage.publicationTypes.article'),
        study: t('teacherDashboardPage.publicationTypes.study'),
        news: t('teacherDashboardPage.publicationTypes.news'),
        report: t('teacherDashboardPage.publicationTypes.report'),
        other: t('teacherDashboardPage.publicationTypes.other'),
    };

    const renderStatusBadge = (status, type = 'project') => (
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            statusBadgeClasses[status] || 'bg-gray-100 text-gray-800'
        }`}>
            {t(getStatusKeys(status, type))}
        </span>
    );

    return (
        <DashboardLayout auth={auth}>
            <Head title={t('teacherDashboardPage.title')} />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 mb-8">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                                {t('common.welcomeBack')} {teacher?.name || t('common.teacher')}
                            </h1>
                            <p className="text-gray-600 text-base md:text-lg">{t('common.appName')} - {t('dashboard.manageProjects')}</p>
                        </div>
                        <div className="bg-gray-50 rounded-2xl p-4 md:p-6 border border-gray-100 self-center md:self-auto">
                            <FaGraduationCap className="text-4xl md:text-6xl text-gray-400" />
                        </div>
                    </div>
                </div>

                {(activationBanner || teacher?.is_active === false) && (
                    <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-xl p-5 shadow-sm">
                        <div className="flex items-start gap-4">
                            <div className="mt-1">
                                <FaExclamationTriangle className="text-yellow-600 text-2xl" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-yellow-700 mb-1">
                                    {activationBanner?.title || t('teacherDashboardPage.activationTitle')}
                                </h2>
                                <p className="text-sm text-yellow-700 leading-6">
                                    {activationBanner?.message || t('teacherDashboardPage.activationMessage')}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <p className="text-gray-500 text-sm font-medium mb-2">{t('teacherDashboardPage.totalPoints')}</p>
                                <p className="text-3xl font-bold text-gray-900">{points.total || 0}</p>
                            </div>
                            <div className="p-3 bg-purple-50 rounded-2xl">
                                <FaStar className="text-2xl text-purple-600" />
                            </div>
                        </div>
                        <div className="pt-3 border-t border-gray-100">
                            <p className="text-sm text-gray-600">{t('teacherDashboardPage.operationsCount', { count: points.count || 0 })}</p>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <p className="text-gray-500 text-sm font-medium mb-2">{t('common.projects')}</p>
                                <p className="text-3xl font-bold text-gray-900">{projects.total || 0}</p>
                            </div>
                            <div className="p-3 bg-blue-50 rounded-2xl">
                                <FaProjectDiagram className="text-2xl text-blue-600" />
                            </div>
                        </div>
                        <div className="pt-3 border-t border-gray-100">
                            <p className="text-sm text-gray-600">{t('teacherDashboardPage.approvedCount', { count: projects.approved || 0 })}</p>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <p className="text-gray-500 text-sm font-medium mb-2">{t('teacherDashboardPage.publications')}</p>
                                <p className="text-3xl font-bold text-gray-900">{publications.total || 0}</p>
                            </div>
                            <div className="p-3 bg-green-50 rounded-2xl">
                                <FaBook className="text-2xl text-green-600" />
                            </div>
                        </div>
                        <div className="pt-3 border-t border-gray-100">
                            <p className="text-sm text-gray-600">{t('teacherDashboardPage.publishedCount', { count: publications.approved || 0 })}</p>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <p className="text-gray-500 text-sm font-medium mb-2">{t('common.badges')}</p>
                                <p className="text-3xl font-bold text-gray-900">{badges.total || 0}</p>
                            </div>
                            <div className="p-3 bg-orange-50 rounded-2xl">
                                <FaAward className="text-2xl text-orange-600" />
                            </div>
                        </div>
                        <div className="pt-3 border-t border-gray-100">
                            <p className="text-sm text-gray-600">{t('teacherDashboardPage.achievements')}</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="bg-blue-50 p-3 rounded-xl border border-blue-100">
                                <FaProjectDiagram className="text-blue-600 text-2xl" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">{t('teacherDashboardPage.projectsStatsTitle')}</h3>
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-gray-600">{t('teacherDashboardPage.approved')}</span>
                                <span className="font-bold text-green-600">{projects.approved || 0}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-gray-600">{t('teacherDashboardPage.pendingReview')}</span>
                                <span className="font-bold text-yellow-600">{projects.pending || 0}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-gray-600">{t('teacherDashboardPage.rejected')}</span>
                                <span className="font-bold text-red-600">{projects.rejected || 0}</span>
                            </div>
                            <div className="flex items-center justify-between pt-2 border-t">
                                <span className="text-gray-600">{t('teacherDashboardPage.totalViews')}</span>
                                <span className="font-bold text-gray-900">{projects.totalViews || 0}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-gray-600">{t('teacherDashboardPage.totalLikes')}</span>
                                <span className="font-bold text-gray-900">{projects.totalLikes || 0}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-gray-600">{t('teacherDashboardPage.pointsEarned')}</span>
                                <span className="font-bold text-purple-600">{projects.totalPoints || 0}</span>
                            </div>
                        </div>
                        <Link
                            href="/teacher/projects"
                            className="block mt-4 text-center text-blue-600 hover:text-blue-700 font-medium"
                        >
                            {t('teacherDashboardPage.viewAllProjects')}
                        </Link>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="bg-green-50 p-3 rounded-xl border border-green-100">
                                <FaBook className="text-green-600 text-2xl" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">{t('teacherDashboardPage.publicationsStatsTitle')}</h3>
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-gray-600">{t('teacherDashboardPage.published')}</span>
                                <span className="font-bold text-green-600">{publications.approved || 0}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-gray-600">{t('teacherDashboardPage.pendingReview')}</span>
                                <span className="font-bold text-yellow-600">{publications.pending || 0}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-gray-600">{t('teacherDashboardPage.rejected')}</span>
                                <span className="font-bold text-red-600">{publications.rejected || 0}</span>
                            </div>
                            <div className="flex items-center justify-between pt-2 border-t">
                                <span className="text-gray-600">{t('teacherDashboardPage.totalViews')}</span>
                                <span className="font-bold text-gray-900">{publications.totalViews || 0}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-gray-600">{t('teacherDashboardPage.totalLikes')}</span>
                                <span className="font-bold text-gray-900">{publications.totalLikes || 0}</span>
                            </div>
                        </div>
                        <Link
                            href="/teacher/publications"
                            className="block mt-4 text-center text-green-600 hover:text-green-700 font-medium"
                        >
                            {t('teacherDashboardPage.viewAllPublications')}
                        </Link>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="bg-orange-50 p-3 rounded-xl border border-orange-100">
                                <FaTrophy className="text-orange-600 text-2xl" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">{t('teacherDashboardPage.challengesStatsTitle')}</h3>
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-gray-600">{t('teacherDashboardPage.created')}</span>
                                <span className="font-bold text-gray-900">{challenges.created || 0}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-gray-600">{t('teacherDashboardPage.active')}</span>
                                <span className="font-bold text-green-600">{challenges.active || 0}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-gray-600">{t('teacherDashboardPage.completed')}</span>
                                <span className="font-bold text-blue-600">{challenges.completed || 0}</span>
                            </div>
                        </div>
                        <Link
                            href="/teacher/challenges"
                            className="block mt-4 text-center text-orange-600 hover:text-orange-700 font-medium"
                        >
                            {t('teacherDashboardPage.viewAllChallenges')}
                        </Link>
                    </div>

                    {stats.submissions && (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="bg-indigo-50 p-3 rounded-xl border border-indigo-100">
                                    <FaProjectDiagram className="text-indigo-600 text-2xl" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900">{t('teacherDashboardPage.submissionsTitle')}</h3>
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600">{t('teacherDashboardPage.totalSubmissions')}</span>
                                    <span className="font-bold text-gray-900">{stats.submissions.total || 0}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600">{t('teacherDashboardPage.submitted')}</span>
                                    <span className="font-bold text-yellow-600">{stats.submissions.submitted || 0}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600">{t('teacherDashboardPage.accepted')}</span>
                                    <span className="font-bold text-green-600">{stats.submissions.approved || 0}</span>
                                </div>
                            </div>
                            <Link
                                href="/teacher/submissions"
                                className="block mt-4 text-center text-indigo-600 hover:text-indigo-700 font-medium"
                            >
                                {t('teacherDashboardPage.viewAllSubmissions')}
                            </Link>
                        </div>
                    )}
                </div>

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
                                <h3 className="font-bold text-gray-900">{t('teacherDashboardPage.createProjectTitle')}</h3>
                                <p className="text-sm text-gray-600 mt-1">{t('teacherDashboardPage.createProjectSubtitle')}</p>
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
                                <h3 className="font-bold text-gray-900">{t('teacherDashboardPage.publishArticleTitle')}</h3>
                                <p className="text-sm text-gray-600 mt-1">{t('teacherDashboardPage.publishArticleSubtitle')}</p>
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
                                <h3 className="font-bold text-gray-900">{t('teacherDashboardPage.createChallengeTitle')}</h3>
                                <p className="text-sm text-gray-600 mt-1">{t('teacherDashboardPage.createChallengeSubtitle')}</p>
                            </div>
                        </div>
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                            <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                <FaProjectDiagram className="text-blue-600" />
                                {t('teacherDashboardPage.recentProjectsTitle')}
                            </h3>
                        </div>
                        <div className="p-6">
                            {recentProjects.length === 0 ? (
                                <div className="text-center py-8">
                                    <FaProjectDiagram className="mx-auto text-4xl text-gray-300 mb-4" />
                                <p className="text-gray-500 mb-4">{t('teacherDashboardPage.noRecentProjects')}</p>
                                <Link
                                    href="/teacher/projects/create"
                                    className="inline-block text-blue-600 hover:text-blue-700 font-medium"
                                >
                                    {t('teacherDashboardPage.createProjectAction')}
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
                                            {renderStatusBadge(project.status)}
                                        </div>
                                    ))}
                                </div>
                            )}
                            <Link
                                href="/teacher/projects"
                                className="block mt-4 text-center text-blue-600 hover:text-blue-700 font-medium"
                            >
                                {t('teacherDashboardPage.viewAllProjects')}
                            </Link>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                            <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                <FaBook className="text-green-600" />
                                {t('teacherDashboardPage.recentPublicationsTitle')}
                            </h3>
                        </div>
                        <div className="p-6">
                            {recentPublications.length === 0 ? (
                                <div className="text-center py-8">
                                    <FaBook className="mx-auto text-4xl text-gray-300 mb-4" />
                                    <p className="text-gray-500 mb-4">{t('teacherDashboardPage.noRecentPublications')}</p>
                                    <Link
                                        href="/teacher/publications/create"
                                        className="inline-block text-green-600 hover:text-green-700 font-medium"
                                    >
                                        {t('teacherDashboardPage.publishArticleAction')}
                                    </Link>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {recentPublications.map((publication) => (
                                        <div key={publication.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                                            <div className="flex-1">
                                                <p className="font-medium text-gray-900">{publication.title}</p>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    {publicationTypeLabels[publication.type] || publicationTypeLabels.other}
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
                                            {renderStatusBadge(publication.status, 'publication')}
                                        </div>
                                    ))}
                                </div>
                            )}
                            <Link
                                href="/teacher/publications"
                                className="block mt-4 text-center text-green-600 hover:text-green-700 font-medium"
                            >
                                {t('teacherDashboardPage.viewAllPublications')}
                            </Link>
                        </div>
                    </div>
                </div>

                {badges.recent && badges.recent.length > 0 && (
                    <div className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                            <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                <FaAward className="text-orange-600" />
                                {t('teacherDashboardPage.badgesTitle')}
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
