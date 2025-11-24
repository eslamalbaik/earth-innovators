import { Head, Link } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { useState } from 'react';
import {
    FaUsers, FaSearch, FaProjectDiagram, FaStar, FaMedal
} from 'react-icons/fa';

export default function Index({ auth, students }) {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredStudents = students.data.filter(student => {
        if (!searchTerm) return true;
        const search = searchTerm.toLowerCase();
        return (
            student.name.toLowerCase().includes(search) ||
            student.email.toLowerCase().includes(search) ||
            (student.phone && student.phone.includes(search))
        );
    });

    return (
        <DashboardLayout header="الطلاب المتابعون">
            <Head title="الطلاب المتابعون - إرث المبتكرين" />

            <div className="space-y-6">
                {/* رأس الصفحة */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                                <FaUsers className="text-legacy-green" />
                                الطلاب المتابعون
                            </h2>
                            <p className="text-gray-600 mt-1">إجمالي الطلاب: {students.total}</p>
                        </div>
                    </div>

                    {/* البحث */}
                    <div className="relative">
                        <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="ابحث عن طالب..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-legacy-green focus:border-transparent"
                        />
                    </div>
                </div>

                {/* جدول الطلاب */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gradient-to-r from-legacy-green/10 to-legacy-blue/10">
                                <tr>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                                        الاسم
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                                        البريد الإلكتروني
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                                        الهاتف
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                                        النقاط
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                                        المشاريع
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                                        مشاريعك معه
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                                        الشارات
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredStudents.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                                            {searchTerm ? 'لا توجد نتائج للبحث' : 'لا يوجد طلاب متابعين'}
                                        </td>
                                    </tr>
                                ) : (
                                    filteredStudents.map((student) => (
                                        <tr key={student.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">{student.name}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-600">{student.email}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-600">{student.phone || '-'}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-1 text-sm font-semibold text-purple-600">
                                                    <FaStar />
                                                    {student.points}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-1 text-sm text-gray-600">
                                                    <FaProjectDiagram />
                                                    {student.projects_count} ({student.approved_projects} معتمد)
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-semibold text-legacy-green">
                                                    {student.teacher_projects_count}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <FaMedal className="text-orange-500" />
                                                    <span className="text-sm text-gray-600">{student.badges_count}</span>
                                                    {student.badges && student.badges.length > 0 && (
                                                        <div className="flex -space-x-2">
                                                            {student.badges.slice(0, 3).map((badge) => (
                                                                <div
                                                                    key={badge.id}
                                                                    className="w-6 h-6 rounded-full bg-orange-100 border-2 border-white flex items-center justify-center text-xs"
                                                                    title={badge.name_ar || badge.name}
                                                                >
                                                                    {badge.icon || '🏅'}
                                                                </div>
                                                            ))}
                                                            {student.badges.length > 3 && (
                                                                <div className="w-6 h-6 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs text-gray-600">
                                                                    +{student.badges.length - 3}
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {students.links && students.links.length > 3 && (
                        <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
                            <div className="flex items-center justify-between">
                                <div className="flex-1 flex justify-between sm:hidden">
                                    {students.links[0].url && (
                                        <Link
                                            href={students.links[0].url}
                                            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                        >
                                            السابق
                                        </Link>
                                    )}
                                    {students.links[students.links.length - 1].url && (
                                        <Link
                                            href={students.links[students.links.length - 1].url}
                                            className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                        >
                                            التالي
                                        </Link>
                                    )}
                                </div>
                                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                    <div>
                                        <p className="text-sm text-gray-700">
                                            عرض <span className="font-medium">{students.from}</span> إلى{' '}
                                            <span className="font-medium">{students.to}</span> من{' '}
                                            <span className="font-medium">{students.total}</span> نتيجة
                                        </p>
                                    </div>
                                    <div>
                                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                            {students.links.map((link, index) => (
                                                <Link
                                                    key={index}
                                                    href={link.url || '#'}
                                                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                                        link.active
                                                            ? 'z-10 bg-legacy-green border-legacy-green text-white'
                                                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                                    } ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
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
        </DashboardLayout>
    );
}

