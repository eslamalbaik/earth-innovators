import DashboardLayout from '@/Layouts/DashboardLayout';
import { useTranslation } from '@/i18n';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { FaFileAlt, FaProjectDiagram, FaTrophy, FaGraduationCap, FaFilter } from 'react-icons/fa';

export default function SchoolReportsIndex({ auth, stats, filters, availableYears }) {
    const { t } = useTranslation();
    const [selectedYear, setSelectedYear] = useState(filters?.year || new Date().getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(filters?.month || '');

    const months = [
        { value: '', label: t('schoolReportsPage.filters.allMonths') },
        { value: '1', label: t('common.months.january') },
        { value: '2', label: t('common.months.february') },
        { value: '3', label: t('common.months.march') },
        { value: '4', label: t('common.months.april') },
        { value: '5', label: t('common.months.may') },
        { value: '6', label: t('common.months.june') },
        { value: '7', label: t('common.months.july') },
        { value: '8', label: t('common.months.august') },
        { value: '9', label: t('common.months.september') },
        { value: '10', label: t('common.months.october') },
        { value: '11', label: t('common.months.november') },
        { value: '12', label: t('common.months.december') },
    ];

    const handleFilterChange = (year, month) => {
        router.get('/school/reports', {
            year,
            month,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const reportTypes = [
        {
            id: 'projects',
            title: t('schoolReportsPage.reportTypes.projects.title'),
            description: t('schoolReportsPage.reportTypes.projects.description'),
            icon: FaProjectDiagram,
            color: 'from-blue-500 to-blue-700',
            stats: [
                {
                    label: t('schoolReportsPage.reportTypes.projects.stats.total'),
                    value: stats?.projects || 0,
                    color: 'text-blue-600',
                },
                {
                    label: t('schoolReportsPage.reportTypes.projects.stats.approved'),
                    value: stats?.approvedProjects || 0,
                    color: 'text-green-600',
                },
                {
                    label: t('schoolReportsPage.reportTypes.projects.stats.pending'),
                    value: stats?.pendingProjects || 0,
                    color: 'text-yellow-600',
                },
            ],
            href: '/school/projects',
        },
        {
            id: 'challenges',
            title: t('schoolReportsPage.reportTypes.challenges.title'),
            description: t('schoolReportsPage.reportTypes.challenges.description'),
            icon: FaTrophy,
            color: 'from-purple-500 to-purple-700',
            stats: [
                {
                    label: t('schoolReportsPage.reportTypes.challenges.stats.total'),
                    value: stats?.challenges || 0,
                    color: 'text-purple-600',
                },
                {
                    label: t('schoolReportsPage.reportTypes.challenges.stats.active'),
                    value: stats?.activeChallenges || 0,
                    color: 'text-green-600',
                },
            ],
            href: '/school/challenges',
        },
        {
            id: 'students',
            title: t('schoolReportsPage.reportTypes.students.title'),
            description: t('schoolReportsPage.reportTypes.students.description'),
            icon: FaGraduationCap,
            color: 'from-green-500 to-green-700',
            stats: [
                {
                    label: t('schoolReportsPage.reportTypes.students.stats.total'),
                    value: stats?.totalStudents || 0,
                    color: 'text-green-600',
                },
                {
                    label: t('schoolReportsPage.reportTypes.students.stats.new'),
                    value: stats?.newStudents || 0,
                    color: 'text-blue-600',
                },
            ],
            href: '/school/students',
        },
        {
            id: 'certificates',
            title: t('schoolReportsPage.reportTypes.certificates.title'),
            description: t('schoolReportsPage.reportTypes.certificates.description'),
            icon: FaFileAlt,
            color: 'from-yellow-500 to-yellow-700',
            stats: [
                {
                    label: t('schoolReportsPage.reportTypes.certificates.stats.total'),
                    value: stats?.certificates || 0,
                    color: 'text-yellow-600',
                },
            ],
            href: '/school/certificates',
        },
    ];

    const pageTitle = t('schoolReportsPage.pageTitle', {
        appName: t('common.appName'),
    });

    return (
        <DashboardLayout auth={auth} header={t('schoolReportsPage.title')}>
            <Head title={pageTitle} />

            <div className="py-6">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                        <div className="flex items-center gap-2 mb-4">
                            <FaFilter className="text-gray-600" />
                            <h3 className="text-lg font-bold text-gray-900">{t('schoolReportsPage.filters.title')}</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {t('schoolReportsPage.filters.year')}
                                </label>
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
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {t('schoolReportsPage.filters.month')}
                                </label>
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
                                    {t('schoolReportsPage.filters.apply')}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                    <FaProjectDiagram className="text-blue-600 text-xl" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-gray-900">{stats?.projects || 0}</div>
                                    <div className="text-sm text-gray-600">{t('schoolReportsPage.summary.projects')}</div>
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
                                    <div className="text-sm text-gray-600">{t('schoolReportsPage.summary.challenges')}</div>
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
                                    <div className="text-sm text-gray-600">{t('schoolReportsPage.summary.students')}</div>
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
                                    <div className="text-sm text-gray-600">{t('schoolReportsPage.summary.certificates')}</div>
                                </div>
                            </div>
                        </div>
                    </div>

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
                                            {t('schoolReportsPage.actions.viewDetails')}
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

                    <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                                <FaFileAlt className="text-indigo-600 text-xl" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">{t('schoolReportsPage.publications.title')}</h3>
                                <p className="text-gray-600 text-sm">{t('schoolReportsPage.publications.subtitle')}</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-indigo-50 rounded-lg p-4">
                                <div className="text-2xl font-bold text-indigo-600">{stats?.publications || 0}</div>
                                <div className="text-sm text-gray-600">{t('schoolReportsPage.publications.total')}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
