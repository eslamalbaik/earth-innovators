import { Head, Link, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { useTranslation } from '@/i18n';
import { useState } from 'react';
import { FaSearch, FaFile, FaStar, FaCheckCircle, FaClock, FaTimesCircle } from 'react-icons/fa';
import { toHijriDate } from '@/utils/dateUtils';

const getInitialQueryValue = (key) => {
    if (typeof window === 'undefined') {
        return '';
    }

    return new URLSearchParams(window.location.search).get(key) || '';
};

export default function SchoolSubmissionsIndex({ auth, submissions, students = [] }) {
    const { t, language } = useTranslation();
    const [search, setSearch] = useState(getInitialQueryValue('search'));
    const [status, setStatus] = useState(getInitialQueryValue('status'));
    const [studentId, setStudentId] = useState(getInitialQueryValue('student_id'));

    const handleSearch = (e) => {
        e.preventDefault();
        router.get('/school/submissions', {
            search: search || undefined,
            status: status || undefined,
            student_id: studentId || undefined,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const getStatusBadge = (submissionStatus) => {
        const badges = {
            submitted: {
                color: 'bg-yellow-100 text-yellow-800',
                label: t('schoolSubmissionsPage.statuses.submitted'),
                icon: FaClock,
            },
            reviewed: {
                color: 'bg-blue-100 text-blue-800',
                label: t('schoolSubmissionsPage.statuses.reviewed'),
                icon: FaCheckCircle,
            },
            approved: {
                color: 'bg-green-100 text-green-800',
                label: t('schoolSubmissionsPage.statuses.approved'),
                icon: FaCheckCircle,
            },
            rejected: {
                color: 'bg-red-100 text-red-800',
                label: t('schoolSubmissionsPage.statuses.rejected'),
                icon: FaTimesCircle,
            },
        };

        return badges[submissionStatus] || badges.submitted;
    };

    const pageTitle = t('schoolSubmissionsPage.pageTitle', {
        appName: t('common.appName'),
    });

    return (
        <DashboardLayout auth={auth} header={t('schoolSubmissionsPage.title')}>
            <Head title={pageTitle} />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('schoolSubmissionsPage.title')}</h1>
                    <p className="text-gray-600">{t('schoolSubmissionsPage.subtitle')}</p>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                    <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder={t('schoolSubmissionsPage.filters.searchPlaceholder')}
                                    className="w-full ps-10 pe-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </div>
                        <div className="md:w-48">
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="">{t('schoolSubmissionsPage.filters.allStatuses')}</option>
                                <option value="submitted">{t('schoolSubmissionsPage.statuses.submitted')}</option>
                                <option value="reviewed">{t('schoolSubmissionsPage.statuses.reviewed')}</option>
                                <option value="approved">{t('schoolSubmissionsPage.statuses.approved')}</option>
                                <option value="rejected">{t('schoolSubmissionsPage.statuses.rejected')}</option>
                            </select>
                        </div>
                        {students.length > 0 && (
                            <div className="md:w-48">
                                <select
                                    value={studentId}
                                    onChange={(e) => setStudentId(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="">{t('schoolSubmissionsPage.filters.allStudents')}</option>
                                    {students.map((student) => (
                                        <option key={student.id} value={student.id}>
                                            {student.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                        <button
                            type="submit"
                            className="px-6 py-2 bg-[#A3C042] text-white rounded-lg hover:bg-blue-700 transition"
                        >
                            {t('schoolSubmissionsPage.filters.search')}
                        </button>
                    </form>
                </div>

                {submissions.data && submissions.data.length > 0 ? (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            {t('schoolSubmissionsPage.table.student')}
                                        </th>
                                        <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            {t('schoolSubmissionsPage.table.project')}
                                        </th>
                                        <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            {t('schoolSubmissionsPage.table.date')}
                                        </th>
                                        <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            {t('schoolSubmissionsPage.table.rating')}
                                        </th>
                                        <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            {t('schoolSubmissionsPage.table.status')}
                                        </th>
                                        <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            {t('schoolSubmissionsPage.table.actions')}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {submissions.data.map((submission) => {
                                        const statusBadge = getStatusBadge(submission.status);
                                        const StatusIcon = statusBadge.icon;

                                        return (
                                            <tr key={submission.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="text-sm font-medium text-gray-900">
                                                        {submission.student?.name || t('schoolSubmissionsPage.table.unknownStudent')}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm text-gray-900">
                                                        {submission.project?.title || t('schoolSubmissionsPage.table.unknownProject')}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center text-sm text-gray-500">
                                                        {submission.submitted_at
                                                            ? toHijriDate(submission.submitted_at, false, language)
                                                            : '-'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {submission.rating ? (
                                                        <div className="flex items-center">
                                                            <FaStar className="text-yellow-400 me-1" />
                                                            <span className="text-sm font-medium text-gray-900">
                                                                {submission.rating}/5
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-sm text-gray-400">-</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 py-1 inline-flex items-center gap-1 text-xs font-medium rounded-full ${statusBadge.color}`}>
                                                        <StatusIcon />
                                                        {statusBadge.label}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <Link
                                                        href={`/school/submissions/${submission.id}`}
                                                        className="text-blue-600 hover:text-blue-900"
                                                    >
                                                        {t('schoolSubmissionsPage.table.details')}
                                                    </Link>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                        <FaFile className="mx-auto text-6xl text-gray-300 mb-4" />
                        <p className="text-gray-500 text-lg">{t('schoolSubmissionsPage.empty')}</p>
                    </div>
                )}

                {submissions.links && submissions.links.length > 3 && (
                    <div className="mt-6 flex justify-center">
                        <div className="flex gap-2">
                            {submissions.links.map((link, index) => (
                                <button
                                    key={index}
                                    onClick={() => link.url && router.get(link.url)}
                                    disabled={!link.url}
                                    className={`px-4 py-2 rounded-lg ${link.active
                                        ? 'bg-[#A3C042] text-white'
                                        : link.url
                                            ? 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        }`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
