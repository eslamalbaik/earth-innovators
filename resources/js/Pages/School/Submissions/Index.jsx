import { Head, Link, router } from '@inertiajs/react';
import DashboardLayout from '../../../Layouts/DashboardLayout';
import { useState } from 'react';
import { FaSearch, FaFile, FaUser, FaCalendar, FaStar, FaCheckCircle, FaClock, FaTimesCircle } from 'react-icons/fa';
import { toHijriDate } from '@/utils/dateUtils';

export default function SchoolSubmissionsIndex({ auth, submissions, students = [] }) {
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('');
    const [studentId, setStudentId] = useState('');

    const handleSearch = (e) => {
        e.preventDefault();
        router.get('/school/submissions', { search, status, student_id: studentId }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const getStatusBadge = (status) => {
        const badges = {
            submitted: { color: 'bg-yellow-100 text-yellow-800', label: 'مُسلم', icon: FaClock },
            reviewed: { color: 'bg-blue-100 text-blue-800', label: 'تم المراجعة', icon: FaCheckCircle },
            approved: { color: 'bg-green-100 text-green-800', label: 'مقبول', icon: FaCheckCircle },
            rejected: { color: 'bg-red-100 text-red-800', label: 'مرفوض', icon: FaTimesCircle },
        };
        return badges[status] || badges.submitted;
    };

    return (
        <DashboardLayout auth={auth}>
            <Head title="تسليمات المشاريع" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">تسليمات المشاريع</h1>
                    <p className="text-gray-600">عرض وتقييم تسليمات الطلاب للمشاريع المعتمدة</p>
                </div>

                {/* البحث والفلترة */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                    <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="ابحث عن طالب أو مشروع..."
                                    className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </div>
                        <div className="md:w-48">
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="">جميع الحالات</option>
                                <option value="submitted">مُسلم</option>
                                <option value="reviewed">تم المراجعة</option>
                                <option value="approved">مقبول</option>
                                <option value="rejected">مرفوض</option>
                            </select>
                        </div>
                        {students && students.length > 0 && (
                            <div className="md:w-48">
                                <select
                                    value={studentId}
                                    onChange={(e) => setStudentId(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="">جميع الطلاب</option>
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
                            بحث
                        </button>
                    </form>
                </div>

                {/* قائمة التسليمات */}
                {submissions.data && submissions.data.length > 0 ? (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3  text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            الطالب
                                        </th>
                                        <th className="px-6 py-3  text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            المشروع
                                        </th>
                                        <th className="px-6 py-3  text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            التاريخ
                                        </th>
                                        <th className="px-6 py-3  text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            التقييم
                                        </th>
                                        <th className="px-6 py-3  text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            الحالة
                                        </th>
                                        <th className="px-6 py-3  text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            الإجراءات
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
                                                    <div className="flex items-center">
                                                        <span className="text-sm font-medium text-gray-900">
                                                            {submission.student?.name || 'غير محدد'}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm text-gray-900">
                                                        {submission.project?.title || 'غير محدد'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center text-sm text-gray-500">
                                                        {submission.submitted_at
                                                            ? toHijriDate(submission.submitted_at)
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
                                                        عرض التفاصيل
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
                        <p className="text-gray-500 text-lg">لا توجد تسليمات حالياً</p>
                    </div>
                )}

                {/* Pagination */}
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

