import { Head, Link } from '@inertiajs/react';
import DashboardLayout from '../../../Layouts/DashboardLayout';
import { FaFile, FaUser, FaCalendar, FaEye, FaStar } from 'react-icons/fa';

export default function AdminSubmissionsIndex({ auth, submissions }) {
    const getStatusBadge = (status) => {
        const badges = {
            submitted: { color: 'bg-yellow-100 text-yellow-800', label: 'مُسلم' },
            reviewed: { color: 'bg-blue-100 text-blue-800', label: 'تم المراجعة' },
            approved: { color: 'bg-green-100 text-green-800', label: 'مقبول' },
            rejected: { color: 'bg-red-100 text-red-800', label: 'مرفوض' },
        };
        return badges[status] || badges.submitted;
    };

    return (
        <DashboardLayout auth={auth}>
            <Head title="تسليمات المشاريع - الإدارة" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">تسليمات المشاريع</h1>
                    <p className="text-gray-600 mt-2">عرض وإدارة جميع تسليمات المشاريع</p>
                </div>

                {submissions && submissions.data && submissions.data.length > 0 ? (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            المشروع
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            الطالب
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            التقييم
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            الحالة
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            تاريخ التسليم
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            الإجراءات
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {submissions.data.map((submission) => {
                                        const statusBadge = getStatusBadge(submission.status);
                                        return (
                                            <tr key={submission.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {submission.project?.title || 'غير محدد'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">
                                                        {submission.student?.name || 'غير محدد'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {submission.rating ? (
                                                        <div className="flex items-center gap-1" dir="ltr">
                                                            <FaStar className="text-yellow-400" />
                                                            <span className="text-sm font-medium">{submission.rating}/5</span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-sm text-gray-500">لم يتم التقييم</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusBadge.color}`}>
                                                        {statusBadge.label}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {submission.submitted_at
                                                        ? new Date(submission.submitted_at).toLocaleDateString('ar-SA')
                                                        : '-'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <Link
                                                        href={`/admin/submissions/${submission.id}`}
                                                        className="text-blue-600 hover:text-blue-900"
                                                    >
                                                        <FaEye />
                                                    </Link>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {submissions.links && (
                            <div className="px-6 py-4 border-t border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div className="text-sm text-gray-700">
                                        عرض {submissions.from} إلى {submissions.to} من {submissions.total} نتيجة
                                    </div>
                                    <div className="flex gap-2">
                                        {submissions.links.map((link, index) => (
                                            <Link
                                                key={index}
                                                href={link.url || '#'}
                                                className={`px-3 py-2 rounded-md text-sm ${
                                                    link.active
                                                        ? 'bg-blue-600 text-white'
                                                        : 'bg-white text-gray-700 hover:bg-gray-50'
                                                } ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                        <FaFile className="mx-auto text-4xl text-gray-300 mb-4" />
                        <p className="text-gray-500">لا توجد تسليمات حالياً</p>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}

