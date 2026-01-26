import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { FaSearch, FaFilter, FaEye, FaEdit, FaTrash, FaPlus, FaCertificate, FaDownload, FaToggleOn, FaToggleOff, FaUser } from 'react-icons/fa';
import { useConfirmDialog } from '@/Contexts/ConfirmContext';

export default function AdminCertificatesIndex({ certificates, stats, users, filters = {} }) {
    const { confirm } = useConfirmDialog();
    const [search, setSearch] = useState(filters?.search || '');
    const [type, setType] = useState(filters?.type || 'all');
    const [status, setStatus] = useState(filters?.status || 'all');
    const [userId, setUserId] = useState(filters?.user_id || '');

    const handleFilter = () => {
        router.get(route('admin.certificates.index'), {
            search: search || undefined,
            type: type !== 'all' ? type : undefined,
            status: status !== 'all' ? status : undefined,
            user_id: userId || undefined,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleDelete = async (certificateId, certificateNumber) => {
        const confirmed = await confirm({
            title: 'تأكيد الحذف',
            message: `هل أنت متأكد من حذف الشهادة "${certificateNumber}"؟ هذا الإجراء لا يمكن التراجع عنه.`,
            confirmText: 'حذف',
            cancelText: 'إلغاء',
            variant: 'danger',
        });

        if (confirmed) {
            router.delete(route('admin.certificates.destroy', certificateId), {
                preserveScroll: true,
            });
        }
    };

    const handleToggleStatus = (certificateId) => {
        router.post(route('admin.certificates.toggle-status', certificateId), {}, {
            preserveScroll: true,
        });
    };

    const getTypeLabel = (type) => {
        const typeMap = {
            'student': 'طالب',
            'teacher': 'معلم',
            'school': 'مدرسة',
            'achievement': 'إنجاز',
            'membership': 'عضوية',
        };
        return typeMap[type] || type;
    };

    const getStatusBadge = (isActive) => {
        if (isActive) {
            return (
                <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                    نشط
                </span>
            );
        }
        return (
            <span className="px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">
                غير نشط
            </span>
        );
    };

    return (
        <DashboardLayout header="إدارة الشهادات">
            <Head title="إدارة الشهادات" />

            <div className="space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm">إجمالي الشهادات</p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total || 0}</p>
                            </div>
                            <FaCertificate className="text-4xl text-blue-500" />
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm">الشهادات النشطة</p>
                                <p className="text-3xl font-bold text-green-600 mt-2">{stats.active || 0}</p>
                            </div>
                            <FaToggleOn className="text-4xl text-green-500" />
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm">الشهادات غير النشطة</p>
                                <p className="text-3xl font-bold text-gray-600 mt-2">{stats.inactive || 0}</p>
                            </div>
                            <FaToggleOff className="text-4xl text-gray-500" />
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm">أنواع الشهادات</p>
                                <p className="text-3xl font-bold text-purple-600 mt-2">{Object.keys(stats.by_type || {}).length}</p>
                            </div>
                            <FaCertificate className="text-4xl text-purple-500" />
                        </div>
                    </div>
                </div>

                {/* Filters and Actions */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex flex-col md:flex-row gap-4 mb-4">
                        <div className="flex-1">
                            <div className="relative">
                                <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="البحث برقم الشهادة، العنوان، أو اسم المستخدم..."
                                    className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                        <select
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="all">جميع الأنواع</option>
                            <option value="student">طالب</option>
                            <option value="teacher">معلم</option>
                            <option value="school">مدرسة</option>
                            <option value="achievement">إنجاز</option>
                            <option value="membership">عضوية</option>
                        </select>
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="all">جميع الحالات</option>
                            <option value="active">نشط</option>
                            <option value="inactive">غير نشط</option>
                        </select>
                        <select
                            value={userId}
                            onChange={(e) => setUserId(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="">جميع المستخدمين</option>
                            {users.map((user) => (
                                <option key={user.id} value={user.id}>
                                    {user.name} ({user.email})
                                </option>
                            ))}
                        </select>
                        <button
                            onClick={handleFilter}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                        >
                            <FaFilter />
                            تصفية
                        </button>
                    </div>
                    <div className="flex justify-between items-center">
                        <div className="text-sm text-gray-600">
                            عرض {certificates.from || 0} - {certificates.to || 0} من {certificates.total || 0} شهادة
                        </div>
                        <Link
                            href={route('admin.certificates.create')}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                        >
                            <FaPlus />
                            إضافة شهادة جديدة
                        </Link>
                    </div>
                </div>

                {/* Certificates Table */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        رقم الشهادة
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        المستخدم
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        العنوان
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        النوع
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        تاريخ الإصدار
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        الحالة
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        الإجراءات
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {certificates.data && certificates.data.length > 0 ? (
                                    certificates.data.map((certificate) => (
                                        <tr key={certificate.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {certificate.certificate_number}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <FaUser className="text-gray-400 mr-2" />
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {certificate.user?.name || 'غير معروف'}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {certificate.user?.email || ''}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-900">
                                                    {certificate.title_ar || certificate.title}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                                    {getTypeLabel(certificate.type)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(certificate.issue_date).toLocaleDateString('en-US')}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {getStatusBadge(certificate.is_active)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex items-center gap-2">
                                                    {certificate.file_path && (
                                                        <Link
                                                            href={route('admin.certificates.download', certificate.id)}
                                                            className="text-blue-600 hover:text-blue-900"
                                                            title="تحميل"
                                                        >
                                                            <FaDownload />
                                                        </Link>
                                                    )}
                                                    <Link
                                                        href={route('admin.certificates.edit', certificate.id)}
                                                        className="text-green-600 hover:text-green-900"
                                                        title="تعديل"
                                                    >
                                                        <FaEdit />
                                                    </Link>
                                                    <button
                                                        onClick={() => handleToggleStatus(certificate.id)}
                                                        className={`${certificate.is_active ? 'text-yellow-600 hover:text-yellow-900' : 'text-gray-600 hover:text-gray-900'}`}
                                                        title={certificate.is_active ? 'إلغاء التفعيل' : 'تفعيل'}
                                                    >
                                                        {certificate.is_active ? <FaToggleOn /> : <FaToggleOff />}
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(certificate.id, certificate.certificate_number)}
                                                        className="text-red-600 hover:text-red-900"
                                                        title="حذف"
                                                    >
                                                        <FaTrash />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                                            لا توجد شهادات
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {certificates.links && certificates.links.length > 3 && (
                        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                            <div className="text-sm text-gray-700">
                                عرض {certificates.from || 0} - {certificates.to || 0} من {certificates.total || 0} شهادة
                            </div>
                            <div className="flex gap-2">
                                {certificates.links.map((link, index) => (
                                    <Link
                                        key={index}
                                        href={link.url || '#'}
                                        className={`px-3 py-2 rounded-lg ${
                                            link.active
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        } ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
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

