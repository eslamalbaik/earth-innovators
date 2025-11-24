import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link } from '@inertiajs/react';
import { FaUsers, FaSearch, FaEye } from 'react-icons/fa';

export default function Students({ auth, students, bookings }) {
    return (
        <DashboardLayout header="إدارة الطلاب">
            <Head title="إدارة الطلاب" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">إدارة الطلاب</h1>
                        <p className="text-gray-600 mt-1">عرض وإدارة جميع الطلاب المسجلين</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center gap-4">
                            <div className="bg-blue-100 p-3 rounded-full">
                                <FaUsers className="text-blue-600 text-2xl" />
                            </div>
                            <div>
                                <p className="text-gray-600 text-sm">إجمالي الطلاب</p>
                                <p className="text-2xl font-bold text-gray-900">{students?.total || 0}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center gap-4">
                            <div className="bg-green-100 p-3 rounded-full">
                                <FaUsers className="text-green-600 text-2xl" />
                            </div>
                            <div>
                                <p className="text-gray-600 text-sm">طلبات نشطة</p>
                                <p className="text-2xl font-bold text-gray-900">{bookings?.active || 0}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center gap-4">
                            <div className="bg-yellow-100 p-3 rounded-full">
                                <FaUsers className="text-yellow-600 text-2xl" />
                            </div>
                            <div>
                                <p className="text-gray-600 text-sm">طلبات مكتملة</p>
                                <p className="text-2xl font-bold text-gray-900">{bookings?.completed || 0}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <FaSearch className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="البحث عن طالب..."
                                className="w-full pr-12 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                            />
                        </div>
                        <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400">
                            <option>جميع الطلاب</option>
                            <option>فقط من لديهم طلبات</option>
                        </select>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gradient-to-r from-yellow-50 to-yellow-100">
                                <tr>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase">
                                        الطالب
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase">
                                        البريد الإلكتروني
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase">
                                        الهاتف
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase">
                                        عدد الطلبات
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase">
                                        آخر طلب
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase">
                                        الإجراءات
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {!students?.data || students.data.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                                            <FaUsers className="mx-auto text-4xl mb-4 text-gray-300" />
                                            <p>لا يوجد طلاب مسجلين حالياً</p>
                                        </td>
                                    </tr>
                                ) : (
                                    students.data.map((student) => (
                                        <tr key={student.id} className="hover:bg-gray-50 transition">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                                                        {student.name?.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="text-sm font-medium text-gray-900">{student.name}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{student.email}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{student.phone || 'غير متوفر'}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">{student.bookings_count || 0}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-500">
                                                    {student.last_booking_date ? new Date(student.last_booking_date).toLocaleDateString('en-US') : 'لا يوجد'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-left text-sm font-medium">
                                                <Link
                                                    href={`/admin/students/${student.id}`}
                                                    className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded transition"
                                                    title="عرض التفاصيل"
                                                >
                                                    <FaEye />
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {students?.links && students.links.length > 3 && (
                        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                            <div className="text-sm text-gray-700">
                                عرض {students.from} إلى {students.to} من {students.total} طالب
                            </div>
                            <div className="flex gap-2">
                                {students.links.map((link, index) => (
                                    <Link
                                        key={index}
                                        href={link.url || '#'}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition ${link.active
                                            ? 'bg-yellow-400 text-black'
                                            : 'bg-white text-gray-700 hover:bg-gray-100'
                                            }`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
