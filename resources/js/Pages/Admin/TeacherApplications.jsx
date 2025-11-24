import { Head } from '@inertiajs/react';
import { FaEye, FaCheck, FaTimes, FaClock, FaSearch, FaFilter, FaDownload } from 'react-icons/fa';
import AdminLayout from '../../Layouts/AdminLayout';

export default function TeacherApplications({ applications, stats, filters }) {
    const getStatusBadge = (status) => {
        const statusConfig = {
            pending: { color: 'bg-yellow-100 text-yellow-800', icon: FaClock, text: 'في الانتظار' },
            under_review: { color: 'bg-blue-100 text-blue-800', icon: FaEye, text: 'قيد المراجعة' },
            approved: { color: 'bg-green-100 text-green-800', icon: FaCheck, text: 'موافق عليه' },
            rejected: { color: 'bg-red-100 text-red-800', icon: FaTimes, text: 'مرفوض' }
        };

        const config = statusConfig[status] || statusConfig.pending;
        const Icon = config.icon;

        return (
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
                <Icon className="w-3 h-3" />
                {config.text}
            </span>
        );
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <AdminLayout>
            <Head title="إدارة طلبات الانضمام - لوحة الإدارة" />

            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">إدارة طلبات الانضمام</h1>
                        <p className="text-gray-600">مراجعة وإدارة طلبات المعلمين الجدد</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <div className="flex items-center">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <FaClock className="w-6 h-6 text-blue-600" />
                            </div>
                            <div className="mr-4">
                                <p className="text-sm font-medium text-gray-600">إجمالي الطلبات</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <div className="flex items-center">
                            <div className="p-2 bg-yellow-100 rounded-lg">
                                <FaClock className="w-6 h-6 text-yellow-600" />
                            </div>
                            <div className="mr-4">
                                <p className="text-sm font-medium text-gray-600">في الانتظار</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <div className="flex items-center">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <FaEye className="w-6 h-6 text-blue-600" />
                            </div>
                            <div className="mr-4">
                                <p className="text-sm font-medium text-gray-600">قيد المراجعة</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.under_review}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <div className="flex items-center">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <FaCheck className="w-6 h-6 text-green-600" />
                            </div>
                            <div className="mr-4">
                                <p className="text-sm font-medium text-gray-600">موافق عليه</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <div className="flex items-center">
                            <div className="p-2 bg-red-100 rounded-lg">
                                <FaTimes className="w-6 h-6 text-red-600" />
                            </div>
                            <div className="mr-4">
                                <p className="text-sm font-medium text-gray-600">مرفوض</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.rejected}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-2">البحث</label>
                            <div className="relative">
                                <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="ابحث بالاسم أو البريد الإلكتروني..."
                                    className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                        <div className="md:w-48">
                            <label className="block text-sm font-medium text-gray-700 mb-2">الحالة</label>
                            <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                                <option value="">جميع الحالات</option>
                                <option value="pending">في الانتظار</option>
                                <option value="under_review">قيد المراجعة</option>
                                <option value="approved">موافق عليه</option>
                                <option value="rejected">مرفوض</option>
                            </select>
                        </div>
                        <div className="flex items-end">
                            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 flex items-center gap-2">
                                <FaFilter />
                                تطبيق الفلاتر
                            </button>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        المعلم
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        البريد الإلكتروني
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        المدينة
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        المواد
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        الحالة
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        تاريخ التقديم
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        الإجراءات
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {applications.data.map((application) => (
                                    <tr key={application.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10">
                                                    {application.teacher?.image ? (
                                                        <img
                                                            className="h-10 w-10 rounded-full object-cover"
                                                            src={application.teacher.image}
                                                            alt={application.teacher.name}
                                                        />
                                                    ) : (
                                                        <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                                            <span className="text-sm font-medium text-gray-700">
                                                                {application.teacher?.name?.charAt(0)}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="mr-4">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {application.teacher?.name}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {application.teacher?.phone}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {application.teacher?.email}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {application.teacher?.city}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            <div className="flex flex-wrap gap-1">
                                                {application.teacher?.subjects?.slice(0, 2).map((subject, index) => (
                                                    <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                        {subject.name_ar}
                                                    </span>
                                                ))}
                                                {application.teacher?.subjects?.length > 2 && (
                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                        +{application.teacher.subjects.length - 2}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getStatusBadge(application.status)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {formatDate(application.submitted_at)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex items-center gap-2">
                                                <a
                                                    href={`/admin/teacher-applications/${application.id}`}
                                                    className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                                                >
                                                    <FaEye />
                                                    عرض
                                                </a>
                                                {application.status === 'pending' && (
                                                    <>
                                                        <button className="text-green-600 hover:text-green-900 flex items-center gap-1">
                                                            <FaCheck />
                                                            موافقة
                                                        </button>
                                                        <button className="text-red-600 hover:text-red-900 flex items-center gap-1">
                                                            <FaTimes />
                                                            رفض
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {applications.links && (
                        <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
                            <div className="flex items-center justify-between">
                                <div className="flex-1 flex justify-between sm:hidden">
                                    <a
                                        href={applications.prev_page_url}
                                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                    >
                                        السابق
                                    </a>
                                    <a
                                        href={applications.next_page_url}
                                        className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                    >
                                        التالي
                                    </a>
                                </div>
                                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                    <div>
                                        <p className="text-sm text-gray-700">
                                            عرض{' '}
                                            <span className="font-medium">{applications.from}</span>
                                            {' '}إلى{' '}
                                            <span className="font-medium">{applications.to}</span>
                                            {' '}من{' '}
                                            <span className="font-medium">{applications.total}</span>
                                            {' '}نتيجة
                                        </p>
                                    </div>
                                    <div>
                                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                                            {applications.links.map((link, index) => (
                                                <a
                                                    key={index}
                                                    href={link.url}
                                                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${link.active
                                                        ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                                        }`}
                                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                                />
                                            ))}
                                        </nav>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
