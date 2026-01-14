import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { FaSearch, FaFilter, FaEye, FaEdit, FaTrash, FaDownload, FaUser, FaEnvelope, FaPhone, FaCalendar, FaSpinner, FaPlus } from 'react-icons/fa';
import { useState } from 'react';

export default function StudentsIndex({ students, filters, auth }) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');
    const [dateFrom, setDateFrom] = useState(filters.date_from || '');
    const [dateTo, setDateTo] = useState(filters.date_to || '');
    const [showFilters, setShowFilters] = useState(false);
    const [selectedStudents, setSelectedStudents] = useState([]);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [studentToDelete, setStudentToDelete] = useState(null);

    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        phone: '',
        password: '',
        password_confirmation: '',
    });

    // البيانات مفلترة بالفعل من الـ server
    const filteredStudents = students.data || [];

    const handleSearch = () => {
        const params = {};
        if (searchTerm) params.search = searchTerm;
        if (statusFilter && statusFilter !== 'all') params.status = statusFilter;
        if (dateFrom) params.date_from = dateFrom;
        if (dateTo) params.date_to = dateTo;

        router.get('/admin/students', params, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleDelete = (student) => {
        setStudentToDelete(student);
        setShowDeleteModal(true);
    };

    const confirmDelete = () => {
        if (studentToDelete) {
            router.delete(`/admin/students/${studentToDelete.id}`, {
                onSuccess: () => {
                    setShowDeleteModal(false);
                    setStudentToDelete(null);
                }
            });
        }
    };

    const handleBulkAction = (action) => {
        if (selectedStudents.length === 0) return;
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'active':
                return 'bg-green-100 text-green-800';
            case 'inactive':
                return 'bg-red-100 text-red-800';
            case 'suspended':
                return 'bg-yellow-100 text-yellow-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'active':
                return 'نشط';
            case 'inactive':
                return 'غير نشط';
            case 'suspended':
                return 'معلق';
            default:
                return 'غير معروف';
        }
    };

    return (
        <DashboardLayout auth={auth}>
            <Head title="إدارة الطلاب" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">إدارة الطلاب</h1>
                                <p className="text-gray-600">عرض وإدارة جميع الطلاب المسجلين</p>
                            </div>
                            <div className="flex items-center space-x-4 space-x-reverse">
                                <button
                                    onClick={() => setShowFilters(!showFilters)}
                                    className="flex items-center px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition duration-300"
                                >
                                    <FaFilter className="ml-2" />
                                    فلترة
                                </button>
                            </div>
                        </div>
                    </div>

                    {showFilters && (
                        <div className="mb-6 bg-white rounded-lg shadow p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">فلترة الطلاب</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">البحث</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            placeholder="اسم الطالب، البريد الإلكتروني..."
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                                        />
                                        <FaSearch className="absolute left-3 top-3 text-gray-400" />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">الحالة</label>
                                    <select
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                                    >
                                        <option value="all">جميع الحالات</option>
                                        <option value="active">نشط</option>
                                        <option value="inactive">غير نشط</option>
                                        <option value="suspended">معلق</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">من تاريخ</label>
                                    <input
                                        type="date"
                                        value={dateFrom}
                                        onChange={(e) => setDateFrom(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">إلى تاريخ</label>
                                    <input
                                        type="date"
                                        value={dateTo}
                                        onChange={(e) => setDateTo(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-end space-x-4 space-x-reverse mt-4">
                                <button
                                    onClick={() => {
                                        setSearchTerm('');
                                        setStatusFilter('all');
                                        setDateFrom('');
                                        setDateTo('');
                                    }}
                                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition duration-300"
                                >
                                    مسح الفلاتر
                                </button>
                                <button
                                    onClick={handleSearch}
                                    className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition duration-300"
                                >
                                    تطبيق الفلاتر
                                </button>
                            </div>
                        </div>
                    )}

                    {selectedStudents.length > 0 && (
                        <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-blue-800">
                                    تم اختيار {selectedStudents.length} طالب
                                </span>
                                <div className="flex items-center space-x-2 space-x-reverse">
                                    <button
                                        onClick={() => handleBulkAction('activate')}
                                        className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600 transition duration-300"
                                    >
                                        تفعيل
                                    </button>
                                    <button
                                        onClick={() => handleBulkAction('deactivate')}
                                        className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition duration-300"
                                    >
                                        إلغاء التفعيل
                                    </button>
                                    <button
                                        onClick={() => setSelectedStudents([])}
                                        className="px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600 transition duration-300"
                                    >
                                        إلغاء
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3  text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            <input
                                                type="checkbox"
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setSelectedStudents(filteredStudents.map(s => s.id));
                                                    } else {
                                                        setSelectedStudents([]);
                                                    }
                                                }}
                                                className="rounded border-gray-300 text-yellow-600 shadow-sm focus:border-yellow-300 focus:ring focus:ring-yellow-200 focus:ring-opacity-50"
                                            />
                                        </th>
                                        <th className="px-6 py-3  text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            الطالب
                                        </th>
                                        <th className="px-6 py-3  text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            البريد الإلكتروني
                                        </th>
                                        <th className="px-6 py-3  text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            رقم الجوال
                                        </th>
                                        <th className="px-6 py-3  text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            تاريخ التسجيل
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
                                    {filteredStudents.map((student) => (
                                        <tr key={student.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedStudents.includes(student.id)}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setSelectedStudents([...selectedStudents, student.id]);
                                                        } else {
                                                            setSelectedStudents(selectedStudents.filter(id => id !== student.id));
                                                        }
                                                    }}
                                                    className="rounded border-gray-300 text-yellow-600 shadow-sm focus:border-yellow-300 focus:ring focus:ring-yellow-200 focus:ring-opacity-50"
                                                />
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10">
                                                        <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                                            <FaUser className="h-5 w-5 text-gray-600" />
                                                        </div>
                                                    </div>
                                                    <div className="mr-4">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {student.name || 'غير محدد'}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            ID: #{student.id}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <FaEnvelope className="ml-2 text-gray-400" />
                                                    <span className="text-sm text-gray-900">{student.email || 'غير محدد'}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <FaPhone className="ml-2 text-gray-400" />
                                                    <span className="text-sm text-gray-900">{student.phone || 'غير محدد'}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                <div className="flex items-center">
                                                    <FaCalendar className="ml-2 text-gray-400" />
                                                    {student.created_at ? new Date(student.created_at).toLocaleDateString('en-US') : 'غير محدد'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(student.status)}`}>
                                                    {getStatusText(student.status)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex items-center space-x-2 space-x-reverse">
                                                    <button
                                                        onClick={() => router.get(`/admin/students/${student.id}`)}
                                                        className="text-blue-600 hover:text-blue-900"
                                                        title="عرض التفاصيل"
                                                    >
                                                        <FaEye />
                                                    </button>
                                                    <button
                                                        onClick={() => router.get(`/admin/students/${student.id}/edit`)}
                                                        className="text-yellow-600 hover:text-yellow-900"
                                                        title="تعديل"
                                                    >
                                                        <FaEdit />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(student)}
                                                        className="text-red-600 hover:text-red-900"
                                                        title="حذف"
                                                    >
                                                        <FaTrash />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {students.links && (
                            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                                <div className="flex-1 flex justify-between sm:hidden">
                                    {students.prev_page_url && (
                                        <button
                                            onClick={() => router.get(students.prev_page_url)}
                                            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                        >
                                            السابق
                                        </button>
                                    )}
                                    {students.next_page_url && (
                                        <button
                                            onClick={() => router.get(students.next_page_url)}
                                            className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                        >
                                            التالي
                                        </button>
                                    )}
                                </div>
                                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                    <div>
                                        <p className="text-sm text-gray-700">
                                            عرض <span className="font-medium">{students.from}</span> إلى <span className="font-medium">{students.to}</span> من <span className="font-medium">{students.total}</span> نتيجة
                                        </p>
                                    </div>
                                    <div>
                                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                                            {students.links.map((link, index) => (
                                                <button
                                                    key={index}
                                                    onClick={() => link.url && router.get(link.url)}
                                                    disabled={!link.url}
                                                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${link.active
                                                        ? 'z-10 bg-yellow-50 border-yellow-500 text-yellow-600'
                                                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                                        } ${!link.url ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                                />
                                            ))}
                                        </nav>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {showDeleteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">تأكيد الحذف</h3>
                        <p className="text-gray-600 mb-6">
                            هل أنت متأكد من حذف الطالب <strong>{studentToDelete?.name}</strong>؟
                            هذا الإجراء لا يمكن التراجع عنه.
                        </p>
                        <div className="flex items-center justify-end space-x-4 space-x-reverse">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition duration-300"
                            >
                                إلغاء
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-300"
                            >
                                حذف
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
